import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('mobile create FAB stays anchored to the bottom right', () => {
  const source = readFileSync(new URL('../components/Navbar.tsx', import.meta.url), 'utf8');

  assert.match(source, /fixed bottom-8 right-6 z-50 md:hidden/);
  assert.match(source, /createPortal/);
  assert.doesNotMatch(source, /FAB_START_TOP/);
  assert.doesNotMatch(source, /getFabTop/);
});

test('mobile create FAB no longer follows scroll position', () => {
  const source = readFileSync(new URL('../components/Navbar.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /fabRef/);
  assert.doesNotMatch(source, /style=\{\{ top:/);
});

test('listing detail header omits the host avatar', () => {
  const source = readFileSync(new URL('../components/ListingShow.tsx', import.meta.url), 'utf8');

  assert.match(source, /hosted by \{ownerName\}/);
  assert.doesNotMatch(source, /ownerName\.charAt\(0\)/);
});
