const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const {
  sameDates,
  findOccupancyConflicts,
} = require('../init/backfillBookingOccupancy.js');

test('sameDates compares occupancy lists exactly', () => {
  assert.strictEqual(sameDates(['2026-11-10'], ['2026-11-10']), true);
  assert.strictEqual(sameDates(['2026-11-10'], ['2026-11-10', '2026-11-11']), false);
  assert.strictEqual(sameDates(undefined, ['2026-11-10']), false);
});

test('findOccupancyConflicts reports overlapping stays per listing', () => {
  const listingId = new mongoose.Types.ObjectId();
  const firstId = new mongoose.Types.ObjectId();
  const secondId = new mongoose.Types.ObjectId();

  const conflicts = findOccupancyConflicts([
    {
      _id: firstId,
      listing: listingId,
      checkIn: new Date('2026-11-10T00:00:00.000Z'),
      checkOut: new Date('2026-11-13T00:00:00.000Z'),
    },
    {
      _id: secondId,
      listing: listingId,
      checkIn: new Date('2026-11-12T00:00:00.000Z'),
      checkOut: new Date('2026-11-15T00:00:00.000Z'),
    },
  ]);

  assert.strictEqual(conflicts.length, 1);
  assert.strictEqual(conflicts[0].listingId, listingId.toString());
});

test('findOccupancyConflicts allows adjacent checkout/check-in stays', () => {
  const listingId = new mongoose.Types.ObjectId();

  const conflicts = findOccupancyConflicts([
    {
      _id: new mongoose.Types.ObjectId(),
      listing: listingId,
      checkIn: new Date('2026-11-10T00:00:00.000Z'),
      checkOut: new Date('2026-11-13T00:00:00.000Z'),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      listing: listingId,
      checkIn: new Date('2026-11-13T00:00:00.000Z'),
      checkOut: new Date('2026-11-15T00:00:00.000Z'),
    },
  ]);

  assert.deepStrictEqual(conflicts, []);
});
