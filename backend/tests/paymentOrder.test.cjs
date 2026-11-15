const test = require('node:test');
const assert = require('node:assert');
const { calculateBookingPrice } = require('../utils/pricingCalculator.js');

test('paymentOrder calculation ensures customer is charged full booking amount (base + service fee + taxes)', () => {
  const listingPrice = 1500;
  const nights = 2;

  // Old faulty calculation:
  const oldFaultyTotal = Math.round(listingPrice * nights * 100);
  assert.strictEqual(oldFaultyTotal, 300000); // 3,000 INR in paise

  // New accurate full booking calculation:
  const pricing = calculateBookingPrice({
    pricePerNight: listingPrice,
    numberOfNights: nights,
  });

  // Base price = 3,000 INR
  assert.strictEqual(pricing.basePrice, 3000);

  // 12% service fee = 360 INR
  assert.strictEqual(pricing.serviceFee, 360);

  // 18% taxes on (base + service fee) = 3360 * 0.18 = 604.8 -> 605 INR
  assert.strictEqual(pricing.tax, 605);

  // Total amount charged through Razorpay = 3000 + 360 + 605 = 3965 INR
  assert.strictEqual(pricing.totalRupees, 3965);
  assert.strictEqual(pricing.totalPaise, 396500);

  // Verify the new amount is strictly greater than just the nightly price
  assert.ok(pricing.totalPaise > oldFaultyTotal, 'Full amount must include service fee and taxes');
  assert.strictEqual(pricing.totalPaise - oldFaultyTotal, (pricing.serviceFee + pricing.tax) * 100);
});

