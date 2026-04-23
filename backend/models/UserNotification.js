'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userNotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: 'system',
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'read'],
      default: 'queued',
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

userNotificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UserNotification', userNotificationSchema);
