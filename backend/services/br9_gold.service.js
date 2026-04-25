'use strict';

const mongoose = require('mongoose');

const { GoldTransaction, Transaction, User, UserNotification } = require('../models');
const { recordGoldAuditEvent } = require('./gold_audit.service');

const BR9_GOLD_REWARDS = Object.freeze({
  email_verification: 100,
  phone_verification: 100,
  first_deposit: 300,
});

const BR9_GOLD_UNLOCK_DAYS = 30;
const BR9_GOLD_TO_NAIRA_RATE = 10;
const BR9_GOLD_MAX_PARTIAL_PAYMENT_SHARE = 0.05;
const BR9_GOLD_ELIGIBLE_SERVICES = new Set(['airtime', 'data', 'electricity']);

function addDays(date, days) {
  const base = new Date(date);
  base.setDate(base.getDate() + days);
  return base;
}

function createReference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

function normaliseGold(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.floor(parsed);
}

function toNairaFromGold(points) {
  return normaliseGold(points) / BR9_GOLD_TO_NAIRA_RATE;
}

function getUnlockDateForUser(user) {
  if (user?.goldUnlockDate instanceof Date) {
    return user.goldUnlockDate;
  }

  if (user?.goldUnlockDate) {
    return new Date(user.goldUnlockDate);
  }

  if (user?.createdAt) {
    return addDays(user.createdAt, BR9_GOLD_UNLOCK_DAYS);
  }

  return addDays(new Date(), BR9_GOLD_UNLOCK_DAYS);
}

function diffInDays(targetDate, currentDate = new Date()) {
  const diffMs = new Date(targetDate).getTime() - new Date(currentDate).getTime();
  if (diffMs <= 0) {
    return 0;
  }
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

function buildGoldSnapshot(user, currentDate = new Date()) {
  const unlockDate = getUnlockDateForUser(user);
  const lockedBalance = normaliseGold(user?.br9GoldLockedBalance);
  const spendableBalance = normaliseGold(user?.br9GoldBalance);
  const isLocked = lockedBalance > 0 && unlockDate.getTime() > new Date(currentDate).getTime();
  const totalBalance = spendableBalance + lockedBalance;
  const daysRemaining = isLocked ? diffInDays(unlockDate, currentDate) : 0;

  return {
    spendableBalance,
    lockedBalance,
    totalBalance,
    unlockDate,
    isLocked,
    daysRemaining,
    spendableNairaValue: toNairaFromGold(spendableBalance),
    totalNairaValue: toNairaFromGold(totalBalance),
    maxDiscountShare: BR9_GOLD_MAX_PARTIAL_PAYMENT_SHARE,
  };
}

async function unlockVestedGoldIfDue(userOrId, options = {}) {
  const { session = null } = options;
  const user =
    typeof userOrId === 'string' || userOrId instanceof mongoose.Types.ObjectId
      ? await User.findById(userOrId).session(session)
      : userOrId;

  if (!user) {
    return null;
  }

  const snapshot = buildGoldSnapshot(user);
  if (!snapshot.lockedBalance) {
    if (!user.goldUnlockDate) {
      user.goldUnlockDate = snapshot.unlockDate;
      await user.save({ session });
    }
    return user;
  }

  if (snapshot.isLocked) {
    if (!user.goldUnlockDate) {
      user.goldUnlockDate = snapshot.unlockDate;
      await user.save({ session });
    }
    return user;
  }

  user.br9GoldBalance = snapshot.spendableBalance + snapshot.lockedBalance;
  user.br9GoldLockedBalance = 0;
  user.goldUnlockDate = snapshot.unlockDate;
  await user.save({ session });
  return user;
}

async function grantReward({
  userId,
  reason,
  points,
  note = '',
  session = null,
  metadata = {},
}) {
  const rewardPoints = normaliseGold(points);
  if (!userId || !reason || rewardPoints <= 0) {
    return { granted: false, points: 0, duplicate: false, user: null };
  }

  const user = await User.findById(userId).session(session);
  if (!user) {
    const error = new Error('User not found for BR9 Gold reward.');
    error.statusCode = 404;
    throw error;
  }

  const grantedMilestones = Array.isArray(user.rewardMilestonesGranted)
    ? user.rewardMilestonesGranted
    : [];

  if (grantedMilestones.includes(reason)) {
    return { granted: false, points: 0, duplicate: true, user };
  }

  const unlockDate = getUnlockDateForUser(user);
  const now = new Date();
  const shouldLock = unlockDate.getTime() > now.getTime();

  user.goldUnlockDate = unlockDate;
  user.rewardMilestonesGranted = [...grantedMilestones, reason];
  if (shouldLock) {
    user.br9GoldLockedBalance = normaliseGold(user.br9GoldLockedBalance) + rewardPoints;
  } else {
    user.br9GoldBalance = normaliseGold(user.br9GoldBalance) + rewardPoints;
  }
  await user.save({ session });

  await Transaction.create(
    [
      {
        senderId: user._id,
        userId: user._id,
        receiverId: user._id,
        senderName: 'BR9ja Rewards',
        receiverName: user.fullName,
        amount: rewardPoints,
        type: 'Reward',
        status: 'success',
        timestamp: now,
        reference: createReference('GLD'),
        note: note || `${rewardPoints} BR9 Gold awarded for ${reason.replace(/_/g, ' ')}`,
        balanceAfter: Number(user.balance || 0),
        currency: 'BR9G',
        metadata: {
          rewardReason: reason,
          goldPoints: rewardPoints,
          locked: shouldLock,
          unlockDate,
          ...metadata,
        },
      },
    ],
    { session }
  );

  await GoldTransaction.create(
    [
      {
        userId: user._id,
        source: reason,
        amount: rewardPoints,
        direction: 'credit',
        balanceAfter: shouldLock
          ? normaliseGold(user.br9GoldLockedBalance)
          : normaliseGold(user.br9GoldBalance),
        locked: shouldLock,
        note: note || `${rewardPoints} BR9 Gold awarded for ${reason.replace(/_/g, ' ')}`,
        reference: createReference('GLDLEDGER'),
        metadata: {
          rewardReason: reason,
          unlockDate,
          ...metadata,
        },
      },
    ],
    session ? { session } : undefined
  );

  await recordGoldAuditEvent({
    userId: user._id,
    actionType: reason,
    direction: 'mint',
    amount: rewardPoints,
    note: note || `${rewardPoints} BR9 Gold awarded for ${reason.replace(/_/g, ' ')}`,
    metadata: {
      unlockDate,
      locked: shouldLock,
      ...metadata,
    },
    session,
  });

  await UserNotification.create(
    [
      {
        userId: user._id,
        title: 'BR9 Gold Added',
        body: shouldLock
          ? `${rewardPoints} BR9 Gold has been added and will unlock on ${unlockDate.toDateString()}.`
          : `${rewardPoints} BR9 Gold has been added to your spendable balance.`,
        type: 'br9-gold',
        status: 'queued',
        metadata: {
          rewardReason: reason,
          goldPoints: rewardPoints,
          locked: shouldLock,
          unlockDate,
        },
      },
    ],
    { session }
  );

  return {
    granted: true,
    points: rewardPoints,
    duplicate: false,
    unlockDate,
    locked: shouldLock,
    user,
  };
}

async function grantConfiguredReward(options = {}) {
  const reason = String(options.reason || '').trim();
  const points =
    options.points === undefined
      ? BR9_GOLD_REWARDS[reason] || 0
      : Number(options.points || 0);

  return grantReward({
    ...options,
    reason,
    points,
  });
}

function buildGoldHoldMessage(user) {
  const snapshot = buildGoldSnapshot(user);
  if (!snapshot.isLocked) {
    return '';
  }

  return `Patience pays! 🚀 Your BR9 Gold will be ready to spend in ${snapshot.daysRemaining} day${
    snapshot.daysRemaining === 1 ? '' : 's'
  }.`;
}

async function applyGoldDiscount({
  userId,
  serviceKey,
  amount,
  requestedGold = 0,
  session = null,
}) {
  const normalisedServiceKey = String(serviceKey || '')
    .trim()
    .toLowerCase();
  const desiredGold = normaliseGold(requestedGold);
  const numericAmount = Number(amount || 0);

  if (desiredGold <= 0 || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return {
      applied: false,
      goldUsed: 0,
      nairaDiscount: 0,
      remainingGold: null,
      maxGoldAllowed: 0,
    };
  }

  if (!BR9_GOLD_ELIGIBLE_SERVICES.has(normalisedServiceKey)) {
    const error = new Error(
      'BR9 Gold can only be used for internal services like Airtime, Data, and Electricity.'
    );
    error.statusCode = 400;
    throw error;
  }

  let user = await User.findById(userId).session(session);
  if (!user) {
    const error = new Error('User not found for BR9 Gold discount.');
    error.statusCode = 404;
    throw error;
  }

  user = await unlockVestedGoldIfDue(user, { session });
  const snapshot = buildGoldSnapshot(user);
  if (snapshot.isLocked) {
    const error = new Error(buildGoldHoldMessage(user));
    error.statusCode = 409;
    throw error;
  }

  const maxDiscountNaira = Math.floor(numericAmount * BR9_GOLD_MAX_PARTIAL_PAYMENT_SHARE * 100) / 100;
  const maxGoldAllowed = normaliseGold(maxDiscountNaira * BR9_GOLD_TO_NAIRA_RATE);
  const goldUsed = Math.min(desiredGold, snapshot.spendableBalance, maxGoldAllowed);

  if (goldUsed <= 0) {
    return {
      applied: false,
      goldUsed: 0,
      nairaDiscount: 0,
      remainingGold: snapshot.spendableBalance,
      maxGoldAllowed,
    };
  }

  user.br9GoldBalance = Math.max(snapshot.spendableBalance - goldUsed, 0);
  await user.save({ session });

  await GoldTransaction.create(
    [
      {
        userId: user._id,
        source: `${normalisedServiceKey}_discount`,
        amount: goldUsed,
        direction: 'debit',
        balanceAfter: user.br9GoldBalance,
        locked: false,
        note: `BR9 Gold used for ${normalisedServiceKey} discount.`,
        reference: createReference('GLDUSE'),
        metadata: {
          serviceKey: normalisedServiceKey,
          amount: numericAmount,
          nairaDiscount: goldUsed / BR9_GOLD_TO_NAIRA_RATE,
        },
      },
    ],
    session ? { session } : undefined
  );

  await recordGoldAuditEvent({
    userId: user._id,
    actionType: `${normalisedServiceKey}_discount`,
    direction: 'burn',
    amount: goldUsed,
    note: `BR9 Gold used for ${normalisedServiceKey} discount.`,
    metadata: {
      serviceKey: normalisedServiceKey,
      nairaDiscount: goldUsed / BR9_GOLD_TO_NAIRA_RATE,
    },
    session,
  });

  return {
    applied: true,
    goldUsed,
    nairaDiscount: goldUsed / BR9_GOLD_TO_NAIRA_RATE,
    remainingGold: user.br9GoldBalance,
    maxGoldAllowed,
  };
}

async function convertGoldToServiceDiscount({
  userId,
  serviceKey,
  goldAmount,
  session = null,
}) {
  const desiredGold = normaliseGold(goldAmount);
  if (desiredGold <= 0) {
    const error = new Error('A positive BR9 Gold amount is required.');
    error.statusCode = 400;
    throw error;
  }

  let user = await User.findById(userId).session(session);
  if (!user) {
    const error = new Error('User not found for BR9 Gold conversion.');
    error.statusCode = 404;
    throw error;
  }

  user = await unlockVestedGoldIfDue(user, { session });
  const snapshot = buildGoldSnapshot(user);
  if (snapshot.isLocked) {
    const error = new Error(buildGoldHoldMessage(user));
    error.statusCode = 409;
    throw error;
  }

  if (!BR9_GOLD_ELIGIBLE_SERVICES.has(String(serviceKey || '').trim().toLowerCase())) {
    const error = new Error('BR9 Gold can only be swapped into internal services.');
    error.statusCode = 400;
    throw error;
  }

  if (snapshot.spendableBalance < desiredGold) {
    const error = new Error('You do not have enough spendable BR9 Gold yet.');
    error.statusCode = 422;
    throw error;
  }

  user.br9GoldBalance = snapshot.spendableBalance - desiredGold;
  await user.save({ session });

  const nairaValue = desiredGold / BR9_GOLD_TO_NAIRA_RATE;

  await Promise.all([
    Transaction.create(
      [
        {
          senderId: user._id,
          userId: user._id,
          receiverId: user._id,
          senderName: 'BR9 Gold',
          receiverName: user.fullName,
          amount: 0,
          type: 'PointConversion',
          status: 'success',
          timestamp: new Date(),
          reference: createReference('GLDSWAP'),
          note: `BR9 Gold swapped for ${serviceKey} discount`,
          balanceAfter: Number(user.balance || 0),
          currency: 'NGN',
          metadata: {
            goldUsed: desiredGold,
            nairaValue,
            serviceKey,
          },
        },
      ],
      session ? { session } : undefined
    ),
    GoldTransaction.create(
      [
        {
          userId: user._id,
          source: 'gold_to_service_discount',
          amount: desiredGold,
          direction: 'debit',
          balanceAfter: user.br9GoldBalance,
          locked: false,
          note: `BR9 Gold swapped for ${serviceKey}.`,
          reference: createReference('GLDSWAPLEDGER'),
          metadata: {
            serviceKey,
            nairaValue,
          },
        },
      ],
      session ? { session } : undefined
    ),
    recordGoldAuditEvent({
      userId: user._id,
      actionType: 'gold_to_service_discount',
      direction: 'burn',
      amount: desiredGold,
      note: `BR9 Gold swapped for ${serviceKey}.`,
      metadata: {
        serviceKey,
        nairaValue,
      },
      session,
    }),
  ]);

  return {
    goldUsed: desiredGold,
    nairaValue,
    remainingGold: user.br9GoldBalance,
    serviceKey,
  };
}

async function getSuccessfulTransactionCount(userId, options = {}) {
  const { session = null } = options;
  return Transaction.countDocuments({
    userId,
    status: 'success',
    type: {
      $nin: ['Deposit', 'Reward', 'PointConversion', 'AdminAdjustment'],
    },
  }).session(session);
}

async function convertGoldToWallet({
  userId,
  goldAmount,
  minimumSuccessfulTransactions = 5,
  session = null,
}) {
  const desiredGold = normaliseGold(goldAmount);
  if (desiredGold <= 0) {
    const error = new Error('A positive BR9 Gold amount is required.');
    error.statusCode = 400;
    throw error;
  }

  let user = await User.findById(userId).session(session);
  if (!user) {
    const error = new Error('User not found for BR9 Gold conversion.');
    error.statusCode = 404;
    throw error;
  }

  user = await unlockVestedGoldIfDue(user, { session });
  const snapshot = buildGoldSnapshot(user);
  if (snapshot.isLocked) {
    const error = new Error(buildGoldHoldMessage(user));
    error.statusCode = 409;
    throw error;
  }

  const successfulTransactionCount = await getSuccessfulTransactionCount(user._id, {
    session,
  });
  if (successfulTransactionCount <= Number(minimumSuccessfulTransactions || 5)) {
    const error = new Error(
      `Complete more than ${Number(minimumSuccessfulTransactions || 5)} successful service transactions before converting BR9 Gold to wallet balance.`
    );
    error.statusCode = 423;
    throw error;
  }

  if (snapshot.spendableBalance < desiredGold) {
    const error = new Error('You do not have enough spendable BR9 Gold yet.');
    error.statusCode = 422;
    throw error;
  }

  const nairaValue = desiredGold / BR9_GOLD_TO_NAIRA_RATE;
  user.br9GoldBalance = snapshot.spendableBalance - desiredGold;
  user.balance = Number(user.balance || 0) + nairaValue;
  await user.save({ session });

  await Promise.all([
    Transaction.create(
      [
        {
          senderId: user._id,
          userId: user._id,
          receiverId: user._id,
          senderName: 'BR9 Gold',
          receiverName: user.fullName,
          amount: nairaValue,
          type: 'PointConversion',
          status: 'success',
          timestamp: new Date(),
          reference: createReference('GLDWAL'),
          note: 'BR9 Gold converted to wallet balance',
          balanceAfter: Number(user.balance || 0),
          currency: 'NGN',
          metadata: {
            goldUsed: desiredGold,
            successfulTransactionCount,
            conversionType: 'gold_to_wallet',
          },
        },
      ],
      session ? { session } : undefined
    ),
    GoldTransaction.create(
      [
        {
          userId: user._id,
          source: 'gold_to_wallet',
          amount: desiredGold,
          direction: 'debit',
          balanceAfter: user.br9GoldBalance,
          locked: false,
          note: 'BR9 Gold converted to wallet balance.',
          reference: createReference('GLDWALLEDGER'),
          metadata: {
            nairaValue,
            successfulTransactionCount,
          },
        },
      ],
      session ? { session } : undefined
    ),
    recordGoldAuditEvent({
      userId: user._id,
      actionType: 'gold_to_wallet',
      direction: 'burn',
      amount: desiredGold,
      note: 'BR9 Gold converted to wallet balance.',
      metadata: {
        nairaValue,
        successfulTransactionCount,
      },
      session,
    }),
  ]);

  return {
    goldUsed: desiredGold,
    nairaValue,
    remainingGold: user.br9GoldBalance,
    walletBalance: user.balance,
    successfulTransactionCount,
  };
}

function buildGoldDiscountPreview({ amount = 1000, user }) {
  const numericAmount = Number(amount || 0);
  const snapshot = buildGoldSnapshot(user);
  const maxDiscountNaira = Math.floor(numericAmount * BR9_GOLD_MAX_PARTIAL_PAYMENT_SHARE * 100) / 100;
  const walletDiscountNaira = Math.min(snapshot.totalNairaValue, maxDiscountNaira);
  const goldRequired = normaliseGold(walletDiscountNaira * BR9_GOLD_TO_NAIRA_RATE);

  return {
    sampleAmount: numericAmount,
    discountAmount: walletDiscountNaira,
    payAmount: Math.max(numericAmount - walletDiscountNaira, 0),
    goldRequired,
    locked: snapshot.isLocked,
  };
}

module.exports = {
  BR9_GOLD_ELIGIBLE_SERVICES,
  BR9_GOLD_MAX_PARTIAL_PAYMENT_SHARE,
  BR9_GOLD_REWARDS,
  BR9_GOLD_TO_NAIRA_RATE,
  BR9_GOLD_UNLOCK_DAYS,
  applyGoldDiscount,
  buildGoldDiscountPreview,
  buildGoldHoldMessage,
  buildGoldSnapshot,
  convertGoldToWallet,
  convertGoldToServiceDiscount,
  getSuccessfulTransactionCount,
  getUnlockDateForUser,
  grantConfiguredReward,
  grantReward,
  unlockVestedGoldIfDue,
};
