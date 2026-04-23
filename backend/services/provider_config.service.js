'use strict';

const { AppSetting } = require('../models');

const PROVIDER_CONFIG_KEY = 'providerConfig';

const DEFAULT_PROVIDER_CONFIG = {
  funding: {
    primaryProvider: 'squad',
    backupProvider: 'monnify',
    zeroFeeBalance: true,
    providerFeeBps: 10,
    defaultBankLabel: 'GTBank',
  },
  endpoints: {
    peyflexBaseUrl: process.env.PEYFLEX_BASE_URL || '',
    vtpassBaseUrl: process.env.VTPASS_BASE_URL || 'https://vtpass.com/api',
    squadBaseUrl:
      process.env.SQUAD_BASE_URL || 'https://sandbox-api-d.squadco.com',
    monnifyBaseUrl:
      process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com',
    remitaBaseUrl: process.env.REMITA_BASE_URL || '',
    billPayBaseUrl:
      process.env.BILLPAY_BASE_URL || process.env.MONNIFY_BASE_URL || '',
    flutterwaveBaseUrl: process.env.FLUTTERWAVE_BASE_URL || '',
  },
  services: {
    airtime: {
      primaryProvider: 'peyflex',
      backupProvider: 'vtpass',
      failoverEnabled: true,
    },
    data: {
      primaryProvider: 'peyflex',
      backupProvider: 'vtpass',
      failoverEnabled: true,
    },
    electricity: {
      primaryProvider: 'peyflex',
      backupProvider: 'vtpass',
      failoverEnabled: true,
    },
    cableTv: {
      primaryProvider: 'peyflex',
      backupProvider: 'vtpass',
      failoverEnabled: true,
    },
    education: {
      primaryProvider: 'peyflex',
      backupProvider: 'vtpass',
      failoverEnabled: true,
    },
    transport: {
      primaryProvider: 'vtpass',
      backupProvider: 'demo',
      failoverEnabled: true,
    },
    government: {
      primaryProvider: 'remita',
      backupProvider: 'demo',
      failoverEnabled: true,
    },
    betting: {
      primaryProvider: 'billpay',
      backupProvider: 'demo',
      failoverEnabled: true,
    },
    marketplace: {
      primaryProvider: 'demo',
      backupProvider: 'demo',
      failoverEnabled: false,
    },
  },
};

const SUPPORTED_PROVIDER_NAMES = new Set([
  'peyflex',
  'vtpass',
  'squad',
  'monnify',
  'remita',
  'billpay',
  'flutterwave',
  'demo',
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeDeep(base, override) {
  if (!isPlainObject(base)) {
    return override;
  }

  const output = { ...base };
  if (!isPlainObject(override)) {
    return output;
  }

  Object.entries(override).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(base[key])) {
      output[key] = mergeDeep(base[key], value);
      return;
    }
    output[key] = value;
  });

  return output;
}

function normaliseProvider(value, fallback) {
  const normalised = String(value || '')
    .trim()
    .toLowerCase();
  return SUPPORTED_PROVIDER_NAMES.has(normalised) ? normalised : fallback;
}

function normaliseBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
  }
  return fallback;
}

function normaliseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function normaliseUrl(value, fallback = '') {
  const raw = String(value || '').trim();
  return raw || fallback;
}

function sanitiseProviderConfig(payload = {}) {
  const merged = mergeDeep(DEFAULT_PROVIDER_CONFIG, payload);

  const next = {
    funding: {
      primaryProvider: normaliseProvider(
        merged.funding?.primaryProvider,
        DEFAULT_PROVIDER_CONFIG.funding.primaryProvider
      ),
      backupProvider: normaliseProvider(
        merged.funding?.backupProvider,
        DEFAULT_PROVIDER_CONFIG.funding.backupProvider
      ),
      zeroFeeBalance: normaliseBoolean(
        merged.funding?.zeroFeeBalance,
        DEFAULT_PROVIDER_CONFIG.funding.zeroFeeBalance
      ),
      providerFeeBps: normaliseInteger(
        merged.funding?.providerFeeBps,
        DEFAULT_PROVIDER_CONFIG.funding.providerFeeBps
      ),
      defaultBankLabel:
        String(merged.funding?.defaultBankLabel || '').trim() ||
        DEFAULT_PROVIDER_CONFIG.funding.defaultBankLabel,
    },
    endpoints: {},
    services: {},
  };

  Object.entries(DEFAULT_PROVIDER_CONFIG.endpoints).forEach(
    ([key, fallbackValue]) => {
      next.endpoints[key] = normaliseUrl(merged.endpoints?.[key], fallbackValue);
    }
  );

  Object.entries(DEFAULT_PROVIDER_CONFIG.services).forEach(([key, defaults]) => {
    const current = merged.services?.[key] || {};
    next.services[key] = {
      primaryProvider: normaliseProvider(
        current.primaryProvider,
        defaults.primaryProvider
      ),
      backupProvider: normaliseProvider(
        current.backupProvider,
        defaults.backupProvider
      ),
      failoverEnabled: normaliseBoolean(
        current.failoverEnabled,
        defaults.failoverEnabled
      ),
    };
  });

  return next;
}

async function getProviderConfig() {
  const stored = await AppSetting.findOne({ key: PROVIDER_CONFIG_KEY }).lean();
  return sanitiseProviderConfig(stored?.value || {});
}

async function saveProviderConfig(payload, updatedBy = null) {
  const nextConfig = sanitiseProviderConfig(payload);
  await AppSetting.findOneAndUpdate(
    { key: PROVIDER_CONFIG_KEY },
    {
      $set: {
        value: nextConfig,
        updatedBy,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
  return nextConfig;
}

function getServiceProviderRoute(config, serviceKey) {
  const defaults = DEFAULT_PROVIDER_CONFIG.services[serviceKey] || {
    primaryProvider: 'demo',
    backupProvider: 'demo',
    failoverEnabled: false,
  };
  return {
    ...defaults,
    ...(config.services?.[serviceKey] || {}),
  };
}

module.exports = {
  DEFAULT_PROVIDER_CONFIG,
  PROVIDER_CONFIG_KEY,
  SUPPORTED_PROVIDER_NAMES,
  getProviderConfig,
  getServiceProviderRoute,
  mergeDeep,
  saveProviderConfig,
  sanitiseProviderConfig,
};
