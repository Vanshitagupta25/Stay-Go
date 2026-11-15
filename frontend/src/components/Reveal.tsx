import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { DURATIONS, EASE_SUBTLE, REVEAL_OFFSET } from '../utils/motion';

export interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  offset?: number;
  once?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  offset = REVEAL_OFFSET,
  once = true,
  className,
  ...rest
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: offset }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: DURATIONS.base, ease: EASE_SUBTLE, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
