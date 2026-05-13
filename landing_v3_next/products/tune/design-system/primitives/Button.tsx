'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type ButtonProps = {
  href: string;
  variant?: 'primary' | 'ghost' | 'pill';
  accent?: 'tune' | 'thrust' | 'lemnisca';
  children: ReactNode;
};

const accentBgMap = {
  tune: 'bg-accent-tune',
  thrust: 'bg-accent-thrust',
  lemnisca: 'bg-accent-lemnisca',
} as const;

// Shadow tint matches the active accent so /tune doesn't bleed Lemnisca copper.
const accentShadowMap = {
  tune: 'rgba(194, 120, 58, 0.35)',     // #C2783A
  thrust: 'rgba(31, 74, 107, 0.35)',    // #1F4A6B
  lemnisca: 'rgba(184, 106, 46, 0.35)', // #B86A2E
} as const;

function externalLinkProps(href: string) {
  return href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

export function Button({ href, variant = 'primary', accent = 'tune', children }: ButtonProps) {
  // New: yellow pill with blue-tinted shadow — used by the redesigned hero.
  if (variant === 'pill') {
    return (
      <motion.a
        href={href}
        {...externalLinkProps(href)}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={{ tap: { scale: 0.97 } }}
        transition={{ duration: 0.1, ease: [0.23, 1, 0.32, 1] }}
        className="inline-flex overflow-hidden rounded-full bg-yellow-50 px-7 py-3.5 text-[15px] font-medium tracking-[-0.005em] text-ink-black [transition:background-color_180ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-[#F4F538]"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.10), 0 6px 16px -8px rgba(0,0,0,0.35)' }}
      >
        <motion.span
          className="flex items-center gap-3"
          variants={{ rest: { x: 9 }, hover: { x: 0 } }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        >
          <span>{children}</span>
          <motion.span
            aria-hidden
            variants={{ rest: { x: 16, opacity: 0 }, hover: { x: 0, opacity: 1 } }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="text-[18px] leading-none"
          >→</motion.span>
        </motion.span>
      </motion.a>
    );
  }

  if (variant === 'primary') {
    return (
      <Link
        href={href}
        {...externalLinkProps(href)}
        className={`group inline-flex items-center gap-3 rounded-full ${accentBgMap[accent]} px-7 py-3.5 text-[15px] font-medium tracking-[-0.005em] text-surface-paper transition-[background-color,box-shadow,transform] duration-200 ease-out active:scale-[0.97]`}
        style={{
          boxShadow: `0 1px 0 rgba(20,17,14,0.04), 0 12px 28px -16px ${accentShadowMap[accent]}`,
        }}
      >
        <span>{children}</span>
        <span aria-hidden>→</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      {...externalLinkProps(href)}
      className="group inline-flex items-center gap-2 text-[15px] text-ink-black transition-[color,transform] duration-150 ease-out active:scale-[0.985]"
    >
      <span className="relative">
        {children}
        <span
          aria-hidden
          className="absolute -bottom-0.5 left-0 h-px w-0 bg-ink-black transition-[width] duration-220 ease-out group-hover:w-full"
        />
      </span>
    </Link>
  );
}
