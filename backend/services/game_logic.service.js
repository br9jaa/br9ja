'use strict';

const cron = require('node-cron');

const { GoldAuditLog, Transaction, User, UserNotification } = require('../models');
const { getWeeklyLeaderboard } = require('../jobs/payout_engine');
const { recordGoldAuditEvent } = require('./gold_audit.service');
const { sendSendchampMessage, sendSendchampPush } = require('./sendchamp.service');

const CRON_TIMEZONE = process.env.CRON_TIMEZONE || 'Africa/Lagos';
const DEFAULT_AD_REVENUE_AMOUNT = Number(process.env.DEFAULT_AD_REVENUE_AMOUNT || 15);
const ELIGIBLE_JACKPOT_TYPES = new Set([
  'Airtime',
  'Data',
  'Electricity',
  'CableTV',
  'Cable Tv',
  'Education',
  'Government',
  'Govt',
  'Transport',
  'Internet',
]);

function getLagosParts(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: CRON_TIMEZONE,
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return formatter.formatToParts(date).reduce((accumulator, part) => {
      accumulator[part.type] = part.value;
      return accumulator;
    }, {});
  } catch (_error) {
    const fallback = new Date(date);
    return {
      weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
        fallback.getDay()
      ],
      year: String(fallback.getFullYear()),
      month: String(fallback.getMonth() + 1).padStart(2, '0'),
      day: String(fallback.getDate()).padStart(2, '0'),
      hour: String(fallback.getHours()).padStart(2, '0'),
      minute: String(fallback.getMinutes()).padStart(2, '0'),
    };
  }
}

function getCurrentGameMode(date = new Date()) {
  const weekday = String(getLagosParts(date).weekday || '').trim().toLowerCase();

  if (weekday === 'monday' || weekday === 'friday') {
    return {
      key: 'market_runner',
      label: 'Market Runner',
      schedule: 'Monday / Friday',
      adMultiplierEnabled: false,
    };
  }

  if (['tuesday', 'wednesday', 'thursday'].includes(weekday)) {
    return {
      key: 'trivia_rush',
      label: 'Trivia Rush',
      schedule: 'Tuesday / Thursday',
      adMultiplierEnabled: false,
    };
  }

  if (weekday === 'saturday') {
    return {
      key: 'ad_multiplier',
      label: 'Market Runner + Ad Multiplier',
      schedule: 'Saturday',
      adMultiplierEnabled: true,
    };
  }

  return {
    key: 'sunday_jackpot',
    label: 'Sunday Jackpot',
    schedule: 'Sunday',
    adMultiplierEnabled: false,
  };
}

function getWeekKey(date = new Date()) {
  const parts = getLagosParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function buildJackpotDistribution(totalJackpot = 0) {
  const jackpot = Number(totalJackpot || 0);
  if (jackpot <= 0) {
    return [];
  }

  const firstPlace = jackpot * 0.4;
  const secondToFifthTotal = jackpot * 0.4;
  const sixthToTenthTotal = jackpot * 0.2;

  return [
    { rank: 1, share: 0.4, amount: Number(firstPlace.toFixed(2)) },
    ...[2, 3, 4, 5].map((rank) => ({
      rank,
      share: 0.1,
      amount: Number((secondToFifthTotal / 4).toFixed(2)),
    })),
    ...[6, 7, 8, 9, 10].map((rank) => ({
      rank,
      share: 0.04,
      amount: Number((sixthToTenthTotal / 5).toFixed(2)),
    })),
  ];
}

async function getWeeklyAdRevenue(windowStart) {
  const rows = await GoldAuditLog.find({
    actionType: 'AD_REVENUE_CONTRIBUTION',
    createdAt: { $gte: windowStart },
  }).lean();

  return rows.reduce(
    (sum, row) => sum + Number(row.metadata?.revenueAmount || DEFAULT_AD_REVENUE_AMOUNT || 0),
    0
  );
}

async function getWeeklyAdminProfit(windowStart) {
  const rows = await Transaction.find({
    status: 'success',
    createdAt: { $gte: windowStart },
  })
    .select('metadata')
    .lean();

  return rows.reduce((sum, row) => sum + Number(row.metadata?.profit || 0), 0);
}

async function getRecentSuccessfulUtilityCount(userId, windowStart) {
  return Transaction.countDocuments({
    userId,
    status: 'success',
    createdAt: { $gte: windowStart },
    type: { $in: Array.from(ELIGIBLE_JACKPOT_TYPES) },
  });
}

async function getEligibleJackpotLeaderboard(limit = 10, now = new Date()) {
  const leaderboard = await getWeeklyLeaderboard(Math.max(limit, 20));
  const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const eligible = [];

  for (const row of leaderboard) {
    const user = await User.findById(row._id)
      .select(
        'fullName bayrightTag email phoneNumber isVerified br9GoldBalance br9GoldLockedBalance br9GoldPoints balance'
      )
      .lean();
    if (!user || !user.isVerified) {
      continue;
    }

    const goldBalance =
      Number(user.br9GoldBalance || 0) +
      Number(user.br9GoldLockedBalance || 0) +
      Number(user.br9GoldPoints || 0);
    if (goldBalance < 50) {
      continue;
    }

    const recentSuccessfulTransactions = await getRecentSuccessfulUtilityCount(
      user._id,
      windowStart
    );
    if (recentSuccessfulTransactions < 5) {
      continue;
    }

    eligible.push({
      id: user._id.toString(),
      fullName: user.fullName,
      bayrightTag: user.bayrightTag,
      email: user.email,
      phoneNumber: user.phoneNumber,
      goldBalance,
      leaderboardPoints: Number(row.br9GoldPoints || 0),
      recentSuccessfulTransactions,
    });

    if (eligible.length >= limit) {
      break;
    }
  }

  return eligible;
}

async function calculateSundayJackpot(now = new Date()) {
  const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [totalAdRevenue, totalWeeklyAdminProfit, leaderboard] = await Promise.all([
    getWeeklyAdRevenue(windowStart),
    getWeeklyAdminProfit(windowStart),
    getEligibleJackpotLeaderboard(10, now),
  ]);

  const jackpotTotal = Number(
    ((Number(totalAdRevenue || 0) * 0.4) + Number(totalWeeklyAdminProfit || 0) * 0.05).toFixed(2)
  );
  const distribution = buildJackpotDistribution(jackpotTotal);

  return {
    mode: getCurrentGameMode(now),
    jackpotWeekKey: getWeekKey(now),
    windowStart,
    totalAdRevenue: Number(totalAdRevenue.toFixed(2)),
    totalWeeklyAdminProfit: Number(totalWeeklyAdminProfit.toFixed(2)),
    jackpotTotal,
    leaderboard: leaderboard.map((row, index) => ({
      rank: index + 1,
      ...row,
      payout: Number(distribution[index]?.amount || 0),
    })),
    distribution,
  };
}

async function recordAdRevenueContribution({
  userId = null,
  source = 'ad_watch',
  revenueAmount = DEFAULT_AD_REVENUE_AMOUNT,
  goldAmount = 0,
  metadata = {},
}) {
  return recordGoldAuditEvent({
    userId,
    actionType: 'AD_REVENUE_CONTRIBUTION',
    direction: 'transfer',
    amount: Math.max(Number(goldAmount || 0), 0),
    note: `Ad revenue contribution recorded from ${source}.`,
    metadata: {
      source,
      revenueAmount: Number(revenueAmount || DEFAULT_AD_REVENUE_AMOUNT),
      ...metadata,
    },
  });
}

async function settleSundayJackpot(now = new Date()) {
  const jackpot = await calculateSundayJackpot(now);
  if (!jackpot.jackpotTotal || !jackpot.leaderboard.length) {
    return {
      ...jackpot,
      settledCount: 0,
      skipped: true,
    };
  }

  const existingPayout = await Transaction.findOne({
    type: 'JackpotReward',
    'metadata.jackpotWeekKey': jackpot.jackpotWeekKey,
  }).lean();

  if (existingPayout) {
    return {
      ...jackpot,
      settledCount: 0,
      skipped: true,
      reason: 'already-settled',
    };
  }

  let settledCount = 0;

  for (const row of jackpot.leaderboard) {
    if (!row.payout || row.payout <= 0) {
      continue;
    }

    const user = await User.findByIdAndUpdate(
      row.id,
      {
        $inc: { balance: row.payout },
      },
      { new: true }
    );

    if (!user) {
      continue;
    }

    settledCount += 1;

    await Promise.allSettled([
      Transaction.create({
        senderId: user._id,
        userId: user._id,
        receiverId: user._id,
        senderName: 'BR9 Sunday Jackpot',
        receiverName: user.fullName,
        amount: row.payout,
        type: 'JackpotReward',
        status: 'success',
        timestamp: new Date(),
        reference: `BR9-JACKPOT-${Date.now().toString(36).toUpperCase()}-${String(row.rank).padStart(2, '0')}`,
        note: `Sunday jackpot payout for rank #${row.rank}.`,
        balanceAfter: Number(user.balance || 0),
        currency: 'NGN',
        metadata: {
          jackpotWeekKey: jackpot.jackpotWeekKey,
          totalAdRevenue: jackpot.totalAdRevenue,
          totalWeeklyAdminProfit: jackpot.totalWeeklyAdminProfit,
          jackpotTotal: jackpot.jackpotTotal,
          rank: row.rank,
          leaderboardPoints: row.leaderboardPoints,
        },
      }),
      UserNotification.create({
        userId: user._id,
        title: 'Sunday Jackpot Winner',
        body: `🏆 Jackpot payout received. ₦${row.payout.toLocaleString()} has landed in your BR9ja wallet.`,
        type: 'jackpot_reward',
        status: 'queued',
        metadata: {
          jackpotWeekKey: jackpot.jackpotWeekKey,
          rank: row.rank,
          amount: row.payout,
        },
      }),
      sendSendchampPush({
        user: {
          id: user._id.toString(),
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        title: 'Sunday Jackpot Winner',
        body: `🏆 Jackpot payout received. ₦${row.payout.toLocaleString()} has landed in your BR9ja wallet.`,
        data: {
          jackpotWeekKey: jackpot.jackpotWeekKey,
          rank: row.rank,
          amount: row.payout,
        },
      }),
      sendSendchampMessage({
        channel: 'whatsapp',
        to: user.phoneNumber,
        message: `🏆 BR9ja Sunday Jackpot: ₦${row.payout.toLocaleString()} has been credited to your wallet for rank #${row.rank}.`,
      }),
    ]);
  }

  return {
    ...jackpot,
    settledCount,
    skipped: false,
  };
}

function startGameLogicEngine() {
  cron.schedule(
    '0 22 * * 0',
    () => {
      void settleSundayJackpot().catch((error) => {
        console.warn('Sunday jackpot settlement failed.', error?.message || error);
      });
    },
    {
      timezone: CRON_TIMEZONE,
    }
  );
}

module.exports = {
  calculateSundayJackpot,
  getCurrentGameMode,
  recordAdRevenueContribution,
  settleSundayJackpot,
  startGameLogicEngine,
};
