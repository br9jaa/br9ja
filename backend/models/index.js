'use strict';

const User = require('./User');
const Transaction = require('./Transaction');
const KycRecord = require('./KycRecord');
const Prediction = require('./Prediction');
const Ad = require('./Ad');
const EducationPin = require('./EducationPin');
const EducationTransaction = require('./EducationTransaction');
const UtilityTransaction = require('./UtilityTransaction');
const TransportBooking = require('./TransportBooking');
const GovernmentPayment = require('./GovernmentPayment');
const BettingFunding = require('./BettingFunding');
const LiveEvent = require('./LiveEvent');
const PhoneVerification = require('./PhoneVerification');
const Trivia = require('./Trivia');
const AppSetting = require('./AppSetting');
const UserNotification = require('./UserNotification');
const PromoCampaign = require('./PromoCampaign');
const SecurityEvent = require('./SecurityEvent');

module.exports = {
  Ad,
  AppSetting,
  BettingFunding,
  EducationPin,
  EducationTransaction,
  GovernmentPayment,
  LiveEvent,
  PhoneVerification,
  User,
  Transaction,
  TransportBooking,
  KycRecord,
  Prediction,
  PromoCampaign,
  SecurityEvent,
  Trivia,
  UtilityTransaction,
  UserNotification,
};
