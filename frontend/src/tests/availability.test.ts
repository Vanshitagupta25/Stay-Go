import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isRangeBooked,
  getBookingButtonState,
} from '../utils/availability.ts';

test('isRangeBooked detects overlapping occupied nights', () => {
  const bookedDates = ['2026-11-10', '2026-11-11', '2026-11-12'];

  assert.equal(isRangeBooked('2026-11-12', '2026-11-15', bookedDates), true);
  assert.equal(isRangeBooked('2026-11-09', '2026-11-11', bookedDates), true);
});

test('isRangeBooked allows a new stay starting on the checkout day', () => {
  const bookedDates = ['2026-11-10', '2026-11-11', '2026-11-12'];

  assert.equal(isRangeBooked('2026-11-13', '2026-11-15', bookedDates), false);
});

test('isRangeBooked ignores incomplete or reversed ranges', () => {
  const bookedDates = ['2026-11-10'];

  assert.equal(isRangeBooked('', '2026-11-12', bookedDates), false);
  assert.equal(isRangeBooked('2026-11-12', '2026-11-10', bookedDates), false);
});

test('booking button shows Booked and disables checkout for unavailable dates', () => {
  assert.deepEqual(
    getBookingButtonState({
      checkIn: '2026-11-10',
      checkOut: '2026-11-13',
      isChecking: false,
      isUnavailable: true,
      isProcessing: false,
    }),
    { label: 'Booked', disabled: true }
  );
});

test('booking button shows checking state while availability loads', () => {
  assert.deepEqual(
    getBookingButtonState({
      checkIn: '2026-11-10',
      checkOut: '2026-11-13',
      isChecking: true,
      isUnavailable: false,
      isProcessing: false,
    }),
    { label: 'Checking availability...', disabled: true }
  );
});

test('booking button prompts for dates before payment', () => {
  assert.deepEqual(
    getBookingButtonState({
      checkIn: '',
      checkOut: '',
      isChecking: false,
      isUnavailable: false,
      isProcessing: false,
    }),
    { label: 'Check availability', disabled: false }
  );
});

test('booking button allows reserve and pay for available dates', () => {
  assert.deepEqual(
    getBookingButtonState({
      checkIn: '2026-11-10',
      checkOut: '2026-11-13',
      isChecking: false,
      isUnavailable: false,
      isProcessing: false,
    }),
    { label: 'Reserve & Pay', disabled: false }
  );
});
