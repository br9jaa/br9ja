'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const triviaSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length >= 2,
        message: 'Trivia requires at least two options.',
      },
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ['pop-culture', 'sports', 'brands'],
      default: 'pop-culture',
      index: true,
    },
    rewardPoints: {
      type: Number,
      default: 5,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trivia', triviaSchema);
