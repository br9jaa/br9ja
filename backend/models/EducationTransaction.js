'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const educationTransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      enum: [
        'WAEC_RESULT',
        'WAEC_GCE',
        'JAMB',
        'JAMB_UTME',
        'JAMB_DIRECT_ENTRY',
        'NECO',
        'NABTEB',
      ],
      required: true,
      index: true,
    },
    pin: {
      type: String,
      required: true,
      trim: true,
    },
    serialNumber: {
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
    status: {
      type: String,
      enum: ['pending', 'pending_verification', 'pending_review', 'success', 'failed'],
      default: 'success',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

educationTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model(
  'EducationTransaction',
  educationTransactionSchema
);
