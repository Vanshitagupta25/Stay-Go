import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gallerySource = () =>
  readFileSync(new URL('../components/ListingGallery.tsx', import.meta.url), 'utf8');

test('gallery keeps a compact desktop height and tablet aspect ratio', () => {
  const source = gallerySource();

  assert.match(source, /aspect-\[4\/3\]/);
  assert.match(source, /lg:h-\[440px\]/);
  assert.doesNotMatch(source, /sm:aspect-\[21\/9\]/);
});

test('gallery uses cover with an adjustable object position', () => {
  const source = gallerySource();

  assert.match(source, /heroImagePosition/);
  assert.match(source, /object-cover/);
  assert.match(source, /objectPosition: heroImagePosition/);
});

test('gallery has a blurred background fallback for a single photo', () => {
  const source = gallerySource();

  assert.match(source, /blur-2xl/);
  assert.match(source, /scale-110/);
  assert.match(source, /aria-hidden="true"/);
});

test('gallery renders an Airbnb-style grid when multiple photos exist', () => {
  const source = gallerySource();

  assert.match(source, /getGalleryImages/);
  assert.match(source, /lg:grid-cols-4/);
  assert.match(source, /lg:grid-rows-2/);
  assert.match(source, /col-span-2/);
  assert.match(source, /row-span-2/);
});

test('gallery gives a single photo an editorial split layout', () => {
  const source = gallerySource();

  assert.match(source, /lg:grid-cols-\[minmax\(0,7fr\)_minmax\(280px,5fr\)\]/);
  assert.match(source, /Where you/);
  assert.match(source, /Stay details/);
});

test('gallery applies the same split and grid on tablet', () => {
  const source = gallerySource();

  assert.match(source, /md:h-\[420px\]/);
  assert.match(source, /md:grid-cols-4/);
  assert.match(source, /md:grid-rows-2/);
  assert.match(source, /md:grid-cols-\[minmax\(0,7fr\)_minmax\(280px,5fr\)\]/);
});
