'use strict';

const crypto = require('crypto');

function normaliseLoginIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function buildLoginQuery(identifier) {
  const normalised = normaliseLoginIdentifier(identifier);
  if (!normalised) {
    return null;
  }

  const bayrightTag = normalised.startsWith('@')
    ? normalised
    : `@${normalised}`;

  return {
    $or: [
      { email: normalised },
      { bayrightTag: normalised },
      { bayrightTag },
    ],
  };
}

function resolveWebFingerprint(req) {
  const rawFingerprint = String(
    req.get('X-Web-Fingerprint') ||
      req.body?.webFingerprint ||
      req.body?.fingerprint ||
      ''
  ).trim();

  if (!rawFingerprint) {
    return '';
  }

  // Web clients can send the raw FingerprintJS visitor id. We hash it server-side
  // before comparing it with stored device bindings to avoid persisting it in plain text.
  return crypto.createHash('sha256').update(rawFingerprint).digest('hex');
}

function resolveSessionContext(req, user = null) {
  const platform = String(
    req.get('X-Client-Platform') || req.body?.platform || ''
  )
    .trim()
    .toLowerCase();
  const deviceId = String(req.get('X-Device-ID') || req.body?.deviceId || '').trim();
  const webFingerprint = resolveWebFingerprint(req);

  const isWeb =
    platform === 'web' ||
    Boolean(webFingerprint) ||
    String(req.get('Sec-CH-UA-Platform') || '').toLowerCase().includes('mac') ||
    String(req.get('Origin') || '').toLowerCase().includes('http');

  const resolvedDeviceId = isWeb ? webFingerprint || deviceId : deviceId;
  const requiresSecureTransfer =
    Boolean(user?.activeDeviceId) &&
    Boolean(resolvedDeviceId) &&
    user.activeDeviceId !== resolvedDeviceId &&
    isWeb;

  return {
    isWeb,
    platform: isWeb ? 'web' : 'mobile',
    rawDeviceId: deviceId,
    resolvedDeviceId,
    requiresSecureTransfer,
    sessionTransfer: {
      required: requiresSecureTransfer,
      message: requiresSecureTransfer
        ? 'Secure Device Transfer required. This web login does not match the currently trusted mobile device.'
        : '',
    },
  };
}

module.exports = {
  buildLoginQuery,
  normaliseLoginIdentifier,
  resolveSessionContext,
  resolveWebFingerprint,
};
