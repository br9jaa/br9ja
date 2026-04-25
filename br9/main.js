const DEFAULT_CONFIG = {
  brandName: 'BR9ja',
  companyName: 'BayRight9ja Ltd',
  slogan: 'Play for BR9 Gold, Pay Your Bills and Win',
  siteUrl: 'https://br9.ng',
  apiBaseUrl: '',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.bayright9ja.bayright9ja_mobile',
  appStoreUrl: 'https://apps.apple.com/app/id0000000000',
  platformMode: 'live',
  maintenanceMode: false,
  maintenanceNotice: 'All core services are available for wallet-led growth this week.',
  opsEmail: 'ops@br9.ng',
  supportEmail: 'support@br9.ng',
  adminAlertPhone: '',
  whatsappNumber: '2340000000000',
  whatsappPrefill: 'Hi i need help with',
  socialTikTokUrl: 'https://www.tiktok.com/@br9ja',
  socialInstagramUrl: 'https://www.instagram.com/br9ja/',
  socialXUrl: 'https://x.com/br9ja',
  socialYouTubeUrl: 'https://www.youtube.com/@BR9ja',
  socialFacebookUrl: 'https://www.facebook.com/br9ja',
  officeLocation: 'Lagos, Nigeria',
  mondayBenchmarkGold: 1000,
  mondayBenchmarkNaira: 100,
  maxAutoFundLimit: 20000,
  goldToWalletMinimumSuccessfulTransactions: 5,
  resellerActivationFee: 2500,
  partnerBankName: 'BR9 Partner Bank',
  partnerBankSignupUrl: 'https://br9.ng',
  partnerBankReferralCode: 'BR9BANK',
  partnerBankReferralLink: 'https://br9.ng/signup?ref=BR9BANK',
  partnerBankNote:
    'Complete your first clean funding to turn this into your active earnings route.',
  partnerBankSettlementBankName: 'GTBank',
  partnerBankSettlementAccountName: 'BayRight9ja Ltd',
  partnerBankSettlementAccountNumber: '',
  gapsCorporateName: 'BayRight9ja Ltd',
  gapsBankName: 'GTBank',
  gapsAccountNumber: '',
  gapsReferenceNote: 'Use this account for manual provider top-ups until GAPS is automated.',
  payoutRequirements: '10 ads + 1 service transaction',
  payoutProcessorMode: 'automatic',
  liveRewardPool: '50 BR9 Gold for the first 500 valid Sunday live winners',
  serviceWalletStatus: 'live',
  serviceWalletNote: 'Internal transfers, balance sync, and payout visibility stay active.',
  serviceWalletMarkup: 0,
  serviceAirtimeStatus: 'live',
  serviceAirtimeNote: 'Instant recharge across MTN, Airtel, Glo, and 9mobile.',
  serviceAirtimeMarkup: 50,
  serviceDataStatus: 'live',
  serviceDataNote: 'Fast bundle vending with wallet-first checkout.',
  serviceDataMarkup: 50,
  serviceElectricityStatus: 'live',
  serviceElectricityNote: 'Meter verification and token delivery stay enabled.',
  serviceElectricityMarkup: 100,
  serviceCableTvStatus: 'live',
  serviceCableTvNote: 'DSTV, GOtv, StarTimes, and internet subscription flows are available.',
  serviceCableTvMarkup: 200,
  serviceEducationStatus: 'live',
  serviceEducationNote: 'WAEC, JAMB, NECO, NABTEB, and exam-pin vending stay visible and guided.',
  serviceEducationMarkup: 150,
  serviceTransportStatus: 'soft-launch',
  serviceTransportNote: 'LCC top-up and interstate booking intake remain supervised.',
  serviceTransportMarkup: 100,
  serviceGovernmentStatus: 'soft-launch',
  serviceGovernmentNote: 'RRR-driven payments stay on guarded rollout.',
  serviceGovernmentMarkup: 150,
  serviceBettingStatus: 'soft-launch',
  serviceBettingNote: 'Funding flows remain ID-checked before completion.',
  serviceBettingMarkup: 100,
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
  quickLoginModes: '6-digit PIN, Face ID, fingerprint, device PIN, and pattern',
};

const HEADER_NAV_ITEMS = [
  ['home', 'Home', 'index.html'],
  ['services', 'Services', 'services.html'],
  ['about', 'About', 'about.html'],
  ['contact', 'Contact', 'contact.html'],
];

const SOCIAL_ITEMS = [
  ['socialTikTokUrl', 'TikTok', 'tiktok'],
  ['socialInstagramUrl', 'Instagram', 'instagram'],
  ['socialXUrl', 'X', 'x'],
  ['socialYouTubeUrl', 'YouTube', 'youtube'],
  ['socialFacebookUrl', 'Facebook', 'facebook'],
];

const ADMIN_NAV_ITEMS = [
  ['dashboard', 'Dashboard', 'lex/auth/index.html', '📊'],
  ['vault', 'The Vault', 'lex/auth/transactions.html', '🏦'],
  ['approvals', 'Pending Approvals', 'lex/auth/approvals.html', '🛡️'],
  ['directory', 'Directory', 'lex/auth/users.html', '👥'],
  ['profit', 'Profit Matrix', 'lex/auth/services.html', '⚙️'],
  ['providers', 'Provider Pulse', 'lex/auth/providers.html', '🛰️'],
  ['promos', 'Golden Window', 'lex/auth/promos.html', '✨'],
  ['trivia', 'Trivia', 'lex/auth/trivia.html', '🧠'],
  ['bank', 'Partner Bank', 'lex/auth/partner-bank.html', '🏛️'],
  ['settings', 'App Settings', 'lex/auth/settings/index.html', '📱'],
];

const PROVIDER_CONFIG_KEY = 'br9.providerConfig';

const DEFAULT_PROVIDER_CONFIG = {
  funding: {
    primaryProvider: 'squad',
    backupProvider: 'demo',
    zeroFeeBalance: true,
    providerFeeBps: 10,
    defaultBankLabel: 'GTBank',
  },
  endpoints: {
    clubkonnectBaseUrl: 'https://www.clubkonnect.com',
    peyflexBaseUrl: '',
    vtpassBaseUrl: 'https://sandbox.vtpass.com/api',
    squadBaseUrl: 'https://sandbox-api-d.squadco.com',
    remitaBaseUrl: '',
    billPayBaseUrl: '',
    flutterwaveBaseUrl: '',
  },
  services: {
    airtime: {
      primaryProvider: 'clubkonnect',
      backupProvider: 'demo',
      failoverEnabled: true,
    },
    data: {
      primaryProvider: 'clubkonnect',
      backupProvider: 'demo',
      failoverEnabled: true,
    },
    electricity: {
      primaryProvider: 'vtpass',
      backupProvider: 'clubkonnect',
      failoverEnabled: true,
    },
    cableTv: {
      primaryProvider: 'clubkonnect',
      backupProvider: 'demo',
      failoverEnabled: true,
    },
    education: {
      primaryProvider: 'vtpass',
      backupProvider: 'peyflex',
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
  },
};

const PROVIDER_ROUTE_FIELDS = [
  ['airtime', 'Airtime'],
  ['data', 'Data Bundles'],
  ['electricity', 'Electricity'],
  ['cableTv', 'Cable TV & Internet'],
  ['education', 'Education Pins'],
  ['transport', 'Transport'],
  ['government', 'Government / RRR'],
  ['betting', 'Betting Wallet Funding'],
];

const SERVICE_MATRIX = [
  {
    key: 'wallet',
    label: 'Wallet & Transfers',
    markupField: 'serviceWalletMarkup',
    statusField: 'serviceWalletStatus',
    noteField: 'serviceWalletNote',
  },
  {
    key: 'airtime',
    label: 'Airtime',
    markupField: 'serviceAirtimeMarkup',
    statusField: 'serviceAirtimeStatus',
    noteField: 'serviceAirtimeNote',
  },
  {
    key: 'data',
    label: 'Data Bundles',
    markupField: 'serviceDataMarkup',
    statusField: 'serviceDataStatus',
    noteField: 'serviceDataNote',
  },
  {
    key: 'electricity',
    label: 'Electricity',
    markupField: 'serviceElectricityMarkup',
    statusField: 'serviceElectricityStatus',
    noteField: 'serviceElectricityNote',
  },
  {
    key: 'cableTv',
    label: 'Cable TV & Internet',
    markupField: 'serviceCableTvMarkup',
    statusField: 'serviceCableTvStatus',
    noteField: 'serviceCableTvNote',
  },
  {
    key: 'education',
    label: 'Education Pins',
    markupField: 'serviceEducationMarkup',
    statusField: 'serviceEducationStatus',
    noteField: 'serviceEducationNote',
  },
  {
    key: 'transport',
    label: 'Transport',
    markupField: 'serviceTransportMarkup',
    statusField: 'serviceTransportStatus',
    noteField: 'serviceTransportNote',
  },
  {
    key: 'government',
    label: 'Government',
    markupField: 'serviceGovernmentMarkup',
    statusField: 'serviceGovernmentStatus',
    noteField: 'serviceGovernmentNote',
  },
  {
    key: 'betting',
    label: 'Betting',
    markupField: 'serviceBettingMarkup',
    statusField: 'serviceBettingStatus',
    noteField: 'serviceBettingNote',
  },
];

const PUBLIC_SERVICE_MARKUPS = {
  airtime: 'serviceAirtimeMarkup',
  data: 'serviceDataMarkup',
  electricity: 'serviceElectricityMarkup',
  cableTv: 'serviceCableTvMarkup',
  education: 'serviceEducationMarkup',
  transport: 'serviceTransportMarkup',
  government: 'serviceGovernmentMarkup',
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

const PROMO_SERVICE_LABELS = {
  all: 'all services',
  wallet: 'Wallet & Transfers',
  airtime: 'Airtime',
  data: 'Data Bundles',
  electricity: 'Electricity',
  cableTv: 'Cable TV & Internet',
  education: 'Education Pins',
  transport: 'Transport',
  government: 'Government',
  betting: 'Betting',
  virtualCards: 'Virtual Cards',
  goldSavings: 'BR9 Gold Savings',
  fiveGData: '5G Data',
  discos: 'Electricity DISCOs',
  driverLicense: "Driver's License",
  netflix: 'Netflix',
  showmax: 'Showmax',
  spotify: 'Spotify',
  gamingCards: 'Gaming Cards',
  giftCards: 'Gift Cards',
  eventTickets: 'Event Tickets',
};

const PROFIT_CATEGORY_MATRIX = [
  { label: 'Finance', keys: ['wallet'] },
  { label: 'Utilities', keys: ['airtime', 'data', 'electricity', 'cableTv'] },
  { label: 'Gov & Edu', keys: ['education', 'transport', 'government'] },
  { label: 'Lifestyle', keys: ['betting'] },
];

const ADMIN_CONFIG_FIELDS = [
  'siteUrl',
  'playStoreUrl',
  'appStoreUrl',
  'platformMode',
  'maintenanceMode',
  'maintenanceNotice',
  'opsEmail',
  'supportEmail',
  'adminAlertPhone',
  'whatsappNumber',
  'whatsappPrefill',
  'socialTikTokUrl',
  'socialInstagramUrl',
  'socialXUrl',
  'socialYouTubeUrl',
  'socialFacebookUrl',
  'serviceWalletStatus',
  'serviceWalletNote',
  'serviceWalletMarkup',
  'serviceAirtimeStatus',
  'serviceAirtimeNote',
  'serviceAirtimeMarkup',
  'serviceDataStatus',
  'serviceDataNote',
  'serviceDataMarkup',
  'serviceElectricityStatus',
  'serviceElectricityNote',
  'serviceElectricityMarkup',
  'serviceCableTvStatus',
  'serviceCableTvNote',
  'serviceCableTvMarkup',
  'serviceEducationStatus',
  'serviceEducationNote',
  'serviceEducationMarkup',
  'serviceTransportStatus',
  'serviceTransportNote',
  'serviceTransportMarkup',
  'serviceGovernmentStatus',
  'serviceGovernmentNote',
  'serviceGovernmentMarkup',
  'serviceBettingStatus',
  'serviceBettingNote',
  'serviceBettingMarkup',
  ...SUPER_APP_MARKUP_FIELDS,
  'marketRunnerStatus',
  'triviaRushStatus',
  'sundayLiveStatus',
  'gameAccessMode',
  'mondayBenchmarkGold',
  'mondayBenchmarkNaira',
  'maxAutoFundLimit',
  'goldToWalletMinimumSuccessfulTransactions',
  'resellerActivationFee',
  'partnerBankName',
  'partnerBankSignupUrl',
  'partnerBankReferralCode',
  'partnerBankReferralLink',
  'partnerBankNote',
  'partnerBankSettlementBankName',
  'partnerBankSettlementAccountName',
  'partnerBankSettlementAccountNumber',
  'gapsCorporateName',
  'gapsBankName',
  'gapsAccountNumber',
  'gapsReferenceNote',
  'payoutRequirements',
  'liveRewardPool',
  'payoutProcessorMode',
  'phoneVerificationRequired',
  'passportPhotoRequired',
  'quickLoginModes',
];

const SERVICE_STATUS_FIELDS = SERVICE_MATRIX.map((item) => item.statusField);

const ACTIVE_SERVICE_STATUSES = new Set(['live', 'featured', 'soft-launch']);
const NUMERIC_CONFIG_FIELDS = new Set([
  'mondayBenchmarkGold',
  'mondayBenchmarkNaira',
  'maxAutoFundLimit',
  'goldToWalletMinimumSuccessfulTransactions',
  'resellerActivationFee',
  ...SERVICE_MATRIX.map((item) => item.markupField),
  ...SUPER_APP_MARKUP_FIELDS,
]);

const PUBLIC_WHATSAPP_PAGES = new Set([
  'home',
  'services',
  'about',
  'contact',
  'terms',
  'privacy',
  'login',
  'signup',
]);

const THEME_KEY = 'br9.theme';
const CONFIG_KEY = 'br9.siteConfig';
const ADMIN_TOKEN_KEY = 'br9.adminToken';
const ADMIN_IDENTIFIER_KEY = 'br9.adminIdentifier';
const AUTH_SESSION_KEY = 'br9.authenticated';
const AUTH_USER_KEY = 'br9.auth.user';
const AUTH_ACCESS_TOKEN_KEY = 'br9.auth.accessToken';
const AUTH_REFRESH_TOKEN_KEY = 'br9.auth.refreshToken';
const LOGIN_SNAPSHOT_KEY = 'br9.auth.loginSnapshot';
const PREVIEW_USERS_KEY = 'br9.previewUsers';
const REMEMBERED_IDENTITY_KEY = 'br9.auth.identity';
const PASSWORD_RESET_KEY = 'br9.auth.reset';
const PHONE_VERIFY_KEY = 'br9.auth.phoneVerify';
const EMAIL_VERIFY_KEY = 'br9.auth.emailVerify';
const API_BASE_URL_STORAGE_KEY = 'br9.apiBaseUrl';
const REFERRAL_CODE_KEY = 'br9.referralCode';
const BR9_GOLD_CONVERSION_RATE = 10;
const BR9_GOLD_UNLOCK_DAYS = 30;
let currentPromoSummary = null;
let promoTicker = null;

function getBasePath() {
  return document.body.dataset.base || '.';
}

function getPageName() {
  return document.body.dataset.page || 'home';
}

function getNigeriaDateParts(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(date).reduce((accumulator, part) => {
      accumulator[part.type] = part.value;
      return accumulator;
    }, {});
    return {
      weekday: String(parts.weekday || '').toLowerCase(),
      hour: Number(parts.hour || 0),
      minute: Number(parts.minute || 0),
    };
  } catch (_error) {
    const fallback = new Date(date);
    return {
      weekday: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
        fallback.getDay()
      ],
      hour: fallback.getHours(),
      minute: fallback.getMinutes(),
    };
  }
}

function getCurrentGameMode(date = new Date()) {
  const { weekday } = getNigeriaDateParts(date);

  if (weekday === 'monday' || weekday === 'friday') {
    return {
      key: 'market_runner',
      label: 'Market Runner',
      badge: 'Monday / Friday',
      headline: 'Market Runner is live.',
      description:
        'Sprint through the BR9ja lane, dodge obstacles, and stack your game rewards while the service bonus watches your daily utility flow.',
      primaryActionLabel: 'Open Game',
      showAdMultiplier: false,
    };
  }

  if (['tuesday', 'wednesday', 'thursday'].includes(weekday)) {
    return {
      key: 'trivia_rush',
      label: 'Trivia Rush',
      badge: 'Tuesday / Thursday',
      headline: 'Trivia Rush is live.',
      description:
        'Jump into the weekly quiz lane, answer fast, and keep your BR9 Gold position healthy before the Sunday push.',
      primaryActionLabel: 'Open Trivia',
      showAdMultiplier: false,
    };
  }

  if (weekday === 'saturday') {
    return {
      key: 'ad_multiplier',
      label: 'Market Runner + Ad Boost',
      badge: 'Saturday Boost',
      headline: 'Saturday ad multiplier is live.',
      description:
        'Today is the boost window. Watch the approved ad flow, lift your position points, and come back for the Sunday jackpot split.',
      primaryActionLabel: 'Open Game',
      showAdMultiplier: true,
    };
  }

  return {
    key: 'sunday_jackpot',
    label: 'Sunday Jackpot',
    badge: 'Sunday 10PM',
    headline: 'Sunday jackpot cycle is running.',
    description:
      'Top players share the verified jackpot tonight. Keep your account funded, your name lock clean, and your service count above the weekly threshold.',
    primaryActionLabel: 'View Jackpot',
    showAdMultiplier: false,
  };
}

function isEmbeddedAdminView() {
  try {
    return new URLSearchParams(window.location.search).get('embedded') === '1';
  } catch (_error) {
    return false;
  }
}

function buildLexAuthRouteFromLocation() {
  const pathname = String(window.location.pathname || '');
  if (!pathname || pathname.includes('/lex/auth/')) {
    return '';
  }

  if (window.location.protocol === 'file:') {
    if (pathname.includes('/br9/admin/')) {
      return pathname.replace('/br9/admin/', '/br9/lex/auth/');
    }
    if (/\/br9\/admin(?:\/)?$/.test(pathname)) {
      return pathname.replace(/\/br9\/admin(?:\/)?$/, '/br9/lex/auth/index.html');
    }
    return '';
  }

  if (pathname.includes('/admin/')) {
    return pathname.replace('/admin/', '/lex/auth/');
  }

  if (/\/admin(?:\/)?$/.test(pathname)) {
    return pathname.replace(/\/admin(?:\/)?$/, '/lex/auth/index.html');
  }

  return '';
}

function maybeRedirectLegacyAdminRoute() {
  if (!document.body.dataset.adminRoom || isEmbeddedAdminView()) {
    return false;
  }

  const nextPath = buildLexAuthRouteFromLocation();
  if (!nextPath || nextPath === window.location.pathname) {
    return false;
  }

  const nextUrl =
    window.location.protocol === 'file:'
      ? `${nextPath}${window.location.search}${window.location.hash}`
      : `${window.location.origin}${nextPath}${window.location.search}${window.location.hash}`;

  window.location.replace(nextUrl);
  return true;
}

function shouldExposeWhatsApp() {
  const page = getPageName();
  const authenticated =
    document.body.dataset.authenticated === 'true' || getStoredAuthState();
  return PUBLIC_WHATSAPP_PAGES.has(page) && !authenticated;
}

function getStoredConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null');
  } catch (_error) {
    return null;
  }
}

function getStoredTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  return storedTheme === 'light' ? 'light' : 'dark';
}

function getStoredAdminToken() {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch (_error) {
    return '';
  }
}

function getStoredAdminIdentifier() {
  try {
    return sessionStorage.getItem(ADMIN_IDENTIFIER_KEY) || '';
  } catch (_error) {
    return '';
  }
}

function getStoredAuthState() {
  try {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  } catch (_error) {
    return false;
  }
}

function setStoredAuthState(isAuthenticated) {
  try {
    if (!isAuthenticated) {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      document.body.dataset.authenticated = 'false';
      return;
    }
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    document.body.dataset.authenticated = 'true';
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
}

function setStoredAdminToken(token) {
  try {
    if (!token) {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      return;
    }
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
}

function setStoredAdminIdentifier(identifier) {
  try {
    if (!identifier) {
      sessionStorage.removeItem(ADMIN_IDENTIFIER_KEY);
      return;
    }
    sessionStorage.setItem(ADMIN_IDENTIFIER_KEY, identifier);
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
}

function getStoredReferralCode() {
  try {
    return String(localStorage.getItem(REFERRAL_CODE_KEY) || '').trim().toUpperCase();
  } catch (_error) {
    return '';
  }
}

function setStoredReferralCode(code) {
  try {
    const nextCode = String(code || '').trim().toUpperCase();
    if (!nextCode) {
      localStorage.removeItem(REFERRAL_CODE_KEY);
      return;
    }
    localStorage.setItem(REFERRAL_CODE_KEY, nextCode);
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
}

function readReferralCodeFromLocation() {
  try {
    const params = new URLSearchParams(window.location.search);
    const code =
      params.get('ref') ||
      params.get('referral') ||
      params.get('referralCode') ||
      params.get('invite');
    return String(code || '').trim().toUpperCase();
  } catch (_error) {
    return '';
  }
}

function captureReferralCodeFromLocation() {
  const code = readReferralCodeFromLocation();
  if (code) {
    setStoredReferralCode(code);
  }
  return code || getStoredReferralCode();
}

function getStoredAccessToken() {
  try {
    return sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY) || '';
  } catch (_error) {
    return '';
  }
}

function getStoredRefreshToken() {
  try {
    return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) || '';
  } catch (_error) {
    return '';
  }
}

function setStoredAuthTokens(accessToken, refreshToken) {
  try {
    if (accessToken) {
      sessionStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
    } else {
      sessionStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    }

    if (refreshToken) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    }
  } catch (_error) {
    // Ignore storage failures.
  }
}

function normalisePhoneInput(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length >= 13) {
    digits = `0${digits.slice(3)}`;
  }
  if (digits.length === 10) {
    digits = `0${digits}`;
  }
  return digits.slice(0, 11);
}

function normaliseEmailInput(value) {
  return String(value || '').trim().toLowerCase();
}

function normaliseUsernameInput(value) {
  return String(value || '')
    .trim()
    .replace(/^@+/g, '')
    .toLowerCase();
}

function normaliseIdentityInput(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  if (VALIDATORS.email(raw)) {
    return normaliseEmailInput(raw);
  }

  const phone = normalisePhoneInput(raw);
  if (phone.length >= 10) {
    return phone;
  }

  return normaliseUsernameInput(raw);
}

function getStoredPreviewUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PREVIEW_USERS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function setStoredPreviewUsers(users) {
  localStorage.setItem(PREVIEW_USERS_KEY, JSON.stringify(users));
}

function getStoredAuthUser() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(AUTH_USER_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function getStoredLoginSnapshot() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOGIN_SNAPSHOT_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function rememberIdentity(identity) {
  try {
    if (!identity) {
      localStorage.removeItem(REMEMBERED_IDENTITY_KEY);
      return;
    }
    localStorage.setItem(REMEMBERED_IDENTITY_KEY, String(identity).trim());
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
}

function getRememberedIdentity() {
  try {
    return localStorage.getItem(REMEMBERED_IDENTITY_KEY) || '';
  } catch (_error) {
    return '';
  }
}

function setStoredLoginSnapshot(user) {
  try {
    if (!user) {
      return;
    }

    const safeUser = serialiseAuthUser(user);
    localStorage.setItem(
      LOGIN_SNAPSHOT_KEY,
      JSON.stringify({
        id: safeUser.id || '',
        firstName: safeUser.firstName || '',
        fullName: safeUser.fullName || '',
        username: safeUser.username || '',
        email: safeUser.email || '',
        phoneNumber: safeUser.phoneNumber || '',
        firstLoginCompleted: Boolean(safeUser.firstLoginCompleted || safeUser.lastLoginAt),
        lastLoginAt: safeUser.lastLoginAt || null,
      })
    );
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
}

function getReturningLoginUser() {
  const storedAuthUser = getStoredAuthUser();
  if (storedAuthUser && (storedAuthUser.firstLoginCompleted || storedAuthUser.lastLoginAt)) {
    return serialiseAuthUser(storedAuthUser);
  }

  const rememberedIdentity = getRememberedIdentity();
  const previewUser = rememberedIdentity ? findPreviewUserByIdentity(rememberedIdentity) : null;
  if (previewUser && previewUser.firstLoginCompleted) {
    return serialiseAuthUser(previewUser);
  }

  const snapshot = getStoredLoginSnapshot();
  if (snapshot && (snapshot.firstLoginCompleted || snapshot.lastLoginAt)) {
    return serialiseAuthUser(snapshot);
  }

  return null;
}

function getReturningLoginName(user) {
  if (!user) {
    return 'BR9JA USER';
  }

  const base =
    user.firstName ||
    splitFullName(user.fullName || '').firstName ||
    user.username ||
    String(user.email || '').split('@')[0] ||
    'BR9ja User';
  return String(base || 'BR9ja User').trim().toUpperCase();
}

function getReturningLoginInitial(user) {
  const name = getReturningLoginName(user);
  return String(name || 'B').trim().charAt(0) || 'B';
}

function getPreviewGoldUnlockDate(createdAt) {
  const base = createdAt ? new Date(createdAt) : new Date();
  const unlockDate = new Date(base.getTime());
  unlockDate.setDate(unlockDate.getDate() + BR9_GOLD_UNLOCK_DAYS);
  return unlockDate.toISOString();
}

function calculateGoldDaysRemaining(unlockDate) {
  const unlockAt = new Date(unlockDate || Date.now()).getTime();
  const now = Date.now();
  if (unlockAt <= now) {
    return 0;
  }
  return Math.ceil((unlockAt - now) / (24 * 60 * 60 * 1000));
}

function formatRewardDate(value) {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildRewardStepMessage(points, unlockDate, nextStepMessage) {
  const rewardPoints = Number(points || 0);
  const unlockLabel = formatRewardDate(unlockDate);
  const rewardCopy =
    rewardPoints > 0
      ? `+${rewardPoints} BR9 Gold is now locked${unlockLabel ? ` until ${unlockLabel}` : ''}.`
      : '';

  return [nextStepMessage, rewardCopy].filter(Boolean).join(' ');
}

function normaliseApiBaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  return raw.replace(/\/$/, '');
}

function getStoredApiBaseUrl() {
  try {
    return normaliseApiBaseUrl(localStorage.getItem(API_BASE_URL_STORAGE_KEY) || '');
  } catch (_error) {
    return '';
  }
}

function setStoredApiBaseUrl(value) {
  try {
    const normalised = normaliseApiBaseUrl(value);
    if (!normalised) {
      localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
      return '';
    }

    localStorage.setItem(API_BASE_URL_STORAGE_KEY, normalised);
    return normalised;
  } catch (_error) {
    return '';
  }
}

function buildPreviewGoldSnapshot(user) {
  const unlockDate = user.goldUnlockDate || getPreviewGoldUnlockDate(user.createdAt);
  const lockedBalance = Number(user.br9GoldLockedBalance || 0);
  const spendableBalance = Number(user.br9GoldBalance || 0);
  const daysRemaining = calculateGoldDaysRemaining(unlockDate);
  const locked = lockedBalance > 0 && daysRemaining > 0;
  const totalBalance = spendableBalance + lockedBalance;
  const sampleAmount = 1000;
  const maxDiscount = Math.floor(sampleAmount * 0.05 * 100) / 100;
  const availableDiscount = Math.min(
    totalBalance / BR9_GOLD_CONVERSION_RATE,
    maxDiscount
  );

  return {
    unlockDate,
    lockedBalance,
    spendableBalance,
    totalBalance,
    locked,
    daysRemaining,
    nairaValue: totalBalance / BR9_GOLD_CONVERSION_RATE,
    spendableNairaValue: spendableBalance / BR9_GOLD_CONVERSION_RATE,
    previewDiscount: {
      sampleAmount,
      discountAmount: availableDiscount,
      payAmount: Math.max(sampleAmount - availableDiscount, 0),
    },
  };
}

function serialiseAuthUser(user) {
  if (!user) {
    return null;
  }

  const fullName = String(user.fullName || '').trim();
  const nameParts = splitFullName(fullName);
  const rawUsername = String(user.username || user.bayrightTag || '').trim();
  const previewGold = buildPreviewGoldSnapshot(user);

  return {
    id: user.id,
    firstName: user.firstName || nameParts.firstName,
    lastName: user.lastName || nameParts.lastName,
    fullName,
    username: rawUsername.replace(/^@/, ''),
    bayrightTag: rawUsername.startsWith('@') ? rawUsername : rawUsername ? `@${rawUsername}` : '',
    email: user.email,
    phoneNumber: user.phoneNumber,
    emailVerified: Boolean(user.emailVerified),
    emailVerifiedAt: user.emailVerifiedAt || null,
    phoneVerified: Boolean(user.phoneVerified),
    phoneVerifiedAt: user.phoneVerifiedAt || null,
    isVerified: Boolean(user.isVerified),
    verifiedAt: user.verifiedAt || null,
    fullNameLocked: Boolean(user.fullNameLocked || user.isNameLocked),
    isNameLocked: Boolean(user.isNameLocked || user.fullNameLocked),
    walletBalance: Number(user.walletBalance || 0),
    br9GoldBalance:
      user.br9GoldBalance !== undefined
        ? Number(user.br9GoldBalance || 0)
        : previewGold.spendableBalance,
    br9GoldLockedBalance:
      user.br9GoldLockedBalance !== undefined
        ? Number(user.br9GoldLockedBalance || 0)
        : previewGold.lockedBalance,
    br9GoldTotal:
      user.br9GoldTotal !== undefined
        ? Number(user.br9GoldTotal || 0)
        : previewGold.totalBalance,
    br9GoldLocked:
      user.br9GoldLocked !== undefined
        ? Boolean(user.br9GoldLocked)
        : previewGold.locked,
    goldUnlockDate: user.goldUnlockDate || previewGold.unlockDate,
    goldDaysRemaining:
      user.goldDaysRemaining !== undefined
        ? Number(user.goldDaysRemaining || 0)
        : previewGold.daysRemaining,
    br9GoldNairaValue:
      user.br9GoldNairaValue !== undefined
        ? Number(user.br9GoldNairaValue || 0)
        : previewGold.nairaValue,
    br9GoldPreviewDiscount:
      user.br9GoldPreviewDiscount || previewGold.previewDiscount,
    referralCode: String(user.referralCode || '').trim().toUpperCase(),
    referralLink: String(user.referralLink || '').trim(),
    restrictedMode: Boolean(user.restrictedMode),
    canUseServices: user.canUseServices !== false,
    canPurchaseServices:
      user.canPurchaseServices !== undefined
        ? Boolean(user.canPurchaseServices)
        : Boolean(user.isVerified),
    virtualAccount: user.virtualAccount || null,
    role: user.role || 'user',
    resellerTier: user.resellerTier || 'bronze',
    resellerActivationFee: Number(user.resellerActivationFee || 2500),
    resellerSavingsMonthToDate: Number(user.resellerSavingsMonthToDate || 0),
    partnerInviteMessage: String(user.partnerInviteMessage || '').trim(),
    successfulTransactionCount: Number(user.successfulTransactionCount || 0),
    partnerBank:
      user.partnerBank && typeof user.partnerBank === 'object'
        ? {
            name: String(user.partnerBank.name || '').trim(),
            signupUrl: String(user.partnerBank.signupUrl || '').trim(),
            referralCode: String(user.partnerBank.referralCode || '').trim(),
            referralLink: String(user.partnerBank.referralLink || '').trim(),
            note: String(user.partnerBank.note || '').trim(),
            settlementBankName: String(user.partnerBank.settlementBankName || '').trim(),
            settlementAccountName: String(user.partnerBank.settlementAccountName || '').trim(),
            settlementAccountNumber: String(user.partnerBank.settlementAccountNumber || '').trim(),
          }
        : null,
    transactions: Array.isArray(user.transactions) ? user.transactions : [],
    maintenanceMode: Boolean(user.maintenanceMode),
    firstLoginCompleted: Boolean(user.firstLoginCompleted),
    lastLoginAt: user.lastLoginAt || null,
  };
}

function setStoredAuthUser(user) {
  try {
    if (!user) {
      sessionStorage.removeItem(AUTH_USER_KEY);
      setStoredAuthState(false);
      return;
    }

    const safeUser = serialiseAuthUser(user);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    setStoredAuthState(true);
    rememberIdentity(safeUser.email || safeUser.username || safeUser.phoneNumber || '');
    setStoredLoginSnapshot(safeUser);
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
}

function clearStoredAuthUser() {
  try {
    sessionStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
  setStoredAuthState(false);
}

function getStoredResetChallenge() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PASSWORD_RESET_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function setStoredResetChallenge(challenge) {
  try {
    if (!challenge) {
      localStorage.removeItem(PASSWORD_RESET_KEY);
      return;
    }
    localStorage.setItem(PASSWORD_RESET_KEY, JSON.stringify(challenge));
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
}

function getStoredPhoneVerificationChallenge() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PHONE_VERIFY_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function setStoredPhoneVerificationChallenge(challenge) {
  try {
    if (!challenge) {
      localStorage.removeItem(PHONE_VERIFY_KEY);
      return;
    }
    localStorage.setItem(PHONE_VERIFY_KEY, JSON.stringify(challenge));
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
}

function getStoredEmailVerificationChallenge() {
  try {
    const parsed = JSON.parse(localStorage.getItem(EMAIL_VERIFY_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function setStoredEmailVerificationChallenge(challenge) {
  try {
    if (!challenge) {
      localStorage.removeItem(EMAIL_VERIFY_KEY);
      return;
    }
    localStorage.setItem(EMAIL_VERIFY_KEY, JSON.stringify(challenge));
  } catch (_error) {
    // Ignore storage failures.
  }
}

function createOneTimeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function splitFullName(value) {
  const fullName = String(value || '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!fullName) {
    return {
      firstName: '',
      lastName: '',
      fullName: '',
    };
  }

  const parts = fullName.split(' ');
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
    fullName,
  };
}

async function hashSecret(value) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  if (!globalThis.crypto?.subtle) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  const payload = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', payload);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('');
}

function findPreviewUserByIdentity(identity) {
  const normalised = normaliseIdentityInput(identity);
  if (!normalised) {
    return null;
  }

  return (
    getStoredPreviewUsers().find((user) => {
      return (
        user.email === normalised ||
        user.username === normalised ||
        user.phoneNumber === normalised
      );
    }) || null
  );
}

function updatePreviewUser(userId, updater) {
  const users = getStoredPreviewUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index < 0) {
    return null;
  }

  const current = users[index];
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  users[index] = next;
  setStoredPreviewUsers(users);
  return next;
}

function grantPreviewGoldReward(userId, reason, points) {
  return updatePreviewUser(userId, (current) => {
    const milestones = Array.isArray(current.rewardMilestonesGranted)
      ? current.rewardMilestonesGranted
      : [];

    if (milestones.includes(reason)) {
      return current;
    }

    const createdAt = current.createdAt || new Date().toISOString();
    const goldUnlockDate = current.goldUnlockDate || getPreviewGoldUnlockDate(createdAt);
    const locked = calculateGoldDaysRemaining(goldUnlockDate) > 0;

    return {
      ...current,
      createdAt,
      goldUnlockDate,
      rewardMilestonesGranted: [...milestones, reason],
      br9GoldLockedBalance: locked
        ? Number(current.br9GoldLockedBalance || 0) + Number(points || 0)
        : Number(current.br9GoldLockedBalance || 0),
      br9GoldBalance: locked
        ? Number(current.br9GoldBalance || 0)
        : Number(current.br9GoldBalance || 0) + Number(points || 0),
    };
  });
}

async function registerPreviewUser(payload) {
  const nameParts = splitFullName(payload.fullName || `${payload.firstName || ''} ${payload.lastName || ''}`);
  const firstName = nameParts.firstName;
  const lastName = nameParts.lastName;
  const fullName = nameParts.fullName;
  const username = normaliseUsernameInput(payload.username);
  const email = normaliseEmailInput(payload.email);
  const phoneNumber = normalisePhoneInput(payload.phoneNumber);
  const password = String(payload.password || '').trim();
  const confirmPassword = String(payload.confirmPassword || '').trim();
  const pin = String(payload.pin || '').trim();
  const submittedReferralCode = String(payload.referralCode || '')
    .trim()
    .toUpperCase();

  if (!fullName || !username || !email || !phoneNumber || !password || !confirmPassword || !pin) {
    throw new Error('Fill every signup field before continuing.');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match yet. Please check and try again.');
  }

  if (!VALIDATORS.password(password)) {
    throw new Error('Password must be at least 8 characters.');
  }

  if (!VALIDATORS.pin(pin)) {
    throw new Error('Quick PIN must be exactly 6 digits.');
  }

  const users = getStoredPreviewUsers();
  if (
    submittedReferralCode &&
    !users.some((user) => String(user.referralCode || '').trim().toUpperCase() === submittedReferralCode)
  ) {
    throw new Error('Referral code not found.');
  }

  const duplicate = users.find((user) => {
    return user.email === email || user.username === username || user.phoneNumber === phoneNumber;
  });

  if (duplicate) {
    if (duplicate.email === email) {
      throw new Error('That email has already been used on BR9ja.');
    }
    if (duplicate.username === username) {
      throw new Error('That username has already been used on BR9ja.');
    }
    throw new Error('That phone number has already been used on BR9ja.');
  }

  const generatedReferralCode = `${username.slice(0, 4).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
  const nextUser = {
    id: `br9-user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    firstName,
    lastName,
    fullName,
    username,
    email,
    phoneNumber,
    passwordHash: await hashSecret(password),
    pinHash: await hashSecret(pin),
    emailVerified: false,
    emailVerifiedAt: null,
    phoneVerified: false,
    phoneVerifiedAt: null,
    isVerified: false,
    verifiedAt: null,
    fullNameLocked: false,
    isNameLocked: false,
    walletBalance: 0,
    createdAt: new Date().toISOString(),
    goldUnlockDate: getPreviewGoldUnlockDate(),
    br9GoldBalance: 0,
    br9GoldLockedBalance: 0,
    rewardMilestonesGranted: [],
    lastLoginAt: new Date().toISOString(),
    firstLoginCompleted: true,
    quickAccessMode: 'pin-password',
    referralCode: generatedReferralCode,
    referralLink: `${DEFAULT_CONFIG.siteUrl.replace(/\/$/, '')}/signup?ref=${encodeURIComponent(
      generatedReferralCode
    )}`,
    referredByCode: submittedReferralCode || '',
  };

  users.unshift(nextUser);
  setStoredPreviewUsers(users);
  const code = createOneTimeCode();
  setStoredEmailVerificationChallenge({
    userId: nextUser.id,
    email,
    codeHash: await hashSecret(code),
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  return {
    user: nextUser,
    code,
  };
}

async function startPreviewEmailVerification(identity) {
  const user = findPreviewUserByIdentity(identity);
  if (!user) {
    throw new Error('We could not find a BR9ja account waiting for email verification.');
  }

  const code = createOneTimeCode();
  setStoredEmailVerificationChallenge({
    userId: user.id,
    email: user.email,
    codeHash: await hashSecret(code),
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  return {
    code,
    user,
    deepLink: `br9ja://verify-email?code=${encodeURIComponent(code)}`,
  };
}

async function completePreviewEmailVerification(userId, code) {
  const challenge = getStoredEmailVerificationChallenge();
  if (!challenge || challenge.userId !== userId || challenge.expiresAt < Date.now()) {
    throw new Error('Email verification code expired. Request another one.');
  }

  if ((await hashSecret(code)) !== challenge.codeHash) {
    throw new Error('Email verification code did not match. Please try again.');
  }

  updatePreviewUser(userId, (current) => ({
    ...current,
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
  }));
  const updatedUser = grantPreviewGoldReward(userId, 'email_verification', 100);

  setStoredEmailVerificationChallenge(null);
  return updatedUser;
}

async function loginPreviewUser(identity, secret) {
  const user = findPreviewUserByIdentity(identity);
  if (!user) {
    throw new Error('No BR9ja account was found for that email, username, or phone number on this device yet.');
  }

  if (!user.emailVerified) {
    throw new Error('Verify your email before logging in to BR9ja.');
  }

  const secretHash = await hashSecret(secret);
  const passwordMatch = secretHash === user.passwordHash;
  const pinMatch = user.firstLoginCompleted && secretHash === user.pinHash;

  if (!passwordMatch && !pinMatch) {
    throw new Error('Password or 6-digit PIN did not match this BR9ja account.');
  }

  const updatedUser = updatePreviewUser(user.id, (current) => ({
    ...current,
    firstLoginCompleted: true,
    lastLoginAt: new Date().toISOString(),
  }));

  setStoredAuthUser(updatedUser);
  return updatedUser;
}

async function quickAccessLogin(method) {
  const remembered = getRememberedIdentity();
  const user = findPreviewUserByIdentity(remembered);

  if (!remembered || !user) {
    throw new Error('No returning BR9ja account is saved on this device yet. Log in with password first.');
  }

  const updatedUser = updatePreviewUser(user.id, (current) => ({
    ...current,
    firstLoginCompleted: true,
    lastLoginAt: new Date().toISOString(),
    quickAccessMode: method,
  }));

  setStoredAuthUser(updatedUser);
  return updatedUser;
}

async function startPasswordReset(identity) {
  const user = findPreviewUserByIdentity(identity);
  if (!user) {
    throw new Error('We could not find a BR9ja account with that email or phone number.');
  }

  const code = createOneTimeCode();
  const channel = VALIDATORS.email(String(identity || '').trim()) ? 'email' : 'phone';
  setStoredResetChallenge({
    userId: user.id,
    channel,
    expiresAt: Date.now() + 10 * 60 * 1000,
    codeHash: await hashSecret(code),
  });
  return {
    code,
    channel,
    user,
    deepLink: `br9ja://reset-password?code=${encodeURIComponent(code)}`,
  };
}

async function completePasswordReset(payload) {
  const challenge = getStoredResetChallenge();
  if (!challenge || challenge.expiresAt < Date.now()) {
    throw new Error('The reset code has expired. Request a fresh code and try again.');
  }

  const code = String(payload.code || '').trim();
  const newPassword = String(payload.password || '').trim();

  if (!VALIDATORS.otp(code)) {
    throw new Error('Enter the full 6-digit reset code.');
  }

  if (!VALIDATORS.password(newPassword)) {
    throw new Error('New password must be at least 8 characters.');
  }

  const codeHash = await hashSecret(code);
  if (codeHash !== challenge.codeHash) {
    throw new Error('Reset code is invalid. Check it and try again.');
  }

  const passwordHash = await hashSecret(newPassword);
  const resetUser = updatePreviewUser(challenge.userId, (current) => ({
    ...current,
    passwordHash,
    lastLoginAt: new Date().toISOString(),
    firstLoginCompleted: true,
  }));

  if (!resetUser) {
    throw new Error('The BR9ja account for this reset code was not found anymore.');
  }

  setStoredResetChallenge(null);
  setStoredAuthUser(resetUser);
  return resetUser;
}

async function startPhoneVerification(userId) {
  const user = getStoredPreviewUsers().find((item) => item.id === userId);
  if (!user) {
    throw new Error('Sign in again before verifying this phone number.');
  }

  const code = createOneTimeCode();
  setStoredPhoneVerificationChallenge({
    userId,
    expiresAt: Date.now() + 10 * 60 * 1000,
    codeHash: await hashSecret(code),
  });
  return { code, user };
}

async function completePhoneVerification(userId, code) {
  const challenge = getStoredPhoneVerificationChallenge();
  if (!challenge || challenge.userId !== userId || challenge.expiresAt < Date.now()) {
    throw new Error('Phone verification code expired. Request another one.');
  }

  if ((await hashSecret(code)) !== challenge.codeHash) {
    throw new Error('Verification code did not match. Please try again.');
  }

  updatePreviewUser(userId, (current) => ({
    ...current,
    phoneVerified: true,
    phoneVerifiedAt: new Date().toISOString(),
  }));
  const updatedUser = grantPreviewGoldReward(userId, 'phone_verification', 100);

  setStoredPhoneVerificationChallenge(null);
  setStoredAuthUser(updatedUser);
  return updatedUser;
}

async function registerLiveUser(payload) {
  const response = await requestJson('/api/auth/register', {
    method: 'POST',
    payload: {
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      pin: payload.pin,
      referralCode: payload.referralCode,
    },
  });

  const challenge = {
    userId: response.data.userId,
    email: payload.email,
    maskedEmail: response.data.maskedEmail,
    expiresInSeconds: response.data.expiresInSeconds,
    ...(response.data.devCode ? { code: response.data.devCode } : {}),
  };
  setStoredEmailVerificationChallenge(challenge);
  rememberIdentity(payload.email || payload.username || payload.phoneNumber || '');
  return response.data;
}

async function resendLiveEmailVerification(payload) {
  const response = await requestJson('/api/auth/resend-email-verification', {
    method: 'POST',
    payload,
  });
  setStoredEmailVerificationChallenge({
    ...(getStoredEmailVerificationChallenge() || {}),
    ...(response.data || {}),
  });
  return response.data;
}

async function verifyLiveEmailCode(payload) {
  const response = await requestJson('/api/auth/verify-email-code', {
    method: 'POST',
    payload,
  });
  setStoredEmailVerificationChallenge(null);
  return response.data;
}

async function loginLiveUser(identity, secret) {
  const response = await requestJson('/api/auth/login', {
    method: 'POST',
    payload: {
      identifier: identity,
      secret,
    },
  });

  const user = mapApiUserProfile(response.data.user);
  setStoredAuthTokens(response.data.accessToken, response.data.refreshToken);
  setStoredAuthUser(user);
  return {
    ...response.data,
    user,
  };
}

async function fetchLiveProfile() {
  const response = await requestJson('/api/user/profile', {
    method: 'GET',
    auth: true,
  });
  const user = mapApiUserProfile(response.data);
  setStoredAuthUser(user);
  return response.data;
}

async function quickAccessLoginLive() {
  const refreshed = await refreshLiveSession();
  const user = mapApiUserProfile(refreshed.user);
  setStoredAuthUser(user);
  return {
    ...refreshed,
    user,
  };
}

async function requestLivePasswordReset(identity) {
  const response = await requestJson('/api/auth/request-password-reset', {
    method: 'POST',
    payload: { identity },
  });
  setStoredResetChallenge({
    identity,
    ...(response.data || {}),
  });
  return response.data;
}

async function confirmLivePasswordReset(payload) {
  const challenge = getStoredResetChallenge() || {};
  const response = await requestJson('/api/auth/confirm-password-reset', {
    method: 'POST',
    payload: {
      identity: payload.identity || challenge.identity,
      code: payload.code,
      password: payload.password,
    },
  });
  const user = mapApiUserProfile(response.data.user);
  setStoredResetChallenge(null);
  setStoredAuthTokens(response.data.accessToken, response.data.refreshToken);
  setStoredAuthUser(user);
  return {
    ...response.data,
    user,
  };
}

async function requestLivePhoneVerification(channel) {
  const response = await requestJson('/api/user/send-phone-verification', {
    method: 'POST',
    auth: true,
    payload: { channel },
  });
  setStoredPhoneVerificationChallenge({
    channel,
    ...(response.data || {}),
  });
  return response.data;
}

async function confirmLivePhoneVerification(code) {
  const response = await requestJson('/api/user/verify-phone-code', {
    method: 'POST',
    auth: true,
    payload: { code },
  });
  const user = mapApiUserProfile(response.data);
  setStoredPhoneVerificationChallenge(null);
  setStoredAuthUser(user);
  return user;
}

function normaliseIntegerInput(value, fallback) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return fallback;
}

function formatCurrency(value) {
  const numeric = Number(value || 0);
  return `₦${numeric.toLocaleString()}`;
}

function buildPreviewVirtualAccount(user) {
  const digits = String(user?.phoneNumber || '')
    .replace(/\D/g, '')
    .slice(-10)
    .padStart(10, '0');
  const accountLabelDigits = String(user?.phoneNumber || '')
    .replace(/\D/g, '')
    .slice(-11);

  return {
    bankName: 'GTBank',
    accountNumber: digits,
    accountName: `BR9 - ${accountLabelDigits || 'USER'}`.trim().toUpperCase(),
    provider: 'squad',
    status: 'recommended',
    instantCredit: true,
    recommended: true,
  };
}

function buildWhatsAppSupportUrl(config, message) {
  const number = String(config?.whatsappNumber || '').replace(/\D/g, '');
  if (!number) {
    return '#';
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(String(message || config?.whatsappPrefill || '').trim())}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatPromoServices(targetServices = []) {
  const values = Array.isArray(targetServices) ? targetServices : [];
  if (!values.length || values.includes('all')) {
    return 'all services';
  }

  return values
    .map((item) => PROMO_SERVICE_LABELS[item] || item)
    .join(', ');
}

function formatPromoCountdown(seconds) {
  const safeSeconds = Math.max(Number(seconds || 0), 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function formatModeLabel(value) {
  return String(value || '')
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

async function loadConfig() {
  const stored = getStoredConfig();
  let remote = null;

  if (window.location.protocol !== 'file:') {
    try {
      const response = await fetch(`${getBasePath()}/config/config.json`, {
        cache: 'no-store',
      });
      if (response.ok) {
        remote = await response.json();
      }
    } catch (_error) {
      remote = null;
    }
  }

  return {
    ...DEFAULT_CONFIG,
    ...(remote || {}),
    ...(stored || {}),
  };
}

function resolveApiBaseUrl() {
  const query = new URLSearchParams(window.location.search);
  const queryOverride = normaliseApiBaseUrl(
    query.get('apiBaseUrl') || query.get('api') || ''
  );
  if (queryOverride) {
    return setStoredApiBaseUrl(queryOverride);
  }

  const runtimeOverride = normaliseApiBaseUrl(window.__BR9_API_BASE_URL || '');
  if (runtimeOverride) {
    return runtimeOverride;
  }

  const configured = normaliseApiBaseUrl(window.__br9Config?.apiBaseUrl || '');
  if (configured) {
    return configured;
  }

  const storedOverride = getStoredApiBaseUrl();
  if (storedOverride) {
    return storedOverride;
  }

  if (
    window.location.protocol === 'file:' ||
    ['127.0.0.1', 'localhost'].includes(window.location.hostname)
  ) {
    return 'http://127.0.0.1:5000';
  }

  return normaliseApiBaseUrl(window.location.origin);
}

function resolveApiUrl(path) {
  const safePath = String(path || '').trim();
  if (!safePath.startsWith('/')) {
    return safePath;
  }

  const base = resolveApiBaseUrl();
  return base ? `${base}${safePath}` : safePath;
}

async function refreshLiveSession() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error('Session expired. Please log in again.');
  }

  const response = await fetch(resolveApiUrl('/api/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.data?.accessToken) {
    clearStoredAuthUser();
    throw new Error(data?.message || 'Session expired. Please log in again.');
  }

  setStoredAuthTokens(data.data.accessToken, data.data.refreshToken || refreshToken);
  if (data.data.user) {
    setStoredAuthUser(data.data.user);
  }
  return data.data;
}

async function requestJson(path, options = {}) {
  const {
    method = 'GET',
    payload,
    headers = {},
    auth = false,
    retry = true,
  } = options;

  const requestHeaders = {
    ...(payload !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  if (auth) {
    const accessToken = getStoredAccessToken();
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(resolveApiUrl(path), {
    method,
    headers: requestHeaders,
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && auth && retry && getStoredRefreshToken()) {
      await refreshLiveSession();
      return requestJson(path, {
        method,
        payload,
        headers,
        auth,
        retry: false,
      });
    }
    throw new Error(data?.message || 'Request failed.');
  }

  return data;
}

function mapApiUserProfile(user) {
  return serialiseAuthUser({
    ...user,
    id: user.id,
    username: String(user.bayrightTag || user.username || '').replace(/^@/, ''),
    emailVerified: Boolean(user.emailVerified),
    phoneVerified: Boolean(user.phoneVerified),
    isVerified: Boolean(user.isVerified),
    fullNameLocked: Boolean(user.fullNameLocked || user.isNameLocked),
    walletBalance: Number(user.walletBalance || 0),
    restrictedMode: Boolean(user.restrictedMode),
    canUseServices: user.canUseServices !== false,
    virtualAccount: user.virtualAccount || null,
    referralCode: user.referralCode || '',
    referralLink: user.referralLink || '',
    successfulTransactionCount: Number(user.successfulTransactionCount || 0),
    partnerBank:
      user.partnerBank && typeof user.partnerBank === 'object' ? user.partnerBank : null,
  });
}

function buildHeaderAuthMarkup(base, current, authUser = getStoredAuthUser()) {
  if (authUser) {
    const label = authUser.firstName || authUser.username || 'Profile';
    return `
      <div class="site-header__quick-auth">
        <a class="header-auth-button header-auth-button--profile" href="${base}/profile.html">${escapeHtml(label)}</a>
        <button class="header-auth-button header-auth-button--logout" type="button" data-auth-logout>Logout</button>
      </div>
    `;
  }

  const authLinks = [];
  let mobileLabel = 'Login/SignUp';
  let mobileHref = `${base}/login.html`;
  let mobileVariant = 'header-auth-button--signup';

  if (current === 'login') {
    authLinks.push(['Sign Up', `${base}/signup.html`, 'header-auth-button--signup']);
    mobileLabel = 'Sign Up';
    mobileHref = `${base}/signup.html`;
  } else if (current === 'signup') {
    authLinks.push(['Login', `${base}/login.html`, 'header-auth-button--login']);
    mobileLabel = 'Login';
    mobileHref = `${base}/login.html`;
    mobileVariant = 'header-auth-button--login';
  } else if (current === 'reset-password') {
    authLinks.push(['Login', `${base}/login.html`, 'header-auth-button--login']);
    mobileLabel = 'Login';
    mobileHref = `${base}/login.html`;
    mobileVariant = 'header-auth-button--login';
  } else if (current === 'verify-email') {
    authLinks.push(['Login', `${base}/login.html`, 'header-auth-button--login']);
    mobileLabel = 'Login';
    mobileHref = `${base}/login.html`;
    mobileVariant = 'header-auth-button--login';
  } else if (current === 'secure-account') {
    authLinks.push(['Logout', `${base}/login.html`, 'header-auth-button--login']);
    mobileLabel = 'Logout';
    mobileHref = `${base}/login.html`;
    mobileVariant = 'header-auth-button--login';
  } else {
    authLinks.push(
      ['Login', `${base}/login.html`, 'header-auth-button--login'],
      ['Sign Up', `${base}/signup.html`, 'header-auth-button--signup'],
    );
  }

  const desktopMarkup = authLinks
    .map(([label, href, variant]) => `<a class="header-auth-button ${variant}" href="${href}">${label}</a>`)
    .join('');

  return `
    <div class="site-header__quick-auth site-header__quick-auth--guest">
      <div class="site-header__quick-auth-group site-header__quick-auth-group--desktop">
        ${desktopMarkup}
      </div>
      <a class="header-auth-button header-auth-button--combo ${mobileVariant}" href="${mobileHref}">${mobileLabel}</a>
    </div>
  `;
}

function buildHeader(config, theme) {
  const base = getBasePath();
  const current = getPageName();
  const authUser = getStoredAuthUser();
  const headerStateClass = authUser ? 'site-header--signed-in' : 'site-header--guest';
  const navLinks = HEADER_NAV_ITEMS.map(([key, label, href]) => {
    const active = current === key ? 'is-active' : '';
    return `<a class="${active}" href="${base}/${href}">${label}</a>`;
  }).join('');

  const themeIcon = theme === 'light' ? '☀' : '☾';
  const themeLabel = theme === 'light' ? 'Light Mode' : 'Dark Mode';

  return `
    <header class="site-header ${headerStateClass}">
      <a class="site-brand" href="${base}/index.html" aria-label="${config.brandName} Home">
        <img src="${base}/assets/logo_web_header.webp" alt="${config.brandName} logo" class="site-brand__logo">
        <span class="site-brand__text">
          <strong>${config.brandName}</strong>
          <small>${config.slogan}</small>
        </span>
      </a>

      <div class="site-header__actions">
        ${buildHeaderAuthMarkup(base, current, authUser)}
        <nav class="site-nav" id="site-nav" aria-label="Primary navigation">
          ${navLinks}
        </nav>

        <button class="theme-toggle" type="button" aria-label="Toggle color theme" title="Toggle color theme">
          <span class="theme-toggle__icon">${themeIcon}</span>
          <span class="theme-toggle__label">${themeLabel}</span>
        </button>

        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
          <span class="menu-toggle__stack" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span class="menu-toggle__close" aria-hidden="true">×</span>
        </button>
      </div>
    </header>
    <div class="promo-banner is-hidden" data-site-promo hidden></div>
  `;
}

function buildAdminShell(config, theme) {
  const base = getBasePath();
  const currentRoom = document.body.dataset.adminRoom || 'dashboard';
  const navTarget = isEmbeddedAdminView() ? '_top' : '_self';
  const navLinks = ADMIN_NAV_ITEMS.map(([key, label, href, icon]) => {
    const active = currentRoom === key ? 'is-active' : '';
    return `
      <a class="admin-sidebar__link ${active}" href="${base}/${href}" target="${navTarget}">
        <span class="admin-sidebar__link-icon" aria-hidden="true">${icon}</span>
        <span>${label}</span>
      </a>
    `;
  }).join('');

  const themeIcon = theme === 'light' ? '☀' : '☾';
  const themeLabel = theme === 'light' ? 'Light Mode' : 'Dark Mode';

  return `
    <div class="admin-sidebar__mobile-bar">
      <a class="admin-sidebar__mobile-brand" href="${base}/index.html">
        <img src="${base}/assets/logo_web_header.webp" alt="${config.brandName} logo" class="site-brand__logo">
        <span>${config.brandName} HQ</span>
      </a>
      <button class="admin-menu-toggle" type="button" aria-expanded="false" aria-label="Open admin navigation">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <aside class="admin-sidebar">
      <div class="admin-sidebar__brand">
        <a class="admin-sidebar__brand-link" href="${base}/index.html" aria-label="${config.brandName} Home">
          <img src="${base}/assets/logo_web_header.webp" alt="${config.brandName} logo" class="site-brand__logo">
          <span class="admin-sidebar__brand-copy">
            <strong>${config.brandName}</strong>
            <small>${config.slogan}</small>
          </span>
        </a>
        <span class="admin-sidebar__badge">Private Ops</span>
      </div>

      <nav class="admin-sidebar__nav" aria-label="Admin navigation">
        ${navLinks}
      </nav>

      <div class="admin-sidebar__footer">
        <button class="theme-toggle admin-theme-toggle" type="button" aria-label="Toggle color theme" title="Toggle color theme">
          <span class="theme-toggle__icon">${themeIcon}</span>
          <span class="theme-toggle__label">${themeLabel}</span>
        </button>
        <p class="mini-note">Admin sign-in is required before any BR9ja room becomes interactive.</p>
      </div>
    </aside>
  `;
}

function buildSocialLinks(config) {
  const SOCIAL_ICONS = {
    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.6 2c.4 2.2 1.7 3.9 3.9 4.5v3c-1.4 0-2.7-.3-3.9-.9v6.2c0 3.4-2.8 6.2-6.2 6.2S3.2 18.2 3.2 14.8 6 8.6 9.4 8.6c.4 0 .7 0 1.1.1v3.2c-.3-.1-.7-.2-1.1-.2-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1 3.1-1.4 3.1-3.1V2h3.1Z"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 3.2A1.8 1.8 0 0 0 5.2 7v10c0 1 .8 1.8 1.8 1.8h10c1 0 1.8-.8 1.8-1.8V7c0-1-.8-1.8-1.8-1.8H7Zm5 2.3a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2.7a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm4.4-3.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/></svg>',
    x:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2H21.308L14.618 9.645L22.488 22H16.324L11.504 14.506L4.94 22H1.874L9.03 13.775L1.488 2H7.808L12.166 8.845L18.244 2Z"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.2 7.2a2.9 2.9 0 0 0-2-2C17.5 4.8 12 4.8 12 4.8s-5.5 0-7.2.4a2.9 2.9 0 0 0-2 2C2.4 8.9 2.4 12 2.4 12s0 3.1.4 4.8a2.9 2.9 0 0 0 2 2c1.7.4 7.2.4 7.2.4s5.5 0 7.2-.4a2.9 2.9 0 0 0 2-2c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8ZM10 15.3V8.7l5.7 3.3L10 15.3Z"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 21v-7.6h2.6l.4-3.1h-3V8.4c0-.9.2-1.5 1.5-1.5H16V4.1c-.2 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H7.6v3.1h2.5V21h3.1Z"/></svg>',
  };

  const items = SOCIAL_ITEMS.filter(([key]) => String(config[key] || '').trim()).map(
    ([key, label, iconKey]) => `
      <a class="social-link social-link--${iconKey}" href="${config[key]}" target="_blank" rel="noreferrer" aria-label="${label}">
        <span class="social-link__icon" aria-hidden="true">${SOCIAL_ICONS[iconKey]}</span>
        <span class="social-link__label">${label}</span>
      </a>
    `
  );

  if (!items.length) {
    return `<p class="mini-note">Add your social URLs in Admin Settings to show them here.</p>`;
  }

  return `<div class="social-links">${items.join('')}</div>`;
}

function buildFooter(config) {
  const base = getBasePath();
  return `
    <footer class="footer-panel">
      <div class="footer-grid">
        <section class="footer-column footer-column--brand">
          <img src="${base}/assets/logo_web_header.webp" alt="${config.brandName}" class="footer-brand__logo">
          <p class="footer-copy footer-copy--lead" data-config="slogan">${config.slogan}.</p>
          <p class="footer-copy footer-copy--rich">Nigeria-first wallet actions, verified bill payments, app-only games, and a weekly BR9 Gold rhythm built to feel clear, premium, and rewarding.</p>
          <div class="footer-brand-highlights" aria-label="BR9ja platform highlights">
            <span class="footer-chip">Wallet Ready</span>
            <span class="footer-chip">App-Only Games</span>
            <span class="footer-chip">Weekly BR9 Gold</span>
          </div>
        </section>

        <section class="footer-column">
          <h3>Platform</h3>
          <a href="${base}/index.html">Home</a>
          <a href="${base}/services.html">Services</a>
          <a href="${base}/about.html">About</a>
          <a href="${base}/help.html">Help Center</a>
          <a href="${base}/contact.html">Contact</a>
        </section>

        <section class="footer-column">
          <h3>Legal</h3>
          <a href="${base}/terms.html">Terms & Conditions</a>
          <a href="${base}/privacy.html">Privacy Policy</a>
        </section>

        <section class="footer-column">
          <h3>Social</h3>
          ${buildSocialLinks(config)}
        </section>
      </div>

      <div class="footer-bottom">
        <p>© 2026 ${config.brandName.toUpperCase()}. All rights reserved.</p>
        <p class="footer-copy">${config.companyName} is a registered entity. Rewards are subject to weekly verification, benchmark completion, and task validation before payout.</p>
      </div>
    </footer>
  `;
}

function mountShell(config) {
  const theme = getStoredTheme();
  const shell = document.querySelector('[data-site-shell]');
  if (shell) {
    shell.innerHTML = buildHeader(config, theme);
  }

  const footer = document.querySelector('[data-site-footer]');
  if (footer) {
    footer.innerHTML = buildFooter(config);
  }
}

function mountAdminShell(config) {
  const shell = document.querySelector('[data-admin-shell]');
  if (!shell) {
    return;
  }

  shell.innerHTML = buildAdminShell(config, getStoredTheme());
}

function updateThemeChrome(theme) {
  const isLight = theme === 'light';

  document.querySelectorAll('.theme-toggle__icon').forEach((toggleIcon) => {
    toggleIcon.textContent = isLight ? '☀' : '☾';
  });

  document.querySelectorAll('.theme-toggle__label').forEach((toggleLabel) => {
    toggleLabel.textContent = isLight ? 'Light Mode' : 'Dark Mode';
  });

  document.querySelectorAll('.theme-toggle').forEach((toggle) => {
    toggle.setAttribute('aria-pressed', String(isLight));
  });
}

function applyTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  document.body.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', nextTheme === 'light' ? '#FFFFFF' : '#0A0A0A');
  }

  updateThemeChrome(nextTheme);
}

function bindThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) {
    return;
  }

  toggle.addEventListener('click', () => {
    const nextTheme = getStoredTheme() === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });
}

function closeMenu() {
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!nav || !toggle) {
    return;
  }

  nav.classList.remove('is-open');
  document.body.classList.remove('nav-open');
  toggle.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
}

function bindMenuToggle() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const header = document.querySelector('.site-header');
  if (!toggle || !nav || !header) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    document.body.classList.toggle('nav-open', isOpen);
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('is-open')) {
      return;
    }
    if (header.contains(event.target)) {
      return;
    }
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  });
}

function bindAdminSidebarToggle() {
  const toggle = document.querySelector('.admin-menu-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (!toggle || !sidebar) {
    return;
  }

  const closeSidebar = () => {
    document.body.classList.remove('admin-nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('admin-nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  sidebar.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeSidebar);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeSidebar();
    }
  });
}

function applyConfigToDom(config) {
  document.querySelectorAll('[data-config="opsEmail"]').forEach((node) => {
    node.textContent = config.opsEmail;
    if (node.tagName === 'A') {
      node.href = `mailto:${config.opsEmail}`;
    }
  });

  document.querySelectorAll('[data-config="supportEmail"]').forEach((node) => {
    node.textContent = config.supportEmail;
    if (node.tagName === 'A') {
      node.href = `mailto:${config.supportEmail}`;
    }
  });

  document.querySelectorAll('[data-config="companyName"]').forEach((node) => {
    node.textContent = config.companyName;
  });

  document.querySelectorAll('[data-config="slogan"]').forEach((node) => {
    node.textContent = config.slogan;
  });

  document.querySelectorAll('[data-config="officeLocation"]').forEach((node) => {
    node.textContent = config.officeLocation;
  });

  document.querySelectorAll('[data-config="benchmarkGold"]').forEach((node) => {
    node.textContent = `${config.mondayBenchmarkGold.toLocaleString()} BR9 Gold`;
  });

  document.querySelectorAll('[data-config="benchmarkNaira"]').forEach((node) => {
    node.textContent = `₦${config.mondayBenchmarkNaira.toLocaleString()}`;
  });

  document.querySelectorAll('[data-config="payoutRequirements"]').forEach((node) => {
    node.textContent = config.payoutRequirements;
  });

  document.querySelectorAll('[data-config="quickLoginModes"]').forEach((node) => {
    node.textContent = config.quickLoginModes;
  });

  document.querySelectorAll('[data-config="partnerBankName"]').forEach((node) => {
    node.textContent = config.partnerBankName || DEFAULT_CONFIG.partnerBankName;
  });

  document.querySelectorAll('[data-config="partnerBankReferralCode"]').forEach((node) => {
    node.textContent =
      config.partnerBankReferralCode || DEFAULT_CONFIG.partnerBankReferralCode;
  });

  document.querySelectorAll('[data-config="partnerBankSettlementBankName"]').forEach((node) => {
    node.textContent =
      config.partnerBankSettlementBankName ||
      DEFAULT_CONFIG.partnerBankSettlementBankName;
  });

  document.querySelectorAll('[data-config="partnerBankSettlementAccountNumber"]').forEach((node) => {
    node.textContent =
      config.partnerBankSettlementAccountNumber || 'Not set';
  });

  document.querySelectorAll('[data-config-link="playStore"]').forEach((node) => {
    node.href = config.playStoreUrl;
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noreferrer');
  });

  document.querySelectorAll('[data-config-link="appStore"]').forEach((node) => {
    node.href = config.appStoreUrl;
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noreferrer');
  });

  const whatsappUrl = config.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(config.whatsappPrefill)}`
    : '';

  document.querySelectorAll('[data-config-link="supportWhatsapp"]').forEach((node) => {
    if (!whatsappUrl) {
      node.classList.add('is-hidden');
      return;
    }

    node.classList.remove('is-hidden');
    node.href = whatsappUrl;
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noreferrer');
  });

  document.querySelectorAll('[data-config-link="whatsappHelp"]').forEach((node) => {
    if (!whatsappUrl || !shouldExposeWhatsApp()) {
      node.classList.add('is-hidden');
      return;
    }

    node.classList.remove('is-hidden');
    node.href = whatsappUrl;
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noreferrer');
    node.setAttribute('aria-label', 'Chat with BR9ja on WhatsApp');
    node.setAttribute('title', 'Chat with BR9ja on WhatsApp');
    node.innerHTML = `
      <span class="floating-whatsapp__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M12.04 2C6.54 2 2.08 6.4 2.08 11.84c0 1.92.56 3.79 1.63 5.39L2 22l4.94-1.62a10.1 10.1 0 0 0 5.1 1.38h.01c5.49 0 9.95-4.4 9.95-9.84S17.54 2 12.04 2Zm5.8 13.94c-.24.67-1.43 1.28-1.97 1.36-.5.08-1.12.11-1.81-.11-.42-.13-.96-.31-1.66-.6-2.92-1.25-4.83-4.18-4.98-4.38-.15-.2-1.18-1.55-1.18-2.96 0-1.41.75-2.1 1.01-2.39.27-.29.58-.36.77-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 1.99.89 2.13.07.14.12.31.02.5-.09.19-.14.31-.29.48-.15.17-.31.37-.45.49-.15.13-.3.27-.13.53.17.26.76 1.24 1.62 2.01 1.11.99 2.04 1.31 2.33 1.45.29.14.46.12.63-.07.17-.19.73-.84.93-1.13.19-.29.39-.24.66-.14.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.71-.17 1.38Z"/>
        </svg>
      </span>
    `;
  });
}

function buildPromoBannerMarkup(summary) {
  if (!summary) {
    return '';
  }

  const targetLabel = formatPromoServices(summary.targetServices);

  if (summary.status === 'active') {
    const savingsLabel =
      summary.discountType === 'percentage'
        ? `${summary.discountPercent}% OFF${summary.maxDiscountValue > 0 ? ` • up to ${formatCurrency(summary.maxDiscountValue)}` : ''}`
        : `${formatCurrency(summary.discountAmount)} OFF`;
    const spotsLabel =
      summary.spotsRemaining === null
        ? 'Unlimited window'
        : `${summary.spotsRemaining} spots left`;

    return `
      <span class="promo-banner__eyebrow">Flash Sale Live</span>
      <strong>${savingsLabel} ${targetLabel}</strong>
      <span>${spotsLabel}</span>
      <span>Ends in ${formatPromoCountdown(summary.secondsRemaining)}</span>
    `;
  }

  if (summary.status === 'upcoming') {
    return `
      <span class="promo-banner__eyebrow">Golden Window Queued</span>
      <strong>${summary.title}</strong>
      <span>${formatPromoServices(summary.targetServices)}</span>
      <span>Starts in ${formatPromoCountdown(summary.secondsUntilStart)}</span>
    `;
  }

  return `
    <span class="promo-banner__eyebrow">Golden Window Update</span>
    <strong>Flash Sale Ended!</strong>
    <span>Stay tuned for the next Golden Window.</span>
  `;
}

function applyPromoSummary(summary) {
  currentPromoSummary = summary;
  const nodes = document.querySelectorAll('[data-site-promo]');

  const render = () => {
    nodes.forEach((node) => {
      if (!summary) {
        node.hidden = true;
        node.classList.add('is-hidden');
        node.innerHTML = '';
        return;
      }

      node.hidden = false;
      node.classList.remove('is-hidden');
      node.classList.toggle('promo-banner--active', summary.status === 'active');
      node.classList.toggle('promo-banner--upcoming', summary.status === 'upcoming');
      node.classList.toggle(
        'promo-banner--ended',
        summary.status === 'finished' || summary.status === 'killed'
      );
      node.innerHTML = buildPromoBannerMarkup(summary);
    });
  };

  if (promoTicker) {
    window.clearInterval(promoTicker);
    promoTicker = null;
  }

  render();
  if (typeof window.__br9RecomputeServicePricing === 'function') {
    window.__br9RecomputeServicePricing();
  }

  if (!summary || !['active', 'upcoming'].includes(summary.status)) {
    return;
  }

  promoTicker = window.setInterval(() => {
    if (!currentPromoSummary) {
      return;
    }

    if (currentPromoSummary.status === 'active') {
      currentPromoSummary = {
        ...currentPromoSummary,
        secondsRemaining: Math.max(Number(currentPromoSummary.secondsRemaining || 0) - 1, 0),
      };
      if (currentPromoSummary.secondsRemaining === 0) {
        loadSitePromo();
        return;
      }
      if (currentPromoSummary.secondsRemaining % 15 === 0) {
        loadSitePromo();
        return;
      }
    } else if (currentPromoSummary.status === 'upcoming') {
      currentPromoSummary = {
        ...currentPromoSummary,
        secondsUntilStart: Math.max(Number(currentPromoSummary.secondsUntilStart || 0) - 1, 0),
      };
      if (currentPromoSummary.secondsUntilStart === 0) {
        loadSitePromo();
        return;
      }
    }

    summary = currentPromoSummary;
    render();
  }, 1000);
}

async function loadSitePromo() {
  if (window.location.protocol === 'file:') {
    applyPromoSummary(null);
    return null;
  }

  try {
    const response = await fetch('/api/site-promo', {
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    const summary = payload?.data ?? null;
    applyPromoSummary(summary);
    return summary;
  } catch (_error) {
    applyPromoSummary(null);
    return null;
  }
}

function renderAdminSummary(config) {
  const activeServices = SERVICE_STATUS_FIELDS.filter((field) =>
    ACTIVE_SERVICE_STATUSES.has(String(config[field] || '').trim())
  ).length;

  const summaryMap = {
    platformModeLabel: formatModeLabel(config.platformMode || 'live'),
    activeServices: `${activeServices}/${SERVICE_STATUS_FIELDS.length} active`,
    gamesState: [
      formatModeLabel(config.marketRunnerStatus || 'live'),
      formatModeLabel(config.triviaRushStatus || 'warmup'),
      formatModeLabel(config.sundayLiveStatus || 'warmup'),
    ].join(' • '),
    cashoutTarget: `${Number(config.mondayBenchmarkGold || 0).toLocaleString()} BR9 Gold → ₦${Number(
      config.mondayBenchmarkNaira || 0
    ).toLocaleString()}`,
  };

  document.querySelectorAll('[data-summary]').forEach((node) => {
    const key = node.dataset.summary;
    if (key && summaryMap[key] !== undefined) {
      node.textContent = summaryMap[key];
    }
  });
}

function bindAuthChrome() {
  document.querySelectorAll('[data-auth-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      clearStoredAuthUser();
      if (getPageName() === 'profile') {
        window.location.href = `${getBasePath()}/login.html`;
        return;
      }
      window.location.reload();
    });
  });
}

function renderSiteChrome(config) {
  window.__br9Config = config;
  document.body.dataset.authenticated = getStoredAuthState() ? 'true' : 'false';
  mountShell(config);
  mountAdminShell(config);
  applyConfigToDom(config);
  renderAdminSummary(config);
  bindMenuToggle();
  bindAdminSidebarToggle();
  bindThemeToggle();
  bindAuthChrome();
  bindWhatsAppVisibility();
  applyTheme(getStoredTheme());
}

function bindWhatsAppVisibility() {
  const nodes = [...document.querySelectorAll('.floating-whatsapp')];
  if (!nodes.length) {
    return;
  }

  const updateVisibility = () => {
    const shouldShow = shouldExposeWhatsApp();
    document.body.classList.toggle('whatsapp-hidden', !shouldShow);
    document.body.classList.toggle('public-whatsapp', shouldShow);
    document.body.classList.toggle('whatsapp-visible', shouldShow);
    nodes.forEach((node) => node.classList.toggle('is-hidden', !shouldShow));
  };

  window.__br9UpdateWhatsappVisibility = updateVisibility;
  updateVisibility();

  if (window.__br9WhatsappVisibilityBound) {
    return;
  }

  window.__br9WhatsappVisibilityBound = true;
  window.addEventListener('scroll', () => window.__br9UpdateWhatsappVisibility?.(), { passive: true });
  window.addEventListener('resize', () => window.__br9UpdateWhatsappVisibility?.());
}

const VALIDATORS = {
  phone: (value) => value.replace(/\D/g, '').length >= 10,
  amount: (value) => Number(value) >= 100,
  meter: (value) => value.replace(/\s/g, '').length >= 10,
  decoder: (value) => value.replace(/\s/g, '').length >= 8,
  username: (value) => value.trim().length >= 3,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  password: (value) => value.trim().length >= 8,
  pin: (value) => /^\d{6}$/.test(value.trim()),
  otp: (value) => /^\d{6}$/.test(value.trim()),
  transaction: (value) => value.trim().length >= 6,
  message: (value) => value.trim().length >= 12,
  name: (value) => value.trim().length >= 2,
};

function updateFieldState(input) {
  const rule = input.dataset.validate;
  const validator = VALIDATORS[rule];
  if (!validator) {
    return;
  }

  const status = input.closest('.field-group')?.querySelector('.field-status');
  const shell = input.closest('.field-shell');
  const hasValue = String(input.value || '').trim().length > 0;
  const isValid = validator(String(input.value || ''));

  shell?.classList.toggle('field-shell--valid', hasValue && isValid);
  shell?.classList.toggle('field-shell--invalid', hasValue && !isValid);

  if (!status) {
    return;
  }

  const defaultText = status.dataset.default || '';
  status.classList.remove('field-status--valid', 'field-status--invalid');

  if (!hasValue) {
    status.textContent = defaultText;
    return;
  }

  status.classList.add(isValid ? 'field-status--valid' : 'field-status--invalid');
  status.textContent = isValid ? '✓ Looks good' : 'Please correct this entry';
}

function bindValidation() {
  document.querySelectorAll('[data-validate]').forEach((input) => {
    updateFieldState(input);
    input.addEventListener('input', () => updateFieldState(input));
  });
}

async function postJson(url, payload, headers = {}) {
  return requestJson(url, {
    method: 'POST',
    payload,
    headers,
  });
}

function showSuccess(target, message) {
  const tone = inferFeedbackTone(message);
  if (target) {
    target.textContent = message;
    target.dataset.tone = tone;
    target.classList.add('is-visible');
  }
  showToast(message, tone);
}

function isApiUnavailableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('load failed')
  );
}

function getPostLoginDestination(user) {
  return user && !user.phoneVerified
    ? `${getBasePath()}/secure-account.html`
    : `${getBasePath()}/profile.html`;
}

function inferFeedbackTone(message = '') {
  const content = String(message || '').toLowerCase();
  if (
    /fail|error|incorrect|invalid|required|expired|unavailable|blocked|mismatch|not correct|cannot|can't|unable|denied|missing|not found|no br9ja account|could not find/.test(
      content,
    )
  ) {
    return 'error';
  }

  if (/draft opened|opened your email app|accepted|pending|preview|started/.test(content)) {
    return 'info';
  }

  return 'success';
}

function ensureToastHost() {
  let host = document.querySelector('[data-toast-host]');
  if (host) {
    return host;
  }

  host = document.createElement('div');
  host.className = 'toast-host';
  host.dataset.toastHost = 'true';
  document.body.appendChild(host);
  return host;
}

function showToast(message, tone = 'success') {
  const host = ensureToastHost();
  const toast = document.createElement('div');
  toast.className = `app-toast app-toast--${tone}`;
  toast.innerHTML = `
    <span class="app-toast__label">${tone === 'error' ? 'Action failed' : tone === 'info' ? 'Update' : 'Success'}</span>
    <span class="app-toast__message">${escapeHtml(String(message || ''))}</span>
  `;
  host.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3600);
}

function playChime(tone = 'success') {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequencies =
      tone === 'critical'
        ? [392, 330]
        : tone === 'warning'
          ? [523.25, 659.25]
          : [659.25, 783.99];

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[0], context.currentTime);
    oscillator.frequency.setValueAtTime(
      frequencies[1],
      context.currentTime + 0.12
    );
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.24);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.26);
    window.setTimeout(() => context.close().catch(() => {}), 320);
  } catch (_error) {
    // Ignore audio issues silently.
  }
}

function buildMailtoUrl(to, subject, bodyLines = []) {
  const subjectText = encodeURIComponent(subject);
  const bodyText = encodeURIComponent(bodyLines.filter(Boolean).join('\n'));
  return `mailto:${encodeURIComponent(to)}?subject=${subjectText}&body=${bodyText}`;
}

function openMailDraft(url) {
  window.setTimeout(() => {
    window.location.href = url;
  }, 120);
}

function formatDurationClock(totalSeconds) {
  const safe = Math.max(Number(totalSeconds || 0), 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildPendingSupportMessage(row = {}) {
  return [
    `Hi BR9ja Support, I need help with pending transaction ${row.reference || row.id || ''}.`,
    `Service: ${row.service || row.type || ''}`,
    `Status: ${row.status || 'pending_verification'}`,
    `Provider: ${row.metadata?.provider || row.provider || 'unknown'}`,
    `Error Code: ${row.metadata?.errorCode || row.metadata?.providerCode || row.status || 'pending_verification'}`,
  ]
    .filter(Boolean)
    .join(' ');
}

function renderTickerItems(track, rows = [], emptyMessage = 'No live activity yet.') {
  if (!track) {
    return;
  }

  const items = Array.isArray(rows) && rows.length
    ? [...rows, ...rows]
        .map(
          (row) => `<span class="ticker__item">${escapeHtml(row.message || '')}</span>`
        )
        .join('')
    : `<span class="ticker__item">${escapeHtml(emptyMessage)}</span>`;

  track.innerHTML = items;
}

function createContactMathChallenge() {
  const useAddition = Math.random() >= 0.5;

  if (useAddition) {
    const left = 1 + Math.floor(Math.random() * 9);
    const right = 1 + Math.floor(Math.random() * (10 - left));
    return {
      prompt: `${left} + ${right} = ?`,
      answer: String(left + right),
    };
  }

  const left = 2 + Math.floor(Math.random() * 9);
  const right = 1 + Math.floor(Math.random() * (left - 1));
  return {
    prompt: `${left} - ${right} = ?`,
    answer: String(left - right),
  };
}

function bindContactChallenge(form) {
  if (!form) {
    return {
      isValid: () => true,
      refresh: () => {},
    };
  }

  const questionNode = form.querySelector('[data-contact-question]');
  const answerInput = form.querySelector('[data-contact-answer]');
  const feedbackNode = form.querySelector('[data-contact-feedback]');
  const submitButton = form.querySelector('[data-contact-submit]');
  const answerShell = answerInput?.closest('.field-shell');

  if (!questionNode || !answerInput || !feedbackNode || !submitButton) {
    return {
      isValid: () => true,
      refresh: () => {},
    };
  }

  const updateState = () => {
    const expected = String(form.dataset.contactAnswer || '').trim();
    const answer = String(answerInput.value || '').trim();
    const hasValue = answer.length > 0;
    const isValid = hasValue && answer === expected;
    const formReady = form.checkValidity();

    submitButton.disabled = !(isValid && formReady);
    answerShell?.classList.toggle('field-shell--valid', isValid);
    answerShell?.classList.toggle('field-shell--invalid', hasValue && !isValid);
    feedbackNode.classList.remove('field-status--valid', 'field-status--invalid');

    if (!hasValue) {
      feedbackNode.textContent = feedbackNode.dataset.default || '';
      return isValid;
    }

    feedbackNode.classList.add(isValid ? 'field-status--valid' : 'field-status--invalid');
    feedbackNode.textContent = isValid
      ? formReady
        ? '✓ Correct answer. You can send your message now.'
        : '✓ Correct answer. Finish the remaining fields to enable Send Message.'
      : 'That answer is not correct yet. Try again.';
    return isValid;
  };

  const refresh = () => {
    const challenge = createContactMathChallenge();
    form.dataset.contactAnswer = challenge.answer;
    questionNode.textContent = challenge.prompt;
    answerInput.value = '';
    updateState();
  };

  answerInput.addEventListener('input', updateState);
  form.addEventListener('input', updateState);
  form.addEventListener('change', updateState);
  refresh();

  return {
    isValid: updateState,
    refresh,
  };
}

function bindContactForms(config) {
  const contactForm = document.querySelector('[data-form="contact"]');
  const payoutForm = document.querySelector('[data-form="payout-issue"]');

  if (contactForm) {
    const challenge = bindContactChallenge(contactForm);
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      const successNode = contactForm.querySelector('.success-banner');

      if (!challenge.isValid()) {
        showSuccess(successNode, 'Answer the quick check correctly before sending your message.');
        return;
      }

      delete payload.authAnswer;

      try {
        if (window.location.protocol === 'file:') {
          showSuccess(successNode, `Customer service draft opened for ${config.supportEmail}.`);
          openMailDraft(buildMailtoUrl(config.supportEmail, `[BR9ja Contact] ${payload.subject}`, [
            `Name: ${payload.name || ''}`,
            `Email: ${payload.email || ''}`,
            `Subject: ${payload.subject || ''}`,
            '',
            String(payload.message || '').trim(),
          ]));
          contactForm.reset();
          challenge.refresh();
          return;
        }

        await postJson('/api/site/contact', payload);
        showSuccess(successNode, `Message sent successfully to ${config.supportEmail}.`);
        contactForm.reset();
        challenge.refresh();
      } catch (error) {
        showSuccess(successNode, `We opened your email app so this report can still reach ${config.supportEmail}.`);
        openMailDraft(buildMailtoUrl(config.supportEmail, `[BR9ja Contact] ${payload.subject}`, [
          `Name: ${payload.name || ''}`,
          `Email: ${payload.email || ''}`,
          `Subject: ${payload.subject || ''}`,
          '',
          String(payload.message || '').trim(),
        ]));
        contactForm.reset();
        challenge.refresh();
      }
    });
  }

  if (payoutForm) {
    payoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(payoutForm);
      const payload = Object.fromEntries(formData.entries());
      const successNode = payoutForm.querySelector('.success-banner');

      try {
        if (window.location.protocol === 'file:') {
          showSuccess(successNode, `Payout issue draft opened for ${config.opsEmail}.`);
          openMailDraft(buildMailtoUrl(config.opsEmail, `[BR9ja Payout Issue] ${payload.transactionId || 'Reference pending'}`, [
            `Username: ${payload.username || ''}`,
            `Transaction ID: ${payload.transactionId || ''}`,
            `Date: ${payload.date || ''}`,
          ]));
          return;
        }

        await postJson('/api/site/payout-issue', payload);
        showSuccess(successNode, 'Payout issue submitted to BR9ja support.');
        payoutForm.reset();
      } catch (error) {
        showSuccess(successNode, `We opened your email app so the payout issue can still reach ${config.opsEmail}.`);
        openMailDraft(buildMailtoUrl(config.opsEmail, `[BR9ja Payout Issue] ${payload.transactionId || 'Reference pending'}`, [
          `Username: ${payload.username || ''}`,
          `Transaction ID: ${payload.transactionId || ''}`,
          `Date: ${payload.date || ''}`,
        ]));
      }
    });
  }
}

function bindAuthUi(config) {
  const rememberedIdentity = getRememberedIdentity();
  const pendingReferralCode = captureReferralCodeFromLocation();

  const initialiseReturningLoginMode = (form) => {
    if (getPageName() !== 'login') {
      return;
    }

    const returningHost = form.querySelector('[data-login-returning]');
    if (!returningHost) {
      return;
    }

    let returningUser = getReturningLoginUser();
    try {
      const query = new URLSearchParams(window.location.search);
      if (!returningUser && query.get('previewReturning') === '1') {
        returningUser = serialiseAuthUser({
          id: 'preview-returning-user',
          firstName: 'Stanley',
          fullName: 'Stanley Kings',
          username: 'stankings',
          email: 'stanley@br9.ng',
          phoneNumber: '08000000000',
          firstLoginCompleted: true,
          lastLoginAt: new Date().toISOString(),
        });
      }
    } catch (_error) {
      // Ignore query parsing issues and keep the normal login mode.
    }

    if (!returningUser) {
      document.body.classList.remove('login-returning-mode', 'login-password-open');
      returningHost.hidden = true;
      return;
    }

    document.body.classList.add('login-returning-mode');
    returningHost.hidden = false;

    const identityInput = form.querySelector('input[name="identity"]');
    const passwordInput = form.querySelector('input[name="secret"]');
    const fallbackToggle = form.querySelector('[data-login-fallback-toggle]');
    const nameNode = form.querySelector('[data-returning-name]');
    const initialNode = form.querySelector('[data-returning-initial]');
    const lockLink = form.querySelector('[data-login-lock-account]');

    if (nameNode) {
      nameNode.textContent = getReturningLoginName(returningUser);
    }

    if (initialNode) {
      initialNode.textContent = getReturningLoginInitial(returningUser);
    }

    const fallbackIdentity =
      rememberedIdentity ||
      returningUser.email ||
      returningUser.username ||
      returningUser.phoneNumber ||
      '';
    if (identityInput instanceof HTMLInputElement && fallbackIdentity && !identityInput.value) {
      identityInput.value = fallbackIdentity;
      updateFieldState(identityInput);
    }

    if (lockLink instanceof HTMLAnchorElement) {
      const lockMessage = `Hi BR9ja Support, I lost access to this phone. Please help me lock my account${fallbackIdentity ? ` for ${fallbackIdentity}` : ''}.`;
      lockLink.href = config.whatsappNumber
        ? `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(lockMessage)}`
        : `${getBasePath()}/contact.html`;
      lockLink.setAttribute('target', '_blank');
      lockLink.setAttribute('rel', 'noreferrer');
    }

    const setPasswordMode = (isOpen) => {
      document.body.classList.toggle('login-password-open', Boolean(isOpen));
      if (fallbackToggle instanceof HTMLButtonElement) {
        fallbackToggle.textContent = isOpen ? 'Hide Password Login' : 'Use Password Instead';
      }
      if (isOpen && passwordInput instanceof HTMLInputElement) {
        window.requestAnimationFrame(() => passwordInput.focus());
      }
    };

    fallbackToggle?.addEventListener('click', () => {
      setPasswordMode(!document.body.classList.contains('login-password-open'));
    });

    setPasswordMode(false);
  };

  document.querySelectorAll('[data-toggle-password]').forEach((toggle) => {
    const applyToggleState = (active) => {
      const selector = toggle.dataset.togglePassword;
      const input = selector ? document.querySelector(selector) : null;
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      input.type = active ? 'text' : 'password';
      if (toggle instanceof HTMLButtonElement) {
        toggle.setAttribute('aria-pressed', active ? 'true' : 'false');
        toggle.setAttribute('aria-label', active ? 'Hide value' : 'Show value');
        const icon = toggle.querySelector('.field-inline-action__icon');
        if (icon) {
          icon.textContent = active ? '🙈' : '👁';
        }
      }
    };

    if (toggle instanceof HTMLButtonElement) {
      let active = false;
      toggle.addEventListener('click', () => {
        active = !active;
        applyToggleState(active);
      });
      return;
    }

    toggle.addEventListener('change', () => {
      applyToggleState(Boolean(toggle.checked));
    });
  });

  document.querySelectorAll('[data-form="auth-preview"]').forEach((form) => {
    const mode = form.dataset.authMode || 'login';
    const successNode =
      form.querySelector('[data-form-feedback]') || form.querySelector('.success-banner');

    if (mode === 'login') {
      initialiseReturningLoginMode(form);
    }

    if (mode === 'signup') {
      const pinInput = form.querySelector('input[name="pin"]');
      pinInput?.addEventListener('input', () => {
        pinInput.value = String(pinInput.value || '')
          .replace(/\D/g, '')
          .slice(0, 6);
        updateFieldState(pinInput);
      });
    }

    if (mode === 'signup') {
      const referralInput = form.querySelector('input[name="referralCode"]');
      if (referralInput && pendingReferralCode && !String(referralInput.value || '').trim()) {
        referralInput.value = pendingReferralCode;
        referralInput.closest('.field-shell')?.classList.add('field-shell--highlighted');
      }

      referralInput?.addEventListener('input', () => {
        const nextCode = String(referralInput.value || '').trim().toUpperCase();
        referralInput.value = nextCode;
        referralInput
          .closest('.field-shell')
          ?.classList.toggle('field-shell--highlighted', nextCode.length > 0);
        if (nextCode) {
          setStoredReferralCode(nextCode);
        }
      });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(form).entries());

        try {
          let result;
          try {
            if (window.location.protocol === 'file:') {
              throw new Error('preview-only');
            }
            result = await registerLiveUser({
              fullName: payload.fullName,
              username: payload.username,
              email: payload.email,
              phoneNumber: payload.phone,
              password: payload.password,
              pin: payload.pin,
              referralCode: payload.referralCode,
            });
          } catch (liveError) {
            if (
              window.location.protocol !== 'file:' &&
              !isApiUnavailableError(liveError)
            ) {
              throw liveError;
            }

            result = await registerPreviewUser({
              fullName: payload.fullName,
              username: payload.username,
              email: payload.email,
              phoneNumber: payload.phone,
              password: payload.password,
              confirmPassword: payload.confirmPassword,
              pin: payload.pin,
              referralCode: payload.referralCode,
            });
          }

          const user = result.user || result;
          showSuccess(
            successNode,
            result.maskedEmail
              ? `Code sent to ${result.maskedEmail}.`
              : `Code sent to ${user.email}.`
          );
          setStoredReferralCode('');
          setTimeout(() => {
            const query = new URLSearchParams({
              userId: user.id || result.userId || '',
              email: user.email || payload.email || '',
            });
            window.location.href = `${getBasePath()}/verify-email.html?${query.toString()}`;
          }, 300);
        } catch (error) {
          showSuccess(successNode, error.message);
        }
      });
      return;
    }

    const identityInput = form.querySelector('input[name="identity"]');
    if (identityInput && rememberedIdentity && !identityInput.value) {
      identityInput.value = rememberedIdentity;
      updateFieldState(identityInput);
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());

      try {
        let response;
        try {
          if (window.location.protocol === 'file:') {
            throw new Error('preview-only');
          }
          response = await loginLiveUser(payload.identity, payload.secret);
        } catch (liveError) {
          if (
            window.location.protocol !== 'file:' &&
            !isApiUnavailableError(liveError)
          ) {
            throw liveError;
          }
          response = {
            user: await loginPreviewUser(payload.identity, payload.secret),
          };
        }
        const user = response.user;
        bindWhatsAppVisibility();
        showSuccess(successNode, `Welcome back, ${user.firstName}.`);
        setTimeout(() => {
          window.location.href = getPostLoginDestination(user);
        }, 300);
      } catch (error) {
        showSuccess(successNode, error.message);
      }
    });
  });

  document.querySelectorAll('[data-quick-login]').forEach((button) => {
    button.addEventListener('click', async () => {
      const feedback = document.querySelector('[data-quick-login-feedback]');
      try {
        const method = button.dataset.quickLogin || 'device';
        let user;
        try {
          if (window.location.protocol === 'file:' || !getStoredRefreshToken()) {
            throw new Error('preview-only');
          }
          const response = await quickAccessLoginLive();
          user = response.user;
        } catch (liveError) {
          if (
            window.location.protocol !== 'file:' &&
            getStoredRefreshToken() &&
            !isApiUnavailableError(liveError)
          ) {
            throw liveError;
          }
          user = await quickAccessLogin(method);
        }
        showSuccess(
          feedback,
          `${formatModeLabel(method)} accepted.`
        );
        setTimeout(() => {
          window.location.href = getPostLoginDestination(user);
        }, 300);
      } catch (error) {
        showSuccess(feedback, error.message);
      }
    });
  });

  const resetForm = document.querySelector('[data-form="password-reset"]');
  if (resetForm) {
    const successNode = resetForm.querySelector('.success-banner');
    const sendButton = resetForm.querySelector('[data-reset-send]');
    const revealPanel = resetForm.querySelector('[data-reset-reveal]');
    const codeInput = resetForm.elements.code;
    const passwordInput = resetForm.elements.password;
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const urlCode = searchParams.get('code') || hashParams.get('code');
    const urlIdentity =
      searchParams.get('identity') || hashParams.get('identity');
    const storedChallenge = getStoredResetChallenge() || {};

    const revealResetStep = () => {
      revealPanel?.classList.add('is-visible');
      if (codeInput instanceof HTMLInputElement) {
        codeInput.required = true;
      }
      if (passwordInput instanceof HTMLInputElement) {
        passwordInput.required = true;
      }
    };

    if (urlCode && codeInput instanceof HTMLInputElement) {
      revealResetStep();
      codeInput.value = String(urlCode).trim().slice(0, 6);
      updateFieldState(codeInput);
    }

    if (resetForm.elements.identity instanceof HTMLInputElement) {
      resetForm.elements.identity.value =
        urlIdentity || storedChallenge.identity || resetForm.elements.identity.value;
    }

    sendButton?.addEventListener('click', async () => {
      const identity = String(resetForm.elements.identity?.value || '').trim();
      try {
        let challenge;
        try {
          if (window.location.protocol === 'file:') {
            throw new Error('preview-only');
          }
          challenge = await requestLivePasswordReset(identity);
        } catch (liveError) {
          if (
            window.location.protocol !== 'file:' &&
            !isApiUnavailableError(liveError)
          ) {
            throw liveError;
          }
          challenge = await startPasswordReset(identity);
        }
        revealResetStep();
        showSuccess(
          successNode,
          challenge.code
            ? `Code sent. Preview code: ${challenge.code}`
            : 'Reset code sent. Open the BR9ja link in your message to auto-fill the code.'
        );
        if (challenge.code && codeInput instanceof HTMLInputElement) {
          codeInput.value = String(challenge.code || '').trim();
          updateFieldState(codeInput);
        }
      } catch (error) {
        showSuccess(successNode, error.message);
      }
    });

    resetForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        try {
          if (window.location.protocol === 'file:') {
            throw new Error('preview-only');
          }
          await confirmLivePasswordReset({
            identity: resetForm.elements.identity?.value,
            code: resetForm.elements.code?.value,
            password: resetForm.elements.password?.value,
          });
        } catch (liveError) {
          if (
            window.location.protocol !== 'file:' &&
            !isApiUnavailableError(liveError)
          ) {
            throw liveError;
          }
          await completePasswordReset({
            code: resetForm.elements.code?.value,
            password: resetForm.elements.password?.value,
          });
        }
        showSuccess(successNode, 'Password reset complete.');
        setTimeout(() => {
          window.location.href = getPostLoginDestination(getStoredAuthUser());
        }, 300);
      } catch (error) {
        showSuccess(successNode, error.message);
      }
    });
  }

  document.querySelectorAll('[data-config-link="supportEmail"]').forEach((node) => {
    node.href = `mailto:${config.supportEmail}`;
  });
}

async function bindVerifyEmailPage() {
  if (getPageName() !== 'verify-email') {
    return;
  }

  const form = document.querySelector('[data-form="email-verification"]');
  if (!form) {
    return;
  }

  const successNode = form.querySelector('.success-banner');
  const resendButton = form.querySelector('[data-email-resend]');
  const codeInput = form.elements.code;
  const query = new URLSearchParams(window.location.search);
  const urlCode =
    query.get('code') ||
    new URLSearchParams(window.location.hash.replace(/^#/, '')).get('code');
  const storedChallenge = getStoredEmailVerificationChallenge() || {};
  const userId =
    query.get('userId') || storedChallenge.userId || '';
  const identityEmail =
    query.get('email') || storedChallenge.email || '';
  const maskedNode = document.querySelector('[data-verify-email]');

  if (maskedNode) {
    maskedNode.textContent =
      storedChallenge.maskedEmail || identityEmail || 'your email';
  }

  if (urlCode && codeInput instanceof HTMLInputElement) {
    codeInput.value = String(urlCode).trim().slice(0, 6);
    updateFieldState(codeInput);
  }

  resendButton?.addEventListener('click', async () => {
    try {
      let challenge;
      try {
        if (window.location.protocol === 'file:') {
          throw new Error('preview-only');
        }
        challenge = await resendLiveEmailVerification({
          userId,
          email: identityEmail,
        });
      } catch (liveError) {
        if (
          window.location.protocol !== 'file:' &&
          !isApiUnavailableError(liveError)
        ) {
          throw liveError;
        }
        challenge = await startPreviewEmailVerification(identityEmail);
      }

      if (maskedNode && challenge.maskedEmail) {
        maskedNode.textContent = challenge.maskedEmail;
      }
      showSuccess(
        successNode,
        challenge.code
          ? `Code sent. Preview code: ${challenge.code}. It expires in 10 minutes.`
          : 'A fresh verification code is on the way. It expires in 10 minutes.'
      );
    } catch (error) {
      showSuccess(successNode, error.message);
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      let verification;
      try {
        if (window.location.protocol === 'file:') {
          throw new Error('preview-only');
        }
        verification = await verifyLiveEmailCode({
          userId,
          code: form.elements.code?.value,
        });
      } catch (liveError) {
        if (
          window.location.protocol !== 'file:' &&
          !isApiUnavailableError(liveError)
        ) {
          throw liveError;
        }
        verification = await completePreviewEmailVerification(
          userId,
          form.elements.code?.value
        );
      }

      showSuccess(
        successNode,
        buildRewardStepMessage(
          verification?.br9GoldGranted || 100,
          verification?.br9GoldUnlockDate || verification?.goldUnlockDate,
          'Email verified. You can log in now.'
        )
      );
      setTimeout(() => {
        window.location.href = `${getBasePath()}/login.html`;
      }, 300);
    } catch (error) {
      showSuccess(successNode, error.message);
    }
  });
}

async function bindSecureAccountPage() {
  if (getPageName() !== 'secure-account') {
    return;
  }

  let user = getStoredAuthUser();
  if (!user) {
    if (window.location.protocol !== 'file:' && getStoredRefreshToken()) {
      try {
        const response = await quickAccessLoginLive();
        user = response.user;
      } catch (_error) {
        clearStoredAuthUser();
      }
    }
  }

  if (!user) {
    window.location.href = `${getBasePath()}/login.html`;
    return;
  }

  if (user.phoneVerified) {
    window.location.href = `${getBasePath()}/profile.html`;
    return;
  }

  const successNode = document.querySelector('[data-secure-account-feedback]');
  const codeInput = document.querySelector('[data-secure-account-code]');
  const maskedPhoneNodes = document.querySelectorAll('[data-secure-phone]');
  maskedPhoneNodes.forEach((node) => {
    node.textContent = user.phoneNumber || '';
  });

  document.querySelectorAll('[data-phone-send-channel]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const channel = button.dataset.phoneSendChannel || 'sms';
        let challenge;
        try {
          if (window.location.protocol === 'file:') {
            throw new Error('preview-only');
          }
          challenge = await requestLivePhoneVerification(channel);
        } catch (liveError) {
          if (
            window.location.protocol !== 'file:' &&
            !isApiUnavailableError(liveError)
          ) {
            throw liveError;
          }
          challenge = await startPhoneVerification(user.id);
        }

        showSuccess(
          successNode,
          challenge.devCode || challenge.code
            ? `Code sent. Preview code: ${
                challenge.devCode || challenge.code
              }. It expires in 10 minutes.`
            : `A verification code was sent via ${formatModeLabel(
                channel
              )}. It expires in 10 minutes.`
        );
      } catch (error) {
        showSuccess(successNode, error.message);
      }
    });
  });

  document.querySelector('[data-secure-account-verify]')?.addEventListener('click', async () => {
    try {
      let updatedUser;
      try {
        if (window.location.protocol === 'file:') {
          throw new Error('preview-only');
        }
        updatedUser = await confirmLivePhoneVerification(codeInput?.value || '');
      } catch (liveError) {
        if (
          window.location.protocol !== 'file:' &&
          !isApiUnavailableError(liveError)
        ) {
          throw liveError;
        }
        updatedUser = await completePhoneVerification(user.id, codeInput?.value || '');
      }

      showSuccess(
        successNode,
        buildRewardStepMessage(
          100,
          updatedUser?.goldUnlockDate,
          'Phone verified. Your dashboard is now fully open.'
        )
      );
      setTimeout(() => {
        window.location.href = `${getBasePath()}/profile.html`;
      }, 300);
      return updatedUser;
    } catch (error) {
      showSuccess(successNode, error.message);
      return null;
    }
  });
}

async function bindProfilePage(config) {
  if (getPageName() !== 'profile') {
    return;
  }

  const query = (() => {
    try {
      return new URLSearchParams(window.location.search);
    } catch (_error) {
      return new URLSearchParams();
    }
  })();
  const previewPendingMode = query.get('previewPending') === '1';
  let user = getStoredAuthUser();
  if (!user && window.location.protocol === 'file:' && previewPendingMode) {
    user = serialiseAuthUser({
      id: 'preview-pending-user',
      firstName: 'Stanley',
      lastName: 'Kings',
      fullName: 'Stanley Kings',
      username: 'stankings',
      bayrightTag: '@stankings',
      email: 'stanley@br9.ng',
      phoneNumber: '08012345678',
      phoneVerified: true,
      walletBalance: 56390.26,
      br9GoldBalance: 0,
      br9GoldLockedBalance: 500,
      br9GoldTotal: 500,
      br9GoldLocked: true,
      goldDaysRemaining: 30,
      goldUnlockDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      br9GoldPreviewDiscount: {
        sampleAmount: 1000,
        discountAmount: 20,
        payAmount: 980,
      },
      isVerified: true,
      firstLoginCompleted: true,
      referralCode: 'STANKINGS',
      referralLink: `${DEFAULT_CONFIG.siteUrl.replace(/\/$/, '')}/signup?ref=STANKINGS`,
      successfulTransactionCount: 7,
      partnerBank: {
        name: DEFAULT_CONFIG.partnerBankName,
        signupUrl: DEFAULT_CONFIG.partnerBankSignupUrl,
        referralCode: DEFAULT_CONFIG.partnerBankReferralCode,
        referralLink: DEFAULT_CONFIG.partnerBankReferralLink,
        note: DEFAULT_CONFIG.partnerBankNote,
        settlementBankName: DEFAULT_CONFIG.partnerBankSettlementBankName,
        settlementAccountName: DEFAULT_CONFIG.partnerBankSettlementAccountName,
        settlementAccountNumber: DEFAULT_CONFIG.partnerBankSettlementAccountNumber,
      },
      virtualAccount: buildPreviewVirtualAccount({
        fullName: 'Stanley Kings',
        phoneNumber: '08012345678',
      }),
      transactions: [],
    });
    setStoredAuthUser(user);
  }
  if (!user && window.location.protocol !== 'file:' && getStoredRefreshToken()) {
    try {
      const refreshed = await quickAccessLoginLive();
      user = refreshed.user;
    } catch (_error) {
      clearStoredAuthUser();
    }
  }

  if (!user) {
    window.location.href = `${getBasePath()}/login.html`;
    return;
  }

  if (window.location.protocol !== 'file:' && getStoredAccessToken()) {
    try {
      const liveProfile = await fetchLiveProfile();
      user = mapApiUserProfile(liveProfile);
      setStoredAuthUser(user);
    } catch (_error) {
      // Fall back to the stored user if the API is temporarily unavailable.
    }
  }

  if (
    window.location.protocol !== 'file:' &&
    getStoredAccessToken() &&
    String(user.role || '').toLowerCase() === 'reseller'
  ) {
    try {
      const resellerLedger = await requestJson('/api/user/reseller-ledger', {
        method: 'GET',
        auth: true,
      });
      user = serialiseAuthUser({
        ...user,
        resellerSavingsMonthToDate: Number(resellerLedger.data?.totalSavings || 0),
      });
      setStoredAuthUser(user);
    } catch (_error) {
      // Keep the last saved reseller snapshot if the ledger API is unavailable.
    }
  }

  if (!user.phoneVerified) {
    window.location.href = `${getBasePath()}/secure-account.html`;
    return;
  }

  const virtualAccount = user.virtualAccount || buildPreviewVirtualAccount(user);
  const isVerifiedAccount = Boolean(user.isVerified);
  const restrictedMode =
    Boolean(user.restrictedMode) ||
    (Number(user.walletBalance || 0) <= 0 && !Boolean(user.isVerified));
  const goldTotal = Number(user.br9GoldTotal || 0);
  const goldLocked = Boolean(user.br9GoldLocked);
  const goldDaysRemaining = Number(user.goldDaysRemaining || 0);
  const goldUnlockDate = user.goldUnlockDate ? new Date(user.goldUnlockDate) : null;
  const goldPreview = user.br9GoldPreviewDiscount || {
    sampleAmount: 1000,
    discountAmount: 0,
    payAmount: 1000,
  };

  const profileMap = {
    firstName: user.firstName || 'BR9ja User',
    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    username: user.bayrightTag || `@${user.username || 'member'}`,
    email: user.email || 'No email stored yet',
    phoneNumber: user.phoneNumber || 'No phone number saved yet',
    phoneStatus: user.phoneVerified ? 'Verified' : 'Verification pending',
    verificationState: isVerifiedAccount ? 'Verified Account' : 'Awaiting first bank-name lock',
    referralCode: user.referralCode || 'No code yet',
    referralLink: user.referralLink || `${DEFAULT_CONFIG.siteUrl.replace(/\/$/, '')}/signup`,
    virtualBankName: virtualAccount.bankName,
    virtualAccountNumber: virtualAccount.accountNumber,
    virtualAccountName: virtualAccount.accountName,
    virtualProviderLabel:
      virtualAccount.provider === 'squad' || virtualAccount.provider === 'squad-demo'
        ? 'Squad • GTBank'
        : formatModeLabel(virtualAccount.provider || 'squad'),
    virtualAccountStatus:
      virtualAccount.recommended || virtualAccount.status === 'active'
        ? 'Recommended'
        : formatModeLabel(virtualAccount.status || 'pending'),
    walletBalance: formatCurrency(user.walletBalance || 0),
    br9GoldTotal: `${goldTotal.toLocaleString()} BR9 Gold`,
    br9GoldState: goldLocked
      ? `Locked • ${goldDaysRemaining} day${goldDaysRemaining === 1 ? '' : 's'} left`
      : 'Ready to spend',
    quickAccess: user.firstLoginCompleted ? 'Ready.' : 'Password first.',
    successfulTransactionCount: Number(user.successfulTransactionCount || 0).toLocaleString(),
  };

  document.querySelectorAll('[data-profile]').forEach((node) => {
    const key = node.dataset.profile;
    if (key && profileMap[key] !== undefined) {
      node.textContent = profileMap[key];
    }
  });

  document.querySelectorAll('[data-phone-verification-state]').forEach((node) => {
    node.classList.toggle('is-verified', user.phoneVerified);
  });

  document.querySelectorAll('[data-profile-badge]').forEach((node) => {
    node.classList.toggle('is-hidden', !isVerifiedAccount);
  });

  document.querySelectorAll('[data-phone-verification-state]').forEach((node) => {
    node.classList.add('is-hidden');
  });

  const restrictedBanner = document.querySelector('[data-restricted-banner]');
  if (restrictedBanner) {
    restrictedBanner.classList.toggle('is-hidden', !restrictedMode);
  }

  document.querySelectorAll('[data-restricted-action]').forEach((node) => {
    const lockedMessage =
      'Complete your first verified funding to unlock this action.';
    node.classList.toggle('is-disabled', restrictedMode);
    if (node instanceof HTMLButtonElement) {
      node.disabled = restrictedMode;
    }
    if (restrictedMode) {
      node.setAttribute('title', lockedMessage);
      return;
    }
    node.removeAttribute('title');
  });

  document.querySelectorAll('[data-dashboard-action]').forEach((node) => {
    node.classList.remove('is-disabled');
    if (restrictedMode) {
      node.setAttribute('title', 'Browse services now. Fund your wallet to activate checkout.');
    } else {
      node.removeAttribute('title');
    }
  });

  document.querySelectorAll('[data-gold-preview]').forEach((node) => {
    if (goldPreview.discountAmount > 0) {
      node.textContent = `Preview: pay ${formatCurrency(goldPreview.payAmount)} instead of ${formatCurrency(
        goldPreview.sampleAmount
      )} using BR9 Gold once unlocked.`;
      return;
    }
    node.textContent = 'Browse first. Fund once to activate checkout and BR9 Gold discounts.';
  });

  const goldChip = document.querySelector('[data-gold-chip]');
  const goldLock = document.querySelector('[data-gold-lock]');
  const goldEmptyState = document.querySelector('[data-gold-empty-state]');
  const goldModal = document.querySelector('[data-gold-modal]');
  const goldModalTitle = document.querySelector('[data-gold-modal-title]');
  const goldModalBody = document.querySelector('[data-gold-modal-body]');
  const shouldPulseGold = Number(user.walletBalance || 0) <= 0 && goldTotal > 0;

  if (goldChip) {
    goldChip.classList.toggle('is-pulsing', shouldPulseGold);
    goldChip.title = shouldPulseGold
      ? `🔥 You have ${goldTotal} BR9 Gold! Fund your wallet to start using your rewards for discounts.`
      : goldLocked
        ? `Your BR9 Gold unlocks in ${goldDaysRemaining} day${goldDaysRemaining === 1 ? '' : 's'}.`
        : 'Tap to view your BR9 Gold status.';
  }

  if (goldLock) {
    goldLock.classList.toggle('is-hidden', !goldLocked);
  }

  if (goldEmptyState) {
    goldEmptyState.classList.toggle('is-hidden', !shouldPulseGold);
    if (shouldPulseGold) {
      goldEmptyState.textContent = `🔥 You have ${goldTotal} BR9 Gold! Fund your wallet to start using your rewards for discounts.`;
    }
  }

  if (goldModalTitle && goldModalBody) {
    goldModalTitle.textContent = `You've earned ${goldTotal.toLocaleString()} BR9 Gold!`;
    if (goldLocked && goldUnlockDate) {
      goldModalBody.textContent = `This reward unlocks on ${goldUnlockDate.toLocaleDateString()} once you've been part of the family for 30 days. Keep funding and enjoying cheap data in the meantime.`;
    } else {
      goldModalBody.textContent = 'Your BR9 Gold is ready for internal service discounts. 10 BR9 Gold equals ₦1, and up to 5% of an eligible internal payment can be covered with BR9 Gold.';
    }
  }

  goldChip?.addEventListener('click', () => {
    goldModal?.classList.remove('is-hidden');
    goldModal?.setAttribute('aria-hidden', 'false');
  });

  document.querySelectorAll('[data-gold-modal-close]').forEach((node) => {
    node.addEventListener('click', () => {
      goldModal?.classList.add('is-hidden');
      goldModal?.setAttribute('aria-hidden', 'true');
    });
  });

  const fundingFeedback = document.querySelector('[data-funding-feedback]');
  const copyButton = document.querySelector('[data-virtual-copy]');
  const refundButton = document.querySelector('[data-funding-refund]');
  const referralFeedback = document.querySelector('[data-referral-feedback]');
  const referralCodeCopy = document.querySelector('[data-referral-copy-code]');
  const referralLinkCopy = document.querySelector('[data-referral-copy-link]');

  copyButton?.addEventListener('click', async () => {
    try {
      const copyLines = [
        `Bank: ${virtualAccount.bankName}`,
        `Account Number: ${virtualAccount.accountNumber}`,
        `Account Name: ${virtualAccount.accountName}`,
      ];

      if (!navigator.clipboard?.writeText) {
        throw new Error('clipboard-unavailable');
      }

      await navigator.clipboard.writeText(copyLines.join('\n'));

      showSuccess(
        fundingFeedback,
        'Funding details copied. Transfer to this GTBank account to credit your BR9ja wallet.'
      );
    } catch (_error) {
      showSuccess(
        fundingFeedback,
        'Copy not available here. Use the GTBank account details shown on this screen.'
      );
    }
  });

  refundButton?.addEventListener('click', () => {
    const message = `Hi BR9ja Support, I made a mistake in my deposit into ${virtualAccount.accountNumber}. Kindly help me review the refund request.`;
    const refundUrl = buildWhatsAppSupportUrl(config, message);
    window.open(refundUrl, '_blank', 'noopener,noreferrer');
  });

  referralCodeCopy?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(String(user.referralCode || '').trim());
      showSuccess(referralFeedback, 'Referral code copied.');
    } catch (_error) {
      showSuccess(referralFeedback, 'Copy is not available here. Use the referral code shown on screen.');
    }
  });

  referralLinkCopy?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(String(user.referralLink || '').trim());
      showSuccess(referralFeedback, 'Referral link copied.');
    } catch (_error) {
      showSuccess(referralFeedback, 'Copy is not available here. Use the referral link shown on screen.');
    }
  });

  const partnerBankConfig = {
    name:
      user.partnerBank?.name ||
      config.partnerBankName ||
      DEFAULT_CONFIG.partnerBankName,
    signupUrl:
      user.partnerBank?.signupUrl ||
      config.partnerBankSignupUrl ||
      DEFAULT_CONFIG.partnerBankSignupUrl,
    referralCode:
      user.partnerBank?.referralCode ||
      config.partnerBankReferralCode ||
      DEFAULT_CONFIG.partnerBankReferralCode,
    referralLink:
      user.partnerBank?.referralLink ||
      config.partnerBankReferralLink ||
      DEFAULT_CONFIG.partnerBankReferralLink,
    note:
      user.partnerBank?.note ||
      config.partnerBankNote ||
      DEFAULT_CONFIG.partnerBankNote,
    settlementBankName:
      user.partnerBank?.settlementBankName ||
      config.partnerBankSettlementBankName ||
      DEFAULT_CONFIG.partnerBankSettlementBankName,
    settlementAccountName:
      user.partnerBank?.settlementAccountName ||
      config.partnerBankSettlementAccountName ||
      DEFAULT_CONFIG.partnerBankSettlementAccountName,
    settlementAccountNumber:
      user.partnerBank?.settlementAccountNumber ||
      config.partnerBankSettlementAccountNumber ||
      DEFAULT_CONFIG.partnerBankSettlementAccountNumber,
  };

  document.querySelectorAll('[data-partner-bank]').forEach((node) => {
    const key = node.dataset.partnerBank;
    if (!key || partnerBankConfig[key] === undefined) {
      return;
    }
    node.textContent = partnerBankConfig[key] || 'Not configured';
  });

  const partnerBankFeedback = document.querySelector('[data-partner-bank-feedback]');
  const partnerBankOpen = document.querySelector('[data-partner-bank-open]');
  const partnerBankCopyLink = document.querySelector('[data-partner-bank-copy-link]');
  const partnerBankCopyCode = document.querySelector('[data-partner-bank-copy-code]');

  partnerBankOpen?.addEventListener('click', () => {
    if (!partnerBankConfig.signupUrl) {
      showSuccess(partnerBankFeedback, 'Add the partner bank signup link in admin first.');
      return;
    }
    window.open(partnerBankConfig.signupUrl, '_blank', 'noopener,noreferrer');
  });

  partnerBankCopyLink?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(String(partnerBankConfig.referralLink || '').trim());
      showSuccess(partnerBankFeedback, 'Partner bank referral link copied.');
    } catch (_error) {
      showSuccess(partnerBankFeedback, 'Copy is not available here. Use the referral link shown on screen.');
    }
  });

  partnerBankCopyCode?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(String(partnerBankConfig.referralCode || '').trim());
      showSuccess(partnerBankFeedback, 'Partner bank referral code copied.');
    } catch (_error) {
      showSuccess(partnerBankFeedback, 'Copy is not available here. Use the referral code shown on screen.');
    }
  });

  const partnerFeedback = document.querySelector('[data-partner-feedback]');
  const partnerActivate = document.querySelector('[data-partner-activate]');
  const partnerShare = document.querySelector('[data-partner-share]');
  const cashoutButtons = document.querySelectorAll('[data-cashout-rewards]');
  const goldWalletInput = document.querySelector('[data-gold-wallet-input]');
  const goldWalletFeedback = document.querySelector('[data-gold-wallet-feedback]');
  const dashboardGameLaunchers = document.querySelectorAll('[data-dashboard-game-launch]');
  const gameModeTitle = document.querySelector('[data-game-mode-title]');
  const gameModeCopy = document.querySelector('[data-game-mode-copy]');
  const gameModeBadge = document.querySelector('[data-game-mode-badge]');
  const gamePrimaryLine = document.querySelector('[data-game-primary-line]');
  const gameBonusNote = document.querySelector('[data-game-bonus-note]');
  const gameFeedback = document.querySelector('[data-game-feedback]');
  const gameAdBoost = document.querySelector('[data-game-ad-boost]');
  const profileTransactionFeedback = document.querySelector('[data-profile-transaction-feedback]');
  const transactionTable = document.querySelector('[data-profile-transactions-table]');
  const livePulseTrack = document.querySelector('[data-live-pulse-track]');
  const pendingOverlay = document.querySelector('[data-pending-overlay]');
  const pendingOverlayBody = document.querySelector('[data-pending-overlay-body]');
  const pendingOverlayTimer = document.querySelector('[data-pending-overlay-timer]');
  const pendingOverlayFeedback = document.querySelector('[data-pending-overlay-feedback]');
  const pendingOverlayStatus = document.querySelector('[data-pending-overlay-status]');
  const pendingSupportButton = document.querySelector('[data-pending-support]');
  const pendingRefreshButton = document.querySelector('[data-pending-refresh]');
  const pendingPlayButton = document.querySelector('[data-pending-play]');
  const pendingInstantRefundButton = document.querySelector('[data-pending-instant-refund]');
  const pendingGame = document.querySelector('[data-pending-game]');
  const pendingGameScore = document.querySelector('[data-pending-game-score]');
  const pendingGameFeedback = document.querySelector('[data-pending-game-feedback]');
  const pendingGameStatus = document.querySelector('[data-pending-game-status]');
  const pendingRunner = document.querySelector('[data-pending-runner]');
  const pendingJump = document.querySelector('[data-pending-jump]');
  let pendingOverlayRow = null;
  let pendingOverlayTimerId = 0;
  let profilePollId = 0;
  let livePulsePollId = 0;
  let pendingGameScoreValue = 0;
  let lastTransactionStatusMap = new Map();
  const notifiedPendingReview = new Set();
  const currentGameMode = getCurrentGameMode();

  if (gameModeTitle) {
    gameModeTitle.textContent = currentGameMode.label;
  }
  if (gameModeCopy) {
    gameModeCopy.textContent = currentGameMode.description;
  }
  if (gameModeBadge) {
    gameModeBadge.textContent = currentGameMode.badge;
  }
  if (gamePrimaryLine) {
    gamePrimaryLine.textContent = currentGameMode.headline;
  }
  if (gameBonusNote) {
    gameBonusNote.textContent =
      Number(user.successfulTransactionCount || 0) > 0
        ? 'Utility Bonus Applied! ⚡ Your daily service activity keeps your game reward posture stronger.'
        : 'Make at least one utility payment today to unlock the service bonus multiplier.';
  }
  if (gameAdBoost) {
    gameAdBoost.classList.toggle('is-hidden', !currentGameMode.showAdMultiplier);
  }

  const renderProfileTransactions = (rows = []) => {
    if (!transactionTable) {
      return;
    }

    transactionTable.innerHTML = rows.length
      ? rows
          .map(
            (row) => `
              <tr>
                <td>
                  <strong>${escapeHtml(row.service || row.type || '')}</strong>
                  <div class="mini-note">${escapeHtml(row.reference || '')}</div>
                </td>
                <td>${formatCurrency(Number(row.amount || 0))}</td>
                <td>${escapeHtml(formatModeLabel(row.status || 'pending'))}</td>
                <td>${new Date(row.createdAt || row.timestamp || Date.now()).toLocaleString()}</td>
                <td>
                  <div class="admin-action-grid">
                    ${
                      String(row.status || '').toLowerCase() === 'success'
                        ? `<button class="ghost-button admin-row-action" type="button" data-profile-receipt="${escapeHtml(row.id || '')}">Download Receipt</button>`
                        : ''
                    }
                    ${
                      String(row.status || '').toLowerCase() === 'failed'
                        ? `<a class="ghost-button admin-row-action" href="${getBasePath()}/services.html?retry=${encodeURIComponent(
                            row.id || ''
                          )}">Retry</a>`
                        : ''
                    }
                    ${
                      String(row.status || '').toLowerCase() === 'pending_verification'
                        ? `<button class="ghost-button admin-row-action" type="button" data-profile-refresh-status="${escapeHtml(
                            row.id || ''
                          )}">Refresh Status</button>`
                        : ''
                    }
                    ${
                      ['pending_verification', 'pending_review'].includes(
                        String(row.status || '').toLowerCase()
                      )
                        ? `<a class="ghost-button admin-row-action" href="${escapeHtml(
                            buildWhatsAppSupportUrl(config, buildPendingSupportMessage(row))
                          )}" target="_blank" rel="noopener noreferrer" data-profile-contact-support="${escapeHtml(
                            row.id || ''
                          )}">Contact Support</a>`
                        : ''
                    }
                    ${
                      String(row.status || '').toLowerCase() === 'pending_verification' &&
                      Date.now() - new Date(row.createdAt || row.timestamp || Date.now()).getTime() >= 5 * 60 * 1000
                        ? `<button class="ghost-button admin-row-action danger-button" type="button" data-profile-instant-refund="${escapeHtml(
                            row.id || ''
                          )}">Request Instant Refund</button>`
                        : ''
                    }
                  </div>
                </td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="5">No completed transactions yet.</td></tr>';
  };

  const renderLivePulse = (rows = []) => {
    renderTickerItems(
      livePulseTrack,
      rows,
      'BR9ja activity will appear here as soon as users complete services.'
    );
  };

  const loadLivePulse = async () => {
    if (window.location.protocol === 'file:') {
      renderLivePulse([
        { message: 'Someone just bought 1GB MTN Data ⚡' },
        { message: 'New High Score on Market Runner! 🏃' },
      ]);
      return;
    }

    try {
      const data = await requestJson('/api/site/live-pulse', {
        method: 'GET',
      });
      renderLivePulse(Array.isArray(data.data) ? data.data : data);
    } catch (_error) {
      renderLivePulse([]);
    }
  };

  const hidePendingOverlay = () => {
    if (!pendingOverlay) {
      return;
    }
    pendingOverlay.classList.add('is-hidden');
    pendingOverlay.setAttribute('aria-hidden', 'true');
    if (pendingOverlayTimerId) {
      window.clearInterval(pendingOverlayTimerId);
      pendingOverlayTimerId = 0;
    }
  };

  const updatePendingOverlay = (row) => {
    if (!pendingOverlay || !row) {
      return;
    }

    pendingOverlayRow = row;
    pendingOverlay.classList.remove('is-hidden');
    pendingOverlay.setAttribute('aria-hidden', 'false');
    if (pendingOverlayBody) {
      pendingOverlayBody.textContent =
        'Network is taking a breath! ⏳ We are securing your delivery. Want to kill time and earn Gold?';
    }
    if (pendingOverlayStatus) {
      pendingOverlayStatus.textContent = `Live connection active • ${row.service || row.type || 'Transaction'}`;
    }
    if (pendingGameStatus) {
      pendingGameStatus.innerHTML = `<span class="pending-live-dot"></span><strong>Verifying ${escapeHtml(
        row.service || row.type || 'Transaction'
      )}</strong>`;
    }
    if (pendingSupportButton) {
      pendingSupportButton.classList.remove('is-hidden');
      pendingSupportButton.href = buildWhatsAppSupportUrl(
        config,
        buildPendingSupportMessage(row)
      );
    }
    pendingRefreshButton?.classList.remove('is-hidden');
    pendingPlayButton?.classList.remove('is-hidden');
    if (pendingPlayButton) {
      pendingPlayButton.textContent = 'Play Market Runner';
    }
    if (pendingInstantRefundButton) {
      const shouldShow =
        Date.now() - new Date(row.createdAt || row.timestamp || Date.now()).getTime() >=
        5 * 60 * 1000;
      pendingInstantRefundButton.classList.toggle('is-hidden', !shouldShow);
    }
    pendingGame?.classList.remove('is-success');
    if (pendingOverlayTimerId) {
      window.clearInterval(pendingOverlayTimerId);
    }
    const tick = () => {
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(row.createdAt || row.timestamp || Date.now()).getTime()) / 1000
      );
      if (pendingOverlayTimer) {
        pendingOverlayTimer.textContent = `${formatDurationClock(elapsedSeconds)} elapsed`;
      }
      if (pendingGameStatus) {
        pendingGameStatus.innerHTML = `<span class="pending-live-dot"></span><strong>Verifying • ${formatDurationClock(
          elapsedSeconds
        )}</strong>`;
      }
    };
    tick();
    pendingOverlayTimerId = window.setInterval(tick, 1000);
  };

  const maybeNotifyPendingReview = (rows = []) => {
    rows.forEach((row) => {
      if (String(row.status || '').toLowerCase() !== 'pending_review') {
        return;
      }
      if (notifiedPendingReview.has(row.id)) {
        return;
      }
      notifiedPendingReview.add(row.id);
      showToast(
        "Verification in progress. We're double-checking your delivery with the network provider. Hang tight!",
        'info'
      );
    });
  };

  const syncProfileTransactions = (rows = []) => {
    renderProfileTransactions(rows);
    maybeNotifyPendingReview(rows);
    const nextStatusMap = new Map(
      rows.map((row) => [row.id, String(row.status || '').toLowerCase()])
    );

    rows.forEach((row) => {
      const previousStatus = lastTransactionStatusMap.get(row.id);
      const nextStatus = String(row.status || '').toLowerCase();
      if (previousStatus && previousStatus !== nextStatus && nextStatus === 'success') {
        showToast('🎉 BOOM! Transaction Successful! +10 Bonus Gold for your patience.', 'success');
        playChime('success');
        if (pendingGame && !pendingGame.classList.contains('is-hidden') && pendingGameFeedback) {
          pendingGame.classList.add('is-success');
          showSuccess(
            pendingGameFeedback,
            '🎉 BOOM! Transaction Successful! +10 Bonus Gold for your patience.'
          );
          window.setTimeout(() => pendingGame.classList.remove('is-success'), 2400);
        }
      }
    });

    lastTransactionStatusMap = nextStatusMap;
    const firstPending = rows.find(
      (row) => String(row.status || '').toLowerCase() === 'pending_verification'
    );
    if (firstPending) {
      updatePendingOverlay(firstPending);
    } else {
      hidePendingOverlay();
    }
  };

  const refreshProfileSnapshot = async () => {
    if (window.location.protocol === 'file:' || !getStoredAccessToken()) {
      return;
    }

    const refreshedProfile = await fetchLiveProfile();
    user = mapApiUserProfile(refreshedProfile);
    setStoredAuthUser(user);
    syncProfileTransactions(Array.isArray(user.transactions) ? user.transactions : []);
  };

  const openStandaloneGameOverlay = () => {
    if (!pendingOverlay) {
      return;
    }
    pendingOverlayRow = null;
    pendingOverlay.classList.remove('is-hidden');
    pendingOverlay.setAttribute('aria-hidden', 'false');
    pendingRefreshButton?.classList.add('is-hidden');
    pendingSupportButton?.classList.add('is-hidden');
    pendingInstantRefundButton?.classList.add('is-hidden');
    if (pendingOverlayBody) {
      pendingOverlayBody.textContent =
        'Network is clear. ⏳ Your BR9ja game lane is ready, and the app will keep your wallet posture in view while you play.';
    }
    if (pendingOverlayStatus) {
      pendingOverlayStatus.textContent = `${currentGameMode.label} • Practice live`;
    }
    if (pendingOverlayTimer) {
      pendingOverlayTimer.textContent = 'Practice mode';
    }
    if (pendingGameStatus) {
      pendingGameStatus.innerHTML = `<span class="pending-live-dot"></span><strong>${escapeHtml(
        currentGameMode.label
      )} live</strong>`;
    }
    if (pendingPlayButton) {
      pendingPlayButton.textContent = currentGameMode.primaryActionLabel;
    }
    pendingGame?.classList.remove('is-hidden', 'is-success');
    if (pendingGameFeedback) {
      showSuccess(
        pendingGameFeedback,
        `${currentGameMode.label} is open. Tap Jump to keep the lane moving.`
      );
    }
    if (pendingOverlayTimerId) {
      window.clearInterval(pendingOverlayTimerId);
      pendingOverlayTimerId = 0;
    }
  };

  const partnerMap = {
    partnerRole:
      String(user.role || '').toLowerCase() === 'reseller' ? 'Partner' : 'User',
    partnerTier: formatModeLabel(user.resellerTier || 'bronze'),
    partnerSavings: formatCurrency(Number(user.resellerSavingsMonthToDate || 0)),
    partnerActivationFee: formatCurrency(Number(user.resellerActivationFee || 2500)),
  };

  document.querySelectorAll('[data-profile]').forEach((node) => {
    const key = node.dataset.profile;
    if (key && partnerMap[key] !== undefined) {
      node.textContent = partnerMap[key];
    }
  });

  if (partnerActivate) {
    const isReseller = String(user.role || '').toLowerCase() === 'reseller';
    partnerActivate.textContent =
      isReseller ? 'Partner Active' : 'Become a Partner';
    partnerActivate.disabled = isReseller || restrictedMode;
  }

  partnerActivate?.addEventListener('click', async () => {
    try {
      if (window.location.protocol === 'file:') {
        throw new Error(
          `Partner activation needs the live API. Fund at least ${formatCurrency(
            Number(user.resellerActivationFee || 2500)
          )} and open the deployed dashboard.`
        );
      }
      const result = await requestJson('/api/user/become-partner', {
        method: 'POST',
        auth: true,
        payload: {},
      });
      const refreshed = await fetchLiveProfile();
      const nextUser = mapApiUserProfile(refreshed);
      setStoredAuthUser(nextUser);
      showSuccess(
        partnerFeedback,
        result.message || 'Partner profile activated successfully.'
      );
      window.setTimeout(() => window.location.reload(), 250);
    } catch (error) {
      showSuccess(partnerFeedback, error.message);
    }
  });

  partnerShare?.addEventListener('click', async () => {
    const inviteMessage =
      user.partnerInviteMessage ||
      `Join my BR9ja Network and buy Data at wholesale prices! ${String(
        user.referralLink || ''
      ).trim()}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join my BR9ja Network',
          text: inviteMessage,
        });
        showSuccess(partnerFeedback, 'Invite sheet opened.');
        return;
      }
      await navigator.clipboard.writeText(inviteMessage);
      showSuccess(partnerFeedback, 'Partner invite copied.');
    } catch (_error) {
      showSuccess(partnerFeedback, 'Share is not available here. Copy the referral link instead.');
    }
  });

  cashoutButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      if (restrictedMode) {
        showSuccess(
          goldWalletFeedback,
          'Complete your first verified funding to unlock reward cashout.'
        );
        return;
      }

      const requestedGold =
        Number(goldWalletInput?.value || 0) || Number(user.br9GoldBalance || 0);
      if (!requestedGold || requestedGold <= 0) {
        showSuccess(goldWalletFeedback, 'Enter how much BR9 Gold you want to cash out.');
        return;
      }

      try {
        if (window.location.protocol === 'file:') {
          throw new Error(
            `Live cashout uses the backend. Current rule: more than ${Number(
              config.goldToWalletMinimumSuccessfulTransactions || 5
            )} successful service transactions are required.`
          );
        }

        const result = await requestJson('/api/user/gold-to-wallet', {
          method: 'POST',
          auth: true,
          payload: {
            goldAmount: requestedGold,
          },
        });

        showSuccess(
          goldWalletFeedback,
          result.message || 'BR9 Gold moved into your wallet successfully.'
        );
        await refreshProfileSnapshot();
        window.setTimeout(() => window.location.reload(), 350);
      } catch (error) {
        showSuccess(goldWalletFeedback, error.message);
      }
    });
  });

  dashboardGameLaunchers.forEach((button) => {
    button.addEventListener('click', () => {
      openStandaloneGameOverlay();
    });
  });

  gameAdBoost?.addEventListener('click', async () => {
    try {
      if (window.location.protocol === 'file:') {
        throw new Error(
          'Saturday boost preview is active here. The live ad multiplier logs revenue once the backend is connected.'
        );
      }
      const result = await requestJson('/api/games/ad-watch', {
        method: 'POST',
        auth: true,
        payload: {
          source: 'saturday_multiplier',
          revenueAmount: 15,
        },
      });
      showSuccess(
        gameFeedback,
        result.message || 'Saturday ad multiplier recorded successfully.'
      );
    } catch (error) {
      showSuccess(gameFeedback, error.message);
    }
  });

  document.querySelectorAll('.user-bottom-nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.user-bottom-nav__link').forEach((node) => {
        node.classList.remove('is-active');
      });
      link.classList.add('is-active');
    });
  });

  syncProfileTransactions(Array.isArray(user.transactions) ? user.transactions : []);
  if (previewPendingMode) {
    const previewTimestamp = new Date(Date.now() - 6 * 60 * 1000).toISOString();
    syncProfileTransactions([
      {
        id: 'preview-pending-1',
        service: 'MTN 1GB Data',
        type: 'Data',
        amount: 290,
        reference: 'BR9-PENDING-DEMO',
        status: 'pending_verification',
        createdAt: previewTimestamp,
        timestamp: previewTimestamp,
        metadata: {
          errorCode: 'PROVIDER_TIMEOUT',
        },
      },
      ...((Array.isArray(user.transactions) ? user.transactions : []).filter(
        (row) => String(row.id || '') !== 'preview-pending-1'
      )),
    ]);
    pendingGame?.classList.remove('is-hidden');
    if (pendingGameFeedback) {
      showSuccess(
        pendingGameFeedback,
        'Market Runner preview is open while BR9ja keeps verifying in the background.'
      );
    }
  }
  await loadLivePulse();

  if (livePulsePollId) {
    window.clearInterval(livePulsePollId);
  }
  livePulsePollId = window.setInterval(() => {
    void loadLivePulse();
  }, 30000);

  if (profilePollId) {
    window.clearInterval(profilePollId);
  }
  profilePollId = window.setInterval(() => {
    if (!Array.isArray(user.transactions)) {
      return;
    }
    if (
      !user.transactions.some(
        (row) => String(row.status || '').toLowerCase() === 'pending_verification'
      )
    ) {
      return;
    }
    void refreshProfileSnapshot().catch(() => {});
  }, 15000);

  document.querySelectorAll('[data-pending-overlay-close]').forEach((node) => {
    node.addEventListener('click', hidePendingOverlay);
  });

  pendingRefreshButton?.addEventListener('click', async () => {
    if (!pendingOverlayRow) {
      return;
    }
    if (window.location.protocol === 'file:') {
      showSuccess(
        pendingOverlayFeedback,
        'Preview mode cannot re-query providers. Open the live dashboard to refresh this transaction.'
      );
      return;
    }
    try {
      const result = await requestJson(
        `/api/user/transactions/${pendingOverlayRow.id}/requery`,
        {
          method: 'POST',
          auth: true,
          payload: {},
        }
      );
      showSuccess(
        pendingOverlayFeedback,
        result.message ||
          'Network delay detected. ⏳ We are still confirming your delivery.'
      );
      await refreshProfileSnapshot();
    } catch (error) {
      showSuccess(pendingOverlayFeedback, error.message);
    }
  });

  pendingInstantRefundButton?.addEventListener('click', async () => {
    if (!pendingOverlayRow) {
      return;
    }
    if (window.location.protocol === 'file:') {
      showSuccess(
        pendingOverlayFeedback,
        'Preview mode cannot request live refunds. Open the live dashboard to use instant recovery.'
      );
      return;
    }
    try {
      const result = await requestJson(
        `/api/user/transactions/${pendingOverlayRow.id}/request-instant-refund`,
        {
          method: 'POST',
          auth: true,
          payload: {},
        }
      );
      showSuccess(
        pendingOverlayFeedback,
        result.message || 'Instant refund completed and your balance is safe.'
      );
      await refreshProfileSnapshot();
    } catch (error) {
      showSuccess(pendingOverlayFeedback, error.message);
    }
  });

  pendingPlayButton?.addEventListener('click', () => {
    pendingGame?.classList.toggle('is-hidden');
    if (!pendingGame?.classList.contains('is-hidden') && pendingGameFeedback) {
      showSuccess(
        pendingGameFeedback,
        'Tap Jump to keep the runner moving while BR9ja verifies your transaction.'
      );
    }
  });

  pendingJump?.addEventListener('click', () => {
    pendingGameScoreValue += 5;
    if (pendingGameScore) {
      pendingGameScore.textContent = pendingGameScoreValue.toLocaleString();
    }
    pendingRunner?.classList.add('is-jumping');
    window.setTimeout(() => pendingRunner?.classList.remove('is-jumping'), 180);
  });

  document.addEventListener('click', async (event) => {
    const receiptButton = event.target.closest('[data-profile-receipt]');
    if (receiptButton) {
      const receiptUrl = resolveApiUrl(`/api/v1/transactions/receipt/${receiptButton.dataset.profileReceipt}`);
      window.open(receiptUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const refreshButton = event.target.closest('[data-profile-refresh-status]');
    if (refreshButton) {
      try {
        if (window.location.protocol === 'file:') {
          throw new Error(
            'Preview mode cannot re-query providers. Open the live dashboard to refresh this transaction.'
          );
        }

        const result = await requestJson(
          `/api/user/transactions/${refreshButton.dataset.profileRefreshStatus}/requery`,
          {
            method: 'POST',
            auth: true,
            payload: {},
          }
        );

        showSuccess(
          profileTransactionFeedback,
          result.message ||
            'Network delay detected. ⏳ We are confirming your delivery with the provider. Please do not retry. Your balance is safe.'
        );

        try {
          await refreshProfileSnapshot();
        } catch (_error) {
          // Keep the current snapshot if profile refresh fails.
        }
      } catch (error) {
        showSuccess(profileTransactionFeedback, error.message);
      }
      return;
    }

    const instantRefundButton = event.target.closest('[data-profile-instant-refund]');
    if (instantRefundButton) {
      try {
        if (window.location.protocol === 'file:') {
          throw new Error(
            'Preview mode cannot request live refunds. Open the deployed dashboard to use instant recovery.'
          );
        }
        const result = await requestJson(
          `/api/user/transactions/${instantRefundButton.dataset.profileInstantRefund}/request-instant-refund`,
          {
            method: 'POST',
            auth: true,
            payload: {},
          }
        );
        showSuccess(
          profileTransactionFeedback,
          result.message || 'Instant refund completed successfully.'
        );
        await refreshProfileSnapshot();
      } catch (error) {
        showSuccess(profileTransactionFeedback, error.message);
      }
    }
  });
}

function bindServicePreviewPage() {
  if (getPageName() !== 'services') {
    return;
  }

  const user = getStoredAuthUser();
  const activateButtons = [...document.querySelectorAll('[data-service-activate]')];
  const lockedNotes = [...document.querySelectorAll('[data-service-locked-note]')];

  if (!activateButtons.length) {
    return;
  }

  if (!user) {
    activateButtons.forEach((button) => {
      button.textContent = 'Login to Start';
      button.setAttribute('href', `${getBasePath()}/login.html`);
      button.removeAttribute('aria-disabled');
    });
    lockedNotes.forEach((note) => note.classList.add('is-hidden'));
    return;
  }

  if (!user.phoneVerified) {
    activateButtons.forEach((button) => {
      button.textContent = 'Verify Phone to Continue';
      button.setAttribute('href', `${getBasePath()}/secure-account.html`);
      button.setAttribute('title', 'Secure your account before live checkout.');
    });
    lockedNotes.forEach((note) => {
      note.classList.remove('is-hidden');
      note.textContent = 'Verify your phone first, then fund your wallet to activate live checkout.';
    });
    return;
  }

  if (user.canPurchaseServices) {
    activateButtons.forEach((button) => {
      button.textContent = 'Open Live Checkout';
      button.setAttribute('href', `${getBasePath()}/profile.html`);
      button.removeAttribute('aria-disabled');
    });
    lockedNotes.forEach((note) => note.classList.add('is-hidden'));
    return;
  }

  activateButtons.forEach((button) => {
    button.textContent = 'Fund Wallet to Activate';
    button.setAttribute('href', `${getBasePath()}/profile.html#manual-funding`);
    button.setAttribute('title', 'Your first funding unlocks live checkout.');
  });
  lockedNotes.forEach((note) => note.classList.remove('is-hidden'));
}

function bindAdminSettings(config) {
  const form = document.querySelector('[data-form="admin-settings"]');
  if (!form) {
    return;
  }

  const storedAdminToken = getStoredAdminToken();
  if (form.elements.adminToken && storedAdminToken) {
    form.elements.adminToken.value = storedAdminToken;
  }

  ADMIN_CONFIG_FIELDS.forEach((field) => {
    if (!form.elements[field]) {
      return;
    }
    if (form.elements[field] instanceof HTMLInputElement && form.elements[field].type === 'checkbox') {
      form.elements[field].checked = Boolean(config[field]);
      return;
    }
    form.elements[field].value = config[field] ?? '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const successNode = form.querySelector('.success-banner');

    const nextConfig = {
      ...config,
    };

    ADMIN_CONFIG_FIELDS.forEach((field) => {
      if (form.elements[field] instanceof HTMLInputElement && form.elements[field].type === 'checkbox') {
        nextConfig[field] = Boolean(form.elements[field].checked);
        return;
      }

      if (NUMERIC_CONFIG_FIELDS.has(field)) {
        nextConfig[field] = normaliseIntegerInput(payload[field], config[field]);
        return;
      }

      if (field === 'whatsappNumber') {
        nextConfig[field] = String(payload[field] || '').replace(/\D/g, '');
        return;
      }

      nextConfig[field] = String(payload[field] ?? '').trim();
    });

    localStorage.setItem(CONFIG_KEY, JSON.stringify(nextConfig));
    if (payload.adminToken) {
      setStoredAdminToken(payload.adminToken);
    }
    renderSiteChrome(nextConfig);

    try {
      if (window.location.protocol === 'file:') {
        showSuccess(successNode, 'Settings saved for this browser.');
        return;
      }

      await postJson(
        '/api/admin/site-config',
        nextConfig,
        payload.adminToken
          ? { 'x-site-admin-token': payload.adminToken }
          : {}
      );
      showSuccess(successNode, 'Config saved. All pages will pick up the new values on refresh.');
    } catch (error) {
      showSuccess(successNode, `${error.message} Local settings were still updated.`);
    }
  });
}

async function adminFetch(url, token, options = {}) {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-site-admin-token': token,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || 'Admin request failed.');
  }
  return payload?.data ?? payload;
}

function mergeProviderConfig(base, override) {
  const output = { ...base };
  if (!override || typeof override !== 'object' || Array.isArray(override)) {
    return output;
  }

  Object.entries(override).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      output[key] = mergeProviderConfig(base[key], value);
      return;
    }
    output[key] = value;
  });

  return output;
}

function getStoredProviderConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROVIDER_CONFIG_KEY) || 'null');
    return mergeProviderConfig(DEFAULT_PROVIDER_CONFIG, stored || {});
  } catch (_error) {
    return DEFAULT_PROVIDER_CONFIG;
  }
}

function getObjectPath(source, pathValue) {
  return String(pathValue || '')
    .split('.')
    .reduce((cursor, key) => (cursor && cursor[key] !== undefined ? cursor[key] : undefined), source);
}

function setObjectPath(target, pathValue, value) {
  const parts = String(pathValue || '').split('.');
  let cursor = target;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      cursor[part] = value;
      return;
    }
    cursor[part] = cursor[part] || {};
    cursor = cursor[part];
  });
}

function populateProviderRoom(providerConfig) {
  const config = mergeProviderConfig(DEFAULT_PROVIDER_CONFIG, providerConfig || {});
  const form = document.querySelector('[data-form="provider-config"]');
  if (!form) {
    return;
  }

  form.querySelectorAll('[name]').forEach((field) => {
    const value = getObjectPath(config, field.name);
    if (field.type === 'checkbox') {
      field.checked = value === true;
      return;
    }
    field.value = value ?? '';
  });

  document.querySelectorAll('[data-provider-route]').forEach((node) => {
    const key = node.dataset.providerRoute;
    const route = config.services?.[key] || {};
    const primary = formatModeLabel(route.primaryProvider || 'demo');
    const backup = formatModeLabel(route.backupProvider || 'demo');
    node.textContent = route.failoverEnabled
      ? `${primary} → ${backup}`
      : `${primary} only`;
  });

  document.querySelectorAll('[data-provider-funding]').forEach((node) => {
    node.textContent = `${formatModeLabel(config.funding.primaryProvider)} primary • ${formatModeLabel(config.funding.backupProvider)} backup`;
  });
}

function collectProviderConfig(form) {
  const next = mergeProviderConfig(DEFAULT_PROVIDER_CONFIG, {});
  form.querySelectorAll('[name]').forEach((field) => {
    let value = field.value;
    if (field.type === 'checkbox') {
      value = field.checked;
    }
    if (field.type === 'number') {
      value = normaliseIntegerInput(field.value, getObjectPath(DEFAULT_PROVIDER_CONFIG, field.name) || 0);
    }
    setObjectPath(next, field.name, value);
  });
  return next;
}

async function loadAdminProviders(token) {
  const form = document.querySelector('[data-form="provider-config"]');
  if (!form) {
    return;
  }

  const successNode = form.querySelector('.success-banner');
  let providerConfig = getStoredProviderConfig();

  if (window.location.protocol !== 'file:') {
    providerConfig = await adminFetch('/api/admin/provider-config', token);
  }

  populateProviderRoom(providerConfig);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nextConfig = collectProviderConfig(form);
    localStorage.setItem(PROVIDER_CONFIG_KEY, JSON.stringify(nextConfig));

    try {
      if (window.location.protocol === 'file:') {
        populateProviderRoom(nextConfig);
        showSuccess(successNode, 'Provider routing saved for this browser preview.');
        return;
      }

      const saved = await adminFetch('/api/admin/provider-config', token, {
        method: 'POST',
        body: nextConfig,
      });
      populateProviderRoom(saved);
      showSuccess(successNode, 'Provider routing saved. New transactions will use this route.');
    } catch (error) {
      showSuccess(successNode, `${error.message} Local provider settings were still updated.`);
    }
  });
}

function bindServicePricing(config) {
  const checkoutTimers = new Map();

  const computePromoDiscount = (serviceKey, rawAmount, markup) => {
    if (!currentPromoSummary || currentPromoSummary.status !== 'active') {
      return 0;
    }

    const targets = Array.isArray(currentPromoSummary.targetServices)
      ? currentPromoSummary.targetServices
      : [];
    if (!targets.includes('all') && !targets.includes(serviceKey)) {
      return 0;
    }

    if (currentPromoSummary.discountType === 'percentage') {
      let discount =
        Math.round(rawAmount * (Number(currentPromoSummary.discountPercent || 0) / 100));
      if (Number(currentPromoSummary.maxDiscountValue || 0) > 0) {
        discount = Math.min(discount, Number(currentPromoSummary.maxDiscountValue || 0));
      }
      return Math.min(discount, rawAmount + markup);
    }

    return Math.min(
      Number(currentPromoSummary.discountAmount || 0),
      rawAmount + markup
    );
  };

  const cards = [...document.querySelectorAll('[data-service-key]')];

  const clearCheckoutTimer = (serviceKey) => {
    const existingTimer = checkoutTimers.get(serviceKey);
    if (existingTimer) {
      window.clearInterval(existingTimer);
      checkoutTimers.delete(serviceKey);
    }
  };

  const recompute = () => {
    cards.forEach((card) => {
      const serviceKey = card.dataset.serviceKey || '';
      const amountInput = card.querySelector('[data-service-amount]');
      const payButton = card.querySelector('[data-pay-button]');
      const receipt = card.querySelector('[data-receipt]');
      const totalNode = card.querySelector('[data-total-amount]');
      const markupField = PUBLIC_SERVICE_MARKUPS[serviceKey];

      if (!amountInput || !payButton || !markupField) {
        return;
      }

      const computeTotal = () => {
        const rawAmount = Number.parseFloat(String(amountInput.value || '0').trim()) || 0;
        const markup = Number(config[markupField] || 0);
        const promoDiscount = rawAmount > 0 ? computePromoDiscount(serviceKey, rawAmount, markup) : 0;
        const total = rawAmount > 0 ? Math.max(rawAmount + markup - promoDiscount, 0) : 0;
        const lockSeconds =
          promoDiscount > 0 && currentPromoSummary?.status === 'active'
            ? Math.max(Number(currentPromoSummary.secondsRemaining || 0), 0)
            : 0;

        payButton.textContent = total > 0 ? `Pay ${formatCurrency(total)}` : 'Enter amount';
        payButton.disabled = total <= 0;
        if (totalNode) {
          totalNode.textContent = total > 0 ? formatCurrency(total) : '₦0';
        }
        if (receipt) {
          clearCheckoutTimer(serviceKey);
          receipt.hidden = true;
          receipt.classList.remove('service-receipt-preview--expired');
        }

        return { lockSeconds, promoDiscount, total };
      };

      computeTotal();
      amountInput.oninput = computeTotal;

      payButton.onclick = () => {
        const { lockSeconds, total, promoDiscount } = computeTotal();
        if (total <= 0 || !receipt) {
          return;
        }

        clearCheckoutTimer(serviceKey);
        receipt.hidden = false;
        receipt.classList.remove('service-receipt-preview--expired');
        receipt.innerHTML = `
          <strong>Receipt Preview Ready</strong>
          <span>Total paid: ${formatCurrency(total)}</span>
          <span>${promoDiscount > 0 ? `${formatCurrency(promoDiscount)} flash-sale savings applied.` : 'The one-price BR9ja checkout is now locked for this service.'}</span>
          ${
            promoDiscount > 0
              ? `<span class="price-lock">Complete this transaction in <strong data-price-lock-countdown>${formatPromoCountdown(lockSeconds)}</strong>. When it expires, the promo price goes back to normal.</span>`
              : '<span>Complete when ready. No flash-sale timer is active for this price.</span>'
          }
        `;

        if (promoDiscount <= 0 || lockSeconds <= 0) {
          return;
        }

        let remaining = lockSeconds;
        const timer = window.setInterval(async () => {
          remaining = Math.max(remaining - 1, 0);
          const countdownNode = receipt.querySelector('[data-price-lock-countdown]');
          if (countdownNode) {
            countdownNode.textContent = formatPromoCountdown(remaining);
          }

          if (remaining > 0) {
            return;
          }

          clearCheckoutTimer(serviceKey);
          await loadSitePromo();
          const latest = computeTotal();
          receipt.hidden = false;
          receipt.classList.add('service-receipt-preview--expired');
          receipt.innerHTML = `
            <strong>Promo price timed out</strong>
            <span>The Golden Window has ended for this checkout. Please try again with the current price.</span>
            <span>Current total: ${formatCurrency(latest.total)}</span>
          `;
        }, 1000);
        checkoutTimers.set(serviceKey, timer);
      };
    });
  };

  recompute();
  window.__br9RecomputeServicePricing = recompute;
}

function buildAdminGateMarkup() {
  return `
    <div class="admin-gate">
      <div class="admin-gate__card">
        <span class="kicker">Private Admin Access</span>
        <h1>Unlock the BR9ja headquarters.</h1>
        <p class="section-copy">Sign in with your admin username or email plus password. The admin token stays behind the scenes so every room inside /lex/auth stays protected.</p>
        <form class="admin-gate__form" data-form="admin-gate">
          <div class="field-group">
            <label for="admin-gate-identifier">Admin Username or Email</label>
            <div class="field-shell">
              <input id="admin-gate-identifier" name="identifier" type="text" placeholder="Enter admin username or email" autocomplete="username">
            </div>
          </div>
          <div class="field-group">
            <label for="admin-gate-password">Password</label>
            <div class="field-shell">
              <input id="admin-gate-password" name="password" type="password" placeholder="Enter admin password" autocomplete="current-password">
            </div>
            <span class="field-status" data-default="Admin access now uses sign-in based verification instead of exposing a public /admin token page.">Admin access now uses sign-in based verification instead of exposing a public /admin token page.</span>
          </div>
          <button class="action-button" type="submit">Unlock Admin</button>
          <p class="success-banner" aria-live="polite"></p>
        </form>
      </div>
    </div>
  `;
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportTransactionsToPdf() {
  window.print();
}

function populateDashboardMetrics(data) {
  const liveProfitPulse = data.liveProfitPulse || {};
  const reconciliationReport = data.reconciliationReport || null;
  const providerHealth = data.providerHealth || {};
  const approvals = Array.isArray(data.pendingApprovals) ? data.pendingApprovals : [];
  const goldCirculation = data.goldCirculation || {};
  const goldWalletRule = data.goldWalletRule || {};

  data.liveProfitNet = Number(liveProfitPulse.netProfit || 0);
  data.liveProfitRevenue = `Revenue ${formatCurrency(Number(liveProfitPulse.totalRevenue || 0))}`;
  data.goldInCirculation = Number(goldCirculation.totalInCirculation || 0);
  data.goldBurned = `Burned ${Number(goldCirculation.totalBurned || 0).toLocaleString()} BR9 Gold`;
  data.goldWalletRuleLabel = `${Number(goldWalletRule.minimumSuccessfulTransactions || 5).toLocaleString()} successful txns`;
  data.providerHealthSummary = [
    providerHealth.clubkonnect?.healthy ? 'Clubkonnect ✓' : 'Clubkonnect ✕',
    providerHealth.vtpass?.healthy ? 'VTPass ✓' : 'VTPass ✕',
  ].join(' • ');
  data.reconciliationStatus = reconciliationReport
    ? reconciliationReport.healthy
      ? 'Healthy'
      : 'Critical'
    : 'Pending';
  data.reconciliationDiscrepancy = reconciliationReport
    ? `Discrepancy ${formatCurrency(Number(reconciliationReport.discrepancy || 0))}`
    : 'Discrepancy ₦0';

  document.querySelectorAll('[data-admin-metric]').forEach((node) => {
    const key = node.dataset.adminMetric;
    if (!key) {
      return;
    }

    const value = data[key];
    if (typeof value === 'number') {
      node.textContent =
        key.includes('Volume') ||
        key.includes('Profit') ||
        key.includes('Expense')
          ? formatCurrency(value)
          : key.toLowerCase().includes('gold')
            ? `${value.toLocaleString()} BR9 Gold`
          : value.toLocaleString();
      return;
    }

    if (value !== undefined && value !== null) {
      node.textContent = String(value);
    }
  });

  const spotlight = document.querySelector('[data-admin-profit-spotlight]');
  if (spotlight && Array.isArray(data.profitMatrix)) {
    const profitByKey = new Map(
      data.profitMatrix.map((item) => [item.key, item])
    );
    const categoryRows = PROFIT_CATEGORY_MATRIX.map((category) => {
      const items = category.keys
        .map((key) => profitByKey.get(key))
        .filter(Boolean);
      return {
        label: category.label,
        totalProfitGenerated: items.reduce(
          (total, item) => total + Number(item.totalProfitGenerated || 0),
          0
        ),
        transactionCount: items.reduce(
          (total, item) => total + Number(item.transactionCount || 0),
          0
        ),
        transactionVolume: items.reduce(
          (total, item) => total + Number(item.transactionVolume || 0),
          0
        ),
      };
    });

    const topRows = categoryRows
      .sort((left, right) => right.totalProfitGenerated - left.totalProfitGenerated)
      .slice(0, 4)
      .map(
        (item) => `
          <article class="admin-mini-card">
            <span class="admin-mini-card__eyebrow">${item.label}</span>
            <strong>${formatCurrency(item.totalProfitGenerated)}</strong>
            <span class="mini-note">${item.transactionCount} completed transactions • ${formatCurrency(item.transactionVolume)} volume</span>
          </article>
        `
      )
      .join('');
    spotlight.innerHTML = topRows;
  }

  const securityTable = document.querySelector('[data-security-events-table]');
  if (securityTable) {
    const rows = Array.isArray(data.securityEvents) ? data.securityEvents : [];
    securityTable.innerHTML = rows.length
      ? rows
          .map(
            (event) => `
              <tr>
                <td>${event.username || 'unknown'}</td>
                <td><strong>${formatModeLabel(event.severity)}</strong><div class="mini-note">${event.message || event.eventType}</div></td>
                <td>${event.method || ''} ${event.route || ''}</td>
                <td>${event.deviceId || 'No device id'}</td>
                <td>${new Date(event.createdAt).toLocaleString()}</td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="5">No risky attempts logged yet.</td></tr>';
  }

  const providerHealthCopy = document.querySelector('[data-provider-health-copy]');
  if (providerHealthCopy) {
    providerHealthCopy.textContent = `Clubkonnect ${providerHealth.clubkonnect?.healthy ? 'online' : 'down'} • VTPass ${
      providerHealth.vtpass?.healthy ? 'online' : 'down'
    }`;
  }

  const dashboardApprovalsTable = document.querySelector('[data-dashboard-approvals-table]');
  if (dashboardApprovalsTable) {
    dashboardApprovalsTable.innerHTML = approvals.length
      ? approvals
          .slice(0, 8)
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.reference || '')}</td>
                <td>${escapeHtml(row.type || '')}</td>
                <td>${formatCurrency(Number(row.amount || 0))}</td>
                <td>${escapeHtml(row.provider || '—')}</td>
                <td>${escapeHtml(row.reason || 'Awaiting operator decision.')}</td>
                <td>${escapeHtml(formatModeLabel(row.status || 'pending'))}</td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="6">No high-risk approvals are waiting right now.</td></tr>';
  }
}

function populateTransactionsTable(data) {
  const tbody = document.querySelector('[data-transactions-table]');
  if (!tbody) {
    return;
  }

  const rows = Array.isArray(data.rows) ? data.rows : [];
  tbody.innerHTML = rows.length
    ? rows
        .map(
          (row) => `
            <tr>
              <td>
                <strong>${escapeHtml(row.reference)}</strong>
                <div class="mini-note">${escapeHtml(row.note || '')}</div>
              </td>
              <td>${escapeHtml(row.service)}</td>
              <td>${formatCurrency(row.amount)}</td>
              <td>${formatCurrency(row.silentProfit)}</td>
              <td>${new Date(row.timestamp).toLocaleString()}</td>
              <td>${escapeHtml(formatModeLabel(row.status || 'pending'))}</td>
              <td>
                <div class="admin-action-grid">
                  <button class="ghost-button admin-row-action" type="button" data-transaction-audit="${escapeHtml(row.id || '')}">Audit</button>
                  <button class="ghost-button admin-row-action" type="button" data-transaction-receipt="${escapeHtml(row.id || '')}">Receipt</button>
                  <button class="ghost-button admin-row-action" type="button" data-transaction-requery="${escapeHtml(row.id || '')}">Re-query</button>
                  <button class="ghost-button admin-row-action" type="button" data-transaction-force-success="${escapeHtml(row.id || '')}">Force Success</button>
                  <button class="ghost-button admin-row-action danger-button" type="button" data-transaction-force-refund="${escapeHtml(row.id || '')}">Force Refund</button>
                </div>
              </td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="7">No transactions matched that filter window yet.</td></tr>';

  const summary = document.querySelector('[data-transactions-summary]');
  if (summary) {
    summary.textContent = `${Number(data.totalCount || rows.length).toLocaleString()} transactions in view`;
  }

  const csvButton = document.querySelector('[data-export="csv"]');
  if (csvButton) {
    csvButton.onclick = () => {
      downloadCsv(
        'br9ja-vault.csv',
        [
          ['Reference', 'Service', 'Amount', 'Silent Profit', 'Timestamp', 'Status'],
          ...rows.map((row) => [
            row.reference,
            row.service,
            row.amount,
            row.silentProfit,
            row.timestamp,
            row.status,
          ]),
        ]
      );
    };
  }

  const pdfButton = document.querySelector('[data-export="pdf"]');
  if (pdfButton) {
    pdfButton.onclick = exportTransactionsToPdf;
  }
}

function populateTransactionAuditTrail(rows = []) {
  const tbody = document.querySelector('[data-transaction-audit-table]');
  if (!tbody) {
    return;
  }

  tbody.innerHTML = rows.length
    ? rows
        .map(
          (row) => `
            <tr>
              <td>${escapeHtml(row.step || '')}</td>
              <td>${escapeHtml(formatModeLabel(row.status || 'info'))}</td>
              <td>${escapeHtml(row.message || '')}</td>
              <td>${new Date(row.createdAt || Date.now()).toLocaleString()}</td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="4">No audit events recorded for this transaction yet.</td></tr>';
}

function populateUsersTable(data) {
  const tbody = document.querySelector('[data-users-table]');
  if (!tbody) {
    return;
  }

  const rows = Array.isArray(data.rows) ? data.rows : [];
  tbody.innerHTML = rows.length
    ? rows
        .map(
          (user) => {
            const status = user.accountStatus || 'active';
            const statusLabel = user.accountStatusLabel || formatModeLabel(status);
            const reason = user.accountStatusReason
              ? `<div class="mini-note">${escapeHtml(user.accountStatusReason)}</div>`
              : '';

            return `
            <tr>
              <td>
                <strong>${escapeHtml(user.fullName)}</strong>
                <div class="mini-note">${escapeHtml(user.username)}</div>
                <div class="mini-note">${escapeHtml(user.email || '')}</div>
              </td>
              <td>${escapeHtml(user.phoneNumber)}</td>
              <td>${new Date(user.signupDate).toLocaleDateString()}</td>
              <td>${formatCurrency(user.totalSpent)}</td>
              <td>${formatCurrency(user.balance)}</td>
              <td>
                <span class="status-pill status-pill--${escapeHtml(status)}">${escapeHtml(statusLabel)}</span>
                ${reason}
              </td>
              <td>
                <div class="admin-action-grid">
                  <button class="ghost-button admin-row-action" type="button" data-credit-user="${escapeHtml(user.id)}" data-credit-name="${escapeHtml(user.fullName)}" data-credit-username="${escapeHtml(user.username)}">Credit</button>
                  <button class="ghost-button admin-row-action" type="button" data-balance-action="debit" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.fullName)}" data-user-balance="${Number(user.balance || 0)}">Subtract</button>
                  <button class="ghost-button admin-row-action danger-button" type="button" data-balance-action="wipe" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.fullName)}" data-user-balance="${Number(user.balance || 0)}">Wipe</button>
                  <button class="ghost-button admin-row-action" type="button" data-status-action="suspended" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.fullName)}">Suspend</button>
                  <button class="ghost-button admin-row-action" type="button" data-status-action="restricted" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.fullName)}">Restrict</button>
                  <button class="ghost-button admin-row-action" type="button" data-status-action="verification_required" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.fullName)}">Request Verification</button>
                  <button class="ghost-button admin-row-action" type="button" data-status-action="under_review" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.fullName)}">Under Review</button>
                  <button class="ghost-button admin-row-action danger-button" type="button" data-freeze-wallet="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.fullName)}">${user.isFrozen ? 'Unfreeze Wallet' : 'Freeze Wallet'}</button>
                  <button class="ghost-button admin-row-action" type="button" data-status-action="active" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.fullName)}">Restore</button>
                  <button class="ghost-button admin-row-action danger-button" type="button" data-status-action="deleted" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.fullName)}">Delete</button>
                </div>
              </td>
            </tr>
          `;
          }
        )
        .join('')
    : '<tr><td colspan="7">No users matched that search yet.</td></tr>';

  const summary = document.querySelector('[data-users-summary]');
  if (summary) {
    summary.textContent = `${Number(data.totalCount || rows.length).toLocaleString()} users loaded`;
  }
}

function buildLocalServiceCatalogPreview() {
  const resellerDefaults = {
    resellerPriceMarkup: 5,
    usePercentageMarkup: false,
    resellerTierMarkups: { bronze: 7, silver: 5, gold: 3 },
  };
  const rawRows = [
    ['Airtime', 'MTN Airtime', 'clubkonnect', 'MTN', 'VTU', 1000, 1050, true],
    ['Airtime', 'Airtel Airtime', 'clubkonnect', 'Airtel', 'VTU', 1000, 1050, true],
    ['Airtime', 'Glo Airtime', 'clubkonnect', 'Glo', 'VTU', 1000, 1050, true],
    ['Airtime', '9mobile Airtime', 'clubkonnect', '9mobile', 'VTU', 1000, 1050, true],
    ['Data', 'MTN SME 500MB', 'clubkonnect', 'MTN', 'SME500MB', 500, 550, true],
    ['Data', 'MTN SME 1.5GB', 'clubkonnect', 'MTN', 'SME1500MB', 1200, 1250, true],
    ['Data', 'MTN SME 5GB', 'clubkonnect', 'MTN', 'SME5GB', 3500, 3600, true],
    ['Data', 'Airtel Gifting 1GB', 'clubkonnect', 'Airtel', 'AIRTEL1GB', 900, 960, true],
    ['Data', 'Glo Corporate 1GB', 'clubkonnect', 'Glo', 'GLO1GB', 850, 920, true],
    ['Data', '9mobile 1GB', 'clubkonnect', '9mobile', '9MOBILE1GB', 950, 1020, true],
    ['Electricity', 'IKEDC Electricity', 'vtpass', 'ikeja-electric', '', 1000, 1100, true],
    ['Electricity', 'EKEDC Electricity', 'vtpass', 'eko-electric', '', 1000, 1100, true],
    ['Electricity', 'AEDC Electricity', 'vtpass', 'abuja-electric', '', 1000, 1100, true],
    ['Electricity', 'KAEDCO Electricity', 'vtpass', 'kano-electric', '', 1000, 1100, true],
    ['Electricity', 'Port Harcourt Electric', 'vtpass', 'portharcourt-electric', '', 1000, 1100, true],
    ['Electricity', 'Ibadan Electric', 'vtpass', 'ibadan-electric', '', 1000, 1100, true],
    ['TV', 'DSTV Compact', 'clubkonnect', 'dstv', 'dstv-compact', 12500, 12750, true],
    ['TV', 'GOtv Max', 'clubkonnect', 'gotv', 'gotv-max', 8500, 8700, true],
    ['TV', 'StarTimes Basic', 'clubkonnect', 'startimes', 'startimes-basic', 6000, 6150, true],
    ['Internet', 'Smile 30GB', 'vtpass', 'smile-direct', 'smile-30gb', 5000, 5200, true],
    ['Internet', 'Spectranet 20GB', 'vtpass', 'spectranet', 'spectranet-20gb', 7500, 7800, true],
    ['TV', 'Showmax Mobile', 'manual', 'showmax', 'showmax-mobile', 3200, 3350, false],
    ['Education', 'WAEC Result Checker', 'vtpass', 'waec', 'waec', 3650, 3800, true],
    ['Education', 'WAEC GCE', 'vtpass', 'waec-gce', 'waec-gce', 17500, 18000, true],
    ['Education', 'JAMB UTME', 'vtpass', 'jamb', 'utme', 5640, 5760, true],
    ['Education', 'JAMB Direct Entry', 'vtpass', 'jamb', 'direct-entry', 5640, 5760, true],
    ['Education', 'NECO Token', 'vtpass', 'neco', 'neco', 1450, 1500, true],
    ['Education', 'NABTEB', 'vtpass', 'nabteb', 'nabteb', 1450, 1500, true],
    ['Transport', 'LCC Toll Top-up', 'vtpass', 'lcc', 'etag', 1000, 1100, true],
    ['Transport', 'GIGM Bus Booking', 'manual', 'gigm', 'economy', 15000, 15300, false],
    ['Transport', 'ABC Transport Booking', 'manual', 'abc', 'economy', 12000, 12300, false],
    ['Government', 'General RRR Payment', 'remita', 'rrr', 'general', 2500, 2650, true],
    ['Government', "Driver's License Renewal", 'manual', 'drivers-license', 'renewal', 15000, 15250, false],
    ['Government', 'Passport Service Fee', 'manual', 'passport', 'standard', 25000, 25250, false],
    ['Betting', 'SportyBet Wallet Funding', 'billpay', 'sportybet', 'wallet', 2000, 2100, true],
    ['Betting', 'Bet9ja Wallet Funding', 'billpay', 'bet9ja', 'wallet', 2000, 2100, true],
    ['Betting', '1XBet Wallet Funding', 'billpay', '1xbet', 'wallet', 2000, 2100, true],
    ['Betting', 'BetKing Wallet Funding', 'billpay', 'betking', 'wallet', 2000, 2100, true],
    ['Betting', 'MSport Wallet Funding', 'billpay', 'msport', 'wallet', 2000, 2100, true],
    ['Betting', '22Bet Wallet Funding', 'billpay', '22bet', 'wallet', 2000, 2100, true],
    ['Finance', 'Virtual USD Card', 'grey', 'usd-card', 'virtual', 1500, 1750, false],
    ['Subscription', 'Netflix Subscription', 'manual', 'netflix', 'monthly', 8000, 8200, false],
    ['Subscription', 'Spotify Premium', 'manual', 'spotify', 'monthly', 1600, 1720, false],
    ['Lifestyle', 'Gaming Cards Vault', 'manual', 'gaming-cards', 'wallet-topup', 5000, 5300, false],
    ['Lifestyle', 'Event Tickets', 'manual', 'event-ticket', 'general', 10000, 10300, false],
  ];

  const rows = rawRows.map(
    ([category, serviceName, provider, serviceId, variationCode, costPrice, sellingPrice, isActive], index) => {
      const profitMargin = Number(sellingPrice) - Number(costPrice);
      const marginRate = Number(costPrice) > 0 ? profitMargin / Number(costPrice) : 0;
      const warningLevel =
        Number(sellingPrice) <= Number(costPrice)
          ? 'danger'
          : profitMargin < 10 || marginRate < 0.02
            ? 'warning'
            : 'healthy';
      const resellerPreview = Object.fromEntries(
        Object.entries(resellerDefaults.resellerTierMarkups).map(([tier, markupApplied]) => [
          tier,
          {
            markupApplied,
            wholesalePrice: Number(costPrice) + Number(markupApplied),
          },
        ])
      );

      return {
        id: `preview-${index + 1}`,
        category,
        serviceName,
        label: serviceName,
        provider,
        providerCode: provider,
        serviceId,
        variationCode,
        costPrice,
        sellingPrice,
        profitMargin,
        marginRate,
        warningLevel,
        profitShieldBlocked: !isActive || sellingPrice <= costPrice || marginRate < 0.02,
        isActive,
        purchaseEnabled: Boolean(isActive) && sellingPrice > costPrice && marginRate >= 0.02,
        ...resellerDefaults,
        resellerPreview,
      };
    }
  );

  return {
    rows,
    totalCount: rows.length,
    overview: {
      totalRevenue: 0,
      totalCost: 0,
      netProfit: 0,
      totalCount: rows.length,
      activeCount: rows.filter((row) => row.isActive).length,
      flaggedCount: rows.filter((row) => row.warningLevel !== 'healthy').length,
    },
    logs: [
      {
        id: 'preview-log',
        actionType: 'preview',
        actorLabel: 'Local Preview',
        message: 'Catalog preview is active. Open the localhost admin room for live edits.',
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function syncCatalogBulkBar() {
  const bulkBar = document.querySelector('[data-catalog-bulk-bar]');
  if (!bulkBar) {
    return;
  }

  const checkedRows = [
    ...document.querySelectorAll('[data-catalog-select-row]:checked'),
  ];
  const countNode = bulkBar.querySelector('[data-catalog-bulk-count]');
  if (countNode) {
    countNode.textContent = `${checkedRows.length} product${checkedRows.length === 1 ? '' : 's'} selected`;
  }
  bulkBar.hidden = checkedRows.length === 0;
}

function populateServiceCatalogRoom(data) {
  const rows = Array.isArray(data.rows) ? data.rows : [];
  const overview = data.overview || {};

  document.querySelectorAll('[data-catalog-overview]').forEach((node) => {
    const key = node.dataset.catalogOverview;
    const value = overview[key];
    if (typeof value === 'number') {
      node.textContent =
        key.includes('Revenue') || key.includes('Cost') || key.includes('Profit')
          ? formatCurrency(value)
          : value.toLocaleString();
      return;
    }

    if (value !== undefined && value !== null) {
      node.textContent = String(value);
    }
  });

  const summary = document.querySelector('[data-catalog-summary]');
  if (summary) {
    summary.textContent = `${Number(data.totalCount || rows.length).toLocaleString()} products loaded`;
  }

  const tbody = document.querySelector('[data-admin-service-catalog-table]');
  if (tbody) {
    tbody.innerHTML = rows.length
      ? rows
          .map((row) => {
            const marginPercent = Number(row.marginRate || 0) * 100;
            const healthCopy =
              row.warningLevel === 'danger'
                ? 'Below cost'
                : row.warningLevel === 'warning'
                  ? 'Low margin'
                  : 'Healthy';
            const blockedCopy = row.purchaseEnabled
              ? 'Live in user app'
              : 'Blocked by profit shield';

            return `
              <tr class="admin-catalog-row admin-catalog-row--${escapeHtml(row.warningLevel || 'healthy')}" data-catalog-row="${escapeHtml(row.id)}">
                <td>
                  <input type="checkbox" data-catalog-select-row value="${escapeHtml(row.id)}" aria-label="Select ${escapeHtml(row.serviceName || row.label)}">
                </td>
                <td>
                  <strong>${escapeHtml(row.serviceName || row.label)}</strong>
                  <div class="mini-note">${escapeHtml(row.category || '')} • ${escapeHtml(String(row.serviceId || ''))}${row.variationCode ? ` / ${escapeHtml(row.variationCode)}` : ''}</div>
                  <div class="mini-note">${escapeHtml(blockedCopy)}</div>
                </td>
                <td>
                  <strong>${escapeHtml(formatModeLabel(row.provider || row.providerCode || 'provider'))}</strong>
                  <div class="mini-note">${escapeHtml(String(row.providerCode || ''))}</div>
                </td>
                <td>
                  <input class="catalog-price-input" type="number" min="0" step="0.01" value="${Number(row.costPrice || 0).toFixed(2)}" data-catalog-field="costPrice">
                </td>
                <td>
                  <input class="catalog-price-input" type="number" min="0" step="0.01" value="${Number(row.sellingPrice || 0).toFixed(2)}" data-catalog-field="sellingPrice">
                </td>
                <td>
                  <div class="catalog-health catalog-health--${escapeHtml(row.warningLevel || 'healthy')}">
                    <strong>${formatCurrency(Number(row.profitMargin || 0))}</strong>
                    <span>${marginPercent.toFixed(1)}%</span>
                  </div>
                  <div class="mini-note">${escapeHtml(healthCopy)}</div>
                </td>
                <td>
                  <div class="catalog-reseller-stack">
                    <div class="catalog-reseller-grid">
                      <label>
                        <span>Base</span>
                        <input class="catalog-price-input" type="number" min="0" step="0.01" value="${Number(row.resellerPriceMarkup || 0).toFixed(2)}" data-catalog-field="resellerPriceMarkup">
                      </label>
                      <label>
                        <span>Mode</span>
                        <select class="catalog-price-input" data-catalog-field="usePercentageMarkup">
                          <option value="false" ${row.usePercentageMarkup ? '' : 'selected'}>₦ Flat</option>
                          <option value="true" ${row.usePercentageMarkup ? 'selected' : ''}>%</option>
                        </select>
                      </label>
                    </div>
                    <div class="catalog-reseller-grid catalog-reseller-grid--tiers">
                      <label>
                        <span>Bronze</span>
                        <input class="catalog-price-input" type="number" min="0" step="0.01" value="${Number(row.resellerTierMarkups?.bronze || 0).toFixed(2)}" data-catalog-field="resellerBronze">
                      </label>
                      <label>
                        <span>Silver</span>
                        <input class="catalog-price-input" type="number" min="0" step="0.01" value="${Number(row.resellerTierMarkups?.silver || 0).toFixed(2)}" data-catalog-field="resellerSilver">
                      </label>
                      <label>
                        <span>Gold</span>
                        <input class="catalog-price-input" type="number" min="0" step="0.01" value="${Number(row.resellerTierMarkups?.gold || 0).toFixed(2)}" data-catalog-field="resellerGold">
                      </label>
                    </div>
                    <div class="mini-note">
                      Bronze ${formatCurrency(Number(row.resellerPreview?.bronze?.wholesalePrice || 0))} •
                      Silver ${formatCurrency(Number(row.resellerPreview?.silver?.wholesalePrice || 0))} •
                      Gold ${formatCurrency(Number(row.resellerPreview?.gold?.wholesalePrice || 0))}
                    </div>
                  </div>
                </td>
                <td>
                  <label class="catalog-toggle">
                    <input type="checkbox" data-catalog-field="isActive" ${row.isActive ? 'checked' : ''}>
                    <span>${row.isActive ? 'Live' : 'Paused'}</span>
                  </label>
                </td>
                <td>
                  <button class="ghost-button admin-row-action" type="button" data-catalog-save="${escapeHtml(row.id)}">Save</button>
                </td>
              </tr>
            `;
          })
          .join('')
      : '<tr><td colspan="9">No products matched this filter.</td></tr>';
  }

  const logsHost = document.querySelector('[data-admin-catalog-logs]');
  const logs = Array.isArray(data.logs) ? data.logs : [];
  if (logsHost) {
    logsHost.innerHTML = logs.length
      ? logs
          .map(
            (log) => `
              <article class="admin-log-card">
                <div class="admin-log-card__header">
                  <strong>${escapeHtml(log.message || log.actionType || 'Catalog update')}</strong>
                  <span class="mini-note">${new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <span class="mini-note">${escapeHtml(log.actorLabel || 'Site Admin')}</span>
              </article>
            `
          )
          .join('')
      : `
          <article class="admin-log-card">
            <strong>No pricing changes yet</strong>
            <span class="mini-note">Inline edits and bulk updates will appear here.</span>
          </article>
        `;
  }

  syncCatalogBulkBar();
}

async function loadAdminServiceCatalog(token) {
  const filterForm = document.querySelector('[data-form="admin-service-catalog-filter"]');
  const bulkForm = document.querySelector('[data-form="catalog-bulk-update"]');
  const feedbackNode = document.querySelector('[data-catalog-feedback]');
  const refreshButton = document.querySelector('[data-catalog-refresh]');
  const requeryAllButton = document.querySelector('[data-catalog-requery-all-pending]');
  const selectAll = document.querySelector('[data-catalog-select-all]');

  const fetchAndRender = async () => {
    if (window.location.protocol === 'file:') {
      populateServiceCatalogRoom(buildLocalServiceCatalogPreview());
      return;
    }

    const params = new URLSearchParams();
    if (filterForm) {
      const formData = new FormData(filterForm);
      ['search', 'category', 'provider', 'activeOnly'].forEach((key) => {
        const value = String(formData.get(key) || '').trim();
        if (value) {
          params.set(key, value);
        }
      });
    }

    const query = params.toString();
    const data = await adminFetch(
      `/api/admin/service-catalog${query ? `?${query}` : ''}`,
      token
    );
    populateServiceCatalogRoom(data);
  };

  filterForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await fetchAndRender();
  });

  refreshButton?.addEventListener('click', async () => {
    await fetchAndRender();
  });

  requeryAllButton?.addEventListener('click', async () => {
    if (window.location.protocol === 'file:') {
      showSuccess(
        feedbackNode,
        'Preview mode cannot re-query providers. Open the localhost admin room for live recovery.'
      );
      return;
    }

    try {
      const result = await adminFetch('/api/admin/transactions/requery-all-pending', token, {
        method: 'POST',
        body: {
          olderThanMinutes: 5,
        },
      });
      showSuccess(
        feedbackNode,
        `Checked ${result.checkedCount} pending transactions. ${result.successCount} cleared, ${result.failedCount} failed, ${result.reviewCount} moved to review.`
      );
    } catch (error) {
      showSuccess(feedbackNode, error.message);
    }
  });

  selectAll?.addEventListener('change', (event) => {
    const checked = event.target.checked;
    document.querySelectorAll('[data-catalog-select-row]').forEach((node) => {
      node.checked = checked;
    });
    syncCatalogBulkBar();
  });

  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-catalog-select-row]')) {
      const selectedRows = [
        ...document.querySelectorAll('[data-catalog-select-row]'),
      ];
      if (selectAll) {
        selectAll.checked =
          selectedRows.length > 0 && selectedRows.every((node) => node.checked);
      }
      syncCatalogBulkBar();
    }
  });

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-catalog-save]');
    if (!button) {
      return;
    }

    const row = button.closest('[data-catalog-row]');
    if (!row) {
      return;
    }

    if (window.location.protocol === 'file:') {
      showSuccess(feedbackNode, 'Open the localhost admin room to save live pricing changes.');
      return;
    }

    const payload = {
      costPrice: Number.parseFloat(
        String(row.querySelector('[data-catalog-field="costPrice"]').value || '0')
      ),
      sellingPrice: Number.parseFloat(
        String(row.querySelector('[data-catalog-field="sellingPrice"]').value || '0')
      ),
      resellerPriceMarkup: Number.parseFloat(
        String(row.querySelector('[data-catalog-field="resellerPriceMarkup"]').value || '0')
      ),
      usePercentageMarkup:
        String(
          row.querySelector('[data-catalog-field="usePercentageMarkup"]').value || 'false'
        ) === 'true',
      resellerTierMarkups: {
        bronze: Number.parseFloat(
          String(row.querySelector('[data-catalog-field="resellerBronze"]').value || '0')
        ),
        silver: Number.parseFloat(
          String(row.querySelector('[data-catalog-field="resellerSilver"]').value || '0')
        ),
        gold: Number.parseFloat(
          String(row.querySelector('[data-catalog-field="resellerGold"]').value || '0')
        ),
      },
      isActive: row.querySelector('[data-catalog-field="isActive"]').checked,
    };

    try {
      await adminFetch(`/api/admin/service-catalog/${button.dataset.catalogSave}`, token, {
        method: 'PATCH',
        body: payload,
      });
      showSuccess(feedbackNode, 'Pricing row updated successfully.');
      await fetchAndRender();
    } catch (error) {
      showSuccess(feedbackNode, error.message);
    }
  });

  bulkForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const selectedIds = [
      ...document.querySelectorAll('[data-catalog-select-row]:checked'),
    ].map((node) => node.value);

    if (!selectedIds.length) {
      showSuccess(feedbackNode, 'Select at least one product before running a bulk update.');
      return;
    }

    const formData = new FormData(bulkForm);
    const actionType = String(formData.get('actionType') || 'flat').trim();
    const value = Number.parseFloat(String(formData.get('value') || '0'));

    if (!Number.isFinite(value)) {
      showSuccess(feedbackNode, 'Enter a valid number for the bulk update.');
      return;
    }

    const selectedRows = selectedIds
      .map((id) => document.querySelector(`[data-catalog-row="${id}"]`))
      .filter(Boolean);
    const currentMargins = selectedRows.map((row) => {
      const cost = Number.parseFloat(
        String(row.querySelector('[data-catalog-field="costPrice"]').value || '0')
      );
      const selling = Number.parseFloat(
        String(row.querySelector('[data-catalog-field="sellingPrice"]').value || '0')
      );
      return { cost, selling };
    });
    const averageProfitBefore =
      currentMargins.reduce((total, item) => total + Math.max(item.selling - item.cost, 0), 0) /
      currentMargins.length;
    const projectedMargins = currentMargins.map((item) => {
      if (actionType === 'percentage') {
        return Math.round(item.cost * (1 + value / 100)) - item.cost;
      }
      if (actionType === 'fixed_margin') {
        return value;
      }
      return item.selling + value - item.cost;
    });
    const averageProfitAfter =
      projectedMargins.reduce((total, item) => total + Math.max(item, 0), 0) /
      projectedMargins.length;
    const changePercent =
      averageProfitBefore > 0
        ? (((averageProfitAfter - averageProfitBefore) / averageProfitBefore) * 100).toFixed(2)
        : '0.00';

    const confirmed = window.confirm(
      `You are about to update ${selectedIds.length} products. Average profit changes from ${formatCurrency(averageProfitBefore)} to ${formatCurrency(averageProfitAfter)} (${changePercent}%). Proceed?`
    );
    if (!confirmed) {
      return;
    }

    if (window.location.protocol === 'file:') {
      showSuccess(feedbackNode, 'Bulk update preview only. Open the localhost admin room for live changes.');
      return;
    }

    try {
      const result = await adminFetch('/api/admin/service-catalog/bulk-update', token, {
        method: 'POST',
        body: {
          productIds: selectedIds,
          actionType,
          value,
        },
      });
      showSuccess(
        feedbackNode,
        `Updated ${result.affectedCount} products. Average profit now ${formatCurrency(result.averageProfitAfter)}.`
      );
      bulkForm.reset();
      await fetchAndRender();
    } catch (error) {
      showSuccess(feedbackNode, error.message);
    }
  });

  await fetchAndRender();
}

function populateProfitMatrix(data) {
  if (!Array.isArray(data.profitMatrix)) {
    return;
  }

  data.profitMatrix.forEach((item) => {
    document.querySelectorAll(`[data-profit-service="${item.key}"]`).forEach((node) => {
      node.textContent = formatCurrency(item.totalProfitGenerated);
    });
    document.querySelectorAll(`[data-profit-volume="${item.key}"]`).forEach((node) => {
      node.textContent = formatCurrency(item.transactionVolume);
    });
    document.querySelectorAll(`[data-profit-count="${item.key}"]`).forEach((node) => {
      node.textContent = `${Number(item.transactionCount || 0).toLocaleString()} txns`;
    });
  });
}

function renderAdminCommandFeed(rows = []) {
  const host = document.querySelector('[data-admin-command-feed]');
  if (!host) {
    return;
  }

  host.innerHTML = rows.length
    ? rows
        .map(
          (row) => `
            <article class="admin-command-feed__item admin-command-feed__item--${escapeHtml(row.tone || 'warning')}" data-command-id="${escapeHtml(row.id || '')}">
              <strong>${escapeHtml(row.type || 'Transaction')} • ${formatCurrency(Number(row.amount || 0))}</strong>
              <span>${escapeHtml(row.message || '')}</span>
            </article>
          `
        )
        .join('')
    : `
        <article class="admin-command-feed__item admin-command-feed__item--warning">
          <strong>Command feed is quiet</strong>
          <span>New transaction events will appear here in real time.</span>
        </article>
      `;
}

function renderCriticalDelays(rows = []) {
  const host = document.querySelector('[data-critical-delay-list]');
  if (!host) {
    return;
  }
  const section = document.querySelector('[data-critical-delay-section]');
  host.classList.toggle('has-critical-delays', rows.length > 0);
  section?.classList.toggle('has-critical-delays', rows.length > 0);

  host.innerHTML = rows.length
    ? rows
        .map(
          (row) => `
            <article class="critical-delay-card">
              <strong>🚨 ${escapeHtml(row.fullName || 'BR9ja User')} • ${escapeHtml(row.type || 'Transaction')}</strong>
              <span class="mini-note">${escapeHtml(row.reference || '')} • ${escapeHtml(row.provider || 'provider pending')} • ${row.waitingMinutes} mins</span>
            </article>
          `
        )
        .join('')
    : `
        <article class="critical-delay-card">
          <strong>No critical delays yet</strong>
          <span class="mini-note">Anything stuck past 15 minutes will appear here in bright red.</span>
        </article>
      `;
}

async function loadAdminDashboard(token) {
  const seenCommandIds = new Set();
  let hydrated = false;

  const fetchAndRender = async () => {
    const data = await adminFetch('/api/admin/site-dashboard', token);
    const commandFeed = Array.isArray(data.commandFeed) ? data.commandFeed : [];
    const freshRows = commandFeed.filter((row) => !seenCommandIds.has(row.id));
    const hasCommandFeedHost = Boolean(document.querySelector('[data-admin-command-feed]'));

    populateDashboardMetrics(data);
    populateProfitMatrix(data);
    renderAdminCommandFeed(commandFeed);
    renderCriticalDelays(Array.isArray(data.criticalDelays) ? data.criticalDelays : []);

    commandFeed.forEach((row) => {
      if (row.id) {
        seenCommandIds.add(row.id);
      }
    });

    if (hydrated && freshRows.length && hasCommandFeedHost) {
      playChime(freshRows[0].tone === 'critical' ? 'critical' : freshRows[0].tone === 'warning' ? 'warning' : 'success');
    }
    hydrated = true;
  };

  await fetchAndRender();
  const existing = Number(document.body.dataset.adminDashboardPollId || 0);
  if (existing) {
    window.clearInterval(existing);
  }
  const nextId = window.setInterval(() => {
    void fetchAndRender().catch(() => {});
  }, 15000);
  document.body.dataset.adminDashboardPollId = String(nextId);
}

async function loadAdminTransactions(token) {
  const filterForm = document.querySelector('[data-form="vault-filter"]');
  const feedbackNode = document.querySelector('[data-transaction-action-feedback]');

  const fetchAndRender = async () => {
    const params = new URLSearchParams();
    if (filterForm) {
      const formData = new FormData(filterForm);
      const startDate = String(formData.get('startDate') || '').trim();
      const endDate = String(formData.get('endDate') || '').trim();
      if (startDate) {
        params.set('startDate', startDate);
      }
      if (endDate) {
        params.set('endDate', endDate);
      }
    }
    const query = params.toString();
    const data = await adminFetch(
      `/api/admin/site-transactions${query ? `?${query}` : ''}`,
      token
    );
    populateTransactionsTable(data);
  };

  if (filterForm) {
    filterForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await fetchAndRender();
    });
  }

  document.addEventListener('click', async (event) => {
    const auditButton = event.target.closest('[data-transaction-audit]');
    if (auditButton) {
      try {
        const payload = await adminFetch(
          `/api/admin/transactions/${auditButton.dataset.transactionAudit}/audit`,
          token
        );
        populateTransactionAuditTrail(Array.isArray(payload.rows) ? payload.rows : []);
      } catch (error) {
        showSuccess(feedbackNode, error.message);
      }
      return;
    }

    const receiptButton = event.target.closest('[data-transaction-receipt]');
    if (receiptButton) {
      window.open(
        resolveApiUrl(`/api/v1/transactions/receipt/${receiptButton.dataset.transactionReceipt}`),
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }

    const requeryButton = event.target.closest('[data-transaction-requery]');
    if (requeryButton) {
      try {
        const payload = await adminFetch(
          `/api/admin/transactions/${requeryButton.dataset.transactionRequery}/requery`,
          token,
          { method: 'POST', body: {} }
        );
        showSuccess(
          feedbackNode,
          `Re-query completed. Latest provider status: ${formatModeLabel(payload.providerStatus || 'pending')}.`
        );
        await fetchAndRender();
      } catch (error) {
        showSuccess(feedbackNode, error.message);
      }
      return;
    }

    const forceSuccessButton = event.target.closest('[data-transaction-force-success]');
    if (forceSuccessButton) {
      try {
        await adminFetch(
          `/api/admin/transactions/${forceSuccessButton.dataset.transactionForceSuccess}/force-success`,
          token,
          { method: 'POST', body: {} }
        );
        showSuccess(feedbackNode, 'Transaction marked successful.');
        await fetchAndRender();
      } catch (error) {
        showSuccess(feedbackNode, error.message);
      }
      return;
    }

    const forceRefundButton = event.target.closest('[data-transaction-force-refund]');
    if (forceRefundButton) {
      try {
        await adminFetch(
          `/api/admin/transactions/${forceRefundButton.dataset.transactionForceRefund}/force-refund`,
          token,
          { method: 'POST', body: {} }
        );
        showSuccess(feedbackNode, 'Wallet refund triggered successfully.');
        await fetchAndRender();
      } catch (error) {
        showSuccess(feedbackNode, error.message);
      }
    }
  });

  await fetchAndRender();
}

function populatePendingApprovals(data) {
  const tbody = document.querySelector('[data-approvals-table]');
  if (!tbody) {
    return;
  }

  const rows = Array.isArray(data.pendingApprovals || data.rows) ? data.pendingApprovals || data.rows : [];
  tbody.innerHTML = rows.length
    ? rows
        .map(
          (row) => `
            <tr>
              <td><strong>${escapeHtml(row.reference || '')}</strong></td>
              <td>${escapeHtml(row.type || '')}</td>
              <td>${formatCurrency(Number(row.amount || 0))}</td>
              <td>${escapeHtml(row.provider || '—')}</td>
              <td>${escapeHtml(row.reason || 'Awaiting operator decision.')}</td>
              <td>${escapeHtml(formatModeLabel(row.status || 'pending'))}</td>
              <td>
                <div class="admin-action-grid">
                  <button class="ghost-button admin-row-action" type="button" data-approval-action="approve" data-approval-id="${escapeHtml(row.id || '')}">Approve</button>
                  <button class="ghost-button admin-row-action" type="button" data-approval-action="requery" data-approval-id="${escapeHtml(row.id || '')}">Re-query</button>
                  <button class="ghost-button admin-row-action danger-button" type="button" data-approval-action="refund" data-approval-id="${escapeHtml(row.id || '')}">Refund</button>
                </div>
              </td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="7">No pending approvals are waiting right now.</td></tr>';

  const summary = document.querySelector('[data-approvals-summary]');
  if (summary) {
    summary.textContent = `${rows.length.toLocaleString()} items waiting`;
  }
}

async function loadAdminApprovals(token) {
  const feedbackNode = document.querySelector('[data-approvals-feedback]');

  const fetchAndRender = async () => {
    const data = await adminFetch('/api/admin/pending-approvals', token);
    populatePendingApprovals(data);
  };

  document.querySelector('[data-approvals-refresh]')?.addEventListener('click', async () => {
    await fetchAndRender();
  });

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-approval-action]');
    if (!button) {
      return;
    }

    const action = button.dataset.approvalAction;
    const approvalId = button.dataset.approvalId;
    const pathMap = {
      approve: `/api/admin/pending-approvals/${approvalId}/approve`,
      refund: `/api/admin/pending-approvals/${approvalId}/refund`,
      requery: `/api/admin/pending-approvals/${approvalId}/requery`,
    };

    try {
      await adminFetch(pathMap[action], token, {
        method: 'POST',
        body: {},
      });
      showSuccess(
        feedbackNode,
        action === 'approve'
          ? 'Pending deposit approved.'
          : action === 'refund'
            ? 'Pending deposit refunded.'
            : 'Pending deposit re-queried.'
      );
      await fetchAndRender();
    } catch (error) {
      showSuccess(feedbackNode, error.message);
    }
  });

  await fetchAndRender();
}

function populateTriviaRoom(data) {
  const summaryHost = document.querySelector('[data-trivia-session-summary]');
  const questionTable = document.querySelector('[data-trivia-table]');
  const session = data.currentSession || null;
  const questions = Array.isArray(data.questions) ? data.questions : [];

  if (summaryHost) {
    summaryHost.innerHTML = session
      ? `
          <article class="admin-mini-card">
            <span class="admin-mini-card__eyebrow">Current Session</span>
            <strong>${escapeHtml(session.title || 'Sunday Live Trivia Rush')}</strong>
            <span class="mini-note">${escapeHtml(formatModeLabel(session.state || 'scheduled'))} • ${new Date(session.scheduledFor).toLocaleString()}</span>
          </article>
          <article class="admin-mini-card">
            <span class="admin-mini-card__eyebrow">Entry</span>
            <strong>${Number(session.entryGoldCost || 0).toLocaleString()} BR9 Gold</strong>
            <span class="mini-note">${Number(session.participants?.length || session.participantsCount || 0).toLocaleString()} joined so far</span>
          </article>
          <article class="admin-mini-card">
            <span class="admin-mini-card__eyebrow">Prize</span>
            <strong>${escapeHtml(session.rewardLabel || '₦5,000 Data')}</strong>
            <span class="mini-note">${Number(session.maxQuestions || 10)} questions • ${Number(session.questionTimeLimitSeconds || 15)}s each</span>
          </article>
        `
      : `
          <article class="admin-mini-card">
            <span class="admin-mini-card__eyebrow">Current Session</span>
            <strong>No session queued yet</strong>
            <span class="mini-note">Save a session below to stage the next Sunday Live.</span>
          </article>
        `;
  }

  if (questionTable) {
    questionTable.innerHTML = questions.length
      ? questions
          .map(
            (question) => `
              <tr>
                <td>${escapeHtml(question.question || '')}</td>
                <td>${escapeHtml(formatModeLabel(question.category || 'general'))}</td>
                <td>${Number(question.rewardPoints || 0).toLocaleString()} pts</td>
                <td>${question.active !== false ? 'Live' : 'Paused'}</td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="4">No trivia questions uploaded yet.</td></tr>';
  }
}

async function loadAdminTrivia(token) {
  const uploadForm = document.querySelector('[data-form="trivia-upload"]');
  const sessionForm = document.querySelector('[data-form="trivia-session"]');
  const feedbackNode = document.querySelector('[data-trivia-feedback]');

  const fetchAndRender = async () => {
    const data = await adminFetch('/api/admin/trivia', token);
    populateTriviaRoom(data);
    return data;
  };

  uploadForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(uploadForm);
      const result = await adminFetch('/api/admin/trivia/upload', token, {
        method: 'POST',
        body: {
          csvText: String(formData.get('csvText') || ''),
        },
      });
      showSuccess(feedbackNode, `Uploaded ${result.uploadedCount} trivia questions.`);
      uploadForm.reset();
      await fetchAndRender();
    } catch (error) {
      showSuccess(feedbackNode, error.message);
    }
  });

  sessionForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(sessionForm);
      await adminFetch('/api/admin/trivia/session', token, {
        method: 'POST',
        body: Object.fromEntries(formData.entries()),
      });
      showSuccess(feedbackNode, 'Trivia session saved successfully.');
      await fetchAndRender();
    } catch (error) {
      showSuccess(feedbackNode, error.message);
    }
  });

  document.querySelector('[data-trivia-advance]')?.addEventListener('click', async () => {
    try {
      await adminFetch('/api/admin/trivia/advance', token, {
        method: 'POST',
        body: {},
      });
      showSuccess(feedbackNode, 'Trivia scheduler advanced.');
      await fetchAndRender();
    } catch (error) {
      showSuccess(feedbackNode, error.message);
    }
  });

  document.querySelector('[data-trivia-download]')?.addEventListener('click', (event) => {
    event.preventDefault();
    window.open(resolveApiUrl('/api/admin/trivia/questions.csv'), '_blank', 'noopener,noreferrer');
  });

  await fetchAndRender();
}

async function loadAdminUsers(token) {
  const searchForm = document.querySelector('[data-form="directory-search"]');
  const creditForm = document.querySelector('[data-form="manual-credit"]');
  const pageSuccessNode = document.querySelector('[data-users-action-feedback]');

  const fetchAndRender = async () => {
    const params = new URLSearchParams();
    if (searchForm) {
      const formData = new FormData(searchForm);
      const search = String(formData.get('search') || '').trim();
      if (search) {
        params.set('search', search);
      }
    }
    const query = params.toString();
    const data = await adminFetch(
      `/api/admin/site-users${query ? `?${query}` : ''}`,
      token
    );
    populateUsersTable(data);
  };

  if (searchForm) {
    searchForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await fetchAndRender();
    });
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-credit-user]');
    if (!button || !creditForm) {
      return;
    }

    creditForm.elements.userId.value = button.dataset.creditUser || '';
    creditForm.elements.userLabel.value = `${button.dataset.creditName || ''} (${button.dataset.creditUsername || ''})`;
  });

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-balance-action]');
    if (!button) {
      return;
    }

    const action = button.dataset.balanceAction || '';
    const userId = button.dataset.userId || '';
    const userName = button.dataset.userName || 'this user';
    const currentBalance = Number(button.dataset.userBalance || 0);
    let amount = currentBalance;

    if (action === 'debit') {
      const amountInput = window.prompt(
        `How much should be subtracted from ${userName}? Current wallet: ${formatCurrency(currentBalance)}`
      );
      if (amountInput === null) {
        return;
      }
      amount = Number.parseFloat(amountInput);
      if (!Number.isFinite(amount) || amount <= 0) {
        showSuccess(pageSuccessNode, 'Enter a valid amount to subtract.');
        return;
      }
    }

    const reason = window.prompt(
      action === 'wipe'
        ? `Why are you wiping ${userName}'s wallet balance?`
        : `Reason for subtracting ${formatCurrency(amount)} from ${userName}:`
    );
    if (!reason || !reason.trim()) {
      showSuccess(pageSuccessNode, 'A reason is required for wallet adjustments.');
      return;
    }

    if (
      action === 'wipe' &&
      !window.confirm(
        `Confirm wallet wipe for ${userName}. This resets the wallet from ${formatCurrency(currentBalance)} to ₦0 and logs the action.`
      )
    ) {
      return;
    }

    try {
      const result = await adminFetch('/api/admin/site-adjust-user-balance', token, {
        method: 'POST',
        body: {
          userId,
          action,
          amount,
          reason,
        },
      });
      showSuccess(
        pageSuccessNode,
        `${result.username} ${action === 'wipe' ? 'wiped' : 'debited'} by ${formatCurrency(result.amount)}. New balance: ${formatCurrency(result.balance)}.`
      );
      await fetchAndRender();
    } catch (error) {
      showSuccess(pageSuccessNode, error.message);
    }
  });

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-status-action]');
    if (!button) {
      return;
    }

    const status = button.dataset.statusAction || '';
    const userId = button.dataset.userId || '';
    const userName = button.dataset.userName || 'this user';
    const label = formatModeLabel(status);
    let reason = '';

    if (status !== 'active') {
      reason = window.prompt(`Reason to mark ${userName} as ${label}:`) || '';
      if (!reason.trim()) {
        showSuccess(pageSuccessNode, 'A reason is required for account restrictions.');
        return;
      }
    }

    if (
      status === 'deleted' &&
      !window.confirm(
        `Delete ${userName}? This is a soft-delete: login and transactions stop, but financial history remains for audit.`
      )
    ) {
      return;
    }

    try {
      const result = await adminFetch('/api/admin/site-user-status', token, {
        method: 'PATCH',
        body: {
          userId,
          status,
          reason,
        },
      });
      showSuccess(
        pageSuccessNode,
        `${result.username} is now ${result.accountStatusLabel}.`
      );
      await fetchAndRender();
    } catch (error) {
      showSuccess(pageSuccessNode, error.message);
    }
  });

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-freeze-wallet]');
    if (!button) {
      return;
    }

    const userId = button.dataset.freezeWallet || '';
    const userName = button.dataset.userName || 'this user';
    const freeze = !/unfreeze/i.test(button.textContent || '');
    const reason =
      freeze
        ? window.prompt(`Why are you freezing ${userName}'s wallet?`) || ''
        : '';

    if (freeze && !reason.trim()) {
      showSuccess(pageSuccessNode, 'A reason is required to freeze a wallet.');
      return;
    }

    try {
      const result = await adminFetch('/api/admin/site-freeze-wallet', token, {
        method: 'POST',
        body: {
          userId,
          freeze,
          reason,
        },
      });
      showSuccess(
        pageSuccessNode,
        result.isFrozen ? `${result.username} wallet frozen.` : `${result.username} wallet restored.`
      );
      await fetchAndRender();
    } catch (error) {
      showSuccess(pageSuccessNode, error.message);
    }
  });

  if (creditForm) {
    creditForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(creditForm);
      const payload = Object.fromEntries(formData.entries());
      const successNode = creditForm.querySelector('.success-banner');

      try {
        const result = await adminFetch('/api/admin/site-credit-user', token, {
          method: 'POST',
          body: {
            userId: payload.userId,
            amount: Number.parseFloat(String(payload.amount || '0')),
            reason: payload.reason,
          },
        });
        showSuccess(
          successNode,
          `${result.username} credited with ${formatCurrency(result.amount)} successfully.`
        );
        creditForm.reset();
        await fetchAndRender();
      } catch (error) {
        showSuccess(successNode, error.message);
      }
    });
  }

  await fetchAndRender();
}

function populatePromoRoom(summary) {
  document.querySelectorAll('[data-promo-status]').forEach((node) => {
    node.textContent = summary ? formatModeLabel(summary.status) : 'Idle';
  });

  document.querySelectorAll('[data-promo-spots]').forEach((node) => {
    if (!summary) {
      node.textContent = 'No live cap';
      return;
    }
    node.textContent =
      summary.spotsRemaining === null
        ? 'Unlimited'
        : `${summary.spotsRemaining} left`;
  });

  document.querySelectorAll('[data-promo-window]').forEach((node) => {
    if (!summary) {
      node.textContent = 'No promo scheduled';
      return;
    }
    const start = new Date(summary.startAt).toLocaleString();
    const end = new Date(summary.endAt).toLocaleString();
    node.textContent = `${start} → ${end}`;
  });

  document.querySelectorAll('[data-promo-copy]').forEach((node) => {
    node.textContent = summary?.bannerText || 'No Golden Window is active right now.';
  });
}

async function loadAdminPromos(token) {
  const promoForm = document.querySelector('[data-form="promo-engine"]');
  const killButton = document.querySelector('[data-promo-kill]');
  const successNode = promoForm?.querySelector('.success-banner');

  const refresh = async () => {
    const summary = await adminFetch('/api/admin/site-promo', token);
    populatePromoRoom(summary);
    return summary;
  };

  if (promoForm) {
    promoForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(promoForm);
      const selectedTargets = promoForm.querySelectorAll(
        'input[name="targetServices"]:checked'
      );

      const payload = {
        title: String(formData.get('title') || '').trim(),
        discountType: String(formData.get('discountType') || 'flat').trim(),
        discountAmount: Number.parseFloat(String(formData.get('discountAmount') || '0')),
        discountPercent: Number.parseFloat(String(formData.get('discountPercent') || '0')),
        maxDiscountValue: Number.parseFloat(String(formData.get('maxDiscountValue') || '0')),
        startAt: formData.get('startAt'),
        endAt: formData.get('endAt'),
        maxUses: Number.parseInt(String(formData.get('maxUses') || '0'), 10),
        individualUserLimit: Number.parseInt(
          String(formData.get('individualUserLimit') || '1'),
          10
        ),
        targetServices: [...selectedTargets].map((input) => input.value),
      };

      try {
        const result = await adminFetch('/api/admin/site-promo', token, {
          method: 'POST',
          body: payload,
        });
        showSuccess(successNode, `Promo saved: ${result.title}`);
        await refresh();
      } catch (error) {
        showSuccess(successNode, error.message);
      }
    });
  }

  if (killButton) {
    killButton.onclick = async () => {
      const node = document.querySelector('[data-promo-kill-result]');
      try {
        await adminFetch('/api/admin/site-promo/kill', token, {
          method: 'POST',
          body: {},
        });
        if (node) {
          showSuccess(node, 'Active promo stopped successfully.');
        }
        await refresh();
      } catch (error) {
        if (node) {
          showSuccess(node, error.message);
        }
      }
    };
  }

  await refresh();
}

async function bindAdminRoom(config) {
  const gateHost = document.querySelector('[data-admin-gate]');
  if (!gateHost) {
    return;
  }

  gateHost.innerHTML = buildAdminGateMarkup();
  const gateForm = gateHost.querySelector('[data-form="admin-gate"]');
  const successNode = gateForm?.querySelector('.success-banner');
  const storedIdentifier = getStoredAdminIdentifier();
  const hiddenTokenFields = document.querySelectorAll('input[name="adminToken"]');
  if (gateForm?.elements.identifier && storedIdentifier) {
    gateForm.elements.identifier.value = storedIdentifier;
  }

  const unlock = async ({ token = '', identifier = '', password = '' }) => {
    const query = (() => {
      try {
        return new URLSearchParams(window.location.search);
      } catch (_error) {
        return new URLSearchParams();
      }
    })();
    const previewCriticalMode = query.get('previewCritical') === '1';
    const autoPreviewAdmin =
      window.location.protocol === 'file:' &&
      (query.get('autoPreviewAdmin') === '1' || previewCriticalMode);
    let trimmedToken = String(token || '').trim();
    const room = document.body.dataset.adminRoom || 'dashboard';

    if (!trimmedToken && window.location.protocol === 'file:') {
      if (autoPreviewAdmin) {
        trimmedToken = 'br9-local-admin';
      } else if (
        String(identifier || '').trim().toLowerCase() !== 'lex' ||
        String(password || '').trim() !== 'br9-local-admin'
      ) {
        throw new Error('Use local preview credentials to unlock this admin room.');
      } else {
        trimmedToken = 'br9-local-admin';
      }
    }

    if (!trimmedToken && window.location.protocol !== 'file:') {
      const trimmedIdentifier = String(identifier || '').trim();
      const trimmedPassword = String(password || '').trim();
      if (!trimmedIdentifier || !trimmedPassword) {
        throw new Error('Enter the admin username or email plus password.');
      }

      const authResponse = await requestJson('/api/admin/site-auth', {
        method: 'POST',
        payload: {
          identifier: trimmedIdentifier,
          password: trimmedPassword,
        },
      });
      trimmedToken = String(authResponse.data?.adminToken || '').trim();
      setStoredAdminIdentifier(trimmedIdentifier);
    }

    if (!trimmedToken) {
      throw new Error('Admin session could not be created.');
    }

    if (window.location.protocol !== 'file:') {
      await adminFetch('/api/admin/site-dashboard', trimmedToken);
    }

    setStoredAdminToken(trimmedToken);
    hiddenTokenFields.forEach((field) => {
      field.value = trimmedToken;
    });
    gateHost.hidden = true;
    document.body.classList.add('admin-room-unlocked');

    if (window.location.protocol === 'file:') {
      const localProfitMatrix = SERVICE_MATRIX.map((item) => ({
        key: item.key,
        totalProfitGenerated: 0,
        transactionVolume: 0,
        transactionCount: 0,
      }));
      const previewCommandFeed = previewCriticalMode
        ? [
            {
              id: 'preview-cmd-critical',
              type: 'Data',
              amount: 290,
              tone: 'critical',
              message: 'Data is on security hold and needs admin review.',
            },
            {
              id: 'preview-cmd-warning',
              type: 'Electricity',
              amount: 12000,
              tone: 'warning',
              message: 'Electricity is waiting on provider verification.',
            },
          ]
        : [];
      const previewCriticalDelays = previewCriticalMode
        ? [
            {
              fullName: 'Stanley Kings',
              type: 'Data',
              reference: 'BR9-DATA-URGENT',
              provider: 'clubkonnect',
              waitingMinutes: 18,
            },
            {
              fullName: 'Ada Okafor',
              type: 'Electricity',
              reference: 'BR9-ELEC-015',
              provider: 'vtpass',
              waitingMinutes: 22,
            },
          ]
        : [];
      populateProfitMatrix({ profitMatrix: localProfitMatrix });
      populateDashboardMetrics({
        platformMode: config.platformMode,
        userCount: 0,
        activeToday: 0,
        transactionCount: 0,
        todayVolume: 0,
        p2pVolume: 0,
        operationalExpenseToday: 0,
        securityEventCount: 0,
        pinFailureCount: 0,
        silentProfitTotal: 0,
        securityEvents: [],
        profitMatrix: localProfitMatrix,
        commandFeed: previewCommandFeed,
        criticalDelays: previewCriticalDelays,
        goldCirculation: {
          totalInCirculation: 0,
          totalBurned: 0,
        },
        goldWalletRule: {
          minimumSuccessfulTransactions: Number(
            config.goldToWalletMinimumSuccessfulTransactions || 5
          ),
        },
      });
      renderAdminCommandFeed(previewCommandFeed);
      renderCriticalDelays(previewCriticalDelays);
      if (room === 'vault') {
        populateTransactionsTable({ totalCount: 0, rows: [] });
      }
      if (room === 'approvals') {
        populatePendingApprovals({ rows: [] });
      }
      if (room === 'directory') {
        populateUsersTable({ totalCount: 0, rows: [] });
      }
      if (room === 'profit') {
        await loadAdminServiceCatalog(trimmedToken);
      }
      if (room === 'promos') {
        populatePromoRoom(null);
      }
      if (room === 'trivia') {
        populateTriviaRoom({ currentSession: null, questions: [] });
      }
      if (room === 'providers') {
        await loadAdminProviders(trimmedToken);
      }
      return;
    }

    if (room === 'dashboard') {
      await loadAdminDashboard(trimmedToken);
    }
    if (room === 'vault') {
      await loadAdminTransactions(trimmedToken);
    }
    if (room === 'approvals') {
      await loadAdminApprovals(trimmedToken);
    }
    if (room === 'directory') {
      await loadAdminUsers(trimmedToken);
    }
    if (room === 'profit') {
      await loadAdminServiceCatalog(trimmedToken);
    }
    if (room === 'settings') {
      await loadAdminDashboard(trimmedToken);
    }
    if (room === 'promos') {
      await loadAdminPromos(trimmedToken);
    }
    if (room === 'trivia') {
      await loadAdminTrivia(trimmedToken);
    }
    if (room === 'providers') {
      await loadAdminProviders(trimmedToken);
    }
  };

  const stored = getStoredAdminToken();
  if (stored) {
    try {
      await unlock({ token: stored });
      return;
    } catch (_error) {
      setStoredAdminToken('');
    }
  }

  gateHost.hidden = false;
  document.body.classList.remove('admin-room-unlocked');

  gateForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await unlock({
        identifier: gateForm.elements.identifier?.value,
        password: gateForm.elements.password?.value,
      });
      showSuccess(successNode, 'Admin access granted. Room unlocked.');
    } catch (error) {
      showSuccess(successNode, error.message);
    }
  });

  if (window.location.protocol === 'file:') {
    try {
      const query = new URLSearchParams(window.location.search);
      if (query.get('autoPreviewAdmin') === '1' || query.get('previewCritical') === '1') {
        await unlock({ token: '', identifier: 'lex', password: 'br9-local-admin' });
        return;
      }
    } catch (_error) {
      // Keep manual unlock if query parsing fails.
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (maybeRedirectLegacyAdminRoute()) {
    return;
  }
  ensureToastHost();
  captureReferralCodeFromLocation();
  const config = await loadConfig();
  renderSiteChrome(config);
  await loadSitePromo();
  bindValidation();
  bindContactForms(config);
  bindAuthUi(config);
  await bindVerifyEmailPage(config);
  await bindSecureAccountPage(config);
  await bindProfilePage(config);
  bindServicePreviewPage();
  bindServicePricing(config);
  bindAdminSettings(config);
  await bindAdminRoom(config);
});
