'use strict';

const axios = require('axios');

function pad(value) {
  return String(value).padStart(2, '0');
}

function getVTpassBaseUrl(config = {}) {
  const explicit = String(process.env.VTPASS_MODE || '')
    .trim()
    .toLowerCase();

  const configuredUrl =
    config.endpoints?.vtpassBaseUrl || process.env.VTPASS_BASE_URL || '';
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (explicit === 'live') {
    return 'https://vtpass.com/api';
  }

  if (explicit === 'sandbox') {
    return 'https://sandbox.vtpass.com/api';
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://vtpass.com/api'
    : 'https://sandbox.vtpass.com/api';
}

function createVTpassRequestId(now = new Date()) {
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
  ].join('');

  return `${stamp}${Math.random().toString(36).substring(2, 10)}`;
}

function getVTpassBasicAuthToken() {
  const apiKey = String(process.env.VTPASS_API_KEY || '').trim();
  const secretKey = String(process.env.VTPASS_SECRET_KEY || '').trim();

  if (!apiKey || !secretKey) {
    return '';
  }

  return Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
}

function hasVTpassCredentials(channel = 'general') {
  if (channel === 'messaging' || channel === 'government') {
    return Boolean(
      String(process.env.VTPASS_PUBLIC_KEY || '').trim() &&
        String(process.env.VTPASS_SECRET_KEY || '').trim()
    );
  }

  return Boolean(
    String(process.env.VTPASS_API_KEY || '').trim() &&
      String(process.env.VTPASS_SECRET_KEY || '').trim()
  );
}

function getVTpassHeaders(channel = 'general') {
  if (channel === 'messaging' || channel === 'government') {
    return {
      'X-Token': process.env.VTPASS_PUBLIC_KEY,
      'X-Secret': process.env.VTPASS_SECRET_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  return {
    Authorization: `Basic ${getVTpassBasicAuthToken()}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

function normaliseVTpassStatus(rawStatus = '', defaultStatus = 'pending') {
  const safe = String(rawStatus || '').trim().toLowerCase();
  if (
    ['success', 'successful', 'completed', 'delivered'].includes(safe) ||
    safe === '000'
  ) {
    return 'success';
  }
  if (
    ['failed', 'reversed', 'cancelled', 'error'].includes(safe) ||
    ['099', '400', '500'].includes(safe)
  ) {
    return 'failed';
  }
  return defaultStatus;
}

async function callVTpass(
  endpoint,
  {
    method = 'post',
    data,
    params,
    channel = 'general',
    config = {},
    timeoutMs = Number(process.env.VENDOR_TIMEOUT_MS || 15000),
  } = {}
) {
  if (!hasVTpassCredentials(channel)) {
    const error = new Error('VTPass credentials are not configured.');
    error.statusCode = 503;
    throw error;
  }

  const response = await axios({
    url: `${getVTpassBaseUrl(config)}/${String(endpoint || '').replace(/^\/+/, '')}`,
    method,
    data,
    params,
    timeout: timeoutMs,
    headers: getVTpassHeaders(channel),
  });

  return response.data;
}

async function verifyMerchant(
  {
    billersCode,
    serviceID,
    type,
    variationCode,
  },
  options = {}
) {
  const payload = {
    billersCode,
    serviceID,
  };

  if (type) {
    payload.type = type;
  }

  if (variationCode) {
    payload.variation_code = variationCode;
  }

  return callVTpass('merchant-verify', {
    ...options,
    data: payload,
  });
}

async function payService(
  {
    serviceID,
    billersCode,
    amount,
    phone,
    variationCode,
    type,
    requestId,
  },
  options = {}
) {
  const payload = {
    request_id: requestId || createVTpassRequestId(),
    serviceID,
    billersCode,
    amount,
    phone,
  };

  if (variationCode) {
    payload.variation_code = variationCode;
  }

  if (type) {
    payload.type = type;
  }

  return callVTpass('pay', {
    ...options,
    data: payload,
  });
}

async function checkVTpassBalance(options = {}) {
  if (!hasVTpassCredentials('general')) {
    return {
      balance: 100000,
      provider: 'vtpass-demo',
      raw: { status: 'demo' },
    };
  }

  const payload = await callVTpass(
    process.env.VTPASS_BALANCE_ENDPOINT || 'balance',
    {
      ...options,
      method: 'get',
      channel: 'general',
    }
  );
  const data = payload?.content || payload?.data || payload || {};
  const balance = Number(
    data.balance ||
      data.walletBalance ||
      data.available_balance ||
      data.availableBalance ||
      0
  );

  return {
    balance: Number.isFinite(balance) ? balance : 0,
    provider: 'vtpass',
    raw: payload,
  };
}

async function requeryVTpassTransaction(requestId, options = {}) {
  if (!hasVTpassCredentials('general')) {
    return {
      reference: requestId,
      status: 'pending',
      provider: 'vtpass-demo',
      raw: { status: 'pending' },
    };
  }

  const payload = await callVTpass(
    process.env.VTPASS_REQUERY_ENDPOINT || 'requery',
    {
      ...options,
      method: 'post',
      channel: 'general',
      data: {
        request_id: requestId,
        reference: requestId,
      },
    }
  );

  const data = payload?.content || payload?.data || payload || {};

  return {
    reference: requestId,
    status: normaliseVTpassStatus(
      data.status ||
        data.code ||
        data.response_description ||
        data.responseMessage ||
        data.message
    ),
    provider: 'vtpass',
    raw: payload,
  };
}

module.exports = {
  callVTpass,
  checkVTpassBalance,
  createVTpassRequestId,
  getVTpassBaseUrl,
  getVTpassHeaders,
  hasVTpassCredentials,
  normaliseVTpassStatus,
  payService,
  requeryVTpassTransaction,
  verifyMerchant,
};
