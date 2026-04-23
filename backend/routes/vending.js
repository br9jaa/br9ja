'use strict';

const express = require('express');

const { authenticateAccessToken } = require('../middleware/security.middleware');
const {
  coolingOutflowLimit,
  deviceGuard,
} = require('../middleware/deviceGuard');
const { requireTransactionPin } = require('../middleware/transactionPin');
const { EDUCATION_CONVENIENCE_FEE, EDUCATION_PRICES } = require('../config/constants');
const {
  listEducationPins,
  purchaseExamPin,
} = require('../services/education.service');

const router = express.Router();

router.use(authenticateAccessToken);

function normaliseEducationService(type) {
  return String(type || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
}

function estimateEducationOutflow(req, _res, next) {
  const serviceType = normaliseEducationService(
    req.body?.serviceType || req.body?.type || req.body?.service
  );
  const unitPrice = EDUCATION_PRICES[serviceType];
  const quantity = Math.max(Number(req.body?.quantity || 1), 1);
  if (unitPrice) {
    req.body.amount = unitPrice * quantity + EDUCATION_CONVENIENCE_FEE;
  }
  return next();
}

router.get('/education/prices', (_req, res) => {
  res.json({
    success: true,
    data: Object.entries(EDUCATION_PRICES).map(([serviceType, amount]) => ({
      serviceType,
      amount,
      convenienceFee: EDUCATION_CONVENIENCE_FEE,
    })),
    message: 'Education PIN prices fetched successfully.',
  });
});

router.get('/education/history', async (req, res, next) => {
  try {
    const pins = await listEducationPins(req.user._id);
    res.json({
      success: true,
      data: pins.map((pin) => ({
        id: pin._id.toString(),
        serviceType: pin.service,
        pin: pin.pin,
        serial: pin.serial,
        profileCode: pin.profileCode,
        amount: pin.amount,
        status: pin.status,
        createdAt: pin.createdAt,
      })),
      message: 'Education PIN history fetched successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/education/purchase', deviceGuard, estimateEducationOutflow, coolingOutflowLimit, requireTransactionPin, async (req, res, next) => {
  try {
    const payload = await purchaseExamPin(
      req.body?.serviceType || req.body?.type || req.body?.service,
      req.user._id,
      {
        profileCode: req.body?.profileCode,
        quantity: req.body?.quantity,
      }
    );

    res.status(201).json({
      success: true,
      data: payload,
      message: 'Education PIN purchased successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/purchase-pin', deviceGuard, estimateEducationOutflow, coolingOutflowLimit, requireTransactionPin, async (req, res, next) => {
  try {
    const payload = await purchaseExamPin(
      req.body?.serviceType || req.body?.type || req.body?.service,
      req.user._id,
      {
        profileCode: req.body?.profileCode,
        quantity: req.body?.quantity,
      }
    );

    res.status(201).json({
      success: true,
      data: payload,
      message: 'Education PIN purchased successfully.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
