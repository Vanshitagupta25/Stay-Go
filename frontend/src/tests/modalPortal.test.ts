import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const readComponent = (name: string) =>
  readFileSync(new URL(`../components/${name}.tsx`, import.meta.url), 'utf8');

test('modal portal mounts overlays on document.body', () => {
  const source = readComponent('ModalPortal');

  assert.match(source, /createPortal/);
  assert.match(source, /document\.body/);
});

for (const component of [
  'AuthModal',
  'ListingModal',
  'LogoutModal',
  'WishlistModal',
  'BookingsModal',
]) {
  test(`${component} escapes transformed ancestors via ModalPortal`, () => {
    const source = readComponent(component);

    assert.match(source, /<ModalPortal>/);
  });
}
