'use strict';

const cron = require('node-cron');
const mongoose = require('mongoose');

const {
  DAILY_LOGIN_POINTS,
  GOLD_TO_NAIRA_RATIO,
  REFERRAL_POINTS,
} = require('../config/constants');
const { Transaction, User } = require('../models');

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

async function awardDailyLoginPoints() {
  const today = startOfToday();
  const activeSince = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const result = await User.updateMany(
    {
      lastLoginAt: { $gte: activeSince },
      $or: [
        { lastDailyPointAwardAt: null },
        { lastDailyPointAwardAt: { $lt: today } },
      ],
    },
    {
      $inc: { br9GoldPoints: DAILY_LOGIN_POINTS },
      $set: { lastDailyPointAwardAt: new Date() },
    }
  );

  return result.modifiedCount || 0;
}

async function awardReferralPoints(userId) {
  const user = await User.findById(userId).select('referredBy').lean();
  if (!user?.referredBy) {
    return false;
  }

  await User.updateOne(
    { _id: user.referredBy },
    { $inc: { br9GoldPoints: REFERRAL_POINTS } }
  );
  return true;
}

async function runMondayPayout() {
  const session = await mongoose.startSession();
  let convertedUsers = 0;

  try {
    await session.withTransaction(async () => {
      const users = await User.find({ br9GoldPoints: { $gt: 0 } }).session(
        session
      );

      for (const user of users) {
        const points = Number(user.br9GoldPoints || 0);
        const nairaValue = Number((points * GOLD_TO_NAIRA_RATIO).toFixed(2));

        if (nairaValue <= 0) {
          continue;
        }

        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id, br9GoldPoints: points },
          {
            $inc: { balance: nairaValue },
            $set: { br9GoldPoints: 0 },
          },
          { new: true, session }
        );

        if (!updatedUser) {
          continue;
        }

        await Transaction.create(
          [
            {
              senderId: user._id,
              userId: user._id,
              senderName: 'BR9 Gold Engine',
              receiverName: user.fullName,
              amount: nairaValue,
              type: 'PointConversion',
              status: 'success',
              timestamp: new Date(),
              reference: `BR9-GOLD-${Date.now().toString(36).toUpperCase()}-${user._id
                .toString()
                .slice(-6)
                .toUpperCase()}`,
              note: `Converted ${points} BR9 Gold points.`,
              balanceAfter: updatedUser.balance,
              currency: 'NGN',
              metadata: { pointsConverted: points, ratio: GOLD_TO_NAIRA_RATIO },
            },
          ],
          { session }
        );

        convertedUsers += 1;
      }
    });
  } finally {
    await session.endSession();
  }

  return convertedUsers;
}

async function getWeeklyLeaderboard(limit = 10) {
  return User.find({ br9GoldPoints: { $gt: 0 } })
    .select('fullName bayrightTag br9GoldPoints')
    .sort({ br9GoldPoints: -1, updatedAt: 1 })
    .limit(limit)
    .lean();
}

function startPayoutEngine() {
  cron.schedule('0 0 * * *', awardDailyLoginPoints, {
    timezone: process.env.CRON_TIMEZONE || 'Africa/Lagos',
  });
}

module.exports = {
  awardDailyLoginPoints,
  awardReferralPoints,
  getWeeklyLeaderboard,
  runMondayPayout,
  startPayoutEngine,
};
