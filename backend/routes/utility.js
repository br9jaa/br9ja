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
const { applyGoldDiscount } = require('../services/br9_gold.service');
const {
  resolveRoleAwareCatalogPrice,
  resolveServicePricingRecord,
} = require('../services/service_catalog.service');
const {
  purchaseAirtimeWithClubkonnect,
  purchaseDataWithClubkonnect,
} = require('../services/clubkonnect.service');
const {
  purchaseElectricity,
  verifyMeter,
} = require('../services/utility_service');
const {
  createPendingVerificationTransaction,
} = require('../services/transaction_integrity.service');
const { executeProtectedPurchase } = require('../services/purchase_wrapper.service');
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
  providerName = '',
  cashbackRate,
  pricing,
  pricingSnapshot,
  goldRequest = 0,
}) {
  const goldAward = Math.floor(amount * cashbackRate);
  const normalizedProviderName =
    String(providerName || 'demo').replace(/-demo$/i, '').trim() || 'demo';
  const session = await mongoose.startSession();
  let payload;

  try {
    await session.withTransaction(async () => {
      const goldRedemption = await applyGoldDiscount({
        userId,
        serviceKey,
        amount,
        requestedGold: goldRequest,
        session,
      });
      const payableAmount = Math.max(
        Number(pricing.finalCharge || 0) - Number(goldRedemption.nairaDiscount || 0),
        0
      );
      const pricingRecord = pricingSnapshot || {
        costPrice: amount,
        sellingPrice: Number(pricing.finalCharge || 0),
        adminNetProfit: Math.max(Number(pricing.finalCharge || 0) - Number(amount || 0), 0),
        role: 'user',
        resellerTier: 'bronze',
      };
      const realizedProfit = Math.max(
        Number(payableAmount || 0) - Number(pricingRecord.costPrice || 0),
        0
      );
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, balance: { $gte: payableAmount } },
        {
          $inc: {
            balance: -payableAmount,
            br9GoldPoints: goldAward,
          },
        },
        { new: true, session }
      );

      if (!updatedUser) {
        throw httpError(422, 'Insufficient wallet balance.');
      }

      await recordDailyOutflow(userId, payableAmount, session);

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
            costPrice: pricingRecord.costPrice,
            sellingPrice: pricingRecord.sellingPrice,
            profit: realizedProfit,
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
            amount: payableAmount,
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
              costPrice: pricingRecord.costPrice,
              sellingPrice: pricingRecord.sellingPrice,
              profit: realizedProfit,
              provider: normalizedProviderName,
              role: pricingRecord.role || 'user',
              resellerTier: pricingRecord.resellerTier || '',
              standardRetailPrice: pricingRecord.standardRetailPrice,
              resellerSavings: pricingRecord.resellerSavings || 0,
              adminNetProfit:
                pricingRecord.adminNetProfit !== undefined
                  ? Number(pricingRecord.adminNetProfit || 0)
                  : realizedProfit,
              markupApplied: pricing.markup,
              promoDiscount: pricing.promoDiscount,
              realizedMargin: realizedProfit,
              promoCampaignId: pricing.promoCampaignId,
              goldUsed: goldRedemption.goldUsed,
              goldDiscountNaira: goldRedemption.nairaDiscount,
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
        amountCharged: payableAmount,
        token,
        receiptNumber,
        nextRenewalDate,
        goldAward,
        goldUsed: goldRedemption.goldUsed,
        goldDiscountNaira: goldRedemption.nairaDiscount,
        walletBalance: updatedUser.balance,
        br9GoldBalance: updatedUser.br9GoldBalance,
        br9GoldPoints: updatedUser.br9GoldPoints,
        costPrice: pricingRecord.costPrice,
        sellingPrice: pricingRecord.sellingPrice,
        profit: realizedProfit,
        adminNetProfit:
          pricingRecord.adminNetProfit !== undefined
            ? Number(pricingRecord.adminNetProfit || 0)
            : realizedProfit,
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

async function createPendingUtilityPurchase({
  user,
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
  providerName = '',
  pricing,
  pricingSnapshot,
  providerReference = '',
}) {
  const normalizedProviderName =
    String(providerName || 'demo').replace(/-demo$/i, '').trim() || 'demo';

  const utilityTransaction = await UtilityTransaction.create({
    userId: user._id,
    category,
    serviceID,
    billersCode,
    customerName,
    variationCode,
    meterType,
    amount,
    costPrice: Number(pricingSnapshot?.costPrice || amount || 0),
    sellingPrice: Number(pricingSnapshot?.sellingPrice || pricing.finalCharge || 0),
    profit: Math.max(
      Number(pricingSnapshot?.sellingPrice || pricing.finalCharge || 0) -
        Number(pricingSnapshot?.costPrice || amount || 0),
      0
    ),
    token,
    receiptNumber: receiptNumber || providerReference,
    nextRenewalDate,
    status: 'pending_verification',
    providerResponse,
  });

  const transactionType = category === 'Electricity' ? 'Electricity' : category;
  const transaction = await createPendingVerificationTransaction({
    userId: user._id,
    senderName: user.fullName,
    receiverName: `${category} Vending`,
    amount: Number(pricing.finalCharge || 0),
    type: transactionType,
    reference: createReference(category === 'Electricity' ? 'ELEC' : 'SUB'),
    note: `${category} payment`,
    metadata: {
      serviceID,
      billersCode,
      customerName,
      variationCode,
      meterType,
      utilityTransactionId: utilityTransaction._id.toString(),
      serviceRecordType: 'utility',
      serviceRecordId: utilityTransaction._id.toString(),
      serviceKey,
      vendorAmount: amount,
      costPrice: Number(pricingSnapshot?.costPrice || amount || 0),
      sellingPrice: Number(pricingSnapshot?.sellingPrice || pricing.finalCharge || 0),
      profit: Math.max(
        Number(pricingSnapshot?.sellingPrice || pricing.finalCharge || 0) -
          Number(pricingSnapshot?.costPrice || amount || 0),
        0
      ),
      provider: normalizedProviderName,
      providerReference: providerReference || receiptNumber || '',
      receiptNumber: receiptNumber || providerReference || '',
      role: pricingSnapshot?.role || 'user',
      resellerTier: pricingSnapshot?.resellerTier || '',
      standardRetailPrice: pricingSnapshot?.standardRetailPrice,
      resellerSavings: pricingSnapshot?.resellerSavings || 0,
      adminNetProfit:
        pricingSnapshot?.adminNetProfit !== undefined
          ? Number(pricingSnapshot.adminNetProfit || 0)
          : Math.max(Number(pricing.finalCharge || 0) - Number(amount || 0), 0),
      markupApplied: pricing.markup,
      promoDiscount: pricing.promoDiscount,
      promoCampaignId: pricing.promoCampaignId,
      token,
      nextRenewalDate,
      rawProviderResponse: providerResponse,
    },
  });

  return {
    id: utilityTransaction._id.toString(),
    transactionId: transaction._id.toString(),
    reference: transaction.reference,
    category,
    serviceID,
    billersCode,
    customerName,
    variationCode,
    meterType,
    amount,
    amountCharged: Number(pricing.finalCharge || 0),
    token,
    receiptNumber: receiptNumber || providerReference || '',
    nextRenewalDate,
    walletBalance: Number(user.balance || 0),
    br9GoldBalance: Number(user.br9GoldBalance || 0),
    br9GoldPoints: Number(user.br9GoldPoints || 0),
    costPrice: Number(pricingSnapshot?.costPrice || amount || 0),
    sellingPrice: Number(pricingSnapshot?.sellingPrice || pricing.finalCharge || 0),
    profit: Math.max(
      Number(pricingSnapshot?.sellingPrice || pricing.finalCharge || 0) -
        Number(pricingSnapshot?.costPrice || amount || 0),
      0
    ),
    adminNetProfit:
      pricingSnapshot?.adminNetProfit !== undefined
        ? Number(pricingSnapshot.adminNetProfit || 0)
        : Math.max(Number(pricing.finalCharge || 0) - Number(amount || 0), 0),
    promoDiscount: pricing.promoDiscount,
    promoApplied: pricing.promoApplied,
    totalBeforeDiscount: pricing.totalBeforeDiscount,
    status: 'pending_verification',
    statusMessage:
      'Network delay detected. ⏳ We are confirming your delivery with the provider. Please do not retry. Your balance is safe.',
  };
}

async function resolveCatalogCheckoutPricing({
  serviceKey,
  userId,
  amount,
  provider,
  serviceId,
  variationCode = '',
  fallbackCostPrice,
  fallbackSellingPrice,
  label,
  category,
  metadata = {},
  supportsDynamicAmount = false,
  user = null,
}) {
  const pricingRecord = await resolveServicePricingRecord({
    serviceKey,
    provider,
    serviceId,
    variationCode,
    amount,
    fallbackCostPrice,
    fallbackSellingPrice,
    label,
    category,
    metadata,
    supportsDynamicAmount,
  });

  if (!pricingRecord.record.isActive) {
    throw httpError(423, 'This service is currently paused in the BR9ja control center.');
  }

  if (pricingRecord.record.profitShieldBlocked) {
    throw httpError(
      423,
      'This service is temporarily blocked by the profit shield. Update pricing in admin before selling again.'
    );
  }

  const pricingSnapshot = resolveRoleAwareCatalogPrice({
    record: pricingRecord.record,
    user,
    amount,
  });
  const markupOverride = Math.max(
    Number(pricingSnapshot.sellingPrice || 0) - Number(pricingSnapshot.costPrice || 0),
    0
  );
  const pricing = await calculateServicePricing({
    serviceKey,
    amount: pricingSnapshot.costPrice,
    userId,
    markupOverride,
  });

  return { pricingRecord, pricing, pricingSnapshot };
}

router.post('/pay-airtime', deviceGuard, coolingOutflowLimit, requireTransactionPin, async (req, res, next) => {
  try {
    const network = String(req.body?.network || '').trim();
    const phoneNumber = String(
      req.body?.phoneNumber || req.body?.phone || req.user.phoneNumber || ''
    ).trim();
    const amount = normaliseAmount(req.body?.amount);
    const goldToRedeem = normaliseAmount(req.body?.goldToRedeem);

    if (!network || !phoneNumber || !Number.isFinite(amount) || amount <= 0) {
      throw httpError(
        400,
        'network, phoneNumber, and a positive amount are required.'
      );
    }

    const { pricing, pricingSnapshot } = await resolveCatalogCheckoutPricing({
      serviceKey: 'airtime',
      userId: req.user._id,
      user: req.user,
      amount,
      provider: 'clubkonnect',
      serviceId: network,
      variationCode: 'VTU',
      fallbackCostPrice: amount,
      fallbackSellingPrice: amount + 50,
      label: `${network} Airtime`,
      category: 'Airtime',
      supportsDynamicAmount: true,
      metadata: {
        network,
        defaultAmount: amount,
      },
    });
    if (!Number.isFinite(goldToRedeem) || goldToRedeem <= 0) {
      await assertWalletCanCover(req.user._id, pricing.finalCharge);
    }

    const purchaseAttempt = await executeProtectedPurchase({
      attempt: async () =>
        purchaseAirtimeWithClubkonnect({
          network,
          phoneNumber,
          amount,
        }),
      failedMessage: 'Airtime provider rejected this request. Your wallet was not charged.',
      onPending: async ({ source, error, vendorResult }) =>
        createPendingUtilityPurchase({
          user: req.user,
          serviceKey: 'airtime',
          category: 'Airtime',
          serviceID: network,
          billersCode: phoneNumber,
          customerName: phoneNumber,
          amount,
          receiptNumber: vendorResult?.receiptNumber,
          providerResponse:
            source === 'error'
              ? {
                  error: error.message,
                  code: error.code || '',
                }
              : vendorResult?.raw,
          providerName:
            source === 'error' ? 'clubkonnect' : vendorResult?.provider,
          pricing,
          pricingSnapshot,
          providerReference:
            vendorResult?.receiptNumber || createReference('AIR'),
        }),
    });

    if (purchaseAttempt.outcome === 'pending_verification') {
      const pendingPayload = purchaseAttempt.payload;
      return res.status(202).json({
        success: true,
        data: pendingPayload,
        message:
          'Network delay detected. We are verifying this airtime delivery before charging your wallet.',
      });
    }
    const vendorResult = purchaseAttempt.vendorResult;

    const payload = await applyUtilityLedger({
      userId: req.user._id,
      serviceKey: 'airtime',
      category: 'Airtime',
      serviceID: network,
      billersCode: phoneNumber,
      customerName: phoneNumber,
      amount,
      receiptNumber: vendorResult.receiptNumber,
      providerResponse: vendorResult.raw,
      cashbackRate: UTILITY_CASHBACK_RATE,
      pricing,
      pricingSnapshot,
      goldRequest: goldToRedeem,
      providerName: vendorResult.provider,
    });

    res.status(201).json({
      success: true,
      data: payload,
      message: 'Airtime purchase successful.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/pay-data', deviceGuard, coolingOutflowLimit, requireTransactionPin, async (req, res, next) => {
  try {
    const network = String(req.body?.network || '').trim();
    const planCode = String(req.body?.planCode || req.body?.variationCode || '').trim();
    const phoneNumber = String(
      req.body?.phoneNumber || req.body?.phone || req.user.phoneNumber || ''
    ).trim();
    const amount = normaliseAmount(req.body?.amount);
    const goldToRedeem = normaliseAmount(req.body?.goldToRedeem);

    if (!network || !planCode || !phoneNumber || !Number.isFinite(amount) || amount <= 0) {
      throw httpError(
        400,
        'network, planCode, phoneNumber, and a positive amount are required.'
      );
    }

    const { pricing, pricingSnapshot } = await resolveCatalogCheckoutPricing({
      serviceKey: 'data',
      userId: req.user._id,
      user: req.user,
      amount,
      provider: 'clubkonnect',
      serviceId: network,
      variationCode: planCode,
      fallbackCostPrice: amount,
      fallbackSellingPrice: amount + 50,
      label: `${network} ${planCode}`.trim(),
      category: 'Data',
      metadata: {
        network,
        planCode,
      },
    });
    if (!Number.isFinite(goldToRedeem) || goldToRedeem <= 0) {
      await assertWalletCanCover(req.user._id, pricing.finalCharge);
    }

    const purchaseAttempt = await executeProtectedPurchase({
      attempt: async () =>
        purchaseDataWithClubkonnect({
          network,
          phoneNumber,
          planCode,
          amount,
        }),
      failedMessage: 'Data provider rejected this request. Your wallet was not charged.',
      onPending: async ({ source, error, vendorResult }) =>
        createPendingUtilityPurchase({
          user: req.user,
          serviceKey: 'data',
          category: 'Data',
          serviceID: network,
          billersCode: phoneNumber,
          customerName: phoneNumber,
          variationCode: planCode,
          amount,
          receiptNumber: vendorResult?.receiptNumber,
          providerResponse:
            source === 'error'
              ? {
                  error: error.message,
                  code: error.code || '',
                }
              : vendorResult?.raw,
          providerName:
            source === 'error' ? 'clubkonnect' : vendorResult?.provider,
          pricing,
          pricingSnapshot,
          providerReference:
            vendorResult?.receiptNumber || createReference('DATA'),
        }),
    });

    if (purchaseAttempt.outcome === 'pending_verification') {
      const pendingPayload = purchaseAttempt.payload;
      return res.status(202).json({
        success: true,
        data: pendingPayload,
        message:
          'Network delay detected. We are verifying this data delivery before charging your wallet.',
      });
    }
    const vendorResult = purchaseAttempt.vendorResult;

    const payload = await applyUtilityLedger({
      userId: req.user._id,
      serviceKey: 'data',
      category: 'Data',
      serviceID: network,
      billersCode: phoneNumber,
      customerName: phoneNumber,
      variationCode: planCode,
      amount,
      receiptNumber: vendorResult.receiptNumber,
      providerResponse: vendorResult.raw,
      cashbackRate: UTILITY_CASHBACK_RATE,
      pricing,
      pricingSnapshot,
      goldRequest: goldToRedeem,
      providerName: vendorResult.provider,
    });

    res.status(201).json({
      success: true,
      data: payload,
      message: 'Data purchase successful.',
    });
  } catch (error) {
    next(error);
  }
});

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
    const goldToRedeem = normaliseAmount(req.body?.goldToRedeem);
    const phone = String(req.body?.phone || req.user.phoneNumber || '').trim();
    const customerName = String(req.body?.customerName || '').trim();

    if (!meterNumber || !serviceID || !Number.isFinite(amount) || amount <= 0) {
      throw httpError(
        400,
        'meterNumber, serviceID, and a positive amount are required.'
      );
    }

    const { pricing, pricingSnapshot } = await resolveCatalogCheckoutPricing({
      serviceKey: 'electricity',
      userId: req.user._id,
      user: req.user,
      amount,
      provider: 'vtpass',
      serviceId: serviceID,
      variationCode: type,
      fallbackCostPrice: amount,
      fallbackSellingPrice: amount + 100,
      label: `${serviceID} Electricity`,
      category: 'Electricity',
      supportsDynamicAmount: true,
      metadata: {
        defaultAmount: amount,
        meterType: type,
      },
    });
    if (!Number.isFinite(goldToRedeem) || goldToRedeem <= 0) {
      await assertWalletCanCover(req.user._id, pricing.finalCharge);
    }
    const purchaseAttempt = await executeProtectedPurchase({
      attempt: async () =>
        purchaseElectricity(meterNumber, serviceID, type, amount, phone),
      failedMessage:
        'Electricity provider rejected this request. Your wallet was not charged.',
      onPending: async ({ source, error, vendorResult }) =>
        createPendingUtilityPurchase({
          user: req.user,
          serviceKey: 'electricity',
          category: 'Electricity',
          serviceID,
          billersCode: meterNumber,
          customerName,
          meterType: type,
          amount,
          token: vendorResult?.token,
          receiptNumber: vendorResult?.receiptNumber,
          providerResponse:
            source === 'error'
              ? {
                  error: error.message,
                  code: error.code || '',
                }
              : vendorResult?.raw,
          providerName: source === 'error' ? 'vtpass' : vendorResult?.provider,
          pricing,
          pricingSnapshot,
          providerReference:
            vendorResult?.receiptNumber || createReference('ELEC'),
        }),
    });

    if (purchaseAttempt.outcome === 'pending_verification') {
      const pendingPayload = purchaseAttempt.payload;
      return res.status(202).json({
        success: true,
        data: pendingPayload,
        message:
          'Network delay detected. We are verifying this electricity delivery before charging your wallet.',
      });
    }
    const vendorResult = purchaseAttempt.vendorResult;

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
      pricingSnapshot,
      goldRequest: goldToRedeem,
      providerName: vendorResult.provider,
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

    const { pricing, pricingSnapshot } = await resolveCatalogCheckoutPricing({
      serviceKey: 'cableTv',
      userId: req.user._id,
      user: req.user,
      amount,
      provider: 'clubkonnect',
      serviceId: serviceID,
      variationCode,
      fallbackCostPrice: amount,
      fallbackSellingPrice: Math.max(amount + 200, Math.ceil(amount * 1.02)),
      label: `${serviceID} ${variationCode}`.trim(),
      category,
      supportsDynamicAmount: true,
      metadata: {
        defaultAmount: amount,
        category,
      },
    });
    await assertWalletCanCover(req.user._id, pricing.finalCharge);
    const purchaseAttempt = await executeProtectedPurchase({
      attempt: async () =>
        renewSubscription(billersCode, serviceID, variationCode, phone, amount),
      failedMessage:
        'Subscription provider rejected this request. Your wallet was not charged.',
      onPending: async ({ source, error, vendorResult }) =>
        createPendingUtilityPurchase({
          user: req.user,
          serviceKey: 'cableTv',
          category,
          serviceID,
          billersCode,
          customerName,
          variationCode,
          amount,
          receiptNumber: vendorResult?.receiptNumber,
          nextRenewalDate: vendorResult?.nextRenewalDate,
          providerResponse:
            source === 'error'
              ? {
                  error: error.message,
                  code: error.code || '',
                }
              : vendorResult?.raw,
          providerName:
            source === 'error' ? 'clubkonnect' : vendorResult?.provider,
          pricing,
          pricingSnapshot,
          providerReference:
            vendorResult?.receiptNumber ||
            createReference(category === 'Internet' ? 'NET' : 'TV'),
        }),
    });

    if (purchaseAttempt.outcome === 'pending_verification') {
      const pendingPayload = purchaseAttempt.payload;
      return res.status(202).json({
        success: true,
        data: pendingPayload,
        message:
          'Network delay detected. We are verifying this subscription delivery before charging your wallet.',
      });
    }
    const vendorResult = purchaseAttempt.vendorResult;

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
      pricingSnapshot,
      providerName: vendorResult.provider,
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
