'use strict';

const mongoose = require('mongoose');

function resolveMongoUri() {
  return process.env.MONGO_URI || process.env.MONGODB_URI || '';
}

function resolveMongoOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS || 10000),
    ...(isProduction ? { tls: true } : {}),
  };
}

async function connectDb(uri = resolveMongoUri(), options = resolveMongoOptions()) {
  if (!uri) {
    throw new Error('MONGO_URI must be defined before connecting to MongoDB.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(uri, options);
  return mongoose.connection;
}

async function disconnectDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectDb,
  disconnectDb,
  resolveMongoOptions,
  resolveMongoUri,
};
