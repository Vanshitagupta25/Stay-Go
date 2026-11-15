import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCapacitySummary } from '../utils/capacity.ts';

test('formats complete capacity details in a stable order', () => {
  assert.equal(
    formatCapacitySummary({
      guests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
    }),
    '6 guests · 3 bedrooms · 4 beds · 2 baths'
  );
});

test('uses singular labels for single values', () => {
  assert.equal(
    formatCapacitySummary({
      guests: 1,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
    }),
    '1 guest · 1 bedroom · 1 bed · 1 bath'
  );
});

test('supports half bathrooms without losing the decimal', () => {
  assert.equal(
    formatCapacitySummary({
      guests: 2,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1.5,
    }),
    '2 guests · 1 bedroom · 2 beds · 1.5 baths'
  );
});

test('omits missing, zero, and invalid capacity values instead of inventing defaults', () => {
  assert.equal(
    formatCapacitySummary({
      guests: 4,
      bedrooms: 0,
      beds: Number.NaN,
      bathrooms: -1,
    }),
    '4 guests'
  );

  assert.equal(
    formatCapacitySummary({
      guests: undefined,
      bedrooms: null,
      beds: undefined,
      bathrooms: null,
    }),
    ''
  );
});

test('returns an empty summary for null or undefined listings', () => {
  assert.equal(formatCapacitySummary(null), '');
  assert.equal(formatCapacitySummary(undefined), '');
});
