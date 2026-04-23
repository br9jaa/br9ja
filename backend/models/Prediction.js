'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const predictionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    matchId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    predictedWinner: {
      type: String,
      enum: ['home', 'draw', 'away'],
      required: true,
    },
    pointsStaked: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'won', 'lost'],
      default: 'pending',
      index: true,
    },
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

predictionSchema.index({ userId: 1, matchId: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);
