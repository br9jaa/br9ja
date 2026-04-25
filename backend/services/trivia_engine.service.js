'use strict';

const cron = require('node-cron');

const {
  GoldTransaction,
  Transaction,
  Trivia,
  TriviaSession,
  User,
  UserNotification,
} = require('../models');
const { sendSendchampPush } = require('./sendchamp.service');

function reference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function nextSundayAtSeven(now = new Date()) {
  const base = new Date(now);
  const day = base.getDay();
  const daysUntilSunday = (7 - day) % 7;
  base.setDate(base.getDate() + daysUntilSunday);
  base.setHours(19, 0, 0, 0);
  if (base.getTime() <= now.getTime()) {
    base.setDate(base.getDate() + 7);
  }
  return base;
}

function parseCsvText(csvText = '') {
  const rows = String(csvText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!rows.length) {
    return [];
  }

  const [header, ...body] = rows;
  const headers = header.split(',').map((item) => item.trim().toLowerCase());

  return body.map((line) => {
    const cells = line.split(',').map((item) => item.trim());
    return headers.reduce((accumulator, key, index) => {
      accumulator[key] = cells[index] || '';
      return accumulator;
    }, {});
  });
}

async function bulkUploadTriviaCsv(csvText, actorLabel = 'Site Admin') {
  const parsed = parseCsvText(csvText).map((row) => {
    const options = [
      row.option_a || row.a,
      row.option_b || row.b,
      row.option_c || row.c,
      row.option_d || row.d,
    ].filter(Boolean);
    const correctLetter = String(row.correct || row.answer || 'a').trim().toLowerCase();
    const indexMap = { a: 0, b: 1, c: 2, d: 3 };
    return {
      question: row.question || '',
      options,
      correctOptionIndex: indexMap[correctLetter] ?? 0,
      category: row.category || 'brands',
      rewardPoints: Number(row.reward_points || row.rewardpoints || 5),
      active: true,
      metadata: {
        uploadedBy: actorLabel,
      },
    };
  });

  const validRows = parsed.filter(
    (row) => row.question && Array.isArray(row.options) && row.options.length >= 2
  );

  if (!validRows.length) {
    const error = new Error('CSV did not contain valid trivia rows.');
    error.statusCode = 400;
    throw error;
  }

  const inserted = await Trivia.insertMany(validRows, { ordered: false });
  return {
    insertedCount: inserted.length,
  };
}

async function ensureUpcomingTriviaSession() {
  const upcoming = await TriviaSession.findOne({
    state: { $in: ['scheduled', 'waiting_room', 'live'] },
  }).sort({ scheduledFor: 1 });

  if (upcoming) {
    return upcoming;
  }

  const questionIds = await Trivia.find({ active: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('_id')
    .lean();

  return TriviaSession.create({
    title: 'Sunday Live Trivia Rush',
    state: 'scheduled',
    scheduledFor: nextSundayAtSeven(),
    opensAt: nextSundayAtSeven(),
    closesAt: new Date(nextSundayAtSeven().getTime() + 15 * 60 * 1000),
    questionIds: questionIds.slice(0, 10).map((row) => row._id),
    rewardLabel: '₦5,000 Data',
  });
}

async function getCurrentTriviaSession() {
  await ensureUpcomingTriviaSession();
  return TriviaSession.findOne({
    state: { $in: ['scheduled', 'waiting_room', 'live'] },
  }).sort({ scheduledFor: 1 });
}

async function getTriviaSessionState(user = null) {
  const session = await getCurrentTriviaSession();
  if (!session) {
    return null;
  }

  const participant = user
    ? session.participants.find(
        (entry) => String(entry.userId) === String(user._id || user.id || '')
      )
    : null;

  return {
    id: session._id.toString(),
    title: session.title,
    state: session.state,
    scheduledFor: session.scheduledFor,
    opensAt: session.opensAt,
    closesAt: session.closesAt,
    entryGoldCost: session.entryGoldCost,
    questionTimeLimitSeconds: session.questionTimeLimitSeconds,
    maxQuestions: session.maxQuestions,
    rewardLabel: session.rewardLabel,
    joined: Boolean(participant),
    joinedAt: participant?.joinedAt || null,
    participantScore: Number(participant?.score || 0),
    canJoin: user
      ? Number(user.br9GoldBalance || 0) + Number(user.br9GoldLockedBalance || 0) >=
        Number(session.entryGoldCost || 0)
      : false,
  };
}

async function joinTriviaSession(user) {
  const session = await getCurrentTriviaSession();
  if (!session) {
    const error = new Error('Trivia Rush is not scheduled yet.');
    error.statusCode = 404;
    throw error;
  }

  const totalGold =
    Number(user.br9GoldBalance || 0) + Number(user.br9GoldLockedBalance || 0);
  if (totalGold < Number(session.entryGoldCost || 0)) {
    const error = new Error('You need at least 50 BR9 Gold to join Trivia Rush.');
    error.statusCode = 422;
    throw error;
  }

  const exists = session.participants.some(
    (entry) => String(entry.userId) === String(user._id)
  );
  if (!exists) {
    session.participants.push({
      userId: user._id,
      joinedAt: new Date(),
    });
    if (session.state === 'scheduled') {
      session.state = 'waiting_room';
    }
    await session.save();
  }

  const questionIds = session.questionIds.slice(0, session.maxQuestions);
  const questions = await Trivia.find({ _id: { $in: questionIds }, active: true })
    .lean();

  return {
    sessionId: session._id.toString(),
    state: session.state,
    questions: questionIds
      .map((id) => questions.find((question) => String(question._id) === String(id)))
      .filter(Boolean)
      .map((question) => ({
        id: question._id.toString(),
        question: question.question,
        options: question.options,
        category: question.category,
      })),
    entryGoldCost: session.entryGoldCost,
    rewardLabel: session.rewardLabel,
  };
}

async function submitTriviaSessionAnswers({ sessionId, user, answers = [] }) {
  const session = await TriviaSession.findById(sessionId);
  if (!session) {
    const error = new Error('Trivia session not found.');
    error.statusCode = 404;
    throw error;
  }

  const questions = await Trivia.find({
    _id: { $in: session.questionIds.slice(0, session.maxQuestions) },
    active: true,
  }).lean();
  const answerMap = new Map(
    answers.map((row) => [String(row.questionId || ''), Number(row.selectedOptionIndex)])
  );

  let correctAnswers = 0;
  questions.forEach((question) => {
    if (answerMap.get(String(question._id)) === Number(question.correctOptionIndex)) {
      correctAnswers += 1;
    }
  });

  const score = correctAnswers * 10;
  const participant = session.participants.find(
    (entry) => String(entry.userId) === String(user._id)
  );
  if (!participant) {
    const error = new Error('Join the waiting room first.');
    error.statusCode = 409;
    throw error;
  }

  participant.score = score;
  participant.correctAnswers = correctAnswers;
  participant.completed = true;
  if (session.state !== 'closed' && session.state !== 'settled') {
    session.state = 'live';
  }
  await session.save();

  return {
    sessionId: session._id.toString(),
    score,
    correctAnswers,
    maxQuestions: session.maxQuestions,
    perfectScore: correctAnswers === session.maxQuestions,
  };
}

async function settleTriviaSession(sessionId) {
  const session = await TriviaSession.findById(sessionId);
  if (!session) {
    return { settled: false, reason: 'missing-session' };
  }

  const winners = session.participants.filter(
    (participant) => participant.completed && participant.correctAnswers === session.maxQuestions
  );
  const splitGold = winners.length ? Math.max(Math.floor(5000 / winners.length), 1) : 0;

  for (const winner of winners) {
    const user = await User.findByIdAndUpdate(
      winner.userId,
      { $inc: { br9GoldPoints: splitGold } },
      { new: true }
    );
    if (!user) {
      continue;
    }

    winner.prizeAwardedGold = splitGold;

    await Promise.all([
      GoldTransaction.create({
        userId: user._id,
        source: 'trivia_rush_prize',
        amount: splitGold,
        direction: 'credit',
        balanceAfter: Number(user.br9GoldPoints || 0),
        locked: false,
        note: 'Sunday Live Trivia prize.',
        reference: reference('TRIVIAGOLD'),
        metadata: {
          sessionId: session._id.toString(),
          rewardLabel: session.rewardLabel,
        },
      }),
      Transaction.create({
        senderId: user._id,
        userId: user._id,
        senderName: 'BR9 Trivia Rush',
        receiverName: user.fullName,
        amount: 0,
        type: 'Reward',
        status: 'success',
        timestamp: new Date(),
        reference: reference('TRIVIAPRIZE'),
        note: 'Sunday Live Trivia prize',
        balanceAfter: Number(user.balance || 0),
        currency: 'NGN',
        metadata: {
          sessionId: session._id.toString(),
          goldAwarded: splitGold,
          rewardLabel: session.rewardLabel,
        },
      }),
    ]);
  }

  session.state = 'settled';
  await session.save();
  return {
    settled: true,
    winnerCount: winners.length,
    splitGold,
  };
}

async function notifyTriviaRushLive() {
  const session = await ensureUpcomingTriviaSession();
  const users = await User.find({ accountDeletedAt: null })
    .select('email phoneNumber')
    .limit(200)
    .lean();

  await Promise.all(
    users.map((user) =>
      sendSendchampPush({
        user: {
          id: user._id.toString(),
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        title: 'Trivia Rush is LIVE! 🧠',
        body: 'Trivia Rush is LIVE! 🧠 Join now to win ₦5,000 Data.',
        data: {
          sessionId: session._id.toString(),
          type: 'trivia_rush',
        },
      }).catch(() => null)
    )
  );

  session.state = 'waiting_room';
  await session.save();
  return session;
}

function startTriviaScheduler() {
  cron.schedule(
    '0 19 * * 0',
    () => {
      void notifyTriviaRushLive().catch((error) => {
        console.warn('Trivia Rush live notification failed.', error?.message || error);
      });
    },
    {
      timezone: process.env.CRON_TIMEZONE || 'Africa/Lagos',
    }
  );

  cron.schedule(
    '20 19 * * 0',
    async () => {
      try {
        const session = await getCurrentTriviaSession();
        if (session) {
          await settleTriviaSession(session._id);
        }
      } catch (error) {
        console.warn('Trivia Rush settlement failed.', error?.message || error);
      }
    },
    {
      timezone: process.env.CRON_TIMEZONE || 'Africa/Lagos',
    }
  );
}

module.exports = {
  bulkUploadTriviaCsv,
  ensureUpcomingTriviaSession,
  getCurrentTriviaSession,
  getTriviaSessionState,
  joinTriviaSession,
  notifyTriviaRushLive,
  settleTriviaSession,
  startTriviaScheduler,
  submitTriviaSessionAnswers,
};
