const test = require('node:test');
const assert = require('node:assert');
const { ListingSchema } = require('../schema.js');
const Listing = require('../models/listing.js');

test('ListingSchema validates listing with custom dynamic amenities', () => {
  const validData = {
    listing: {
      title: 'Luxury Cliffside Villa',
      description: 'Stunning panoramic views with infinity pool and private spa.',
      location: 'Udaipur',
      country: 'India',
      price: 25000,
      category: 'pools',
      guests: 6,
      amenities: ['pool', 'wifi', 'steamBath', 'ac'],
    },
  };

  const { error, value } = ListingSchema.validate(validData);
  assert.strictEqual(error, undefined, 'Validation should pass for listing with amenities');
  assert.deepStrictEqual(value.listing.amenities, ['pool', 'wifi', 'steamBath', 'ac']);
});

test('Listing model instantiates with dynamic amenities array', () => {
  const villa1 = new Listing({
    title: 'Minimalist Forest Chalet',
    description: 'Surrounded by pine trees and mountain streams.',
    location: 'Manali',
    country: 'India',
    price: 4500,
    category: 'mountains',
    geometry: { type: 'Point', coordinates: [77.1892, 32.2432] },
    amenities: ['wifi', 'parking', 'steamBath'],
  });

  const villa2 = new Listing({
    title: 'Modern Loft in Downtown',
    description: 'Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!',
    location: 'Mumbai',
    country: 'India',
    price: 1200,
    category: 'iconicCities',
    geometry: { type: 'Point', coordinates: [72.8777, 19.0760] },
    amenities: ['ac', 'wifi', 'pool', 'parking', 'steamBath'],
  });

  // Verify each villa has distinct dynamic facilities
  assert.strictEqual(villa1.amenities.length, 3);
  assert.strictEqual(villa1.amenities.includes('pool'), false);
  assert.strictEqual(villa1.amenities.includes('steamBath'), true);

  assert.strictEqual(villa2.amenities.length, 5);
  assert.strictEqual(villa2.amenities.includes('pool'), true);
  assert.notDeepStrictEqual(villa1.amenities, villa2.amenities);
});

