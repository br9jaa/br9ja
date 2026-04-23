'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { GOVERNMENT_CASHBACK_RATE } = require('../config/constants');
const {
  coolingOutflowLimit,
  deviceGuard,
  recordDailyOutflow,
} = require('../middleware/deviceGuard');
const { authenticateAccessToken } = require('../middleware/security.middleware');
const { requireTransactionPin } = require('../middleware/transactionPin');
const { GovernmentPayment, Transaction, User } = require('../models');
const { calculateServicePricing } = require('../services/promo.service');
const {
  generateRRR,
  payRRR,
  verifyTrafficFine,
} = require('../services/government.service');

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

router.post('/generate-rrr', async (req, res, next) => {
  try {
    const serviceType = String(req.body?.serviceType || '').trim();
    if (!serviceType) {
      throw httpError(400, 'serviceType is required.');
    }

    const providerPayload = await generateRRR(serviceType, req.body?.details || req.body);
    const payment = await GovernmentPayment.create({
      userId: req.user._id,
      serviceType,
      rrr: providerPayload.rrr,
      amount: providerPayload.amount,
      payerName: providerPayload.payerName,
      providerReference: providerPayload.providerReference,
      status: 'generated',
    });

    res.status(201).json({
      success: true,
      data: {
        id: payment._id.toString(),
        ...providerPayload,
        status: payment.status,
      },
      message: 'RRR generated successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/pay-rrr', deviceGuard, coolingOutflowLimit, requireTransactionPin, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const rrr = String(req.body?.rrr || '').trim();
    const amount = normaliseAmount(req.body?.amount);

    if (!rrr || !Number.isFinite(amount) || amount <= 0) {
      throw httpError(400, 'rrr and a positive amount are required.');
    }

    const pricing = await calculateServicePricing({
      serviceKey: 'government',
      amount,
      userId: req.user._id,
    });
    await assertWalletCanCover(req.user._id, pricing.finalCharge);
    const vendorResult = await payRRR(rrr, amount);
    let payload;

    await session.withTransaction(async () => {
      const goldAward = Math.floor(amount * GOVERNMENT_CASHBACK_RATE);
      const user = await User.findOneAndUpdate(
        { _id: req.user._id, balance: { $gte: pricing.finalCharge } },
        { $inc: { balance: -pricing.finalCharge, br9GoldPoints: goldAward } },
        { new: true, session }
      );

      if (!user) {
        throw httpError(422, 'Insufficient wallet balance.');
      }

      await recordDailyOutflow(user._id, pricing.finalCharge, session);

      const payment = await GovernmentPayment.findOneAndUpdate(
        { userId: user._id, rrr },
        {
          $set: {
            amount,
            status: 'paid',
            paidAt: new Date(),
            providerReference: vendorResult.receiptNumber,
          },
          $setOnInsert: {
            serviceType: String(req.body?.serviceType || 'Existing RRR').trim(),
            payerName: user.fullName,
          },
        },
        { new: true, upsert: true, session }
      );

      const [transaction] = await Transaction.create(
        [
          {
            senderId: user._id,
            userId: user._id,
            senderName: user.fullName,
            receiverName: 'Government Payment',
            amount: pricing.finalCharge,
            type: 'Government',
            status: 'success',
            timestamp: new Date(),
            reference: reference('GOV'),
            note: `RRR ${rrr} payment`,
            balanceAfter: user.balance,
            currency: 'NGN',
            metadata: {
              rrr,
              governmentPaymentId: payment._id.toString(),
              receiptNumber: vendorResult.receiptNumber,
              goldAward,
              serviceKey: 'government',
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
        rrr,
        amount,
        amountCharged: pricing.finalCharge,
        receiptNumber: vendorResult.receiptNumber,
        goldAward,
        walletBalance: user.balance,
        br9GoldPoints: user.br9GoldPoints,
        paidAt: payment.paidAt,
        promoDiscount: pricing.promoDiscount,
        promoApplied: pricing.promoApplied,
      };
    });

    res.status(201).json({
      success: true,
      data: payload,
      message: 'RRR paid successfully.',
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

router.post('/verify-traffic-fine', async (req, res, next) => {
  try {
    const billersCode = String(req.body?.billersCode || '').trim();
    if (!billersCode) {
      throw httpError(400, 'billersCode is required.');
    }

    const payload = await verifyTrafficFine(billersCode);
    res.json({
      success: true,
      data: payload,
      message: 'Traffic fine verified successfully.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
