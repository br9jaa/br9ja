'use strict';

const crypto = require('crypto');

const axios = require('axios');
const mongoose = require('mongoose');

const {
  SecurityEvent,
  Transaction,
  User,
  UserNotification,
} = require('../models');
const { grantConfiguredReward } = require('./br9_gold.service');
const { getProviderConfig } = require('./provider_config.service');
const { sendSendchampMessage, sendSendchampPush } = require('./sendchamp.service');
const {
  createTransactionAuditLog,
  enforceFundingVelocity,
  logSecurityIncident,
  readSiteConfigSnapshot,
  sendAdminEmergencyAlert,
  shouldRequireAdminFundingApproval,
  validateWebhookFundingAmount,
  withTransactionMutex,
} = require('./transaction_integrity.service');

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
  if (user?.isNameLocked || user?.fullNameLockedAt) {
    return String(user.fullName || user.bayrightTag || 'BR9ja User')
      .trim()
      .toUpperCase();
  }

  const phoneDigits = String(user?.phoneNumber || '')
    .replace(/\D/g, '')
    .slice(-11);
  return `BR9 - ${phoneDigits || 'USER'}`
    .trim()
    .toUpperCase();
}

function sanitiseVerifiedName(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function normaliseNameForMatch(value) {
  return sanitiseVerifiedName(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(source, target) {
  const left = String(source || '');
  const right = String(target || '');

  if (left === right) {
    return 0;
  }

  if (!left.length) {
    return right.length;
  }

  if (!right.length) {
    return left.length;
  }

  const grid = Array.from({ length: left.length + 1 }, (_, rowIndex) =>
    Array.from({ length: right.length + 1 }, (_item, columnIndex) =>
      rowIndex === 0 ? columnIndex : columnIndex === 0 ? rowIndex : 0
    )
  );

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      grid[row][column] = Math.min(
        grid[row - 1][column] + 1,
        grid[row][column - 1] + 1,
        grid[row - 1][column - 1] + cost
      );
    }
  }

  return grid[left.length][right.length];
}

function calculateNameSimilarity(leftValue, rightValue) {
  const left = normaliseNameForMatch(leftValue);
  const right = normaliseNameForMatch(rightValue);

  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  const leftTokens = left.split(' ').filter(Boolean);
  const rightTokens = right.split(' ').filter(Boolean);
  const shorterTokens =
    leftTokens.length <= rightTokens.length ? leftTokens : rightTokens;
  const longerTokens =
    leftTokens.length > rightTokens.length ? leftTokens : rightTokens;

  const containmentScore = shorterTokens.every((token) => longerTokens.includes(token))
    ? shorterTokens.length / Math.max(longerTokens.length, 1)
    : 0;

  const firstLastScore =
    leftTokens[0] === rightTokens[0] &&
    leftTokens[leftTokens.length - 1] === rightTokens[rightTokens.length - 1]
      ? 0.75
      : 0;

  const distance = levenshteinDistance(left, right);
  const lengthScore = 1 - distance / Math.max(left.length, right.length, 1);

  return Math.max(containmentScore, firstLastScore, lengthScore);
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
    provider: 'squad-demo',
    accountNumber,
    bankName: config.funding?.defaultBankLabel || 'GTBank',
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
    ).trim() || 'GTBank',
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

  if (shouldUseDemoFunding() || !apiKey || !baseUrl) {
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
      ...(beneficiaryAccount ? { beneficiary_account: beneficiaryAccount } : {}),
      ...(defaultBvn ? { bvn: defaultBvn } : {}),
      ...(defaultDob ? { dob: defaultDob } : {}),
      ...(defaultGender ? { gender: defaultGender } : {}),
      ...(defaultAddress ? { address: defaultAddress } : {}),
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

async function createVirtualAccountWithProvider(provider, user, config) {
  switch (provider) {
    case 'squad':
      return createSquadVirtualAccount(user, config);
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

  if (!user.phoneVerifiedAt) {
    return user;
  }

  if (user.virtualAccountNumber) {
    return user;
  }

  const config = await getProviderConfig();
  let account;
  let lastError;

  try {
    account = await createVirtualAccountWithProvider('squad', user, config);
  } catch (error) {
    lastError = error;
  }

  if (!account) {
    account = buildDemoVirtualAccount(user, 'squad', config);
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
      data.customerName ||
        data.customer_name ||
        data.senderName ||
        data.payerName ||
        data.originatorName ||
        data.originatorAccountName ||
        data.sourceAccountName ||
        ''
    ).trim(),
    customerEmail: String(
      data.customerEmail ||
        data.customer_email ||
        data.customer?.email ||
        data.email ||
        ''
    )
      .trim()
      .toLowerCase(),
    senderAccountNumber: String(
      data.senderAccountNumber ||
        data.sender_account_number ||
        data.sourceAccountNumber ||
        data.source_account_number ||
        data.originatorAccountNumber ||
        data.originator_account_number ||
        data.payerAccountNumber ||
        data.payer_account_number ||
        data.sourceAccountDetails?.accountNumber ||
        ''
    ).trim(),
    senderBankName: String(
      data.senderBankName ||
        data.sender_bank_name ||
        data.sourceBankName ||
        data.source_bank_name ||
        data.originatorBankName ||
        data.originator_bank_name ||
        data.sourceAccountDetails?.bankName ||
        ''
    ).trim(),
    raw: payload,
  };
}

function verifyDepositSignature({ headers, rawBody }) {
  const squadSecret =
    process.env.SQUAD_WEBHOOK_SECRET ||
    process.env.SQUAD_SECRET_KEY ||
    process.env.SQUAD_API_KEY ||
    '';
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

  return true;
}

async function settleWalletFunding({
  user,
  creditedAmount,
  senderName = '',
  note = 'Wallet funding',
  metadata = {},
  notificationTitle = 'Wallet Funded',
  notificationBody = '',
  verificationSource = 'transaction_success',
}) {
  const providerReference = String(
    metadata.providerReference || metadata.reference || ''
  ).trim();

  if (providerReference) {
    const duplicate = await Transaction.findOne({
      type: 'Deposit',
      'metadata.providerReference': providerReference,
    }).lean();

    if (duplicate) {
      return {
        duplicate: true,
        reference: duplicate.reference,
        transactionId: duplicate._id?.toString?.() || '',
        creditedAmount: Number(duplicate.amount || 0),
        balanceAfter: Number(duplicate.balanceAfter || user.balance || 0),
        newlyVerified: false,
        verifiedName: user.fullName,
      };
    }
  }

  const session = await mongoose.startSession();
  let result;
  let pushPayload = null;

  try {
    await session.withTransaction(async () => {
      const liveUser = await User.findById(user._id).session(session);
      if (!liveUser) {
        const error = new Error('User not found for wallet funding settlement.');
        error.statusCode = 404;
        throw error;
      }

      const verifiedName = sanitiseVerifiedName(senderName);
      const now = new Date();
      const newlyVerified = Boolean(
        verifiedName && !liveUser.isVerified
      );

      if (newlyVerified) {
        liveUser.fullName = verifiedName;
        liveUser.isVerified = true;
        liveUser.verifiedAt = now;
        liveUser.verifiedNameSource = verificationSource;
        liveUser.isNameLocked = true;
        liveUser.fullNameLockedAt = liveUser.fullNameLockedAt || now;
      }

      if (!liveUser.primaryFundingSourceAccountNumber && metadata.senderAccountNumber) {
        liveUser.primaryFundingSourceAccountNumber = String(
          metadata.senderAccountNumber || ''
        ).trim();
        liveUser.primaryFundingSourceBankName = String(
          metadata.senderBankName || ''
        ).trim();
        liveUser.primaryFundingSourceName =
          verifiedName || sanitiseVerifiedName(senderName);
        liveUser.primaryFundingSourceLinkedAt = now;
      }

      liveUser.balance = Number(liveUser.balance || 0) + Number(creditedAmount || 0);
      await liveUser.save({ session });

      const [transaction] = await Transaction.create(
        [
          {
            senderId: liveUser._id,
            userId: liveUser._id,
            receiverId: liveUser._id,
            senderName: verifiedName || senderName || 'Bank Transfer',
            receiverName: liveUser.fullName,
            amount: creditedAmount,
            type: 'Deposit',
            status: 'success',
            timestamp: now,
            reference: createReference('DEP'),
            note,
            balanceAfter: liveUser.balance,
            currency: 'NGN',
            metadata,
          },
        ],
        { session }
      );

      await createTransactionAuditLog({
        transactionId: transaction._id,
        userId: liveUser._id,
        step: 'wallet_credited',
        status: 'success',
        message: 'Funding webhook credited the user wallet successfully.',
        metadata: {
          providerReference,
          creditedAmount,
          verificationSource,
        },
        session,
      });

      const body =
        newlyVerified && verifiedName
          ? `Wallet Funded! Your profile is now verified as ${verifiedName}.`
          : notificationBody ||
            `₦${Number(creditedAmount || 0).toLocaleString()} has landed in your BR9ja wallet.`;

      const [notification] = await UserNotification.create(
        [
          {
            userId: liveUser._id,
            title: notificationTitle,
            body,
            type: newlyVerified ? 'verification' : 'deposit',
            status: 'queued',
            metadata: {
              transactionId: transaction._id.toString(),
              providerReference,
              ...metadata,
            },
          },
        ],
        { session }
      );

      pushPayload = {
        user: {
          id: liveUser._id.toString(),
          email: liveUser.email,
          phoneNumber: liveUser.phoneNumber,
        },
        title: notification.title,
        body: notification.body,
        data: {
          transactionId: transaction._id.toString(),
          providerReference,
        },
      };

      const firstFundingReward =
        liveUser.isVerified && Number(creditedAmount || 0) >= 1000
          ? await grantConfiguredReward({
              userId: liveUser._id,
              reason: 'first_deposit',
              note: 'First funding reward',
              session,
              metadata: {
                trigger: verificationSource,
                providerReference,
              },
            })
          : { granted: false, points: 0 };

      result = {
        duplicate: false,
        userId: liveUser._id.toString(),
        transactionId: transaction._id.toString(),
        reference: transaction.reference,
        creditedAmount: Number(creditedAmount || 0),
        balanceAfter: liveUser.balance,
        newlyVerified,
        verifiedName: liveUser.fullName,
        rewardGranted: firstFundingReward.granted ? firstFundingReward.points : 0,
      };
    });
  } finally {
    await session.endSession();
  }

  if (pushPayload) {
    sendSendchampPush(pushPayload).catch((error) => {
      console.warn('Sendchamp push failed for wallet funding.', error?.message || error);
    });

    const creditAlert = `Your BR9ja wallet has been credited with ₦${Number(
      result?.creditedAmount || 0
    ).toLocaleString()}. Current Balance: ₦${Number(
      result?.balanceAfter || 0
    ).toLocaleString()}.`;

    sendSendchampMessage({
      channel: 'sms',
      to: pushPayload.user.phoneNumber,
      message: creditAlert,
    }).catch((error) => {
      console.warn('Sendchamp SMS alert failed.', error?.message || error);
    });

    sendSendchampMessage({
      channel: 'whatsapp',
      to: pushPayload.user.phoneNumber,
      message: creditAlert,
    }).catch((error) => {
      console.warn('Sendchamp WhatsApp alert failed.', error?.message || error);
    });

    if (Number(result?.rewardGranted || 0) > 0) {
      sendSendchampMessage({
        channel: 'whatsapp',
        to: pushPayload.user.phoneNumber,
        message:
          'Welcome to the Bayright family! 🚀 Your Gold rewards are waiting.',
      }).catch((error) => {
        console.warn('Sendchamp first-funding welcome failed.', error?.message || error);
      });
    }
  }

  return result;
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
      ...(event.customerEmail ? [{ email: event.customerEmail }] : []),
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

  return withTransactionMutex(`funding:${event.providerReference || event.accountNumber}`, async () => {
    const amountCheck = await validateWebhookFundingAmount({
      userId: user._id,
      provider: event.provider,
      providerReference: event.providerReference,
      callbackAmount: event.grossAmount,
      metadata: {
        sourceUnit: payload?.data?.currency_unit || payload?.currency_unit || 'naira',
      },
    });

    if (!amountCheck.verified) {
      const error = new Error('Funding amount verification failed.');
      error.statusCode = 409;
      throw error;
    }

    const config = await getProviderConfig();
    const siteConfig = await readSiteConfigSnapshot();
    const providerFee = Math.round(
      event.grossAmount * (Number(config.funding.providerFeeBps || 0) / 10000)
    );
    const zeroFeeBalance = config.funding.zeroFeeBalance !== false;
    const creditedAmount = zeroFeeBalance
      ? event.grossAmount
      : Math.max(event.grossAmount - providerFee, 0);
    const operationalExpense = zeroFeeBalance ? providerFee : 0;
    const nameSimilarity = calculateNameSimilarity(event.payerName, user.fullName);
    const requiresManualReview =
      Boolean(user.isVerified) &&
      Boolean(event.payerName) &&
      nameSimilarity < 0.7;
    const highValueHold = shouldRequireAdminFundingApproval(
      creditedAmount,
      siteConfig.maxAutoFundLimit
    );

    if (requiresManualReview) {
      const [transaction, notification] = await Promise.all([
        Transaction.create({
          senderId: user._id,
          userId: user._id,
          receiverId: user._id,
          senderName: event.payerName || 'Bank Transfer',
          receiverName: user.fullName,
          amount: creditedAmount,
          type: 'Deposit',
          status: 'pending_review',
          timestamp: new Date(),
          reference: createReference('DEPREVIEW'),
          note: 'Deposit flagged for manual review due to funding name mismatch.',
          balanceAfter: Number(user.balance || 0),
          currency: 'NGN',
          metadata: {
            provider: event.provider,
            providerReference: event.providerReference,
            senderAccountNumber: event.senderAccountNumber,
            senderBankName: event.senderBankName,
            incomingSenderName: event.payerName,
            profileName: user.fullName,
            nameSimilarity,
            reviewReason: 'funding_name_mismatch',
          },
        }),
        UserNotification.create({
          userId: user._id,
          title: 'Deposit Under Review',
          body: 'We received a transfer, but the sender name did not match your locked profile. BR9ja support will review it before crediting your wallet.',
          type: 'security',
          status: 'queued',
          metadata: {
            providerReference: event.providerReference,
            nameSimilarity,
          },
        }),
        SecurityEvent.create({
          userId: user._id,
          email: user.email,
          bayrightTag: user.bayrightTag,
          eventType: 'funding_name_mismatch',
          severity: 'high',
          route: '/api/v1/webhooks/squad-settlement',
          method: 'POST',
          message: 'Incoming funding name did not match the locked account profile.',
          metadata: {
            provider: event.provider,
            providerReference: event.providerReference,
            incomingSenderName: event.payerName,
            profileName: user.fullName,
            senderAccountNumber: event.senderAccountNumber,
            senderBankName: event.senderBankName,
            nameSimilarity,
          },
        }),
      ]);

      await Promise.all([
        createTransactionAuditLog({
          transactionId: transaction._id,
          userId: user._id,
          step: 'funding_name_lock_review',
          status: 'warning',
          message: 'Incoming funding name failed the 70% similarity check and was queued for admin review.',
          metadata: {
            providerReference: event.providerReference,
            nameSimilarity,
          },
        }),
        logSecurityIncident({
          userId: user._id,
          transactionId: transaction._id,
          incidentType: 'funding-name-mismatch',
          severity: 'high',
          message: 'Future deposit name did not match the locked funding identity.',
          metadata: {
            providerReference: event.providerReference,
            incomingSenderName: event.payerName,
            profileName: user.fullName,
            nameSimilarity,
          },
        }),
      ]);

      sendSendchampPush({
        user: {
          id: user._id.toString(),
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        title: notification.title,
        body: notification.body,
        data: {
          transactionId: transaction._id.toString(),
          providerReference: event.providerReference,
          reviewReason: 'funding_name_mismatch',
        },
      }).catch((error) => {
        console.warn(
          'Sendchamp push failed for manual-review funding.',
          error?.message || error
        );
      });

      return {
        duplicate: false,
        manualReview: true,
        transactionId: transaction._id.toString(),
        reference: transaction.reference,
        creditedAmount: 0,
        balanceAfter: Number(user.balance || 0),
        newlyVerified: false,
        verifiedName: user.fullName,
        nameSimilarity,
      };
    }

    if (highValueHold) {
      const transaction = await Transaction.create({
        senderId: user._id,
        userId: user._id,
        receiverId: user._id,
        senderName: event.payerName || 'Bank Transfer',
        receiverName: user.fullName,
        amount: creditedAmount,
        type: 'Deposit',
        status: 'pending_admin_approval',
        timestamp: new Date(),
        reference: createReference('DEPHOLD'),
        note: 'Large deposit detected and queued for admin approval.',
        balanceAfter: Number(user.balance || 0),
        currency: 'NGN',
        metadata: {
          provider: event.provider,
          providerReference: event.providerReference,
          grossAmount: event.grossAmount,
          creditedAmount,
          senderAccountNumber: event.senderAccountNumber,
          senderBankName: event.senderBankName,
          incomingSenderName: event.payerName,
          approvalReason: 'high_value_deposit',
        },
      });

      await createTransactionAuditLog({
        transactionId: transaction._id,
        userId: user._id,
        step: 'high_value_hold',
        status: 'warning',
        message: 'Large deposit placed into pending admin approval.',
        metadata: {
          creditedAmount,
          maxAutoFundLimit: Number(siteConfig.maxAutoFundLimit || 0),
        },
      });

      await sendAdminEmergencyAlert(
        `🚨 BR9JA ALERT: High-value deposit (₦${creditedAmount.toLocaleString()}) by User ${user.bayrightTag || user.email}. Wallet has been frozen pending your approval.`
      ).catch(() => {});

      return {
        duplicate: false,
        manualReview: false,
        pendingApproval: true,
        transactionId: transaction._id.toString(),
        reference: transaction.reference,
        creditedAmount: 0,
        balanceAfter: Number(user.balance || 0),
        newlyVerified: false,
        verifiedName: user.fullName,
      };
    }

    const result = await settleWalletFunding({
      user,
      creditedAmount,
      senderName: event.payerName,
      note: `${event.provider.toUpperCase()} virtual account funding`,
      notificationTitle: 'Wallet Funded',
      verificationSource: 'squad_settlement',
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
        senderAccountNumber: event.senderAccountNumber,
        senderBankName: event.senderBankName,
      },
    });

    const velocity = await enforceFundingVelocity(user._id);
    if (velocity.flagged) {
      await sendAdminEmergencyAlert(
        `🚨 BR9JA ALERT: High funding velocity detected for ${user.bayrightTag || user.email}. ${velocity.count} deposits inside ${velocity.windowMinutes} minutes.`
      ).catch(() => {});
    }

    return {
      ...result,
      providerReference: event.providerReference,
      grossAmount: event.grossAmount,
      providerFee,
      operationalExpense,
    };
  });
}

module.exports = {
  creditDepositFromWebhook,
  ensureUserVirtualAccount,
  settleWalletFunding,
};
