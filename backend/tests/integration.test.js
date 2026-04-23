'use strict';

const bcrypt = require('bcryptjs');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');

jest.setTimeout(30000);

let replSet;
let app;
let initializeIndexes;
let connectDb;
let disconnectDb;
let runMondayPayout;
let runWeeklyRewardResurrection;
let AppSetting;
let BettingFunding;
let EducationPin;
let EducationTransaction;
let GovernmentPayment;
let LiveEvent;
let PhoneVerification;
let SecurityEvent;
let Transaction;
let TransportBooking;
let Trivia;
let UtilityTransaction;
let User;
let UserNotification;

const testDeviceId = 'test-device-001';

async function createUser(overrides = {}) {
  const password = overrides.rawPassword || '1234';
  const transactionPin = overrides.rawPin || '654321';
  const passwordHash = await bcrypt.hash(password, 12);
  const pinHash = await bcrypt.hash(transactionPin, 12);

  return User.create({
    fullName: overrides.fullName || 'Test User',
    email: overrides.email || `user-${Date.now()}@br9.test`,
    phoneNumber: overrides.phoneNumber || `080${Date.now().toString().slice(-8)}`,
    bayrightTag: overrides.bayrightTag || `@user${Date.now().toString().slice(-8)}`,
    password: overrides.password || passwordHash,
    passwordHash: overrides.passwordHash || passwordHash,
    pinHash: overrides.pinHash || pinHash,
    accountNumber: overrides.accountNumber || '',
    kycTier: overrides.kycTier || 1,
    balance: overrides.balance ?? 0,
    br9GoldPoints: overrides.br9GoldPoints ?? 0,
    referralCode: overrides.referralCode || `T${Date.now().toString(36)}`,
    referredBy: overrides.referredBy || null,
    role: overrides.role || 'user',
  });
}

async function login(email, password = '1234') {
  return request(app).post('/api/auth/login').send({ email, password });
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.ENABLE_CRON = 'false';
  process.env.GOLD_TO_NAIRA_RATIO = '0.1';
  process.env.VENDING_DEMO = 'true';

  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  process.env.MONGO_URI = replSet.getUri();

  ({ app, initializeIndexes } = require('../server'));
  ({ connectDb, disconnectDb } = require('../config/db'));
  ({ runMondayPayout } = require('../jobs/payout_engine'));
  ({ runWeeklyRewardResurrection } = require('../jobs/payout_processor'));
  ({
    AppSetting,
    BettingFunding,
    EducationPin,
    EducationTransaction,
    GovernmentPayment,
    LiveEvent,
    PhoneVerification,
    SecurityEvent,
    Transaction,
    TransportBooking,
    Trivia,
    UtilityTransaction,
    User,
    UserNotification,
  } = require('../models'));

  await connectDb();
  await initializeIndexes();
});

afterEach(async () => {
  await Promise.all([
    EducationPin.deleteMany({}),
    EducationTransaction.deleteMany({}),
    AppSetting.deleteMany({}),
    BettingFunding.deleteMany({}),
    GovernmentPayment.deleteMany({}),
    LiveEvent.deleteMany({}),
    PhoneVerification.deleteMany({}),
    SecurityEvent.deleteMany({}),
    TransportBooking.deleteMany({}),
    Trivia.deleteMany({}),
    Transaction.deleteMany({}),
    UtilityTransaction.deleteMany({}),
    User.deleteMany({}),
    UserNotification.deleteMany({}),
  ]);
});

afterAll(async () => {
  await disconnectDb();
  await replSet.stop();
});

describe('BR9 backend integration', () => {
  test('Auth: login returns JWT and protected profile works', async () => {
    const user = await createUser({
      fullName: 'Ada Auth',
      email: 'ada.auth@br9.test',
      phoneNumber: '08030000001',
      bayrightTag: '@adaauth',
      balance: 1500,
      referralCode: 'ADAAUTH',
    });

    const loginResponse = await login(user.email);
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.accessToken).toBeTruthy();

    const profileResponse = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.data.email).toBe(user.email);
    expect(profileResponse.body.data.walletBalance).toBe(1500);
  });

  test('Auth: login accepts a Bayright username/tag as well as email', async () => {
    const user = await createUser({
      fullName: 'Tag Login',
      email: 'tag.login@br9.test',
      phoneNumber: '08030000021',
      bayrightTag: '@taglogin',
      balance: 500,
      referralCode: 'TAGLOGIN',
    });

    const loginResponse = await request(app).post('/api/auth/login').send({
      identifier: 'taglogin',
      password: '1234',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.user.email).toBe(user.email);
    expect(loginResponse.body.data.sessionTransfer.required).toBe(false);
  });

  test('Auth: signup requires SMS verification before account creation', async () => {
    const sendResponse = await request(app)
      .post('/api/auth/send-phone-verification')
      .send({ phoneNumber: '08030000088' });

    expect(sendResponse.status).toBe(200);
    expect(sendResponse.body.data.devCode).toHaveLength(6);

    const verifyResponse = await request(app)
      .post('/api/auth/verify-phone-code')
      .send({
        phoneNumber: '08030000088',
        code: sendResponse.body.data.devCode,
      });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.data.phoneVerificationToken).toBeTruthy();

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'SMS Verified User',
        username: 'smsverified',
        email: 'sms.verified@br9.test',
        phoneNumber: '08030000088',
        password: 'StrongPass123!',
        pin: '654321',
        phoneVerificationToken:
          verifyResponse.body.data.phoneVerificationToken,
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.data.user.phoneVerified).toBe(true);
    expect(registerResponse.body.data.user.bayrightTag).toBe('@smsverified');
    expect(registerResponse.body.data.user.virtualAccount.accountNumber).toBeTruthy();
    expect(registerResponse.body.data.user.virtualAccount.bankName).toBe('GTBank');

    const storedUser = await User.findOne({
      email: 'sms.verified@br9.test',
    }).lean();
    expect(storedUser.phoneVerifiedAt).toBeTruthy();
    expect(storedUser.pinHash).toBeTruthy();
    expect(storedUser.virtualAccountNumber).toBeTruthy();
  });

  test('Auth: signup rejects reused email, phone number, and username', async () => {
    await createUser({
      fullName: 'Existing User',
      email: 'existing@br9.test',
      phoneNumber: '08030000111',
      bayrightTag: '@existinguser',
      referralCode: 'EXISTING',
    });

    let phoneAttempt = 112;
    const attempt = async (overrides = {}) => {
      phoneAttempt += 1;
      const phoneNumber =
        overrides.phoneNumber || `08030000${String(phoneAttempt).padStart(3, '0')}`;
      const sendResponse = await request(app)
        .post('/api/auth/send-phone-verification')
        .send({ phoneNumber });

      if (sendResponse.status !== 200) {
        return sendResponse;
      }

      const verifyResponse = await request(app)
        .post('/api/auth/verify-phone-code')
        .send({
          phoneNumber,
          code: sendResponse.body.data.devCode,
        });

      return request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Duplicate Attempt',
          username: overrides.username || 'freshuser',
          email: overrides.email || 'fresh@br9.test',
          phoneNumber,
          password: 'StrongPass123!',
          pin: '654321',
          phoneVerificationToken:
            verifyResponse.body.data.phoneVerificationToken,
        });
    };

    const emailResponse = await attempt({ email: 'existing@br9.test' });
    expect(emailResponse.status).toBe(409);
    expect(emailResponse.body.message).toContain('email');

    const phoneResponse = await attempt({ phoneNumber: '08030000111' });
    expect(phoneResponse.status).toBe(409);
    expect(phoneResponse.body.message).toContain('phone number');

    const usernameResponse = await attempt({ username: 'existinguser' });
    expect(usernameResponse.status).toBe(409);
    expect(usernameResponse.body.message).toContain('username');
  });

  test('Funding rail: deposit webhook credits virtual account and logs operational expense', async () => {
    const user = await createUser({
      fullName: 'Deposit User',
      email: 'deposit@br9.test',
      phoneNumber: '08030000091',
      bayrightTag: '@deposituser',
      balance: 200,
      referralCode: 'DEPOSIT',
    });
    const token = (await login(user.email)).body.data.accessToken;

    const profileResponse = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileResponse.status).toBe(200);
    const accountNumber = profileResponse.body.data.virtualAccount.accountNumber;
    expect(accountNumber).toBeTruthy();

    const depositResponse = await request(app)
      .post('/api/webhook/deposit')
      .send({
        provider: 'squad',
        data: {
          amount: 10000,
          transactionReference: 'SQD-TEST-001',
          virtualAccountNumber: accountNumber,
          senderName: 'Funding Sender',
        },
      });

    expect(depositResponse.status).toBe(200);
    expect(depositResponse.body.data.creditedAmount).toBe(10000);
    expect(depositResponse.body.data.providerFee).toBe(10);
    expect(depositResponse.body.data.operationalExpense).toBe(10);
    expect(depositResponse.body.data.balanceAfter).toBe(10200);

    const freshUser = await User.findById(user._id).lean();
    const depositLedger = await Transaction.findOne({
      type: 'Deposit',
      'metadata.providerReference': 'SQD-TEST-001',
    }).lean();

    expect(freshUser.balance).toBe(10200);
    expect(depositLedger.metadata.zeroFeeBalance).toBe(true);
    expect(depositLedger.metadata.operationalExpense).toBe(10);
  });

  test('Admin provider config: saves funding rails and service API failover routes', async () => {
    const response = await request(app)
      .post('/api/admin/provider-config')
      .set('x-site-admin-token', 'br9-local-admin')
      .send({
        funding: {
          primaryProvider: 'squad',
          backupProvider: 'monnify',
          zeroFeeBalance: false,
          providerFeeBps: 10,
          defaultBankLabel: 'GTBank',
        },
        endpoints: {
          peyflexBaseUrl: 'https://primary.example.test',
          vtpassBaseUrl: 'https://backup.example.test',
        },
        services: {
          electricity: {
            primaryProvider: 'peyflex',
            backupProvider: 'vtpass',
            failoverEnabled: true,
          },
          betting: {
            primaryProvider: 'flutterwave',
            backupProvider: 'demo',
            failoverEnabled: true,
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.funding.zeroFeeBalance).toBe(false);
    expect(response.body.data.endpoints.peyflexBaseUrl).toBe(
      'https://primary.example.test'
    );
    expect(response.body.data.services.electricity.backupProvider).toBe('vtpass');
    expect(response.body.data.services.betting.primaryProvider).toBe('flutterwave');
  });

  test('Admin directory: can debit, wipe, restrict, and soft-delete users with audit logs', async () => {
    const user = await createUser({
      fullName: 'Governed User',
      email: 'governed@br9.test',
      phoneNumber: '08030000120',
      bayrightTag: '@governeduser',
      balance: 5000,
      referralCode: 'GOVUSER',
    });

    const debitResponse = await request(app)
      .post('/api/admin/site-adjust-user-balance')
      .set('x-site-admin-token', 'br9-local-admin')
      .send({
        userId: user._id.toString(),
        action: 'debit',
        amount: 1500,
        reason: 'Customer requested partial wallet withdrawal.',
      });

    expect(debitResponse.status).toBe(201);
    expect(debitResponse.body.data.balance).toBe(3500);

    const restrictedResponse = await request(app)
      .patch('/api/admin/site-user-status')
      .set('x-site-admin-token', 'br9-local-admin')
      .send({
        userId: user._id.toString(),
        status: 'restricted',
        reason: 'Refund review in progress.',
      });

    expect(restrictedResponse.status).toBe(200);
    expect(restrictedResponse.body.data.accountStatus).toBe('restricted');

    const token = (await login(user.email)).body.data.accessToken;
    const blockedTransfer = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Device-ID', testDeviceId)
      .send({
        recipient: '@nobody',
        amount: 100,
        transactionPin: '654321',
      });
    expect(blockedTransfer.status).toBe(423);

    const wipeResponse = await request(app)
      .post('/api/admin/site-adjust-user-balance')
      .set('x-site-admin-token', 'br9-local-admin')
      .send({
        userId: user._id.toString(),
        action: 'wipe',
        reason: 'Customer requested account closure.',
      });

    expect(wipeResponse.status).toBe(201);
    expect(wipeResponse.body.data.balance).toBe(0);

    const deleteResponse = await request(app)
      .patch('/api/admin/site-user-status')
      .set('x-site-admin-token', 'br9-local-admin')
      .send({
        userId: user._id.toString(),
        status: 'deleted',
        reason: 'Customer requested account closure.',
      });

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.accountStatus).toBe('deleted');

    const loginResponse = await login(user.email);
    const adjustmentCount = await Transaction.countDocuments({
      userId: user._id,
      type: 'AdminAdjustment',
    });
    const securityCount = await SecurityEvent.countDocuments({
      userId: user._id,
      eventType: { $in: ['admin-balance-adjustment', 'admin-account-status-change'] },
    });

    expect(loginResponse.status).toBe(423);
    expect(adjustmentCount).toBe(2);
    expect(securityCount).toBeGreaterThanOrEqual(4);
  });

  test('Games: web clients are blocked from gameplay endpoints', async () => {
    const user = await createUser({
      fullName: 'Web Blocked',
      email: 'web.blocked@br9.test',
      phoneNumber: '08030000089',
      bayrightTag: '@webblocked',
      balance: 400,
      referralCode: 'WEBBLOCK',
    });

    const loginResponse = await login(user.email);
    const token = loginResponse.body.data.accessToken;

    const leaderboardResponse = await request(app)
      .get('/api/games/leaderboard')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Client-Platform', 'web');

    expect(leaderboardResponse.status).toBe(403);
    expect(leaderboardResponse.body.message).toContain('mobile app');
  });

  test('Double-Spend: concurrent transfers only allow one successful debit', async () => {
    const sender = await createUser({
      fullName: 'Sender Wallet',
      email: 'sender@br9.test',
      phoneNumber: '08030000002',
      bayrightTag: '@senderwallet',
      balance: 100,
      referralCode: 'SENDER1',
    });
    const receiver = await createUser({
      fullName: 'Receiver Wallet',
      email: 'receiver@br9.test',
      phoneNumber: '08030000003',
      bayrightTag: '@receiverwallet',
      balance: 0,
      referralCode: 'RECEIVER1',
    });

    const loginResponse = await login(sender.email);
    const token = loginResponse.body.data.accessToken;

    const transferPayload = {
      recipient: receiver.bayrightTag,
      amount: 80,
      note: 'concurrency test',
      transactionPin: '654321',
    };

    const [first, second] = await Promise.all([
      request(app)
        .post('/api/transactions/transfer')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Device-ID', testDeviceId)
        .send(transferPayload),
      request(app)
        .post('/api/transactions/transfer')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Device-ID', testDeviceId)
        .send(transferPayload),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([201, 422]);

    const freshSender = await User.findById(sender._id).lean();
    const freshReceiver = await User.findById(receiver._id).lean();
    const transactionCount = await Transaction.countDocuments({ type: 'P2P' });
    const receiverNotification = await UserNotification.findOne({
      userId: receiver._id,
      type: 'p2p-received',
    }).lean();

    expect(freshSender.balance).toBe(20);
    expect(freshReceiver.balance).toBe(80);
    expect(transactionCount).toBe(1);
    expect(receiverNotification.title).toBe('Buddy Transfer Received');
  });

  test('P2P safety: transfer requires the correct 6-digit transaction PIN', async () => {
    const sender = await createUser({
      fullName: 'Pin Sender',
      email: 'pin-sender@br9.test',
      phoneNumber: '08030000092',
      bayrightTag: '@pinsender',
      balance: 500,
      referralCode: 'PINSEND',
    });
    const receiver = await createUser({
      fullName: 'Pin Receiver',
      email: 'pin-receiver@br9.test',
      phoneNumber: '08030000093',
      bayrightTag: '@pinreceiver',
      balance: 0,
      referralCode: 'PINRECV',
    });
    const token = (await login(sender.email)).body.data.accessToken;

    const blockedResponse = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Device-ID', testDeviceId)
      .send({
        recipient: receiver.bayrightTag,
        amount: 100,
        transactionPin: '111111',
      });

    expect(blockedResponse.status).toBe(401);
    expect(blockedResponse.body.message).toBe('Transaction PIN is incorrect.');

    const freshSender = await User.findById(sender._id).lean();
    const freshReceiver = await User.findById(receiver._id).lean();
    const riskEvent = await SecurityEvent.findOne({
      userId: sender._id,
      eventType: 'transaction-pin-failure',
    }).lean();
    const dashboardResponse = await request(app)
      .get('/api/admin/site-dashboard')
      .set('x-site-admin-token', 'br9-local-admin');

    expect(freshSender.balance).toBe(500);
    expect(freshReceiver.balance).toBe(0);
    expect(riskEvent.severity).toBe('critical');
    expect(dashboardResponse.body.data.pinFailureCount).toBeGreaterThanOrEqual(1);
    expect(dashboardResponse.body.data.securityEvents[0].message).toBe(
      'Incorrect transaction PIN.'
    );
  });

  test('Payout Cron: Gold points convert to Naira and reset points', async () => {
    const user = await createUser({
      fullName: 'Gold Winner',
      email: 'gold@br9.test',
      phoneNumber: '08030000004',
      bayrightTag: '@goldwinner',
      balance: 10,
      br9GoldPoints: 100,
      referralCode: 'GOLDWIN',
    });

    const convertedUsers = await runMondayPayout();

    const freshUser = await User.findById(user._id).lean();
    const payoutTransaction = await Transaction.findOne({
      type: 'PointConversion',
      senderId: user._id,
    }).lean();

    expect(convertedUsers).toBe(1);
    expect(freshUser.br9GoldPoints).toBe(0);
    expect(freshUser.balance).toBe(20);
    expect(payoutTransaction.amount).toBe(10);
    expect(payoutTransaction.status).toBe('success');
  });

  test('Weekly payout processor honors threshold, configured rate, and queues notification', async () => {
    await AppSetting.create({ key: 'goldToNairaRatio', value: 0.2 });
    const user = await createUser({
      fullName: 'Weekly Winner',
      email: 'weekly@br9.test',
      phoneNumber: '08030000013',
      bayrightTag: '@weeklywinner',
      balance: 50,
      br9GoldPoints: 1500,
      referralCode: 'WEEKLY',
    });

    const processedUsers = await runWeeklyRewardResurrection();
    const freshUser = await User.findById(user._id).lean();
    const payoutTransaction = await Transaction.findOne({
      userId: user._id,
      note: 'Weekly Reward Resurrection',
    }).lean();
    const notification = await UserNotification.findOne({
      userId: user._id,
      type: 'weekly-payout',
    }).lean();

    expect(processedUsers).toBe(1);
    expect(freshUser.balance).toBe(350);
    expect(freshUser.br9GoldPoints).toBe(0);
    expect(payoutTransaction.amount).toBe(300);
    expect(notification.status).toBe('queued');
  });

  test('Education vending: purchase-pin debits wallet and stores PIN receipt', async () => {
    const user = await createUser({
      fullName: 'Education Buyer',
      email: 'education@br9.test',
      phoneNumber: '08030000005',
      bayrightTag: '@educationbuyer',
      balance: 10000,
      referralCode: 'EDUBUY',
    });
    const loginResponse = await login(user.email);
    const token = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post('/api/vending/purchase-pin')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Device-ID', testDeviceId)
      .send({
        serviceType: 'JAMB',
        profileCode: '1234567890',
        transactionPin: '654321',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.pins).toHaveLength(1);
    expect(response.body.data.amountCharged).toBe(6450);
    expect(response.body.data.promoApplied).toBe(false);
    expect(response.body.data.walletBalance).toBe(3550);
    expect(response.body.data.br9GoldPoints).toBe(124);

    const savedPin = await EducationPin.findOne({ userId: user._id }).lean();
    const ledger = await Transaction.findOne({ type: 'Education' }).lean();

    expect(savedPin.service).toBe('JAMB');
    expect(savedPin.profileCode).toBe('1234567890');
    expect(ledger.amount).toBe(6450);
  });

  test('Electricity vending: verify and pay creates token ledger entry', async () => {
    const user = await createUser({
      fullName: 'Power Buyer',
      email: 'power@br9.test',
      phoneNumber: '08030000006',
      bayrightTag: '@powerbuyer',
      balance: 5000,
      referralCode: 'POWERBUY',
    });
    const loginResponse = await login(user.email);
    const token = loginResponse.body.data.accessToken;

    const verifyResponse = await request(app)
      .post('/api/utility/verify-meter')
      .set('Authorization', `Bearer ${token}`)
      .send({ meterNumber: '12345678901', serviceID: 'ikeja-electric', type: 'prepaid' });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.data.customerName).toBe('CHUKWUMA OKORIE');

    const payResponse = await request(app)
      .post('/api/utility/pay-electricity')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Device-ID', testDeviceId)
      .send({
        meterNumber: '12345678901',
        serviceID: 'ikeja-electric',
        type: 'prepaid',
        amount: 1000,
        phone: user.phoneNumber,
        customerName: verifyResponse.body.data.customerName,
        transactionPin: '654321',
      });

    expect(payResponse.status).toBe(201);
    expect(payResponse.body.data.amountCharged).toBe(1100);
    expect(payResponse.body.data.promoApplied).toBe(false);
    expect(payResponse.body.data.walletBalance).toBe(3900);
    expect(payResponse.body.data.br9GoldPoints).toBe(10);
    expect(payResponse.body.data.token).toHaveLength(20);

    const utilityLedger = await UtilityTransaction.findOne({ userId: user._id }).lean();
    expect(utilityLedger.category).toBe('Electricity');
    expect(utilityLedger.amount).toBe(1000);
  });

  test('TV and internet vending: smartcard verification returns plans and renews subscription', async () => {
    const user = await createUser({
      fullName: 'TV Buyer',
      email: 'tv@br9.test',
      phoneNumber: '08030000007',
      bayrightTag: '@tvbuyer',
      balance: 20000,
      referralCode: 'TVBUY',
    });
    const loginResponse = await login(user.email);
    const token = loginResponse.body.data.accessToken;

    const verifyResponse = await request(app)
      .post('/api/utility/verify-smartcard')
      .set('Authorization', `Bearer ${token}`)
      .send({ billersCode: '1234567890', serviceID: 'dstv' });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.data.plans.length).toBeGreaterThan(0);

    const plan = verifyResponse.body.data.plans[0];
    const payResponse = await request(app)
      .post('/api/utility/pay-tv-internet')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Device-ID', testDeviceId)
      .send({
        category: 'TV',
        billersCode: '1234567890',
        serviceID: 'dstv',
        variationCode: plan.variationCode,
        amount: plan.amount,
        phone: user.phoneNumber,
        customerName: verifyResponse.body.data.customerName,
        transactionPin: '654321',
      });

    expect(payResponse.status).toBe(201);
    expect(payResponse.body.data.amountCharged).toBe(12700);
    expect(payResponse.body.data.promoApplied).toBe(false);
    expect(payResponse.body.data.walletBalance).toBe(7300);
    expect(payResponse.body.data.br9GoldPoints).toBe(187);
    expect(payResponse.body.data.receiptNumber).toBeTruthy();

    const utilityLedger = await UtilityTransaction.findOne({ userId: user._id }).lean();
    expect(utilityLedger.category).toBe('TV');
    expect(utilityLedger.variationCode).toBe(plan.variationCode);
  });

  test('Transport: LCC top-up debits wallet and bus requests create booking bridge records', async () => {
    const user = await createUser({
      fullName: 'Transport Buyer',
      email: 'transport@br9.test',
      phoneNumber: '08030000008',
      bayrightTag: '@transportbuyer',
      balance: 7000,
      referralCode: 'TRANSPORTBUY',
    });
    const loginResponse = await login(user.email);
    const token = loginResponse.body.data.accessToken;

    const verifyResponse = await request(app)
      .post('/api/transport/verify-lcc')
      .set('Authorization', `Bearer ${token}`)
      .send({ accountID: 'LCC-12345' });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.data.customerName).toBeTruthy();

    const payResponse = await request(app)
      .post('/api/transport/pay-lcc')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Device-ID', testDeviceId)
      .send({
        accountID: 'LCC-12345',
        amount: 1000,
        phone: user.phoneNumber,
        customerName: verifyResponse.body.data.customerName,
        transactionPin: '654321',
      });

    expect(payResponse.status).toBe(201);
    expect(payResponse.body.data.amountCharged).toBe(1100);
    expect(payResponse.body.data.promoApplied).toBe(false);
    expect(payResponse.body.data.walletBalance).toBe(5900);
    expect(payResponse.body.data.br9GoldPoints).toBe(10);

    const bookingResponse = await request(app)
      .post('/api/transport/bus-ticket')
      .set('Authorization', `Bearer ${token}`)
      .send({
        departure: 'Lagos',
        destination: 'Abuja',
        operator: 'GIGM',
        travelDate: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(bookingResponse.status).toBe(202);
    expect(bookingResponse.body.data.reference).toMatch(/^BR9-BUS-/);
    expect(await TransportBooking.countDocuments({ userId: user._id })).toBe(1);
  });

  test('Government: generated RRR can be paid from wallet with cashback', async () => {
    const user = await createUser({
      fullName: 'Gov Buyer',
      email: 'gov@br9.test',
      phoneNumber: '08030000009',
      bayrightTag: '@govbuyer',
      balance: 8000,
      referralCode: 'GOVBUY',
    });
    const loginResponse = await login(user.email);
    const token = loginResponse.body.data.accessToken;

    const generateResponse = await request(app)
      .post('/api/gov/generate-rrr')
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceType: 'Immigration',
        details: { amount: 2500, payerName: user.fullName },
      });

    expect(generateResponse.status).toBe(201);
    const rrr = generateResponse.body.data.rrr;

    const payResponse = await request(app)
      .post('/api/gov/pay-rrr')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Device-ID', testDeviceId)
      .send({ rrr, amount: 2500, transactionPin: '654321' });

    expect(payResponse.status).toBe(201);
    expect(payResponse.body.data.amountCharged).toBe(2650);
    expect(payResponse.body.data.promoApplied).toBe(false);
    expect(payResponse.body.data.walletBalance).toBe(5350);
    expect(payResponse.body.data.br9GoldPoints).toBe(12);

    const payment = await GovernmentPayment.findOne({ userId: user._id, rrr }).lean();
    expect(payment.status).toBe('paid');
  });

  test('Betting: verified account funding debits wallet with cashback', async () => {
    const user = await createUser({
      fullName: 'Bet Buyer',
      email: 'bet@br9.test',
      phoneNumber: '08030000010',
      bayrightTag: '@betbuyer',
      balance: 6000,
      referralCode: 'BETBUY',
    });
    const loginResponse = await login(user.email);
    const token = loginResponse.body.data.accessToken;

    const verifyResponse = await request(app)
      .post('/api/betting/verify-account')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookmaker: 'SportyBet', customerId: 'SB123' });

    expect(verifyResponse.status).toBe(200);

    const fundResponse = await request(app)
      .post('/api/betting/fund')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Device-ID', testDeviceId)
      .send({
        bookmaker: 'SportyBet',
        customerId: 'SB123',
        customerName: verifyResponse.body.data.customerName,
        amount: 2000,
        phone: user.phoneNumber,
        transactionPin: '654321',
      });

    expect(fundResponse.status).toBe(201);
    expect(fundResponse.body.data.amountCharged).toBe(2100);
    expect(fundResponse.body.data.promoApplied).toBe(false);
    expect(fundResponse.body.data.walletBalance).toBe(3900);
    expect(fundResponse.body.data.br9GoldPoints).toBe(10);
    expect(await BettingFunding.countDocuments({ userId: user._id })).toBe(1);
  });

  test('Live and trivia: admin can trigger code and users can earn BR9 GOLD', async () => {
    const admin = await createUser({
      fullName: 'Admin User',
      email: 'admin@br9.test',
      phoneNumber: '08030000011',
      bayrightTag: '@adminuser',
      referralCode: 'ADMIN1',
      role: 'admin',
    });
    const user = await createUser({
      fullName: 'Live Player',
      email: 'live@br9.test',
      phoneNumber: '08030000012',
      bayrightTag: '@liveplayer',
      referralCode: 'LIVEPLY',
    });

    const adminToken = (await login(admin.email)).body.data.accessToken;
    const userToken = (await login(user.email)).body.data.accessToken;

    const triggerResponse = await request(app)
      .post('/api/admin/trigger-live-event')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ liveCode: '4321', currentQuestion: 'Live now', rewardPool: 10000 });

    expect(triggerResponse.status).toBe(201);

    const submitResponse = await request(app)
      .post('/api/live/submit-code')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ liveCode: '4321' });

    expect(submitResponse.status).toBe(201);
    expect(submitResponse.body.data.awardedPoints).toBe(50);

    const questionsResponse = await request(app)
      .get('/api/trivia/questions')
      .set('Authorization', `Bearer ${userToken}`);

    expect(questionsResponse.status).toBe(200);
    const questionId = questionsResponse.body.data[0].id;
    const triviaQuestion = await Trivia.findById(questionId).lean();

    const answerResponse = await request(app)
      .post('/api/trivia/answer')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        questionId,
        selectedOptionIndex: triviaQuestion.correctOptionIndex,
      });

    expect(answerResponse.status).toBe(200);
    expect(answerResponse.body.data.correct).toBe(true);
    expect(answerResponse.body.data.br9GoldPoints).toBe(55);
  });

  test('Admin god-mode: freeze blocks account access and gold rate can be updated', async () => {
    const admin = await createUser({
      fullName: 'Ops Admin',
      email: 'ops-admin@br9.test',
      phoneNumber: '08030000014',
      bayrightTag: '@opsadmin',
      referralCode: 'OPSADMIN',
      role: 'admin',
    });
    const user = await createUser({
      fullName: 'Risky User',
      email: 'risky@br9.test',
      phoneNumber: '08030000015',
      bayrightTag: '@riskyuser',
      referralCode: 'RISKY',
      balance: 1000,
    });

    const adminToken = (await login(admin.email)).body.data.accessToken;
    const userToken = (await login(user.email)).body.data.accessToken;

    const rateResponse = await request(app)
      .patch('/api/admin/gold-rate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ goldToNairaRatio: 0.25 });

    expect(rateResponse.status).toBe(200);
    expect(rateResponse.body.data.goldToNairaRatio).toBe(0.25);

    const freezeResponse = await request(app)
      .patch(`/api/admin/users/${user._id.toString()}/freeze`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ freeze: true, reason: 'fraud review' });

    expect(freezeResponse.status).toBe(200);
    expect(freezeResponse.body.data.isFrozen).toBe(true);

    const blockedProfileResponse = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(blockedProfileResponse.status).toBe(423);
  });
});
