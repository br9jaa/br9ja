'use strict';

const { resolveSessionContext } = require('./auth');

function blockWebGameplay(req, res, next) {
  const sessionContext = resolveSessionContext(req, req.user);
  if (!sessionContext.isWeb) {
    return next();
  }

  return res.status(403).json({
    success: false,
    data: null,
    message: 'Games are available only in the BR9ja mobile app.',
  });
}

module.exports = {
  blockWebGameplay,
};
