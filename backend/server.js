'use strict';

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const bcrypt = require('bcryptjs');
const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : process.env.APP_ENV === 'prod'
      ? '.env.prod'
      : '.env.dev';
dotenv.config({ path: path.join(__dirname, envFile) });

const { connectDb } = require('./config/db');
const { REFERRAL_POINTS } = require('./config/constants');
const {
  Ad,
  KycRecord,
  PhoneVerification,
  Prediction,
  SecurityEvent,
  Transaction,
  User,
  UserNotification,
} = require('./models');
const {
  coolingOutflowLimit,
  deviceGuard,
  recordDailyOutflow,
} = require('./middleware/deviceGuard');
const { blockWebGameplay } = require('./middleware/gameAccessGuard');
const {
  authenticateAccessToken,
  checkKycLimit,
} = require('./middleware/security.middleware');
const { requireTransactionPin } = require('./middleware/transactionPin');
const {
  buildLoginQuery,
  normaliseLoginIdentifier,
  resolveSessionContext,
} = require('./middleware/auth');
const adminRoutes = require('./routes/admin.routes');
const bettingRoutes = require('./routes/betting');
const governmentRoutes = require('./routes/government');
const liveRoutes = require('./routes/live');
const transportRoutes = require('./routes/transport');
const triviaRoutes = require('./routes/trivia');
const utilityRoutes = require('./routes/utility');
const vendingRoutes = require('./routes/vending');
const {
  getWeeklyLeaderboard,
  startPayoutEngine,
} = require('./jobs/payout_engine');
const { startPayoutProcessor } = require('./jobs/payout_processor');
const {
  maskPhoneNumber,
  sendVerificationSms,
} = require('./services/sms.service');
const {
  getPublicPromoSummary,
  killPromoCampaign,
  PROMO_SERVICE_KEYS,
  savePromoCampaign,
} = require('./services/promo.service');
const {
  getProviderConfig,
  saveProviderConfig,
} = require('./services/provider_config.service');
const {
  creditDepositFromWebhook,
  ensureUserVirtualAccount,
} = require('./services/funding_rail.service');
const { sendSiteMail } = require('./services/site_mailer.service');
const { fetchLiveGames } = require('./services/sports_api.service');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.disable('x-powered-by');
app.use(
  cors({
    origin: process.env.WEB_ORIGIN
      ? process.env.WEB_ORIGIN.split(',').map((item) => item.trim())
      : true,
    credentials: true,
  })
);
app.use(helmet());
app.use(compression());
app.use(
  express.json({
    limit: '6mb',
    verify: (req, _res, buffer) => {
      req.rawBody = buffer.toString('utf8');
    },
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many requests. Please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many sensitive requests. Please try again in a minute.',
  },
});

if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', globalLimiter);
  app.use('/api/auth', authLimiter);
  app.use('/api/transactions', authLimiter);
}

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const ACCOUNT_STATUS_OPTIONS = new Set([
  'active',
  'suspended',
  'restricted',
  'verification_required',
  'under_review',
  'deleted',
]);

const ACCOUNT_STATUS_LABELS = {
  active: 'Active',
  suspended: 'Suspended',
  restricted: 'Restricted',
  verification_required: 'Request Verification',
  under_review: 'Under Review',
  deleted: 'Deleted',
};

function successResponse(data, message = '') {
  return { success: true, data, message };
}

function createReference(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;
}

const PHONE_VERIFICATION_TTL_MS = 10 * 60 * 1000;
const PHONE_VERIFICATION_RESEND_MS = 45 * 1000;
const PHONE_VERIFICATION_MAX_ATTEMPTS = 5;
const PASSPORT_PHOTO_MAX_BYTES = 1500 * 1024;
const SITE_CONFIG_PATH = path.join(__dirname, '..', 'br9', 'config', 'config.json');
const DEFAULT_SITE_CONFIG = {
  brandName: 'BR9ja',
  companyName: 'BayRight9ja Ltd',
  slogan: 'Play for BR9 Gold, Pay Your Bills and Win',
  siteUrl: 'https://br9.ng',
  playStoreUrl:
    'https://play.google.com/store/apps/details?id=com.bayright9ja.bayright9ja_mobile',
  appStoreUrl: 'https://apps.apple.com/app/id0000000000',
  platformMode: 'live',
  maintenanceNotice:
    'All core services are available for wallet-led growth this week.',
  opsEmail: 'ops@br9.ng',
  supportEmail: 'support@br9.ng',
  whatsappNumber: '2340000000000',
  whatsappPrefill: 'Hi i need help with',
  socialTikTokUrl: 'https://www.tiktok.com/@br9ja',
  socialInstagramUrl: 'https://www.instagram.com/br9ja/',
  socialXUrl: 'https://x.com/br9ja',
  socialYouTubeUrl: 'https://www.youtube.com/@BR9ja',
  socialFacebookUrl: '',
  officeLocation: 'Lagos, Nigeria',
  mondayBenchmarkGold: 1000,
  mondayBenchmarkNaira: 100,
  payoutRequirements: '10 ads + 1 service transaction',
  payoutProcessorMode: 'automatic',
  liveRewardPool: '50 BR9 Gold for the first 500 valid Sunday live winners',
  serviceWalletStatus: 'live',
  serviceWalletNote:
    'Internal transfers, balance sync, and payout visibility stay active.',
  serviceWalletMarkup: 0,
  serviceAirtimeStatus: 'live',
  serviceAirtimeNote:
    'Instant recharge across MTN, Airtel, Glo, and 9mobile.',
  serviceAirtimeMarkup: 50,
  serviceDataStatus: 'live',
  serviceDataNote: 'Fast bundle vending with wallet-first checkout.',
  serviceDataMarkup: 50,
  serviceElectricityStatus: 'live',
  serviceElectricityNote:
    'Meter verification and token delivery stay enabled.',
  serviceElectricityMarkup: 100,
  serviceCableTvStatus: 'live',
  serviceCableTvNote:
    'DSTV, GOtv, StarTimes, and internet subscription flows are available.',
  serviceCableTvMarkup: 200,
  serviceEducationStatus: 'live',
  serviceEducationNote:
    'WAEC, JAMB, NECO, and exam-pin vending is visible in marketplace.',
  serviceEducationMarkup: 150,
  serviceTransportStatus: 'soft-launch',
  serviceTransportNote:
    'LCC top-up and interstate booking intake remain supervised.',
  serviceTransportMarkup: 100,
  serviceGovernmentStatus: 'soft-launch',
  serviceGovernmentNote: 'RRR-driven payments stay on guarded rollout.',
  serviceGovernmentMarkup: 150,
  serviceBettingStatus: 'soft-launch',
  serviceBettingNote:
    'Funding flows remain ID-checked before completion.',
  serviceBettingMarkup: 100,
  serviceMarketplaceStatus: 'live',
  serviceMarketplaceNote:
    'Daily needs checkout and cashback loops stay active.',
  serviceMarketplaceMarkup: 75,
  serviceVirtualCardsMarkup: 250,
  serviceGoldSavingsMarkup: 0,
  serviceFiveGDataMarkup: 75,
  serviceDiscoMarkup: 120,
  serviceDriverLicenseMarkup: 250,
  serviceNetflixMarkup: 200,
  serviceShowmaxMarkup: 150,
  serviceSpotifyMarkup: 120,
  serviceGamingCardsMarkup: 250,
  serviceGiftCardsMarkup: 300,
  serviceEventTicketsMarkup: 200,
  marketRunnerStatus: 'live',
  triviaRushStatus: 'warmup',
  sundayLiveStatus: 'warmup',
  gameAccessMode: 'app-only',
  phoneVerificationRequired: 'required',
  passportPhotoRequired: 'enabled',
  quickLoginModes:
    '6-digit PIN, Face ID, fingerprint, device PIN, and pattern',
};

const SUPER_APP_MARKUP_FIELDS = [
  'serviceVirtualCardsMarkup',
  'serviceGoldSavingsMarkup',
  'serviceFiveGDataMarkup',
  'serviceDiscoMarkup',
  'serviceDriverLicenseMarkup',
  'serviceNetflixMarkup',
  'serviceShowmaxMarkup',
  'serviceSpotifyMarkup',
  'serviceGamingCardsMarkup',
  'serviceGiftCardsMarkup',
  'serviceEventTicketsMarkup',
];

const SITE_ADMIN_SERVICE_FIELDS = {
  wallet: {
    label: 'Wallet & Transfers',
    markupField: 'serviceWalletMarkup',
    statusField: 'serviceWalletStatus',
    noteField: 'serviceWalletNote',
    transactionTypes: ['P2P'],
  },
  airtime: {
    label: 'Airtime',
    markupField: 'serviceAirtimeMarkup',
    statusField: 'serviceAirtimeStatus',
    noteField: 'serviceAirtimeNote',
    transactionTypes: ['Airtime'],
  },
  data: {
    label: 'Data Bundles',
    markupField: 'serviceDataMarkup',
    statusField: 'serviceDataStatus',
    noteField: 'serviceDataNote',
    transactionTypes: [],
  },
  electricity: {
    label: 'Electricity',
    markupField: 'serviceElectricityMarkup',
    statusField: 'serviceElectricityStatus',
    noteField: 'serviceElectricityNote',
    transactionTypes: ['Electricity'],
  },
  cableTv: {
    label: 'Cable TV & Internet',
    markupField: 'serviceCableTvMarkup',
    statusField: 'serviceCableTvStatus',
    noteField: 'serviceCableTvNote',
    transactionTypes: ['TV', 'Internet'],
  },
  education: {
    label: 'Education Pins',
    markupField: 'serviceEducationMarkup',
    statusField: 'serviceEducationStatus',
    noteField: 'serviceEducationNote',
    transactionTypes: ['Education'],
  },
  transport: {
    label: 'Transport',
    markupField: 'serviceTransportMarkup',
    statusField: 'serviceTransportStatus',
    noteField: 'serviceTransportNote',
    transactionTypes: ['Transport'],
  },
  government: {
    label: 'Government',
    markupField: 'serviceGovernmentMarkup',
    statusField: 'serviceGovernmentStatus',
    noteField: 'serviceGovernmentNote',
    transactionTypes: ['Government'],
  },
  betting: {
    label: 'Betting',
    markupField: 'serviceBettingMarkup',
    statusField: 'serviceBettingStatus',
    noteField: 'serviceBettingNote',
    transactionTypes: ['Betting'],
  },
  marketplace: {
    label: 'Marketplace',
    markupField: 'serviceMarketplaceMarkup',
    statusField: 'serviceMarketplaceStatus',
    noteField: 'serviceMarketplaceNote',
    transactionTypes: ['Marketplace'],
  },
};

function hashValue(value) {
  return crypto
    .createHash('sha256')
    .update(String(value || ''))
    .digest('hex');
}

function generateOtpCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function generateVerificationToken() {
  return crypto.randomBytes(24).toString('hex');
}

function normalisePhoneNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function isValidOptionalUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return true;
  }

  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_error) {
    return false;
  }
}

function normaliseAdminChoice(value, allowedValues, fallback) {
  const allowed = new Set(allowedValues);
  const normalised = String(value || '')
    .trim()
    .toLowerCase();
  return allowed.has(normalised) ? normalised : fallback;
}

function normaliseNonNegativeInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return fallback;
}

function parseOptionalDateBoundary(value, endOfDay = false) {
  const raw = String(value || '').trim();
  if (!raw) {
    return null;
  }

  const suffix = endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
  const parsed = new Date(raw.includes('T') ? raw : `${raw}${suffix}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildSiteAdminTransactionMatch(startDate, endDate) {
  const match = { status: 'success' };
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) {
      match.timestamp.$gte = startDate;
    }
    if (endDate) {
      match.timestamp.$lte = endDate;
    }
  }
  return match;
}

async function buildSiteProfitMatrixSummary(siteConfig, dateRange = {}) {
  const match = buildSiteAdminTransactionMatch(dateRange.startDate, dateRange.endDate);
  const transactions = await Transaction.find(match)
    .select('type amount metadata')
    .lean();

  return Object.entries(SITE_ADMIN_SERVICE_FIELDS).map(([key, meta]) => {
    const markup = Number(siteConfig[meta.markupField] || 0);
    const relevantTransactions = transactions.filter((transaction) =>
      meta.transactionTypes.includes(transaction.type)
    );
    const count = relevantTransactions.length;
    const volume = relevantTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount || 0),
      0
    );
    const totalProfitGenerated = relevantTransactions.reduce((sum, transaction) => {
      if (Number.isFinite(Number(transaction.metadata?.realizedMargin))) {
        return sum + Number(transaction.metadata.realizedMargin);
      }
      return sum + markup;
    }, 0);

    return {
      key,
      label: meta.label,
      status: siteConfig[meta.statusField],
      note: siteConfig[meta.noteField],
      markup,
      transactionCount: count,
      transactionVolume: volume,
      totalProfitGenerated,
    };
  });
}

async function readSiteConfig() {
  try {
    const raw = await fs.readFile(SITE_CONFIG_PATH, 'utf8');
    return {
      ...DEFAULT_SITE_CONFIG,
      ...JSON.parse(raw),
    };
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn('Failed to read site config, using defaults.', error);
    }
    return { ...DEFAULT_SITE_CONFIG };
  }
}

async function writeSiteConfig(nextConfig) {
  const merged = {
    ...DEFAULT_SITE_CONFIG,
    ...nextConfig,
  };

  await fs.mkdir(path.dirname(SITE_CONFIG_PATH), { recursive: true });
  await fs.writeFile(SITE_CONFIG_PATH, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  return merged;
}

function requireSiteAdminToken(req) {
  const providedToken = String(
    req.get('x-site-admin-token') || req.body?.adminToken || ''
  ).trim();
  const expectedToken =
    process.env.SITE_ADMIN_TOKEN ||
    (process.env.NODE_ENV !== 'production' ? 'br9-local-admin' : '');

  if (!expectedToken) {
    throw new HttpError(
      503,
      'SITE_ADMIN_TOKEN is not configured for this environment.'
    );
  }

  if (!providedToken || providedToken !== expectedToken) {
    throw new HttpError(401, 'A valid admin token is required.');
  }
}

function parseBase64ImageDataUrl(imageDataUrl) {
  const match = String(imageDataUrl || '')
    .trim()
    .match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/i);

  if (!match) {
    throw new HttpError(
      400,
      'Upload a PNG, JPG, or WEBP passport photo as a base64 image.'
    );
  }

  const mimeType = match[1].toLowerCase().replace('jpg', 'jpeg');
  const base64Body = match[2];
  const buffer = Buffer.from(base64Body, 'base64');

  if (!buffer.length) {
    throw new HttpError(400, 'Passport photo data could not be decoded.');
  }

  if (buffer.length > PASSPORT_PHOTO_MAX_BYTES) {
    throw new HttpError(
      413,
      'Passport photo is too large. Keep it under 1.5MB.'
    );
  }

  return {
    mimeType,
    normalizedDataUrl: `data:${mimeType};base64,${buffer.toString('base64')}`,
  };
}

function normaliseBayrightTag(value) {
  const tag = String(value || '').trim().toLowerCase();
  if (!tag) {
    return '';
  }
  return tag.startsWith('@') ? tag : `@${tag}`;
}

async function generateReferralCode(fullName = 'BR9') {
  const prefix =
    String(fullName)
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 4)
      .toUpperCase() || 'BR9';

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = `${prefix}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const exists = await User.exists({ referralCode: code });
    if (!exists) {
      return code;
    }
  }

  throw new HttpError(500, 'Could not generate a referral code.');
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_TTL || '15m',
    }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: 'refresh',
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_TTL || '30d',
    }
  );
}

function normaliseAmount(value) {
  return typeof value === 'number'
    ? value
    : Number.parseFloat(String(value ?? 0));
}

function normaliseAccountStatus(value) {
  const status = String(value || '').trim().toLowerCase();
  if (!ACCOUNT_STATUS_OPTIONS.has(status)) {
    throw new HttpError(400, 'Invalid account status action.');
  }
  return status;
}

function getAccountStatusLabel(status) {
  return ACCOUNT_STATUS_LABELS[status] || ACCOUNT_STATUS_LABELS.active;
}

function buildAccountStatusNotificationBody(status, reason) {
  const label = getAccountStatusLabel(status);
  if (status === 'active') {
    return 'Your BR9ja account has been restored. You can continue using services.';
  }

  if (status === 'deleted') {
    return 'Your BR9ja account has been marked deleted and can no longer be used.';
  }

  return reason
    ? `Your BR9ja account is now ${label.toLowerCase()}: ${reason}`
    : `Your BR9ja account is now ${label.toLowerCase()}.`;
}

function buildAccountNumber(user) {
  if (user.accountNumber && String(user.accountNumber).trim().length > 0) {
    return user.accountNumber;
  }

  const digits = String(user.phoneNumber || '').replace(/\D/g, '');
  return digits.padStart(10, '0').slice(-10);
}

function mapService(type) {
  switch (type) {
    case 'P2P':
      return 'Internal Transfer';
    case 'Deposit':
      return 'Wallet Deposit';
    case 'Airtime':
      return 'Airtime';
    case 'Bill':
      return 'Bill Payment';
    case 'Education':
      return 'Education PIN';
    case 'Electricity':
      return 'Electricity';
    case 'TV':
      return 'TV Subscription';
    case 'Internet':
      return 'Internet Subscription';
    case 'Transport':
      return 'Transport';
    case 'Government':
      return 'Government Payment';
    case 'Betting':
      return 'Betting Wallet Funding';
    case 'PointConversion':
      return 'BR9 Gold Conversion';
    case 'Reward':
      return 'BR9 Reward';
    case 'AdminAdjustment':
      return 'Admin Wallet Adjustment';
    case 'Marketplace':
      return 'Marketplace';
    default:
      return type;
  }
}

function serialiseTransaction(transaction) {
  return {
    id: transaction._id.toString(),
    reference: transaction.reference,
    service: mapService(transaction.type),
    type: transaction.type,
    status: transaction.status,
    amount: normaliseAmount(transaction.amount),
    recipientName: transaction.receiverName || null,
    senderName: transaction.senderName || null,
    note: transaction.note || null,
    balanceAfter: normaliseAmount(transaction.balanceAfter),
    createdAt: transaction.createdAt || transaction.timestamp,
    timestamp: transaction.createdAt || transaction.timestamp,
    metadata: transaction.metadata || {},
  };
}

async function buildUserProfile(userId) {
  let user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User profile not found.');
  }

  if (!user.virtualAccountNumber) {
    user = await ensureUserVirtualAccount(user);
  }

  const userDoc = user.toObject ? user.toObject() : user;

  const transactions = await Transaction.find({
    $or: [{ senderId: userDoc._id }, { receiverId: userDoc._id }],
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    id: userDoc._id.toString(),
    fullName: userDoc.fullName,
    email: userDoc.email,
    role: userDoc.role,
    phoneNumber: userDoc.phoneNumber,
    phoneVerified: Boolean(userDoc.phoneVerifiedAt),
    phoneVerifiedAt: userDoc.phoneVerifiedAt,
    bayrightTag: userDoc.bayrightTag,
    accountNumber: buildAccountNumber(userDoc),
    virtualAccount: {
      accountNumber: userDoc.virtualAccountNumber || buildAccountNumber(userDoc),
      bankName: userDoc.virtualAccountBankName || 'GTBank',
      accountName:
        userDoc.virtualAccountName ||
        String(userDoc.bayrightTag || userDoc.fullName || '').toUpperCase(),
      provider: userDoc.virtualAccountProvider || 'demo',
      reference: userDoc.virtualAccountReference || '',
      status: userDoc.virtualAccountStatus || 'pending',
    },
    kycTier: userDoc.kycTier,
    accountStatus: userDoc.accountStatus || 'active',
    accountStatusReason: userDoc.accountStatusReason || userDoc.freezeReason || '',
    accountStatusUpdatedAt: userDoc.accountStatusUpdatedAt || userDoc.frozenAt || null,
    isFrozen: Boolean(userDoc.isFrozen),
    walletBalance: normaliseAmount(userDoc.balance),
    br9GoldPoints: Number(userDoc.br9GoldPoints || 0),
    referralCode: userDoc.referralCode || '',
    isLivenessVerified: Boolean(userDoc.isLivenessVerified),
    passportPhotoDataUrl: userDoc.passportPhotoDataUrl || '',
    passportPhotoUpdatedAt: userDoc.passportPhotoUpdatedAt,
    favoriteTeamIds: userDoc.favoriteTeamIds || [],
    transactions: transactions.map(serialiseTransaction),
  };
}

function buildRecipientQuery(identifier) {
  const normalised = String(identifier || '').trim();
  const digits = normalised.replace(/\D/g, '');

  return {
    $or: [
      { bayrightTag: normalised.toLowerCase() },
      { phoneNumber: normalised },
      { phoneNumber: digits },
      { email: normalised.toLowerCase() },
    ],
  };
}

app.get('/health', (_req, res) => {
  res.json(
    successResponse(
      {
        status: 'ok',
        service: 'bayright9ja-backend',
      },
      'Backend healthy.'
    )
  );
});

app.get('/api/site-config', async (_req, res, next) => {
  try {
    const config = await readSiteConfig();
    res.json(successResponse(config, 'Site config fetched successfully.'));
  } catch (error) {
    next(error);
  }
});

app.get('/api/site-promo', async (_req, res, next) => {
  try {
    const promo = await getPublicPromoSummary();
    res.json(
      successResponse(
        promo,
        promo ? 'Promo summary fetched successfully.' : 'No promo is live right now.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/site/contact', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const subject = String(req.body?.subject || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!name || !email || !subject || !message) {
      throw new HttpError(
        400,
        'name, email, subject, and message are required.'
      );
    }

    if (!isValidEmail(email)) {
      throw new HttpError(400, 'email must be valid.');
    }

    const siteConfig = await readSiteConfig();
    const delivery = await sendSiteMail({
      to: siteConfig.supportEmail,
      subject: `[BR9ja Contact] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html: `
        <h2>BR9ja Contact Form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      `,
      meta: {
        kind: 'contact',
      },
    });

    res.status(202).json(
      successResponse(
        {
          routedTo: siteConfig.supportEmail,
          email,
          deliveryMode: delivery.deliveryMode,
          messageId: delivery.messageId,
        },
        'Support message accepted.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/site/payout-issue', async (req, res, next) => {
  try {
    const username = String(req.body?.username || '').trim();
    const transactionId = String(req.body?.transactionId || '').trim();
    const date = String(req.body?.date || '').trim();

    if (!username || !transactionId || !date) {
      throw new HttpError(
        400,
        'username, transactionId, and date are required.'
      );
    }

    const siteConfig = await readSiteConfig();
    const delivery = await sendSiteMail({
      to: siteConfig.opsEmail,
      subject: `[BR9ja Payout Issue] ${transactionId}`,
      text: `Username: ${username}\nTransaction ID: ${transactionId}\nDate: ${date}`,
      html: `
        <h2>BR9ja Payout Issue</h2>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p><strong>Date:</strong> ${date}</p>
      `,
      meta: {
        kind: 'payout-issue',
      },
    });

    res.status(202).json(
      successResponse(
        {
          routedTo: siteConfig.opsEmail,
          deliveryMode: delivery.deliveryMode,
          messageId: delivery.messageId,
        },
        'Payout issue submitted successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/site-config', async (req, res, next) => {
  try {
    requireSiteAdminToken(req);

    const nextConfig = {
      siteUrl: String(req.body?.siteUrl || '').trim(),
      playStoreUrl: String(req.body?.playStoreUrl || '').trim(),
      appStoreUrl: String(req.body?.appStoreUrl || '').trim(),
      platformMode: normaliseAdminChoice(
        req.body?.platformMode,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.platformMode
      ),
      maintenanceNotice:
        String(req.body?.maintenanceNotice || '').trim() ||
        DEFAULT_SITE_CONFIG.maintenanceNotice,
      whatsappNumber: normalisePhoneNumber(req.body?.whatsappNumber),
      opsEmail: String(req.body?.opsEmail || '').trim().toLowerCase(),
      supportEmail: String(req.body?.supportEmail || '').trim().toLowerCase(),
      whatsappPrefill:
        String(req.body?.whatsappPrefill || '').trim() ||
        DEFAULT_SITE_CONFIG.whatsappPrefill,
      socialTikTokUrl: String(req.body?.socialTikTokUrl || '').trim(),
      socialInstagramUrl: String(req.body?.socialInstagramUrl || '').trim(),
      socialXUrl: String(req.body?.socialXUrl || '').trim(),
      socialYouTubeUrl: String(req.body?.socialYouTubeUrl || '').trim(),
      socialFacebookUrl: String(req.body?.socialFacebookUrl || '').trim(),
      serviceWalletStatus: normaliseAdminChoice(
        req.body?.serviceWalletStatus,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.serviceWalletStatus
      ),
      serviceWalletNote:
        String(req.body?.serviceWalletNote || '').trim() ||
        DEFAULT_SITE_CONFIG.serviceWalletNote,
      serviceWalletMarkup: normaliseNonNegativeInteger(
        req.body?.serviceWalletMarkup,
        DEFAULT_SITE_CONFIG.serviceWalletMarkup
      ),
      serviceAirtimeStatus: normaliseAdminChoice(
        req.body?.serviceAirtimeStatus,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.serviceAirtimeStatus
      ),
      serviceAirtimeNote:
        String(req.body?.serviceAirtimeNote || '').trim() ||
        DEFAULT_SITE_CONFIG.serviceAirtimeNote,
      serviceAirtimeMarkup: normaliseNonNegativeInteger(
        req.body?.serviceAirtimeMarkup,
        DEFAULT_SITE_CONFIG.serviceAirtimeMarkup
      ),
      serviceDataStatus: normaliseAdminChoice(
        req.body?.serviceDataStatus,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.serviceDataStatus
      ),
      serviceDataNote:
        String(req.body?.serviceDataNote || '').trim() ||
        DEFAULT_SITE_CONFIG.serviceDataNote,
      serviceDataMarkup: normaliseNonNegativeInteger(
        req.body?.serviceDataMarkup,
        DEFAULT_SITE_CONFIG.serviceDataMarkup
      ),
      serviceElectricityStatus: normaliseAdminChoice(
        req.body?.serviceElectricityStatus,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.serviceElectricityStatus
      ),
      serviceElectricityNote:
        String(req.body?.serviceElectricityNote || '').trim() ||
        DEFAULT_SITE_CONFIG.serviceElectricityNote,
      serviceElectricityMarkup: normaliseNonNegativeInteger(
        req.body?.serviceElectricityMarkup,
        DEFAULT_SITE_CONFIG.serviceElectricityMarkup
      ),
      serviceCableTvStatus: normaliseAdminChoice(
        req.body?.serviceCableTvStatus,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.serviceCableTvStatus
      ),
      serviceCableTvNote:
        String(req.body?.serviceCableTvNote || '').trim() ||
        DEFAULT_SITE_CONFIG.serviceCableTvNote,
      serviceCableTvMarkup: normaliseNonNegativeInteger(
        req.body?.serviceCableTvMarkup,
        DEFAULT_SITE_CONFIG.serviceCableTvMarkup
      ),
      serviceEducationStatus: normaliseAdminChoice(
        req.body?.serviceEducationStatus,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.serviceEducationStatus
      ),
      serviceEducationNote:
        String(req.body?.serviceEducationNote || '').trim() ||
        DEFAULT_SITE_CONFIG.serviceEducationNote,
      serviceEducationMarkup: normaliseNonNegativeInteger(
        req.body?.serviceEducationMarkup,
        DEFAULT_SITE_CONFIG.serviceEducationMarkup
      ),
      serviceTransportStatus: normaliseAdminChoice(
        req.body?.serviceTransportStatus,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.serviceTransportStatus
      ),
      serviceTransportNote:
        String(req.body?.serviceTransportNote || '').trim() ||
        DEFAULT_SITE_CONFIG.serviceTransportNote,
      serviceTransportMarkup: normaliseNonNegativeInteger(
        req.body?.serviceTransportMarkup,
        DEFAULT_SITE_CONFIG.serviceTransportMarkup
      ),
      serviceGovernmentStatus: normaliseAdminChoice(
        req.body?.serviceGovernmentStatus,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.serviceGovernmentStatus
      ),
      serviceGovernmentNote:
        String(req.body?.serviceGovernmentNote || '').trim() ||
        DEFAULT_SITE_CONFIG.serviceGovernmentNote,
      serviceGovernmentMarkup: normaliseNonNegativeInteger(
        req.body?.serviceGovernmentMarkup,
        DEFAULT_SITE_CONFIG.serviceGovernmentMarkup
      ),
      serviceBettingStatus: normaliseAdminChoice(
        req.body?.serviceBettingStatus,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.serviceBettingStatus
      ),
      serviceBettingNote:
        String(req.body?.serviceBettingNote || '').trim() ||
        DEFAULT_SITE_CONFIG.serviceBettingNote,
      serviceBettingMarkup: normaliseNonNegativeInteger(
        req.body?.serviceBettingMarkup,
        DEFAULT_SITE_CONFIG.serviceBettingMarkup
      ),
      serviceMarketplaceStatus: normaliseAdminChoice(
        req.body?.serviceMarketplaceStatus,
        ['live', 'featured', 'soft-launch', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.serviceMarketplaceStatus
      ),
      serviceMarketplaceNote:
        String(req.body?.serviceMarketplaceNote || '').trim() ||
        DEFAULT_SITE_CONFIG.serviceMarketplaceNote,
      serviceMarketplaceMarkup: normaliseNonNegativeInteger(
        req.body?.serviceMarketplaceMarkup,
        DEFAULT_SITE_CONFIG.serviceMarketplaceMarkup
      ),
      marketRunnerStatus: normaliseAdminChoice(
        req.body?.marketRunnerStatus,
        ['live', 'warmup', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.marketRunnerStatus
      ),
      triviaRushStatus: normaliseAdminChoice(
        req.body?.triviaRushStatus,
        ['live', 'warmup', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.triviaRushStatus
      ),
      sundayLiveStatus: normaliseAdminChoice(
        req.body?.sundayLiveStatus,
        ['live', 'warmup', 'maintenance', 'paused'],
        DEFAULT_SITE_CONFIG.sundayLiveStatus
      ),
      gameAccessMode: normaliseAdminChoice(
        req.body?.gameAccessMode,
        ['app-only', 'paused'],
        DEFAULT_SITE_CONFIG.gameAccessMode
      ),
      mondayBenchmarkGold: normaliseNonNegativeInteger(
        req.body?.mondayBenchmarkGold,
        DEFAULT_SITE_CONFIG.mondayBenchmarkGold
      ),
      mondayBenchmarkNaira: normaliseNonNegativeInteger(
        req.body?.mondayBenchmarkNaira,
        DEFAULT_SITE_CONFIG.mondayBenchmarkNaira
      ),
      payoutRequirements:
        String(req.body?.payoutRequirements || '').trim() ||
        DEFAULT_SITE_CONFIG.payoutRequirements,
      liveRewardPool:
        String(req.body?.liveRewardPool || '').trim() ||
        DEFAULT_SITE_CONFIG.liveRewardPool,
      payoutProcessorMode: normaliseAdminChoice(
        req.body?.payoutProcessorMode,
        ['automatic', 'manual', 'paused'],
        DEFAULT_SITE_CONFIG.payoutProcessorMode
      ),
      phoneVerificationRequired: normaliseAdminChoice(
        req.body?.phoneVerificationRequired,
        ['required', 'optional', 'disabled'],
        DEFAULT_SITE_CONFIG.phoneVerificationRequired
      ),
      passportPhotoRequired: normaliseAdminChoice(
        req.body?.passportPhotoRequired,
        ['enabled', 'review-only', 'disabled'],
        DEFAULT_SITE_CONFIG.passportPhotoRequired
      ),
      quickLoginModes:
        String(req.body?.quickLoginModes || '').trim() ||
        DEFAULT_SITE_CONFIG.quickLoginModes,
    };

    SUPER_APP_MARKUP_FIELDS.forEach((field) => {
      nextConfig[field] = normaliseNonNegativeInteger(
        req.body?.[field],
        DEFAULT_SITE_CONFIG[field]
      );
    });

    if (
      !isValidOptionalUrl(nextConfig.siteUrl) ||
      !isValidOptionalUrl(nextConfig.playStoreUrl) ||
      !isValidOptionalUrl(nextConfig.appStoreUrl) ||
      !nextConfig.whatsappNumber ||
      !isValidEmail(nextConfig.opsEmail) ||
      !isValidEmail(nextConfig.supportEmail) ||
      !isValidOptionalUrl(nextConfig.socialTikTokUrl) ||
      !isValidOptionalUrl(nextConfig.socialInstagramUrl) ||
      !isValidOptionalUrl(nextConfig.socialXUrl) ||
      !isValidOptionalUrl(nextConfig.socialYouTubeUrl) ||
      !isValidOptionalUrl(nextConfig.socialFacebookUrl)
    ) {
      throw new HttpError(
        400,
        'Provide valid URLs, a valid whatsappNumber, and valid email routing values.'
      );
    }

    const saved = await writeSiteConfig(nextConfig);
    res.json(successResponse(saved, 'Site config updated successfully.'));
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/provider-config', async (req, res, next) => {
  try {
    requireSiteAdminToken(req);
    const config = await getProviderConfig();
    res.json(successResponse(config, 'Provider routing fetched successfully.'));
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/provider-config', async (req, res, next) => {
  try {
    requireSiteAdminToken(req);
    const saved = await saveProviderConfig(req.body || {});
    res.json(successResponse(saved, 'Provider routing updated successfully.'));
  } catch (error) {
    next(error);
  }
});

app.post('/api/webhook/deposit', async (req, res, next) => {
  try {
    const result = await creditDepositFromWebhook({
      payload: req.body || {},
      headers: req.headers || {},
      rawBody: req.rawBody || '',
    });

    res.json(
      successResponse(
        result,
        result.duplicate
          ? 'Deposit webhook already processed.'
          : 'Deposit webhook processed successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/site-promo', async (req, res, next) => {
  try {
    requireSiteAdminToken(req);
    const promo = await getPublicPromoSummary();
    res.json(
      successResponse(
        promo,
        promo
          ? 'Promo status fetched successfully.'
          : 'No promo is currently configured.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/site-promo', async (req, res, next) => {
  try {
    requireSiteAdminToken(req);

    const targetServices = Array.isArray(req.body?.targetServices)
      ? req.body.targetServices
      : String(req.body?.targetServices || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    if (
      targetServices.some(
        (item) => item !== 'all' && !PROMO_SERVICE_KEYS.includes(String(item || '').trim())
      )
    ) {
      throw new HttpError(400, 'Promo targetServices include an unsupported service key.');
    }

    const savedPromo = await savePromoCampaign({
      title: req.body?.title,
      discountType: req.body?.discountType,
      discountAmount: normaliseAmount(req.body?.discountAmount),
      discountPercent: normaliseAmount(req.body?.discountPercent),
      maxDiscountValue: normaliseAmount(req.body?.maxDiscountValue),
      targetServices,
      startAt: req.body?.startAt,
      endAt: req.body?.endAt,
      maxUses: normaliseNonNegativeInteger(req.body?.maxUses, 0),
      individualUserLimit: normaliseNonNegativeInteger(
        req.body?.individualUserLimit,
        1
      ),
      createdBy: null,
    });

    res.status(201).json(
      successResponse(savedPromo, 'Promo campaign saved successfully.')
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/site-promo/kill', async (req, res, next) => {
  try {
    requireSiteAdminToken(req);

    const campaignId = String(req.body?.campaignId || '').trim();
    const promo = await killPromoCampaign(campaignId);

    if (!promo) {
      throw new HttpError(404, 'No active or upcoming promo was found to stop.');
    }

    res.json(successResponse(promo, 'Promo campaign stopped successfully.'));
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/site-dashboard', async (req, res, next) => {
  try {
    requireSiteAdminToken(req);

    const siteConfig = await readSiteConfig();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      userCount,
      activeToday,
      transactionCount,
      todayVolumeRow,
      p2pVolumeRow,
      operationalExpenseRow,
      securityEventCount,
      pinFailureCount,
      securityEvents,
      profitMatrix,
    ] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ lastLoginAt: { $gte: todayStart } }),
        Transaction.countDocuments({ status: 'success' }),
        Transaction.aggregate([
          {
            $match: {
              status: 'success',
              timestamp: { $gte: todayStart },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]),
        Transaction.aggregate([
          {
            $match: {
              status: 'success',
              type: 'P2P',
              timestamp: { $gte: todayStart },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]),
        Transaction.aggregate([
          {
            $match: {
              status: 'success',
              type: 'Deposit',
              timestamp: { $gte: todayStart },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $ifNull: ['$metadata.operationalExpense', 0] } },
            },
          },
        ]),
        SecurityEvent.countDocuments({ createdAt: { $gte: todayStart } }),
        SecurityEvent.countDocuments({
          eventType: 'transaction-pin-failure',
          createdAt: { $gte: todayStart },
        }),
        SecurityEvent.find({})
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        buildSiteProfitMatrixSummary(siteConfig, { startDate: todayStart }),
      ]);

    const silentProfitTotal = profitMatrix.reduce(
      (sum, item) => sum + Number(item.totalProfitGenerated || 0),
      0
    );

    res.json(
      successResponse(
        {
          platformMode: siteConfig.platformMode,
          userCount,
          activeToday,
          transactionCount,
          todayVolume: Number(todayVolumeRow[0]?.total || 0),
          p2pVolume: Number(p2pVolumeRow[0]?.total || 0),
          operationalExpenseToday: Number(operationalExpenseRow[0]?.total || 0),
          securityEventCount,
          pinFailureCount,
          securityEvents: securityEvents.map((event) => ({
            id: event._id.toString(),
            eventType: event.eventType,
            severity: event.severity,
            username: event.bayrightTag || event.email || 'unknown',
            route: event.route,
            method: event.method,
            deviceId: event.deviceId,
            message: event.message,
            createdAt: event.createdAt,
          })),
          silentProfitTotal,
          benchmarkGold: siteConfig.mondayBenchmarkGold,
          benchmarkNaira: siteConfig.mondayBenchmarkNaira,
          profitMatrix,
        },
        'Site admin dashboard fetched successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/site-transactions', async (req, res, next) => {
  try {
    requireSiteAdminToken(req);

    const startDate = parseOptionalDateBoundary(req.query?.startDate);
    const endDate = parseOptionalDateBoundary(req.query?.endDate, true);
    const type = String(req.query?.type || '').trim();
    const limit = Math.min(
      Math.max(Number.parseInt(String(req.query?.limit || '40'), 10) || 40, 1),
      200
    );

    const match = buildSiteAdminTransactionMatch(startDate, endDate);
    if (type) {
      match.type = type;
    }

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(match)
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean(),
      Transaction.countDocuments(match),
    ]);

    const siteConfig = await readSiteConfig();
    const markupFieldByType = Object.fromEntries(
      Object.values(SITE_ADMIN_SERVICE_FIELDS)
        .flatMap((meta) =>
          meta.transactionTypes.map((transactionType) => [
            transactionType,
            meta.markupField,
          ])
        )
    );

    const rows = transactions.map((transaction) => {
      const markupField = markupFieldByType[transaction.type];
      const promoApplied = Boolean(transaction.metadata?.promoCampaignId);
      const silentProfit = Number.isFinite(Number(transaction.metadata?.realizedMargin))
        ? Number(transaction.metadata.realizedMargin)
        : markupField
          ? Number(siteConfig[markupField] || 0)
          : 0;
      const baseService =
        transaction.type === 'P2P'
          ? 'P2P Transfer'
          : transaction.receiverName || transaction.type;

      return {
        id: transaction._id.toString(),
        reference: transaction.reference,
        type: transaction.type,
        service: promoApplied ? `${baseService} • PROMO` : baseService,
        amount: Number(transaction.amount || 0),
        silentProfit,
        senderName: transaction.senderName,
        receiverName: transaction.receiverName,
        note: transaction.note,
        status: transaction.status,
        timestamp: transaction.timestamp,
        promoApplied,
      };
    });

    res.json(
      successResponse(
        {
          totalCount,
          rows,
        },
        'Site admin transactions fetched successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/site-users', async (req, res, next) => {
  try {
    requireSiteAdminToken(req);

    const search = String(req.query?.search || '').trim();
    const limit = Math.min(
      Math.max(Number.parseInt(String(req.query?.limit || '50'), 10) || 50, 1),
      200
    );

    const match = {};
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const digits = search.replace(/\D/g, '');
      match.$or = [
        { fullName: regex },
        { bayrightTag: regex },
        { email: regex },
        ...(digits ? [{ phoneNumber: digits }] : []),
      ];
    }

    const users = await User.find(match)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        'fullName bayrightTag email phoneNumber balance br9GoldPoints createdAt lastLoginAt accountStatus accountStatusReason accountStatusUpdatedAt accountDeletedAt isFrozen freezeReason'
      )
      .lean();

    const userIds = users.map((user) => user._id);
    const spendRows = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          senderId: { $in: userIds },
          type: { $nin: ['Deposit', 'Reward', 'PointConversion'] },
        },
      },
      {
        $group: {
          _id: '$senderId',
          totalSpent: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    const spendMap = new Map(
      spendRows.map((row) => [String(row._id), row])
    );

    res.json(
      successResponse(
        {
          totalCount: users.length,
          rows: users.map((user) => {
            const spend = spendMap.get(String(user._id)) || {};
            return {
              id: user._id.toString(),
              fullName: user.fullName,
              username: user.bayrightTag,
              email: user.email,
              phoneNumber: user.phoneNumber,
              whatsappNumber: user.phoneNumber,
              balance: Number(user.balance || 0),
              br9GoldPoints: Number(user.br9GoldPoints || 0),
              accountStatus: user.accountStatus || (user.isFrozen ? 'under_review' : 'active'),
              accountStatusLabel: getAccountStatusLabel(
                user.accountStatus || (user.isFrozen ? 'under_review' : 'active')
              ),
              accountStatusReason: user.accountStatusReason || user.freezeReason || '',
              accountStatusUpdatedAt:
                user.accountStatusUpdatedAt || user.accountDeletedAt || null,
              isFrozen: Boolean(user.isFrozen),
              signupDate: user.createdAt,
              lastLoginAt: user.lastLoginAt,
              totalSpent: Number(spend.totalSpent || 0),
              totalTransactions: Number(spend.totalTransactions || 0),
            };
          }),
        },
        'Site admin user directory fetched successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/site-credit-user', async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    requireSiteAdminToken(req);

    const userId = String(req.body?.userId || '').trim();
    const identifier = String(req.body?.identifier || '').trim();
    const amount = normaliseAmount(req.body?.amount);
    const reason = String(req.body?.reason || '').trim();

    if ((!userId && !identifier) || !Number.isFinite(amount) || amount <= 0 || !reason) {
      throw new HttpError(
        400,
        'userId or identifier, a positive amount, and a reason are required.'
      );
    }

    let responsePayload;

    await session.withTransaction(async () => {
      const query = userId ? { _id: userId } : buildRecipientQuery(identifier);
      const user = await User.findOne(query).session(session);

      if (!user) {
        throw new HttpError(404, 'User not found for manual credit.');
      }

      user.balance = Number(user.balance || 0) + amount;
      await user.save({ session });

      const [transaction] = await Transaction.create(
        [
          {
            senderId: user._id,
            userId: user._id,
            senderName: 'BR9 Admin',
            receiverName: user.fullName,
            amount,
            type: 'Reward',
            status: 'success',
            timestamp: new Date(),
            reference: createReference('CREDIT'),
            note: reason,
            balanceAfter: user.balance,
            currency: 'NGN',
            metadata: {
              source: 'site-admin-credit',
              reason,
            },
          },
        ],
        { session }
      );

      await UserNotification.create(
        [
          {
            userId: user._id,
            title: 'Wallet Credited',
            body: `Your wallet has been credited with ₦${amount.toLocaleString()} for ${reason}.`,
            type: 'manual-credit',
            status: 'queued',
            metadata: {
              transactionId: transaction._id.toString(),
              reason,
            },
          },
        ],
        { session }
      );

      responsePayload = {
        userId: user._id.toString(),
        username: user.bayrightTag,
        balance: Number(user.balance || 0),
        amount,
        reason,
        transactionId: transaction._id.toString(),
        reference: transaction.reference,
      };
    });

    res.status(201).json(
      successResponse(responsePayload, 'Manual credit applied successfully.')
    );
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

app.post('/api/admin/site-adjust-user-balance', async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    requireSiteAdminToken(req);

    const userId = String(req.body?.userId || '').trim();
    const action = String(req.body?.action || '').trim().toLowerCase();
    const amount = normaliseAmount(req.body?.amount);
    const reason = String(req.body?.reason || '').trim();

    if (!userId || !['debit', 'wipe'].includes(action) || !reason) {
      throw new HttpError(
        400,
        'userId, action (debit or wipe), and reason are required.'
      );
    }

    if (action === 'debit' && (!Number.isFinite(amount) || amount <= 0)) {
      throw new HttpError(400, 'A positive debit amount is required.');
    }

    let responsePayload;

    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new HttpError(404, 'User not found for balance adjustment.');
      }

      const balanceBefore = Number(user.balance || 0);
      const debitAmount = action === 'wipe' ? balanceBefore : amount;

      if (debitAmount <= 0) {
        throw new HttpError(400, 'This user has no wallet balance to adjust.');
      }

      if (debitAmount > balanceBefore) {
        throw new HttpError(
          400,
          'Debit amount cannot exceed the user wallet balance.'
        );
      }

      user.balance = Math.max(balanceBefore - debitAmount, 0);
      await user.save({ session });

      const [transaction] = await Transaction.create(
        [
          {
            senderId: user._id,
            userId: user._id,
            senderName: user.fullName,
            receiverName: 'BR9 Admin',
            amount: debitAmount,
            type: 'AdminAdjustment',
            status: 'success',
            timestamp: new Date(),
            reference: createReference(action === 'wipe' ? 'WIPE' : 'DEBIT'),
            note: reason,
            balanceAfter: user.balance,
            currency: 'NGN',
            metadata: {
              source: 'site-admin-balance-adjustment',
              action,
              balanceBefore,
              balanceAfter: user.balance,
              reason,
            },
          },
        ],
        { session }
      );

      await UserNotification.create(
        [
          {
            userId: user._id,
            title: action === 'wipe' ? 'Wallet Balance Wiped' : 'Wallet Balance Adjusted',
            body:
              action === 'wipe'
                ? `Your BR9ja wallet balance was reset to ₦0. Reason: ${reason}.`
                : `₦${debitAmount.toLocaleString()} was debited from your BR9ja wallet. Reason: ${reason}.`,
            type: 'admin-balance-adjustment',
            status: 'queued',
            metadata: {
              transactionId: transaction._id.toString(),
              action,
              reason,
            },
          },
        ],
        { session }
      );

      await SecurityEvent.create(
        [
          {
            userId: user._id,
            email: user.email,
            bayrightTag: user.bayrightTag,
            eventType: 'admin-balance-adjustment',
            severity: 'high',
            route: req.originalUrl,
            method: req.method,
            ipAddress: req.ip,
            deviceId: req.get('X-Device-ID') || '',
            message: `Admin ${action} adjustment of ₦${debitAmount.toLocaleString()} applied.`,
            metadata: {
              action,
              amount: debitAmount,
              balanceBefore,
              balanceAfter: user.balance,
              reason,
              reference: transaction.reference,
            },
          },
        ],
        { session }
      );

      responsePayload = {
        userId: user._id.toString(),
        username: user.bayrightTag,
        action,
        amount: debitAmount,
        balanceBefore,
        balance: Number(user.balance || 0),
        reason,
        transactionId: transaction._id.toString(),
        reference: transaction.reference,
      };
    });

    res.status(201).json(
      successResponse(responsePayload, 'Balance adjustment applied successfully.')
    );
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

app.patch('/api/admin/site-user-status', async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    requireSiteAdminToken(req);

    const userId = String(req.body?.userId || '').trim();
    const status = normaliseAccountStatus(req.body?.status);
    const reason = String(req.body?.reason || '').trim();

    if (!userId) {
      throw new HttpError(400, 'userId is required.');
    }

    if (status !== 'active' && !reason) {
      throw new HttpError(400, 'A reason is required for account restrictions.');
    }

    let responsePayload;

    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new HttpError(404, 'User not found for status update.');
      }

      const now = new Date();
      const shouldFreeze = status !== 'active';
      user.accountStatus = status;
      user.accountStatusReason = status === 'active' ? '' : reason;
      user.accountStatusUpdatedAt = now;
      user.accountDeletedAt = status === 'deleted' ? now : null;
      user.isFrozen = shouldFreeze;
      user.freezeReason = shouldFreeze ? reason : '';
      user.frozenAt = shouldFreeze ? now : null;
      await user.save({ session });

      await UserNotification.create(
        [
          {
            userId: user._id,
            title: `Account ${getAccountStatusLabel(status)}`,
            body: buildAccountStatusNotificationBody(status, reason),
            type: 'account-status',
            status: 'queued',
            metadata: {
              accountStatus: status,
              reason,
            },
          },
        ],
        { session }
      );

      await SecurityEvent.create(
        [
          {
            userId: user._id,
            email: user.email,
            bayrightTag: user.bayrightTag,
            eventType: 'admin-account-status-change',
            severity: status === 'active' ? 'medium' : 'high',
            route: req.originalUrl,
            method: req.method,
            ipAddress: req.ip,
            deviceId: req.get('X-Device-ID') || '',
            message: `Admin changed account status to ${getAccountStatusLabel(status)}.`,
            metadata: {
              accountStatus: status,
              reason,
            },
          },
        ],
        { session }
      );

      responsePayload = {
        userId: user._id.toString(),
        username: user.bayrightTag,
        accountStatus: status,
        accountStatusLabel: getAccountStatusLabel(status),
        accountStatusReason: user.accountStatusReason,
        accountStatusUpdatedAt: user.accountStatusUpdatedAt,
        isFrozen: user.isFrozen,
      };
    });

    res.json(successResponse(responsePayload, 'Account status updated.'));
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

app.post('/api/auth/send-phone-verification', async (req, res, next) => {
  try {
    const phoneNumber = normalisePhoneNumber(req.body?.phoneNumber);

    if (!phoneNumber) {
      throw new HttpError(400, 'phoneNumber is required.');
    }

    const existingUser = await User.exists({ phoneNumber });
    if (existingUser) {
      throw new HttpError(
        409,
        'That phone number is already linked to an account.'
      );
    }

    const now = new Date();
    const existingVerification = await PhoneVerification.findOne({
      phoneNumber,
    }).select('+codeHash +verificationTokenHash');

    if (
      existingVerification?.lastSentAt &&
      now.getTime() - existingVerification.lastSentAt.getTime() <
        PHONE_VERIFICATION_RESEND_MS
    ) {
      throw new HttpError(
        429,
        'Please wait a moment before requesting another SMS code.'
      );
    }

    const code = generateOtpCode();
    const delivery = await sendVerificationSms({ phoneNumber, code });
    const expiresAt = new Date(now.getTime() + PHONE_VERIFICATION_TTL_MS);

    const record =
      existingVerification ||
      new PhoneVerification({
        phoneNumber,
        codeHash: hashValue(code),
        expiresAt,
      });

    record.codeHash = hashValue(code);
    record.verificationTokenHash = '';
    record.deliveryMode = delivery.deliveryMode;
    record.providerMessageId = delivery.providerMessageId;
    record.attempts = 0;
    record.sendCount = Number(record.sendCount || 0) + 1;
    record.expiresAt = expiresAt;
    record.lastSentAt = now;
    record.verifiedAt = null;
    record.consumedAt = null;
    await record.save();

    res.json(
      successResponse(
        {
          maskedPhoneNumber: maskPhoneNumber(phoneNumber),
          expiresInSeconds: Math.floor(PHONE_VERIFICATION_TTL_MS / 1000),
          resendAvailableInSeconds: Math.floor(
            PHONE_VERIFICATION_RESEND_MS / 1000
          ),
          deliveryMode: delivery.deliveryMode,
          ...(delivery.deliveryMode === 'dev-log' ||
          process.env.NODE_ENV === 'test'
            ? { devCode: code }
            : {}),
        },
        'SMS verification code sent.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/verify-phone-code', async (req, res, next) => {
  try {
    const phoneNumber = normalisePhoneNumber(req.body?.phoneNumber);
    const code = String(req.body?.code || '').trim();

    if (!phoneNumber || !code) {
      throw new HttpError(400, 'phoneNumber and code are required.');
    }

    const record = await PhoneVerification.findOne({ phoneNumber }).select(
      '+codeHash +verificationTokenHash'
    );

    if (!record) {
      throw new HttpError(404, 'No pending phone verification was found.');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new HttpError(410, 'That verification code has expired.');
    }

    if (Number(record.attempts || 0) >= PHONE_VERIFICATION_MAX_ATTEMPTS) {
      throw new HttpError(
        429,
        'Too many incorrect attempts. Request a fresh SMS code.'
      );
    }

    if (record.codeHash !== hashValue(code)) {
      record.attempts = Number(record.attempts || 0) + 1;
      await record.save();
      throw new HttpError(401, 'That verification code is incorrect.');
    }

    const verificationToken = generateVerificationToken();
    record.attempts = 0;
    record.verifiedAt = new Date();
    record.verificationTokenHash = hashValue(verificationToken);
    await record.save();

    res.json(
      successResponse(
        {
          phoneVerificationToken: verificationToken,
          maskedPhoneNumber: maskPhoneNumber(phoneNumber),
          phoneNumber,
        },
        'Phone number verified successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const fullName = String(req.body?.fullName || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '').trim();
    const pin = String(req.body?.pin || '').trim();
    const phoneVerificationToken = String(
      req.body?.phoneVerificationToken || ''
    ).trim();
    const phoneNumber = normalisePhoneNumber(req.body?.phoneNumber);
    const bayrightTag = normaliseBayrightTag(
      req.body?.username || req.body?.bayrightTag
    );
    const deviceId = String(req.body?.deviceId || req.get('X-Device-ID') || '').trim();
    const submittedReferralCode = String(req.body?.referralCode || '')
      .trim()
      .toUpperCase();

    if (
      !fullName ||
      !email ||
      !password ||
      !pin ||
      !phoneNumber ||
      !bayrightTag ||
      !phoneVerificationToken
    ) {
      throw new HttpError(
        400,
        'fullName, email, password, pin, phoneNumber, username, and phoneVerificationToken are required.'
      );
    }

    if (password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters long.');
    }

    if (!/^\d{6}$/.test(pin)) {
      throw new HttpError(400, 'PIN must be exactly 6 digits.');
    }

    const existingIdentity = await User.findOne({
      $or: [{ email }, { phoneNumber }, { bayrightTag }],
    })
      .select('email phoneNumber bayrightTag')
      .lean();

    if (existingIdentity) {
      if (existingIdentity.email === email) {
        throw new HttpError(409, 'That email address is already registered.');
      }

      if (existingIdentity.phoneNumber === phoneNumber) {
        throw new HttpError(409, 'That phone number is already registered.');
      }

      if (existingIdentity.bayrightTag === bayrightTag) {
        throw new HttpError(409, 'That username is already registered.');
      }

      throw new HttpError(409, 'An account with those details already exists.');
    }

    const verificationRecord = await PhoneVerification.findOne({
      phoneNumber,
    }).select('+verificationTokenHash');

    if (
      !verificationRecord ||
      !verificationRecord.verifiedAt ||
      verificationRecord.consumedAt ||
      verificationRecord.expiresAt.getTime() < Date.now()
    ) {
      throw new HttpError(
        400,
        'Verify this phone number by SMS before creating an account.'
      );
    }

    if (
      verificationRecord.verificationTokenHash !==
      hashValue(phoneVerificationToken)
    ) {
      throw new HttpError(
        401,
        'Phone verification token is invalid or has expired.'
      );
    }

    const referredByUser = submittedReferralCode
      ? await User.findOne({ referralCode: submittedReferralCode }).lean()
      : null;

    if (submittedReferralCode && !referredByUser) {
      throw new HttpError(404, 'Referral code not found.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const pinHash = await bcrypt.hash(pin, 12);
    const referralCode = await generateReferralCode(fullName);
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      phoneVerifiedAt: verificationRecord.verifiedAt,
      bayrightTag,
      password: passwordHash,
      passwordHash,
      pinHash,
      accountNumber: buildAccountNumber({ phoneNumber }),
      referralCode,
      referredBy: referredByUser?._id || null,
      activeDeviceId: deviceId,
      lastDeviceChange: deviceId ? new Date() : null,
      lastLoginAt: new Date(),
    });

    verificationRecord.consumedAt = new Date();
    await verificationRecord.save();

    if (referredByUser) {
      await User.updateOne(
        { _id: referredByUser._id },
        { $inc: { br9GoldPoints: REFERRAL_POINTS } }
      );
    }

    const profile = await buildUserProfile(user._id);
    res.status(201).json(
      successResponse(
        {
          accessToken: signAccessToken(user),
          refreshToken: signRefreshToken(user),
          user: profile,
        },
        'Account created successfully.'
      )
    );
  } catch (error) {
    if (error?.code === 11000) {
      return next(
        new HttpError(409, 'An account with those details already exists.')
      );
    }
    return next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const identifier = normaliseLoginIdentifier(
      req.body?.identifier || req.body?.email || req.body?.username
    );
    const password = String(req.body?.password || '').trim();

    if (!identifier || !password) {
      throw new HttpError(400, 'Username or email plus password are required.');
    }

    const loginQuery = buildLoginQuery(identifier);
    const user = await User.findOne(loginQuery).select('+activeDeviceId');
    if (!user) {
      throw new HttpError(401, 'Invalid username, email, or password.');
    }

    if (['suspended', 'deleted'].includes(user.accountStatus || 'active')) {
      throw new HttpError(
        423,
        user.accountStatus === 'deleted'
          ? 'This account has been deleted by BR9ja admin support.'
          : user.accountStatusReason
            ? `Account suspended: ${user.accountStatusReason}`
            : 'Account suspended pending BR9ja admin review.'
      );
    }

    const storedPasswordHash = user.password || user.passwordHash;
    const isMatch = storedPasswordHash
      ? await bcrypt.compare(password, storedPasswordHash)
      : false;
    if (!isMatch) {
      throw new HttpError(401, 'Invalid username, email, or password.');
    }

    const sessionContext = resolveSessionContext(req, user);
    if (
      sessionContext.resolvedDeviceId &&
      user.activeDeviceId !== sessionContext.resolvedDeviceId &&
      !sessionContext.requiresSecureTransfer
    ) {
      user.activeDeviceId = sessionContext.resolvedDeviceId;
      user.lastDeviceChange = new Date();
    }
    user.lastLoginAt = new Date();
    await user.save();

    const profile = await buildUserProfile(user._id);

    res.json(
      successResponse(
        {
          accessToken: signAccessToken(user),
          refreshToken: signRefreshToken(user),
          user: profile,
          sessionTransfer: sessionContext.sessionTransfer,
        },
        'Login successful.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/refresh', async (req, res, next) => {
  try {
    const refreshToken = String(req.body?.refreshToken || '').trim();
    if (!refreshToken) {
      throw new HttpError(401, 'Refresh token is required.');
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (payload.type !== 'refresh') {
      throw new HttpError(401, 'Invalid refresh token.');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new HttpError(401, 'Account not found for this refresh token.');
    }

    const profile = await buildUserProfile(user._id);

    res.json(
      successResponse(
        {
          accessToken: signAccessToken(user),
          refreshToken: signRefreshToken(user),
          user: profile,
        },
        'Session refreshed.'
      )
    );
  } catch (error) {
    next(
      error instanceof HttpError
        ? error
        : new HttpError(401, 'Invalid or expired refresh token.')
    );
  }
});

app.get(
  '/api/user/profile',
  authenticateAccessToken,
  async (req, res, next) => {
    try {
      const profile = await buildUserProfile(req.user._id);
      res.json(
        successResponse(profile, 'Profile fetched successfully.')
      );
    } catch (error) {
      next(error);
    }
  }
);

app.patch(
  '/api/user/passport-photo',
  authenticateAccessToken,
  async (req, res, next) => {
    try {
      const imageDataUrl = String(req.body?.imageDataUrl || '').trim();

      if (!imageDataUrl) {
        throw new HttpError(400, 'imageDataUrl is required.');
      }

      const { normalizedDataUrl } = parseBase64ImageDataUrl(imageDataUrl);
      const now = new Date();

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          passportPhotoDataUrl: normalizedDataUrl,
          passportPhotoUpdatedAt: now,
        },
        { new: true }
      );

      if (!user) {
        throw new HttpError(404, 'User profile not found.');
      }

      res.json(
        successResponse(
          {
            passportPhotoDataUrl: user.passportPhotoDataUrl,
            passportPhotoUpdatedAt: user.passportPhotoUpdatedAt,
          },
          'Passport photo uploaded successfully.'
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  '/api/user/add-gold',
  authenticateAccessToken,
  async (req, res, next) => {
    try {
      const points = Number(req.body?.points || req.body?.goldPoints || 0);
      const reason = String(req.body?.reason || 'cashback').trim();

      if (!Number.isFinite(points) || points <= 0 || points > 5000) {
        throw new HttpError(
          400,
          'A positive BR9 Gold points value up to 5000 is required.'
        );
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { br9GoldPoints: Math.floor(points) } },
        { new: true }
      );

      if (!user) {
        throw new HttpError(404, 'User profile not found.');
      }

      res.json(
        successResponse(
          {
            br9GoldPoints: Number(user.br9GoldPoints || 0),
            awarded: Math.floor(points),
            reason,
          },
          'BR9 Gold awarded successfully.'
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  '/api/auth/verify-user',
  authenticateAccessToken,
  async (req, res, next) => {
    try {
      const identifier = String(req.body?.identifier || '').trim();
      if (!identifier) {
        throw new HttpError(
          400,
          'A Bayright9ja tag, email, or phone number is required for lookup.'
        );
      }

      const foundUser = await User.findOne(buildRecipientQuery(identifier)).lean();
      if (!foundUser) {
        throw new HttpError(404, 'User not found.');
      }

      res.json(
        successResponse(
          {
            id: foundUser._id.toString(),
            fullName: foundUser.fullName,
            bayrightTag: foundUser.bayrightTag,
            phoneNumber: foundUser.phoneNumber,
            email: foundUser.email,
          },
          'User verified successfully.'
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  '/api/transactions/transfer',
  authenticateAccessToken,
  deviceGuard,
  coolingOutflowLimit,
  checkKycLimit,
  requireTransactionPin,
  async (req, res, next) => {
    const amount = normaliseAmount(req.body?.amount);
    const recipientIdentifier = String(req.body?.recipient || '').trim();
    const note = String(req.body?.note || '').trim();

    if (!recipientIdentifier || !Number.isFinite(amount) || amount <= 0) {
      return next(
        new HttpError(
          400,
          'recipient and a valid positive amount are required.'
        )
      );
    }

    const session = await mongoose.startSession();
    let responsePayload;

    try {
      await session.withTransaction(async () => {
        const sender = await User.findById(req.user._id).session(session);
        if (!sender) {
          throw new HttpError(404, 'Sender account not found.');
        }

        const recipient = await User.findOne(buildRecipientQuery(recipientIdentifier)).session(
          session
        );

        if (!recipient) {
          throw new HttpError(404, 'Recipient not found.');
        }

        if (recipient._id.equals(sender._id)) {
          throw new HttpError(400, 'You cannot transfer to yourself.');
        }

        const updatedSender = await User.findOneAndUpdate(
          {
            _id: sender._id,
            balance: { $gte: amount },
          },
          {
            $inc: { balance: -amount },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedSender) {
          throw new HttpError(422, 'Insufficient wallet balance.');
        }

        await recordDailyOutflow(sender._id, amount, session);

        await User.updateOne(
          { _id: recipient._id },
          { $inc: { balance: amount } },
          { session }
        );

        const [transaction] = await Transaction.create(
          [
            {
              senderId: sender._id,
              userId: sender._id,
              receiverId: recipient._id,
              senderName: sender.fullName,
              receiverName: recipient.fullName,
              amount,
              type: 'P2P',
              status: 'success',
              timestamp: new Date(),
              reference: createReference('TRF'),
              note,
              balanceAfter: updatedSender.balance,
              currency: 'NGN',
            },
          ],
          { session }
        );

        await UserNotification.create(
          [
            {
              userId: recipient._id,
              title: 'Buddy Transfer Received',
              body: `You received ₦${amount.toLocaleString()} from ${sender.bayrightTag || sender.fullName}.`,
              type: 'p2p-received',
              status: 'queued',
              metadata: {
                transactionId: transaction._id.toString(),
                senderId: sender._id.toString(),
                senderTag: sender.bayrightTag,
                amount,
              },
            },
          ],
          { session }
        );

        responsePayload = serialiseTransaction(transaction);
      });

      res.status(201).json(
        successResponse(
          responsePayload,
          'Internal transfer processed successfully.'
        )
      );
    } catch (error) {
      next(error);
    } finally {
      await session.endSession();
    }
  }
);

app.get(
  '/api/games/live',
  authenticateAccessToken,
  blockWebGameplay,
  async (_req, res, next) => {
  try {
    const games = await fetchLiveGames();
    res.json(successResponse(games, 'Live games fetched successfully.'));
  } catch (error) {
    next(error);
  }
  }
);

app.get(
  '/api/games/leaderboard',
  authenticateAccessToken,
  blockWebGameplay,
  async (req, res, next) => {
    try {
      const limit = Math.min(Number(req.query?.limit || 10), 50);
      const rows = await getWeeklyLeaderboard(limit);
      res.json(
        successResponse(
          rows.map((user, index) => ({
            rank: index + 1,
            userId: user._id.toString(),
            fullName: user.fullName,
            bayrightTag: user.bayrightTag,
            br9GoldPoints: Number(user.br9GoldPoints || 0),
          })),
          'Leaderboard fetched successfully.'
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  '/api/games/predict',
  authenticateAccessToken,
  blockWebGameplay,
  async (req, res, next) => {
    const matchId = String(req.body?.matchId || '').trim();
    const predictedWinner = String(req.body?.predictedWinner || '').trim();
    const pointsStaked = normaliseAmount(req.body?.pointsStaked || 0);

    if (
      !matchId ||
      !['home', 'draw', 'away'].includes(predictedWinner) ||
      !Number.isFinite(pointsStaked) ||
      pointsStaked < 0
    ) {
      return next(
        new HttpError(
          400,
          'matchId, predictedWinner, and a non-negative pointsStaked value are required.'
        )
      );
    }

    const session = await mongoose.startSession();
    let predictionPayload;
    let remainingGoldPoints = Number(req.user.br9GoldPoints || 0);

    try {
      await session.withTransaction(async () => {
        const existing = await Prediction.findOne({
          userId: req.user._id,
          matchId,
        }).session(session);

        if (existing) {
          throw new HttpError(409, 'You have already predicted this match.');
        }

        if (pointsStaked > 0) {
          const updatedUser = await User.findOneAndUpdate(
            {
              _id: req.user._id,
              br9GoldPoints: { $gte: pointsStaked },
            },
            { $inc: { br9GoldPoints: -pointsStaked } },
            { new: true, session }
          );

          if (!updatedUser) {
            throw new HttpError(422, 'Insufficient BR9 Gold points.');
          }
          remainingGoldPoints = Number(updatedUser.br9GoldPoints || 0);
        }

        const [prediction] = await Prediction.create(
          [
            {
              userId: req.user._id,
              matchId,
              predictedWinner,
              pointsStaked,
              status: 'pending',
              processed: false,
            },
          ],
          { session }
        );

        predictionPayload = {
          id: prediction._id.toString(),
          matchId: prediction.matchId,
          predictedWinner: prediction.predictedWinner,
          pointsStaked: prediction.pointsStaked,
          status: prediction.status,
          processed: prediction.processed,
          remainingGoldPoints,
          createdAt: prediction.createdAt,
        };
      });

      res.status(201).json(
        successResponse(predictionPayload, 'Prediction saved successfully.')
      );
    } catch (error) {
      next(error);
    } finally {
      await session.endSession();
    }
  }
);

app.get('/api/ads/active', authenticateAccessToken, async (_req, res, next) => {
  try {
    const now = new Date();
    const ads = await Ad.find({
      active: true,
      startsAt: { $lte: now },
      $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json(
      successResponse(
        ads.map((ad) => ({
          id: ad._id.toString(),
          title: ad.title,
          image: ad.image,
          targetUrl: ad.targetUrl,
          impressions: ad.impressions,
          clicks: ad.clicks,
        })),
        'Active ads fetched successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
});

app.post(
  '/api/kyc/upload',
  authenticateAccessToken,
  async (req, res, next) => {
    try {
      const idType = String(req.body?.idType || '').trim();
      const idNumber = String(req.body?.idNumber || '').trim();
      const idImageUrl = String(req.body?.idFrontUrl || req.body?.idImageUrl || '').trim();
      const selfieUrl = String(req.body?.selfieUrl || '').trim();

      if (!idType || !idNumber || !idImageUrl || !selfieUrl) {
        throw new HttpError(
          400,
          'Provide idType, idNumber, idImageUrl, and selfieUrl for KYC review.'
        );
      }

      const record = await KycRecord.create({
        userId: req.user._id,
        idType,
        idNumber,
        idImageUrl,
        selfieUrl,
        status: 'Pending',
      });

      res.status(202).json(
        successResponse(
          {
            reviewId: record._id.toString(),
            submittedBy: req.user._id.toString(),
            kycStatus: record.status,
            nextTier: 'Tier 2',
          },
          'KYC documents submitted for review.'
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  '/api/kyc/liveness',
  authenticateAccessToken,
  async (req, res, next) => {
    try {
      const imageBase64 = String(req.body?.imageBase64 || req.body?.image || '').trim();
      const prompt = String(req.body?.prompt || 'blink').trim();

      if (!imageBase64) {
        throw new HttpError(400, 'imageBase64 is required for liveness verification.');
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { isLivenessVerified: true } },
        { new: true }
      );

      res.status(202).json(
        successResponse(
          {
            isLivenessVerified: Boolean(user?.isLivenessVerified),
            prompt,
            provider: process.env.SMILE_ID_PARTNER_ID ? 'smileid' : 'demo',
          },
          'Liveness verification accepted.'
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

app.use('/api/admin', authenticateAccessToken, adminRoutes);
app.use('/api/betting', bettingRoutes);
app.use('/api/gov', governmentRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/trivia', triviaRoutes);
app.use('/api/vending', vendingRoutes);
app.use('/api/utility', utilityRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, _req, res, _next) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      success: false,
      data: null,
      message: error.message,
    });
  }

  if (error?.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      data: null,
      message: error.message || 'Request failed.',
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    data: null,
    message: 'Internal server error.',
  });
});

async function initializeIndexes() {
  await Promise.all([
    PhoneVerification.collection.createIndex(
      { phoneNumber: 1 },
      { unique: true }
    ),
    User.collection.createIndex(
      { referralCode: 1 },
      { unique: true, sparse: true }
    ),
    User.collection.createIndex(
      { virtualAccountNumber: 1 },
      {
        unique: true,
        partialFilterExpression: { virtualAccountNumber: { $gt: '' } },
      }
    ),
    User.collection.createIndex({ virtualAccountReference: 1 }),
    Prediction.collection.createIndex(
      { userId: 1, matchId: 1 },
      { unique: true }
    ),
    Transaction.collection.createIndex({ userId: 1, createdAt: -1 }),
    Transaction.collection.createIndex({ senderId: 1, createdAt: -1 }),
    Transaction.collection.createIndex({ receiverId: 1, createdAt: -1 }),
    SecurityEvent.collection.createIndex({ createdAt: -1 }),
    SecurityEvent.collection.createIndex({ eventType: 1, createdAt: -1 }),
  ]);
}

async function bootstrap() {
  await connectDb();
  await initializeIndexes();
  if (process.env.ENABLE_CRON !== 'false') {
    startPayoutEngine();
    startPayoutProcessor();
  }

  app.listen(PORT, () => {
    console.log(`Bayright9ja backend listening on port ${PORT}`);
  });
}

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error('Failed to start backend', error);
    process.exit(1);
  });
}

module.exports = {
  app,
  bootstrap,
  buildUserProfile,
  createReference,
  generateReferralCode,
  initializeIndexes,
};
