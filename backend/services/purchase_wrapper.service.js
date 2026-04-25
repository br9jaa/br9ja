'use strict';

const { shouldTreatAsPendingVerification } = require('./transaction_integrity.service');

function isRetryableProviderError(error) {
  if (!error) {
    return false;
  }

  const status = Number(error.response?.status || error.statusCode || 0);
  const code = String(error.code || '').trim().toUpperCase();
  const message = String(error.message || '').trim().toLowerCase();

  return (
    status === 504 ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('socket hangup')
  );
}

function normaliseVendorState(vendorResult) {
  const status = String(vendorResult?.status || '').trim().toLowerCase();

  if (!status) {
    return 'success';
  }

  if (['pending', 'pending_verification', 'processing'].includes(status)) {
    return 'pending_verification';
  }

  if (status === 'failed') {
    return 'failed';
  }

  return 'success';
}

async function executeProtectedPurchase({
  attempt,
  onPending,
  failedMessage = 'Provider rejected this request.',
  failedStatusCode = 502,
  maxAttempts = 2,
}) {
  if (typeof attempt !== 'function') {
    throw new Error('executeProtectedPurchase requires an attempt function.');
  }

  if (typeof onPending !== 'function') {
    throw new Error('executeProtectedPurchase requires an onPending handler.');
  }

  for (let attemptNumber = 1; attemptNumber <= Math.max(Number(maxAttempts || 1), 1); attemptNumber += 1) {
    try {
      const vendorResult = await attempt({ attemptNumber, maxAttempts });
      const vendorState = normaliseVendorState(vendorResult);

      if (vendorState === 'pending_verification') {
        return {
          outcome: 'pending_verification',
          payload: await onPending({
            source: 'provider',
            vendorResult,
          }),
        };
      }

      if (vendorState === 'failed') {
        const error = new Error(failedMessage);
        error.statusCode = failedStatusCode;
        error.isDefinitiveProviderFailure = true;
        error.vendorResult = vendorResult;
        throw error;
      }

      return {
        outcome: 'success',
        vendorResult,
      };
    } catch (error) {
      if (error?.isDefinitiveProviderFailure) {
        throw error;
      }

      const retryable = isRetryableProviderError(error);
      if (retryable && attemptNumber < Math.max(Number(maxAttempts || 1), 1)) {
        continue;
      }

      if (retryable || shouldTreatAsPendingVerification(error)) {
        return {
          outcome: 'pending_verification',
          payload: await onPending({
            source: 'error',
            error,
          }),
        };
      }

      throw error;
    }
  }

  throw new Error('executeProtectedPurchase exited without a terminal outcome.');
}

module.exports = {
  executeProtectedPurchase,
  isRetryableProviderError,
  normaliseVendorState,
};
