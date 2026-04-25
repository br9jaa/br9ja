'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const securityIncidentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
      index: true,
    },
    incidentType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['medium', 'high', 'critical'],
      default: 'high',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'reviewing', 'resolved'],
      default: 'open',
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

securityIncidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SecurityIncident', securityIncidentSchema);
