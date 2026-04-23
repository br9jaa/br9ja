'use strict';

const crypto = require('crypto');
const path = require('path');

const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env.production') });
dotenv.config({ path: path.join(__dirname, '..', '.env.prod') });
dotenv.config({ path: path.join(__dirname, '..', '.env.dev') });

const { connectDb, disconnectDb, resolveMongoUri } = require('../config/db');
const { User } = require('../models');

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$/.test(String(value || ''));
}

function referralPrefix(fullName) {
  return (
    String(fullName || 'BR9')
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 4)
      .toUpperCase() || 'BR9'
  );
}

async function generateReferralCode(fullName) {
  const prefix = referralPrefix(fullName);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = `${prefix}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const exists = await User.exists({ referralCode: code });
    if (!exists) {
      return code;
    }
  }

  throw new Error(`Could not generate a unique referral code for ${fullName}.`);
}

function buildAccountNumber(user) {
  const digits = String(user.phoneNumber || '').replace(/\D/g, '');
  return digits ? digits.padStart(10, '0').slice(-10) : '';
}

function hasPlaceholderUri(uri) {
  return /username:password|cluster\.example|replace-with/i.test(uri);
}

async function migrateUsers() {
  const uri = resolveMongoUri();
  if (!uri || hasPlaceholderUri(uri)) {
    throw new Error(
      'Refusing migration: set a real MONGO_URI in backend/.env.production first.'
    );
  }

  await connectDb(uri);

  const users = await User.find({
    $or: [
      { referralCode: { $exists: false } },
      { referralCode: '' },
      { br9GoldPoints: { $exists: false } },
      { balance: { $exists: false } },
      { password: { $exists: false } },
      { passwordHash: { $exists: true } },
    ],
  }).lean();

  let migrated = 0;

  for (const user of users) {
    const $set = {};

    if (!user.referralCode) {
      $set.referralCode = await generateReferralCode(user.fullName);
    }

    if (typeof user.br9GoldPoints !== 'number') {
      $set.br9GoldPoints = 0;
    }

    if (typeof user.balance !== 'number') {
      $set.balance = 0;
    }

    if (!user.accountNumber) {
      const accountNumber = buildAccountNumber(user);
      if (accountNumber) {
        $set.accountNumber = accountNumber;
      }
    }

    if (user.password && !isBcryptHash(user.password)) {
      const hashedPassword = await bcrypt.hash(String(user.password), 12);
      $set.password = hashedPassword;
      $set.passwordHash = hashedPassword;
    } else if (!user.password && user.passwordHash) {
      const migratedPasswordHash = isBcryptHash(user.passwordHash)
        ? user.passwordHash
        : await bcrypt.hash(String(user.passwordHash), 12);
      $set.password = migratedPasswordHash;
      $set.passwordHash = migratedPasswordHash;
    }

    if (Object.keys($set).length > 0) {
      await User.updateOne({ _id: user._id }, { $set });
      migrated += 1;
    }
  }

  return { scanned: users.length, migrated };
}

if (require.main === module) {
  migrateUsers()
    .then((result) => {
      console.log(
        `User migration complete. Scanned ${result.scanned}, migrated ${result.migrated}.`
      );
    })
    .catch((error) => {
      console.error(`User migration failed: ${error.message}`);
      process.exitCode = 1;
    })
    .finally(disconnectDb);
}

module.exports = {
  migrateUsers,
};
