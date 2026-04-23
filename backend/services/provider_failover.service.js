'use strict';

const {
  getProviderConfig,
  getServiceProviderRoute,
} = require('./provider_config.service');

function payloadSignalsProviderDown(payload) {
  const data = payload?.raw || payload?.data || payload || {};
  const status = String(
    data.status ||
      data.Status ||
      data.responseCode ||
      data.response_code ||
      data.responseMessage ||
      data.message ||
      ''
  )
    .trim()
    .toLowerCase();

  return status === 'down' || status.includes('service unavailable');
}

function shouldFailover(error, payload = null) {
  if (payloadSignalsProviderDown(payload)) {
    return true;
  }

  if (!error) {
    return false;
  }

  const status = Number(error.response?.status || error.statusCode || 0);
  const message = String(error.message || '').toLowerCase();
  const code = String(error.code || '').toUpperCase();

  return (
    status >= 500 ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    message.includes('timeout') ||
    message.includes('down')
  );
}

async function executeWithProviderFailover({
  serviceKey,
  attempt,
}) {
  const config = await getProviderConfig();
  const route = getServiceProviderRoute(config, serviceKey);
  const providers = [route.primaryProvider];

  if (
    route.failoverEnabled &&
    route.backupProvider &&
    route.backupProvider !== route.primaryProvider
  ) {
    providers.push(route.backupProvider);
  }

  let lastError;

  for (let index = 0; index < providers.length; index += 1) {
    const provider = providers[index];
    try {
      const result = await attempt(provider, {
        config,
        route,
        isFallback: index > 0,
      });

      if (payloadSignalsProviderDown(result)) {
        if (index < providers.length - 1) {
          continue;
        }
      }

      return {
        ...result,
        providerUsed: provider,
        failoverTriggered: index > 0,
      };
    } catch (error) {
      lastError = error;
      if (!shouldFailover(error) || index >= providers.length - 1) {
        throw error;
      }
    }
  }

  throw lastError;
}

module.exports = {
  executeWithProviderFailover,
  payloadSignalsProviderDown,
  shouldFailover,
};
