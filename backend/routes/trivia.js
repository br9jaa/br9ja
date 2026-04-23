'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { authenticateAccessToken } = require('../middleware/security.middleware');
const { Transaction, Trivia, User } = require('../models');

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

async function ensureSeedTrivia() {
  const count = await Trivia.countDocuments({});
  if (count > 0) {
    return;
  }

  await Trivia.insertMany([
    {
      question: 'Which Nigerian artist is nicknamed African Giant?',
      options: ['Burna Boy', 'Davido', 'Wizkid', 'Rema'],
      correctOptionIndex: 0,
      category: 'pop-culture',
      rewardPoints: 5,
    },
    {
      question: 'Which sport is the Super Eagles known for?',
      options: ['Basketball', 'Football', 'Boxing', 'Cricket'],
      correctOptionIndex: 1,
      category: 'sports',
      rewardPoints: 5,
    },
    {
      question: 'What color is strongly associated with Nigerian national teams?',
      options: ['Blue', 'Green', 'Purple', 'Orange'],
      correctOptionIndex: 1,
      category: 'brands',
      rewardPoints: 5,
    },
  ]);
}

router.get('/questions', async (_req, res, next) => {
  try {
    await ensureSeedTrivia();
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
