'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const bettingFundingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookmaker: {
      type: String,
      required: true,
      trim: true,
    },
    customerId: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['success', 'pending', 'pending_verification', 'pending_review', 'failed'],
      default: 'success',
      index: true,
    },
    provider: {
      type: String,
      default: '',
      trim: true,
    },
    providerReference: {
      type: String,
      default: '',
      trim: true,
    },
    statusMessage: {
      type: String,
      default: '',
      trim: true,
    },
    debitedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

bettingFundingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('BettingFunding', bettingFundingSchema);
