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
      enum: ['success', 'pending', 'failed'],
      default: 'success',
      index: true,
    },
    providerReference: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

bettingFundingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('BettingFunding', bettingFundingSchema);
