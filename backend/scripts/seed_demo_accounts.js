'use strict';

const path = require('path');

const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env.dev') });

const { connectDb, disconnectDb } = require('../config/db');
const User = require('../models/User');

function buildAccountNumber(phoneNumber) {
  return String(phoneNumber || '')
    .replace(/\D/g, '')
    .padStart(10, '0')
    .slice(-10);
}

async function hashPassword(password) {
  return bcrypt.hash(String(password || '').trim(), 12);
}

async function upsertUser({
  email,
  password,
  fullName,
  phoneNumber,
  bayrightTag,
  role,
  balance,
  br9GoldPoints,
  referralCode,
  isLivenessVerified = false,
}) {
  const passwordHash = await hashPassword(password);
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPhone = String(phoneNumber || '').replace(/\D/g, '');
  const normalizedTag = String(bayrightTag || '').trim().toLowerCase();

  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        fullName,
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        bayrightTag: normalizedTag,
        password: passwordHash,
        passwordHash,
        accountNumber: buildAccountNumber(normalizedPhone),
        role,
        balance,
        br9GoldPoints,
        referralCode,
        isFrozen: false,
        freezeReason: '',
        frozenAt: null,
        isLivenessVerified,
        kycTier: 2,
      },
      $setOnInsert: {
        pinHash: '',
        favoriteTeamIds: [],
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return user;
}

async function main() {
  await connectDb();

  const seededUsers = await Promise.all([
    upsertUser({
      email: 'stankings@gmail.com',
      password: 'PEAcock@3690!',
      fullName: 'Stan Kings',
      phoneNumber: '08000000001',
      bayrightTag: '@stankings',
      role: 'user',
      balance: 250000,
      br9GoldPoints: 4200,
      referralCode: 'STANBR9A1',
      isLivenessVerified: true,
    }),
    upsertUser({
      email: 'adm@br9.ng',
      password: 'PEAcock@3690!',
      fullName: 'BR9 Admin',
      phoneNumber: '08000000009',
      bayrightTag: '@br9admin',
      role: 'admin',
      balance: 1000000,
      br9GoldPoints: 12000,
      referralCode: 'ADMINBR9',
      isLivenessVerified: true,
    }),
  ]);

  console.log(
    JSON.stringify(
      seededUsers.map((user) => ({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        accountNumber: user.accountNumber,
        balance: user.balance,
        br9GoldPoints: user.br9GoldPoints,
      })),
      null,
      2
    )
  );

  await disconnectDb();
}

main()
  .catch(async (error) => {
    console.error(error);
    await disconnectDb();
    process.exit(1);
  });
