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

const FULLY_BLOCKED_ACCOUNT_STATUSES = new Set(['suspended', 'deleted']);
const LIMITED_ACCOUNT_STATUSES = new Set([
  'restricted',
  'verification_required',
  'under_review',
]);

function buildAccountStatusMessage(user) {
  const status = user.accountStatus || 'active';
  const reason = user.accountStatusReason || user.freezeReason || '';

  if (status === 'deleted') {
    return 'This account has been deleted by BR9ja admin support.';
  }

  if (status === 'suspended') {
    return reason
      ? `Account suspended: ${reason}`
      : 'Account suspended pending BR9ja admin review.';
  }

  if (status === 'restricted') {
    return reason
      ? `Account restricted: ${reason}`
      : 'Account restricted. Please contact BR9ja support before transacting.';
  }

  if (status === 'verification_required') {
    return reason
      ? `Verification required: ${reason}`
      : 'Verification required before this account can transact.';
  }

  if (status === 'under_review') {
    return reason
      ? `Account under review: ${reason}`
      : 'Account under review. Transactions are paused temporarily.';
  }

  return reason
    ? `Account temporarily frozen: ${reason}`
    : 'Account temporarily frozen pending review.';
}

function shouldBlockLimitedAccount(req) {
  if (req.originalUrl.startsWith('/api/admin')) {
    return false;
  }

  if (req.method !== 'GET') {
    return true;
  }

  return [
    '/api/transactions',
    '/api/vending',
    '/api/utility',
    '/api/transport',
    '/api/gov',
    '/api/betting',
  ].some((prefix) => req.originalUrl.startsWith(prefix));
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

    const accountStatus = user.accountStatus || 'active';
    if (
      FULLY_BLOCKED_ACCOUNT_STATUSES.has(accountStatus) &&
      !req.originalUrl.startsWith('/api/admin')
    ) {
      return sendError(res, 423, buildAccountStatusMessage(user));
    }

    if (
      LIMITED_ACCOUNT_STATUSES.has(accountStatus) &&
      shouldBlockLimitedAccount(req)
    ) {
      return sendError(res, 423, buildAccountStatusMessage(user));
    }

    if (user.isFrozen && !req.originalUrl.startsWith('/api/admin')) {
      return sendError(
        res,
        423,
        buildAccountStatusMessage(user)
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
