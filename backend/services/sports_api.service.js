'use strict';

const axios = require('axios');

const { SPORTS_CACHE_TTL_MS } = require('../config/constants');

const cache = {
  expiresAt: 0,
  value: null,
};

function normaliseGame(rawGame) {
  const fixture = rawGame.fixture || rawGame;
  const teams = rawGame.teams || {};
  const goals = rawGame.goals || {};

  return {
    id: String(fixture.id || rawGame.id || rawGame.matchId),
    status: fixture.status?.short || rawGame.status || 'upcoming',
    startsAt: fixture.date || rawGame.startsAt || new Date().toISOString(),
    homeTeam: teams.home?.name || rawGame.homeTeam || 'Home',
    awayTeam: teams.away?.name || rawGame.awayTeam || 'Away',
    homeScore: goals.home ?? rawGame.homeScore ?? null,
    awayScore: goals.away ?? rawGame.awayScore ?? null,
    league: rawGame.league?.name || rawGame.league || 'BR9 Gold',
  };
}

function devGames() {
  const now = Date.now();
  return [
    {
      id: 'demo-lagos-arsenal-chelsea',
      status: 'upcoming',
      startsAt: new Date(now + 60 * 60 * 1000).toISOString(),
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      homeScore: null,
      awayScore: null,
      league: 'Premier League',
    },
    {
      id: 'demo-lagos-city-liverpool',
      status: 'live',
      startsAt: new Date(now - 35 * 60 * 1000).toISOString(),
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      homeScore: 1,
      awayScore: 1,
      league: 'Premier League',
    },
  ];
}

async function fetchLiveGames({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && cache.value && cache.expiresAt > now) {
    return cache.value;
  }

  const apiUrl = process.env.SPORTS_API_URL;
  const apiKey = process.env.SPORTS_API_KEY;

  if (!apiUrl || !apiKey) {
    cache.value = devGames();
    cache.expiresAt = now + SPORTS_CACHE_TTL_MS;
    return cache.value;
  }

  const response = await axios.get(apiUrl, {
    timeout: 8000,
    headers: {
      'x-apisports-key': apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const items = Array.isArray(response.data?.response)
    ? response.data.response
    : Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : [];

  cache.value = items.map(normaliseGame);
  cache.expiresAt = now + SPORTS_CACHE_TTL_MS;
  return cache.value;
}

module.exports = {
  fetchLiveGames,
};
