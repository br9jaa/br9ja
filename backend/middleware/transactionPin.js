'use strict';

const bcrypt = require('bcryptjs');

const { SecurityEvent } = require('../models');

function sendError(res, status, message) {
  return res.status(status).json({
    success: false,
    data: null,
    message,
  });
}

async function recordPinRiskEvent(req, message, severity = 'high') {
  try {
    await SecurityEvent.create({
      userId: req.user?._id || null,
      email: req.user?.email || '',
      bayrightTag: req.user?.bayrightTag || '',
      eventType: 'transaction-pin-failure',
      severity,
      route: req.originalUrl || req.path || '',
      method: req.method || '',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      deviceId: String(req.get('X-Device-ID') || req.body?.deviceId || '').trim(),
      message,
      metadata: {
        amount: Number(req.body?.amount || 0) || 0,
        recipient: req.body?.recipient || req.body?.customerId || req.body?.rrr || '',
        serviceID: req.body?.serviceID || '',
      },
    });
  } catch (_error) {
    // Risk logging must never block the user-facing response path.
  }
}

async function requireTransactionPin(req, res, next) {
  const transactionPin = String(
    req.body?.transactionPin || req.body?.pin || ''
  ).trim();

  if (!/^\d{6}$/.test(transactionPin)) {
    await recordPinRiskEvent(req, 'Missing or malformed transaction PIN.', 'high');
    return sendError(
      res,
      400,
      'A valid 6-digit transaction PIN is required.'
    );
  }

  const storedHash = req.user?.pinHash;
  if (!storedHash) {
    await recordPinRiskEvent(req, 'Transaction attempted before PIN setup.', 'critical');
    return sendError(
      res,
      409,
      'Set a transaction PIN before making wallet outflows.'
    );
  }

  const isMatch = await bcrypt.compare(transactionPin, storedHash);
  if (!isMatch) {
    await recordPinRiskEvent(req, 'Incorrect transaction PIN.', 'critical');
    return sendError(res, 401, 'Transaction PIN is incorrect.');
  }

  return next();
}

module.exports = {
  requireTransactionPin,
};
