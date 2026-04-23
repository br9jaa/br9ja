'use strict';

const crypto = require('crypto');

const axios = require('axios');

const { EDUCATION_PRICES } = require('../config/constants');
const { executeWithProviderFailover } = require('./provider_failover.service');

const serviceMap = {
  WAEC_RESULT: { peyflex: 'waec-result', vtpass: 'waec' },
  WAEC_GCE: { peyflex: 'waec-gce', vtpass: 'waec-gce' },
  JAMB: { peyflex: 'jamb', vtpass: 'jamb' },
  NECO: { peyflex: 'neco', vtpass: 'neco' },
  NABTEB: { peyflex: 'nabteb', vtpass: 'nabteb' },
};

function assertSupportedEducationService(serviceType) {
  if (!serviceMap[serviceType]) {
    const error = new Error('Unsupported education PIN service.');
    error.statusCode = 400;
    throw error;
  }
}

function shouldUseDemoVendor() {
  return process.env.NODE_ENV !== 'production' && process.env.VENDING_DEMO !== 'false';
}

function demoPin(serviceType, profileCode = '') {
  const suffix = crypto.randomBytes(5).toString('hex').toUpperCase();
  return {
    pin: `${serviceType.replace(/_/g, '')}-${suffix}`,
    serial: `SN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    profileCode,
    amount: EDUCATION_PRICES[serviceType],
    provider: 'demo',
    vendorReference: `DEMO-${Date.now().toString(36).toUpperCase()}`,
  };
}

function normaliseVendorPin(payload, serviceType, provider, profileCode) {
  const data = payload?.data || payload?.response || payload || {};
  const content = data.content || data.purchased_code || data;
  return {
    pin:
      String(
        content.pin ||
          content.pinCode ||
          content.epin ||
          content.token ||
          content.code ||
          ''
      ).trim() || demoPin(serviceType, profileCode).pin,
    serial: String(content.serial || content.serialNumber || content.serial_no || '').trim(),
    profileCode,
    amount: Number(content.amount || data.amount || EDUCATION_PRICES[serviceType]),
    provider,
    vendorReference: String(
      data.requestId || data.request_id || data.transactionId || data.reference || ''
    ),
  };
}

async function callPeyflex(serviceType, profileCode) {
  const baseUrl = process.env.PEYFLEX_BASE_URL;
  const apiKey = process.env.PEYFLEX_API_KEY || process.env.API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error('Peyflex credentials are not configured.');
  }

  const response = await axios.post(
    `${baseUrl.replace(/\/$/, '')}/education/purchase`,
    {
      service: serviceMap[serviceType].peyflex,
      profileCode: profileCode || undefined,
    },
    {
      timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return normaliseVendorPin(response.data, serviceType, 'peyflex', profileCode);
}

async function callVtpass(serviceType, profileCode) {
  const baseUrl = process.env.VTPASS_BASE_URL || 'https://vtpass.com/api';
  const apiKey = process.env.VTPASS_API_KEY;
  const publicKey = process.env.VTPASS_PUBLIC_KEY;
  const secretKey = process.env.VTPASS_SECRET_KEY;

  if (!apiKey && !publicKey && !secretKey) {
    throw new Error('VTPass credentials are not configured.');
  }

  const response = await axios.post(
    `${baseUrl.replace(/\/$/, '')}/pay`,
    {
      request_id: `BR9-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      serviceID: serviceMap[serviceType].vtpass,
      variation_code: serviceMap[serviceType].vtpass,
      billersCode: profileCode || 'BR9JA',
      phone: process.env.VTPASS_DEFAULT_PHONE || '08000000000',
      amount: EDUCATION_PRICES[serviceType],
    },
    {
      timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
      headers: {
        'api-key': apiKey,
        'public-key': publicKey,
        'secret-key': secretKey,
        'Content-Type': 'application/json',
      },
    }
  );

  return normaliseVendorPin(response.data, serviceType, 'vtpass', profileCode);
}

async function fetchPinFromVendor(serviceType, profileCode = null) {
  assertSupportedEducationService(serviceType);

  if (shouldUseDemoVendor()) {
    return demoPin(serviceType, profileCode || '');
  }

  return executeWithProviderFailover({
    serviceKey: 'education',
    attempt: async (provider) => {
      if (provider === 'peyflex') {
        return callPeyflex(serviceType, profileCode || '');
      }
      if (provider === 'vtpass') {
        return callVtpass(serviceType, profileCode || '');
      }
      if (provider === 'demo') {
        return demoPin(serviceType, profileCode || '');
      }

      const error = new Error(`${provider} is not configured for education PINs.`);
      error.statusCode = 501;
      throw error;
    }
  });
}

module.exports = {
  EDUCATION_PRICES,
  fetchPinFromVendor,
};
