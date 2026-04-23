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
const { fetchPinFromVendor } = require('./vending_service');

function createReference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function normaliseServiceType(type) {
  return String(type || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
}

function getEducationPrice(serviceType) {
  const normalised = normaliseServiceType(serviceType);
  const amount = EDUCATION_PRICES[normalised];
  if (!amount) {
    const error = new Error('Unsupported education PIN service.');
    error.statusCode = 400;
    throw error;
  }
  return { serviceType: normalised, amount };
}

async function purchaseExamPin(type, userId, options = {}) {
  const { serviceType, amount } = getEducationPrice(type);
  const quantity = Math.max(Number(options.quantity || 1), 1);
  const profileCode = String(options.profileCode || '').trim();

  if (serviceType === 'JAMB' && !profileCode) {
    const error = new Error('JAMB purchases require a profile code.');
    error.statusCode = 400;
    throw error;
  }

  const subtotal = amount * quantity;
  const total = subtotal + EDUCATION_CONVENIENCE_FEE;
  const goldAward = Math.floor(subtotal * EDUCATION_CASHBACK_RATE);
  const pricing = await calculateServicePricing({
    serviceKey: 'education',
    amount: total,
    userId,
  });

  const wallet = await User.findById(userId).select('balance').lean();
  if (!wallet || wallet.balance < pricing.finalCharge) {
    const error = new Error('Insufficient wallet balance.');
    error.statusCode = 422;
    throw error;
  }

  const vendorPins = [];
  for (let index = 0; index < quantity; index += 1) {
    vendorPins.push(await fetchPinFromVendor(serviceType, profileCode));
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
          amount,
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
          amount,
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
              convenienceFee: EDUCATION_CONVENIENCE_FEE,
              serviceKey: 'education',
              vendorAmount: total,
              markupApplied: pricing.markup,
              promoDiscount: pricing.promoDiscount,
              realizedMargin: pricing.markup - pricing.promoDiscount,
              promoCampaignId: pricing.promoCampaignId,
            },
          },
        ],
        { session }
      );

      responsePayload = {
        serviceType,
        quantity,
        amount,
        subtotal,
        convenienceFee: EDUCATION_CONVENIENCE_FEE,
        total,
        amountCharged: pricing.finalCharge,
        goldAward,
        walletBalance: updatedUser.balance,
        br9GoldPoints: updatedUser.br9GoldPoints,
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
