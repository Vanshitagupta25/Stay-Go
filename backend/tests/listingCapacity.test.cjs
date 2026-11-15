const test = require('node:test');
const assert = require('node:assert');
const { ListingSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const { data: seedListings, capacityByTitle } = require('../init/data.js');

function baseListing(overrides = {}) {
  return {
    title: 'Cliffside Villa',
    description: 'Ocean views',
    location: 'Goa',
    country: 'India',
    price: 8500,
    category: 'pools',
    ...overrides,
  };
}

function makeListing(overrides = {}) {
  return new Listing({
    ...baseListing(overrides),
    geometry: { type: 'Point', coordinates: [73.8278, 15.4909] },
  });
}

test('ListingSchema accepts the full capacity contract', () => {
  const { error, value } = ListingSchema.validate({
    listing: baseListing({
      guests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2.5,
    }),
  });

  assert.strictEqual(error, undefined);
  assert.strictEqual(value.listing.guests, 6);
  assert.strictEqual(value.listing.bedrooms, 3);
  assert.strictEqual(value.listing.beds, 4);
  assert.strictEqual(value.listing.bathrooms, 2.5);
});

test('ListingSchema rejects invalid capacity values', () => {
  const invalidCases = [
    { guests: 0 },
    { bedrooms: -1 },
    { beds: 0 },
    { bathrooms: -0.5 },
    { bathrooms: 1.25 },
  ];

  for (const invalid of invalidCases) {
    const { error } = ListingSchema.validate({
      listing: baseListing(invalid),
    });
    assert.ok(error, `Expected validation to fail for ${JSON.stringify(invalid)}`);
  }
});

test('Listing model stores capacity values without inventing guest defaults', () => {
  const detailed = makeListing({
    guests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 1.5,
  });

  assert.strictEqual(detailed.guests, 6);
  assert.strictEqual(detailed.bedrooms, 3);
  assert.strictEqual(detailed.beds, 4);
  assert.strictEqual(detailed.bathrooms, 1.5);

  const missingCapacity = makeListing();
  assert.strictEqual(missingCapacity.guests, undefined);
  assert.strictEqual(missingCapacity.bedrooms, undefined);
  assert.strictEqual(missingCapacity.beds, undefined);
  assert.strictEqual(missingCapacity.bathrooms, undefined);
});

test('every seed listing has explicit database-backed capacity values', () => {
  assert.strictEqual(seedListings.length, Object.keys(capacityByTitle).length);

  for (const listing of seedListings) {
    assert.ok(listing.guests >= 1, `${listing.title} needs guests`);
    assert.ok(listing.bedrooms >= 0, `${listing.title} needs bedrooms`);
    assert.ok(listing.beds >= 1, `${listing.title} needs beds`);
    assert.ok(listing.bathrooms >= 0, `${listing.title} needs bathrooms`);
  }
});

test('Listing model rejects fractional bedroom, bed, guest, and quarter-bath values', () => {
  const invalidCases = [
    { guests: 2.5 },
    { bedrooms: 1.5 },
    { beds: 2.5 },
    { bathrooms: 1.25 },
  ];

  for (const invalid of invalidCases) {
    const listing = makeListing(invalid);
    const error = listing.validateSync();
    assert.ok(error, `Expected model validation to fail for ${JSON.stringify(invalid)}`);
  }
});
