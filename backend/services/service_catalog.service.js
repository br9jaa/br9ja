'use strict';

const mongoose = require('mongoose');

const { EDUCATION_PRICES } = require('../config/constants');
const { AdminLog, ServiceCatalog, Transaction } = require('../models');

const USER_SELL_TYPES = new Set([
  'Airtime',
  'Data',
  'Education',
  'Electricity',
  'TV',
  'Internet',
  'Transport',
  'Government',
  'Betting',
]);

const RESELLER_TIERS = new Set(['bronze', 'silver', 'gold']);

const DEFAULT_SERVICE_CATALOG = [
  ...[
    'MTN',
    'Airtel',
    'Glo',
    '9mobile',
  ].map((network) => ({
    serviceKey: 'airtime',
    category: 'Airtime',
    label: `${network} Airtime`,
    serviceName: `${network} Airtime`,
    provider: 'clubkonnect',
    providerCode: 'clubkonnect',
    serviceId: network,
    variationCode: 'VTU',
    pricingMode: 'markup',
    supportsDynamicAmount: true,
    costPrice: 1000,
    sellingPrice: 1050,
    metadata: { network, defaultAmount: 1000 },
  })),
  ...[
    {
      label: 'MTN SME 500MB',
      network: 'MTN',
      variationCode: 'SME500MB',
      costPrice: 500,
      sellingPrice: 550,
      planType: 'SME',
      allowance: '500MB',
    },
    {
      label: 'MTN SME 1.5GB',
      network: 'MTN',
      variationCode: 'SME1500MB',
      costPrice: 1200,
      sellingPrice: 1250,
      planType: 'SME',
      allowance: '1.5GB',
    },
    {
      label: 'MTN SME 5GB',
      network: 'MTN',
      variationCode: 'SME5GB',
      costPrice: 3500,
      sellingPrice: 3600,
      planType: 'SME',
      allowance: '5GB',
    },
    {
      label: 'Airtel Gifting 1GB',
      network: 'Airtel',
      variationCode: 'AIRTEL1GB',
      costPrice: 900,
      sellingPrice: 960,
      planType: 'Gifting',
      allowance: '1GB',
    },
    {
      label: 'Glo Corporate 1GB',
      network: 'Glo',
      variationCode: 'GLO1GB',
      costPrice: 850,
      sellingPrice: 920,
      planType: 'Corporate',
      allowance: '1GB',
    },
    {
      label: '9mobile 1GB',
      network: '9mobile',
      variationCode: '9MOBILE1GB',
      costPrice: 950,
      sellingPrice: 1020,
      planType: 'Corporate',
      allowance: '1GB',
    },
  ].map((plan) => ({
    serviceKey: 'data',
    category: 'Data',
    label: plan.label,
    serviceName: plan.label,
    provider: 'clubkonnect',
    providerCode: 'clubkonnect',
    serviceId: plan.network,
    variationCode: plan.variationCode,
    pricingMode: 'fixed',
    costPrice: plan.costPrice,
    sellingPrice: plan.sellingPrice,
    metadata: {
      network: plan.network,
      planType: plan.planType,
      allowance: plan.allowance,
    },
  })),
  ...[
    { label: 'IKEDC Electricity', disco: 'IKEDC', serviceId: 'ikeja-electric' },
    { label: 'EKEDC Electricity', disco: 'EKEDC', serviceId: 'eko-electric' },
    { label: 'AEDC Electricity', disco: 'AEDC', serviceId: 'abuja-electric' },
    { label: 'KAEDCO Electricity', disco: 'KAEDCO', serviceId: 'kano-electric' },
    {
      label: 'Port Harcourt Electric',
      disco: 'PHED',
      serviceId: 'portharcourt-electric',
    },
    { label: 'Ibadan Electric', disco: 'IBEDC', serviceId: 'ibadan-electric' },
  ].map((disco) => ({
    serviceKey: 'electricity',
    category: 'Electricity',
    label: disco.label,
    serviceName: disco.label,
    provider: 'vtpass',
    providerCode: 'vtpass',
    serviceId: disco.serviceId,
    variationCode: '',
    pricingMode: 'markup',
    supportsDynamicAmount: true,
    costPrice: 1000,
    sellingPrice: 1100,
    metadata: { disco: disco.disco, defaultAmount: 1000 },
  })),
  ...[
    {
      label: 'DSTV Compact',
      category: 'TV',
      provider: 'clubkonnect',
      serviceId: 'dstv',
      variationCode: 'dstv-compact',
      costPrice: 12500,
      sellingPrice: 12750,
      providerName: 'DSTV',
    },
    {
      label: 'GOtv Max',
      category: 'TV',
      provider: 'clubkonnect',
      serviceId: 'gotv',
      variationCode: 'gotv-max',
      costPrice: 8500,
      sellingPrice: 8700,
      providerName: 'GOtv',
    },
    {
      label: 'StarTimes Basic',
      category: 'TV',
      provider: 'clubkonnect',
      serviceId: 'startimes',
      variationCode: 'startimes-basic',
      costPrice: 6000,
      sellingPrice: 6150,
      providerName: 'StarTimes',
    },
    {
      label: 'Smile 30GB',
      category: 'Internet',
      provider: 'vtpass',
      serviceId: 'smile-direct',
      variationCode: 'smile-30gb',
      costPrice: 5000,
      sellingPrice: 5200,
      providerName: 'Smile',
    },
    {
      label: 'Spectranet 20GB',
      category: 'Internet',
      provider: 'vtpass',
      serviceId: 'spectranet',
      variationCode: 'spectranet-20gb',
      costPrice: 7500,
      sellingPrice: 7800,
      providerName: 'Spectranet',
    },
    {
      label: 'Showmax Mobile',
      category: 'TV',
      provider: 'manual',
      serviceId: 'showmax',
      variationCode: 'showmax-mobile',
      costPrice: 3200,
      sellingPrice: 3350,
      providerName: 'Showmax',
      isActive: false,
    },
  ].map((entry) => ({
    serviceKey: 'cableTv',
    category: entry.category,
    label: entry.label,
    serviceName: entry.label,
    provider: entry.provider,
    providerCode: entry.provider,
    serviceId: entry.serviceId,
    variationCode: entry.variationCode,
    pricingMode: 'markup',
    supportsDynamicAmount: true,
    costPrice: entry.costPrice,
    sellingPrice: entry.sellingPrice,
    isActive: entry.isActive !== false,
    metadata: {
      providerName: entry.providerName,
      defaultAmount: entry.costPrice,
    },
  })),
  ...[
    {
      label: 'LCC Toll Top-up',
      serviceId: 'lcc',
      variationCode: 'etag',
      costPrice: 1000,
      sellingPrice: 1100,
      isActive: true,
    },
    {
      label: 'GIGM Bus Booking',
      serviceId: 'gigm',
      variationCode: 'economy',
      costPrice: 15000,
      sellingPrice: 15300,
      isActive: false,
    },
    {
      label: 'ABC Transport Booking',
      serviceId: 'abc',
      variationCode: 'economy',
      costPrice: 12000,
      sellingPrice: 12300,
      isActive: false,
    },
  ].map((entry) => ({
    serviceKey: 'transport',
    category: 'Transport',
    label: entry.label,
    serviceName: entry.label,
    provider: entry.serviceId === 'lcc' ? 'vtpass' : 'manual',
    providerCode: entry.serviceId === 'lcc' ? 'vtpass' : 'manual',
    serviceId: entry.serviceId,
    variationCode: entry.variationCode,
    pricingMode: 'markup',
    supportsDynamicAmount: true,
    costPrice: entry.costPrice,
    sellingPrice: entry.sellingPrice,
    isActive: entry.isActive,
    metadata: { defaultAmount: entry.costPrice },
  })),
  ...[
    {
      label: 'General RRR Payment',
      serviceId: 'rrr',
      variationCode: 'general',
      provider: 'remita',
      costPrice: 2500,
      sellingPrice: 2650,
      isActive: true,
    },
    {
      label: "Driver's License Renewal",
      serviceId: 'drivers-license',
      variationCode: 'renewal',
      provider: 'manual',
      costPrice: 15000,
      sellingPrice: 15250,
      isActive: false,
    },
    {
      label: 'Passport Service Fee',
      serviceId: 'passport',
      variationCode: 'standard',
      provider: 'manual',
      costPrice: 25000,
      sellingPrice: 25250,
      isActive: false,
    },
  ].map((entry) => ({
    serviceKey: 'government',
    category: 'Government',
    label: entry.label,
    serviceName: entry.label,
    provider: entry.provider,
    providerCode: entry.provider,
    serviceId: entry.serviceId,
    variationCode: entry.variationCode,
    pricingMode: 'markup',
    supportsDynamicAmount: true,
    costPrice: entry.costPrice,
    sellingPrice: entry.sellingPrice,
    isActive: entry.isActive,
    metadata: { defaultAmount: entry.costPrice },
  })),
  ...[
    'SportyBet',
    'Bet9ja',
    '1XBet',
    'BetKing',
    'MSport',
    '22Bet',
  ].map((bookmaker) => ({
    serviceKey: 'betting',
    category: 'Betting',
    label: `${bookmaker} Wallet Funding`,
    serviceName: `${bookmaker} Wallet Funding`,
    provider: 'billpay',
    providerCode: 'billpay',
    serviceId: bookmaker.toLowerCase(),
    variationCode: 'wallet',
    pricingMode: 'markup',
    supportsDynamicAmount: true,
    costPrice: 2000,
    sellingPrice: 2100,
    metadata: { defaultAmount: 2000 },
  })),
  ...[
    {
      label: 'Virtual USD Card',
      category: 'Finance',
      provider: 'grey',
      serviceId: 'usd-card',
      variationCode: 'virtual',
      costPrice: 1500,
      sellingPrice: 1750,
      isActive: false,
    },
    {
      label: 'Netflix Subscription',
      category: 'Subscription',
      provider: 'manual',
      serviceId: 'netflix',
      variationCode: 'monthly',
      costPrice: 8000,
      sellingPrice: 8200,
      isActive: false,
    },
    {
      label: 'Spotify Premium',
      category: 'Subscription',
      provider: 'manual',
      serviceId: 'spotify',
      variationCode: 'monthly',
      costPrice: 1600,
      sellingPrice: 1720,
      isActive: false,
    },
    {
      label: 'Gaming Cards Vault',
      category: 'Lifestyle',
      provider: 'manual',
      serviceId: 'gaming-cards',
      variationCode: 'wallet-topup',
      costPrice: 5000,
      sellingPrice: 5300,
      isActive: false,
    },
    {
      label: 'Event Tickets',
      category: 'Lifestyle',
      provider: 'manual',
      serviceId: 'event-ticket',
      variationCode: 'general',
      costPrice: 10000,
      sellingPrice: 10300,
      isActive: false,
    },
  ].map((entry) => ({
    serviceKey: entry.category === 'Finance' ? 'virtualCards' : 'lifestyle',
    category: entry.category,
    label: entry.label,
    serviceName: entry.label,
    provider: entry.provider,
    providerCode: entry.provider,
    serviceId: entry.serviceId,
    variationCode: entry.variationCode,
    pricingMode: 'fixed',
    costPrice: entry.costPrice,
    sellingPrice: entry.sellingPrice,
    isActive: entry.isActive,
  })),
  {
    serviceKey: 'education',
    category: 'Education',
    label: 'WAEC Result Checker',
    serviceName: 'WAEC Result Checker',
    provider: 'vtpass',
    providerCode: 'vtpass',
    serviceId: 'waec',
    variationCode: 'waec',
    pricingMode: 'fixed',
    costPrice: 3650,
    sellingPrice: 3800,
  },
  {
    serviceKey: 'education',
    category: 'Education',
    label: 'WAEC GCE',
    serviceName: 'WAEC GCE',
    provider: 'vtpass',
    providerCode: 'vtpass',
    serviceId: 'waec-gce',
    variationCode: 'waec-gce',
    pricingMode: 'fixed',
    costPrice: Number(EDUCATION_PRICES.WAEC_GCE || 18000) - 500,
    sellingPrice: Number(EDUCATION_PRICES.WAEC_GCE || 18000),
  },
  {
    serviceKey: 'education',
    category: 'Education',
    label: 'JAMB UTME',
    serviceName: 'JAMB UTME',
    provider: 'vtpass',
    providerCode: 'vtpass',
    serviceId: 'jamb',
    variationCode: 'utme',
    pricingMode: 'fixed',
    costPrice: 5640,
    sellingPrice: 5760,
  },
  {
    serviceKey: 'education',
    category: 'Education',
    label: 'JAMB Direct Entry',
    serviceName: 'JAMB Direct Entry',
    provider: 'vtpass',
    providerCode: 'vtpass',
    serviceId: 'jamb',
    variationCode: 'direct-entry',
    pricingMode: 'fixed',
    costPrice: 5640,
    sellingPrice: 5760,
  },
  {
    serviceKey: 'education',
    category: 'Education',
    label: 'NECO Token',
    serviceName: 'NECO Token',
    provider: 'vtpass',
    providerCode: 'vtpass',
    serviceId: 'neco',
    variationCode: 'neco',
    pricingMode: 'fixed',
    costPrice: 1450,
    sellingPrice: 1500,
  },
  {
    serviceKey: 'education',
    category: 'Education',
    label: 'NABTEB',
    serviceName: 'NABTEB',
    provider: 'vtpass',
    providerCode: 'vtpass',
    serviceId: 'nabteb',
    variationCode: 'nabteb',
    pricingMode: 'fixed',
    costPrice: 1450,
    sellingPrice: 1500,
  },
];

function normaliseKey(value) {
  return String(value || '').trim();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function computeServiceHealth(costPrice, sellingPrice) {
  const cost = toNumber(costPrice, 0);
  const selling = toNumber(sellingPrice, 0);
  const profitMargin = selling - cost;
  const marginRate = cost > 0 ? profitMargin / cost : 0;
  const profitShieldBlocked = selling <= cost || (cost > 0 && marginRate < 0.02);
  const warningLevel =
    selling <= cost
      ? 'danger'
      : profitMargin < 10 || marginRate < 0.02
        ? 'warning'
        : 'healthy';

  return {
    profitMargin,
    marginRate,
    profitShieldBlocked,
    warningLevel,
  };
}

function normaliseResellerTier(value) {
  const tier = String(value || '').trim().toLowerCase();
  return RESELLER_TIERS.has(tier) ? tier : 'bronze';
}

function normaliseMarkupValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function resolveResellerMarkupAmount({
  baseCost,
  defaultMarkup = 0,
  tierMarkup = null,
  usePercentageMarkup = false,
}) {
  const markupSource =
    tierMarkup !== null && tierMarkup !== undefined ? tierMarkup : defaultMarkup;
  const safeMarkup = normaliseMarkupValue(markupSource, 0);

  if (usePercentageMarkup) {
    return Math.max(Math.round((Number(baseCost || 0) * safeMarkup) / 100), 1);
  }

  return Math.max(safeMarkup, 1);
}

function serialiseServiceCatalogRow(row, baseAmount = null) {
  const document =
    typeof row?.toObject === 'function' ? row.toObject({ virtuals: true }) : row || {};
  const costPrice = toNumber(document.costPrice, 0);
  const sellingPrice = toNumber(document.sellingPrice, 0);
  const defaultAmount = toNumber(document.metadata?.defaultAmount, costPrice);
  const pricingMode = document.pricingMode || (document.supportsDynamicAmount ? 'markup' : 'fixed');
  const effectiveBaseAmount =
    pricingMode === 'markup' && Number.isFinite(Number(baseAmount)) && Number(baseAmount) > 0
      ? Number(baseAmount)
      : defaultAmount;
  const flatMargin = Math.max(sellingPrice - costPrice, 0);
  const effectiveCostPrice =
    pricingMode === 'markup' && effectiveBaseAmount > 0 ? effectiveBaseAmount : costPrice;
  const effectiveSellingPrice =
    pricingMode === 'markup' && effectiveBaseAmount > 0
      ? effectiveBaseAmount + flatMargin
      : sellingPrice;
  const health = computeServiceHealth(effectiveCostPrice, effectiveSellingPrice);
  const resellerTierMarkups = {
    bronze: normaliseMarkupValue(document.resellerTierMarkups?.bronze, 7),
    silver: normaliseMarkupValue(document.resellerTierMarkups?.silver, 5),
    gold: normaliseMarkupValue(document.resellerTierMarkups?.gold, 3),
  };
  const usePercentageMarkup = Boolean(document.usePercentageMarkup);
  const resellerPriceMarkup = normaliseMarkupValue(document.resellerPriceMarkup, 5);
  const resellerPreview = Object.fromEntries(
    ['bronze', 'silver', 'gold'].map((tier) => {
      const markupApplied = resolveResellerMarkupAmount({
        baseCost: effectiveCostPrice,
        defaultMarkup: resellerPriceMarkup,
        tierMarkup: resellerTierMarkups[tier],
        usePercentageMarkup,
      });
      return [
        tier,
        {
          markupApplied,
          wholesalePrice: Math.max(effectiveCostPrice + markupApplied, effectiveCostPrice + 1),
        },
      ];
    })
  );

  return {
    id: String(document._id || ''),
    serviceKey: document.serviceKey,
    category: document.category,
    serviceName: document.serviceName || document.label,
    label: document.label || document.serviceName,
    provider: document.provider,
    providerCode: document.providerCode || document.provider,
    serviceId: document.serviceId,
    variationCode: document.variationCode || '',
    supportsDynamicAmount: Boolean(document.supportsDynamicAmount),
    pricingMode,
    costPrice,
    sellingPrice,
    effectiveCostPrice,
    effectiveSellingPrice,
    flatMargin,
    resellerPriceMarkup,
    usePercentageMarkup,
    resellerTierMarkups,
    resellerPreview,
    isActive: document.isActive !== false && document.status !== 'paused',
    status: document.status,
    currency: document.currency || 'NGN',
    metadata: document.metadata || {},
    updatedAt: document.updatedAt,
    createdAt: document.createdAt,
    ...health,
    purchaseEnabled:
      document.isActive !== false && document.status !== 'paused' && !health.profitShieldBlocked,
  };
}

function resolveRoleAwareCatalogPrice({ record, user = null, amount = 0 }) {
  const safeRecord = record || {};
  const baseCost = Number(
    safeRecord.effectiveCostPrice || safeRecord.costPrice || amount || 0
  );
  const defaultSellingPrice = Number(
    safeRecord.effectiveSellingPrice || safeRecord.sellingPrice || baseCost
  );
  const role = String(user?.role || 'user').trim().toLowerCase();
  const resellerTier = normaliseResellerTier(user?.resellerTier || 'bronze');

  if (role !== 'reseller') {
    return {
      role,
      resellerTier,
      markupApplied: Math.max(defaultSellingPrice - baseCost, 0),
      sellingPrice: defaultSellingPrice,
      costPrice: baseCost,
      adminNetProfit: Math.max(defaultSellingPrice - baseCost, 0),
      standardRetailPrice: defaultSellingPrice,
      resellerSavings: 0,
      wholesaleLabel: 'Retail',
    };
  }

  const tierMarkup = safeRecord.resellerTierMarkups?.[resellerTier];
  const markupApplied = resolveResellerMarkupAmount({
    baseCost,
    defaultMarkup: safeRecord.resellerPriceMarkup,
    tierMarkup,
    usePercentageMarkup: safeRecord.usePercentageMarkup,
  });
  const sellingPrice = Math.max(baseCost + markupApplied, baseCost + 1);

  return {
    role,
    resellerTier,
    markupApplied,
    sellingPrice,
    costPrice: baseCost,
    adminNetProfit: markupApplied,
    standardRetailPrice: defaultSellingPrice,
    resellerSavings: Math.max(defaultSellingPrice - sellingPrice, 0),
    wholesaleLabel: `${formatTierLabel(resellerTier)} Wholesale`,
  };
}

function formatTierLabel(tier) {
  return String(tier || '')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

async function ensureDefaultServiceCatalog() {
  await Promise.all(
    DEFAULT_SERVICE_CATALOG.map((entry) =>
      ServiceCatalog.findOneAndUpdate(
        {
          serviceKey: entry.serviceKey,
          provider: entry.provider,
          serviceId: entry.serviceId,
          variationCode: entry.variationCode || '',
        },
        {
          $setOnInsert: {
            ...entry,
            serviceName: entry.serviceName || entry.label,
            providerCode: entry.providerCode || entry.provider,
            isActive: entry.isActive !== false,
            status: entry.isActive === false ? 'paused' : 'live',
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      )
    )
  );
}

function buildServiceCatalogMatch(filters = {}) {
  const match = {};
  if (!filters.serviceKey) {
    match.serviceKey = { $ne: 'marketplace' };
  }
  if (filters.serviceKey) {
    match.serviceKey = normaliseKey(filters.serviceKey);
  }
  if (filters.category) {
    match.category = new RegExp(`^${String(filters.category).trim()}$`, 'i');
  }
  if (filters.provider) {
    match.provider = normaliseKey(filters.provider).toLowerCase();
  }
  if (filters.providerCode) {
    match.providerCode = normaliseKey(filters.providerCode).toLowerCase();
  }
  if (filters.activeOnly) {
    match.isActive = true;
    match.status = { $ne: 'paused' };
  }
  if (filters.search) {
    const pattern = String(filters.search).trim();
    match.$or = [
      { label: new RegExp(pattern, 'i') },
      { serviceName: new RegExp(pattern, 'i') },
      { serviceId: new RegExp(pattern, 'i') },
      { variationCode: new RegExp(pattern, 'i') },
      { provider: new RegExp(pattern, 'i') },
      { providerCode: new RegExp(pattern, 'i') },
      { category: new RegExp(pattern, 'i') },
      { 'metadata.network': new RegExp(pattern, 'i') },
      { 'metadata.planType': new RegExp(pattern, 'i') },
      { 'metadata.allowance': new RegExp(pattern, 'i') },
      { 'metadata.disco': new RegExp(pattern, 'i') },
    ];
  }
  return match;
}

async function listServiceCatalog(filters = {}) {
  const rows = await ServiceCatalog.find(buildServiceCatalogMatch(filters))
    .sort({ category: 1, serviceKey: 1, label: 1 })
    .lean({ virtuals: true });

  const baseAmount = Number(filters.baseAmount || 0);
  return rows.map((row) =>
    serialiseServiceCatalogRow(row, baseAmount > 0 ? baseAmount : null)
  );
}

async function getServiceCatalogEntry({
  serviceKey,
  provider = '',
  serviceId = '',
  variationCode = '',
}) {
  const match = {
    serviceKey: normaliseKey(serviceKey),
    provider: normaliseKey(provider),
    serviceId: normaliseKey(serviceId),
  };

  if (variationCode !== undefined) {
    match.variationCode = normaliseKey(variationCode);
  }

  return ServiceCatalog.findOne(match);
}

async function resolveServicePricingRecord({
  serviceKey,
  provider = '',
  serviceId = '',
  variationCode = '',
  amount = 0,
  fallbackCostPrice = 0,
  fallbackSellingPrice = 0,
  label = '',
  category = '',
  metadata = {},
  supportsDynamicAmount = false,
  pricingMode = supportsDynamicAmount ? 'markup' : 'fixed',
}) {
  const existing =
    (await getServiceCatalogEntry({
      serviceKey,
      provider,
      serviceId,
      variationCode,
    })) ||
    (variationCode
      ? await getServiceCatalogEntry({
          serviceKey,
          provider,
          serviceId,
          variationCode: '',
        })
      : null);

  let document = existing;
  if (!document) {
    document = await ServiceCatalog.findOneAndUpdate(
      {
        serviceKey: normaliseKey(serviceKey),
        provider: normaliseKey(provider),
        serviceId: normaliseKey(serviceId),
        variationCode: normaliseKey(variationCode),
      },
      {
        $setOnInsert: {
          serviceKey: normaliseKey(serviceKey),
          category: category || normaliseKey(serviceKey),
          label: label || normaliseKey(serviceId) || normaliseKey(serviceKey),
          serviceName: label || normaliseKey(serviceId) || normaliseKey(serviceKey),
          provider: normaliseKey(provider),
          providerCode: normaliseKey(provider),
          serviceId: normaliseKey(serviceId),
          variationCode: normaliseKey(variationCode),
          supportsDynamicAmount,
          pricingMode,
          costPrice: fallbackCostPrice,
          sellingPrice: fallbackSellingPrice,
          isActive: true,
          status: 'live',
          metadata,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  const row = serialiseServiceCatalogRow(document, amount);
  return {
    costPrice: row.effectiveCostPrice || fallbackCostPrice,
    sellingPrice: row.effectiveSellingPrice || fallbackSellingPrice,
    profit: row.profitMargin,
    record: row,
  };
}

async function getServiceCatalogOverview() {
  const [rows, revenueAgg, costAgg, profitAgg] = await Promise.all([
    ServiceCatalog.find({}).lean({ virtuals: true }),
    Transaction.aggregate([
      { $match: { status: 'success', type: { $in: [...USER_SELL_TYPES] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { status: 'success', type: { $in: [...USER_SELL_TYPES] } } },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ['$metadata.costPrice', '$metadata.vendorAmount'],
            },
          },
        },
      },
    ]),
    Transaction.aggregate([
      { $match: { status: 'success', type: { $in: [...USER_SELL_TYPES] } } },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ['$metadata.profit', '$metadata.realizedMargin'],
            },
          },
        },
      },
    ]),
  ]);

  const serialised = rows.map((row) => serialiseServiceCatalogRow(row));
  return {
    totalCount: serialised.length,
    activeCount: serialised.filter((row) => row.isActive).length,
    flaggedCount: serialised.filter((row) => row.warningLevel !== 'healthy').length,
    totalRevenue: Number(revenueAgg[0]?.total || 0),
    totalCost: Number(costAgg[0]?.total || 0),
    netProfit: Number(profitAgg[0]?.total || 0),
  };
}

async function updateServiceCatalogRow(id, payload = {}, actorLabel = 'Site Admin') {
  const row = await ServiceCatalog.findById(id);
  if (!row) {
    const error = new Error('Catalog row not found.');
    error.statusCode = 404;
    throw error;
  }

  if (payload.costPrice !== undefined) {
    row.costPrice = toNumber(payload.costPrice, row.costPrice);
  }
  if (payload.sellingPrice !== undefined) {
    row.sellingPrice = toNumber(payload.sellingPrice, row.sellingPrice);
  }
  if (payload.isActive !== undefined) {
    row.isActive = Boolean(payload.isActive);
    row.status = row.isActive ? 'live' : 'paused';
  }
  if (payload.resellerPriceMarkup !== undefined) {
    row.resellerPriceMarkup = normaliseMarkupValue(
      payload.resellerPriceMarkup,
      row.resellerPriceMarkup
    );
  }
  if (payload.usePercentageMarkup !== undefined) {
    row.usePercentageMarkup = Boolean(payload.usePercentageMarkup);
  }
  if (payload.resellerTierMarkups && typeof payload.resellerTierMarkups === 'object') {
    row.resellerTierMarkups = {
      bronze: normaliseMarkupValue(
        payload.resellerTierMarkups.bronze,
        row.resellerTierMarkups?.bronze
      ),
      silver: normaliseMarkupValue(
        payload.resellerTierMarkups.silver,
        row.resellerTierMarkups?.silver
      ),
      gold: normaliseMarkupValue(
        payload.resellerTierMarkups.gold,
        row.resellerTierMarkups?.gold
      ),
    };
  }

  if (row.sellingPrice < row.costPrice + 1) {
    const error = new Error('Selling price must stay at least ₦1 above cost price.');
    error.statusCode = 422;
    throw error;
  }

  const resellerPreviews = serialiseServiceCatalogRow(row).resellerPreview || {};
  const unsafeResellerTier = Object.entries(resellerPreviews).find(
    ([, preview]) => Number(preview.wholesalePrice || 0) < Number(row.costPrice || 0) + 1
  );
  if (unsafeResellerTier) {
    const error = new Error(
      `${formatTierLabel(unsafeResellerTier[0])} reseller price must stay at least ₦1 above cost price.`
    );
    error.statusCode = 422;
    throw error;
  }

  await row.save();

  await AdminLog.create({
    actionType: 'service_catalog_update',
    actorLabel,
    message: `${actorLabel} updated ${row.serviceName || row.label}.`,
      metadata: {
        serviceCatalogId: row._id.toString(),
        costPrice: row.costPrice,
        sellingPrice: row.sellingPrice,
        resellerPriceMarkup: row.resellerPriceMarkup,
        usePercentageMarkup: row.usePercentageMarkup,
        resellerTierMarkups: row.resellerTierMarkups,
        isActive: row.isActive,
      },
    });

  return serialiseServiceCatalogRow(row);
}

async function bulkUpdateServiceCatalog(
  {
    productIds = [],
    actionType = 'flat',
    value = 0,
  },
  actorLabel = 'Site Admin'
) {
  const ids = [...new Set(productIds.map((item) => String(item).trim()).filter(Boolean))];
  if (!ids.length) {
    const error = new Error('Select at least one service.');
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const rows = await ServiceCatalog.find({ _id: { $in: ids } }).session(session);
      if (rows.length !== ids.length) {
        const error = new Error('One or more selected services no longer exist.');
        error.statusCode = 404;
        throw error;
      }

      const numericValue = Number(value);
      const preview = rows.map((row) => {
        const currentCost = Number(row.costPrice || 0);
        const currentSelling = Number(row.sellingPrice || 0);
        let nextSelling = currentSelling;

        if (actionType === 'percentage') {
          nextSelling = Math.round(currentCost * (1 + numericValue / 100));
        } else if (actionType === 'flat') {
          nextSelling = Math.round(currentSelling + numericValue);
        } else if (actionType === 'fixed_margin') {
          nextSelling = Math.round(currentCost + numericValue);
        } else {
          const error = new Error('Unsupported bulk update action.');
          error.statusCode = 400;
          throw error;
        }

        if (nextSelling < currentCost + 1) {
          const error = new Error(
            `Bulk update would set ${row.serviceName || row.label} below the safety floor.`
          );
          error.statusCode = 422;
          throw error;
        }

        row.sellingPrice = nextSelling;
        return {
          id: row._id.toString(),
          serviceName: row.serviceName || row.label,
          currentSelling,
          nextSelling,
          currentCost,
        };
      });

      await Promise.all(rows.map((row) => row.save({ session })));

      await AdminLog.create(
        [
          {
            actionType: 'service_catalog_bulk_update',
            actorLabel,
            message: `${actorLabel} applied a ${actionType} pricing change to ${rows.length} services.`,
            metadata: {
              actionType,
              value: numericValue,
              affectedCount: rows.length,
              productIds: ids,
            },
          },
        ],
        { session }
      );

      const avgBefore =
        preview.reduce((sum, row) => sum + Math.max(row.currentSelling - row.currentCost, 0), 0) /
        preview.length;
      const avgAfter =
        preview.reduce((sum, row) => sum + Math.max(row.nextSelling - row.currentCost, 0), 0) /
        preview.length;

      result = {
        affectedCount: rows.length,
        rows: preview,
        updatedRows: rows.map((row) => serialiseServiceCatalogRow(row)),
        averageProfitBefore: Number(avgBefore || 0),
        averageProfitAfter: Number(avgAfter || 0),
        averageProfitChangePercent:
          avgBefore > 0 ? Number((((avgAfter - avgBefore) / avgBefore) * 100).toFixed(2)) : 0,
      };
    });
  } finally {
    await session.endSession();
  }

  return result;
}

async function listAdminLogs(limit = 10, actionType = '') {
  const match = actionType ? { actionType } : {};
  const rows = await AdminLog.find(match)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return rows.map((row) => ({
    id: row._id.toString(),
    actionType: row.actionType,
    actorLabel: row.actorLabel,
    message: row.message,
    metadata: row.metadata || {},
    createdAt: row.createdAt,
  }));
}

module.exports = {
  DEFAULT_SERVICE_CATALOG,
  buildServiceCatalogMatch,
  bulkUpdateServiceCatalog,
  computeServiceHealth,
  ensureDefaultServiceCatalog,
  formatTierLabel,
  getServiceCatalogEntry,
  getServiceCatalogOverview,
  listAdminLogs,
  listServiceCatalog,
  resolveRoleAwareCatalogPrice,
  resolveServicePricingRecord,
  serialiseServiceCatalogRow,
  updateServiceCatalogRow,
};
