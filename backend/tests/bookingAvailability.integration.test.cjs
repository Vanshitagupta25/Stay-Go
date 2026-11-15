const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

const Booking = require('../models/booking.js');
const Listing = require('../models/listing.js');
const listingController = require('../controllers/listings.js');

const originalBookingFind = Booking.find;
const originalListingExists = Listing.exists;

let bookings = [];
let listingExists = true;
let lastQuery = null;

function makeApp() {
  const app = express();
  app.use(express.json());
  app.get('/api/listings/:id/availability', listingController.availability);
  return app;
}

test.beforeEach(() => {
  bookings = [];
  listingExists = true;
  lastQuery = null;

  Listing.exists = async () => (listingExists ? { _id: new mongoose.Types.ObjectId() } : null);
  Booking.find = (query) => {
    lastQuery = query;
    return {
      select: () => ({
        lean: async () => bookings,
      }),
    };
  };
});

test.after(() => {
  Booking.find = originalBookingFind;
  Listing.exists = originalListingExists;
});

test('availability returns all active booked ranges when no search dates are supplied', async () => {
  bookings = [
    {
      checkIn: new Date('2026-11-10T00:00:00.000Z'),
      checkOut: new Date('2026-11-13T00:00:00.000Z'),
    },
  ];

  const response = await request(makeApp())
    .get(`/api/listings/${new mongoose.Types.ObjectId()}/availability`)
    .expect(200);

  assert.strictEqual(response.body.success, true);
  assert.deepStrictEqual(response.body.bookedRanges, [
    { checkIn: '2026-11-10', checkOut: '2026-11-13' },
  ]);
  assert.deepStrictEqual(response.body.bookedDates, [
    '2026-11-10',
    '2026-11-11',
    '2026-11-12',
  ]);
  assert.ok(Array.isArray(lastQuery.$or));
});

test('availability detects a conflicting requested range', async () => {
  bookings = [
    {
      checkIn: new Date('2026-11-10T00:00:00.000Z'),
      checkOut: new Date('2026-11-13T00:00:00.000Z'),
    },
  ];

  const response = await request(makeApp())
    .get(`/api/listings/${new mongoose.Types.ObjectId()}/availability`)
    .query({ checkIn: '2026-11-12', checkOut: '2026-11-15' })
    .expect(200);

  assert.strictEqual(response.body.available, false);
});

test('availability allows a range starting on another booking checkout day', async () => {
  bookings = [
    {
      checkIn: new Date('2026-11-10T00:00:00.000Z'),
      checkOut: new Date('2026-11-13T00:00:00.000Z'),
    },
  ];

  const response = await request(makeApp())
    .get(`/api/listings/${new mongoose.Types.ObjectId()}/availability`)
    .query({ checkIn: '2026-11-13', checkOut: '2026-11-15' })
    .expect(200);

  assert.strictEqual(response.body.available, true);
});

test('availability rejects partial or invalid date queries', async () => {
  const listingId = new mongoose.Types.ObjectId();

  await request(makeApp())
    .get(`/api/listings/${listingId}/availability`)
    .query({ checkIn: '2026-11-12' })
    .expect(400);

  await request(makeApp())
    .get(`/api/listings/${listingId}/availability`)
    .query({ checkIn: '2026-11-15', checkOut: '2026-11-12' })
    .expect(400);
});

test('availability returns 404 for a missing listing', async () => {
  listingExists = false;

  await request(makeApp())
    .get(`/api/listings/${new mongoose.Types.ObjectId()}/availability`)
    .expect(404);
});
