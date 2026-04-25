'use strict';

const crypto = require('crypto');

const { TransportBooking } = require('../models');
const { executeWithProviderFailover } = require('./provider_failover.service');
const {
  hasVTpassCredentials,
  normaliseVTpassStatus,
  payService,
  verifyMerchant,
} = require('./vtpass.service');

function shouldUseDemoVendor() {
  return process.env.NODE_ENV !== 'production' && process.env.VENDING_DEMO !== 'false';
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

      if (provider !== 'vtpass' || !hasVTpassCredentials()) {
        throw missingProviderCredentials(provider);
      }

      const response = await verifyMerchant(
        {
          billersCode: accountID,
          serviceID: process.env.VTPASS_LCC_SERVICE_ID || 'lcc',
        },
        { config }
      );
      const content = response?.content || response?.data || response || {};

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

      if (provider !== 'vtpass' || !hasVTpassCredentials()) {
        throw missingProviderCredentials(provider);
      }

      const response = await payService(
        {
          serviceID: process.env.VTPASS_LCC_SERVICE_ID || 'lcc',
          billersCode: accountID,
          requestId: reference('LCC'),
          amount,
          phone,
        },
        { config }
      );

      return {
        accountID,
        status: normaliseVTpassStatus(
          response?.content?.status ||
            response?.code ||
            response?.response_description ||
            response?.message,
          'success'
        ),
        receiptNumber: String(
          response?.requestId ||
            response?.content?.receiptNumber ||
            response?.content?.transactionId ||
            ''
        ),
        amount,
        provider: 'vtpass',
        raw: response,
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
