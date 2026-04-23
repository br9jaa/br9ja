'use strict';

const cron = require('node-cron');
const mongoose = require('mongoose');

const { GOLD_TO_NAIRA_RATIO } = require('../config/constants');
const { AppSetting, Transaction, User, UserNotification } = require('../models');

const GOLD_RATE_KEY = 'goldToNairaRatio';
const WEEKLY_MINIMUM_POINTS = Number(process.env.WEEKLY_PAYOUT_MIN_GOLD || 1000);

function buildReference(userId) {
  return `BR9-WEEKLY-${Date.now().toString(36).toUpperCase()}-${userId
    .toString()
    .slice(-6)
    .toUpperCase()}`;
}

async function getConfiguredGoldToNairaRatio(session = null) {
  const query = AppSetting.findOne({ key: GOLD_RATE_KEY });
  if (session) {
    query.session(session);
  }
  const setting = await query.lean();
  return Number(setting?.value ?? GOLD_TO_NAIRA_RATIO);
}

async function setConfiguredGoldToNairaRatio(value, updatedBy = null) {
  return AppSetting.findOneAndUpdate(
    { key: GOLD_RATE_KEY },
    { $set: { value: Number(value), updatedBy } },
    { upsert: true, new: true }
  );
}

async function runWeeklyRewardResurrection() {
  const session = await mongoose.startSession();
  let processedUsers = 0;

  try {
    await session.withTransaction(async () => {
      const ratio = await getConfiguredGoldToNairaRatio(session);
      const users = await User.find({
        br9GoldPoints: { $gt: WEEKLY_MINIMUM_POINTS },
      }).session(session);

      for (const user of users) {
        const points = Number(user.br9GoldPoints || 0);
        const nairaValue = Number((points * ratio).toFixed(2));
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
              senderId: updatedUser._id,
              userId: updatedUser._id,
              senderName: 'BR9 Weekly Payout',
              receiverName: updatedUser.fullName,
              amount: nairaValue,
              type: 'PointConversion',
              status: 'success',
              timestamp: new Date(),
              reference: buildReference(updatedUser._id),
              note: 'Weekly Reward Resurrection',
              balanceAfter: updatedUser.balance,
              currency: 'NGN',
              metadata: {
                pointsConverted: points,
                ratio,
                source: 'weekly-payout-processor',
              },
            },
          ],
          { session }
        );

        await UserNotification.create(
          [
            {
              userId: updatedUser._id,
              title: 'Weekly BR9 Gold Payout',
              body:
                'Good morning! Your hard work paid off. Check your wallet for your weekly gold payout.',
              type: 'weekly-payout',
              status: 'queued',
              metadata: {
                creditedAmount: nairaValue,
                pointsConverted: points,
              },
            },
          ],
          { session }
        );

        processedUsers += 1;
      }
    });
  } finally {
    await session.endSession();
  }

  return processedUsers;
}

function startPayoutProcessor() {
  cron.schedule('0 6 * * 1', runWeeklyRewardResurrection, {
    timezone: process.env.CRON_TIMEZONE || 'Africa/Lagos',
  });
}

module.exports = {
  getConfiguredGoldToNairaRatio,
  runWeeklyRewardResurrection,
  setConfiguredGoldToNairaRatio,
  startPayoutProcessor,
};
