'use strict';

const { GoldAuditLog, User } = require('../models');

function toAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function recordGoldAuditEvent({
  userId = null,
  actionType,
  direction,
  amount,
  note = '',
  metadata = {},
  session = null,
}) {
  if (!actionType || !direction) {
    return null;
  }

  const numericAmount = Math.max(toAmount(amount), 0);
  if (numericAmount < 0) {
    return null;
  }

  const [row] = await GoldAuditLog.create(
    [
      {
        userId,
        actionType: String(actionType).trim(),
        direction,
        amount: numericAmount,
        note: String(note || '').trim(),
        metadata,
      },
    ],
    session ? { session } : undefined
  );

  return row;
}

async function getGoldCirculationSnapshot() {
  const [userTotals, auditTotals] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          spendable: { $sum: { $ifNull: ['$br9GoldBalance', 0] } },
          locked: { $sum: { $ifNull: ['$br9GoldLockedBalance', 0] } },
          legacy: { $sum: { $ifNull: ['$br9GoldPoints', 0] } },
        },
      },
    ]),
    GoldAuditLog.aggregate([
      {
        $group: {
          _id: '$direction',
          total: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const userRow = userTotals[0] || {};
  const totalsByDirection = auditTotals.reduce((accumulator, row) => {
    accumulator[row._id] = toAmount(row.total);
    return accumulator;
  }, {});

  const spendable = toAmount(userRow.spendable);
  const locked = toAmount(userRow.locked);
  const legacy = toAmount(userRow.legacy);

  return {
    spendable,
    locked,
    legacy,
    totalInCirculation: spendable + locked + legacy,
    totalMinted: toAmount(totalsByDirection.mint),
    totalBurned: toAmount(totalsByDirection.burn),
    totalTransferred: toAmount(totalsByDirection.transfer),
  };
}

module.exports = {
  getGoldCirculationSnapshot,
  recordGoldAuditEvent,
};
