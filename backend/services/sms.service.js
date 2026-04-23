'use strict';

const axios = require('axios');

function normaliseSmsPhoneNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('234')) {
    return `+${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return `+234${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `+234${digits}`;
  }

  return `+${digits}`;
}

function maskPhoneNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 4) {
    return digits;
  }

  const tail = digits.slice(-4);
  return `••••••${tail}`;
}

function buildVerificationMessage(code) {
  const template = String(process.env.SMS_TEMPLATE || '').trim();
  if (template) {
    return template.replaceAll('{{code}}', code);
  }

  return `${code} is your BR9ja verification code. It expires in 10 minutes.`;
}

async function sendVerificationSms({ phoneNumber, code }) {
  const providerUrl = String(process.env.SMS_PROVIDER_URL || '').trim();
  const apiKey = String(process.env.SMS_API_KEY || '').trim();
  const senderId = String(process.env.SMS_SENDER_ID || 'BR9ja').trim();
  const recipient = normaliseSmsPhoneNumber(phoneNumber);
  const message = buildVerificationMessage(code);

  if (!providerUrl || process.env.NODE_ENV === 'test') {
    console.log(`[SMS][DEV] ${recipient}: ${message}`);
    return {
      deliveryMode: 'dev-log',
      providerMessageId: '',
    };
  }

  const response = await axios.post(
    providerUrl,
    {
      to: recipient,
      message,
      sender: senderId,
      channel: 'sms',
    },
    {
      timeout: Number(process.env.SMS_TIMEOUT_MS || 12000),
      headers: {
        Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    deliveryMode: 'sms',
    providerMessageId:
      response.data?.messageId?.toString() ||
      response.data?.id?.toString() ||
      '',
  };
}

module.exports = {
  maskPhoneNumber,
  normaliseSmsPhoneNumber,
  sendVerificationSms,
};
