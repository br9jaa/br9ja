'use strict';

const crypto = require('crypto');

const cron = require('node-cron');

const {
  GamePopupClick,
  GameScore,
  Transaction,
  User,
  UserNotification,
} = require('../models');
const { recordAdRevenueContribution } = require('./game_logic.service');
const { recordGoldAuditEvent } = require('./gold_audit.service');
const { listServiceCatalog } = require('./service_catalog.service');
const { sendSendchampMessage, sendSendchampPush } = require('./sendchamp.service');

const GAME_TYPE = 'market_runner';
const SESSION_GOLD_CAP = Number(process.env.MARKET_RUNNER_SESSION_GOLD_CAP || 5);
const MAX_DAILY_SESSIONS = Number(process.env.MARKET_RUNNER_MAX_DAILY_SESSIONS || 3);
const CHAMPION_BONUS_GOLD = Number(process.env.MARKET_RUNNER_CHAMPION_BONUS || 50);
const ENERGY_MAX = Number(process.env.MARKET_RUNNER_MAX_ENERGY || 3);
const ENERGY_REFILL_HOURS = Number(process.env.MARKET_RUNNER_ENERGY_REFILL_HOURS || 2);
const ENERGY_REFILL_GOLD_COST = Number(
  process.env.MARKET_RUNNER_ENERGY_REFILL_GOLD_COST || 10
);
const REWARD_WINDOW_MS = Number(process.env.MARKET_RUNNER_REWARD_WINDOW_MS || 10 * 60 * 1000);
const GAME_REWARD_SECRET =
  process.env.MARKET_RUNNER_SECRET || process.env.GAME_REWARD_SECRET || 'br9-market-runner-dev-secret';

function startOfDay(now = new Date()) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date;
}

function reference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function createRollingWindow(timestamp) {
  const safeDate = new Date(Number(timestamp || Date.now()));
  const parts = [
    safeDate.getUTCFullYear(),
    String(safeDate.getUTCMonth() + 1).padStart(2, '0'),
    String(safeDate.getUTCDate()).padStart(2, '0'),
    String(safeDate.getUTCHours()).padStart(2, '0'),
  ];
  return parts.join('');
}

function buildRewardSignaturePayload(payload = {}) {
  return JSON.stringify({
    gameType: String(payload.gameType || GAME_TYPE).trim().toLowerCase(),
    sessionId: String(payload.sessionId || '').trim(),
    score: Number(payload.score || 0),
    durationSeconds: Number(payload.durationSeconds || 0),
    timestamp: Number(payload.timestamp || 0),
    collectedNotes: Number(payload.collectedNotes || 0),
    obstaclesCleared: Number(payload.obstaclesCleared || 0),
    utilityDeliveries: Number(payload.utilityDeliveries || 0),
    revivedWithAd: Boolean(payload.revivedWithAd),
    powerUps: payload.powerUps || {},
  });
}

function signRewardPayload(payload = {}) {
  const rollingSecret = crypto
    .createHmac('sha256', GAME_REWARD_SECRET)
    .update(createRollingWindow(payload.timestamp))
    .digest('hex');

  return crypto
    .createHmac('sha256', rollingSecret)
    .update(buildRewardSignaturePayload(payload))
    .digest('hex');
}

function assertRewardIntegrity(payload = {}, signature = '') {
  const timestamp = Number(payload.timestamp || 0);
  if (!timestamp || Math.abs(Date.now() - timestamp) > REWARD_WINDOW_MS) {
    const error = new Error('Game reward payload expired. Play again and resubmit.');
    error.statusCode = 410;
    throw error;
  }

  const expectedSignature = signRewardPayload(payload);
  if (!signature || signature !== expectedSignature) {
    const error = new Error('Game reward signature failed validation.');
    error.statusCode = 401;
    throw error;
  }
}

function estimateMaximumLegitScore(payload = {}) {
  const durationSeconds = Math.max(Number(payload.durationSeconds || 0), 0);
  const collectedNotes = Math.max(Number(payload.collectedNotes || 0), 0);
  const obstaclesCleared = Math.max(Number(payload.obstaclesCleared || 0), 0);
  const utilityDeliveries = Math.max(Number(payload.utilityDeliveries || 0), 0);
  const powerUps = payload.powerUps || {};
  const powerUpBursts =
    Number(powerUps.mtnBoost || 0) +
    Number(powerUps.electricityShield || 0) +
    Number(powerUps.cableMultiplier || 0);

  return (
    durationSeconds * 35 +
    collectedNotes * 50 +
    obstaclesCleared * 25 +
    utilityDeliveries * 120 +
    powerUpBursts * 180 +
    (payload.revivedWithAd ? 240 : 0) +
    500
  );
}

function ensureScoreLooksLegit(payload = {}) {
  const submittedScore = Number(payload.score || 0);
  if (!Number.isFinite(submittedScore) || submittedScore < 0) {
    const error = new Error('A valid score is required.');
    error.statusCode = 400;
    throw error;
  }

  const limit = estimateMaximumLegitScore(payload);
  if (submittedScore > limit) {
    const error = new Error('Submitted score failed BR9ja integrity checks.');
    error.statusCode = 422;
    throw error;
  }
}

function refreshEnergyState(scoreDoc, now = new Date()) {
  const currentBars = Number(scoreDoc.energyBars ?? ENERGY_MAX);
  const updatedAt = scoreDoc.energyUpdatedAt
    ? new Date(scoreDoc.energyUpdatedAt)
    : new Date(now);
  const refillMs = ENERGY_REFILL_HOURS * 60 * 60 * 1000;
  const elapsed = Math.max(now.getTime() - updatedAt.getTime(), 0);
  const restored = refillMs > 0 ? Math.floor(elapsed / refillMs) : 0;

  if (restored <= 0) {
    return {
      energyBars: Math.min(currentBars, ENERGY_MAX),
      energyUpdatedAt: updatedAt,
    };
  }

  const nextBars = Math.min(currentBars + restored, ENERGY_MAX);
  const nextUpdatedAt =
    nextBars >= ENERGY_MAX
      ? new Date(now)
      : new Date(updatedAt.getTime() + restored * refillMs);

  return {
    energyBars: nextBars,
    energyUpdatedAt: nextUpdatedAt,
  };
}

function resetDailyRunWindow(scoreDoc, now = new Date()) {
  const lastPlayed = scoreDoc.lastPlayed ? new Date(scoreDoc.lastPlayed) : null;
  if (!lastPlayed || startOfDay(lastPlayed).getTime() !== startOfDay(now).getTime()) {
    scoreDoc.dailyScore = 0;
    scoreDoc.sessionsPlayedToday = 0;
    scoreDoc.dailyGoldAwarded = 0;
  }
}

async function getOrCreateGameScore(userId, gameType = GAME_TYPE) {
  const existing = await GameScore.findOne({ userId, gameType });
  if (existing) {
    return existing;
  }

  return GameScore.create({
    userId,
    gameType,
    energyBars: ENERGY_MAX,
    energyUpdatedAt: new Date(),
  });
}

async function getLastUtilityPayment(userId) {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return Transaction.findOne({
    userId,
    status: 'success',
    type: { $in: ['Electricity', 'Data'] },
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .lean();
}

function buildObstaclePrompt(obstacleType = '') {
  const obstacle = String(obstacleType || '').trim().toLowerCase();
  if (obstacle.includes('battery') || obstacle.includes('signal')) {
    return {
      title: 'Stay Connected!',
      body: 'Buy MTN, Airtel, Glo, or 9mobile data on BR9ja to boost your next speed run.',
      ctaLabel: 'Buy Data',
      deepLink: '/services.html#data',
      scenario: 'connectivity_boost',
    };
  }

  if (obstacle.includes('pothole') || obstacle.includes('road')) {
    return {
      title: 'Clear the way!',
      body: 'Grab your JAMB or WAEC e-PIN on BR9ja and turn roadblocks into progress.',
      ctaLabel: 'Buy e-PIN',
      deepLink: '/services.html#education',
      scenario: 'education_prompt',
    };
  }

  return {
    title: 'Keep the run alive!',
    body: 'Pay a utility on BR9ja to unlock stronger boosts and cleaner revives in Market Runner.',
    ctaLabel: 'Explore Services',
    deepLink: '/services.html',
    scenario: 'general_conversion',
  };
}

async function buildGameOverPrompt(userId, obstacleType = 'power_outage') {
  const lastPayment = await getLastUtilityPayment(userId);
  const mappedPrompt = buildObstaclePrompt(obstacleType);

  if (lastPayment && String(obstacleType || '').toLowerCase().includes('power')) {
    return {
      scenario: 'active_customer_revive',
      title: 'Reliable energy pays off!',
      body: 'Since you paid your bill on BR9ja recently, you just unlocked a free revive.',
      ctaLabel: 'Free Revive',
      deepLink: '/services.html#electricity',
      freeRevive: true,
      lastUtilityPayment: {
        reference: lastPayment.reference,
        service: lastPayment.type,
        amount: Number(lastPayment.amount || 0),
        createdAt: lastPayment.createdAt,
      },
    };
  }

  if (String(obstacleType || '').toLowerCase().includes('power')) {
    return {
      scenario: 'electricity_conversion',
      title: "Don't let the lights go out!",
      body: 'Pay your electricity bill on BR9ja and unlock 3 extra lives for your next Market Runner session.',
      ctaLabel: 'Pay Now',
      deepLink: '/services.html#electricity',
      freeRevive: false,
      lastUtilityPayment: null,
    };
  }

  return {
    ...mappedPrompt,
    freeRevive: false,
    lastUtilityPayment: lastPayment
      ? {
          reference: lastPayment.reference,
          service: lastPayment.type,
          amount: Number(lastPayment.amount || 0),
          createdAt: lastPayment.createdAt,
        }
      : null,
  };
}

async function buildBillboardMessages() {
  const rows = await listServiceCatalog({ activeOnly: true });
  return rows.slice(0, 6).map((row) => ({
    serviceKey: row.serviceKey,
    label: row.serviceName || row.label,
    price: `₦${Number(row.sellingPrice || 0).toLocaleString()}`,
    provider: row.provider,
  }));
}

async function submitMarketRunnerReward({ user, payload, signature }) {
  assertRewardIntegrity(payload, signature);
  ensureScoreLooksLegit(payload);

  const scoreDoc = await getOrCreateGameScore(user._id, GAME_TYPE);
  const now = new Date();
  const startOfTodayWindow = startOfDay(now);
  resetDailyRunWindow(scoreDoc, now);

  const energyState = refreshEnergyState(scoreDoc, now);
  scoreDoc.energyBars = energyState.energyBars;
  scoreDoc.energyUpdatedAt = energyState.energyUpdatedAt;

  if (scoreDoc.sessionsPlayedToday >= MAX_DAILY_SESSIONS) {
    const error = new Error('Daily Market Runner limit reached. Come back tomorrow for a fresh run.');
    error.statusCode = 429;
    throw error;
  }

  if (scoreDoc.energyBars <= 0) {
    const error = new Error('No Energy Bar left. Wait for refill or use BR9 Gold to refill now.');
    error.statusCode = 429;
    throw error;
  }

  const score = Math.max(Number(payload.score || 0), 0);
  const dailyTransactions = await Transaction.countDocuments({
    userId: user._id,
    status: 'success',
    createdAt: { $gte: startOfTodayWindow },
    type: { $in: ['Airtime', 'Data', 'Electricity', 'CableTV', 'Government', 'Transport'] },
  });
  const rewardMultiplier = dailyTransactions > 0 ? 1.5 : 1;
  const goldAwarded = Math.min(
    Math.floor((score / 100) * rewardMultiplier),
    SESSION_GOLD_CAP
  );

  scoreDoc.energyBars = Math.max(scoreDoc.energyBars - 1, 0);
  scoreDoc.lastPlayed = now;
  scoreDoc.lastPlayScore = score;
  scoreDoc.highScore = Math.max(Number(scoreDoc.highScore || 0), score);
  scoreDoc.dailyScore = Math.max(Number(scoreDoc.dailyScore || 0), score);
  scoreDoc.sessionsPlayedToday = Number(scoreDoc.sessionsPlayedToday || 0) + 1;
  scoreDoc.dailyGoldAwarded = Number(scoreDoc.dailyGoldAwarded || 0) + goldAwarded;
  scoreDoc.lastSessionRewardGold = goldAwarded;
  scoreDoc.metadata = {
    ...(scoreDoc.metadata || {}),
    lastSubmittedAt: now.toISOString(),
    lastSessionId: String(payload.sessionId || '').trim(),
    lastPowerUps: payload.powerUps || {},
  };

  await Promise.all([
    scoreDoc.save(),
    User.updateOne(
      { _id: user._id },
      {
        $inc: {
          br9GoldPoints: goldAwarded,
        },
        $set: {
          marketRunnerEnergyBars: scoreDoc.energyBars,
          marketRunnerEnergyUpdatedAt: scoreDoc.energyUpdatedAt,
        },
      }
    ),
  ]);

  await Transaction.create({
    senderId: user._id,
    userId: user._id,
    senderName: 'BR9 Market Runner',
    receiverName: user.fullName,
    amount: 0,
    type: 'Reward',
    status: 'success',
    timestamp: now,
    reference: reference('MRUN'),
    note: 'Market Runner session reward',
    balanceAfter: Number(user.balance || 0),
    currency: 'NGN',
    metadata: {
      gameType: GAME_TYPE,
      sessionId: String(payload.sessionId || '').trim(),
      score,
      goldAwarded,
    },
  });

  await recordGoldAuditEvent({
    userId: user._id,
    actionType: 'market_runner_session',
    direction: goldAwarded > 0 ? 'mint' : 'transfer',
    amount: goldAwarded,
    note: 'Market Runner session completed.',
    metadata: {
      gameType: GAME_TYPE,
      score,
      sessionId: String(payload.sessionId || '').trim(),
    },
  });

  if (payload.revivedWithAd) {
    await recordAdRevenueContribution({
      userId: user._id,
      source: 'market_runner_revive',
      revenueAmount: Number(payload.adRevenueAmount || process.env.DEFAULT_AD_REVENUE_AMOUNT || 15),
      metadata: {
        gameType: GAME_TYPE,
        sessionId: String(payload.sessionId || '').trim(),
        score,
      },
    });
  }

  return {
    gameType: GAME_TYPE,
    score,
    highScore: scoreDoc.highScore,
    dailyScore: scoreDoc.dailyScore,
    goldAwarded,
    rewardMultiplier,
    rewardMessage: dailyTransactions > 0 ? 'Utility Bonus Applied! ⚡' : 'Base game reward applied.',
    dailyTransactions,
    energyBars: scoreDoc.energyBars,
    sessionsPlayedToday: scoreDoc.sessionsPlayedToday,
    maxDailySessions: MAX_DAILY_SESSIONS,
  };
}

async function getMarketRunnerState(user) {
  const scoreDoc = await getOrCreateGameScore(user._id, GAME_TYPE);
  const now = new Date();
  resetDailyRunWindow(scoreDoc, now);
  const energyState = refreshEnergyState(scoreDoc, now);

  if (
    energyState.energyBars !== scoreDoc.energyBars ||
    energyState.energyUpdatedAt.getTime() !== new Date(scoreDoc.energyUpdatedAt).getTime()
  ) {
    scoreDoc.energyBars = energyState.energyBars;
    scoreDoc.energyUpdatedAt = energyState.energyUpdatedAt;
    await scoreDoc.save();
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          marketRunnerEnergyBars: scoreDoc.energyBars,
          marketRunnerEnergyUpdatedAt: scoreDoc.energyUpdatedAt,
        },
      }
    );
  }

  return {
    gameType: GAME_TYPE,
    energyBars: scoreDoc.energyBars,
    energyMax: ENERGY_MAX,
    energyRefillHours: ENERGY_REFILL_HOURS,
    energyRefillGoldCost: ENERGY_REFILL_GOLD_COST,
    highScore: Number(scoreDoc.highScore || 0),
    dailyScore: Number(scoreDoc.dailyScore || 0),
    sessionsPlayedToday: Number(scoreDoc.sessionsPlayedToday || 0),
    maxDailySessions: MAX_DAILY_SESSIONS,
    dailyGoldAwarded: Number(scoreDoc.dailyGoldAwarded || 0),
    billboardMessages: await buildBillboardMessages(),
  };
}

async function refillMarketRunnerEnergy(user) {
  const scoreDoc = await getOrCreateGameScore(user._id, GAME_TYPE);
  const currentUser = await User.findById(user._id);
  if (!currentUser) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (Number(currentUser.br9GoldBalance || 0) < ENERGY_REFILL_GOLD_COST) {
    const error = new Error('You need at least 10 spendable BR9 Gold to refill energy instantly.');
    error.statusCode = 422;
    throw error;
  }

  scoreDoc.energyBars = ENERGY_MAX;
  scoreDoc.energyUpdatedAt = new Date();
  await Promise.all([
    scoreDoc.save(),
    User.updateOne(
      { _id: currentUser._id },
      {
        $inc: { br9GoldBalance: -ENERGY_REFILL_GOLD_COST },
        $set: {
          marketRunnerEnergyBars: ENERGY_MAX,
          marketRunnerEnergyUpdatedAt: scoreDoc.energyUpdatedAt,
        },
      }
    ),
  ]);

  await Transaction.create({
    senderId: currentUser._id,
    userId: currentUser._id,
    senderName: currentUser.fullName,
    receiverName: 'BR9 Market Runner',
    amount: 0,
    type: 'Reward',
    status: 'success',
    timestamp: new Date(),
    reference: reference('ENERGY'),
    note: 'BR9 Gold used for Market Runner energy refill',
    balanceAfter: Number(currentUser.balance || 0),
    currency: 'NGN',
    metadata: {
      gameType: GAME_TYPE,
      goldSpent: ENERGY_REFILL_GOLD_COST,
      energyBars: ENERGY_MAX,
    },
  });

  await recordGoldAuditEvent({
    userId: currentUser._id,
    actionType: 'market_runner_energy_refill',
    direction: 'burn',
    amount: ENERGY_REFILL_GOLD_COST,
    note: 'BR9 Gold used for Market Runner energy refill.',
    metadata: {
      gameType: GAME_TYPE,
      energyBars: ENERGY_MAX,
    },
  });

  return {
    energyBars: ENERGY_MAX,
    goldSpent: ENERGY_REFILL_GOLD_COST,
  };
}

async function trackGamePopupClick({
  userId,
  obstacleType = '',
  scenario = '',
  cta = '',
  clicked = true,
  converted = false,
  metadata = {},
}) {
  const popup = await GamePopupClick.create({
    userId,
    gameType: GAME_TYPE,
    obstacleType,
    scenario,
    cta,
    clicked,
    converted,
    metadata,
  });

  await GameScore.updateOne(
    { userId, gameType: GAME_TYPE },
    { $inc: { popupClickCount: clicked ? 1 : 0 }, $set: { lastPromptScenario: scenario } }
  );

  return popup;
}

async function getMarketRunnerLeaderboard(limit = 10) {
  const scores = await GameScore.find({
    gameType: GAME_TYPE,
    dailyScore: { $gt: 0 },
  })
    .sort({ dailyScore: -1, highScore: -1, lastPlayed: 1 })
    .limit(limit)
    .lean();

  const userIds = scores.map((row) => row.userId);
  const users = await User.find({ _id: { $in: userIds } })
    .select('fullName bayrightTag')
    .lean();
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  return scores.map((row, index) => {
    const user = userMap.get(String(row.userId)) || {};
    return {
      rank: index + 1,
      userId: String(row.userId),
      fullName: user.fullName || 'BR9ja Player',
      bayrightTag: user.bayrightTag || '',
      highScore: Number(row.highScore || 0),
      dailyScore: Number(row.dailyScore || 0),
      lastPlayed: row.lastPlayed,
    };
  });
}

async function awardChampionBonus() {
  const winners = await getMarketRunnerLeaderboard(10);
  if (!winners.length) {
    await GameScore.updateMany(
      { gameType: GAME_TYPE },
      { $set: { dailyScore: 0, sessionsPlayedToday: 0, dailyGoldAwarded: 0 } }
    );
    return { winnerCount: 0 };
  }

  for (const winner of winners) {
    const user = await User.findByIdAndUpdate(
      winner.userId,
      { $inc: { br9GoldPoints: CHAMPION_BONUS_GOLD } },
      { new: true }
    );

    if (!user) {
      continue;
    }

    await Promise.all([
      Transaction.create({
        senderId: user._id,
        userId: user._id,
        senderName: 'BR9 Market Runner',
        receiverName: user.fullName,
        amount: 0,
        type: 'Reward',
        status: 'success',
        timestamp: new Date(),
        reference: reference('MCHAMP'),
        note: "Champion's Bonus",
        balanceAfter: Number(user.balance || 0),
        currency: 'NGN',
        metadata: {
          gameType: GAME_TYPE,
          bonusGold: CHAMPION_BONUS_GOLD,
          dailyScore: winner.dailyScore,
        },
      }),
      UserNotification.create({
        userId: user._id,
        title: 'Market Runner Champion',
        body: '🏆 You finished Top 10 in Market Runner! 50 Gold added to your wallet.',
        type: 'game_reward',
        status: 'queued',
        metadata: {
          gameType: GAME_TYPE,
          bonusGold: CHAMPION_BONUS_GOLD,
        },
      }),
      sendSendchampPush({
        user: {
          id: user._id.toString(),
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        title: 'Market Runner Champion',
        body: '🏆 You finished Top 10 in Market Runner! 50 Gold added to your wallet.',
        data: {
          gameType: GAME_TYPE,
          bonusGold: CHAMPION_BONUS_GOLD,
        },
      }),
      sendSendchampMessage({
        channel: 'whatsapp',
        to: user.phoneNumber,
        message:
          '🏆 You finished Top 10 in Market Runner! 50 Gold added to your BR9ja wallet.',
      }),
      recordGoldAuditEvent({
        userId: user._id,
        actionType: 'market_runner_champion_bonus',
        direction: 'mint',
        amount: CHAMPION_BONUS_GOLD,
        note: "Champion's Bonus",
        metadata: {
          gameType: GAME_TYPE,
          dailyScore: winner.dailyScore,
        },
      }),
    ]);
  }

  await GameScore.updateMany(
    { gameType: GAME_TYPE },
    { $set: { dailyScore: 0, sessionsPlayedToday: 0, dailyGoldAwarded: 0 } }
  );

  return { winnerCount: winners.length };
}

function startMarketRunnerEngine() {
  cron.schedule(
    '59 23 * * *',
    () => {
      void awardChampionBonus().catch((error) => {
        console.warn('Market Runner champion bonus failed.', error?.message || error);
      });
    },
    {
      timezone: process.env.CRON_TIMEZONE || 'Africa/Lagos',
    }
  );
}

module.exports = {
  ENERGY_REFILL_GOLD_COST,
  GAME_TYPE,
  buildGameOverPrompt,
  getLastUtilityPayment,
  getMarketRunnerLeaderboard,
  getMarketRunnerState,
  refillMarketRunnerEnergy,
  signRewardPayload,
  startMarketRunnerEngine,
  submitMarketRunnerReward,
  trackGamePopupClick,
  awardChampionBonus,
};
