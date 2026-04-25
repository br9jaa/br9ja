'use strict';

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const axios = require('axios');
const mongoose = require('mongoose');

const {
  AppSetting,
  GovernmentPayment,
  SecurityIncident,
  SecurityEvent,
  Transaction,
  TransactionAuditLog,
  UtilityTransaction,
  User,
  UserNotification,
} = require('../models');
const { checkClubkonnectBalance, requeryClubkonnectTransaction } = require('./clubkonnect.service');
const { grantReward } = require('./br9_gold.service');
const { sendSendchampMessage } = require('./sendchamp.service');
const { sendSiteMail } = require('./site_mailer.service');
const { checkVTpassBalance, requeryVTpassTransaction } = require('./vtpass.service');

const SITE_CONFIG_PATH = path.join(__dirname, '..', '..', 'br9', 'config', 'config.json');
const DEFAULT_MAX_AUTO_FUND_LIMIT = Number(process.env.MAX_AUTO_FUND_LIMIT || 20000);
const DEFAULT_VELOCITY_WINDOW_MINUTES = Number(process.env.FUNDING_VELOCITY_WINDOW_MINUTES || 5);
const DEFAULT_VELOCITY_LIMIT = Number(process.env.FUNDING_VELOCITY_LIMIT || 3);
const PROVIDER_HEALTH_KEY = 'provider_health_snapshot';
const NIGHTLY_RECONCILIATION_KEY = 'nightly_reconciliation_report';

const transactionLocks = new Map();

function reference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(2)
    .toString('hex')
    .toUpperCase()}`;
}

function toAmount(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundCurrency(amount) {
  return Math.round((toAmount(amount) + Number.EPSILON) * 100) / 100;
}

function formatPaymentAmount(amount, sourceUnit = 'naira') {
  const numeric = toAmount(amount, 0);
  if (sourceUnit === 'kobo') {
    return roundCurrency(numeric / 100);
  }
  return roundCurrency(numeric);
}

function normaliseProviderStatus(rawStatus = '') {
  const safe = String(rawStatus || '').trim().toLowerCase();
  if (['success', 'successful', 'completed', 'paid', 'delivered'].includes(safe)) {
    return 'success';
  }
  if (['failed', 'error', 'reversed', 'cancelled', 'declined', 'out_of_stock'].includes(safe)) {
    return 'failed';
  }
  if (
    ['pending', 'processing', 'queued', 'in_progress', 'verify', 'requerying'].includes(safe) ||
    safe.includes('timeout') ||
    safe.includes('processing')
  ) {
    return 'pending_verification';
  }
  return safe ? 'pending_verification' : 'pending';
}

function shouldTreatAsPendingVerification(error) {
  if (!error) {
    return false;
  }

  const status = Number(error.response?.status || error.statusCode || 0);
  const message = String(error.message || '').toLowerCase();
  const code = String(error.code || '').trim().toUpperCase();

  return (
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('processing') ||
    message.includes('pending') ||
    message.includes('network delay') ||
    status === 408 ||
    status === 504
  );
}

function referenceId(prefix) {
  return `BR9-${String(prefix || 'TXN')
    .replace(/[^A-Z0-9]+/gi, '')
    .toUpperCase()
    .slice(0, 6)}-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(2)
    .toString('hex')
    .toUpperCase()}`;
}

async function readSiteConfigSnapshot() {
  try {
    const raw = await fs.readFile(SITE_CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (_error) {
    return {};
  }
}

async function createTransactionAuditLog({
  transactionId,
  userId = null,
  step,
  status = 'info',
  message,
  metadata = {},
  session = null,
}) {
  if (!transactionId || !step || !message) {
    return null;
  }

  const payload = {
    transactionId,
    userId,
    step,
    status,
    message,
    metadata,
  };

  return TransactionAuditLog.create([payload], session ? { session } : undefined).then(
    (rows) => rows[0]
  );
}

async function createPendingVerificationTransaction({
  userId,
  senderName = '',
  receiverName = '',
  amount = 0,
  type,
  reference = '',
  note = '',
  metadata = {},
  session = null,
}) {
  const user =
    userId && !senderName
      ? await User.findById(userId).select('fullName balance').session(session || null)
      : null;

  const [transaction] = await Transaction.create(
    [
      {
        senderId: userId,
        userId,
        senderName: senderName || user?.fullName || 'BR9ja User',
        receiverName,
        amount: roundCurrency(amount),
        type,
        status: 'pending_verification',
        timestamp: new Date(),
        reference: reference || referenceId(type || 'TXN'),
        note,
        balanceAfter: Number(user?.balance || 0),
        currency: 'NGN',
        metadata: {
          walletDebited: false,
          statusMessage:
            'Network delay detected. Provider confirmation is still in progress.',
          ...metadata,
        },
      },
    ],
    session ? { session } : undefined
  );

  await createTransactionAuditLog({
    transactionId: transaction._id,
    userId: userId || null,
    step: 'pending_verification',
    status: 'pending',
    message:
      'Provider delivery is still being verified. Wallet has not been debited yet.',
    metadata: {
      provider: metadata.provider || '',
      providerReference: metadata.providerReference || '',
      walletDebited: false,
    },
    session,
  });

  return transaction;
}

async function resolveWithProvider(transaction) {
  const provider = String(transaction?.metadata?.provider || '').trim().toLowerCase();
  const metadata = transaction?.metadata || {};

  if (!provider) {
    return {
      provider,
      status: 'pending',
      br9Status: 'STILL_PROCESSING',
      raw: {},
    };
  }

  let result = {
    provider,
    status: 'pending',
    raw: {},
  };

  switch (true) {
    case provider.includes('clubkonnect'): {
      const orderId = String(
        metadata.orderId ||
          metadata.providerReference ||
          metadata.receiptNumber ||
          transaction?.reference ||
          ''
      ).trim();
      result = await requeryClubkonnectTransaction(orderId);
      break;
    }
    case provider.includes('vtpass'): {
      const requestId = String(
        metadata.requestId ||
          metadata.providerReference ||
          metadata.receiptNumber ||
          transaction?.reference ||
          ''
      ).trim();
      result = await requeryVTpassTransaction(requestId);
      break;
    }
    default:
      break;
  }

  const normalisedStatus = normaliseProviderStatus(result.status);
  return {
    ...result,
    status: normalisedStatus,
    br9Status:
      normalisedStatus === 'success'
        ? 'SUCCESS'
        : normalisedStatus === 'failed'
          ? 'FAILED'
          : 'STILL_PROCESSING',
  };
}

async function queuePendingReviewNotification(transaction, reason) {
  if (!transaction?.userId) {
    return;
  }

  await UserNotification.create({
    userId: transaction.userId,
    title: 'Verification In Progress',
    body:
      reason ||
      "We're double-checking your delivery with the network provider. Hang tight!",
    type: 'transaction_pending_review',
    status: 'queued',
    metadata: {
      transactionId: transaction._id.toString(),
      reference: transaction.reference,
      status: transaction.status,
    },
  }).catch(() => {});
}

async function queueReceiptUpdateEmail(transactionId, reason = 'pending_resolved') {
  const transaction = await Transaction.findById(transactionId).lean();
  if (!transaction || String(transaction.status || '').toLowerCase() !== 'success') {
    return null;
  }

  const user = await User.findById(transaction.userId).lean();
  if (!user?.email) {
    return null;
  }

  const siteConfig = await readSiteConfigSnapshot();
  const siteUrl = String(siteConfig.siteUrl || '').replace(/\/$/, '');
  const receiptPath = `/api/v1/transactions/receipt/${transaction._id.toString()}`;
  const receiptUrl = siteUrl ? `${siteUrl}${receiptPath}` : receiptPath;
  return sendSiteMail({
    to: user.email,
    subject: `BR9ja Receipt • ${transaction.reference}`,
    text: [
      `Service: ${transaction.type}`,
      `Reference: ${transaction.reference}`,
      `Amount: ₦${roundCurrency(transaction.amount || 0).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      `Status: ${String(transaction.status || '').toUpperCase()}`,
      `Receipt: ${receiptUrl}`,
      reason === 'pending_resolved'
        ? 'This receipt was generated automatically the moment your pending transaction cleared.'
        : 'This receipt was generated automatically after transaction success.',
    ].join('\n'),
    html: `
      <h2>BR9ja Receipt Ready</h2>
      <p><strong>Service:</strong> ${transaction.type}</p>
      <p><strong>Reference:</strong> ${transaction.reference}</p>
      <p><strong>Amount:</strong> ₦${roundCurrency(transaction.amount || 0).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}</p>
      <p><strong>Status:</strong> ${String(transaction.status || '').toUpperCase()}</p>
      <p><a href="${receiptUrl}">Download your receipt</a></p>
      <p>${
        reason === 'pending_resolved'
          ? 'Your pending transaction just cleared, so we generated this receipt automatically.'
          : 'Your receipt is ready.'
      }</p>
    `,
    meta: {
      kind: 'transaction-receipt',
      transactionId: transaction._id.toString(),
      reason,
    },
  }).catch(() => null);
}

async function maybeGrantPatienceBonus(transactionId) {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction || !transaction.userId) {
    return false;
  }

  if (transaction.metadata?.patienceBonusGranted) {
    return false;
  }

  if (String(transaction.status || '').toLowerCase() !== 'success') {
    return false;
  }

  await grantReward({
    userId: transaction.userId,
    reason: 'pending_patience_bonus',
    points: 10,
    note: 'Patience bonus for waiting through provider verification.',
    metadata: {
      trigger: 'pending_verification_success',
      transactionId: transaction._id.toString(),
      reference: transaction.reference,
    },
  }).catch(() => null);

  transaction.metadata = {
    ...(transaction.metadata || {}),
    patienceBonusGranted: true,
    patienceBonusGrantedAt: new Date(),
  };
  await transaction.save();
  return true;
}

async function updateLinkedServiceRecord(transaction, status, extraFields = {}, session = null) {
  const serviceRecordType = String(transaction?.metadata?.serviceRecordType || '')
    .trim()
    .toLowerCase();
  const serviceRecordId = String(transaction?.metadata?.serviceRecordId || '').trim();

  if (!serviceRecordType || !serviceRecordId) {
    return;
  }

  if (serviceRecordType === 'utility') {
    await UtilityTransaction.findByIdAndUpdate(
      serviceRecordId,
      {
        $set: {
          status,
          ...(extraFields.receiptNumber ? { receiptNumber: extraFields.receiptNumber } : {}),
          ...(extraFields.providerResponse
            ? { providerResponse: extraFields.providerResponse }
            : {}),
          ...(extraFields.token ? { token: extraFields.token } : {}),
          ...(extraFields.nextRenewalDate
            ? { nextRenewalDate: extraFields.nextRenewalDate }
            : {}),
        },
      },
      session ? { session } : undefined
    );
    return;
  }

  if (serviceRecordType === 'government') {
    await GovernmentPayment.findByIdAndUpdate(
      serviceRecordId,
      {
        $set: {
          status: status === 'success' ? 'paid' : status,
          ...(extraFields.receiptNumber
            ? { providerReference: extraFields.receiptNumber }
            : {}),
          ...(status === 'success' ? { paidAt: new Date() } : {}),
        },
      },
      session ? { session } : undefined
    );
  }
}

async function logSecurityIncident({
  userId = null,
  transactionId = null,
  incidentType,
  severity = 'high',
  message,
  metadata = {},
  freezeUser = false,
  session = null,
}) {
  if (!incidentType || !message) {
    return null;
  }

  const [incident] = await SecurityIncident.create(
    [
      {
        userId,
        transactionId,
        incidentType,
        severity,
        message,
        metadata,
      },
    ],
    session ? { session } : undefined
  );

  await SecurityEvent.create(
    [
      {
        userId,
        eventType: incidentType,
        severity,
        message,
        metadata,
      },
    ],
    session ? { session } : undefined
  );

  if (freezeUser && userId) {
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isFrozen: true,
          isBlacklisted: true,
          freezeReason: message,
          fundingSuspendedUntil: new Date(Date.now() + 60 * 60 * 1000),
          fundingSuspendedReason: message,
          frozenAt: new Date(),
        },
      },
      session ? { session } : undefined
    );
  }

  return incident;
}

async function withTransactionMutex(lockKey, worker) {
  const safeKey = String(lockKey || '').trim();
  if (!safeKey) {
    return worker();
  }

  const previous = transactionLocks.get(safeKey) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  transactionLocks.set(safeKey, previous.then(() => current));

  await previous;
  try {
    return await worker();
  } finally {
    release();
    if (transactionLocks.get(safeKey) === current) {
      transactionLocks.delete(safeKey);
    }
  }
}

async function fetchSquadVerifiedTransaction(providerReference) {
  const apiKey = process.env.SQUAD_SECRET_KEY || process.env.SQUAD_API_KEY || '';
  const baseUrl = String(process.env.SQUAD_VERIFY_BASE_URL || process.env.SQUAD_BASE_URL || '')
    .replace(/\/$/, '');

  if (!providerReference || !apiKey || !baseUrl) {
    return {
      verified: false,
      amount: null,
      raw: {},
    };
  }

  const url = process.env.SQUAD_VERIFY_TRANSACTION_URL
    ? process.env.SQUAD_VERIFY_TRANSACTION_URL.replace(':reference', encodeURIComponent(providerReference))
    : `${baseUrl}/transactions/verify/${encodeURIComponent(providerReference)}`;

  const response = await axios.get(url, {
    timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  const data = response.data?.data || response.data || {};
  const amount = formatPaymentAmount(
    data.amount || data.transactionAmount || data.amount_paid || 0,
    String(data.currency_unit || '').toLowerCase() === 'kobo' ? 'kobo' : 'naira'
  );

  return {
    verified: true,
    amount,
    raw: response.data,
  };
}

async function validateWebhookFundingAmount({
  userId = null,
  provider = 'squad',
  providerReference = '',
  callbackAmount = 0,
  metadata = {},
}) {
  const safeCallbackAmount = formatPaymentAmount(callbackAmount, metadata.sourceUnit || 'naira');
  if (provider !== 'squad') {
    return {
      verified: true,
      callbackAmount: safeCallbackAmount,
      apiAmount: safeCallbackAmount,
      provider,
      reason: 'provider-verification-not-required',
    };
  }

  try {
    const verification = await fetchSquadVerifiedTransaction(providerReference);
    if (!verification.verified || verification.amount === null) {
      return {
        verified: true,
        callbackAmount: safeCallbackAmount,
        apiAmount: safeCallbackAmount,
        provider,
        reason: 'provider-verification-unavailable',
      };
    }

    const match = roundCurrency(verification.amount) === roundCurrency(safeCallbackAmount);
    if (!match && userId) {
      await logSecurityIncident({
        userId,
        incidentType: 'funding-amount-mismatch',
        severity: 'critical',
        message:
          'Funding webhook amount did not match the server-to-server provider verification.',
        metadata: {
          provider,
          providerReference,
          callbackAmount: safeCallbackAmount,
          apiAmount: verification.amount,
        },
        freezeUser: true,
      });
    }

    return {
      verified: match,
      callbackAmount: safeCallbackAmount,
      apiAmount: verification.amount,
      provider,
      raw: verification.raw,
    };
  } catch (error) {
    return {
      verified: true,
      callbackAmount: safeCallbackAmount,
      apiAmount: safeCallbackAmount,
      provider,
      reason: error?.message || 'provider-verification-error',
    };
  }
}

async function enforceFundingVelocity(userId) {
  const windowStart = new Date(Date.now() - DEFAULT_VELOCITY_WINDOW_MINUTES * 60 * 1000);
  const count = await Transaction.countDocuments({
    userId,
    type: 'Deposit',
    status: 'success',
    createdAt: { $gte: windowStart },
  });

  if (count < DEFAULT_VELOCITY_LIMIT) {
    return {
      flagged: false,
      count,
      windowMinutes: DEFAULT_VELOCITY_WINDOW_MINUTES,
    };
  }

  const message = `More than ${DEFAULT_VELOCITY_LIMIT} successful funding transactions landed within ${DEFAULT_VELOCITY_WINDOW_MINUTES} minutes.`;
  await logSecurityIncident({
    userId,
    incidentType: 'funding-velocity-threshold',
    severity: 'critical',
    message,
    metadata: {
      count,
      windowMinutes: DEFAULT_VELOCITY_WINDOW_MINUTES,
    },
    freezeUser: true,
  });

  return {
    flagged: true,
    count,
    windowMinutes: DEFAULT_VELOCITY_WINDOW_MINUTES,
  };
}

function shouldRequireAdminFundingApproval(amount, maxAutoFundLimit = DEFAULT_MAX_AUTO_FUND_LIMIT) {
  const numericAmount = formatPaymentAmount(amount);
  return numericAmount > Number(maxAutoFundLimit || DEFAULT_MAX_AUTO_FUND_LIMIT);
}

async function sendAdminEmergencyAlert(message) {
  const config = await readSiteConfigSnapshot();
  const adminPhone = String(
    process.env.ADMIN_ALERT_PHONE || config.adminAlertPhone || config.whatsappNumber || ''
  )
    .replace(/\D/g, '')
    .trim();

  if (!adminPhone || !message) {
    return { sent: false, reason: 'missing-admin-phone-or-message' };
  }

  await sendSendchampMessage({
    channel: 'whatsapp',
    to: adminPhone,
    message,
    sender: 'BR9ja',
  });

  return { sent: true };
}

async function storeProviderHealthSnapshot(snapshot = {}) {
  await AppSetting.findOneAndUpdate(
    { key: PROVIDER_HEALTH_KEY },
    {
      $set: {
        key: PROVIDER_HEALTH_KEY,
        value: snapshot,
        updatedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );
}

async function getProviderHealthSnapshot() {
  const setting = await AppSetting.findOne({ key: PROVIDER_HEALTH_KEY }).lean();
  return setting?.value || {};
}

async function checkProviderHealth() {
  const [clubkonnect, vtpass] = await Promise.allSettled([
    checkClubkonnectBalance(),
    checkVTpassBalance(),
  ]);

  const snapshot = {
    checkedAt: new Date().toISOString(),
    clubkonnect:
      clubkonnect.status === 'fulfilled'
        ? {
            healthy: true,
            balance: Number(clubkonnect.value.balance || 0),
            raw: clubkonnect.value.raw || {},
          }
        : {
            healthy: false,
            balance: 0,
            error: clubkonnect.reason?.message || 'Clubkonnect did not respond.',
          },
    vtpass:
      vtpass.status === 'fulfilled'
        ? {
            healthy: true,
            balance: Number(vtpass.value.balance || 0),
            raw: vtpass.value.raw || {},
          }
        : {
            healthy: false,
            balance: 0,
            error: vtpass.reason?.message || 'VTPass did not respond.',
          },
  };

  await storeProviderHealthSnapshot(snapshot);

  if (!snapshot.clubkonnect.healthy) {
    await sendAdminEmergencyAlert(
      '⚠️ API DOWNTIME: Clubkonnect is not responding. Check connection.'
    ).catch(() => {});
  }

  if (!snapshot.vtpass.healthy) {
    await sendAdminEmergencyAlert(
      '⚠️ API DOWNTIME: VTPass is not responding. Check connection.'
    ).catch(() => {});
  }

  return snapshot;
}

async function buildDailyReconciliationReport() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [walletAgg, depositAgg, spendAgg, startingBalanceAgg] = await Promise.all([
    User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
    Transaction.aggregate([
      { $match: { type: 'Deposit', status: 'success', createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          status: 'success',
          type: { $in: ['Airtime', 'Data', 'Bill', 'Education', 'Electricity', 'TV', 'Internet', 'Transport', 'Government', 'Betting'] },
          createdAt: { $gte: startOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          createdAt: { $lt: startOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Deposit'] }, '$amount', 0],
            },
          },
        },
      },
    ]),
  ]);

  const report = {
    generatedAt: new Date().toISOString(),
    totalWalletBalances: Number(walletAgg[0]?.total || 0),
    totalGatewayDeposits: Number(depositAgg[0]?.total || 0),
    totalProviderSpend: Number(spendAgg[0]?.total || 0),
    startingBalance: Number(startingBalanceAgg[0]?.total || 0),
  };

  report.expectedEndingBalance = roundCurrency(
    report.startingBalance + report.totalGatewayDeposits - report.totalProviderSpend
  );
  report.discrepancy = roundCurrency(report.totalWalletBalances - report.expectedEndingBalance);
  report.healthy = Math.abs(report.discrepancy) < 1;

  await AppSetting.findOneAndUpdate(
    { key: NIGHTLY_RECONCILIATION_KEY },
    {
      $set: {
        key: NIGHTLY_RECONCILIATION_KEY,
        value: report,
        updatedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  if (!report.healthy) {
    await sendAdminEmergencyAlert(
      `🚨 BR9JA ALERT: Critical daily reconciliation inconsistency detected. Discrepancy: ₦${report.discrepancy.toLocaleString()}.`
    ).catch(() => {});
  }

  return report;
}

async function getLatestReconciliationReport() {
  const setting = await AppSetting.findOne({ key: NIGHTLY_RECONCILIATION_KEY }).lean();
  return setting?.value || null;
}

async function markTransactionForAdminReview({
  transactionId,
  userId = null,
  reason,
  metadata = {},
  session = null,
}) {
  const transaction = await Transaction.findByIdAndUpdate(
    transactionId,
    {
      $set: {
        status: 'pending_review',
        'metadata.reviewReason': reason,
        'metadata.reviewMetadata': metadata,
        'metadata.reviewQueuedAt': new Date(),
      },
    },
    { new: true, session }
  );

  if (transaction) {
    await updateLinkedServiceRecord(transaction, 'pending_review', {}, session);
    await createTransactionAuditLog({
      transactionId: transaction._id,
      userId,
      step: 'admin_review_queue',
      status: 'warning',
      message: reason,
      metadata,
      session,
    });
    if (!session) {
      await queuePendingReviewNotification(transaction, reason);
    }
  }

  return transaction;
}

async function moveStalePendingTransactionsToAdminReview() {
  const staleBefore = new Date(Date.now() - 30 * 60 * 1000);
  const staleTransactions = await Transaction.find({
    status: 'pending_verification',
    createdAt: { $lte: staleBefore },
  })
    .select('_id userId reference metadata type')
    .lean();

  for (const row of staleTransactions) {
    await markTransactionForAdminReview({
      transactionId: row._id,
      userId: row.userId || null,
      reason: 'Transaction stayed pending verification for over 30 minutes.',
      metadata: {
        reference: row.reference,
        type: row.type,
        provider: row.metadata?.provider || '',
      },
    });
  }

  return { movedCount: staleTransactions.length };
}

async function requeryPendingProviderTransaction(transaction) {
  return resolveWithProvider(transaction);
}

async function requeryPendingTransactions(options = {}) {
  const olderThanMinutes = Math.max(Number(options.olderThanMinutes || 0), 0);
  const limit = Math.max(Number(options.limit || 50), 1);
  const match = {
    status: 'pending_verification',
  };

  if (olderThanMinutes > 0) {
    match.createdAt = {
      $lte: new Date(Date.now() - olderThanMinutes * 60 * 1000),
    };
  }

  const pendingRows = await Transaction.find(match).limit(limit);

  const results = [];

  for (const transaction of pendingRows) {
    const result = await requeryAndResolvePendingTransaction(transaction._id);

    results.push(result);
  }

  return results;
}

async function getCriticalDelaySnapshot(options = {}) {
  const thresholdMinutes = Math.max(Number(options.thresholdMinutes || 15), 1);
  const match = {
    status: 'pending_verification',
    createdAt: {
      $lte: new Date(Date.now() - thresholdMinutes * 60 * 1000),
    },
  };

  const rows = await Transaction.find(match)
    .sort({ createdAt: 1 })
    .limit(Math.max(Number(options.limit || 10), 1))
    .lean();

  const userIds = rows.map((row) => row.userId).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } })
    .select('fullName email phoneNumber')
    .lean();
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  return rows.map((row) => {
    const user = userMap.get(String(row.userId)) || {};
    const waitingMinutes = Math.max(
      Math.floor((Date.now() - new Date(row.createdAt).getTime()) / 60000),
      0
    );

    return {
      id: row._id.toString(),
      reference: row.reference,
      type: row.type,
      amount: roundCurrency(row.amount || 0),
      provider: String(row.metadata?.provider || '').trim(),
      waitingMinutes,
      fullName: user.fullName || 'BR9ja User',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
    };
  });
}

async function notifyCriticalDelays(options = {}) {
  const thresholdMinutes = Math.max(Number(options.thresholdMinutes || 15), 1);
  const rows = await getCriticalDelaySnapshot({
    thresholdMinutes,
    limit: Number(options.limit || 10),
  });

  if (!rows.length) {
    return [];
  }

  const alertWindow = Math.max(Number(options.alertWindowMinutes || 15), 1);
  const freshCutoff = new Date(Date.now() - alertWindow * 60 * 1000);
  const notifications = [];

  for (const row of rows) {
    const existing = await SecurityEvent.findOne({
      eventType: 'critical_pending_delay',
      'metadata.transactionId': row.id,
      createdAt: { $gte: freshCutoff },
    }).lean();

    if (existing) {
      continue;
    }

    const message = `🚨 Urgent: ${row.fullName} has been waiting ${row.waitingMinutes} mins for ${row.type}. Manual check required.`;
    await SecurityEvent.create({
      eventType: 'critical_pending_delay',
      severity: 'critical',
      route: 'pending-delay-monitor',
      method: 'SYSTEM',
      message,
      metadata: {
        transactionId: row.id,
        reference: row.reference,
        type: row.type,
        provider: row.provider,
        waitingMinutes: row.waitingMinutes,
      },
    });
    await sendAdminEmergencyAlert(message).catch(() => {});
    notifications.push(row);
  }

  return notifications;
}

async function requeryAndResolvePendingTransaction(transactionId) {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    const error = new Error('Transaction not found.');
    error.statusCode = 404;
    throw error;
  }

  if (transaction.status !== 'pending_verification') {
    return {
      transactionId: transaction._id.toString(),
      reference: transaction.reference,
      status: transaction.status,
      providerStatus: transaction.status,
      provider: String(transaction.metadata?.provider || '').trim(),
    };
  }

  return withTransactionMutex(`txn:${transaction._id}`, async () => {
    const providerStatus = await requeryPendingProviderTransaction(transaction);
    const normalised = normaliseProviderStatus(providerStatus.status);
    let shouldEmailReceipt = false;
    let shouldGrantBonus = false;

    if (normalised === 'success') {
      const walletDebited = transaction.metadata?.walletDebited !== false;

      if (!walletDebited && transaction.type !== 'Deposit') {
        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            const user = await User.findById(transaction.userId).session(session);
            if (!user || Number(user.balance || 0) < Number(transaction.amount || 0)) {
              transaction.status = 'pending_review';
              transaction.metadata = {
                ...(transaction.metadata || {}),
                reviewReason:
                  'Provider confirmed success after timeout, but the wallet no longer holds the required balance.',
                reviewQueuedAt: new Date(),
                requeryResponse: providerStatus.raw || {},
              };
              await transaction.save({ session });
              await updateLinkedServiceRecord(
                transaction,
                'pending_review',
                {
                  providerResponse: providerStatus.raw || {},
                },
                session
              );
              await createTransactionAuditLog({
                transactionId: transaction._id,
                userId: transaction.userId || null,
                step: 'admin_review_queue',
                status: 'warning',
                message:
                  'Provider confirmed delivery, but the wallet no longer holds the required balance. Manual review is required.',
                metadata: {
                  provider: providerStatus.provider,
                },
                session,
              });
              return;
            }

            user.balance = roundCurrency(
              Number(user.balance || 0) - Number(transaction.amount || 0)
            );
            await user.save({ session });

            transaction.status = 'success';
            transaction.balanceAfter = Number(user.balance || 0);
            transaction.metadata = {
              ...(transaction.metadata || {}),
              walletDebited: true,
              walletDebitedAt: new Date(),
              requeryResolvedAt: new Date(),
              requeryResponse: providerStatus.raw || {},
            };
            await transaction.save({ session });
            await updateLinkedServiceRecord(
              transaction,
              'success',
              {
                providerResponse: providerStatus.raw || {},
              },
              session
            );
            await createTransactionAuditLog({
              transactionId: transaction._id,
              userId: transaction.userId || null,
              step: 'provider_requery',
              status: 'success',
              message:
                'Provider requery confirmed delivery and the wallet was debited at resolution time.',
              metadata: {
                provider: providerStatus.provider,
              },
              session,
            });
          });
          shouldEmailReceipt = true;
          shouldGrantBonus = true;
        } finally {
          await session.endSession();
        }
      } else {
        transaction.status = 'success';
        transaction.metadata = {
          ...(transaction.metadata || {}),
          requeryResolvedAt: new Date(),
          requeryResponse: providerStatus.raw || {},
        };
        await transaction.save();
        await updateLinkedServiceRecord(transaction, 'success', {
          providerResponse: providerStatus.raw || {},
        });
        await createTransactionAuditLog({
          transactionId: transaction._id,
          userId: transaction.userId || null,
          step: 'provider_requery',
          status: 'success',
          message: 'Provider requery confirmed delivery.',
          metadata: {
            provider: providerStatus.provider,
          },
        });
        shouldEmailReceipt = true;
        shouldGrantBonus = true;
      }
    } else if (normalised === 'failed') {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          const user = await User.findById(transaction.userId).session(session);
          const walletDebited = transaction.metadata?.walletDebited !== false;
          if (user && walletDebited) {
            user.balance = roundCurrency(
              Number(user.balance || 0) + Number(transaction.amount || 0)
            );
            await user.save({ session });
          }
          transaction.status = 'failed';
          transaction.balanceAfter = user
            ? Number(user.balance || 0)
            : Number(transaction.balanceAfter || 0);
          transaction.metadata = {
            ...(transaction.metadata || {}),
            ...(walletDebited
              ? {
                  walletRefundedAt: new Date(),
                  refundTriggeredBy: 'requery-worker',
                }
              : {
                  refundSkipped: true,
                  refundReason: 'wallet-not-debited-before-resolution',
                }),
            requeryResponse: providerStatus.raw || {},
          };
          await transaction.save({ session });
          await updateLinkedServiceRecord(
            transaction,
            'failed',
            {
              providerResponse: providerStatus.raw || {},
            },
            session
          );
          await createTransactionAuditLog({
            transactionId: transaction._id,
            userId: transaction.userId || null,
            step: 'wallet_refund',
            status: 'failed',
            message: walletDebited
              ? 'Provider requery confirmed failure. Wallet refunded.'
              : 'Provider requery confirmed failure. Wallet stayed untouched.',
            metadata: {
              refundedAmount: transaction.amount,
              walletDebited,
            },
            session,
          });
        });
      } finally {
        await session.endSession();
      }
    } else {
      await createTransactionAuditLog({
        transactionId: transaction._id,
        userId: transaction.userId || null,
        step: 'provider_requery',
        status: 'pending',
        message: 'Provider still reports this transaction as pending.',
        metadata: {
          provider: providerStatus.provider,
        },
      });
    }

    if (String(transaction.status || '').toLowerCase() === 'pending_review') {
      await queuePendingReviewNotification(
        transaction,
        "Verification in progress. We're double-checking your delivery with the network provider. Hang tight!"
      );
    }

    if (shouldEmailReceipt) {
      await queueReceiptUpdateEmail(transaction._id, 'pending_resolved');
    }

    if (shouldGrantBonus) {
      await maybeGrantPatienceBonus(transaction._id);
    }

    return {
      transactionId: transaction._id.toString(),
      reference: transaction.reference,
      status: transaction.status,
      providerStatus: normalised,
      provider: providerStatus.provider,
    };
  });
}

function renderReceiptSvg(transaction) {
  const status = String(transaction.status || 'success').toUpperCase();
  const amount = roundCurrency(transaction.amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const createdAt = new Date(transaction.createdAt || transaction.timestamp || Date.now())
    .toLocaleString('en-NG');
  const service = String(transaction.type || 'Transaction');
  const referenceValue = String(transaction.reference || '').trim();
  const note = String(transaction.note || transaction.metadata?.receiptNumber || '').trim();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A1E55"/>
      <stop offset="100%" stop-color="#010A1F"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="720" fill="url(#bg)"/>
  <rect x="72" y="72" width="1056" height="576" rx="36" fill="#FFFFFF"/>
  <text x="120" y="160" font-family="Inter, Arial, sans-serif" font-size="46" font-weight="800" fill="#0A1E55">Bayright9ja Ltd</text>
  <text x="120" y="205" font-family="Inter, Arial, sans-serif" font-size="24" fill="#475569">BR9ja Proof of Payment</text>
  <rect x="860" y="118" width="190" height="58" rx="29" fill="#16A34A"/>
  <text x="955" y="156" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">${status}</text>
  <text x="120" y="300" font-family="Inter, Arial, sans-serif" font-size="20" fill="#64748B">Service</text>
  <text x="120" y="340" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700" fill="#0F172A">${service}</text>
  <text x="120" y="420" font-family="Inter, Arial, sans-serif" font-size="20" fill="#64748B">Reference</text>
  <text x="120" y="460" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="#0F172A">${referenceValue}</text>
  <text x="120" y="530" font-family="Inter, Arial, sans-serif" font-size="20" fill="#64748B">Date</text>
  <text x="120" y="568" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="#0F172A">${createdAt}</text>
  <text x="690" y="300" font-family="Inter, Arial, sans-serif" font-size="20" fill="#64748B">Amount</text>
  <text x="690" y="344" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800" fill="#0F172A">₦${amount}</text>
  <text x="690" y="420" font-family="Inter, Arial, sans-serif" font-size="20" fill="#64748B">Note</text>
  <text x="690" y="460" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0F172A">${note || 'Completed successfully'}</text>
  <text x="120" y="626" font-family="Inter, Arial, sans-serif" font-size="18" fill="#64748B">Generated by BR9ja. Keep this receipt for proof of payment and support review.</text>
</svg>`;
}

function buildReceiptFilename(transaction) {
  return `br9-receipt-${String(transaction.reference || 'transaction').replace(/[^A-Z0-9-]+/gi, '-')}.svg`;
}

module.exports = {
  buildDailyReconciliationReport,
  buildReceiptFilename,
  checkProviderHealth,
  createPendingVerificationTransaction,
  createTransactionAuditLog,
  enforceFundingVelocity,
  formatPaymentAmount,
  getCriticalDelaySnapshot,
  getLatestReconciliationReport,
  getProviderHealthSnapshot,
  logSecurityIncident,
  markTransactionForAdminReview,
  moveStalePendingTransactionsToAdminReview,
  notifyCriticalDelays,
  normaliseProviderStatus,
  readSiteConfigSnapshot,
  renderReceiptSvg,
  resolveWithProvider,
  requeryPendingProviderTransaction,
  requeryPendingTransactions,
  requeryAndResolvePendingTransaction,
  sendAdminEmergencyAlert,
  shouldTreatAsPendingVerification,
  shouldRequireAdminFundingApproval,
  syncLinkedServiceRecord: updateLinkedServiceRecord,
  validateWebhookFundingAmount,
  withTransactionMutex,
};
