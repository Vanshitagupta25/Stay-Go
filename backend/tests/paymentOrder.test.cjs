const test = require('node:test');
const assert = require('node:assert');
const { calculateBookingPrice } = require('../utils/pricingCalculator.js');

test('paymentOrder calculation ensures customer is charged full booking amount (base + service fee + taxes)', () => {
  const listingPrice = 1500;
  const nights = 2;

  const oldFaultyTotal = Math.round(listingPrice * nights * 100);
  assert.strictEqual(oldFaultyTotal, 300000); // 3,000 INR in paise

  const pricing = calculateBookingPrice({
    pricePerNight: listingPrice,
    numberOfNights: nights,
  });

  assert.strictEqual(pricing.basePrice, 3000);

  assert.strictEqual(pricing.serviceFee, 360);

  assert.strictEqual(pricing.tax, 605);

  assert.strictEqual(pricing.totalRupees, 3965);
  assert.strictEqual(pricing.totalPaise, 396500);

  assert.ok(pricing.totalPaise > oldFaultyTotal, 'Full amount must include service fee and taxes');
  assert.strictEqual(pricing.totalPaise - oldFaultyTotal, (pricing.serviceFee + pricing.tax) * 100);
});

