'use strict';

const fs = require('fs/promises');
const path = require('path');

const { PromoCampaign, Transaction } = require('../models');

const SITE_CONFIG_PATH = path.join(
  __dirname,
  '..',
  '..',
  'br9',
  'config',
  'config.json'
);

const DEFAULT_SITE_MARKUPS = {
  serviceWalletMarkup: 0,
  serviceAirtimeMarkup: 50,
  serviceDataMarkup: 50,
  serviceElectricityMarkup: 100,
  serviceCableTvMarkup: 200,
  serviceEducationMarkup: 150,
  serviceTransportMarkup: 100,
  serviceGovernmentMarkup: 150,
  serviceBettingMarkup: 100,
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
};

const PROMO_SERVICE_CONFIG = {
  wallet: { label: 'Wallet & Transfers', markupField: 'serviceWalletMarkup' },
  airtime: { label: 'Airtime', markupField: 'serviceAirtimeMarkup' },
  data: { label: 'Data Bundles', markupField: 'serviceDataMarkup' },
  electricity: { label: 'Electricity', markupField: 'serviceElectricityMarkup' },
  cableTv: { label: 'Cable TV & Internet', markupField: 'serviceCableTvMarkup' },
  education: { label: 'Education Pins', markupField: 'serviceEducationMarkup' },
  transport: { label: 'Transport', markupField: 'serviceTransportMarkup' },
  government: { label: 'Government', markupField: 'serviceGovernmentMarkup' },
  betting: { label: 'Betting', markupField: 'serviceBettingMarkup' },
  marketplace: { label: 'Marketplace', markupField: 'serviceMarketplaceMarkup' },
  virtualCards: { label: 'Virtual Cards', markupField: 'serviceVirtualCardsMarkup' },
  goldSavings: { label: 'BR9 Gold Savings', markupField: 'serviceGoldSavingsMarkup' },
  fiveGData: { label: '5G Data', markupField: 'serviceFiveGDataMarkup' },
  discos: { label: 'Electricity DISCOs', markupField: 'serviceDiscoMarkup' },
  driverLicense: { label: "Driver's License", markupField: 'serviceDriverLicenseMarkup' },
  netflix: { label: 'Netflix', markupField: 'serviceNetflixMarkup' },
  showmax: { label: 'Showmax', markupField: 'serviceShowmaxMarkup' },
  spotify: { label: 'Spotify', markupField: 'serviceSpotifyMarkup' },
  gamingCards: { label: 'Gaming Cards', markupField: 'serviceGamingCardsMarkup' },
  giftCards: { label: 'Gift Cards', markupField: 'serviceGiftCardsMarkup' },
  eventTickets: { label: 'Event Tickets', markupField: 'serviceEventTicketsMarkup' },
};

const PROMO_SERVICE_KEYS = Object.keys(PROMO_SERVICE_CONFIG);
const RECENT_PROMO_WINDOW_MS = 15 * 60 * 1000;
const PROMO_SERVICE_ALIASES = {
  cable: 'cableTv',
  cabletv: 'cableTv',
  tv: 'cableTv',
  internet: 'cableTv',
  virtualcards: 'virtualCards',
  virtual_cards: 'virtualCards',
  goldsavings: 'goldSavings',
  br9goldsavings: 'goldSavings',
  fivegdata: 'fiveGData',
  '5gdata': 'fiveGData',
  disco: 'discos',
  discos: 'discos',
  driverlicense: 'driverLicense',
  driver_license: 'driverLicense',
  gamingcards: 'gamingCards',
  gaming_cards: 'gamingCards',
  giftcards: 'giftCards',
  gift_cards: 'giftCards',
  eventtickets: 'eventTickets',
  event_tickets: 'eventTickets',
};

function normalisePromoServices(targetServices) {
  const values = Array.isArray(targetServices)
    ? targetServices
    : String(targetServices || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

  const normalised = values
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .map((item) => {
      const lowered = item.toLowerCase();
      if (lowered === 'all') {
        return 'all';
      }
      return PROMO_SERVICE_ALIASES[lowered] || lowered;
    })
    .filter((item) => item === 'all' || PROMO_SERVICE_KEYS.includes(item));

  return normalised.includes('all') || !normalised.length
    ? ['all']
    : [...new Set(normalised)];
}

function campaignTargetsService(campaign, serviceKey) {
  const targets = normalisePromoServices(campaign?.targetServices || []);
  if (!serviceKey) {
    return true;
  }
  return targets.includes('all') || targets.includes(serviceKey);
}

async function readPricingConfig() {
  try {
    const raw = await fs.readFile(SITE_CONFIG_PATH, 'utf8');
    return {
      ...DEFAULT_SITE_MARKUPS,
      ...JSON.parse(raw),
    };
  } catch (_error) {
    return { ...DEFAULT_SITE_MARKUPS };
  }
}

async function getServiceMarkup(serviceKey) {
  const config = await readPricingConfig();
  const meta = PROMO_SERVICE_CONFIG[serviceKey];
  if (!meta) {
    return 0;
  }
  return Number(config[meta.markupField] || 0);
}

async function countCampaignUsage(campaignId, userId = null) {
  const match = {
    'metadata.promoCampaignId': String(campaignId),
    status: 'success',
  };

  if (userId) {
    match.senderId = userId;
  }

  return Transaction.countDocuments(match);
}

function calculateCampaignStatus(campaign, usageCount, now = new Date()) {
  const currentTime = now.getTime();
  if (campaign.killedAt) {
    return 'killed';
  }
  if (campaign.endAt.getTime() <= currentTime) {
    return 'finished';
  }
  if (campaign.maxUses > 0 && usageCount >= campaign.maxUses) {
    return 'finished';
  }
  if (campaign.startAt.getTime() > currentTime) {
    return 'upcoming';
  }
  return 'active';
}

function buildDiscountCopy(campaign) {
  if (campaign.discountType === 'percentage') {
    const cap =
      Number(campaign.maxDiscountValue || 0) > 0
        ? ` • up to ₦${Number(campaign.maxDiscountValue).toLocaleString()} savings`
        : '';
    return `${Number(campaign.discountPercent || 0)}% OFF${cap}`;
  }
  return `₦${Number(campaign.discountAmount || 0).toLocaleString()} OFF`;
}

function buildPromoHeadline(campaign, status, usageCount) {
  const targets = normalisePromoServices(campaign.targetServices);
  const targetLabel = targets.includes('all')
    ? 'ALL SERVICES'
    : targets
        .map((target) => PROMO_SERVICE_CONFIG[target]?.label || target)
        .join(', ');

  if (status === 'active') {
    return `FLASH SALE LIVE! ${buildDiscountCopy(campaign)} ${targetLabel}.`;
  }

  if (status === 'upcoming') {
    return `Golden Window queued: ${buildDiscountCopy(campaign)} ${targetLabel}.`;
  }

  if (status === 'finished') {
    const soldOut = campaign.maxUses > 0 && usageCount >= campaign.maxUses;
    return soldOut
      ? 'Flash Sale Ended! All promo spots have been claimed.'
      : 'Flash Sale Ended! Stay tuned for the next Golden Window.';
  }

  return 'Promo manually stopped. Standard pricing is back live.';
}

async function serialisePromoCampaign(campaign, options = {}) {
  if (!campaign) {
    return null;
  }

  const now = options.now || new Date();
  const usageCount =
    options.usageCount ??
    (await countCampaignUsage(campaign._id));
  const status = calculateCampaignStatus(campaign, usageCount, now);
  const spotsRemaining =
    campaign.maxUses > 0
      ? Math.max(Number(campaign.maxUses || 0) - usageCount, 0)
      : null;

  return {
    id: campaign._id.toString(),
    title: campaign.title,
    status,
    discountType: campaign.discountType,
    discountAmount: Number(campaign.discountAmount || 0),
    discountPercent: Number(campaign.discountPercent || 0),
    maxDiscountValue: Number(campaign.maxDiscountValue || 0),
    targetServices: normalisePromoServices(campaign.targetServices),
    startAt: campaign.startAt,
    endAt: campaign.endAt,
    maxUses: Number(campaign.maxUses || 0),
    usageCount,
    spotsRemaining,
    individualUserLimit: Number(campaign.individualUserLimit || 0),
    secondsUntilStart: Math.max(
      Math.floor((campaign.startAt.getTime() - now.getTime()) / 1000),
      0
    ),
    secondsRemaining: Math.max(
      Math.floor((campaign.endAt.getTime() - now.getTime()) / 1000),
      0
    ),
    bannerText: buildPromoHeadline(campaign, status, usageCount),
  };
}

async function syncCampaignStatus(campaign) {
  const summary = await serialisePromoCampaign(campaign);
  if (!summary) {
    return null;
  }

  const updates = {};
  if (campaign.status !== summary.status) {
    updates.status = summary.status;
  }
  if (summary.status === 'finished' && !campaign.endedAt) {
    updates.endedAt = new Date();
  }

  if (Object.keys(updates).length) {
    await PromoCampaign.updateOne({ _id: campaign._id }, { $set: updates });
  }

  return summary;
}

async function getPromoSummaries() {
  const campaigns = await PromoCampaign.find({})
    .sort({ startAt: -1, createdAt: -1 })
    .limit(12)
    .lean();

  const summaries = [];
  for (const campaign of campaigns) {
    const summary = await syncCampaignStatus(campaign);
    if (summary) {
      summaries.push(summary);
    }
  }
  return summaries;
}

async function getPublicPromoSummary(serviceKey = null) {
  const summaries = await getPromoSummaries();
  const now = Date.now();

  const relevant = summaries.filter((campaign) =>
    campaignTargetsService(campaign, serviceKey)
  );

  const active = relevant.find((campaign) => campaign.status === 'active');
  if (active) {
    return active;
  }

  const upcoming = relevant
    .filter((campaign) => campaign.status === 'upcoming')
    .sort((left, right) => new Date(left.startAt) - new Date(right.startAt))[0];
  if (upcoming) {
    return upcoming;
  }

  const recent = relevant.find((campaign) => {
    const endedAt = new Date(campaign.endAt).getTime();
    return ['finished', 'killed'].includes(campaign.status) &&
      now - endedAt <= RECENT_PROMO_WINDOW_MS;
  });

  return recent || null;
}

function calculateDiscountValue(campaign, amount, markup = 0) {
  const safeAmount = Number(amount || 0);
  const safeMarkup = Number(markup || 0);
  const totalBeforeDiscount = safeAmount + safeMarkup;

  let discount = 0;
  if (campaign.discountType === 'percentage') {
    discount = Math.round(safeAmount * (Number(campaign.discountPercent || 0) / 100));
    if (Number(campaign.maxDiscountValue || 0) > 0) {
      discount = Math.min(discount, Number(campaign.maxDiscountValue || 0));
    }
  } else {
    discount = Number(campaign.discountAmount || 0);
  }

  return Math.max(Math.min(discount, totalBeforeDiscount), 0);
}

async function calculateServicePricing({
  serviceKey,
  amount,
  userId = null,
}) {
  const markup = await getServiceMarkup(serviceKey);
  const totalBeforeDiscount = Number(amount || 0) + markup;
  const promo = await getPublicPromoSummary(serviceKey);

  if (!promo || promo.status !== 'active') {
    return {
      serviceKey,
      markup,
      promoDiscount: 0,
      totalBeforeDiscount,
      finalCharge: totalBeforeDiscount,
      promoApplied: false,
      promoCampaignId: '',
      promoSummary: null,
    };
  }

  if (
    userId &&
    Number(promo.individualUserLimit || 0) > 0 &&
    (await countCampaignUsage(promo.id, userId)) >= promo.individualUserLimit
  ) {
    return {
      serviceKey,
      markup,
      promoDiscount: 0,
      totalBeforeDiscount,
      finalCharge: totalBeforeDiscount,
      promoApplied: false,
      promoCampaignId: '',
      promoSummary: promo,
    };
  }

  if (
    Number(promo.maxUses || 0) > 0 &&
    Number(promo.usageCount || 0) >= Number(promo.maxUses || 0)
  ) {
    return {
      serviceKey,
      markup,
      promoDiscount: 0,
      totalBeforeDiscount,
      finalCharge: totalBeforeDiscount,
      promoApplied: false,
      promoCampaignId: '',
      promoSummary: promo,
    };
  }

  const promoDiscount = calculateDiscountValue(promo, amount, markup);

  return {
    serviceKey,
    markup,
    promoDiscount,
    totalBeforeDiscount,
    finalCharge: Math.max(totalBeforeDiscount - promoDiscount, 0),
    promoApplied: promoDiscount > 0,
    promoCampaignId: promo.id,
    promoSummary: promo,
  };
}

function normaliseDateInput(value, fallbackDate) {
  const parsed = new Date(value || fallbackDate);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackDate;
  }
  return parsed;
}

async function savePromoCampaign(payload) {
  const now = new Date();
  const startAt = normaliseDateInput(payload.startAt, now);
  const endAt = normaliseDateInput(
    payload.endAt,
    new Date(startAt.getTime() + 10 * 60 * 1000)
  );

  if (endAt.getTime() <= startAt.getTime()) {
    const error = new Error('End time must be later than start time.');
    error.statusCode = 400;
    throw error;
  }

  const targetServices = normalisePromoServices(payload.targetServices);
  const discountType = payload.discountType === 'percentage' ? 'percentage' : 'flat';
  const title =
    String(payload.title || '').trim() ||
    `${discountType === 'percentage' ? `${payload.discountPercent || 0}%` : `₦${payload.discountAmount || 0}`} Golden Window`;

  if (discountType === 'flat' && Number(payload.discountAmount || 0) <= 0) {
    const error = new Error('Flat promos need a positive discount amount.');
    error.statusCode = 400;
    throw error;
  }

  if (
    discountType === 'percentage' &&
    (Number(payload.discountPercent || 0) <= 0 ||
      Number(payload.discountPercent || 0) > 100)
  ) {
    const error = new Error('Percentage promos need a discount percent between 1 and 100.');
    error.statusCode = 400;
    throw error;
  }

  await PromoCampaign.updateMany(
    {
      status: { $in: ['upcoming', 'active'] },
      killedAt: null,
    },
    {
      $set: {
        status: 'finished',
        endedAt: now,
      },
    }
  );

  const campaign = await PromoCampaign.create({
    title,
    discountType,
    discountAmount: Number(payload.discountAmount || 0),
    discountPercent: Number(payload.discountPercent || 0),
    maxDiscountValue: Number(payload.maxDiscountValue || 0),
    targetServices,
    startAt,
    endAt,
    maxUses: Number(payload.maxUses || 0),
    individualUserLimit: Number(payload.individualUserLimit || 0),
    status: startAt.getTime() > now.getTime() ? 'upcoming' : 'active',
    createdBy: payload.createdBy || null,
  });

  return serialisePromoCampaign(campaign.toObject(), {
    usageCount: 0,
    now,
  });
}

async function killPromoCampaign(campaignId = '') {
  const query = campaignId
    ? { _id: campaignId }
    : { status: { $in: ['upcoming', 'active'] }, killedAt: null };

  const campaign = await PromoCampaign.findOneAndUpdate(
    query,
    {
      $set: {
        status: 'killed',
        killedAt: new Date(),
        endedAt: new Date(),
      },
    },
    { new: true, sort: { startAt: -1 } }
  ).lean();

  if (!campaign) {
    return null;
  }

  return serialisePromoCampaign(campaign);
}

module.exports = {
  PROMO_SERVICE_CONFIG,
  PROMO_SERVICE_KEYS,
  calculateServicePricing,
  getPublicPromoSummary,
  getServiceMarkup,
  killPromoCampaign,
  normalisePromoServices,
  savePromoCampaign,
  serialisePromoCampaign,
};
