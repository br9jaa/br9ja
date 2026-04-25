'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const transportBookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    departure: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    travelDate: {
      type: Date,
      required: true,
      index: true,
    },
    operator: {
      type: String,
      required: true,
      trim: true,
    },
    passengerName: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'pending_verification', 'pending_review', 'fulfilled', 'cancelled'],
      default: 'pending',
      index: true,
    },
    adminNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

transportBookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TransportBooking', transportBookingSchema);
