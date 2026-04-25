'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const emailVerificationChallengeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
      select: false,
    },
    deliveryMode: {
      type: String,
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

module.exports = mongoose.model(
  'EmailVerificationChallenge',
  emailVerificationChallengeSchema
);
