'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const goldAuditLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actionType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ['mint', 'burn', 'transfer'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

goldAuditLogSchema.index({ createdAt: -1 });
goldAuditLogSchema.index({ actionType: 1, createdAt: -1 });

module.exports = mongoose.model('GoldAuditLog', goldAuditLogSchema);
