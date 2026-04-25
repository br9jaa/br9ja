'use strict';

const {
  GoldTransaction,
  Transaction,
  Trivia,
  TriviaSession,
  User,
  UserNotification,
} = require('../models');
const { sendSendchampPush } = require('./sendchamp.service');

const DEFAULT_TRIVIA_TITLE = 'Sunday Live Trivia Rush';
const DEFAULT_TRIVIA_REWARD_LABEL = '₦5,000 Data';
const DEFAULT_TRIVIA_PRIZE_GOLD = Number(process.env.TRIVIA_PRIZE_POOL_GOLD || 500);

function reference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function startOfSundayWindow(baseDate = new Date()) {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = (7 - day) % 7;
  date.setDate(date.getDate() + diff);
  date.setHours(19, 0, 0, 0);
  return date;
}

function endOfSundayWindow(startAt) {
  const date = new Date(startAt);
  date.setMinutes(date.getMinutes() + 20);
  return date;
}

async function ensureSeedTriviaQuestions() {
  const count = await Trivia.countDocuments({});
  if (count > 0) {
    return;
  }

  await Trivia.insertMany([
    {
      question: 'What does MTN stand for in Nigeria?',
      options: [
        'Mobile Telephone Network',
        'Money Transfer Naija',
        'Metro Telecast Nation',
        'Modern Tech Network',
      ],
      correctOptionIndex: 0,
      category: 'brands',
      rewardPoints: 5,
    },
    {
      question: 'Which exam body handles UTME registration?',
      options: ['WAEC', 'NECO', 'JAMB', 'NABTEB'],
      correctOptionIndex: 2,
      category: 'education',
      rewardPoints: 5,
    },
    {
      question: 'Which city is home to the Lekki toll corridor?',
      options: ['Abuja', 'Lagos', 'Ibadan', 'Port Harcourt'],
      correctOptionIndex: 1,
      category: 'transport',
      rewardPoints: 5,
    },
    {
      question: 'Which service on BR9ja can validate a meter before payment?',
      options: ['Gift cards', 'Electricity', 'Market Runner', 'Rewards'],
      correctOptionIndex: 1,
      category: 'utilities',
      rewardPoints: 5,
    },
    {
      question: 'BR9 Gold can be used for what kind of discount?',
      options: ['Bank withdrawal fee', 'Internal service discount', 'Cash transfer', 'Card-to-bank payout'],
      correctOptionIndex: 1,
      category: 'rewards',
      rewardPoints: 5,
    },
  ]);
}

function parseTriviaCsv(csvText = '') {
  const rows = String(csvText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].split(',').map((value) => value.trim().toLowerCase());
  return rows.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    return record;
  });
}

async function uploadTriviaCsv(csvText = '') {
  const parsedRows = parseTriviaCsv(csvText);
  if (!parsedRows.length) {
    const error = new Error('Upload a CSV with a header row and at least one question.');
    error.statusCode = 400;
    throw error;
  }

  const docs = parsedRows.map((row) => {
    const options = [
      row.optiona || row.option_1 || row.option1,
      row.optionb || row.option_2 || row.option2,
      row.optionc || row.option_3 || row.option3,
      row.optiond || row.option_4 || row.option4,
    ].filter(Boolean);

    const rawCorrect = String(
      row.correctoption || row.correct_option || row.correct || '0'
    )
      .trim()
      .toUpperCase();

    const correctOptionIndex = ['A', 'B', 'C', 'D'].includes(rawCorrect)
      ? ['A', 'B', 'C', 'D'].indexOf(rawCorrect)
      : Math.max(Number(rawCorrect || 1) - 1, 0);

    return {
      question: String(row.question || '').trim(),
      options,
      correctOptionIndex,
      category: String(row.category || 'pop-culture').trim().toLowerCase(),
      rewardPoints: Math.max(Number(row.rewardpoints || row.reward_points || 5), 1),
      active: String(row.active || 'true').trim().toLowerCase() !== 'false',
    };
  });

  const validDocs = docs.filter(
    (doc) =>
      doc.question &&
      Array.isArray(doc.options) &&
      doc.options.length >= 2 &&
      Number.isInteger(doc.correctOptionIndex) &&
      doc.correctOptionIndex >= 0 &&
      doc.correctOptionIndex < doc.options.length
  );

  if (!validDocs.length) {
    const error = new Error('No valid trivia questions were found in the CSV.');
    error.statusCode = 400;
    throw error;
  }

  const created = await Trivia.insertMany(validDocs);
  return {
    uploadedCount: created.length,
  };
}

async function ensureUpcomingTriviaSession(now = new Date()) {
  await ensureSeedTriviaQuestions();

  const scheduledFor = startOfSundayWindow(now);
  const existing = await TriviaSession.findOne({
    scheduledFor,
  });

  if (existing) {
    return existing;
  }

  const questions = await Trivia.find({ active: true })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('_id');

  return TriviaSession.create({
    title: DEFAULT_TRIVIA_TITLE,
    state: 'scheduled',
    scheduledFor,
    opensAt: scheduledFor,
    closesAt: endOfSundayWindow(scheduledFor),
    entryGoldCost: 50,
    questionTimeLimitSeconds: 15,
    maxQuestions: 10,
    rewardLabel: DEFAULT_TRIVIA_REWARD_LABEL,
    questionIds: questions.map((question) => question._id),
    metadata: {
      prizePoolGold: DEFAULT_TRIVIA_PRIZE_GOLD,
      pushSentAt: null,
    },
  });
}

async function getCurrentTriviaSession() {
  await ensureUpcomingTriviaSession();
  return TriviaSession.findOne({
    state: { $in: ['scheduled', 'waiting_room', 'live'] },
  })
    .sort({ scheduledFor: 1 })
    .lean();
}

async function advanceTriviaSessions() {
  await ensureUpcomingTriviaSession();

  const now = new Date();
  const sessions = await TriviaSession.find({
    state: { $in: ['scheduled', 'waiting_room', 'live', 'closed'] },
  }).sort({ scheduledFor: 1 });

  for (const session of sessions) {
    const opensAt = session.opensAt || session.scheduledFor;
    const closesAt = session.closesAt || endOfSundayWindow(opensAt);

    if (session.state === 'scheduled' && now >= opensAt) {
      session.state = 'waiting_room';
    }

    if (session.state === 'waiting_room' && now >= opensAt) {
      session.state = 'live';
    }

    if (session.state === 'live' && now >= closesAt) {
      session.state = 'closed';
    }

    if (session.state === 'closed') {
      const maxQuestions = Math.max(Number(session.maxQuestions || 10), 1);
      const winners = (session.participants || []).filter(
        (participant) =>
          participant.completed && Number(participant.correctAnswers || 0) >= maxQuestions
      );

      if (winners.length > 0) {
        const prizePoolGold = Number(session.metadata?.prizePoolGold || DEFAULT_TRIVIA_PRIZE_GOLD);
        const eachWinnerGold = Math.max(Math.floor(prizePoolGold / winners.length), 1);

        for (const winner of winners) {
          const user = await User.findByIdAndUpdate(
            winner.userId,
            { $inc: { br9GoldBalance: eachWinnerGold } },
            { new: true }
          );

          if (user) {
            await GoldTransaction.create({
              userId: user._id,
              source: 'trivia_session_prize',
              amount: eachWinnerGold,
              direction: 'credit',
              balanceAfter: Number(user.br9GoldBalance || 0),
              locked: false,
              note: 'Sunday Live Trivia prize',
              reference: reference('TRIVIAWIN'),
              metadata: {
                sessionId: session._id.toString(),
                rewardLabel: session.rewardLabel,
              },
            });

            await UserNotification.create({
              userId: user._id,
              title: 'Trivia Rush Winner',
              body: `🏆 You aced Sunday Live Trivia. ${eachWinnerGold} BR9 Gold has been added to your wallet.`,
              type: 'trivia-prize',
              status: 'queued',
              metadata: {
                sessionId: session._id.toString(),
                rewardLabel: session.rewardLabel,
              },
            });
          }
        }
      }

      session.state = 'settled';
    }

    const pushSentAt = session.metadata?.pushSentAt ? new Date(session.metadata.pushSentAt) : null;
    if (
      session.state === 'live' &&
      (!pushSentAt || Number.isNaN(pushSentAt.getTime()))
    ) {
      const participants = await User.find({ accountDeletedAt: null, emailVerifiedAt: { $ne: null } })
        .select('_id email phoneNumber')
        .limit(50)
        .lean();

      await Promise.allSettled(
        participants.map((user) =>
          sendSendchampPush({
            user: {
              id: user._id.toString(),
              email: user.email,
              phoneNumber: user.phoneNumber,
            },
            title: 'Trivia Rush is LIVE! 🧠',
            body: 'Join now to win BR9 Gold and claim your Sunday Live advantage.',
            data: {
              sessionId: session._id.toString(),
            },
          })
        )
      );

      session.metadata = {
        ...(session.metadata || {}),
        pushSentAt: new Date(),
      };
    }

    await session.save();
  }
}

function summariseTriviaSession(session, userId = null) {
  if (!session) {
    return null;
  }

  const participant = userId
    ? (session.participants || []).find(
        (item) => String(item.userId || '') === String(userId || '')
      )
    : null;

  return {
    id: session._id.toString(),
    title: session.title,
    state: session.state,
    scheduledFor: session.scheduledFor,
    opensAt: session.opensAt,
    closesAt: session.closesAt,
    entryGoldCost: Number(session.entryGoldCost || 0),
    questionTimeLimitSeconds: Number(session.questionTimeLimitSeconds || 15),
    maxQuestions: Number(session.maxQuestions || 10),
    rewardLabel: session.rewardLabel,
    participantsCount: Array.isArray(session.participants) ? session.participants.length : 0,
    joined: Boolean(participant),
    participant: participant
      ? {
          score: Number(participant.score || 0),
          correctAnswers: Number(participant.correctAnswers || 0),
          completed: Boolean(participant.completed),
          prizeAwardedGold: Number(participant.prizeAwardedGold || 0),
        }
      : null,
  };
}

async function joinTriviaSession({ sessionId, userId }) {
  const [session, user] = await Promise.all([
    TriviaSession.findById(sessionId),
    User.findById(userId),
  ]);

  if (!session) {
    const error = new Error('Trivia session not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!['waiting_room', 'live'].includes(session.state)) {
    const error = new Error('Trivia is not open for joining right now.');
    error.statusCode = 423;
    throw error;
  }

  if (!user) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    throw error;
  }

  if (Number(user.br9GoldBalance || 0) < Number(session.entryGoldCost || 50)) {
    const error = new Error('You need at least 50 spendable BR9 Gold to join Trivia Rush.');
    error.statusCode = 422;
    throw error;
  }

  const exists = (session.participants || []).some(
    (participant) => String(participant.userId || '') === String(userId || '')
  );
  if (!exists) {
    session.participants.push({
      userId,
      joinedAt: new Date(),
      score: 0,
      correctAnswers: 0,
      completed: false,
      prizeAwardedGold: 0,
    });
    await session.save();
  }

  return summariseTriviaSession(session, userId);
}

async function getTriviaSessionQuestions(sessionId, userId) {
  const session = await TriviaSession.findById(sessionId).lean();
  if (!session) {
    const error = new Error('Trivia session not found.');
    error.statusCode = 404;
    throw error;
  }

  const joined = (session.participants || []).some(
    (participant) => String(participant.userId || '') === String(userId || '')
  );
  if (!joined) {
    const error = new Error('Join the Trivia Rush session first.');
    error.statusCode = 403;
    throw error;
  }

  const questions = await Trivia.find({
    _id: { $in: session.questionIds || [] },
    active: true,
  })
    .limit(Number(session.maxQuestions || 10))
    .lean();

  return questions.map((question) => ({
    id: question._id.toString(),
    question: question.question,
    options: question.options,
    category: question.category,
    rewardPoints: question.rewardPoints,
    timeLimitSeconds: Number(session.questionTimeLimitSeconds || 15),
  }));
}

async function submitTriviaSessionAnswers({ sessionId, userId, answers = [] }) {
  const session = await TriviaSession.findById(sessionId);
  if (!session) {
    const error = new Error('Trivia session not found.');
    error.statusCode = 404;
    throw error;
  }

  const participant = (session.participants || []).find(
    (item) => String(item.userId || '') === String(userId || '')
  );
  if (!participant) {
    const error = new Error('Join the Trivia Rush session first.');
    error.statusCode = 403;
    throw error;
  }

  const questions = await Trivia.find({
    _id: { $in: session.questionIds || [] },
  }).lean();
  const answerMap = new Map(
    (Array.isArray(answers) ? answers : []).map((answer) => [
      String(answer.questionId || '').trim(),
      Number(answer.selectedOptionIndex),
    ])
  );

  let score = 0;
  let correctAnswers = 0;
  questions.forEach((question) => {
    const selected = answerMap.get(question._id.toString());
    if (Number.isInteger(selected) && selected === Number(question.correctOptionIndex)) {
      correctAnswers += 1;
      score += Number(question.rewardPoints || 0);
    }
  });

  participant.score = score;
  participant.correctAnswers = correctAnswers;
  participant.completed = true;
  await session.save();

  return {
    session: summariseTriviaSession(session, userId),
    score,
    correctAnswers,
    totalQuestions: questions.length,
    perfectScore: questions.length > 0 && correctAnswers >= questions.length,
  };
}

async function exportTriviaQuestionsCsv() {
  const rows = await Trivia.find({}).sort({ createdAt: -1 }).lean();
  const normalized = rows.map((row) => ({
    question: row.question,
    optionA: row.options?.[0] || '',
    optionB: row.options?.[1] || '',
    optionC: row.options?.[2] || '',
    optionD: row.options?.[3] || '',
    correctOption: Number(row.correctOptionIndex || 0) + 1,
    category: row.category,
    rewardPoints: row.rewardPoints,
    active: row.active !== false,
  }));
  const header = [
    'question',
    'optionA',
    'optionB',
    'optionC',
    'optionD',
    'correctOption',
    'category',
    'rewardPoints',
    'active',
  ];

  const csvRows = [
    header.join(','),
    ...normalized.map((row) =>
      header
        .map((field) => `"${String(row[field] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    ),
  ];

  return csvRows.join('\n');
}

module.exports = {
  advanceTriviaSessions,
  ensureSeedTriviaQuestions,
  ensureUpcomingTriviaSession,
  exportTriviaQuestionsCsv,
  getCurrentTriviaSession,
  getTriviaSessionQuestions,
  joinTriviaSession,
  submitTriviaSessionAnswers,
  summariseTriviaSession,
  uploadTriviaCsv,
};
