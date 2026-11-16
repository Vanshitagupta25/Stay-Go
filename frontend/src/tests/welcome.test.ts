import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WELCOME_DESTINATIONS,
  WELCOME_TIMINGS,
  WELCOME_ROTATION_MS,
  getNextDestinationIndex,
} from '../utils/welcomeConfig.ts';

test('welcome destinations provide complete, unique rotating content', () => {
  assert.ok(WELCOME_DESTINATIONS.length >= 4);

  const ids = new Set(WELCOME_DESTINATIONS.map((destination) => destination.id));
  assert.equal(ids.size, WELCOME_DESTINATIONS.length);

  for (const destination of WELCOME_DESTINATIONS) {
    assert.ok(destination.name.trim().length > 0);
    assert.ok(destination.subtitle.trim().length > 0);
    assert.match(destination.image, /^https:\/\//);
  }
});

test('destination rotation advances and wraps safely', () => {
  const length = WELCOME_DESTINATIONS.length;

  assert.equal(getNextDestinationIndex(0, length), 1);
  assert.equal(getNextDestinationIndex(length - 1, length), 0);
  assert.equal(getNextDestinationIndex(2, 0), 0);
  assert.equal(getNextDestinationIndex(-1, length), 0);
});

test('welcome rotation is slow and subtle', () => {
  assert.ok(WELCOME_ROTATION_MS >= 4000);
});

test('welcome animation timeline shows logo/title in 0-1s and description in 1-2s', () => {
  assert.equal(WELCOME_TIMINGS.logo, 0);
  assert.ok(WELCOME_TIMINGS.title > 0 && WELCOME_TIMINGS.title < 1000);
  assert.ok(WELCOME_TIMINGS.tagline >= 1000 && WELCOME_TIMINGS.tagline < 2000);
  assert.ok(WELCOME_TIMINGS.destinations >= 2000);
  assert.ok(WELCOME_TIMINGS.cta >= WELCOME_TIMINGS.destinations);

  const ordered = [
    WELCOME_TIMINGS.logo,
    WELCOME_TIMINGS.title,
    WELCOME_TIMINGS.tagline,
    WELCOME_TIMINGS.destinations,
    WELCOME_TIMINGS.cta,
  ];

  assert.deepEqual(ordered, [...ordered].sort((a, b) => a - b));
});
