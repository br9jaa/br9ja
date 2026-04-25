'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const passwordResetChallengeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    identity: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'dev-log'],
      default: 'dev-log',
    },
    codeHash: {
      type: String,
      required: true,
      select: false,
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
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

passwordResetChallengeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model(
  'PasswordResetChallenge',
  passwordResetChallengeSchema
);
