'use strict';

const crypto = require('crypto');

const axios = require('axios');

const { TransportBooking } = require('../models');
const { executeWithProviderFailover } = require('./provider_failover.service');

function vtpassBaseUrl(config = {}) {
  return (
    config.endpoints?.vtpassBaseUrl ||
    process.env.VTPASS_BASE_URL ||
    'https://vtpass.com/api'
  ).replace(/\/$/, '');
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

function reference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(2)
    .toString('hex')
    .toUpperCase()}`;
}

function missingProviderCredentials(provider) {
  const error = new Error(`${provider} transport credentials are not configured.`);
  error.statusCode = 503;
  return error;
}

async function verifyLccAccount(accountID) {
  if (shouldUseDemoVendor()) {
    return {
      accountID,
      customerName: 'ADEOLA LCC DRIVER',
      currentBalance: 4200,
      provider: 'demo',
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'transport',
    attempt: async (provider, { config }) => {
      if (provider === 'demo') {
        return {
          accountID,
          customerName: 'ADEOLA LCC DRIVER',
          currentBalance: 4200,
          provider: 'demo',
        };
      }

      if (provider !== 'vtpass' || !hasVtpassCredentials()) {
        throw missingProviderCredentials(provider);
      }

      const response = await axios.post(
        `${vtpassBaseUrl(config)}/merchant-verify`,
        {
          billersCode: accountID,
          serviceID: process.env.VTPASS_LCC_SERVICE_ID || 'lcc',
        },
        {
          timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
          headers: vtpassHeaders(),
        }
      );
      const content = response.data?.content || response.data?.data || response.data || {};

      return {
        accountID,
        customerName: content.Customer_Name || content.customerName || content.name || '',
        currentBalance: Number(content.balance || content.currentBalance || 0),
        provider: 'vtpass',
        raw: response.data,
      };
    },
  });
}

async function topupLcc(accountID, amount, phone) {
  if (shouldUseDemoVendor()) {
    return {
      accountID,
      receiptNumber: reference('LCC'),
      amount,
      provider: 'demo',
      raw: {},
    };
  }

  return executeWithProviderFailover({
    serviceKey: 'transport',
    attempt: async (provider, { config }) => {
      if (provider === 'demo') {
        return {
          accountID,
          receiptNumber: reference('LCC'),
          amount,
          provider: 'demo',
          raw: {},
        };
      }

      if (provider !== 'vtpass' || !hasVtpassCredentials()) {
        throw missingProviderCredentials(provider);
      }

      const response = await axios.post(
        `${vtpassBaseUrl(config)}/pay`,
        {
          request_id: reference('LCC'),
          serviceID: process.env.VTPASS_LCC_SERVICE_ID || 'lcc',
          billersCode: accountID,
          amount,
          phone,
        },
        {
          timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
          headers: vtpassHeaders(),
        }
      );

      return {
        accountID,
        receiptNumber: String(
          response.data?.requestId ||
            response.data?.content?.receiptNumber ||
            response.data?.content?.transactionId ||
            ''
        ),
        amount,
        provider: 'vtpass',
        raw: response.data,
      };
    },
  });
}

async function requestBusTicket(userId, details) {
  const booking = await TransportBooking.create({
    userId,
    departure: details.departure,
    destination: details.destination,
    travelDate: details.travelDate,
    operator: details.operator,
    passengerName: details.passengerName,
    phone: details.phone,
    reference: reference('BUS'),
    status: 'pending',
    adminNotifiedAt: new Date(),
  });

  return {
    id: booking._id.toString(),
    reference: booking.reference,
    status: booking.status,
    departure: booking.departure,
    destination: booking.destination,
    travelDate: booking.travelDate,
    operator: booking.operator,
  };
}

module.exports = {
  requestBusTicket,
  topupLcc,
  verifyLccAccount,
};
