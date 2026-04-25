'use strict';

const crypto = require('crypto');

const axios = require('axios');

const { EDUCATION_PRICES } = require('../config/constants');
const { executeWithProviderFailover } = require('./provider_failover.service');
const {
  normaliseVTpassStatus,
  payService,
  verifyMerchant,
} = require('./vtpass.service');

const serviceMap = {
  WAEC_RESULT: { peyflex: 'waec-result', vtpass: 'waec' },
  WAEC_GCE: { peyflex: 'waec-gce', vtpass: 'waec-gce' },
  JAMB: { peyflex: 'jamb', vtpass: 'jamb', variation: 'utme' },
  JAMB_UTME: { peyflex: 'jamb', vtpass: 'jamb', variation: 'utme' },
  JAMB_DIRECT_ENTRY: {
    peyflex: 'jamb-direct-entry',
    vtpass: 'jamb',
    variation: 'direct-entry',
  },
  NECO: { peyflex: 'neco', vtpass: 'neco' },
  NABTEB: { peyflex: 'nabteb', vtpass: 'nabteb' },
};

function normaliseEducationServiceType(serviceType) {
  const normalised = String(serviceType || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  return normalised === 'JAMB' ? 'JAMB_UTME' : normalised;
}

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
    status:
      provider === 'vtpass'
        ? normaliseVTpassStatus(
            content.status ||
              data.code ||
              data.response_description ||
              data.message,
            'success'
          )
        : 'success',
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
  const mapping = serviceMap[serviceType];
  const response = await payService(
    {
      serviceID: mapping.vtpass,
      variationCode: mapping.variation || mapping.vtpass,
      billersCode: profileCode || 'BR9JA',
      phone: process.env.VTPASS_DEFAULT_PHONE || '08000000000',
      amount: EDUCATION_PRICES[serviceType],
    }
  );

  return normaliseVendorPin(response, serviceType, 'vtpass', profileCode);
}

async function verifyEducationPurchase(serviceType, candidateId = '') {
  const normalisedServiceType = normaliseEducationServiceType(serviceType);
  assertSupportedEducationService(normalisedServiceType);

  const mapping = serviceMap[normalisedServiceType];
  const identifier = String(candidateId || '').trim();
  if (!identifier) {
    const error = new Error('A student profile or candidate ID is required.');
    error.statusCode = 400;
    throw error;
  }

  if (shouldUseDemoVendor()) {
    return {
      serviceType: normalisedServiceType,
      provider: 'demo',
      candidateId: identifier,
      customerName: 'BR9JA DEMO STUDENT',
      status: 'verified',
      raw: {},
    };
  }

  const payload = await verifyMerchant({
    billersCode: identifier,
    serviceID: mapping.vtpass,
    variationCode: mapping.variation || mapping.vtpass,
  });

  const content = payload?.content || payload?.data || payload || {};
  return {
    serviceType: normalisedServiceType,
    provider: 'vtpass',
    candidateId: identifier,
    customerName:
      content.Customer_Name || content.customerName || content.name || '',
    status:
      content.status ||
      payload?.code ||
      payload?.response_description ||
      'verified',
    raw: payload,
  };
}

async function fetchPinFromVendor(serviceType, profileCode = null) {
  const normalisedServiceType = normaliseEducationServiceType(serviceType);
  assertSupportedEducationService(normalisedServiceType);

  if (shouldUseDemoVendor()) {
    return demoPin(normalisedServiceType, profileCode || '');
  }

  return executeWithProviderFailover({
    serviceKey: 'education',
    attempt: async (provider) => {
      if (provider === 'peyflex') {
        return callPeyflex(normalisedServiceType, profileCode || '');
      }
      if (provider === 'vtpass') {
        return callVtpass(normalisedServiceType, profileCode || '');
      }
      if (provider === 'demo') {
        return demoPin(normalisedServiceType, profileCode || '');
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
  normaliseEducationServiceType,
  verifyEducationPurchase,
};
