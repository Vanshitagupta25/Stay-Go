const test = require('node:test');
const assert = require('node:assert');
const Booking = require('../models/booking.js');

test('Booking model stores atomic occupancy and pending hold metadata', () => {
  assert.ok(Booking.schema.path('occupiedDates'));
  assert.ok(Booking.schema.path('holdExpiresAt'));
});

test('Booking model declares overlapping-night and pending-hold indexes', () => {
  const indexes = Booking.schema.indexes();

  const occupancyIndex = indexes.find(
    ([fields]) => fields.listing === 1 && fields.occupiedDates === 1
  );
  assert.ok(occupancyIndex, 'missing listing + occupiedDates index');
  assert.strictEqual(occupancyIndex[1].unique, true);
  assert.deepStrictEqual(occupancyIndex[1].partialFilterExpression, {
    status: { $in: ['PENDING', 'PAID'] },
    occupiedDates: { $exists: true },
  });

  const holdIndex = indexes.find(([fields]) => fields.holdExpiresAt === 1);
  assert.ok(holdIndex, 'missing pending hold TTL index');
  assert.strictEqual(holdIndex[1].expireAfterSeconds, 0);
});
