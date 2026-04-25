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
  resolveRoleAwareCatalogPrice,
  resolveServicePricingRecord,
} = require('../services/service_catalog.service');
const {
  fundBettingWallet,
  pollBettingFundingStatus,
  SUPPORTED_BOOKMAKERS,
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

function normaliseName(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function resolveBookmaker(value) {
  return (
    SUPPORTED_BOOKMAKERS.find(
      (item) => item.toLowerCase() === String(value || '').trim().toLowerCase()
    ) || ''
  );
}

function buildBettingPayload({
  transaction,
  pricing,
  user,
  funding,
  vendorResult,
  bookmaker,
  customerId,
  customerName,
  amount,
}) {
  return {
    reference: transaction.reference,
    bookmaker,
    customerId,
    customerName,
    amount,
    amountCharged: pricing.finalCharge,
    receiptNumber: vendorResult.receiptNumber,
    goldAward: transaction.metadata?.goldAward ?? 0,
    walletBalance: user.balance,
    br9GoldPoints: user.br9GoldPoints,
    promoDiscount: pricing.promoDiscount,
    promoApplied: pricing.promoApplied,
    status: funding.status,
    fundingId: funding._id.toString(),
  };
}

async function resolveBettingPricing({ bookmaker, amount, userId, user = null }) {
  const pricingRecord = await resolveServicePricingRecord({
    serviceKey: 'betting',
    provider: 'billpay',
    serviceId: bookmaker.toLowerCase(),
    variationCode: 'wallet',
    amount,
    fallbackCostPrice: amount,
    fallbackSellingPrice: amount + 100,
    label: `${bookmaker} Wallet Funding`,
    category: 'Betting',
    supportsDynamicAmount: true,
    metadata: {
      bookmaker,
      defaultAmount: amount,
    },
  });

  if (!pricingRecord.record.isActive) {
    throw httpError(423, 'This betting funding lane is currently paused in admin.');
  }

  if (pricingRecord.record.profitShieldBlocked) {
    throw httpError(
      423,
      'This betting funding lane is blocked by the profit shield. Update pricing in admin first.'
    );
  }

  const pricingSnapshot = resolveRoleAwareCatalogPrice({
    record: pricingRecord.record,
    user,
    amount,
  });
  const pricing = await calculateServicePricing({
    serviceKey: 'betting',
    amount: pricingSnapshot.costPrice,
    userId,
    markupOverride: Math.max(
      Number(pricingSnapshot.sellingPrice || 0) - Number(pricingSnapshot.costPrice || 0),
      0
    ),
  });

  return { pricing, pricingRecord, pricingSnapshot };
}

async function finalizeBettingFunding({
  session,
  userId,
  bookmaker,
  customerId,
  customerName,
  amount,
  pricing,
  pricingRecord,
  pricingSnapshot,
  vendorResult,
  fundingId = null,
}) {
  const goldAward = Math.floor(amount * BETTING_CASHBACK_RATE);
  const user = await User.findOneAndUpdate(
    { _id: userId, balance: { $gte: pricing.finalCharge } },
    { $inc: { balance: -pricing.finalCharge, br9GoldPoints: goldAward } },
    { new: true, session }
  );

  if (!user) {
    throw httpError(
      422,
      'Wallet balance no longer covers this betting funding. Please top up again before retrying.'
    );
  }

  await recordDailyOutflow(user._id, pricing.finalCharge, session);

  let funding = null;
  if (fundingId) {
    funding = await BettingFunding.findByIdAndUpdate(
      fundingId,
      {
        $set: {
          status: 'success',
          customerName,
          provider: vendorResult.provider || '',
          providerReference: vendorResult.receiptNumber,
          statusMessage: 'Funding completed successfully.',
          debitedAt: new Date(),
          resolvedAt: new Date(),
          metadata: {
            category: 'gaming',
            customerId,
            customerName,
            bookmaker,
            providerStatus: vendorResult.status || 'success',
            rawProviderResponse: vendorResult.raw || {},
          },
        },
      },
      { new: true, session }
    );
  } else {
    [funding] = await BettingFunding.create(
      [
        {
          userId: user._id,
          bookmaker,
          customerId,
          customerName,
          amount,
          status: 'success',
          provider: vendorResult.provider || '',
          providerReference: vendorResult.receiptNumber,
          statusMessage: 'Funding completed successfully.',
          debitedAt: new Date(),
          resolvedAt: new Date(),
          metadata: {
            category: 'gaming',
            customerId,
            customerName,
            bookmaker,
            providerStatus: vendorResult.status || 'success',
            rawProviderResponse: vendorResult.raw || {},
          },
        },
      ],
      { session }
    );
  }

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
          category: 'gaming',
          bettingFundingId: funding._id.toString(),
          customerId,
          customerName,
          receiptNumber: vendorResult.receiptNumber,
          goldAward,
            serviceKey: 'betting',
            vendorAmount: amount,
            costPrice: pricingRecord.costPrice,
            sellingPrice: pricingSnapshot.sellingPrice,
            profit: Math.max(pricing.finalCharge - pricingRecord.costPrice, 0),
            adminNetProfit: pricingSnapshot.adminNetProfit,
            markupApplied: pricing.markup,
            promoDiscount: pricing.promoDiscount,
            realizedMargin: Math.max(pricing.finalCharge - pricingRecord.costPrice, 0),
            role: pricingSnapshot.role,
            resellerTier: pricingSnapshot.resellerTier,
            standardRetailPrice: pricingSnapshot.standardRetailPrice,
            resellerSavings: pricingSnapshot.resellerSavings || 0,
            promoCampaignId: pricing.promoCampaignId,
            provider: vendorResult.provider || '',
            providerStatus: vendorResult.status || 'success',
        },
      },
    ],
    { session }
  );

  return {
    funding,
    transaction,
    user,
  };
}

async function assertWalletCanCover(userId, amount) {
  const wallet = await User.findById(userId).select('balance').lean();
  if (!wallet || wallet.balance < amount) {
    throw httpError(422, 'Insufficient wallet balance.');
  }
}

router.post('/verify-account', async (req, res, next) => {
  try {
    const bookmaker = resolveBookmaker(req.body?.bookmaker);
    const customerId = String(req.body?.customerId || '').trim();

    if (!bookmaker || !customerId) {
      throw httpError(400, 'bookmaker and customerId are required.');
    }

    if (!bookmaker) {
      throw httpError(400, 'Unsupported betting provider.');
    }

    const payload = await verifyBettingAccount(bookmaker, customerId);
    if (!payload.customerName) {
      throw httpError(
        502,
        'This betting provider did not return an account name. Payment stays blocked until the name is confirmed.'
      );
    }
    res.json({
      success: true,
      data: {
        ...payload,
        confirmationRequired: true,
      },
      message: 'Betting account verified successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/fund', deviceGuard, coolingOutflowLimit, requireTransactionPin, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const bookmaker = resolveBookmaker(req.body?.bookmaker);
    const customerId = String(req.body?.customerId || '').trim();
    const customerName = String(req.body?.customerName || '').trim();
    const phone = String(req.body?.phone || req.user.phoneNumber || '').trim();
    const amount = normaliseAmount(req.body?.amount);

    if (!bookmaker || !customerId || !Number.isFinite(amount) || amount <= 0) {
      throw httpError(400, 'bookmaker, customerId, and a positive amount are required.');
    }

    if (!bookmaker) {
      throw httpError(400, 'Unsupported betting provider.');
    }

    if (!customerName) {
      throw httpError(
        409,
        'Validate the betting account and confirm the returned account name before paying.'
      );
    }

    const verification = await verifyBettingAccount(bookmaker, customerId);
    if (!verification.customerName) {
      throw httpError(
        502,
        'This betting provider did not return an account name. Payment stays blocked until the name is confirmed.'
      );
    }

    if (normaliseName(verification.customerName) !== normaliseName(customerName)) {
      throw httpError(
        409,
        'The confirmed account name no longer matches the provider response. Validate the ID again before paying.'
      );
    }

    const { pricing, pricingRecord, pricingSnapshot } = await resolveBettingPricing({
      bookmaker,
      amount,
      userId: req.user._id,
      user: req.user,
    });
    await assertWalletCanCover(req.user._id, pricing.finalCharge);
    const vendorResult = await fundBettingWallet(bookmaker, customerId, amount, phone);
    let payload;

    if (vendorResult.status === 'pending') {
      const [funding] = await BettingFunding.create(
        [
          {
            userId: req.user._id,
            bookmaker,
            customerId,
            customerName,
            amount,
            status: 'pending',
            provider: vendorResult.provider || '',
            providerReference: vendorResult.receiptNumber,
            statusMessage:
              'Provider timeout. Funding is pending and wallet has not been debited.',
            metadata: {
              category: 'gaming',
              customerId,
              customerName,
              bookmaker,
              providerStatus: 'pending',
              rawProviderResponse: vendorResult.raw || {},
              pricing: {
                finalCharge: pricing.finalCharge,
                markup: pricing.markup,
                promoDiscount: pricing.promoDiscount,
                promoApplied: pricing.promoApplied,
                promoCampaignId: pricing.promoCampaignId,
                sellingPrice: pricingSnapshot.sellingPrice,
                adminNetProfit: pricingSnapshot.adminNetProfit,
                role: pricingSnapshot.role,
                resellerTier: pricingSnapshot.resellerTier,
                standardRetailPrice: pricingSnapshot.standardRetailPrice,
                resellerSavings: pricingSnapshot.resellerSavings || 0,
              },
            },
          },
        ],
      );

      return res.status(202).json({
        success: true,
        data: {
          status: 'pending',
          fundingId: funding._id.toString(),
          bookmaker,
          customerId,
          customerName,
          amount,
          amountCharged: pricing.finalCharge,
          receiptNumber: vendorResult.receiptNumber,
          walletBalance: req.user.balance,
          pollAfterSeconds: 20,
        },
        message:
          'Provider timed out. This funding is pending and your wallet has not been debited yet.',
      });
    }

    await session.withTransaction(async () => {
      const result = await finalizeBettingFunding({
        session,
        userId: req.user._id,
        bookmaker,
        customerId,
        customerName,
        amount,
        pricing,
        pricingRecord,
        pricingSnapshot,
        vendorResult,
      });

      payload = buildBettingPayload({
        transaction: result.transaction,
        pricing,
        user: result.user,
        funding: result.funding,
        vendorResult,
        bookmaker,
        customerId,
        customerName,
        amount,
      });
    });

    return res.status(201).json({
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

router.get('/fund/:fundingId/status', deviceGuard, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const funding = await BettingFunding.findOne({
      _id: req.params.fundingId,
      userId: req.user._id,
    }).lean();

    if (!funding) {
      throw httpError(404, 'Pending betting funding was not found.');
    }

    if (funding.status !== 'pending') {
      return res.json({
        success: true,
        data: funding,
        message: `Betting funding is already ${funding.status}.`,
      });
    }

    const pricing = funding.metadata?.pricing || {};
    const status = await pollBettingFundingStatus({
      provider: funding.provider,
      receiptNumber: funding.providerReference,
      bookmaker: funding.bookmaker,
      customerId: funding.customerId,
    });

    if (status.status === 'pending') {
      return res.status(202).json({
        success: true,
        data: {
          fundingId: funding._id.toString(),
          status: 'pending',
          receiptNumber: funding.providerReference,
          bookmaker: funding.bookmaker,
          customerId: funding.customerId,
        },
        message: 'Funding is still pending. Wallet remains untouched for now.',
      });
    }

    if (status.status === 'failed') {
      const failedFunding = await BettingFunding.findByIdAndUpdate(
        funding._id,
        {
          $set: {
            status: 'failed',
            resolvedAt: new Date(),
            statusMessage: 'Provider marked this betting funding as failed.',
            metadata: {
              ...(funding.metadata || {}),
              category: 'gaming',
              statusProviderResponse: status.raw || {},
            },
          },
        },
        { new: true }
      ).lean();

      return res.json({
        success: true,
        data: failedFunding,
        message: 'Funding failed with the provider. Wallet was not debited.',
      });
    }

    let payload;
    await session.withTransaction(async () => {
      const pricingSnapshot = {
        sellingPrice: Number(pricing.sellingPrice || pricing.finalCharge || funding.amount),
        adminNetProfit: Number(
          pricing.adminNetProfit ||
            Math.max(Number(pricing.finalCharge || funding.amount) - Number(funding.amount || 0), 0)
        ),
        role: String(pricing.role || 'user').trim().toLowerCase(),
        resellerTier: String(pricing.resellerTier || 'bronze').trim().toLowerCase(),
      };
      const result = await finalizeBettingFunding({
        session,
        userId: req.user._id,
        bookmaker: funding.bookmaker,
        customerId: funding.customerId,
        customerName: funding.customerName,
        amount: funding.amount,
        pricing: {
          finalCharge: Number(pricing.finalCharge || funding.amount),
          markup: Number(pricing.markup || 0),
          promoDiscount: Number(pricing.promoDiscount || 0),
          promoCampaignId: pricing.promoCampaignId || null,
          promoApplied: Boolean(pricing.promoApplied),
        },
        pricingRecord: {
          costPrice: Number(funding.amount || 0),
          sellingPrice: Number(pricing.finalCharge || funding.amount || 0),
        },
        pricingSnapshot,
        vendorResult: {
          ...status,
          receiptNumber: funding.providerReference,
        },
        fundingId: funding._id,
      });

      payload = buildBettingPayload({
        transaction: result.transaction,
        pricing: {
          finalCharge: Number(pricing.finalCharge || funding.amount),
          markup: Number(pricing.markup || 0),
          promoDiscount: Number(pricing.promoDiscount || 0),
          promoApplied: Boolean(pricing.promoApplied),
        },
        user: result.user,
        funding: result.funding,
        vendorResult: {
          ...status,
          receiptNumber: funding.providerReference,
        },
        bookmaker: funding.bookmaker,
        customerId: funding.customerId,
        customerName: funding.customerName,
        amount: funding.amount,
      });
    });

    return res.json({
      success: true,
      data: payload,
      message: 'Pending betting funding is now complete and debited successfully.',
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

module.exports = router;
