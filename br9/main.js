const DEFAULT_CONFIG = {
  brandName: 'BR9ja',
  companyName: 'BayRight9ja Ltd',
  slogan: 'Play for BR9 Gold, Pay Your Bills and Win',
  siteUrl: 'https://br9.ng',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.bayright9ja.bayright9ja_mobile',
  appStoreUrl: 'https://apps.apple.com/app/id0000000000',
  platformMode: 'live',
  maintenanceNotice: 'All core services are available for wallet-led growth this week.',
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
  serviceEducationNote: 'WAEC, JAMB, NECO, and exam-pin vending is visible in marketplace.',
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
  serviceMarketplaceStatus: 'live',
  serviceMarketplaceNote: 'Daily needs checkout and cashback loops stay active.',
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
  ['dashboard', 'Dashboard', 'admin/index.html', '📊'],
  ['vault', 'The Vault', 'admin/transactions.html', '🏦'],
  ['directory', 'Directory', 'admin/users.html', '👥'],
  ['profit', 'Profit Matrix', 'admin/services.html', '⚙️'],
  ['providers', 'Provider Pulse', 'admin/providers.html', '🛰️'],
  ['promos', 'Golden Window', 'admin/promos.html', '✨'],
  ['settings', 'App Settings', 'admin/settings/index.html', '📱'],
];

const PROVIDER_CONFIG_KEY = 'br9.providerConfig';

const DEFAULT_PROVIDER_CONFIG = {
  funding: {
    primaryProvider: 'squad',
    backupProvider: 'monnify',
    zeroFeeBalance: true,
    providerFeeBps: 10,
    defaultBankLabel: 'GTBank',
  },
  endpoints: {
    peyflexBaseUrl: '',
    vtpassBaseUrl: 'https://vtpass.com/api',
    squadBaseUrl: 'https://sandbox-api-d.squadco.com',
    monnifyBaseUrl: 'https://sandbox.monnify.com',
    remitaBaseUrl: '',
    billPayBaseUrl: '',
    flutterwaveBaseUrl: '',
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

const PROVIDER_ROUTE_FIELDS = [
  ['airtime', 'Airtime'],
  ['data', 'Data Bundles'],
  ['electricity', 'Electricity'],
  ['cableTv', 'Cable TV & Internet'],
  ['education', 'Education Pins'],
  ['transport', 'Transport'],
  ['government', 'Government / RRR'],
  ['betting', 'Betting Wallet Funding'],
  ['marketplace', 'Marketplace'],
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
  {
    key: 'marketplace',
    label: 'Marketplace',
    markupField: 'serviceMarketplaceMarkup',
    statusField: 'serviceMarketplaceStatus',
    noteField: 'serviceMarketplaceNote',
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
  marketplace: 'Marketplace',
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
  { label: 'Lifestyle', keys: ['betting', 'marketplace'] },
];

const ADMIN_CONFIG_FIELDS = [
  'siteUrl',
  'playStoreUrl',
  'appStoreUrl',
  'platformMode',
  'maintenanceNotice',
  'opsEmail',
  'supportEmail',
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
  'serviceMarketplaceStatus',
  'serviceMarketplaceNote',
  'serviceMarketplaceMarkup',
  ...SUPER_APP_MARKUP_FIELDS,
  'marketRunnerStatus',
  'triviaRushStatus',
  'sundayLiveStatus',
  'gameAccessMode',
  'mondayBenchmarkGold',
  'mondayBenchmarkNaira',
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
const AUTH_SESSION_KEY = 'br9.authenticated';
const AUTH_USER_KEY = 'br9.auth.user';
const PREVIEW_USERS_KEY = 'br9.previewUsers';
const REMEMBERED_IDENTITY_KEY = 'br9.auth.identity';
const PASSWORD_RESET_KEY = 'br9.auth.reset';
const PHONE_VERIFY_KEY = 'br9.auth.phoneVerify';
let currentPromoSummary = null;
let promoTicker = null;

function getBasePath() {
  return document.body.dataset.base || '.';
}

function getPageName() {
  return document.body.dataset.page || 'home';
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

function serialiseAuthUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    phoneVerified: Boolean(user.phoneVerified),
    phoneVerifiedAt: user.phoneVerifiedAt || null,
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
  } catch (_error) {
    // Ignore storage failures in preview mode.
  }
}

function clearStoredAuthUser() {
  try {
    sessionStorage.removeItem(AUTH_USER_KEY);
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
    phoneVerified: false,
    phoneVerifiedAt: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    firstLoginCompleted: true,
    quickAccessMode: 'pin-password',
  };

  users.unshift(nextUser);
  setStoredPreviewUsers(users);
  setStoredAuthUser(nextUser);
  return nextUser;
}

async function loginPreviewUser(identity, secret) {
  const user = findPreviewUserByIdentity(identity);
  if (!user) {
    throw new Error('No BR9ja account was found for that email, username, or phone number on this device yet.');
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
  return { code, channel, user };
}

async function completePasswordReset(payload) {
  const challenge = getStoredResetChallenge();
  if (!challenge || challenge.expiresAt < Date.now()) {
    throw new Error('The reset code has expired. Request a fresh code and try again.');
  }

  const code = String(payload.code || '').trim();
  const newPassword = String(payload.password || '').trim();
  const confirmPassword = String(payload.confirmPassword || '').trim();

  if (!VALIDATORS.otp(code)) {
    throw new Error('Enter the full 6-digit reset code.');
  }

  if (newPassword !== confirmPassword) {
    throw new Error('New passwords do not match yet.');
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

  const updatedUser = updatePreviewUser(userId, (current) => ({
    ...current,
    phoneVerified: true,
    phoneVerifiedAt: new Date().toISOString(),
  }));

  setStoredPhoneVerificationChallenge(null);
  setStoredAuthUser(updatedUser);
  return updatedUser;
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

function buildHeaderAuthMarkup(base, authUser = getStoredAuthUser()) {
  if (authUser) {
    const label = authUser.firstName || authUser.username || 'Profile';
    return `
      <div class="site-header__quick-auth">
        <a class="header-auth-button header-auth-button--profile" href="${base}/profile.html">${escapeHtml(label)}</a>
        <button class="header-auth-button header-auth-button--logout" type="button" data-auth-logout>Logout</button>
      </div>
    `;
  }

  return `
    <div class="site-header__quick-auth site-header__quick-auth--guest">
      <div class="site-header__quick-auth-group site-header__quick-auth-group--desktop">
        <a class="header-auth-button header-auth-button--login" href="${base}/login.html">Login</a>
        <a class="header-auth-button header-auth-button--signup" href="${base}/signup.html">Sign Up</a>
      </div>
      <a class="header-auth-button header-auth-button--combo header-auth-button--signup" href="${base}/login.html">Login/SignUp</a>
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
        ${buildHeaderAuthMarkup(base, authUser)}
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
  const navLinks = ADMIN_NAV_ITEMS.map(([key, label, href, icon]) => {
    const active = currentRoom === key ? 'is-active' : '';
    return `
      <a class="admin-sidebar__link ${active}" href="${base}/${href}">
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
        <p class="mini-note">Admin token unlock is required before any BR9ja room becomes interactive.</p>
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
        ${SOCIAL_ICONS[iconKey]}
        <span class="sr-only">${label}</span>
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
    themeMeta.setAttribute('content', nextTheme === 'light' ? '#F8F9FA' : '#010A1F');
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
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.');
  }
  return data;
}

function showSuccess(target, message) {
  if (!target) {
    return;
  }
  target.textContent = message;
  target.classList.add('is-visible');
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

  document.querySelectorAll('[data-toggle-password]').forEach((toggle) => {
    toggle.addEventListener('change', () => {
      const selector = toggle.dataset.togglePassword;
      const input = selector ? document.querySelector(selector) : null;
      if (!(input instanceof HTMLInputElement)) {
        return;
      }
      input.type = toggle.checked ? 'text' : 'password';
    });
  });

  document.querySelectorAll('[data-form="auth-preview"]').forEach((form) => {
    const mode = form.dataset.authMode || 'login';
    const successNode = form.querySelector('.success-banner');

    if (mode === 'signup') {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(form).entries());

        try {
          const user = await registerPreviewUser({
            fullName: payload.fullName,
            username: payload.username,
            email: payload.email,
            phoneNumber: payload.phone,
            password: payload.password,
            confirmPassword: payload.confirmPassword,
            pin: payload.pin,
          });
          showSuccess(successNode, `Welcome to BR9ja, ${user.firstName}. Your account is ready and you are being taken to your profile.`);
          setTimeout(() => {
            window.location.href = `${getBasePath()}/profile.html`;
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
        const user = await loginPreviewUser(payload.identity, payload.secret);
        bindWhatsAppVisibility();
        showSuccess(
          successNode,
          user.phoneVerified
            ? `Welcome back, ${user.firstName}. Opening your BR9ja profile now.`
            : `Welcome back, ${user.firstName}. Log in complete. Verify your phone number next inside your profile.`
        );
        setTimeout(() => {
          window.location.href = `${getBasePath()}/profile.html`;
        }, 300);
      } catch (error) {
        showSuccess(successNode, error.message);
      }
    });
  });

  document.querySelectorAll('[data-quick-login]').forEach((button) => {
    if (rememberedIdentity && findPreviewUserByIdentity(rememberedIdentity)) {
      button.textContent = 'Use Device Unlock';
    }

    button.addEventListener('click', async () => {
      const feedback = document.querySelector('[data-quick-login-feedback]');
      try {
        const method = button.dataset.quickLogin || 'device';
        const user = await quickAccessLogin(method);
        showSuccess(
          feedback,
          `${formatModeLabel(method)} accepted for ${user.firstName}. Opening your BR9ja profile now.`
        );
        setTimeout(() => {
          window.location.href = `${getBasePath()}/profile.html`;
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

    sendButton?.addEventListener('click', async () => {
      const identity = String(resetForm.elements.identity?.value || '').trim();
      try {
        const challenge = await startPasswordReset(identity);
        showSuccess(
          successNode,
          `Preview reset code sent by ${challenge.channel}. Use ${challenge.code} below, then set the new password twice.`
        );
      } catch (error) {
        showSuccess(successNode, error.message);
      }
    });

    resetForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        await completePasswordReset({
          code: resetForm.elements.code?.value,
          password: resetForm.elements.password?.value,
          confirmPassword: resetForm.elements.confirmPassword?.value,
        });
        showSuccess(successNode, 'Password reset complete. You are being logged in now.');
        setTimeout(() => {
          window.location.href = `${getBasePath()}/profile.html`;
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

function bindProfilePage() {
  if (getPageName() !== 'profile') {
    return;
  }

  const user = getStoredAuthUser();
  if (!user) {
    window.location.href = `${getBasePath()}/login.html`;
    return;
  }

  const profileMap = {
    firstName: user.firstName || 'BR9ja User',
    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    username: `@${user.username || 'member'}`,
    email: user.email || 'No email stored yet',
    phoneNumber: user.phoneNumber || 'No phone number saved yet',
    phoneStatus: user.phoneVerified ? 'Verified' : 'Verification pending',
    quickAccess: user.firstLoginCompleted
      ? 'Quick access is ready with password, 6-digit PIN, Face ID, device PIN, or pattern on this device.'
      : 'First sign-in still needs your password before quick access unlocks.',
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

  const verifyForm = document.querySelector('[data-form="phone-verification"]');
  if (!verifyForm) {
    return;
  }

  const successNode = verifyForm.querySelector('.success-banner');
  const sendButton = verifyForm.querySelector('[data-phone-send]');
  const verifyButton = verifyForm.querySelector('[data-phone-verify]');
  const codeInput = verifyForm.querySelector('input[name="code"]');

  if (user.phoneVerified) {
    verifyForm.classList.add('is-hidden');
    return;
  }

  sendButton?.addEventListener('click', async () => {
    try {
      const challenge = await startPhoneVerification(user.id);
      showSuccess(
        successNode,
        `Preview phone verification code sent to ${user.phoneNumber}. Use ${challenge.code} to complete verification.`
      );
    } catch (error) {
      showSuccess(successNode, error.message);
    }
  });

  verifyButton?.addEventListener('click', async () => {
    try {
      const updatedUser = await completePhoneVerification(user.id, codeInput?.value || '');
      showSuccess(successNode, `${updatedUser.phoneNumber} is now verified for this BR9ja profile.`);
      setTimeout(() => {
        window.location.reload();
      }, 250);
    } catch (error) {
      showSuccess(successNode, error.message);
    }
  });
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
        <span class="kicker">Admin Token Required</span>
        <h1>Unlock the BR9ja headquarters.</h1>
        <p class="section-copy">Every room stays locked until the admin token is verified. This protects The Vault, Directory, Profit Matrix, and live ops controls.</p>
        <form class="admin-gate__form" data-form="admin-gate">
          <div class="field-group">
            <label for="admin-gate-token">Admin Token</label>
            <div class="field-shell">
              <input id="admin-gate-token" name="adminToken" type="password" placeholder="Enter admin token to continue">
            </div>
            <span class="field-status" data-default="Use the secure token configured for BR9ja site admin access.">Use the secure token configured for BR9ja site admin access.</span>
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
  document.querySelectorAll('[data-admin-metric]').forEach((node) => {
    const key = node.dataset.adminMetric;
    if (!key) {
      return;
    }

    const value = data[key];
    if (typeof value === 'number') {
      node.textContent =
        key.includes('Volume') || key.includes('Profit') || key.includes('Expense')
          ? formatCurrency(value)
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
              <td>${row.reference}</td>
              <td>${row.service}</td>
              <td>${formatCurrency(row.amount)}</td>
              <td>${formatCurrency(row.silentProfit)}</td>
              <td>${new Date(row.timestamp).toLocaleString()}</td>
              <td>${row.status}</td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="6">No transactions matched that filter window yet.</td></tr>';

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

async function loadAdminDashboard(token) {
  const data = await adminFetch('/api/admin/site-dashboard', token);
  populateDashboardMetrics(data);
  populateProfitMatrix(data);
}

async function loadAdminTransactions(token) {
  const filterForm = document.querySelector('[data-form="vault-filter"]');

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
  const hiddenTokenFields = document.querySelectorAll('input[name="adminToken"]');

  const unlock = async (token) => {
    const trimmedToken = String(token || '').trim();
    if (!trimmedToken) {
      throw new Error('Enter the admin token to continue.');
    }

    const room = document.body.dataset.adminRoom || 'dashboard';

    if (window.location.protocol === 'file:' && trimmedToken !== 'br9-local-admin') {
      throw new Error('Use the local preview token to unlock admin rooms in file preview.');
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
      });
      if (room === 'vault') {
        populateTransactionsTable({ totalCount: 0, rows: [] });
      }
      if (room === 'directory') {
        populateUsersTable({ totalCount: 0, rows: [] });
      }
      if (room === 'promos') {
        populatePromoRoom(null);
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
    if (room === 'directory') {
      await loadAdminUsers(trimmedToken);
    }
    if (room === 'profit') {
      await loadAdminDashboard(trimmedToken);
    }
    if (room === 'settings') {
      await loadAdminDashboard(trimmedToken);
    }
    if (room === 'promos') {
      await loadAdminPromos(trimmedToken);
    }
    if (room === 'providers') {
      await loadAdminProviders(trimmedToken);
    }
  };

  const stored = getStoredAdminToken();
  if (stored) {
    try {
      await unlock(stored);
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
      await unlock(gateForm.elements.adminToken.value);
      showSuccess(successNode, 'Admin token accepted. Room unlocked.');
    } catch (error) {
      showSuccess(successNode, error.message);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const config = await loadConfig();
  renderSiteChrome(config);
  await loadSitePromo();
  bindValidation();
  bindContactForms(config);
  bindAuthUi(config);
  bindProfilePage(config);
  bindServicePricing(config);
  bindAdminSettings(config);
  await bindAdminRoom(config);
});
