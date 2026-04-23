'use strict';

async function sendSiteMail({
  to,
  subject,
  text,
  html,
  replyTo,
  meta = {},
}) {
  const payload = {
    to,
    subject,
    text,
    html,
    replyTo,
    meta,
  };

  if (process.env.NODE_ENV === 'test' || !process.env.SITE_MAILER_WEBHOOK_URL) {
    console.log('[SITE MAILER][DEV]', JSON.stringify(payload, null, 2));
    return {
      deliveryMode: 'dev-log',
      messageId: `dev-${Date.now()}`,
    };
  }

  const response = await fetch(process.env.SITE_MAILER_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.SITE_MAILER_API_KEY
        ? { Authorization: `Bearer ${process.env.SITE_MAILER_API_KEY}` }
        : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || 'Mail relay request failed.');
  }

  const data = await response.json().catch(() => ({}));
  return {
    deliveryMode: 'webhook',
    messageId: data.messageId || data.id || `mail-${Date.now()}`,
  };
}

module.exports = {
  sendSiteMail,
};
