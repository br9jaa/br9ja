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
      enum: ['WAEC_RESULT', 'WAEC_GCE', 'JAMB', 'NECO', 'NABTEB'],
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
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
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
