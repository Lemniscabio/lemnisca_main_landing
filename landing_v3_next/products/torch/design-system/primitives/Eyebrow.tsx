import type { ReactNode } from 'react';

// Dark-canvas glass eyebrow pill. The Tune version inherits a light/cream
// chrome which reads as a flat grey button on Torch's near-black background.
// Here the pill is a thin frosted-glass capsule: subtle white outline, deep
// translucent fill, faint top highlight, and a soft magenta ambient glow
// that matches the torchlight palette without competing with it.
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`relative inline-flex items-center overflow-hidden rounded-full border border-white/12 px-3.5 py-1.5 label-s ${className}`}
      style={{
        color: 'rgba(241,236,227,0.88)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(255,255,255,0.02), 0 18px 32px -22px rgba(229,56,139,0.32)',
      }}
    >
      <span className="relative z-10">{children}</span>
    </p>
  );
}
