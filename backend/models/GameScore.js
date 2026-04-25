'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const gameScoreSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    gameType: {
      type: String,
      required: true,
      trim: true,
      default: 'market_runner',
      index: true,
    },
    highScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyScore: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    lastPlayScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPlayed: {
      type: Date,
      default: null,
      index: true,
    },
    sessionsPlayedToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyGoldAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSessionRewardGold: {
      type: Number,
      default: 0,
      min: 0,
    },
    energyBars: {
      type: Number,
      default: 3,
      min: 0,
      max: 3,
    },
    energyUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    lastPromptScenario: {
      type: String,
      default: '',
      trim: true,
    },
    popupClickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

gameScoreSchema.index({ userId: 1, gameType: 1 }, { unique: true });

module.exports = mongoose.model('GameScore', gameScoreSchema);
