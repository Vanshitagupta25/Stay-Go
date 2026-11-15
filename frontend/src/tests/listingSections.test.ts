import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (name: string) =>
  readFileSync(new URL(`../components/${name}`, import.meta.url), 'utf8');

test('details column does not stack duplicate horizontal separator lines', () => {
  const listingShow = source('ListingShow.tsx');
  const amenities = source('StayAmenities.tsx');
  const calendar = source('TwoMonthCalendar.tsx');

  assert.match(listingShow, /border-b border-gray-200\/80 pb-6/);
  assert.doesNotMatch(amenities, /border-t/);
  assert.doesNotMatch(calendar, /border-b border-gray-200/);
});
