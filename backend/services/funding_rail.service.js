'use strict';

const crypto = require('crypto');

const axios = require('axios');
const mongoose = require('mongoose');

const { Transaction, User, UserNotification } = require('../models');
const { getProviderConfig } = require('./provider_config.service');
const { shouldFailover } = require('./provider_failover.service');

function createReference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;
}

function shouldUseDemoFunding() {
  return process.env.NODE_ENV !== 'production' && process.env.FUNDING_DEMO !== 'false';
}

function stableDigits(value, length = 10) {
  return crypto
    .createHash('sha256')
    .update(String(value || Date.now()))
    .digest('hex')
    .replace(/[a-f]/g, (char) => String(char.charCodeAt(0) % 10))
    .slice(0, length)
    .padStart(length, '0');
}

function accountNameForUser(user) {
  return String(user.bayrightTag || user.fullName || 'BR9ja User')
    .trim()
    .toUpperCase();
}

function splitName(fullName) {
  const parts = String(fullName || 'BR9ja User')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return {
    firstName: parts[0] || 'BR9ja',
    lastName: parts.slice(1).join(' ') || 'User',
  };
}

function buildDemoVirtualAccount(user, provider = 'squad', config = {}) {
  const accountNumber = stableDigits(user._id || user.email || user.phoneNumber);
  return {
    provider: `${provider}-demo`,
    accountNumber,
    bankName:
      provider === 'monnify'
        ? 'Providus Bank'
        : config.funding?.defaultBankLabel || 'GTBank',
    accountName: accountNameForUser(user),
    reference: `BR9VA-${String(user._id)}`,
    status: 'provisional',
    raw: {},
  };
}

function normaliseVirtualAccount(payload, provider, user) {
  const data = payload?.data || payload?.responseBody || payload?.response || payload || {};
  const firstAccount = Array.isArray(data.accounts) ? data.accounts[0] : null;
  const accountNumber = String(
    data.account_number ||
      data.accountNumber ||
      data.virtual_account_number ||
      data.virtualAccountNumber ||
      firstAccount?.accountNumber ||
      ''
  ).trim();

  if (!accountNumber) {
    const error = new Error(`${provider} did not return a virtual account number.`);
    error.statusCode = 502;
    throw error;
  }

  return {
    provider,
    accountNumber,
    bankName: String(
      data.bank_name ||
        data.bankName ||
        data.bank ||
        firstAccount?.bankName ||
        ''
    ).trim() || (provider === 'squad' ? 'GTBank' : 'Providus Bank'),
    accountName: String(
      data.account_name ||
        data.accountName ||
        data.account_name_enquiry ||
        firstAccount?.accountName ||
        accountNameForUser(user)
    ).trim(),
    reference: String(
      data.customer_identifier ||
        data.customerIdentifier ||
        data.accountReference ||
        data.reservedAccountReference ||
        `BR9VA-${String(user._id)}`
    ).trim(),
    status: 'active',
    raw: payload,
  };
}

async function createSquadVirtualAccount(user, config) {
  const apiKey = process.env.SQUAD_SECRET_KEY || process.env.SQUAD_API_KEY;
  const baseUrl = String(config.endpoints?.squadBaseUrl || '').replace(/\/$/, '');
  const defaultBvn = process.env.SQUAD_DEFAULT_BVN || '';
  const defaultDob = process.env.SQUAD_DEFAULT_DOB || '';
  const defaultGender = process.env.SQUAD_DEFAULT_GENDER || '';
  const defaultAddress = process.env.SQUAD_DEFAULT_ADDRESS || '';
  const beneficiaryAccount = process.env.SQUAD_BENEFICIARY_ACCOUNT || '';

  if (
    shouldUseDemoFunding() ||
    !apiKey ||
    !baseUrl ||
    !defaultBvn ||
    !defaultDob ||
    !defaultGender ||
    !defaultAddress ||
    !beneficiaryAccount
  ) {
    return buildDemoVirtualAccount(user, 'squad', config);
  }

  const { firstName, lastName } = splitName(user.fullName);
  const response = await axios.post(
    `${baseUrl}/virtual-account`,
    {
      customer_identifier: String(user._id),
      first_name: firstName,
      last_name: lastName,
      mobile_num: user.phoneNumber,
      email: user.email,
      account_name: accountNameForUser(user),
      beneficiary_account: beneficiaryAccount,
      bvn: defaultBvn,
      dob: defaultDob,
      gender: defaultGender,
      address: defaultAddress,
    },
    {
      timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return normaliseVirtualAccount(response.data, 'squad', user);
}

async function getMonnifyToken(config) {
  const apiKey = process.env.MONNIFY_API_KEY || '';
  const secretKey = process.env.MONNIFY_SECRET_KEY || '';
  const baseUrl = String(config.endpoints?.monnifyBaseUrl || '').replace(/\/$/, '');

  if (!apiKey || !secretKey || !baseUrl) {
    const error = new Error('Monnify credentials are not configured.');
    error.statusCode = 503;
    throw error;
  }

  const response = await axios.post(
    `${baseUrl}/api/v1/auth/login`,
    {},
    {
      timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
      auth: {
        username: apiKey,
        password: secretKey,
      },
    }
  );

  return response.data?.responseBody?.accessToken || response.data?.accessToken || '';
}

async function createMonnifyVirtualAccount(user, config) {
  const baseUrl = String(config.endpoints?.monnifyBaseUrl || '').replace(/\/$/, '');
  const contractCode = process.env.MONNIFY_CONTRACT_CODE || '';

  if (shouldUseDemoFunding() || !baseUrl || !contractCode) {
    return buildDemoVirtualAccount(user, 'monnify', config);
  }

  const accessToken = await getMonnifyToken(config);
  if (!accessToken) {
    const error = new Error('Monnify did not return an access token.');
    error.statusCode = 502;
    throw error;
  }

  const response = await axios.post(
    `${baseUrl}/api/v2/bank-transfer/reserved-accounts`,
    {
      accountReference: `BR9VA-${String(user._id)}`,
      accountName: accountNameForUser(user),
      currencyCode: 'NGN',
      contractCode,
      customerEmail: user.email,
      customerName: user.fullName,
      getAllAvailableBanks: false,
      preferredBanks: ['058', '101'],
      ...(process.env.MONNIFY_DEFAULT_BVN
        ? { bvn: process.env.MONNIFY_DEFAULT_BVN }
        : {}),
      ...(process.env.MONNIFY_DEFAULT_NIN
        ? { nin: process.env.MONNIFY_DEFAULT_NIN }
        : {}),
    },
    {
      timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return normaliseVirtualAccount(response.data, 'monnify', user);
}

async function createVirtualAccountWithProvider(provider, user, config) {
  switch (provider) {
    case 'squad':
      return createSquadVirtualAccount(user, config);
    case 'monnify':
      return createMonnifyVirtualAccount(user, config);
    case 'demo':
      return buildDemoVirtualAccount(user, 'demo', config);
    default: {
      const error = new Error(`${provider} cannot create virtual accounts yet.`);
      error.statusCode = 501;
      throw error;
    }
  }
}

async function ensureUserVirtualAccount(userOrId) {
  const user =
    typeof userOrId === 'string' || userOrId instanceof mongoose.Types.ObjectId
      ? await User.findById(userOrId)
      : userOrId;

  if (!user) {
    return null;
  }

  if (user.virtualAccountNumber) {
    return user;
  }

  const config = await getProviderConfig();
  const providers = [config.funding.primaryProvider];
  if (
    config.funding.backupProvider &&
    config.funding.backupProvider !== config.funding.primaryProvider
  ) {
    providers.push(config.funding.backupProvider);
  }
  providers.push('demo');

  let account;
  let lastError;
  for (const provider of [...new Set(providers)]) {
    try {
      account = await createVirtualAccountWithProvider(provider, user, config);
      break;
    } catch (error) {
      lastError = error;
      if (!shouldFailover(error)) {
        break;
      }
    }
  }

  if (!account) {
    account = buildDemoVirtualAccount(user, config.funding.primaryProvider, config);
    account.raw = { fallbackReason: lastError?.message || 'unknown' };
  }

  user.accountNumber = account.accountNumber;
  user.virtualAccountNumber = account.accountNumber;
  user.virtualAccountBankName = account.bankName;
  user.virtualAccountName = account.accountName;
  user.virtualAccountProvider = account.provider;
  user.virtualAccountReference = account.reference;
  user.virtualAccountStatus = account.status;
  user.virtualAccountAssignedAt = new Date();
  await user.save();

  return user;
}

function extractDepositPayload(payload = {}, headers = {}) {
  const data = payload.data || payload.eventData || payload.responseBody || payload;
  const provider = String(
    payload.provider ||
      data.provider ||
      (headers['x-squad-signature'] ? 'squad' : '') ||
      (headers['monnify-signature'] ? 'monnify' : '') ||
      'unknown'
  ).toLowerCase();

  const grossAmount = Number(
    data.amount ||
      data.amountPaid ||
      data.amount_paid ||
      data.amountReceived ||
      data.amount_received ||
      data.transactionAmount ||
      data.settlementAmount ||
      0
  );

  return {
    provider,
    grossAmount,
    providerReference: String(
      data.transactionReference ||
        data.transaction_reference ||
        data.paymentReference ||
        data.payment_reference ||
        data.reference ||
        data.sessionId ||
        data.id ||
        createReference('DEPREF')
    ).trim(),
    accountNumber: String(
      data.virtualAccountNumber ||
        data.virtual_account_number ||
        data.accountNumber ||
        data.account_number ||
        data.destinationAccountNumber ||
        data.destination_account_number ||
        data.destinationAccountInformation?.accountNumber ||
        ''
    ).trim(),
    accountReference: String(
      data.customerIdentifier ||
        data.customer_identifier ||
        data.accountReference ||
        data.account_reference ||
        data.reservedAccountReference ||
        data.reserved_account_reference ||
        ''
    ).trim(),
    payerName: String(
      data.senderName ||
        data.payerName ||
        data.originatorName ||
        data.originatorAccountName ||
        data.sourceAccountName ||
        ''
    ).trim(),
    raw: payload,
  };
}

function verifyDepositSignature({ headers, rawBody }) {
  const squadSecret = process.env.SQUAD_WEBHOOK_SECRET || '';
  const squadSignature = headers['x-squad-signature'];
  if (squadSecret && squadSignature) {
    const digest = crypto
      .createHmac('sha512', squadSecret)
      .update(rawBody || '')
      .digest('hex');
    if (digest.length !== String(squadSignature).length) {
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(String(squadSignature))
    );
  }

  const monnifySecret = process.env.MONNIFY_WEBHOOK_SECRET || '';
  const monnifySignature = headers['monnify-signature'];
  if (monnifySecret && monnifySignature) {
    const digest = crypto
      .createHmac('sha512', monnifySecret)
      .update(rawBody || '')
      .digest('hex');
    if (digest.length !== String(monnifySignature).length) {
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(String(monnifySignature))
    );
  }

  return true;
}

async function creditDepositFromWebhook({ payload, headers = {}, rawBody = '' }) {
  if (!verifyDepositSignature({ headers, rawBody })) {
    const error = new Error('Invalid deposit webhook signature.');
    error.statusCode = 401;
    throw error;
  }

  const event = extractDepositPayload(payload, headers);
  if (!Number.isFinite(event.grossAmount) || event.grossAmount <= 0) {
    const error = new Error('Webhook payload did not include a valid deposit amount.');
    error.statusCode = 400;
    throw error;
  }

  const lookup = {
    $or: [
      ...(event.accountReference
        ? [{ virtualAccountReference: event.accountReference }]
        : []),
      ...(event.accountNumber
        ? [
            { virtualAccountNumber: event.accountNumber },
            { accountNumber: event.accountNumber },
          ]
        : []),
    ],
  };

  if (!lookup.$or.length) {
    const error = new Error('Webhook payload did not include a deposit account reference.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne(lookup);
  if (!user) {
    const error = new Error('No user is linked to that virtual account.');
    error.statusCode = 404;
    throw error;
  }

  const duplicate = await Transaction.findOne({
    type: 'Deposit',
    'metadata.providerReference': event.providerReference,
  }).lean();

  if (duplicate) {
    return {
      duplicate: true,
      reference: duplicate.reference,
      creditedAmount: Number(duplicate.amount || 0),
      balanceAfter: Number(duplicate.balanceAfter || user.balance || 0),
    };
  }

  const config = await getProviderConfig();
  const providerFee = Math.round(
    event.grossAmount * (Number(config.funding.providerFeeBps || 0) / 10000)
  );
  const zeroFeeBalance = config.funding.zeroFeeBalance !== false;
  const creditedAmount = zeroFeeBalance
    ? event.grossAmount
    : Math.max(event.grossAmount - providerFee, 0);
  const operationalExpense = zeroFeeBalance ? providerFee : 0;

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      user.balance = Number(user.balance || 0) + creditedAmount;
      await user.save({ session });

      const [transaction] = await Transaction.create(
        [
          {
            senderId: user._id,
            userId: user._id,
            receiverId: user._id,
            senderName: event.payerName || 'Bank Transfer',
            receiverName: user.fullName,
            amount: creditedAmount,
            type: 'Deposit',
            status: 'success',
            timestamp: new Date(),
            reference: createReference('DEP'),
            note: `${event.provider.toUpperCase()} virtual account funding`,
            balanceAfter: user.balance,
            currency: 'NGN',
            metadata: {
              provider: event.provider,
              providerReference: event.providerReference,
              grossAmount: event.grossAmount,
              creditedAmount,
              providerFee,
              operationalExpense,
              zeroFeeBalance,
              accountNumber: event.accountNumber,
              accountReference: event.accountReference,
            },
          },
        ],
        { session }
      );

      await UserNotification.create(
        [
          {
            userId: user._id,
            title: 'Deposit Received',
            body: `₦${creditedAmount.toLocaleString()} has landed in your BR9ja wallet.`,
            type: 'deposit',
            status: 'queued',
            metadata: {
              transactionId: transaction._id.toString(),
              providerReference: event.providerReference,
            },
          },
        ],
        { session }
      );

      result = {
        duplicate: false,
        userId: user._id.toString(),
        reference: transaction.reference,
        providerReference: event.providerReference,
        grossAmount: event.grossAmount,
        creditedAmount,
        providerFee,
        operationalExpense,
        balanceAfter: user.balance,
      };
    });
  } finally {
    await session.endSession();
  }

  return result;
}

module.exports = {
  creditDepositFromWebhook,
  ensureUserVirtualAccount,
};
