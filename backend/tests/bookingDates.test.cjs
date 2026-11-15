const test = require('node:test');
const assert = require('node:assert');
const {
  HOLD_DURATION_MS,
  parseDateOnly,
  formatDateOnly,
  buildOccupiedDates,
  rangesOverlap,
  buildActiveBookingFilter,
  serializeBookedRanges,
  flattenBookedDates,
} = require('../utils/bookingDates.js');

test('parseDateOnly accepts ISO calendar dates at UTC midnight', () => {
  const parsed = parseDateOnly('2026-11-10');
  assert.ok(parsed instanceof Date);
  assert.strictEqual(parsed.toISOString(), '2026-11-10T00:00:00.000Z');
});

test('parseDateOnly rejects invalid and non-date-only values', () => {
  assert.strictEqual(parseDateOnly(''), null);
  assert.strictEqual(parseDateOnly('not-a-date'), null);
  assert.strictEqual(parseDateOnly('2026-02-31'), null);
  assert.strictEqual(parseDateOnly('2026-11-10T12:00:00.000Z'), null);
});

test('buildOccupiedDates includes each night but excludes the checkout day', () => {
  assert.deepStrictEqual(
    buildOccupiedDates('2026-11-10', '2026-11-13'),
    ['2026-11-10', '2026-11-11', '2026-11-12']
  );
});

test('buildOccupiedDates supports one-night stays', () => {
  assert.deepStrictEqual(buildOccupiedDates('2026-11-10', '2026-11-11'), ['2026-11-10']);
});

test('buildOccupiedDates rejects invalid or reversed ranges', () => {
  assert.deepStrictEqual(buildOccupiedDates('2026-11-10', '2026-11-10'), []);
  assert.deepStrictEqual(buildOccupiedDates('2026-11-12', '2026-11-10'), []);
  assert.deepStrictEqual(buildOccupiedDates('bad', '2026-11-10'), []);
});

test('rangesOverlap treats checkout/check-in on the same day as available', () => {
  assert.strictEqual(
    rangesOverlap(
      parseDateOnly('2026-11-10'),
      parseDateOnly('2026-11-13'),
      parseDateOnly('2026-11-13'),
      parseDateOnly('2026-11-15')
    ),
    false
  );
  assert.strictEqual(
    rangesOverlap(
      parseDateOnly('2026-11-10'),
      parseDateOnly('2026-11-13'),
      parseDateOnly('2026-11-12'),
      parseDateOnly('2026-11-15')
    ),
    true
  );
});

test('buildActiveBookingFilter includes paid stays and unexpired pending holds only', () => {
  const now = new Date('2026-11-10T10:00:00.000Z');
  const filter = buildActiveBookingFilter(now);

  assert.deepStrictEqual(filter, {
    $or: [
      { status: 'PAID' },
      { status: 'PENDING', holdExpiresAt: { $gt: now } },
    ],
  });
  assert.strictEqual(HOLD_DURATION_MS, 15 * 60 * 1000);
});

test('booked ranges serialize and flatten into calendar dates', () => {
  const bookings = [
    {
      checkIn: new Date('2026-11-10T00:00:00.000Z'),
      checkOut: new Date('2026-11-13T00:00:00.000Z'),
    },
    {
      checkIn: new Date('2026-11-20T00:00:00.000Z'),
      checkOut: new Date('2026-11-21T00:00:00.000Z'),
    },
  ];

  assert.deepStrictEqual(serializeBookedRanges(bookings), [
    { checkIn: '2026-11-10', checkOut: '2026-11-13' },
    { checkIn: '2026-11-20', checkOut: '2026-11-21' },
  ]);
  assert.deepStrictEqual(flattenBookedDates(bookings), [
    '2026-11-10',
    '2026-11-11',
    '2026-11-12',
    '2026-11-20',
  ]);
  assert.strictEqual(formatDateOnly(new Date('2026-11-10T23:59:59.000Z')), '2026-11-10');
});
