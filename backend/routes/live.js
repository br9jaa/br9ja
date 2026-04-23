'use strict';

const express = require('express');
const mongoose = require('mongoose');

const {
  LIVE_CODE_MAX_WINNERS,
  LIVE_CODE_REWARD_POINTS,
} = require('../config/constants');
const { authenticateAccessToken } = require('../middleware/security.middleware');
const { LiveEvent, Transaction, User } = require('../models');

const router = express.Router();

router.use(authenticateAccessToken);

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function reference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

router.get('/state', async (_req, res, next) => {
  try {
    const event = await LiveEvent.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: event
        ? {
            isActive: true,
            currentQuestion: event.currentQuestion,
            rewardPool: event.rewardPool,
            winnerCount: event.winnerIds?.length || 0,
          }
        : { isActive: false, currentQuestion: '', rewardPool: 0, winnerCount: 0 },
      message: 'Live event state fetched.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/submit-code', async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const liveCode = String(req.body?.liveCode || '').trim();
    if (!liveCode) {
      throw httpError(400, 'liveCode is required.');
    }

    let payload;
    await session.withTransaction(async () => {
      const event = await LiveEvent.findOne({ isActive: true }).session(session);
      if (!event || event.liveCode !== liveCode) {
        throw httpError(422, 'That live code is not active.');
      }

      if (event.winnerIds.some((id) => id.equals(req.user._id))) {
        payload = {
          alreadyWon: true,
          awardedPoints: 0,
          br9GoldPoints: req.user.br9GoldPoints,
          winnerCount: event.winnerIds.length,
        };
        return;
      }

      if (event.winnerIds.length >= LIVE_CODE_MAX_WINNERS) {
        throw httpError(409, 'The live reward window is already full.');
      }

      event.winnerIds.push(req.user._id);
      await event.save({ session });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { br9GoldPoints: LIVE_CODE_REWARD_POINTS } },
        { new: true, session }
      );

      await Transaction.create(
        [
          {
            senderId: req.user._id,
            userId: req.user._id,
            senderName: 'BR9 Live',
            receiverName: user.fullName,
            amount: 0,
            type: 'Reward',
            status: 'success',
            timestamp: new Date(),
            reference: reference('LIVE'),
            note: 'Sunday live fastest finger reward',
            balanceAfter: user.balance,
            currency: 'NGN',
            metadata: {
              liveEventId: event._id.toString(),
              awardedPoints: LIVE_CODE_REWARD_POINTS,
              winnerPosition: event.winnerIds.length,
            },
          },
        ],
        { session }
      );

      payload = {
        alreadyWon: false,
        awardedPoints: LIVE_CODE_REWARD_POINTS,
        br9GoldPoints: user.br9GoldPoints,
        winnerCount: event.winnerIds.length,
      };
    });

    res.status(201).json({
      success: true,
      data: payload,
      message: payload.alreadyWon
        ? 'You already claimed this live reward.'
        : 'Live reward claimed successfully.',
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

module.exports = router;
