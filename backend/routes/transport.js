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
  createPendingVerificationTransaction,
} = require('../services/transaction_integrity.service');
const { executeProtectedPurchase } = require('../services/purchase_wrapper.service');
const {
  resolveRoleAwareCatalogPrice,
  resolveServicePricingRecord,
} = require('../services/service_catalog.service');
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

async function createPendingTransportPayment({
  user,
  accountID,
  amount,
  customerName = '',
  pricing,
  pricingRecord,
  pricingSnapshot,
  providerName = 'vtpass',
  providerResponse = {},
  providerReference = '',
}) {
  const transaction = await createPendingVerificationTransaction({
    userId: user._id,
    senderName: user.fullName,
    receiverName: 'LCC Toll Wallet',
    amount: Number(pricing.finalCharge || 0),
    type: 'Transport',
    reference: reference('LCC'),
    note: 'LCC eTag top-up',
    metadata: {
      accountID,
      customerName,
      serviceKey: 'transport',
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
      provider: providerName,
      providerReference: providerReference || '',
      receiptNumber: providerReference || '',
      rawProviderResponse: providerResponse,
    },
  });

  return {
    reference: transaction.reference,
    accountID,
    customerName,
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

async function resolveTransportPricing({ amount, userId, user = null }) {
  const pricingRecord = await resolveServicePricingRecord({
    serviceKey: 'transport',
    provider: 'vtpass',
    serviceId: 'lcc',
    variationCode: 'etag',
    amount,
    fallbackCostPrice: amount,
    fallbackSellingPrice: amount + 100,
    label: 'LCC Toll Top-up',
    category: 'Transport',
    supportsDynamicAmount: true,
    metadata: {
      defaultAmount: amount,
    },
  });

  if (!pricingRecord.record.isActive) {
    throw httpError(423, 'Transport top-up is currently paused in admin.');
  }

  if (pricingRecord.record.profitShieldBlocked) {
    throw httpError(
      423,
      'Transport top-up is blocked by the profit shield. Update pricing in admin first.'
    );
  }

  const pricingSnapshot = resolveRoleAwareCatalogPrice({
    record: pricingRecord.record,
    user,
    amount,
  });
  const pricing = await calculateServicePricing({
    serviceKey: 'transport',
    amount: pricingSnapshot.costPrice,
    userId,
    markupOverride: Math.max(
      Number(pricingSnapshot.sellingPrice || 0) - Number(pricingSnapshot.costPrice || 0),
      0
    ),
  });

  return { pricing, pricingRecord, pricingSnapshot };
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

    const { pricing, pricingRecord, pricingSnapshot } = await resolveTransportPricing({
      amount,
      userId: req.user._id,
      user: req.user,
    });
    await assertWalletCanCover(req.user._id, pricing.finalCharge);
    const purchaseAttempt = await executeProtectedPurchase({
      attempt: async () => topupLcc(accountID, amount, phone),
      failedMessage:
        'Transport provider rejected this request. Your wallet was not charged.',
      onPending: async ({ source, error, vendorResult }) =>
        createPendingTransportPayment({
          user: req.user,
          accountID,
          amount,
          customerName,
          pricing,
          pricingRecord,
          pricingSnapshot,
          providerName: source === 'error' ? 'vtpass' : vendorResult?.provider,
          providerResponse:
            source === 'error'
              ? {
                  error: error.message,
                  code: error.code || '',
                }
              : vendorResult?.raw,
          providerReference:
            vendorResult?.receiptNumber || reference('LCCCHK'),
        }),
    });

    if (purchaseAttempt.outcome === 'pending_verification') {
      const pendingPayload = purchaseAttempt.payload;
      return res.status(202).json({
        success: true,
        data: pendingPayload,
        message:
          'Network delay detected. We are verifying this LCC top-up before charging your wallet.',
      });
    }
    const vendorResult = purchaseAttempt.vendorResult;

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
        accountID,
        customerName,
        amount,
        amountCharged: pricing.finalCharge,
        receiptNumber: vendorResult.receiptNumber,
        goldAward,
        walletBalance: user.balance,
        br9GoldPoints: user.br9GoldPoints,
        sellingPrice: pricingSnapshot.sellingPrice,
        adminNetProfit: pricingSnapshot.adminNetProfit,
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
