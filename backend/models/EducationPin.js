'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const educationPinSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    service: {
      type: String,
      enum: ['WAEC_RESULT', 'WAEC_GCE', 'JAMB', 'NECO', 'NABTEB'],
      required: true,
      index: true,
    },
    pin: {
      type: String,
      required: true,
      trim: true,
    },
    serial: {
      type: String,
      default: '',
      trim: true,
    },
    profileCode: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'success',
      index: true,
    },
    provider: {
      type: String,
      default: '',
      trim: true,
    },
    vendorReference: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

educationPinSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('EducationPin', educationPinSchema);
