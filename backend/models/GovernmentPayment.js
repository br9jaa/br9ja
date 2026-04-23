'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const governmentPaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      required: true,
      trim: true,
    },
    rrr: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payerName: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['generated', 'paid', 'failed'],
      default: 'generated',
      index: true,
    },
    providerReference: {
      type: String,
      default: '',
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

governmentPaymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('GovernmentPayment', governmentPaymentSchema);
