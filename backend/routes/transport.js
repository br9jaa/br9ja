'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { TRANSPORT_CASHBACK_RATE } = require('../config/constants');
const {
  coolingOutflowLimit,
  deviceGuard,
  recordDailyOutflow,
} = require('../middleware/deviceGuard');
const { authenticateAccessToken } = require('../middleware/security.middleware');
const { requireTransactionPin } = require('../middleware/transactionPin');
const { Transaction, User } = require('../models');
const { calculateServicePricing } = require('../services/promo.service');
const {
  requestBusTicket,
  topupLcc,
  verifyLccAccount,
} = require('../services/transport.service');

const router = express.Router();

router.use(authenticateAccessToken);

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normaliseAmount(value) {
  return typeof value === 'number'
    ? value
    : Number.parseFloat(String(value ?? 0));
}

function reference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

async function assertWalletCanCover(userId, amount) {
  const wallet = await User.findById(userId).select('balance').lean();
  if (!wallet || wallet.balance < amount) {
    throw httpError(422, 'Insufficient wallet balance.');
  }
}

router.post('/verify-lcc', async (req, res, next) => {
  try {
    const accountID = String(req.body?.accountID || '').trim();
    if (!accountID) {
      throw httpError(400, 'accountID is required.');
    }

    const payload = await verifyLccAccount(accountID);
    res.json({
      success: true,
      data: payload,
      message: 'LCC account verified successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/pay-lcc', deviceGuard, coolingOutflowLimit, requireTransactionPin, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const accountID = String(req.body?.accountID || '').trim();
    const amount = normaliseAmount(req.body?.amount);
    const phone = String(req.body?.phone || req.user.phoneNumber || '').trim();
    const customerName = String(req.body?.customerName || '').trim();

    if (!accountID || !Number.isFinite(amount) || amount <= 0) {
      throw httpError(400, 'accountID and a positive amount are required.');
    }

    const pricing = await calculateServicePricing({
      serviceKey: 'transport',
      amount,
      userId: req.user._id,
    });
    await assertWalletCanCover(req.user._id, pricing.finalCharge);
    const vendorResult = await topupLcc(accountID, amount, phone);
    let payload;

    await session.withTransaction(async () => {
      const goldAward = Math.floor(amount * TRANSPORT_CASHBACK_RATE);
      const user = await User.findOneAndUpdate(
        { _id: req.user._id, balance: { $gte: pricing.finalCharge } },
        { $inc: { balance: -pricing.finalCharge, br9GoldPoints: goldAward } },
        { new: true, session }
      );

      if (!user) {
        throw httpError(422, 'Insufficient wallet balance.');
      }

      await recordDailyOutflow(user._id, pricing.finalCharge, session);

      const [transaction] = await Transaction.create(
        [
          {
            senderId: user._id,
            userId: user._id,
            senderName: user.fullName,
            receiverName: 'LCC Toll Wallet',
            amount: pricing.finalCharge,
            type: 'Transport',
            status: 'success',
            timestamp: new Date(),
            reference: reference('LCC'),
            note: 'LCC eTag top-up',
            balanceAfter: user.balance,
            currency: 'NGN',
            metadata: {
              accountID,
              customerName,
              goldAward,
              receiptNumber: vendorResult.receiptNumber,
              serviceKey: 'transport',
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
        reference: transaction.reference,
        accountID,
        customerName,
        amount,
        amountCharged: pricing.finalCharge,
        receiptNumber: vendorResult.receiptNumber,
        goldAward,
        walletBalance: user.balance,
        br9GoldPoints: user.br9GoldPoints,
        promoDiscount: pricing.promoDiscount,
        promoApplied: pricing.promoApplied,
      };
    });

    res.status(201).json({
      success: true,
      data: payload,
      message: 'LCC top-up successful.',
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

router.post('/bus-ticket', async (req, res, next) => {
  try {
    const details = {
      departure: String(req.body?.departure || '').trim(),
      destination: String(req.body?.destination || '').trim(),
      travelDate: new Date(req.body?.travelDate || Date.now()),
      operator: String(req.body?.operator || '').trim(),
      passengerName: String(req.body?.passengerName || req.user.fullName || '').trim(),
      phone: String(req.body?.phone || req.user.phoneNumber || '').trim(),
    };

    if (!details.departure || !details.destination || !details.operator) {
      throw httpError(400, 'departure, destination, and operator are required.');
    }

    const payload = await requestBusTicket(req.user._id, details);
    res.status(202).json({
      success: true,
      data: payload,
      message: 'Bus booking request received for manual fulfillment.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
