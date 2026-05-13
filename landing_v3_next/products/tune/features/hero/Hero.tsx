'use client';

import { motion } from 'motion/react';
import { Button } from '@/design-system/primitives/Button';
import { shared } from '@/content/shared.content';
import type { Hero as HeroContent, SectionTocItem } from '@/content/schema';
import { DotLattice } from './DotLattice';
import { ConcentricLoop } from './ConcentricLoop';
import { AccentUnderline } from './AccentUnderline';
import { HeroNav } from './HeroNav';

type HeroProps = {
  hero: HeroContent;
  sectionToc?: readonly SectionTocItem[];
  accent?: 'tune' | 'thrust' | 'lemnisca';
};

export function Hero({ hero, sectionToc }: HeroProps) {
  return (
    <>
      <HeroNav
        brand={shared.brand.name}
        brandSuffix={shared.brand.suffix}
        items={shared.nav.items}
      />

      <section
        id="hero"
        className="relative isolate overflow-hidden"
        style={{
          // Atmospheric spectrum: near-black navy → cobalt → electric blue → pale sky.
          // The full range is visible in one viewport, like an instrument field fading
          // into a luminous floor rather than a flat blue/purple fill.
          backgroundImage: [
            'radial-gradient(ellipse 90% 58% at 50% 80%, rgba(42,132,235,0.54) 0%, rgba(18,70,203,0.34) 38%, transparent 72%)',
            'radial-gradient(ellipse 70% 60% at 18% 50%, rgba(8,43,143,0.58) 0%, transparent 70%)',
            'radial-gradient(ellipse 82% 46% at 62% -10%, rgba(2,4,28,0.98) 0%, rgba(4,10,55,0.74) 50%, transparent 76%)',
            'linear-gradient(180deg, #020414 0%, #03082A 14%, #061663 34%, #0B2CB8 57%, #236BDF 75%, #65A9EE 90%, #B9DCF8 100%)',
          ].join(', '),
        }}
      >
        {/* Soft lower field — keeps the bottom luminous blue instead of washing to white. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[360px]"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(159,207,248,0.20) 36%, rgba(219,238,253,0.66) 70%, rgba(255,255,255,0.96) 93%, #FFFFFF 100%)',
          }}
        />

        {/* Calibration substrate — aligned dot lattice, no drift. */}
        <DotLattice />

        <div className="relative mx-auto flex min-h-[100svh] max-w-[1320px] flex-col justify-center px-6 pt-32 pb-12 md:min-h-0 md:px-10 md:pt-40 md:pb-40 md:justify-start lg:px-14">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-0">
            {/* Left: cols 1–7 — eyebrow, headline, sub, CTAs.
                Vertical-nudge knob lives in `md:-mt-10` (desktop/tablet only,
                so it doesn't crowd the title under the nav on mobile). */}
            <div className="md:col-span-7 md:-mt-10 md:pr-12">
              {hero.eyebrow && (
                <p
                  className="label-m text-blue-200 motion-settle"
                  style={{ animationDelay: '0ms' }}
                >
                  {hero.eyebrow}
                </p>
              )}
              <h1
                className={`display-hero ${hero.eyebrow ? 'mt-7' : ''} max-w-[18ch] text-white motion-settle`}
                style={{ animationDelay: '120ms' }}
              >
                {hero.headlinePre}
                <AccentUnderline delayMs={700}>
                  {hero.headlineAccent}
                </AccentUnderline>
                <span className="sm:whitespace-nowrap">
                  {hero.headlineMid ?? ''}
                  {hero.headlineAccent2 ? (
                    <span className="accent-italic text-white">{hero.headlineAccent2}</span>
                  ) : null}
                </span>
                {hero.headlinePost}
              </h1>
              <p
                className="body-l mt-10 max-w-[40ch] text-white/85 motion-settle md:mt-7 md:max-w-[58ch] md:text-blue-100"
                style={{ animationDelay: '240ms' }}
              >
                {hero.sub}
              </p>
              <div
                className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 motion-settle md:mt-10"
                style={{ animationDelay: '360ms' }}
              >
                <Button href={hero.primaryCta.href} variant="pill">
                  {hero.primaryCta.label}
                </Button>
                {hero.secondaryCta && (
                  <GhostLight href={hero.secondaryCta.href}>
                    {hero.secondaryCta.label}
                  </GhostLight>
                )}
              </div>
            </div>

            {/* Right: cols 8–12 — auto-looping OPTDOE technical loop */}
            <div className="flex items-center justify-center md:col-span-5 md:justify-center md:ml-8 md:-mt-8">
              <ConcentricLoop />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Local ghost link — light variant for use on dark hero ground.
function GhostLight({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{ tap: { scale: 0.985 } }}
      transition={{ duration: 0.1, ease: [0.23, 1, 0.32, 1] }}
      className="inline-flex items-center text-[15px] font-medium text-white/85 hover:text-white"
    >
      <motion.span
        className="flex items-center gap-2"
        variants={{ rest: { x: 9 }, hover: { x: 0 } }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      >
        <span className="relative">
          {children}
          <span
            aria-hidden
            className="absolute -bottom-0.5 left-0 h-px w-0 bg-white/70 transition-[width] duration-200 ease-out group-hover:w-full"
          />
        </span>
        <motion.span
          aria-hidden
          variants={{ rest: { x: 16, opacity: 0 }, hover: { x: 0, opacity: 1 } }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="text-[18px] leading-none"
        >
          →
        </motion.span>
      </motion.span>
    </motion.a>
  );
}
