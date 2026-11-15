import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PROFILE_MENU_MIN_TOP,
  getProfileDropdownPosition,
} from '../utils/profileDropdown.ts';
import { getAuthSuccessAction } from '../utils/authFlow.ts';

const readComponent = (name: string) =>
  readFileSync(new URL(`../components/${name}.tsx`, import.meta.url), 'utf8');

test('profile dropdown opens below the sticky header', () => {
  const position = getProfileDropdownPosition(
    { bottom: 58, right: 1200 } as DOMRect,
    1280,
  );

  assert.equal(position.top, PROFILE_MENU_MIN_TOP);
  assert.equal(position.right, 80);
});

test('profile dropdown stays below the header for taller triggers', () => {
  const position = getProfileDropdownPosition(
    { bottom: 120, right: 900 } as DOMRect,
    1280,
  );

  assert.ok(position.top > 120);
  assert.equal(position.right, 380);
});

test('profile dropdown keeps an edge margin near the viewport edge', () => {
  const position = getProfileDropdownPosition(
    { bottom: 58, right: 1280 } as DOMRect,
    1280,
  );

  assert.equal(position.right, 12);
});

test('signup returns to signin instead of completing authentication', () => {
  assert.equal(getAuthSuccessAction('signup'), 'show-login');
  assert.equal(getAuthSuccessAction('login'), 'complete');
});

test('Navbar portals the profile menu using the shared position helper', () => {
  const source = readComponent('Navbar');

  assert.match(source, /getProfileDropdownPosition/);
  assert.match(source, /createPortal/);
  assert.match(source, /ref=\{profileMenuRef\}/);
});

test('AuthModal routes signup success back to signin', () => {
  const source = readComponent('AuthModal');

  assert.match(source, /getAuthSuccessAction/);
  assert.match(source, /setMode\('login'\)/);
});
