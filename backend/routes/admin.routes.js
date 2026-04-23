'use strict';

const express = require('express');
const mongoose = require('mongoose');

const {
  Ad,
  LiveEvent,
  Transaction,
  TransportBooking,
  User,
  UserNotification,
} = require('../models');
const { getWeeklyLeaderboard } = require('../jobs/payout_engine');
const {
  getConfiguredGoldToNairaRatio,
  setConfiguredGoldToNairaRatio,
} = require('../jobs/payout_processor');

const router = express.Router();

function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') {
    const error = new Error('Admin access required.');
    error.statusCode = 403;
    return next(error);
  }
  return next();
}

router.use(requireAdmin);

router.post('/broadcast-ad', async (req, res, next) => {
  try {
    const title = String(req.body?.title || '').trim();
    const image = String(req.body?.image || '').trim();
    const targetUrl = String(req.body?.targetUrl || '').trim();

    if (!title || !image || !targetUrl) {
      const error = new Error('title, image, and targetUrl are required.');
      error.statusCode = 400;
      throw error;
    }

    const [ad, recipientCount] = await Promise.all([
      Ad.create({ title, image, targetUrl, active: true }),
      User.countDocuments({}),
    ]);

    res.status(202).json({
      success: true,
      data: {
        adId: ad._id.toString(),
        queuedRecipients: recipientCount,
        pushProvider: process.env.PUSH_PROVIDER || 'not_configured',
      },
      message: 'Broadcast campaign queued.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/gold-rate', async (_req, res, next) => {
  try {
    const ratio = await getConfiguredGoldToNairaRatio();
    res.json({
      success: true,
      data: { goldToNairaRatio: ratio },
      message: 'BR9 Gold-to-Naira rate fetched.',
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/gold-rate', async (req, res, next) => {
  try {
    const ratio = Number(req.body?.goldToNairaRatio);
    if (!Number.isFinite(ratio) || ratio <= 0) {
      const error = new Error('A positive goldToNairaRatio is required.');
      error.statusCode = 400;
      throw error;
    }

    const setting = await setConfiguredGoldToNairaRatio(ratio, req.user._id);
    res.json({
      success: true,
      data: {
        key: setting.key,
        goldToNairaRatio: Number(setting.value),
        updatedAt: setting.updatedAt,
      },
      message: 'BR9 Gold-to-Naira rate updated.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/leaderboard', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query?.limit || 10), 50);
    const rows = await getWeeklyLeaderboard(limit);
    res.json({
      success: true,
      data: rows.map((user, index) => ({
        rank: index + 1,
        userId: user._id.toString(),
        fullName: user.fullName,
        bayrightTag: user.bayrightTag,
        br9GoldPoints: user.br9GoldPoints,
      })),
      message: 'Leaderboard fetched.',
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/manual-reward', async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const userId = String(req.body?.userId || '').trim();
    const amount = Number(req.body?.amount || 0);
    const rewardLabel = String(req.body?.rewardLabel || 'Manual reward').trim();

    if (!userId || amount < 0) {
      const error = new Error('userId and a non-negative amount are required.');
      error.statusCode = 400;
      throw error;
    }

    let payload;
    await session.withTransaction(async () => {
      const update =
        amount > 0
          ? { $inc: { balance: amount } }
          : { $set: { updatedAt: new Date() } };
      const user = await User.findByIdAndUpdate(userId, update, {
        new: true,
        session,
      });

      if (!user) {
        const error = new Error('Reward recipient not found.');
        error.statusCode = 404;
        throw error;
      }

      const [transaction] = await Transaction.create(
        [
          {
            senderId: user._id,
            senderName: 'BR9 Admin',
            receiverName: user.fullName,
            amount,
            type: 'Reward',
            status: 'success',
            timestamp: new Date(),
            reference: `BR9-REWARD-${Date.now().toString(36).toUpperCase()}`,
            note: rewardLabel,
            balanceAfter: user.balance,
            currency: 'NGN',
            metadata: { fulfilled: true, rewardLabel },
          },
        ],
        { session }
      );

      payload = {
        userId: user._id.toString(),
        balance: user.balance,
        rewardTransactionId: transaction._id.toString(),
        fulfilled: true,
      };
    });

    res.json({
      success: true,
      data: payload,
      message: 'Manual reward fulfilled.',
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

router.patch('/users/:userId/freeze', async (req, res, next) => {
  try {
    const userId = String(req.params.userId || '').trim();
    const freeze = req.body?.freeze !== false;
    const reason = String(req.body?.reason || '').trim();

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isFrozen: freeze,
          freezeReason: freeze ? reason : '',
          frozenAt: freeze ? new Date() : null,
        },
      },
      { new: true }
    );

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    await UserNotification.create({
      userId: user._id,
      title: freeze ? 'Account Frozen' : 'Account Restored',
      body: freeze
        ? `Your account has been frozen for review${reason ? `: ${reason}` : '.'}`
        : 'Your account has been restored. You can continue using BR9ja.',
      type: 'account-status',
      status: 'queued',
      metadata: { reason },
    });

    res.json({
      success: true,
      data: {
        userId: user._id.toString(),
        isFrozen: user.isFrozen,
        freezeReason: user.freezeReason,
        frozenAt: user.frozenAt,
      },
      message: freeze ? 'Account frozen.' : 'Account unfrozen.',
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/transport-bookings/:bookingId/fulfill', async (req, res, next) => {
  try {
    const bookingId = String(req.params.bookingId || '').trim();
    const status = String(req.body?.status || 'fulfilled').trim();

    const booking = await TransportBooking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          status,
          adminNotifiedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!booking) {
      const error = new Error('Transport booking not found.');
      error.statusCode = 404;
      throw error;
    }

    await UserNotification.create({
      userId: booking.userId,
      title: 'Transport Booking Update',
      body: `Your ${booking.operator} booking request is now marked ${status}.`,
      type: 'transport-booking',
      status: 'queued',
      metadata: {
        bookingId: booking._id.toString(),
        reference: booking.reference,
      },
    });

    res.json({
      success: true,
      data: {
        bookingId: booking._id.toString(),
        status: booking.status,
        reference: booking.reference,
      },
      message: 'Transport booking updated.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/trigger-live-event', async (req, res, next) => {
  try {
    const liveCode = String(
      req.body?.liveCode || Math.floor(1000 + Math.random() * 9000)
    ).trim();
    const currentQuestion = String(
      req.body?.currentQuestion || 'Enter the live code now!'
    ).trim();
    const rewardPool = Number(req.body?.rewardPool || 0);

    await LiveEvent.updateMany({ isActive: true }, { $set: { isActive: false, endedAt: new Date() } });
    const event = await LiveEvent.create({
      isActive: true,
      currentQuestion,
      liveCode,
      rewardPool,
      winnerIds: [],
    });

    res.status(201).json({
      success: true,
      data: {
        eventId: event._id.toString(),
        liveCode,
        currentQuestion,
        rewardPool,
        pushProvider: process.env.PUSH_PROVIDER || 'not_configured',
      },
      message: 'Live event triggered and push broadcast queued.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/live-stats', async (_req, res, next) => {
  try {
    const event = await LiveEvent.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
    const activeUsers = await User.find({})
      .sort({ lastLoginAt: -1, br9GoldPoints: -1 })
      .limit(10)
      .select('fullName bayrightTag br9GoldPoints lastLoginAt')
      .lean();

    res.json({
      success: true,
      data: {
        isActive: Boolean(event),
        eventId: event?._id?.toString() || '',
        liveCode: event?.liveCode || '',
        winnerCount: event?.winnerIds?.length || 0,
        activeUsers: activeUsers.map((user) => ({
          id: user._id.toString(),
          fullName: user.fullName,
          bayrightTag: user.bayrightTag,
          br9GoldPoints: user.br9GoldPoints,
          lastLoginAt: user.lastLoginAt,
        })),
      },
      message: 'Live stats fetched.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/end-live-session', async (_req, res, next) => {
  try {
    const result = await LiveEvent.updateMany(
      { isActive: true },
      { $set: { isActive: false, endedAt: new Date() } }
    );

    res.json({
      success: true,
      data: {
        endedSessions: result.modifiedCount,
        payoutReady: true,
      },
      message: 'Live session ended. Weekly points are ready for payout freeze review.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
