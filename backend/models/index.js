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
const EmailVerificationChallenge = require('./EmailVerificationChallenge');
const GamePopupClick = require('./GamePopupClick');
const GameScore = require('./GameScore');
const PhoneVerification = require('./PhoneVerification');
const PasswordResetChallenge = require('./PasswordResetChallenge');
const Trivia = require('./Trivia');
const AppSetting = require('./AppSetting');
const AdminLog = require('./AdminLog');
const UserNotification = require('./UserNotification');
const PromoCampaign = require('./PromoCampaign');
const SecurityEvent = require('./SecurityEvent');
const SecurityIncident = require('./SecurityIncident');
const ServiceCatalog = require('./ServiceCatalog');
const GoldAuditLog = require('./GoldAuditLog');
const GoldTransaction = require('./GoldTransaction');
const TransactionAuditLog = require('./TransactionAuditLog');
const TriviaSession = require('./TriviaSession');

module.exports = {
  Ad,
  AdminLog,
  AppSetting,
  BettingFunding,
  EducationPin,
  EducationTransaction,
  EmailVerificationChallenge,
  GamePopupClick,
  GameScore,
  GoldAuditLog,
  GovernmentPayment,
  LiveEvent,
  PasswordResetChallenge,
  PhoneVerification,
  User,
  Transaction,
  TransportBooking,
  KycRecord,
  Prediction,
  PromoCampaign,
  GoldTransaction,
  SecurityEvent,
  SecurityIncident,
  ServiceCatalog,
  TransactionAuditLog,
  Trivia,
  TriviaSession,
  UtilityTransaction,
  UserNotification,
};
