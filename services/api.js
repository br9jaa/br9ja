const DEFAULT_ENDPOINTS = {
  vtpassBaseUrl: 'https://vtpass.com/api',
  squadBaseUrl: 'https://sandbox-api-d.squadco.com',
};

function trimTrailingSlash(value = '') {
  return String(value).replace(/\/+$/, '');
}

function buildUrl(baseUrl, path, query) {
  const normalizedBase = trimTrailingSlash(baseUrl);
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path || ''}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function createApiClient(config = {}) {
  const endpoints = {
    vtpassBaseUrl: trimTrailingSlash(config.vtpassBaseUrl || DEFAULT_ENDPOINTS.vtpassBaseUrl),
    squadBaseUrl: trimTrailingSlash(config.squadBaseUrl || DEFAULT_ENDPOINTS.squadBaseUrl),
  };

  async function request(provider, path, options = {}) {
    const baseUrl = provider === 'squad' ? endpoints.squadBaseUrl : endpoints.vtpassBaseUrl;
    const targetUrl = buildUrl(baseUrl, path, options.query);
    const headers = {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    };

    if (typeof fetch !== 'function') {
      throw new Error('Global fetch is required for the shared BR9 API client.');
    }

    const response = await fetch(targetUrl, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = payload?.message || payload?.response_description || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return payload;
  }

  return {
    endpoints,
    describeProviders() {
      return [
        { provider: 'vtpass', baseUrl: endpoints.vtpassBaseUrl },
        { provider: 'squad', baseUrl: endpoints.squadBaseUrl },
      ];
    },
    request,
    getVTPassServices() {
      return request('vtpass', '/services');
    },
    getVTPassVariations(serviceID) {
      return request('vtpass', '/service-variations', {
        query: { serviceID },
      });
    },
    verifyVTPassCustomer(payload) {
      return request('vtpass', '/merchant-verify', {
        method: 'POST',
        body: payload,
      });
    },
    vendVTPassService(payload) {
      return request('vtpass', '/pay', {
        method: 'POST',
        body: payload,
      });
    },
    createSquadVirtualAccount(payload) {
      return request('squad', '/virtual-account', {
        method: 'POST',
        body: payload,
      });
    },
    fetchSquadTransaction(reference) {
      return request('squad', `/transactions/${encodeURIComponent(reference)}`);
    },
  };
}

module.exports = {
  DEFAULT_ENDPOINTS,
  createApiClient,
};
