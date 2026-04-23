'use strict';

const crypto = require('crypto');

const axios = require('axios');

const { executeWithProviderFailover } = require('./provider_failover.service');

function vtpassBaseUrl(config = {}) {
  return (
    config.endpoints?.vtpassBaseUrl ||
    process.env.VTPASS_BASE_URL ||
    'https://vtpass.com/api'
  ).replace(/\/$/, '');
}

function peyflexBaseUrl(config = {}) {
  return (config.endpoints?.peyflexBaseUrl || process.env.PEYFLEX_BASE_URL || '').replace(
    /\/$/,
    ''
  );
}

function vtpassHeaders() {
  return {
    'api-key': process.env.VTPASS_API_KEY,
    'public-key': process.env.VTPASS_PUBLIC_KEY,
    'secret-key': process.env.VTPASS_SECRET_KEY,
    'Content-Type': 'application/json',
  };
}

function shouldUseDemoVendor() {
  return process.env.NODE_ENV !== 'production' && process.env.VENDING_DEMO !== 'false';
}

function hasVtpassCredentials() {
  return Boolean(
    process.env.VTPASS_API_KEY ||
      process.env.VTPASS_PUBLIC_KEY ||
      process.env.VTPASS_SECRET_KEY
  );
}

function hasPeyflexCredentials(config = {}) {
  return Boolean(peyflexBaseUrl(config) && (process.env.PEYFLEX_API_KEY || process.env.API_KEY));
}

function normaliseMeterPayload(payload, meterNumber, serviceID, type, provider) {
  const content = payload?.content || payload?.data || payload?.response || payload || {};
  return {
    customerName:
      content.Customer_Name || content.customerName || content.customer_name || content.name || '',
    address: content.Address || content.address || '',
    meterNumber,
    serviceID,
    type,
    provider,
    raw: payload,
  };
}

function normaliseElectricityPayment(payload, amount, provider) {
  const content = payload?.content || payload?.data || payload?.response || payload || {};
  return {
    token: String(content.token || content.Token || content.purchased_code || '').trim(),
    receiptNumber: String(
      content.receiptNumber ||
        content.receipt_number ||
        content.transactionId ||
        payload?.requestId ||
        ''
    ).trim(),
    amount: Number(content.amount || amount),
    provider,
    raw: payload,
  };
}

async function verifyMeterWithPeyflex(meterNumber, serviceID, type, config) {
  if (!hasPeyflexCredentials(config)) {
    const error = new Error('Peyflex credentials are not configured.');
    error.statusCode = 503;
    throw error;
  }

  const response = await axios.post(
    `${peyflexBaseUrl(config)}/electricity/verify`,
    { meterNumber, serviceID, type },
    {
      timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
      headers: {
        Authorization: `Bearer ${process.env.PEYFLEX_API_KEY || process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return normaliseMeterPayload(response.data, meterNumber, serviceID, type, 'peyflex');
}

async function purchaseElectricityWithPeyflex(
  meterNumber,
  serviceID,
  type,
  amount,
  phone,
  config
) {
  if (!hasPeyflexCredentials(config)) {
    const error = new Error('Peyflex credentials are not configured.');
    error.statusCode = 503;
    throw error;
  }

  const response = await axios.post(
    `${peyflexBaseUrl(config)}/electricity/purchase`,
    { meterNumber, serviceID, type, amount, phone },
    {
      timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
      headers: {
        Authorization: `Bearer ${process.env.PEYFLEX_API_KEY || process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return normaliseElectricityPayment(response.data, amount, 'peyflex');
}

async function verifyMeter(meterNumber, serviceID, type) {
  if (shouldUseDemoVendor()) {
    return {
      customerName: 'CHUKWUMA OKORIE',
      address: 'Demo address',
      meterNumber,
      serviceID,
      type,
      provider: 'demo',
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'electricity',
    attempt: async (provider, { config }) => {
      if (provider === 'peyflex') {
        return verifyMeterWithPeyflex(meterNumber, serviceID, type, config);
      }
      if (provider === 'vtpass') {
        const response = await axios.post(
          `${vtpassBaseUrl(config)}/merchant-verify`,
          {
            billersCode: meterNumber,
            serviceID,
            type,
          },
          {
            timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
            headers: vtpassHeaders(),
          }
        );
        return normaliseMeterPayload(response.data, meterNumber, serviceID, type, 'vtpass');
      }

      return {
        customerName: 'CHUKWUMA OKORIE',
        address: 'Demo address',
        meterNumber,
        serviceID,
        type,
        provider: 'demo',
      };
    },
  });
}

async function purchaseElectricity(meterNumber, serviceID, type, amount, phone) {
  if (shouldUseDemoVendor()) {
    return {
      token: type === 'prepaid' ? crypto.randomBytes(10).toString('hex').toUpperCase() : '',
      receiptNumber: `RCPT-${Date.now().toString(36).toUpperCase()}`,
      amount,
      provider: 'demo',
      raw: {},
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'electricity',
    attempt: async (provider, { config }) => {
      if (provider === 'peyflex') {
        return purchaseElectricityWithPeyflex(
          meterNumber,
          serviceID,
          type,
          amount,
          phone,
          config
        );
      }

      if (provider === 'vtpass') {
        const response = await axios.post(
          `${vtpassBaseUrl(config)}/pay`,
          {
            request_id: `BR9-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
            serviceID,
            billersCode: meterNumber,
            variation_code: type,
            amount,
            phone,
          },
          {
            timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
            headers: vtpassHeaders(),
          }
        );
        return normaliseElectricityPayment(response.data, amount, 'vtpass');
      }

      return {
        token: type === 'prepaid' ? crypto.randomBytes(10).toString('hex').toUpperCase() : '',
        receiptNumber: `RCPT-${Date.now().toString(36).toUpperCase()}`,
        amount,
        provider: 'demo',
        raw: {},
      };
    },
  });
}

module.exports = {
  purchaseElectricity,
  verifyMeter,
};
