import type { ReactNode } from 'react';

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`relative inline-flex items-center overflow-hidden rounded-full border border-black/8 bg-white/44 px-3.5 py-1.5 text-ink-graphite shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(255,255,255,0.16),0_14px_28px_-20px_rgba(20,17,14,0.42)] backdrop-blur-[18px] label-s ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(255,255,255,0.36)_42%,rgba(255,255,255,0.14)_100%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[18%] top-[1px] h-1/2 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(255,255,255,0))] opacity-90 blur-[3px]"
      />
      <span className="relative z-10">{children}</span>
    </p>
  );
}
