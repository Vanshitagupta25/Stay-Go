const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

delete process.env.MAP_TOKEN;

const Listing = require('../models/listing.js');
const listingController = require('../controllers/listings.js');

const originalSave = Listing.prototype.save;
const originalFindByIdAndUpdate = Listing.findByIdAndUpdate;
let capturedUpdate = null;

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    req.user = { _id: new mongoose.Types.ObjectId() };
    next();
  });
  app.post('/api/listings', listingController.create);
  app.put('/api/listings/:id', listingController.update);
  return app;
}

test.before(() => {
  Listing.prototype.save = async function saveStub() {
    return this;
  };
  Listing.findByIdAndUpdate = async function updateStub(id, payload) {
    capturedUpdate = { id, payload };
    return { _id: id, ...payload };
  };
});

test.after(() => {
  Listing.prototype.save = originalSave;
  Listing.findByIdAndUpdate = originalFindByIdAndUpdate;
});

test('POST /api/listings persists nested capacity values as numbers', async () => {
  const response = await request(makeApp())
    .post('/api/listings')
    .send({
      listing: {
        title: 'Cliffside Villa',
        description: 'Ocean views',
        price: '8500',
        location: 'Goa',
        country: 'India',
        category: 'pools',
        guests: '6',
        bedrooms: '3',
        beds: '4',
        bathrooms: '2.5',
        amenities: ['wifi', 'pool'],
      },
    })
    .expect(201);

  assert.strictEqual(response.body.success, true);
  assert.strictEqual(response.body.listing.guests, 6);
  assert.strictEqual(response.body.listing.bedrooms, 3);
  assert.strictEqual(response.body.listing.beds, 4);
  assert.strictEqual(response.body.listing.bathrooms, 2.5);
  assert.deepStrictEqual(response.body.listing.amenities, ['wifi', 'pool']);
});

test('POST /api/listings supports flattened multipart-style capacity fields', async () => {
  const response = await request(makeApp())
    .post('/api/listings')
    .send({
      'listing[title]': 'Pine Cabin',
      'listing[description]': 'Forest hideaway',
      'listing[price]': '4200',
      'listing[location]': 'Manali',
      'listing[country]': 'India',
      'listing[category]': 'mountains',
      'listing[guests]': '4',
      'listing[bedrooms]': '2',
      'listing[beds]': '3',
      'listing[bathrooms]': '1.5',
      'listing[amenities]': '["wifi","parking"]',
    })
    .expect(201);

  assert.strictEqual(response.body.listing.guests, 4);
  assert.strictEqual(response.body.listing.bedrooms, 2);
  assert.strictEqual(response.body.listing.beds, 3);
  assert.strictEqual(response.body.listing.bathrooms, 1.5);
  assert.deepStrictEqual(response.body.listing.amenities, ['wifi', 'parking']);
});

test('PUT /api/listings/:id normalizes capacity values before updating', async () => {
  capturedUpdate = null;
  const listingId = new mongoose.Types.ObjectId().toString();

  await request(makeApp())
    .put(`/api/listings/${listingId}`)
    .send({
      listing: {
        title: 'Updated Villa',
        price: '9000',
        location: 'Goa',
        country: 'India',
        guests: '5',
        bedrooms: '2',
        beds: '3',
        bathrooms: '1.5',
        amenities: '["wifi","pool"]',
      },
    })
    .expect(200);

  assert.ok(capturedUpdate);
  assert.strictEqual(capturedUpdate.payload.guests, 5);
  assert.strictEqual(capturedUpdate.payload.bedrooms, 2);
  assert.strictEqual(capturedUpdate.payload.beds, 3);
  assert.strictEqual(capturedUpdate.payload.bathrooms, 1.5);
  assert.deepStrictEqual(capturedUpdate.payload.amenities, ['wifi', 'pool']);
});
