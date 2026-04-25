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
  createPendingVerificationTransaction,
} = require('../services/transaction_integrity.service');
const { executeProtectedPurchase } = require('../services/purchase_wrapper.service');
const {
  resolveRoleAwareCatalogPrice,
  resolveServicePricingRecord,
} = require('../services/service_catalog.service');
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

async function createPendingGovernmentPayment({
  user,
  serviceType,
  rrr,
  amount,
  pricing,
  pricingRecord,
  pricingSnapshot,
  providerName = 'remita',
  providerResponse = {},
  providerReference = '',
}) {
  const payment = await GovernmentPayment.findOneAndUpdate(
    { userId: user._id, rrr },
    {
      $set: {
        amount,
        status: 'pending_verification',
        providerReference: providerReference || '',
      },
      $setOnInsert: {
        serviceType,
        payerName: user.fullName,
      },
    },
    { new: true, upsert: true }
  );

  const transaction = await createPendingVerificationTransaction({
    userId: user._id,
    senderName: user.fullName,
    receiverName: 'Government Payment',
    amount: Number(pricing.finalCharge || 0),
    type: 'Government',
    reference: reference('GOV'),
    note: `RRR ${rrr} payment`,
    metadata: {
      rrr,
      governmentPaymentId: payment._id.toString(),
      serviceRecordType: 'government',
      serviceRecordId: payment._id.toString(),
      provider: providerName,
      providerReference: providerReference || '',
      receiptNumber: providerReference || '',
      serviceKey: 'government',
      vendorAmount: amount,
      costPrice: pricingRecord.costPrice,
      sellingPrice: pricingSnapshot.sellingPrice,
      profit: Math.max(Number(pricing.finalCharge || 0) - Number(pricingRecord.costPrice || 0), 0),
      adminNetProfit: pricingSnapshot.adminNetProfit,
      standardRetailPrice: pricingSnapshot.standardRetailPrice,
      resellerSavings: pricingSnapshot.resellerSavings || 0,
      markupApplied: pricing.markup,
      promoDiscount: pricing.promoDiscount,
      realizedMargin: Math.max(Number(pricing.finalCharge || 0) - Number(pricingRecord.costPrice || 0), 0),
      role: pricingSnapshot.role,
      resellerTier: pricingSnapshot.resellerTier,
      promoCampaignId: pricing.promoCampaignId,
      rawProviderResponse: providerResponse,
    },
  });

  return {
    reference: transaction.reference,
    rrr,
    amount,
    amountCharged: Number(pricing.finalCharge || 0),
    receiptNumber: providerReference || '',
    walletBalance: Number(user.balance || 0),
    br9GoldPoints: Number(user.br9GoldPoints || 0),
    sellingPrice: pricingSnapshot.sellingPrice,
    adminNetProfit: pricingSnapshot.adminNetProfit,
    promoDiscount: pricing.promoDiscount,
    promoApplied: pricing.promoApplied,
    status: 'pending_verification',
    statusMessage:
      'Network delay detected. ⏳ We are confirming your delivery with the provider. Please do not retry. Your balance is safe.',
  };
}

async function resolveGovernmentPricing({ amount, userId, user = null }) {
  const pricingRecord = await resolveServicePricingRecord({
    serviceKey: 'government',
    provider: 'remita',
    serviceId: 'rrr',
    variationCode: 'general',
    amount,
    fallbackCostPrice: amount,
    fallbackSellingPrice: amount + 150,
    label: 'General RRR Payment',
    category: 'Government',
    supportsDynamicAmount: true,
    metadata: {
      defaultAmount: amount,
    },
  });

  if (!pricingRecord.record.isActive) {
    throw httpError(423, 'Government billing is currently paused in admin.');
  }

  if (pricingRecord.record.profitShieldBlocked) {
    throw httpError(
      423,
      'Government billing is blocked by the profit shield. Update pricing in admin first.'
    );
  }

  const pricingSnapshot = resolveRoleAwareCatalogPrice({
    record: pricingRecord.record,
    user,
    amount,
  });
  const pricing = await calculateServicePricing({
    serviceKey: 'government',
    amount: pricingSnapshot.costPrice,
    userId,
    markupOverride: Math.max(
      Number(pricingSnapshot.sellingPrice || 0) - Number(pricingSnapshot.costPrice || 0),
      0
    ),
  });

  return { pricing, pricingRecord, pricingSnapshot };
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

    const { pricing, pricingRecord, pricingSnapshot } = await resolveGovernmentPricing({
      amount,
      userId: req.user._id,
      user: req.user,
    });
    await assertWalletCanCover(req.user._id, pricing.finalCharge);
    const purchaseAttempt = await executeProtectedPurchase({
      attempt: async () => payRRR(rrr, amount),
      failedMessage:
        'Government provider rejected this request. Your wallet was not charged.',
      onPending: async ({ source, error, vendorResult }) =>
        createPendingGovernmentPayment({
          user: req.user,
          serviceType: String(req.body?.serviceType || 'Existing RRR').trim(),
          rrr,
          amount,
          pricing,
          pricingRecord,
          pricingSnapshot,
          providerName: source === 'error' ? 'remita' : vendorResult?.provider,
          providerResponse:
            source === 'error'
              ? {
                  error: error.message,
                  code: error.code || '',
                }
              : vendorResult?.raw,
          providerReference:
            vendorResult?.receiptNumber || reference('GOVCHK'),
        }),
    });

    if (purchaseAttempt.outcome === 'pending_verification') {
      const pendingPayload = purchaseAttempt.payload;
      return res.status(202).json({
        success: true,
        data: pendingPayload,
        message:
          'Network delay detected. We are verifying this government payment before charging your wallet.',
      });
    }
    const vendorResult = purchaseAttempt.vendorResult;

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
              costPrice: pricingRecord.costPrice,
              sellingPrice: pricingSnapshot.sellingPrice,
              profit: Math.max(pricing.finalCharge - pricingRecord.costPrice, 0),
              adminNetProfit: pricingSnapshot.adminNetProfit,
              standardRetailPrice: pricingSnapshot.standardRetailPrice,
              resellerSavings: pricingSnapshot.resellerSavings || 0,
              markupApplied: pricing.markup,
              promoDiscount: pricing.promoDiscount,
              realizedMargin: Math.max(pricing.finalCharge - pricingRecord.costPrice, 0),
              role: pricingSnapshot.role,
              resellerTier: pricingSnapshot.resellerTier,
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
        sellingPrice: pricingSnapshot.sellingPrice,
        adminNetProfit: pricingSnapshot.adminNetProfit,
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
