'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const promoCampaignSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'active', 'finished', 'killed'],
      default: 'upcoming',
      index: true,
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      required: true,
      default: 'flat',
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    maxDiscountValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetServices: {
      type: [String],
      default: ['all'],
      index: true,
    },
    startAt: {
      type: Date,
      required: true,
      index: true,
    },
    endAt: {
      type: Date,
      required: true,
      index: true,
    },
    maxUses: {
      type: Number,
      default: 0,
      min: 0,
    },
    individualUserLimit: {
      type: Number,
      default: 1,
      min: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDiscountGiven: {
      type: Number,
      default: 0,
      min: 0,
    },
    killedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

promoCampaignSchema.index({ startAt: 1, endAt: 1, status: 1 });

module.exports = mongoose.model('PromoCampaign', promoCampaignSchema);
