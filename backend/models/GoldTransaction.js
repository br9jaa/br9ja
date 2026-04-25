'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const goldTransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    direction: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
      index: true,
    },
    balanceAfter: {
      type: Number,
      default: 0,
      min: 0,
    },
    locked: {
      type: Boolean,
      default: false,
      index: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

goldTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('GoldTransaction', goldTransactionSchema);
