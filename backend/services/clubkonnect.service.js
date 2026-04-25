'use strict';

const axios = require('axios');

function resolveClubkonnectBaseUrl() {
  return String(
    process.env.CLUBKONNECT_BASE_URL || 'https://www.clubkonnect.com'
  ).replace(/\/$/, '');
}

function shouldUseDemoClubkonnect() {
  return process.env.NODE_ENV !== 'production' && process.env.CLUBKONNECT_DEMO !== 'false';
}

function getClubkonnectCredentials() {
  return {
    userId: String(process.env.CLUBKONNECT_USER_ID || '').trim(),
    apiKey: String(process.env.CLUBKONNECT_API_KEY || '').trim(),
  };
}

function parseClubkonnectResponse(payload) {
  if (payload && typeof payload === 'object') {
    return payload;
  }

  const raw = String(payload || '').trim();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return { raw };
  }
}

function buildRequestId(prefix) {
  return `BR9-${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function normaliseProviderStatus(rawStatus = '', defaultStatus = 'pending') {
  const safe = String(rawStatus || '').trim().toLowerCase();
  if (
    ['success', 'successful', 'completed', 'approved', 'delivered'].includes(safe) ||
    safe === '00'
  ) {
    return 'success';
  }
  if (
    ['failed', 'error', 'reversed', 'cancelled', 'declined', 'out_of_stock'].includes(safe) ||
    safe === '01'
  ) {
    return 'failed';
  }
  return defaultStatus;
}

async function callClubkonnect(endpoint, params = {}) {
  const { userId, apiKey } = getClubkonnectCredentials();

  if (!userId || !apiKey) {
    const error = new Error('Clubkonnect credentials are not configured.');
    error.statusCode = 503;
    throw error;
  }

  const response = await axios.get(`${resolveClubkonnectBaseUrl()}/${endpoint}`, {
    timeout: Number(process.env.VENDOR_TIMEOUT_MS || 15000),
    params: {
      UserID: userId,
      APIKey: apiKey,
      ...params,
    },
  });

  return parseClubkonnectResponse(response.data);
}

async function checkClubkonnectBalance() {
  if (shouldUseDemoClubkonnect()) {
    return {
      balance: 100000,
      raw: { status: 'demo' },
    };
  }

  const payload = await callClubkonnect('APICheckBalance.asp');
  const balance = Number(
    payload.balance ||
      payload.Balance ||
      payload.wallet_balance ||
      payload.availableBalance ||
      0
  );

  return {
    balance: Number.isFinite(balance) ? balance : 0,
    raw: payload,
  };
}

async function requeryClubkonnectTransaction(reference) {
  if (shouldUseDemoClubkonnect()) {
    return {
      reference,
      status: 'pending',
      provider: 'clubkonnect-demo',
      raw: { status: 'pending' },
    };
  }

  const payload = await callClubkonnect(
    process.env.CLUBKONNECT_REQUERY_ENDPOINT || 'APIQueryTransaction.asp',
    {
      RequestID: reference,
      reference,
    }
  );

  const status = normaliseProviderStatus(
    payload.status ||
      payload.Status ||
      payload.response_description ||
      payload.responseMessage ||
      payload.message ||
      payload.code
  );

  return {
    reference,
    status,
    provider: 'clubkonnect',
    raw: payload,
  };
}

async function purchaseAirtimeWithClubkonnect({ network, phoneNumber, amount }) {
  if (shouldUseDemoClubkonnect()) {
    return {
      provider: 'clubkonnect-demo',
      amount,
      phoneNumber,
      network,
      receiptNumber: buildRequestId('AIR'),
      raw: {},
    };
  }

  const payload = await callClubkonnect('APIBuyAirtime.asp', {
    MobileNetwork: network,
    Amount: amount,
    MobileNumber: phoneNumber,
    RequestID: buildRequestId('AIR'),
  });

  return {
    provider: 'clubkonnect',
    amount,
    phoneNumber,
    network,
    status: normaliseProviderStatus(
      payload.status || payload.Status || payload.response_description || payload.message || payload.code,
      'success'
    ),
    receiptNumber: String(
      payload.requestID ||
        payload.RequestID ||
        payload.transactionRef ||
        payload.reference ||
        buildRequestId('AIR')
    ).trim(),
    raw: payload,
  };
}

async function purchaseDataWithClubkonnect({
  network,
  phoneNumber,
  planCode,
  amount = 0,
}) {
  if (shouldUseDemoClubkonnect()) {
    return {
      provider: 'clubkonnect-demo',
      amount,
      phoneNumber,
      network,
      planCode,
      receiptNumber: buildRequestId('DATA'),
      raw: {},
    };
  }

  const payload = await callClubkonnect('APIBuyData.asp', {
    MobileNetwork: network,
    MobileNumber: phoneNumber,
    DataPlan: planCode,
    RequestID: buildRequestId('DATA'),
  });

  const billedAmount = Number(payload.amount || payload.Amount || amount || 0);

  return {
    provider: 'clubkonnect',
    amount: Number.isFinite(billedAmount) ? billedAmount : amount,
    phoneNumber,
    network,
    planCode,
    status: normaliseProviderStatus(
      payload.status || payload.Status || payload.response_description || payload.message || payload.code,
      'success'
    ),
    receiptNumber: String(
      payload.requestID ||
        payload.RequestID ||
        payload.transactionRef ||
        payload.reference ||
        buildRequestId('DATA')
    ).trim(),
    raw: payload,
  };
}

async function verifyMeterWithClubkonnect({ meterNumber, discoCode, meterType }) {
  if (shouldUseDemoClubkonnect()) {
    return {
      customerName: 'CHUKWUMA OKORIE',
      address: 'Demo address',
      meterNumber,
      serviceID: discoCode,
      type: meterType,
      provider: 'clubkonnect-demo',
      raw: {},
    };
  }

  const payload = await callClubkonnect('APIVerifyMeterNumber.asp', {
    MeterNo: meterNumber,
    DiscoCode: discoCode,
    MeterType: meterType,
  });

  return {
    customerName: String(
      payload.name ||
        payload.customer_name ||
        payload.CustomerName ||
        payload.customerName ||
        ''
    ).trim(),
    address: String(payload.address || payload.Address || '').trim(),
    meterNumber,
    serviceID: discoCode,
    type: meterType,
    provider: 'clubkonnect',
    raw: payload,
  };
}

async function purchaseElectricityWithClubkonnect({
  meterNumber,
  discoCode,
  meterType,
  amount,
  phoneNumber,
}) {
  if (shouldUseDemoClubkonnect()) {
    return {
      token: meterType === 'prepaid' ? '1234-5678-9012-3456-7890' : '',
      receiptNumber: buildRequestId('ELEC'),
      amount,
      provider: 'clubkonnect-demo',
      raw: {},
    };
  }

  const payload = await callClubkonnect('APIBuyElectricity.asp', {
    MeterNo: meterNumber,
    DiscoCode: discoCode,
    MeterType: meterType,
    Amount: amount,
    PhoneNumber: phoneNumber,
    RequestID: buildRequestId('ELEC'),
  });

  return {
    token: String(
      payload.token || payload.Token || payload.recharge_pin || ''
    ).trim(),
    status: normaliseProviderStatus(
      payload.status || payload.Status || payload.response_description || payload.message || payload.code,
      'success'
    ),
    receiptNumber: String(
      payload.requestID ||
        payload.RequestID ||
        payload.reference ||
        buildRequestId('ELEC')
    ).trim(),
    amount,
    provider: 'clubkonnect',
    raw: payload,
  };
}

async function verifyCableWithClubkonnect({ serviceId, smartcardNumber }) {
  if (shouldUseDemoClubkonnect()) {
    return {
      customerName: 'BR9JA DEMO CUSTOMER',
      currentBouquet: 'Compact',
      billersCode: smartcardNumber,
      serviceID: serviceId,
      plans: [],
      provider: 'clubkonnect-demo',
      raw: {},
    };
  }

  const payload = await callClubkonnect('APICableTVInfo.asp', {
    CableTV: serviceId,
    SmartCardNo: smartcardNumber,
  });

  return {
    customerName: String(
      payload.customer_name ||
        payload.customerName ||
        payload.name ||
        ''
    ).trim(),
    currentBouquet: String(
      payload.current_bouquet ||
        payload.currentBouquet ||
        payload.package ||
        ''
    ).trim(),
    billersCode: smartcardNumber,
    serviceID: serviceId,
    plans: Array.isArray(payload.plans) ? payload.plans : [],
    provider: 'clubkonnect',
    raw: payload,
  };
}

async function payCableWithClubkonnect({
  serviceId,
  smartcardNumber,
  packageCode,
  amount,
  phoneNumber,
}) {
  if (shouldUseDemoClubkonnect()) {
    return {
      receiptNumber: buildRequestId('CABLE'),
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount,
      provider: 'clubkonnect-demo',
      raw: {},
    };
  }

  const payload = await callClubkonnect('APICableTV.asp', {
    CableTV: serviceId,
    SmartCardNo: smartcardNumber,
    Package: packageCode,
    Amount: amount,
    PhoneNumber: phoneNumber,
    RequestID: buildRequestId('CABLE'),
  });

  return {
    status: normaliseProviderStatus(
      payload.status || payload.Status || payload.response_description || payload.message || payload.code,
      'success'
    ),
    receiptNumber: String(
      payload.requestID ||
        payload.RequestID ||
        payload.reference ||
        buildRequestId('CABLE')
    ).trim(),
    nextRenewalDate:
      payload.nextRenewalDate || payload.renewal_date || null,
    amount,
    provider: 'clubkonnect',
    raw: payload,
  };
}

module.exports = {
  callClubkonnect,
  checkClubkonnectBalance,
  purchaseAirtimeWithClubkonnect,
  purchaseDataWithClubkonnect,
  purchaseElectricityWithClubkonnect,
  payCableWithClubkonnect,
  requeryClubkonnectTransaction,
  verifyCableWithClubkonnect,
  verifyMeterWithClubkonnect,
};
