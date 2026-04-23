'use strict';

const {
  DEVICE_COOLING_CAP_NAIRA,
  DEVICE_COOLING_HOURS,
} = require('../config/constants');
const User = require('../models/User');

const COOLING_MS = DEVICE_COOLING_HOURS * 60 * 60 * 1000;

function sendError(res, status, message, data = null) {
  return res.status(status).json({
    success: false,
    data,
    message,
  });
}

function normaliseAmount(value) {
  return typeof value === 'number'
    ? value
    : Number.parseFloat(String(value ?? 0));
}

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameOutflowDay(storedDate, now = new Date()) {
  if (!storedDate) {
    return false;
  }
  return startOfDay(new Date(storedDate)).getTime() === startOfDay(now).getTime();
}

function isWithinCoolingPeriod(user, now = new Date()) {
  if (!user?.lastDeviceChange) {
    return false;
  }
  return now.getTime() - new Date(user.lastDeviceChange).getTime() < COOLING_MS;
}

async function deviceGuard(req, res, next) {
  const incomingDeviceId = String(req.get('X-Device-ID') || '').trim();
  if (!incomingDeviceId) {
    return sendError(
      res,
      428,
      'Device verification required. Please update the app and sign in again.'
    );
  }

  const user = await User.findById(req.user?._id).select('+activeDeviceId');
  if (!user) {
    return sendError(res, 401, 'Account not found.');
  }

  if (!user.activeDeviceId) {
    user.activeDeviceId = incomingDeviceId;
    user.lastDeviceChange = new Date();
    await user.save();
    req.user = user;
    return next();
  }

  if (user.activeDeviceId !== incomingDeviceId) {
    return sendError(
      res,
      403,
      'This transaction is blocked on a new device. Please re-authenticate to bind this device.'
    );
  }

  req.user = user;
  return next();
}

function coolingOutflowLimit(req, res, next) {
  const amount = normaliseAmount(req.body?.amount);
  if (!Number.isFinite(amount) || amount <= 0 || !isWithinCoolingPeriod(req.user)) {
    return next();
  }

  const spentToday = isSameOutflowDay(req.user.dailyOutflowDate)
    ? Number(req.user.dailyOutflowTotal || 0)
    : 0;

  if (spentToday + amount > DEVICE_COOLING_CAP_NAIRA) {
    return sendError(
      res,
      403,
      `New-device cooling period active. Daily outflow is capped at ₦${DEVICE_COOLING_CAP_NAIRA.toLocaleString()}.`
    );
  }

  return next();
}

async function recordDailyOutflow(userId, amount, session = null) {
  const value = normaliseAmount(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  const user = await User.findById(userId).session(session);
  if (!user) {
    return null;
  }

  const today = startOfDay();
  const currentTotal = isSameOutflowDay(user.dailyOutflowDate)
    ? Number(user.dailyOutflowTotal || 0)
    : 0;

  user.dailyOutflowDate = today;
  user.dailyOutflowTotal = currentTotal + value;
  await user.save({ session });
  return user.dailyOutflowTotal;
}

module.exports = {
  coolingOutflowLimit,
  deviceGuard,
  recordDailyOutflow,
};
