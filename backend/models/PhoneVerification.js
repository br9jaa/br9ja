'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const phoneVerificationSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^\d{10,15}$/,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
      select: false,
    },
    verificationTokenHash: {
      type: String,
      default: '',
      select: false,
    },
    deliveryMode: {
      type: String,
      enum: ['sms', 'dev-log'],
      default: 'dev-log',
    },
    providerMessageId: {
      type: String,
      default: '',
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    sendCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    lastSentAt: {
      type: Date,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PhoneVerification', phoneVerificationSchema);
