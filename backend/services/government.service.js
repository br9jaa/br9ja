'use strict';

const crypto = require('crypto');

const axios = require('axios');
const { executeWithProviderFailover } = require('./provider_failover.service');

function remitaBaseUrl(config = {}) {
  return (
    config.endpoints?.remitaBaseUrl ||
    process.env.REMITA_BASE_URL ||
    'https://remitademo.net/remita/exapp/api/v1'
  ).replace(/\/$/, '');
}

function shouldUseDemoVendor() {
  return process.env.NODE_ENV !== 'production' && process.env.VENDING_DEMO !== 'false';
}

function hasRemitaCredentials() {
  return Boolean(process.env.REMITA_MERCHANT_ID && process.env.REMITA_API_KEY);
}

function reference(prefix) {
  return `${prefix}${Date.now()}${crypto.randomInt(1000, 9999)}`;
}

function missingProviderCredentials(provider) {
  const error = new Error(`${provider} government payment credentials are not configured.`);
  error.statusCode = 503;
  return error;
}

function normaliseGovernmentStatus(rawStatus = '', defaultStatus = 'pending') {
  const safe = String(rawStatus || '').trim().toLowerCase();
  if (['success', 'successful', 'completed', 'paid', 'approved'].includes(safe)) {
    return 'success';
  }
  if (['failed', 'error', 'reversed', 'declined', 'cancelled'].includes(safe)) {
    return 'failed';
  }
  return defaultStatus;
}

async function generateRRR(serviceType, details = {}) {
  const amount = Number(details.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error('A positive amount is required to generate RRR.');
    error.statusCode = 400;
    throw error;
  }

  if (shouldUseDemoVendor()) {
    return {
      rrr: reference('RRR'),
      serviceType,
      amount,
      payerName: details.payerName || 'BR9JA GOV PAYER',
      providerReference: reference('GOV'),
      provider: 'demo',
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'government',
    attempt: async (provider, { config }) => {
      if (provider === 'demo') {
        return {
          rrr: reference('RRR'),
          serviceType,
          amount,
          payerName: details.payerName || 'BR9JA GOV PAYER',
          providerReference: reference('GOV'),
          provider: 'demo',
        };
      }

      if (provider !== 'remita' || !hasRemitaCredentials()) {
        throw missingProviderCredentials(provider);
      }

      const response = await axios.post(
        `${remitaBaseUrl(config)}/send/api/echannelsvc/merchant/api/paymentinit`,
        {
          serviceTypeId: serviceType,
          amount,
          orderId: reference('BR9GOV'),
          payerName: details.payerName,
          payerEmail: details.payerEmail,
          payerPhone: details.payerPhone,
          description: details.description || serviceType,
        },
        {
          timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
          headers: {
            Authorization: `remitaConsumerKey=${process.env.REMITA_MERCHANT_ID},remitaConsumerToken=${process.env.REMITA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data?.data || response.data || {};
      return {
        rrr: String(data.RRR || data.rrr || data.paymentReference || ''),
        serviceType,
        amount,
        payerName: details.payerName || '',
        providerReference: String(data.orderId || data.reference || ''),
        provider: 'remita',
        raw: response.data,
      };
    },
  });
}

async function payRRR(rrr, amount) {
  if (shouldUseDemoVendor()) {
    return {
      rrr,
      amount,
      receiptNumber: reference('GOVPAY'),
      provider: 'demo',
      raw: {},
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'government',
    attempt: async (provider, { config }) => {
      if (provider === 'demo') {
        return {
          rrr,
          amount,
          receiptNumber: reference('GOVPAY'),
          provider: 'demo',
          raw: {},
        };
      }

      if (provider !== 'remita' || !hasRemitaCredentials()) {
        throw missingProviderCredentials(provider);
      }

      const response = await axios.post(
        `${remitaBaseUrl(config)}/send/api/echannelsvc/merchant/api/payment`,
        { rrr, amount },
        {
          timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
          headers: {
            Authorization: `remitaConsumerKey=${process.env.REMITA_MERCHANT_ID},remitaConsumerToken=${process.env.REMITA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        rrr,
        amount,
        status: normaliseGovernmentStatus(
          response.data?.status ||
            response.data?.response_description ||
            response.data?.message,
          'success'
        ),
        receiptNumber: String(
          response.data?.transactionId || response.data?.receiptNumber || ''
        ),
        provider: 'remita',
        raw: response.data,
      };
    },
  });
}

async function verifyTrafficFine(billersCode) {
  if (shouldUseDemoVendor()) {
    return {
      billersCode,
      offenderName: 'BR9JA DEMO DRIVER',
      offense: 'Traffic fine verification',
      amount: 15000,
      provider: 'demo',
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'government',
    attempt: async (provider, { config }) => {
      if (provider === 'demo') {
        return {
          billersCode,
          offenderName: 'BR9JA DEMO DRIVER',
          offense: 'Traffic fine verification',
          amount: 15000,
          provider: 'demo',
        };
      }

      if (provider !== 'remita' || !hasRemitaCredentials()) {
        throw missingProviderCredentials(provider);
      }

      const response = await axios.post(
        `${remitaBaseUrl(config)}/verify`,
        { billersCode },
        { timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000) }
      );
      return {
        ...response.data,
        provider: 'remita',
      };
    },
  });
}

module.exports = {
  generateRRR,
  payRRR,
  verifyTrafficFine,
};
