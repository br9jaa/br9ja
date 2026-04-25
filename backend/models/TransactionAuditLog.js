'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const transactionAuditLogSchema = new Schema(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    step: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['info', 'pending', 'success', 'warning', 'failed'],
      default: 'info',
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

transactionAuditLogSchema.index({ transactionId: 1, createdAt: 1 });

module.exports = mongoose.model('TransactionAuditLog', transactionAuditLogSchema);
