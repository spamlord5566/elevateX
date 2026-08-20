'use client';

import { LazyMotion, domAnimation, type ReactNode } from 'framer-motion';

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Wraps app with Framer Motion's LazyMotion for optimal bundle size.
 * Uses the `domAnimation` feature bundle which covers:
 * - Animations, transitions, gestures (hover, tap)
 * - Layout animations
 * - Variants
 *
 * NOTE: Does NOT include 3D transforms or drag — add `domMax` if needed.
 */
export default function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
