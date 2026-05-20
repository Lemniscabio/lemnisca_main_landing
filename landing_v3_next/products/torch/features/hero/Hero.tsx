// Torch hero section.
//
// Theme: near-black canvas with overhead torchlight raining down on the hero.
// Background layers (bottom → top):
//   1. Solid near-black (#050507)
//   2. Overhead light wash — broad top-centered magenta bloom, fades to black
//   3. Hot core — narrow brighter source at the very top (torch flame above frame)
//   4. Star field — sparse, distributed
//   5. Grain (feTurbulence)
//   6. Vignette darkening lower corners
//   7. Content (headline · subhead · CTAs)

import Link from 'next/link';
import { HeroNav } from './HeroNav';
import { AccentUnderline } from './AccentUnderline';
import type { Hero as HeroContent } from '@/products/torch/content/schema';

export function Hero({ hero }: { hero: HeroContent }) {
  return (
    <>
      <HeroNav />

      <section
        id="top"
        className="relative isolate overflow-hidden"
        style={{ background: '#050507' }}
      >
        {/* ── 1. Overhead light wash — broad top-centered torchlight ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 160% 130% at 50% -8%, rgba(185,30,92,0.32) 0%, rgba(126,18,56,0.18) 38%, rgba(61,8,23,0.10) 62%, transparent 88%)',
              'radial-gradient(ellipse 135% 115% at 50% -6%, rgba(229,56,139,0.46) 0%, rgba(229,56,139,0.22) 32%, rgba(185,30,92,0.10) 58%, transparent 84%)',
              'radial-gradient(ellipse 95% 85% at 50% -2%, rgba(244,114,182,0.52) 0%, rgba(229,56,139,0.28) 28%, transparent 68%)',
            ].join(', '),
          }}
        />

        {/* ── 2. Hot core — narrow bright source above frame, slow flicker ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 motion-flame"
          style={{
            height: '75%',
            background: [
              'radial-gradient(ellipse 36% 50% at 50% -4%, rgba(255,235,245,0.90) 0%, rgba(253,231,240,0.50) 24%, rgba(249,168,201,0.20) 45%, transparent 62%)',
              'radial-gradient(ellipse 58% 70% at 50% 0%, rgba(229,56,139,0.68) 0%, rgba(229,56,139,0.30) 32%, transparent 70%)',
            ].join(', '),
            filter: 'blur(2px)',
          }}
        />

        {/* ── 3. Star field — sparse, distributed ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              'radial-gradient(1px 1px at 8% 22%, rgba(255,255,255,0.40), transparent 50%)',
              'radial-gradient(1px 1px at 18% 64%, rgba(255,255,255,0.45), transparent 50%)',
              'radial-gradient(1.2px 1.2px at 12% 84%, rgba(255,255,255,0.50), transparent 50%)',
              'radial-gradient(0.8px 0.8px at 28% 38%, rgba(255,255,255,0.35), transparent 50%)',
              'radial-gradient(1px 1px at 42% 78%, rgba(255,255,255,0.40), transparent 50%)',
              'radial-gradient(0.8px 0.8px at 36% 92%, rgba(255,255,255,0.32), transparent 50%)',
              'radial-gradient(1px 1px at 62% 18%, rgba(255,255,255,0.42), transparent 50%)',
              'radial-gradient(1px 1px at 72% 56%, rgba(255,255,255,0.45), transparent 50%)',
              'radial-gradient(0.8px 0.8px at 58% 88%, rgba(255,255,255,0.38), transparent 50%)',
              'radial-gradient(1.2px 1.2px at 86% 72%, rgba(255,255,255,0.50), transparent 50%)',
              'radial-gradient(1px 1px at 92% 32%, rgba(255,255,255,0.42), transparent 50%)',
              'radial-gradient(0.8px 0.8px at 96% 88%, rgba(255,255,255,0.45), transparent 50%)',
              'radial-gradient(0.8px 0.8px at 78% 14%, rgba(255,255,255,0.36), transparent 50%)',
              'radial-gradient(1px 1px at 50% 94%, rgba(255,255,255,0.34), transparent 50%)',
            ].join(', '),
          }}
        />

        {/* ── 4. Grain ── */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ opacity: 0.05, mixBlendMode: 'overlay' }}
        >
          <filter id="torch-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#torch-grain)" />
        </svg>

        {/* ── 5. Vignette ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 110% 70% at 50% 100%, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.30) 35%, transparent 65%)',
              'linear-gradient(90deg, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.35) 100%)',
            ].join(', '),
          }}
        />

        {/* ── Content ── */}
        <div className="relative mx-auto flex min-h-[100svh] max-w-[1200px] flex-col items-center justify-center px-6 pt-24 pb-28 text-center md:px-10 md:pt-32 md:pb-36 lg:px-14">
          <h1
            className="display-hero mx-auto max-w-[22ch] text-balance text-white motion-settle"
            style={{ animationDelay: '120ms' }}
          >
            {hero.headlinePre}{' '}
            <AccentUnderline delayMs={900}>
              <span className="accent-italic" style={{ color: '#F472B6' }}>
                {hero.headlineAccent}
              </span>
            </AccentUnderline>{' '}
            {hero.headlinePost}
          </h1>

          <p
            className="body-m mx-auto mt-6 max-w-[60ch] text-balance motion-settle"
            style={{ animationDelay: '240ms', color: 'rgba(255,255,255,0.72)' }}
          >
            {hero.sub}
          </p>

          <div
            className="mt-9 flex flex-wrap items-center justify-center gap-3 motion-settle"
            style={{ animationDelay: '360ms' }}
          >
            <Link
              href={hero.primaryCta.href}
              className="group inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[15px] font-[500] tracking-[-0.005em] text-white transition-[opacity,transform] duration-200 ease-out hover:opacity-90 active:scale-[0.97]"
              style={{
                background: '#E5388B',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.10) inset, 0 10px 28px -10px rgba(229,56,139,0.55)',
              }}
            >
              <span>{hero.primaryCta.label}</span>
              <span aria-hidden>→</span>
            </Link>

            <Link
              href={hero.secondaryCta.href}
              className="group inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.03] px-6 py-3.5 text-[15px] font-[500] text-white/90 transition-[background-color,border-color,transform] duration-200 ease-out hover:border-white/30 hover:bg-white/[0.06] active:scale-[0.97]"
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
