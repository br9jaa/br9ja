'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const triviaSessionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Sunday Live Trivia Rush',
    },
    state: {
      type: String,
      enum: ['draft', 'scheduled', 'waiting_room', 'live', 'closed', 'settled'],
      default: 'draft',
      index: true,
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    opensAt: {
      type: Date,
      default: null,
    },
    closesAt: {
      type: Date,
      default: null,
    },
    entryGoldCost: {
      type: Number,
      default: 50,
      min: 0,
    },
    questionTimeLimitSeconds: {
      type: Number,
      default: 15,
      min: 5,
    },
    maxQuestions: {
      type: Number,
      default: 10,
      min: 1,
    },
    rewardLabel: {
      type: String,
      default: '₦5,000 Data',
      trim: true,
    },
    questionIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Trivia' }],
      default: [],
    },
    participants: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          joinedAt: { type: Date, default: Date.now },
          score: { type: Number, default: 0, min: 0 },
          correctAnswers: { type: Number, default: 0, min: 0 },
          completed: { type: Boolean, default: false },
          prizeAwardedGold: { type: Number, default: 0, min: 0 },
        },
      ],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

triviaSessionSchema.index({ scheduledFor: -1, state: 1 });

module.exports = mongoose.model('TriviaSession', triviaSessionSchema);
