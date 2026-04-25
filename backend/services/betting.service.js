'use strict';

const crypto = require('crypto');

const axios = require('axios');
const { executeWithProviderFailover } = require('./provider_failover.service');
const {
  getProviderConfig,
  getServiceProviderRoute,
} = require('./provider_config.service');

const SUPPORTED_BOOKMAKERS = [
  'SportyBet',
  'Bet9ja',
  '1XBet',
  'BetKing',
  'MSport',
  '22Bet',
];

function shouldUseDemoVendor() {
  return process.env.NODE_ENV !== 'production' && process.env.VENDING_DEMO !== 'false';
}

function providerBaseUrl(provider, config = {}) {
  const endpoints = config.endpoints || {};
  const fallback = {
    billpay: process.env.BILLPAY_BASE_URL || '',
    flutterwave:
      process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3',
  };

  const configured = {
    billpay: endpoints.billPayBaseUrl,
    flutterwave: endpoints.flutterwaveBaseUrl,
  };

  return String(configured[provider] || fallback[provider] || '').replace(/\/$/, '');
}

function providerAuthHeader(provider) {
  const token =
    provider === 'flutterwave'
      ? process.env.FLUTTERWAVE_SECRET_KEY
      : process.env.BILLPAY_API_KEY || process.env.FLUTTERWAVE_SECRET_KEY;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function reference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(2)
    .toString('hex')
    .toUpperCase()}`;
}

function isTimeoutError(error) {
  const code = String(error?.code || '').toUpperCase();
  const message = String(error?.message || '').toLowerCase();
  return (
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    message.includes('timeout')
  );
}

function sanitiseBookmaker(bookmaker) {
  const match = SUPPORTED_BOOKMAKERS.find(
    (item) => item.toLowerCase() === String(bookmaker || '').trim().toLowerCase()
  );
  return match || '';
}

function extractCustomerName(payload = {}) {
  const data = payload?.data || payload || {};
  return String(
    data.customerName ||
      data.accountName ||
      data.name ||
      data.customer_name ||
      ''
  ).trim();
}

function normaliseStatusResponse(payload = {}) {
  const data = payload?.data || payload || {};
  const rawStatus = String(
    data.status ||
      data.transactionStatus ||
      data.paymentStatus ||
      data.state ||
      ''
  )
    .trim()
    .toLowerCase();

  if (['success', 'successful', 'completed', 'paid'].includes(rawStatus)) {
    return 'success';
  }

  if (['failed', 'error', 'cancelled', 'reversed'].includes(rawStatus)) {
    return 'failed';
  }

  return 'pending';
}

function buildProviderCandidates(route) {
  const providers = [route.primaryProvider];
  if (
    route.failoverEnabled &&
    route.backupProvider &&
    route.backupProvider !== route.primaryProvider
  ) {
    providers.push(route.backupProvider);
  }
  return [...new Set(providers)];
}

async function postBettingProvider(baseUrl, path, body, provider) {
  const response = await axios.post(
    `${baseUrl}${path}`,
    body,
    {
      timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
      headers: {
        ...providerAuthHeader(provider),
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

async function verifyBettingAccount(bookmaker, customerId) {
  const normalisedBookmaker = sanitiseBookmaker(bookmaker);
  if (!normalisedBookmaker) {
    const error = new Error('Unsupported betting provider.');
    error.statusCode = 400;
    throw error;
  }

  if (shouldUseDemoVendor()) {
    return {
      bookmaker: normalisedBookmaker,
      customerId,
      customerName: 'BR9JA BETTING DEMO',
      provider: 'demo',
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'betting',
    attempt: async (provider, { config }) => {
      const baseUrl = providerBaseUrl(provider, config);
      if (provider === 'demo' || !baseUrl) {
        return {
          bookmaker: normalisedBookmaker,
          customerId,
          customerName: 'BR9JA BETTING DEMO',
          provider: 'demo',
        };
      }

      const providerResponse = await postBettingProvider(
        baseUrl,
        '/billpay/validate',
        { biller: normalisedBookmaker, customerId },
        provider
      );
      const data = providerResponse?.data || providerResponse || {};
      return {
        bookmaker: normalisedBookmaker,
        customerId,
        customerName: extractCustomerName(data),
        provider,
        raw: providerResponse,
      };
    },
  });
}

async function fundBettingWallet(bookmaker, customerId, amount, phone) {
  const normalisedBookmaker = sanitiseBookmaker(bookmaker);
  if (!normalisedBookmaker) {
    const error = new Error('Unsupported betting provider.');
    error.statusCode = 400;
    throw error;
  }

  if (shouldUseDemoVendor()) {
    return {
      bookmaker: normalisedBookmaker,
      customerId,
      amount,
      receiptNumber: reference('BET'),
      provider: 'demo',
      status: 'success',
      raw: {},
    };
  }

  const config = await getProviderConfig();
  const route = getServiceProviderRoute(config, 'betting');
  const providers = buildProviderCandidates(route);
  const fundingReference = reference('BET');
  let lastError;

  for (let index = 0; index < providers.length; index += 1) {
    const provider = providers[index];
    const baseUrl = providerBaseUrl(provider, config);

    if (provider === 'demo' || !baseUrl) {
      return {
        bookmaker: normalisedBookmaker,
        customerId,
        amount,
        receiptNumber: fundingReference,
        provider: 'demo',
        status: 'success',
        raw: {},
      };
    }

    try {
      const providerResponse = await postBettingProvider(
        baseUrl,
        '/billpay/pay',
        {
          reference: fundingReference,
          biller: normalisedBookmaker,
          customerId,
          amount,
          phone,
        },
        provider
      );

      return {
        bookmaker: normalisedBookmaker,
        customerId,
        amount,
        receiptNumber: String(
          providerResponse?.reference ||
            providerResponse?.data?.reference ||
            fundingReference
        ),
        provider,
        status: normaliseStatusResponse(providerResponse),
        raw: providerResponse,
      };
    } catch (error) {
      lastError = error;
      if (isTimeoutError(error)) {
        return {
          bookmaker: normalisedBookmaker,
          customerId,
          amount,
          receiptNumber: fundingReference,
          provider,
          status: 'pending',
          raw: {
            message: 'Provider timeout. Funding marked pending.',
          },
        };
      }

      if (index >= providers.length - 1) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function pollBettingFundingStatus({
  provider,
  receiptNumber,
  bookmaker,
  customerId,
}) {
  const normalisedBookmaker = sanitiseBookmaker(bookmaker);
  if (!normalisedBookmaker) {
    const error = new Error('Unsupported betting provider.');
    error.statusCode = 400;
    throw error;
  }

  if (shouldUseDemoVendor()) {
    return {
      bookmaker: normalisedBookmaker,
      customerId,
      provider: 'demo',
      receiptNumber,
      status: 'success',
      raw: { demo: true },
    };
  }

  const config = await getProviderConfig();
  const baseUrl = providerBaseUrl(provider, config);
  if (!baseUrl || provider === 'demo') {
    return {
      bookmaker: normalisedBookmaker,
      customerId,
      provider: provider || 'demo',
      receiptNumber,
      status: 'pending',
      raw: {},
    };
  }

  try {
    const providerResponse = await postBettingProvider(
      baseUrl,
      '/billpay/status',
      {
        reference: receiptNumber,
        biller: normalisedBookmaker,
        customerId,
      },
      provider
    );

    return {
      bookmaker: normalisedBookmaker,
      customerId,
      provider,
      receiptNumber,
      status: normaliseStatusResponse(providerResponse),
      raw: providerResponse,
    };
  } catch (error) {
    if (isTimeoutError(error)) {
      return {
        bookmaker: normalisedBookmaker,
        customerId,
        provider,
        receiptNumber,
        status: 'pending',
        raw: {
          message: 'Status check timed out.',
        },
      };
    }
    throw error;
  }
}

module.exports = {
  fundBettingWallet,
  pollBettingFundingStatus,
  SUPPORTED_BOOKMAKERS,
  verifyBettingAccount,
};
