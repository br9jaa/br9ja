'use strict';

const jwt = require('jsonwebtoken');

const User = require('../models/User');

function sendError(res, status, message, data = null) {
  return res.status(status).json({
    success: false,
    data,
    message,
  });
}

async function authenticateAccessToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';

  if (!token) {
    return sendError(res, 401, 'Authorization token is required.');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return sendError(res, 401, 'Account not found for this token.');
    }

    if (user.isFrozen && !req.originalUrl.startsWith('/api/admin')) {
      return sendError(
        res,
        423,
        user.freezeReason
          ? `Account temporarily frozen: ${user.freezeReason}`
          : 'Account temporarily frozen pending review.'
      );
    }

    req.auth = payload;
    req.user = user;
    return next();
  } catch (_) {
    return sendError(res, 401, 'Invalid or expired token.');
  }
}

function checkKycLimit(req, res, next) {
  const amount = Number(req.body?.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return sendError(res, 400, 'A valid positive amount is required.');
  }

  const kycTier = Number(req.user?.kycTier || 1);
  if (amount > 20000 && kycTier === 1) {
    return sendError(res, 403, 'Upgrade to Tier 2 required');
  }

  return next();
}

module.exports = {
  authenticateAccessToken,
  checkKycLimit,
};
