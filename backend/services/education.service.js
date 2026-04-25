'use strict';

const mongoose = require('mongoose');

const {
  EDUCATION_CASHBACK_RATE,
  EDUCATION_CONVENIENCE_FEE,
  EDUCATION_PRICES,
} = require('../config/constants');
const {
  EducationPin,
  EducationTransaction,
  Transaction,
  User,
} = require('../models');
const { recordDailyOutflow } = require('../middleware/deviceGuard');
const { calculateServicePricing } = require('./promo.service');
const {
  createPendingVerificationTransaction,
} = require('./transaction_integrity.service');
const { executeProtectedPurchase } = require('./purchase_wrapper.service');
const {
  resolveRoleAwareCatalogPrice,
  resolveServicePricingRecord,
} = require('./service_catalog.service');
const { fetchPinFromVendor } = require('./vending_service');

function createReference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function normaliseServiceType(type) {
  return String(type || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
}

function getEducationPrice(serviceType) {
  const requested = normaliseServiceType(serviceType);
  const normalised = requested === 'JAMB' ? 'JAMB_UTME' : requested;
  const amount = EDUCATION_PRICES[normalised];
  if (!amount) {
    const error = new Error('Unsupported education PIN service.');
    error.statusCode = 400;
    throw error;
  }
  return { serviceType: normalised, amount };
}

function mapEducationCatalogCodes(serviceType) {
  switch (normaliseServiceType(serviceType)) {
    case 'WAEC':
    case 'WAEC_RESULT':
      return { serviceId: 'waec', variationCode: 'waec' };
    case 'WAEC_GCE':
      return { serviceId: 'waec-gce', variationCode: 'waec-gce' };
    case 'JAMB':
    case 'JAMB_UTME':
      return { serviceId: 'jamb', variationCode: 'utme' };
    case 'JAMB_DIRECT_ENTRY':
      return { serviceId: 'jamb', variationCode: 'direct-entry' };
    case 'NECO':
      return { serviceId: 'neco', variationCode: 'neco' };
    case 'NABTEB':
      return { serviceId: 'nabteb', variationCode: 'nabteb' };
    default:
      return {
        serviceId: normaliseServiceType(serviceType).toLowerCase(),
        variationCode: normaliseServiceType(serviceType).toLowerCase(),
      };
  }
}

async function createPendingEducationPurchase({
  userId,
  user,
  serviceType,
  quantity,
  profileCode,
  providerName,
  providerReference,
  providerResponse,
  pricing,
  rolePricing,
  providerTotal,
}) {
  const transaction = await createPendingVerificationTransaction({
    userId,
    senderName: user?.fullName || '',
    receiverName: 'Education Vending',
    amount: Number(pricing.finalCharge || 0),
    type: 'Education',
    reference: createReference('EDU'),
    note: `${serviceType} PIN purchase`,
    metadata: {
      serviceType,
      quantity,
      profileCode,
      serviceKey: 'education',
      vendorAmount: providerTotal,
      costPrice: providerTotal,
      sellingPrice: Number(pricing.finalCharge || 0),
      profit: Math.max(Number(pricing.finalCharge || 0) - Number(providerTotal || 0), 0),
      adminNetProfit: Number(rolePricing.adminNetProfit || 0) * quantity,
      standardRetailPrice:
        Number(rolePricing.standardRetailPrice || 0) * quantity,
      resellerSavings: Number(rolePricing.resellerSavings || 0) * quantity,
      markupApplied: pricing.markup,
      promoDiscount: pricing.promoDiscount,
      realizedMargin: Math.max(Number(pricing.finalCharge || 0) - Number(providerTotal || 0), 0),
      role: rolePricing.role,
      resellerTier: rolePricing.resellerTier,
      promoCampaignId: pricing.promoCampaignId,
      provider: providerName,
      providerReference: providerReference || '',
      receiptNumber: providerReference || '',
      rawProviderResponse: providerResponse,
    },
  });

  return {
    serviceType,
    quantity,
    subtotal: Number(rolePricing.sellingPrice || 0) * quantity,
    convenienceFee: Math.max(Number(rolePricing.sellingPrice || 0) - Number(providerTotal / quantity || 0), 0) * quantity,
    total: Number(rolePricing.sellingPrice || 0) * quantity,
    amountCharged: Number(pricing.finalCharge || 0),
    walletBalance: Number(user?.balance || 0),
    br9GoldPoints: Number(user?.br9GoldPoints || 0),
    costPrice: providerTotal,
    sellingPrice: Number(pricing.finalCharge || 0),
    profit: Math.max(Number(pricing.finalCharge || 0) - Number(providerTotal || 0), 0),
    adminNetProfit: Number(rolePricing.adminNetProfit || 0) * quantity,
    promoDiscount: pricing.promoDiscount,
    promoApplied: pricing.promoApplied,
    reference: transaction.reference,
    status: 'pending_verification',
    statusMessage:
      'Network delay detected. ⏳ We are confirming your delivery with the provider. Please do not retry. Your balance is safe.',
  };
}

async function purchaseExamPin(type, userId, options = {}) {
  const { serviceType, amount } = getEducationPrice(type);
  const quantity = Math.max(Number(options.quantity || 1), 1);
  const profileCode = String(options.profileCode || '').trim();

  if (serviceType.startsWith('JAMB') && !profileCode) {
    const error = new Error('JAMB purchases require a profile code.');
    error.statusCode = 400;
    throw error;
  }

  const catalogCodes = mapEducationCatalogCodes(serviceType);
  const unitPricing = await resolveServicePricingRecord({
    serviceKey: 'education',
    provider: 'vtpass',
    serviceId: catalogCodes.serviceId,
    variationCode: catalogCodes.variationCode,
    fallbackCostPrice: amount,
    fallbackSellingPrice: amount + EDUCATION_CONVENIENCE_FEE,
    label: serviceType.replace(/_/g, ' '),
    category: 'Education',
    metadata: {
      profileCodeRequired: serviceType.startsWith('JAMB'),
    },
  });

  if (!unitPricing.record.isActive) {
    const error = new Error('This education product is currently paused in admin.');
    error.statusCode = 423;
    throw error;
  }

  if (unitPricing.record.profitShieldBlocked) {
    const error = new Error(
      'This education product is temporarily blocked by the profit shield.'
    );
    error.statusCode = 423;
    throw error;
  }

  const unitCost = Number(unitPricing.costPrice || amount);
  const rolePricing = resolveRoleAwareCatalogPrice({
    record: unitPricing.record,
    user: options.user || null,
    amount: unitCost,
  });
  const unitSelling = Number(
    rolePricing.sellingPrice ||
      unitPricing.sellingPrice ||
      amount + EDUCATION_CONVENIENCE_FEE
  );
  const providerTotal = unitCost * quantity;
  const subtotal = unitSelling * quantity;
  const total = subtotal;
  const goldAward = Math.floor(providerTotal * EDUCATION_CASHBACK_RATE);
  const pricing = await calculateServicePricing({
    serviceKey: 'education',
    amount: providerTotal,
    userId,
    markupOverride: Math.max(unitSelling - unitCost, 0) * quantity,
  });

  const wallet = await User.findById(userId).select('balance').lean();
  if (!wallet || wallet.balance < pricing.finalCharge) {
    const error = new Error('Insufficient wallet balance.');
    error.statusCode = 422;
    throw error;
  }

  const realizedProfit = Math.max(
    Number(pricing.finalCharge || 0) - providerTotal,
    0
  );

  const vendorPins = [];
  for (let index = 0; index < quantity; index += 1) {
    const purchaseAttempt = await executeProtectedPurchase({
      attempt: async () => fetchPinFromVendor(serviceType, profileCode),
      failedMessage:
        'Education provider rejected this request. Your wallet was not charged.',
      onPending: async ({ source, error, vendorResult }) => {
        const pendingUser =
          options.user ||
          (await User.findById(userId)
            .select('fullName balance br9GoldPoints')
            .lean());
        return createPendingEducationPurchase({
          userId,
          user: pendingUser,
          serviceType,
          quantity,
          profileCode,
          providerName: source === 'error' ? 'vtpass' : vendorResult?.provider || 'vtpass',
          providerReference:
            vendorResult?.vendorReference || createReference('EDUCHK'),
          providerResponse:
            source === 'error'
              ? {
                  error: error.message,
                  code: error.code || '',
                }
              : vendorResult,
          pricing,
          rolePricing,
          providerTotal,
        });
      },
    });

    if (purchaseAttempt.outcome === 'pending_verification') {
      return purchaseAttempt.payload;
    }

    vendorPins.push(purchaseAttempt.vendorResult);
  }

  const session = await mongoose.startSession();
  let responsePayload;

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
        const error = new Error('Insufficient wallet balance.');
        error.statusCode = 422;
        throw error;
      }

      await recordDailyOutflow(userId, pricing.finalCharge, session);

      const educationPins = await EducationPin.create(
        vendorPins.map((pin) => ({
          userId,
          service: serviceType,
          pin: pin.pin,
          serial: pin.serial,
          profileCode,
          amount: unitSelling,
          status: 'success',
          provider: pin.provider,
          vendorReference: pin.vendorReference,
        })),
        { session }
      );

      await EducationTransaction.create(
        vendorPins.map((pin) => ({
          userId,
          serviceType,
          pin: pin.pin,
          serialNumber: pin.serial,
          amount: unitSelling,
          costPrice: providerTotal,
          sellingPrice: Number(pricing.finalCharge || 0),
          profit: realizedProfit,
          metadata: {
            role: rolePricing.role,
            resellerTier: rolePricing.resellerTier,
            adminNetProfit: rolePricing.adminNetProfit * quantity,
          },
          status: 'success',
        })),
        { session }
      );

      await Transaction.create(
        [
          {
            senderId: userId,
            userId,
            senderName: updatedUser.fullName,
            receiverName: 'Education Vending',
            amount: pricing.finalCharge,
            type: 'Education',
            status: 'success',
            timestamp: new Date(),
            reference: createReference('EDU'),
            note: `${serviceType} PIN purchase`,
            balanceAfter: updatedUser.balance,
            currency: 'NGN',
            metadata: {
              serviceType,
              quantity,
              goldAward,
              convenienceFee: Math.max(unitSelling - unitCost, 0) * quantity,
              serviceKey: 'education',
              vendorAmount: providerTotal,
              costPrice: providerTotal,
              sellingPrice: Number(pricing.finalCharge || 0),
              profit: realizedProfit,
              adminNetProfit: rolePricing.adminNetProfit * quantity,
              standardRetailPrice:
                Number(rolePricing.standardRetailPrice || 0) * quantity,
              resellerSavings: Number(rolePricing.resellerSavings || 0) * quantity,
              markupApplied: pricing.markup,
              promoDiscount: pricing.promoDiscount,
              realizedMargin: realizedProfit,
              role: rolePricing.role,
              resellerTier: rolePricing.resellerTier,
              promoCampaignId: pricing.promoCampaignId,
            },
          },
        ],
        { session }
      );

      responsePayload = {
        serviceType,
        quantity,
        amount: unitSelling,
        subtotal,
        convenienceFee: Math.max(unitSelling - unitCost, 0) * quantity,
        total,
        amountCharged: pricing.finalCharge,
        goldAward,
        walletBalance: updatedUser.balance,
        br9GoldPoints: updatedUser.br9GoldPoints,
        costPrice: providerTotal,
        sellingPrice: Number(pricing.finalCharge || 0),
        profit: realizedProfit,
        adminNetProfit: rolePricing.adminNetProfit * quantity,
        promoDiscount: pricing.promoDiscount,
        promoApplied: pricing.promoApplied,
        pins: educationPins.map((pin) => ({
          id: pin._id.toString(),
          pin: pin.pin,
          serial: pin.serial,
          profileCode: pin.profileCode,
          amount: pin.amount,
          status: pin.status,
          createdAt: pin.createdAt,
        })),
      };
    });
  } finally {
    await session.endSession();
  }

  return responsePayload;
}

async function listEducationPins(userId, limit = 10) {
  return EducationPin.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

module.exports = {
  getEducationPrice,
  listEducationPins,
  purchaseExamPin,
};
