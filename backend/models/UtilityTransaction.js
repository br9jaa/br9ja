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
      enum: ['Airtime', 'Data', 'Electricity', 'TV', 'Internet'],
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
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    profit: {
      type: Number,
      default: 0,
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
      enum: ['pending', 'pending_verification', 'pending_review', 'success', 'failed'],
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
