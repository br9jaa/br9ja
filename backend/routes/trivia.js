'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { authenticateAccessToken } = require('../middleware/security.middleware');
const { Transaction, Trivia, User } = require('../models');
const {
  ensureSeedTriviaQuestions,
  exportTriviaQuestionsCsv,
  getCurrentTriviaSession,
  getTriviaSessionQuestions,
  joinTriviaSession,
  submitTriviaSessionAnswers,
  summariseTriviaSession,
} = require('../services/trivia.service');

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

router.get('/questions', async (_req, res, next) => {
  try {
    await ensureSeedTriviaQuestions();
    const questions = await Trivia.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: questions.map((question) => ({
        id: question._id.toString(),
        question: question.question,
        options: question.options,
        category: question.category,
        rewardPoints: question.rewardPoints,
        timeLimitSeconds: 10,
      })),
      message: 'Trivia questions fetched.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/session/current', async (req, res, next) => {
  try {
    const session = await getCurrentTriviaSession();
    res.json({
      success: true,
      data: session ? summariseTriviaSession(session, req.user._id) : null,
      message: session ? 'Trivia session loaded.' : 'No trivia session is scheduled right now.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/session/join', async (req, res, next) => {
  try {
    const sessionId = String(req.body?.sessionId || '').trim();
    if (!sessionId) {
      throw httpError(400, 'sessionId is required.');
    }

    const payload = await joinTriviaSession({
      sessionId,
      userId: req.user._id,
    });

    res.json({
      success: true,
      data: payload,
      message: 'Trivia session joined successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/session/:sessionId/questions', async (req, res, next) => {
  try {
    const payload = await getTriviaSessionQuestions(req.params.sessionId, req.user._id);
    res.json({
      success: true,
      data: payload,
      message: 'Trivia session questions loaded.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/session/:sessionId/complete', async (req, res, next) => {
  try {
    const payload = await submitTriviaSessionAnswers({
      sessionId: req.params.sessionId,
      userId: req.user._id,
      answers: Array.isArray(req.body?.answers) ? req.body.answers : [],
    });
    res.json({
      success: true,
      data: payload,
      message: payload.perfectScore
        ? 'Perfect score submitted. Wait for session settlement.'
        : 'Trivia session submitted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/questions.csv', async (_req, res, next) => {
  try {
    const csv = await exportTriviaQuestionsCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="br9-trivia-questions.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

router.post('/answer', async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const questionId = String(req.body?.questionId || '').trim();
    const selectedOptionIndex = Number(req.body?.selectedOptionIndex);

    if (!questionId || !Number.isInteger(selectedOptionIndex)) {
      throw httpError(400, 'questionId and selectedOptionIndex are required.');
    }

    let payload;
    await session.withTransaction(async () => {
      const question = await Trivia.findById(questionId).session(session);
      if (!question) {
        throw httpError(404, 'Trivia question not found.');
      }

      const correct = selectedOptionIndex === question.correctOptionIndex;
      let br9GoldPoints = req.user.br9GoldPoints;

      if (correct) {
        const user = await User.findByIdAndUpdate(
          req.user._id,
          { $inc: { br9GoldPoints: question.rewardPoints } },
          { new: true, session }
        );
        br9GoldPoints = user.br9GoldPoints;

        await Transaction.create(
          [
            {
              senderId: req.user._id,
              userId: req.user._id,
              senderName: 'BR9 Trivia',
              receiverName: user.fullName,
              amount: 0,
              type: 'Reward',
              status: 'success',
              timestamp: new Date(),
              reference: reference('TRIVIA'),
              note: 'Trivia Rush reward',
              balanceAfter: user.balance,
              currency: 'NGN',
              metadata: {
                triviaId: question._id.toString(),
                awardedPoints: question.rewardPoints,
              },
            },
          ],
          { session }
        );
      }

      payload = {
        correct,
        correctOptionIndex: question.correctOptionIndex,
        awardedPoints: correct ? question.rewardPoints : 0,
        br9GoldPoints,
      };
    });

    res.json({
      success: true,
      data: payload,
      message: payload.correct ? 'Correct answer.' : 'Answer submitted.',
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

module.exports = router;
