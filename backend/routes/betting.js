'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { BETTING_CASHBACK_RATE } = require('../config/constants');
const {
  coolingOutflowLimit,
  deviceGuard,
  recordDailyOutflow,
} = require('../middleware/deviceGuard');
const { authenticateAccessToken } = require('../middleware/security.middleware');
const { requireTransactionPin } = require('../middleware/transactionPin');
const { BettingFunding, Transaction, User } = require('../models');
const { calculateServicePricing } = require('../services/promo.service');
const {
  fundBettingWallet,
  verifyBettingAccount,
} = require('../services/betting.service');

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

router.post('/verify-account', async (req, res, next) => {
  try {
    const bookmaker = String(req.body?.bookmaker || '').trim();
    const customerId = String(req.body?.customerId || '').trim();

    if (!bookmaker || !customerId) {
      throw httpError(400, 'bookmaker and customerId are required.');
    }

    const payload = await verifyBettingAccount(bookmaker, customerId);
    res.json({
      success: true,
      data: payload,
      message: 'Betting account verified successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/fund', deviceGuard, coolingOutflowLimit, requireTransactionPin, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const bookmaker = String(req.body?.bookmaker || '').trim();
    const customerId = String(req.body?.customerId || '').trim();
    const customerName = String(req.body?.customerName || '').trim();
    const phone = String(req.body?.phone || req.user.phoneNumber || '').trim();
    const amount = normaliseAmount(req.body?.amount);

    if (!bookmaker || !customerId || !Number.isFinite(amount) || amount <= 0) {
      throw httpError(400, 'bookmaker, customerId, and a positive amount are required.');
    }

    const pricing = await calculateServicePricing({
      serviceKey: 'betting',
      amount,
      userId: req.user._id,
    });
    await assertWalletCanCover(req.user._id, pricing.finalCharge);
    const vendorResult = await fundBettingWallet(bookmaker, customerId, amount, phone);
    let payload;

    await session.withTransaction(async () => {
      const goldAward = Math.floor(amount * BETTING_CASHBACK_RATE);
      const user = await User.findOneAndUpdate(
        { _id: req.user._id, balance: { $gte: pricing.finalCharge } },
        { $inc: { balance: -pricing.finalCharge, br9GoldPoints: goldAward } },
        { new: true, session }
      );

      if (!user) {
        throw httpError(422, 'Insufficient wallet balance.');
      }

      await recordDailyOutflow(user._id, pricing.finalCharge, session);

      const [funding] = await BettingFunding.create(
        [
          {
            userId: user._id,
            bookmaker,
            customerId,
            customerName,
            amount,
            status: 'success',
            providerReference: vendorResult.receiptNumber,
          },
        ],
        { session }
      );

      const [transaction] = await Transaction.create(
        [
          {
            senderId: user._id,
            userId: user._id,
            senderName: user.fullName,
            receiverName: bookmaker,
            amount: pricing.finalCharge,
            type: 'Betting',
            status: 'success',
            timestamp: new Date(),
            reference: reference('BET'),
            note: `${bookmaker} wallet funding`,
            balanceAfter: user.balance,
            currency: 'NGN',
            metadata: {
              bettingFundingId: funding._id.toString(),
              customerId,
              customerName,
              receiptNumber: vendorResult.receiptNumber,
              goldAward,
              serviceKey: 'betting',
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
        bookmaker,
        customerId,
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
      message: 'Betting wallet funded successfully.',
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

module.exports = router;
