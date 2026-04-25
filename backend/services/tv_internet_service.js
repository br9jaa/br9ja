'use strict';

const crypto = require('crypto');

const axios = require('axios');

const {
  payCableWithClubkonnect,
  verifyCableWithClubkonnect,
} = require('./clubkonnect.service');
const { executeWithProviderFailover } = require('./provider_failover.service');
const {
  normaliseVTpassStatus,
  payService,
  verifyMerchant,
} = require('./vtpass.service');

function peyflexBaseUrl(config = {}) {
  return (config.endpoints?.peyflexBaseUrl || process.env.PEYFLEX_BASE_URL || '').replace(
    /\/$/,
    ''
  );
}

function shouldUseDemoVendor() {
  return process.env.NODE_ENV !== 'production' && process.env.VENDING_DEMO !== 'false';
}

function hasPeyflexCredentials(config = {}) {
  return Boolean(peyflexBaseUrl(config) && (process.env.PEYFLEX_API_KEY || process.env.API_KEY));
}

const demoPlans = [
  { variationCode: 'compact', name: 'Compact', amount: 12500 },
  { variationCode: 'premium', name: 'Premium', amount: 29500 },
  { variationCode: 'max', name: 'Max', amount: 8500 },
];

function normaliseSmartcardPayload(payload, billersCode, serviceID, provider) {
  const content = payload?.content || payload?.data || payload?.response || payload || {};
  return {
    customerName: content.Customer_Name || content.customerName || content.name || '',
    currentBouquet:
      content.Current_Bouquet || content.currentBouquet || content.currentPlan || '',
    billersCode,
    serviceID,
    plans: content.plans || content.variations || demoPlans,
    provider,
    raw: payload,
  };
}

function normaliseSubscriptionPayload(payload, amount, provider) {
  const content = payload?.content || payload?.data || payload?.response || payload || {};
  return {
    status:
      provider === 'vtpass'
        ? normaliseVTpassStatus(
            content.status ||
              payload?.code ||
              payload?.response_description ||
              payload?.message,
            'success'
          )
        : 'success',
    receiptNumber: String(
      content.receiptNumber ||
        content.receipt_number ||
        content.transactionId ||
        payload?.requestId ||
        ''
    ).trim(),
    nextRenewalDate: content.nextRenewalDate || content.renewal_date || null,
    amount: Number(content.amount || amount),
    provider,
    raw: payload,
  };
}

async function verifySmartCardWithPeyflex(billersCode, serviceID, config) {
  if (!hasPeyflexCredentials(config)) {
    const error = new Error('Peyflex credentials are not configured.');
    error.statusCode = 503;
    throw error;
  }

  const response = await axios.post(
    `${peyflexBaseUrl(config)}/tv/verify`,
    { billersCode, serviceID },
    {
      timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
      headers: {
        Authorization: `Bearer ${process.env.PEYFLEX_API_KEY || process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return normaliseSmartcardPayload(response.data, billersCode, serviceID, 'peyflex');
}

async function renewSubscriptionWithPeyflex(
  billersCode,
  serviceID,
  variationCode,
  phone,
  amount,
  config
) {
  if (!hasPeyflexCredentials(config)) {
    const error = new Error('Peyflex credentials are not configured.');
    error.statusCode = 503;
    throw error;
  }

  const response = await axios.post(
    `${peyflexBaseUrl(config)}/tv/pay`,
    { billersCode, serviceID, variationCode, phone, amount },
    {
      timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
      headers: {
        Authorization: `Bearer ${process.env.PEYFLEX_API_KEY || process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return normaliseSubscriptionPayload(response.data, amount, 'peyflex');
}

async function verifySmartCard(billersCode, serviceID) {
  if (shouldUseDemoVendor()) {
    return {
      customerName: 'BR9JA DEMO CUSTOMER',
      currentBouquet: 'DSTV Compact',
      billersCode,
      serviceID,
      plans: demoPlans,
      provider: 'demo',
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'cableTv',
    attempt: async (provider, { config }) => {
      if (provider === 'clubkonnect') {
        return verifyCableWithClubkonnect({
          serviceId: serviceID,
          smartcardNumber: billersCode,
        });
      }
      if (provider === 'peyflex') {
        return verifySmartCardWithPeyflex(billersCode, serviceID, config);
      }
      if (provider === 'vtpass') {
        const response = await verifyMerchant({ billersCode, serviceID }, { config });
        return normaliseSmartcardPayload(response, billersCode, serviceID, 'vtpass');
      }

      return {
        customerName: 'BR9JA DEMO CUSTOMER',
        currentBouquet: 'DSTV Compact',
        billersCode,
        serviceID,
        plans: demoPlans,
        provider: 'demo',
      };
    },
  });
}

async function renewSubscription(billersCode, serviceID, variationCode, phone, amount) {
  if (shouldUseDemoVendor()) {
    return {
      receiptNumber: `SUB-${Date.now().toString(36).toUpperCase()}`,
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount,
      provider: 'demo',
      raw: {},
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'cableTv',
    attempt: async (provider, { config }) => {
      if (provider === 'clubkonnect') {
        return payCableWithClubkonnect({
          serviceId: serviceID,
          smartcardNumber: billersCode,
          packageCode: variationCode,
          amount,
          phoneNumber: phone,
        });
      }
      if (provider === 'peyflex') {
        return renewSubscriptionWithPeyflex(
          billersCode,
          serviceID,
          variationCode,
          phone,
          amount,
          config
        );
      }
      if (provider === 'vtpass') {
        const response = await payService(
          {
            serviceID,
            billersCode,
            variationCode,
            amount,
            phone,
          },
          { config }
        );
        return normaliseSubscriptionPayload(response, amount, 'vtpass');
      }

      return {
        receiptNumber: `SUB-${Date.now().toString(36).toUpperCase()}`,
        nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount,
        provider: 'demo',
        raw: {},
      };
    },
  });
}

module.exports = {
  renewSubscription,
  verifySmartCard,
};
