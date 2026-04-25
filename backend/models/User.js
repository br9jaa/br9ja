'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^\d{10,15}$/,
    },
    phoneVerifiedAt: {
      type: Date,
      default: null,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedNameSource: {
      type: String,
      trim: true,
      default: '',
    },
    fullNameLockedAt: {
      type: Date,
      default: null,
    },
    primaryFundingSourceAccountNumber: {
      type: String,
      trim: true,
      default: '',
    },
    primaryFundingSourceBankName: {
      type: String,
      trim: true,
      default: '',
    },
    primaryFundingSourceName: {
      type: String,
      trim: true,
      default: '',
    },
    primaryFundingSourceLinkedAt: {
      type: Date,
      default: null,
    },
    bayrightTag: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^@[a-z0-9._-]{3,30}$/,
    },
    password: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      default: '',
    },
    pinHash: {
      type: String,
      default: '',
    },
    accountNumber: {
      type: String,
      trim: true,
      default: '',
    },
    virtualAccountNumber: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    virtualAccountBankName: {
      type: String,
      trim: true,
      default: '',
    },
    virtualAccountName: {
      type: String,
      trim: true,
      default: '',
    },
    virtualAccountProvider: {
      type: String,
      trim: true,
      default: '',
    },
    virtualAccountReference: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    virtualAccountStatus: {
      type: String,
      enum: ['pending', 'provisional', 'active', 'failed'],
      default: 'pending',
    },
    virtualAccountAssignedAt: {
      type: Date,
      default: null,
    },
    kycTier: {
      type: Number,
      enum: [1, 2],
      default: 1,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    br9GoldBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    br9GoldLockedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    goldUnlockDate: {
      type: Date,
      default: null,
    },
    br9GoldPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    isNameLocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    rewardMilestonesGranted: {
      type: [String],
      default: [],
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'reseller', 'admin'],
      default: 'user',
      index: true,
    },
    resellerTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold'],
      default: 'bronze',
      index: true,
    },
    isFrozen: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBlacklisted: {
      type: Boolean,
      default: false,
      index: true,
    },
    fundingSuspendedUntil: {
      type: Date,
      default: null,
    },
    fundingSuspendedReason: {
      type: String,
      default: '',
      trim: true,
    },
    accountStatus: {
      type: String,
      enum: [
        'active',
        'suspended',
        'restricted',
        'verification_required',
        'under_review',
        'deleted',
      ],
      default: 'active',
      index: true,
    },
    accountStatusReason: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    accountStatusUpdatedAt: {
      type: Date,
      default: null,
    },
    accountDeletedAt: {
      type: Date,
      default: null,
      index: true,
    },
    freezeReason: {
      type: String,
      default: '',
      trim: true,
    },
    frozenAt: {
      type: Date,
      default: null,
    },
    activeDeviceId: {
      type: String,
      trim: true,
      default: '',
      select: false,
    },
    lastDeviceChange: {
      type: Date,
      default: null,
    },
    isLivenessVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    dailyOutflowTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyOutflowDate: {
      type: Date,
      default: null,
    },
    favoriteTeamIds: {
      type: [String],
      default: [],
    },
    resellerActivatedAt: {
      type: Date,
      default: null,
    },
    resellerActivationFeePaidAt: {
      type: Date,
      default: null,
    },
    resellerSavingsMonthToDate: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    marketRunnerEnergyBars: {
      type: Number,
      default: 3,
      min: 0,
      max: 3,
    },
    marketRunnerEnergyUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    lastDailyPointAwardAt: {
      type: Date,
      default: null,
    },
    passportPhotoDataUrl: {
      type: String,
      default: '',
    },
    passportPhotoUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
