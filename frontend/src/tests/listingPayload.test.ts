import test from 'node:test';
import assert from 'node:assert/strict';
import { buildListingFormData } from '../utils/listingPayload.ts';

function readString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === 'string' ? value : null;
}

test('builds a multipart payload with capacity values and amenities', () => {
  const formData = buildListingFormData({
    title: 'Cliffside Villa',
    description: 'Ocean views',
    price: 8500,
    location: 'Goa',
    country: 'India',
    category: 'pools',
    guests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2.5,
    amenities: ['wifi', 'pool'],
  });

  assert.equal(readString(formData, 'listing[title]'), 'Cliffside Villa');
  assert.equal(readString(formData, 'listing[price]'), '8500');
  assert.equal(readString(formData, 'listing[guests]'), '6');
  assert.equal(readString(formData, 'listing[bedrooms]'), '3');
  assert.equal(readString(formData, 'listing[beds]'), '4');
  assert.equal(readString(formData, 'listing[bathrooms]'), '2.5');
  assert.deepEqual(
    JSON.parse(readString(formData, 'listing[amenities]') || '[]'),
    ['wifi', 'pool']
  );
});

test('omits undefined capacity fields and appends an optional image', () => {
  const image = new File(['image-bytes'], 'stay.jpg', { type: 'image/jpeg' });
  const formData = buildListingFormData(
    {
      title: 'Studio',
      price: 1200,
      amenities: [],
    },
    image
  );

  assert.equal(formData.has('listing[guests]'), false);
  assert.equal(formData.has('listing[bedrooms]'), false);
  assert.equal(formData.has('listing[beds]'), false);
  assert.equal(formData.has('listing[bathrooms]'), false);
  assert.equal(readString(formData, 'listing[amenities]'), '[]');

  const uploaded = formData.get('image');
  assert.ok(uploaded instanceof File);
  assert.equal(uploaded.name, 'stay.jpg');
});
