const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'test_key_id';
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'test_secret';

const Booking = require('../models/booking.js');
const Listing = require('../models/listing.js');
const paymentController = require('../controllers/payment.js');

const originalListingFindById = Listing.findById;
const originalBookingFindOne = Booking.findOne;
const originalBookingFindOneAndUpdate = Booking.findOneAndUpdate;
const originalBookingSave = Booking.prototype.save;

let listing;
let conflict;
let capturedBooking;
let capturedUpdate;
let saveError;
let updateResult;

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user = { _id: new mongoose.Types.ObjectId() };
    next();
  });
  app.post('/api/payment/create-order', paymentController.createOrder);
  app.post('/api/payment/verify-signature', paymentController.verifySignature);
  app.post('/api/payment/cancel-order', paymentController.cancelOrder);
  return app;
}

test.beforeEach(() => {
  listing = {
    _id: new mongoose.Types.ObjectId(),
    price: 1500,
  };
  conflict = null;
  capturedBooking = null;
  capturedUpdate = null;
  saveError = null;
  updateResult = null;

  Listing.findById = async () => listing;
  Booking.findOne = async () => conflict;
  Booking.findOneAndUpdate = async (filter, update) => {
    capturedUpdate = { filter, update };
    return updateResult;
  };
  Booking.prototype.save = async function saveStub() {
    capturedBooking = this;
    if (saveError) throw saveError;
    return this;
  };
  paymentController.razorpay.orders = {
    create: async () => ({ id: 'order_test', amount: 100, currency: 'INR' }),
  };
});

test.after(() => {
  Listing.findById = originalListingFindById;
  Booking.findOne = originalBookingFindOne;
  Booking.findOneAndUpdate = originalBookingFindOneAndUpdate;
  Booking.prototype.save = originalBookingSave;
});

test('createOrder rejects overlapping active bookings before creating a Razorpay order', async () => {
  conflict = { _id: new mongoose.Types.ObjectId() };
  let orderCreated = false;
  paymentController.razorpay.orders.create = async () => {
    orderCreated = true;
    return { id: 'order_test', amount: 100, currency: 'INR' };
  };

  const response = await request(makeApp())
    .post('/api/payment/create-order')
    .send({
      listingId: listing._id.toString(),
      checkIn: '2026-11-12',
      checkOut: '2026-11-15',
    })
    .expect(409);

  assert.strictEqual(response.body.success, false);
  assert.match(response.body.message, /already booked/i);
  assert.strictEqual(orderCreated, false);
});

test('createOrder stores occupied nights and a 15-minute pending hold', async () => {
  const response = await request(makeApp())
    .post('/api/payment/create-order')
    .send({
      listingId: listing._id.toString(),
      checkIn: '2026-11-10',
      checkOut: '2026-11-13',
    })
    .expect(200);

  assert.strictEqual(response.body.success, true);
  assert.ok(capturedBooking);
  assert.deepStrictEqual(capturedBooking.occupiedDates, [
    '2026-11-10',
    '2026-11-11',
    '2026-11-12',
  ]);
  assert.strictEqual(capturedBooking.status, 'PENDING');
  assert.ok(capturedBooking.holdExpiresAt instanceof Date);
  assert.ok(capturedBooking.holdExpiresAt.getTime() > Date.now());
});

test('createOrder maps a duplicate occupancy key to a booked-date conflict', async () => {
  saveError = Object.assign(new Error('duplicate key'), { code: 11000 });

  const response = await request(makeApp())
    .post('/api/payment/create-order')
    .send({
      listingId: listing._id.toString(),
      checkIn: '2026-11-10',
      checkOut: '2026-11-13',
    })
    .expect(409);

  assert.match(response.body.message, /already booked/i);
});

test('createOrder rejects invalid date ranges', async () => {
  await request(makeApp())
    .post('/api/payment/create-order')
    .send({
      listingId: listing._id.toString(),
      checkIn: '2026-11-13',
      checkOut: '2026-11-13',
    })
    .expect(400);
});

test('verifySignature marks the owned pending booking paid and clears the hold', async () => {
  const orderId = 'order_verify';
  const paymentId = 'pay_verify';
  const signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  conflict = {
    _id: new mongoose.Types.ObjectId(),
    orderId,
    status: 'PENDING',
  };
  updateResult = { _id: conflict._id, orderId, status: 'PAID' };

  const response = await request(makeApp())
    .post('/api/payment/verify-signature')
    .send({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      signature,
    })
    .expect(200);

  assert.strictEqual(response.body.success, true);
  assert.strictEqual(capturedUpdate.update.$set.status, 'PAID');
  assert.strictEqual(capturedUpdate.update.$unset.holdExpiresAt, 1);
  assert.ok(capturedUpdate.filter.user);
  assert.strictEqual(capturedUpdate.filter.status, 'PENDING');
});

test('verifySignature rejects an invalid signature', async () => {
  await request(makeApp())
    .post('/api/payment/verify-signature')
    .send({
      razorpayOrderId: 'order_bad',
      razorpayPaymentId: 'pay_bad',
      signature: 'bad-signature',
    })
    .expect(400);
});

test('verifySignature is idempotent for an already paid booking', async () => {
  const orderId = 'order_paid';
  const paymentId = 'pay_paid';
  const signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  conflict = {
    _id: new mongoose.Types.ObjectId(),
    orderId,
    status: 'PAID',
  };

  const response = await request(makeApp())
    .post('/api/payment/verify-signature')
    .send({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      signature,
    })
    .expect(200);

  assert.strictEqual(response.body.success, true);
  assert.strictEqual(capturedUpdate, null);
});

test('cancelOrder releases the owned pending hold immediately', async () => {
  updateResult = { _id: new mongoose.Types.ObjectId(), status: 'FAILED' };

  const response = await request(makeApp())
    .post('/api/payment/cancel-order')
    .send({ bookingId: updateResult._id.toString() })
    .expect(200);

  assert.strictEqual(response.body.success, true);
  assert.strictEqual(capturedUpdate.update.$set.status, 'FAILED');
  assert.ok(capturedUpdate.filter.user);
  assert.strictEqual(capturedUpdate.filter.status, 'PENDING');
});
