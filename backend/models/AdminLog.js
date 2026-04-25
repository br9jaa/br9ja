'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const adminLogSchema = new Schema(
  {
    actionType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    actorLabel: {
      type: String,
      default: 'Site Admin',
      trim: true,
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
  {
    timestamps: true,
  }
);

adminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
