const test = require('node:test');
const assert = require('node:assert');
const { calculateBookingPrice, SERVICE_FEE_RATE, TAX_RATE } = require('../utils/pricingCalculator.js');

test('calculateBookingPrice computes base accommodation, service fee, applicable taxes, and full total in paise and rupees', () => {
  const pricePerNight = 2000;
  const numberOfNights = 3;

  const result = calculateBookingPrice({ pricePerNight, numberOfNights });

  assert.strictEqual(result.nights, 3);
  assert.strictEqual(result.basePrice, 6000); // 2000 * 3

  // 12% service fee
  const expectedServiceFee = Math.round(6000 * SERVICE_FEE_RATE);
  assert.strictEqual(result.serviceFee, expectedServiceFee);
  assert.strictEqual(result.serviceFee, 720);

  // 18% taxes on (basePrice + serviceFee)
  const expectedTax = Math.round((6000 + 720) * TAX_RATE);
  assert.strictEqual(result.tax, expectedTax);
  assert.strictEqual(result.tax, 1210);

  // Full grand total in rupees
  const expectedTotalRupees = 6000 + 720 + 1210;
  assert.strictEqual(result.totalRupees, expectedTotalRupees);
  assert.strictEqual(result.totalRupees, 7930);

  // Razorpay amount must be in paise (multiplied by 100)
  assert.strictEqual(result.totalPaise, 793000);
});

test('calculateBookingPrice handles 1 night stay correctly', () => {
  const result = calculateBookingPrice({ pricePerNight: 1500, numberOfNights: 1 });

  assert.strictEqual(result.nights, 1);
  assert.strictEqual(result.basePrice, 1500);
  assert.strictEqual(result.serviceFee, 180); // 1500 * 0.12
  assert.strictEqual(result.tax, 302); // (1500 + 180) * 0.18 = 302.4 -> 302
  assert.strictEqual(result.totalRupees, 1982); // 1500 + 180 + 302
  assert.strictEqual(result.totalPaise, 198200);
});

test('calculateBookingPrice handles edge cases: zero or negative nights defaults to 1', () => {
  const result = calculateBookingPrice({ pricePerNight: 1000, numberOfNights: 0 });
  assert.strictEqual(result.nights, 1);
  assert.strictEqual(result.totalRupees > 1000, true);
});

