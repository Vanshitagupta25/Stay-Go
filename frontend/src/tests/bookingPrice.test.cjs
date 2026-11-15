const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { calculateBookingPrice } = require(path.resolve(__dirname, '../../../backend/utils/pricingCalculator.js'));

test('frontend and backend pricing logic calculates full amount with service fee and applicable taxes', () => {
  const pricePerNight = 2500;
  const numberOfNights = 4;

  const result = calculateBookingPrice({ pricePerNight, numberOfNights });

  assert.strictEqual(result.nights, 4);
  assert.strictEqual(result.basePrice, 10000); // 2500 * 4

  const expectedServiceFee = Math.round(10000 * 0.12);
  assert.strictEqual(result.serviceFee, expectedServiceFee);
  assert.strictEqual(result.serviceFee, 1200);

  const expectedTax = Math.round((10000 + 1200) * 0.18);
  assert.strictEqual(result.tax, expectedTax);
  assert.strictEqual(result.tax, 2016);

  const expectedTotalRupees = 10000 + 1200 + 2016;
  assert.strictEqual(result.totalRupees, expectedTotalRupees);
  assert.strictEqual(result.totalRupees, 13216);

  assert.strictEqual(result.totalPaise, 1321600);
});
