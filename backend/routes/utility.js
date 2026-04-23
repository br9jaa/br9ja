'use strict';

const express = require('express');
const mongoose = require('mongoose');

const {
  TV_INTERNET_CASHBACK_RATE,
  UTILITY_CASHBACK_RATE,
} = require('../config/constants');
const {
  coolingOutflowLimit,
  deviceGuard,
  recordDailyOutflow,
} = require('../middleware/deviceGuard');
const { authenticateAccessToken } = require('../middleware/security.middleware');
const { requireTransactionPin } = require('../middleware/transactionPin');
const { Transaction, User, UtilityTransaction } = require('../models');
const { calculateServicePricing } = require('../services/promo.service');
const {
  purchaseElectricity,
  verifyMeter,
} = require('../services/utility_service');
const {
  renewSubscription,
  verifySmartCard,
} = require('../services/tv_internet_service');

const router = express.Router();

router.use(authenticateAccessToken);

function createReference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function normaliseAmount(value) {
  return typeof value === 'number'
    ? value
    : Number.parseFloat(String(value ?? 0));
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function applyUtilityLedger({
  userId,
  serviceKey,
  category,
  serviceID,
  billersCode,
  customerName = '',
  variationCode = '',
  meterType = '',
  amount,
  token = '',
  receiptNumber = '',
  nextRenewalDate = null,
  providerResponse = {},
  cashbackRate,
  pricing,
}) {
  const goldAward = Math.floor(amount * cashbackRate);
  const session = await mongoose.startSession();
  let payload;

  try {
    await session.withTransaction(async () => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, balance: { $gte: pricing.finalCharge } },
        {
          $inc: {
            balance: -pricing.finalCharge,
            br9GoldPoints: goldAward,
          },
        },
        { new: true, session }
      );

      if (!updatedUser) {
        throw httpError(422, 'Insufficient wallet balance.');
      }

      await recordDailyOutflow(userId, pricing.finalCharge, session);

      const [utilityTransaction] = await UtilityTransaction.create(
        [
          {
            userId,
            category,
            serviceID,
            billersCode,
            customerName,
            variationCode,
            meterType,
            amount,
            token,
            receiptNumber,
            nextRenewalDate,
            status: 'success',
            providerResponse,
          },
        ],
        { session }
      );

      await Transaction.create(
        [
          {
            senderId: userId,
            userId,
            senderName: updatedUser.fullName,
            receiverName: `${category} Vending`,
            amount: pricing.finalCharge,
            type: category === 'Electricity' ? 'Electricity' : category,
            status: 'success',
            timestamp: new Date(),
            reference: createReference(category === 'Electricity' ? 'ELEC' : 'SUB'),
            note: `${category} payment`,
            balanceAfter: updatedUser.balance,
            currency: 'NGN',
            metadata: {
              serviceID,
              billersCode,
              goldAward,
              utilityTransactionId: utilityTransaction._id.toString(),
              serviceKey,
              vendorAmount: amount,
              markupApplied: pricing.markup,
              promoDiscount: pricing.promoDiscount,
              realizedMargin: pricing.markup - pricing.promoDiscount,
              promoCampaignId: pricing.promoCampaignId,
            },
          },
        ],
        { session }
      );

      payload = {
        id: utilityTransaction._id.toString(),
        category,
        serviceID,
        billersCode,
        customerName,
        variationCode,
        meterType,
        amount,
        amountCharged: pricing.finalCharge,
        token,
        receiptNumber,
        nextRenewalDate,
        goldAward,
        walletBalance: updatedUser.balance,
        br9GoldPoints: updatedUser.br9GoldPoints,
        promoDiscount: pricing.promoDiscount,
        promoApplied: pricing.promoApplied,
        totalBeforeDiscount: pricing.totalBeforeDiscount,
        createdAt: utilityTransaction.createdAt,
      };
    });
  } finally {
    await session.endSession();
  }

  return payload;
}

async function assertWalletCanCover(userId, amount) {
  const wallet = await User.findById(userId).select('balance').lean();
  if (!wallet || wallet.balance < amount) {
    throw httpError(422, 'Insufficient wallet balance.');
  }
}

router.post('/verify-meter', async (req, res, next) => {
  try {
    const meterNumber = String(req.body?.meterNumber || '').trim();
    const serviceID = String(req.body?.serviceID || '').trim();
    const type = String(req.body?.type || 'prepaid').trim();

    if (!meterNumber || !serviceID) {
      throw httpError(400, 'meterNumber and serviceID are required.');
    }

    const data = await verifyMeter(meterNumber, serviceID, type);
    res.json({
      success: true,
      data,
      message: 'Meter verified successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/pay-electricity', deviceGuard, coolingOutflowLimit, requireTransactionPin, async (req, res, next) => {
  try {
    const meterNumber = String(req.body?.meterNumber || '').trim();
    const serviceID = String(req.body?.serviceID || '').trim();
    const type = String(req.body?.type || 'prepaid').trim();
    const amount = normaliseAmount(req.body?.amount);
    const phone = String(req.body?.phone || req.user.phoneNumber || '').trim();
    const customerName = String(req.body?.customerName || '').trim();

    if (!meterNumber || !serviceID || !Number.isFinite(amount) || amount <= 0) {
      throw httpError(
        400,
        'meterNumber, serviceID, and a positive amount are required.'
      );
    }

    const pricing = await calculateServicePricing({
      serviceKey: 'electricity',
      amount,
      userId: req.user._id,
    });
    await assertWalletCanCover(req.user._id, pricing.finalCharge);
    const vendorResult = await purchaseElectricity(
      meterNumber,
      serviceID,
      type,
      amount,
      phone
    );
    const payload = await applyUtilityLedger({
      userId: req.user._id,
      serviceKey: 'electricity',
      category: 'Electricity',
      serviceID,
      billersCode: meterNumber,
      customerName,
      meterType: type,
      amount,
      token: vendorResult.token,
      receiptNumber: vendorResult.receiptNumber,
      providerResponse: vendorResult.raw,
      cashbackRate: UTILITY_CASHBACK_RATE,
      pricing,
    });

    res.status(201).json({
      success: true,
      data: payload,
      message: 'Electricity purchase successful.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-smartcard', async (req, res, next) => {
  try {
    const billersCode = String(req.body?.billersCode || '').trim();
    const serviceID = String(req.body?.serviceID || '').trim();

    if (!billersCode || !serviceID) {
      throw httpError(400, 'billersCode and serviceID are required.');
    }

    const data = await verifySmartCard(billersCode, serviceID);
    res.json({
      success: true,
      data,
      message: 'Smart card verified successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/pay-tv-internet', deviceGuard, coolingOutflowLimit, requireTransactionPin, async (req, res, next) => {
  try {
    const category = String(req.body?.category || 'TV').trim() === 'Internet'
      ? 'Internet'
      : 'TV';
    const billersCode = String(req.body?.billersCode || '').trim();
    const serviceID = String(req.body?.serviceID || '').trim();
    const variationCode = String(req.body?.variationCode || '').trim();
    const phone = String(req.body?.phone || req.user.phoneNumber || '').trim();
    const amount = normaliseAmount(req.body?.amount);
    const customerName = String(req.body?.customerName || '').trim();

    if (
      !billersCode ||
      !serviceID ||
      !variationCode ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw httpError(
        400,
        'billersCode, serviceID, variationCode, and a positive amount are required.'
      );
    }

    const pricing = await calculateServicePricing({
      serviceKey: 'cableTv',
      amount,
      userId: req.user._id,
    });
    await assertWalletCanCover(req.user._id, pricing.finalCharge);
    const vendorResult = await renewSubscription(
      billersCode,
      serviceID,
      variationCode,
      phone,
      amount
    );
    const payload = await applyUtilityLedger({
      userId: req.user._id,
      serviceKey: 'cableTv',
      category,
      serviceID,
      billersCode,
      customerName,
      variationCode,
      amount,
      receiptNumber: vendorResult.receiptNumber,
      nextRenewalDate: vendorResult.nextRenewalDate,
      providerResponse: vendorResult.raw,
      cashbackRate: TV_INTERNET_CASHBACK_RATE,
      pricing,
    });

    res.status(201).json({
      success: true,
      data: payload,
      message: 'Subscription successful.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
