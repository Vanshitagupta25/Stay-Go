import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATIONS,
  EASE_SUBTLE,
  REVEAL_OFFSET,
  fadeIn,
  fadeUp,
  getStaggerDelay,
  revealTransition,
} from '../utils/motion.ts';

test('subtle easing is a valid four-point cubic bezier', () => {
  assert.equal(EASE_SUBTLE.length, 4);
  for (const value of EASE_SUBTLE) {
    assert.ok(value >= 0 && value <= 1);
  }
  assert.deepEqual(EASE_SUBTLE, [0.22, 1, 0.36, 1]);
});

test('durations stay gentle and ordered from fast to slow', () => {
  assert.ok(DURATIONS.fast > 0);
  assert.ok(DURATIONS.fast < DURATIONS.base);
  assert.ok(DURATIONS.base < DURATIONS.slow);
  assert.ok(DURATIONS.slow <= 0.8);
});

test('stagger delay starts at zero and grows per index', () => {
  assert.equal(getStaggerDelay(0), 0);
  assert.ok(getStaggerDelay(1) > 0);
  assert.ok(getStaggerDelay(4) > getStaggerDelay(2));
});

test('stagger delay clamps so large grids stay snappy', () => {
  const clamped = getStaggerDelay(100);
  const atCap = getStaggerDelay(11);
  assert.equal(clamped, atCap);
  assert.ok(clamped <= 0.6);
});

test('stagger delay handles invalid input safely', () => {
  assert.equal(getStaggerDelay(-3), 0);
  assert.equal(getStaggerDelay(Number.NaN), 0);
  assert.equal(getStaggerDelay(2, 0), 0);
  assert.equal(getStaggerDelay(2, -1), 0);
});

test('fade up and fade in variants stay subtle', () => {
  assert.equal(fadeUp.hidden.opacity, 0);
  assert.equal(fadeUp.hidden.y, REVEAL_OFFSET);
  assert.equal(fadeUp.visible.opacity, 1);
  assert.equal(fadeUp.visible.y, 0);

  assert.equal(fadeIn.hidden.opacity, 0);
  assert.equal(fadeIn.visible.opacity, 1);
  assert.ok(REVEAL_OFFSET > 0 && REVEAL_OFFSET <= 24);
});

test('reveal transition uses the shared subtle easing and fires once', () => {
  const transition = revealTransition(0.12);
  assert.equal(transition.delay, 0.12);
  assert.equal(transition.ease, EASE_SUBTLE);
  assert.ok(typeof transition.duration === 'number');
  assert.ok((transition.duration as number) <= DURATIONS.slow);
  assert.equal(revealTransition().delay, 0);
});
