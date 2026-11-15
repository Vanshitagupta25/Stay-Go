const test = require('node:test');
const assert = require('node:assert');
const {
  STAY_AMENITIES_MAP,
  getAmenitiesForListing,
} = require('../utils/amenitiesHelper.cjs');

test('STAY_AMENITIES_MAP defines all standard amenities with titles, descriptions and icons', () => {
  assert.ok(STAY_AMENITIES_MAP.ac);
  assert.strictEqual(STAY_AMENITIES_MAP.ac.title, 'AC');
  assert.strictEqual(STAY_AMENITIES_MAP.ac.description, 'Climate Control');
  assert.strictEqual(STAY_AMENITIES_MAP.ac.icon, 'Wind');

  assert.ok(STAY_AMENITIES_MAP.wifi);
  assert.strictEqual(STAY_AMENITIES_MAP.wifi.title, 'Wi-Fi');
  assert.strictEqual(STAY_AMENITIES_MAP.wifi.description, 'High-Speed Internet');

  assert.ok(STAY_AMENITIES_MAP.pool);
  assert.strictEqual(STAY_AMENITIES_MAP.pool.title, 'Pool');
  assert.strictEqual(STAY_AMENITIES_MAP.pool.description, 'Swimming Pool');

  assert.ok(STAY_AMENITIES_MAP.parking);
  assert.strictEqual(STAY_AMENITIES_MAP.parking.title, 'Parking');
  assert.strictEqual(STAY_AMENITIES_MAP.parking.description, 'Complimentary Parking');

  assert.ok(STAY_AMENITIES_MAP.steamBath);
  assert.strictEqual(STAY_AMENITIES_MAP.steamBath.title, 'Steam Bath');
  assert.strictEqual(STAY_AMENITIES_MAP.steamBath.description, 'Steam & Wellness Room');
});

test('getAmenitiesForListing returns dynamic facilities when explicitly defined on a villa', () => {
  // Villa 1: Luxury Pool Villa with only Pool and AC
  const villa1 = {
    _id: 'v1',
    title: 'Private Pool Villa',
    amenities: ['pool', 'ac'],
  };
  const res1 = getAmenitiesForListing(villa1);
  assert.strictEqual(res1.length, 2);
  assert.deepStrictEqual(res1.map(a => a.key), ['pool', 'ac']);

  // Villa 2: Remote Mountain Cabin with Wi-Fi, Parking, and Steam Bath (no pool)
  const villa2 = {
    _id: 'v2',
    title: 'Himalayan Wooden Chalet',
    amenities: ['wifi', 'parking', 'steamBath'],
  };
  const res2 = getAmenitiesForListing(villa2);
  assert.strictEqual(res2.length, 3);
  assert.deepStrictEqual(res2.map(a => a.key), ['wifi', 'parking', 'steamBath']);
  assert.strictEqual(res2.some(a => a.key === 'pool'), false);
});

test('getAmenitiesForListing normalizes case-insensitive amenity names and titles', () => {
  const villa = {
    amenities: ['AC', 'Wi-Fi', 'Swimming Pool', 'Steam Bath'],
  };
  const res = getAmenitiesForListing(villa);
  assert.strictEqual(res.length, 4);
  assert.strictEqual(res[0].key, 'ac');
  assert.strictEqual(res[1].key, 'wifi');
  assert.strictEqual(res[2].key, 'pool');
  assert.strictEqual(res[3].key, 'steamBath');
});

test('getAmenitiesForListing dynamically derives facilities when amenities array is empty [] from DB', () => {
  // Database returns amenities: [] by default on listings
  const loftVilla = {
    _id: 'v-loft',
    title: 'Modern Loft in Downtown',
    description: 'Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!',
    amenities: [], // Default empty array from MongoDB
  };

  const loftAmenities = getAmenitiesForListing(loftVilla);
  assert.ok(loftAmenities.length >= 4, 'Loft villa must have amenities even if amenities: [] in DB');
  assert.deepStrictEqual(
    loftAmenities.map(a => a.key),
    ['ac', 'wifi', 'pool', 'parking', 'steamBath']
  );

  const mountainVillaWithEmptyAmenities = {
    _id: 'm1',
    title: 'Snow Peak Cabin',
    category: 'mountains',
    amenities: [],
  };
  const mountainAmenities = getAmenitiesForListing(mountainVillaWithEmptyAmenities);
  assert.ok(mountainAmenities.length > 0, 'Mountain villa must render dynamic amenities');
  assert.ok(mountainAmenities.some(a => a.key === 'parking'));
  assert.strictEqual(mountainAmenities.some(a => a.key === 'pool'), false);
});

test('getAmenitiesForListing handles null or undefined input gracefully without throwing', () => {
  assert.deepStrictEqual(getAmenitiesForListing(null), []);
  assert.deepStrictEqual(getAmenitiesForListing(undefined), []);
});
