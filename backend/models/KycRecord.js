'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const kycRecordSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    idType: {
      type: String,
      enum: ['BVN', 'NIN', 'Passport', 'DriverLicense', 'VoterCard'],
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
      trim: true,
    },
    idImageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    selfieUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('KycRecord', kycRecordSchema);
