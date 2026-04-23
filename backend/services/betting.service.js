'use strict';

const crypto = require('crypto');

const axios = require('axios');
const { executeWithProviderFailover } = require('./provider_failover.service');

function shouldUseDemoVendor() {
  return process.env.NODE_ENV !== 'production' && process.env.VENDING_DEMO !== 'false';
}

function providerBaseUrl(provider, config = {}) {
  const endpoints = config.endpoints || {};
  const fallback = {
    billpay: process.env.BILLPAY_BASE_URL || process.env.MONNIFY_BASE_URL || '',
    flutterwave:
      process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3',
    monnify: process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com',
  };

  const configured = {
    billpay: endpoints.billPayBaseUrl,
    flutterwave: endpoints.flutterwaveBaseUrl,
    monnify: endpoints.monnifyBaseUrl,
  };

  return String(configured[provider] || fallback[provider] || '').replace(/\/$/, '');
}

function providerAuthHeader(provider) {
  const token =
    provider === 'flutterwave'
      ? process.env.FLUTTERWAVE_SECRET_KEY
      : provider === 'monnify'
        ? process.env.MONNIFY_API_KEY
        : process.env.BILLPAY_API_KEY || process.env.FLUTTERWAVE_SECRET_KEY;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function reference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(2)
    .toString('hex')
    .toUpperCase()}`;
}

async function verifyBettingAccount(bookmaker, customerId) {
  if (shouldUseDemoVendor()) {
    return {
      bookmaker,
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
          bookmaker,
          customerId,
          customerName: 'BR9JA BETTING DEMO',
          provider: 'demo',
        };
      }

      const response = await axios.post(
        `${baseUrl}/billpay/validate`,
        { biller: bookmaker, customerId },
        {
          timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
          headers: {
            ...providerAuthHeader(provider),
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data?.data || response.data || {};
      return {
        bookmaker,
        customerId,
        customerName: data.customerName || data.name || '',
        provider,
        raw: response.data,
      };
    },
  });
}

async function fundBettingWallet(bookmaker, customerId, amount, phone) {
  if (shouldUseDemoVendor()) {
    return {
      bookmaker,
      customerId,
      amount,
      receiptNumber: reference('BET'),
      provider: 'demo',
      raw: {},
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'betting',
    attempt: async (provider, { config }) => {
      const baseUrl = providerBaseUrl(provider, config);
      if (provider === 'demo' || !baseUrl) {
        return {
          bookmaker,
          customerId,
          amount,
          receiptNumber: reference('BET'),
          provider: 'demo',
          raw: {},
        };
      }

      const response = await axios.post(
        `${baseUrl}/billpay/pay`,
        {
          reference: reference('BET'),
          biller: bookmaker,
          customerId,
          amount,
          phone,
        },
        {
          timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
          headers: {
            ...providerAuthHeader(provider),
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        bookmaker,
        customerId,
        amount,
        receiptNumber: String(
          response.data?.reference || response.data?.data?.reference || ''
        ),
        provider,
        raw: response.data,
      };
    },
  });
}

module.exports = {
  fundBettingWallet,
  verifyBettingAccount,
};
