'use client';

// Hand-drawn-feeling yellow underline for the accent word in the hero headline.
// Wraps inline content; SVG sits underneath, drawn via stroke-dashoffset on mount.
// The path has a subtle hand-tilt and a tiny mid-stroke wobble — clinical-but-alive.

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type AccentUnderlineProps = {
  children: ReactNode;
  delayMs?: number;
};

export function AccentUnderline({ children, delayMs = 800 }: AccentUnderlineProps) {
  const reduced = useReducedMotion();

  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <motion.svg
        aria-hidden
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="absolute -bottom-2 left-0 h-[0.42em] w-full"
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.001, delay: reduced ? 0 : delayMs / 1000 }}
      >
        {/* Slight upward tilt, subtle mid-stroke dip — reads as drawn, not geometric. */}
        <motion.path
          d="M 3 9 C 35 6, 78 11, 110 7 S 175 5, 197 8"
          fill="none"
          stroke="#FBFC40"
          strokeWidth={4}
          strokeLinecap="round"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: reduced ? 0 : 0.7,
            delay: reduced ? 0 : delayMs / 1000,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </motion.svg>
    </span>
  );
}
