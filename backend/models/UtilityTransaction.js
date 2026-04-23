'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const utilityTransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['Electricity', 'TV', 'Internet'],
      required: true,
      index: true,
    },
    serviceID: {
      type: String,
      required: true,
      trim: true,
    },
    billersCode: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      default: '',
      trim: true,
    },
    variationCode: {
      type: String,
      default: '',
      trim: true,
    },
    meterType: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    token: {
      type: String,
      default: '',
      trim: true,
    },
    receiptNumber: {
      type: String,
      default: '',
      trim: true,
    },
    nextRenewalDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'success',
      index: true,
    },
    providerResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

utilityTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UtilityTransaction', utilityTransactionSchema);
