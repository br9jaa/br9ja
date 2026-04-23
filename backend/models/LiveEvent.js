'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const liveEventSchema = new Schema(
  {
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    currentQuestion: {
      type: String,
      default: '',
      trim: true,
    },
    liveCode: {
      type: String,
      required: true,
      trim: true,
    },
    rewardPool: {
      type: Number,
      default: 0,
      min: 0,
    },
    winnerIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LiveEvent', liveEventSchema);
