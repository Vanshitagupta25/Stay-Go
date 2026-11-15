import type { Transition, Variants } from 'framer-motion';

export const EASE_SUBTLE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DURATIONS = {
  fast: 0.28,
  base: 0.45,
  slow: 0.65,
} as const;

export const REVEAL_OFFSET = 14;

const DEFAULT_STAGGER_STEP = 0.045;
const DEFAULT_STAGGER_MAX_INDEX = 11;

export function getStaggerDelay(
  index: number,
  step: number = DEFAULT_STAGGER_STEP,
  maxIndex: number = DEFAULT_STAGGER_MAX_INDEX
): number {
  if (!Number.isFinite(index) || index <= 0) return 0;
  if (!Number.isFinite(step) || step <= 0) return 0;
  if (!Number.isFinite(maxIndex) || maxIndex <= 0) return 0;

  const boundedIndex = Math.min(Math.trunc(index), Math.trunc(maxIndex));
  return Number((boundedIndex * step).toFixed(4));
}

export const fadeUp = {
  hidden: { opacity: 0, y: REVEAL_OFFSET },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.base, ease: EASE_SUBTLE },
  },
} satisfies Variants;

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATIONS.base, ease: EASE_SUBTLE },
  },
} satisfies Variants;

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: DEFAULT_STAGGER_STEP,
      delayChildren: 0.05,
    },
  },
} satisfies Variants;

export function revealTransition(delay: number = 0): Transition & { delay: number } {
  return {
    duration: DURATIONS.base,
    ease: EASE_SUBTLE,
    delay: Number.isFinite(delay) && delay > 0 ? delay : 0,
  };
}
