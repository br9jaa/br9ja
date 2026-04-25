'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const gamePopupClickSchema = new Schema(
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
    obstacleType: {
      type: String,
      default: '',
      trim: true,
    },
    scenario: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    cta: {
      type: String,
      default: '',
      trim: true,
    },
    clicked: {
      type: Boolean,
      default: false,
      index: true,
    },
    converted: {
      type: Boolean,
      default: false,
      index: true,
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

module.exports = mongoose.model('GamePopupClick', gamePopupClickSchema);
