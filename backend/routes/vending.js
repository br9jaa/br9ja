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
const { listServiceCatalog } = require('../services/service_catalog.service');
const { verifyEducationPurchase } = require('../services/vending_service');

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

router.get('/education/prices', async (_req, res, next) => {
  try {
    const rows = await listServiceCatalog({
      serviceKey: 'education',
      activeOnly: true,
    });

    const data = rows.map((row) => ({
      id: row.id,
      serviceType: row.serviceName.toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
      serviceName: row.serviceName,
      amount: row.sellingPrice,
      costPrice: row.costPrice,
      convenienceFee: Math.max(row.sellingPrice - row.costPrice, 0),
      provider: row.provider,
      providerCode: row.providerCode,
      serviceId: row.serviceId,
      variationCode: row.variationCode,
      purchaseEnabled: row.purchaseEnabled,
    }));

    res.json({
      success: true,
      data,
      message: 'Education PIN prices fetched successfully.',
    });
  } catch (error) {
    next(error);
  }
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

router.post('/education/verify', async (req, res, next) => {
  try {
    const serviceType = String(req.body?.serviceType || req.body?.type || '').trim();
    const candidateId = String(
      req.body?.candidateId || req.body?.profileCode || req.body?.billersCode || ''
    ).trim();

    if (!serviceType || !candidateId) {
      const error = new Error('serviceType and candidateId are required.');
      error.statusCode = 400;
      throw error;
    }

    const payload = await verifyEducationPurchase(serviceType, candidateId);
    res.json({
      success: true,
      data: payload,
      message: 'Education verification completed successfully.',
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
        user: req.user,
      }
    );

    res.status(payload.status === 'pending_verification' ? 202 : 201).json({
      success: true,
      data: payload,
      message:
        payload.status === 'pending_verification'
          ? 'Network delay detected. We are verifying this education purchase before charging your wallet.'
          : 'Education PIN purchased successfully.',
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
        user: req.user,
      }
    );

    res.status(payload.status === 'pending_verification' ? 202 : 201).json({
      success: true,
      data: payload,
      message:
        payload.status === 'pending_verification'
          ? 'Network delay detected. We are verifying this education purchase before charging your wallet.'
          : 'Education PIN purchased successfully.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
