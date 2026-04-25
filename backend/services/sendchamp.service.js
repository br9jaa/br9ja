'use strict';

function resolveSendchampBaseUrl() {
  return String(
    process.env.SENDCHAMP_BASE_URL || 'https://api.sendchamp.com/api/v1'
  ).replace(/\/$/, '');
}

function normaliseIntlPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('234')) {
    return digits;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return `234${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `234${digits}`;
  }

  return digits;
}

async function sendSendchampOtp({
  channel = 'sms',
  recipient = '',
  sender = 'BR9ja',
  code,
  purpose = 'verification',
  expiresInMinutes = 10,
  deepLink = '',
}) {
  const trimmedCode = String(code || '').trim();
  const trimmedRecipient = String(recipient || '').trim();
  const safeChannel = ['sms', 'whatsapp', 'email'].includes(channel)
    ? channel
    : 'sms';

  if (!trimmedCode || !trimmedRecipient) {
    return {
      deliveryMode: 'skipped',
      providerMessageId: '',
    };
  }

  if (process.env.NODE_ENV === 'test' || !process.env.SENDCHAMP_KEY) {
    console.log(
      `[SENDCHAMP][DEV][${safeChannel.toUpperCase()}] ${trimmedRecipient}: ${trimmedCode}`
    );
    return {
      deliveryMode: 'dev-log',
      providerMessageId: `sendchamp-dev-${Date.now()}`,
    };
  }

  const payload = {
    channel: safeChannel,
    sender,
    token_type: 'numeric',
    token_length: trimmedCode.length,
    expiration_time: expiresInMinutes,
    meta_data: {
      token: trimmedCode,
      purpose,
      ...(deepLink ? { deep_link: deepLink } : {}),
    },
  };

  if (safeChannel === 'email') {
    payload.customer_email_address = trimmedRecipient.toLowerCase();
  } else {
    payload.customer_mobile_number = normaliseIntlPhone(trimmedRecipient);
  }

  const response = await fetch(`${resolveSendchampBaseUrl()}/verification/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDCHAMP_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Sendchamp OTP request failed.');
  }

  const dataResponse = await response.json().catch(() => ({}));
  return {
    deliveryMode: `sendchamp-${safeChannel}`,
    providerMessageId:
      dataResponse?.data?.reference ||
      dataResponse?.data?.id ||
      dataResponse?.reference ||
      dataResponse?.id ||
      `sendchamp-${Date.now()}`,
  };
}

async function sendSendchampPush({
  user = {},
  title,
  body,
  data = {},
}) {
  const payload = {
    title: String(title || '').trim(),
    body: String(body || '').trim(),
    recipient: {
      userId: user.id || user.userId || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
    },
    data,
  };

  if (!payload.title || !payload.body) {
    return {
      deliveryMode: 'skipped',
      reason: 'missing-payload',
    };
  }

  if (
    process.env.NODE_ENV === 'test' ||
    !process.env.SENDCHAMP_KEY ||
    !process.env.SENDCHAMP_PUSH_URL
  ) {
    console.log('[SENDCHAMP][DEV]', JSON.stringify(payload, null, 2));
    return {
      deliveryMode: 'dev-log',
      messageId: `sendchamp-dev-${Date.now()}`,
    };
  }

  const response = await fetch(process.env.SENDCHAMP_PUSH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDCHAMP_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Sendchamp push request failed.');
  }

  const dataResponse = await response.json().catch(() => ({}));
  return {
    deliveryMode: 'sendchamp',
    messageId:
      dataResponse?.data?.id ||
      dataResponse?.messageId ||
      dataResponse?.id ||
      `sendchamp-${Date.now()}`,
  };
}

async function sendSendchampMessage({
  channel = 'sms',
  to = '',
  message = '',
  sender = 'BR9ja',
}) {
  const safeChannel = channel === 'whatsapp' ? 'whatsapp' : 'sms';
  const recipient = safeChannel === 'whatsapp' ? normaliseIntlPhone(to) : normaliseIntlPhone(to);
  const content = String(message || '').trim();

  if (!recipient || !content) {
    return {
      deliveryMode: 'skipped',
      messageId: '',
    };
  }

  if (process.env.NODE_ENV === 'test' || !process.env.SENDCHAMP_KEY) {
    console.log(
      `[SENDCHAMP][DEV][${safeChannel.toUpperCase()}] ${recipient}: ${content}`
    );
    return {
      deliveryMode: 'dev-log',
      messageId: `sendchamp-dev-${Date.now()}`,
    };
  }

  const endpoint =
    safeChannel === 'whatsapp'
      ? process.env.SENDCHAMP_WHATSAPP_URL ||
        `${resolveSendchampBaseUrl()}/whatsapp/message/send`
      : process.env.SENDCHAMP_SMS_URL ||
        `${resolveSendchampBaseUrl()}/sms/send`;

  const payload =
    safeChannel === 'whatsapp'
      ? {
          recipient,
          message: content,
          sender,
        }
      : {
          to: [recipient],
          message: content,
          sender_name: sender,
          route: 'dnd',
        };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDCHAMP_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Sendchamp message request failed.');
  }

  const dataResponse = await response.json().catch(() => ({}));
  return {
    deliveryMode: `sendchamp-${safeChannel}`,
    messageId:
      dataResponse?.data?.id ||
      dataResponse?.data?.reference ||
      dataResponse?.messageId ||
      dataResponse?.id ||
      `sendchamp-${Date.now()}`,
  };
}

module.exports = {
  sendSendchampMessage,
  sendSendchampOtp,
  sendSendchampPush,
};
