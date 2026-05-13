'use client';

import { motion } from 'motion/react';
import type { SprintCta as SprintCtaContent } from '@/content/schema';
import { CALENDLY_URL } from '@/content/shared.content';

type SprintCtaProps = {
  section: SprintCtaContent;
  product: 'tune' | 'thrust' | 'lemnisca';
  accent?: 'tune' | 'thrust' | 'lemnisca';
  id?: string;
};

export function SprintCta({ section, id = 'engagement-start' }: SprintCtaProps) {
  return (
    <section
      id={id}
      className="relative overflow-hidden bg-white px-6 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="relative overflow-hidden rounded-[34px] border border-blue-300/30 shadow-[0_34px_90px_-52px_rgba(4,14,52,0.52)]">
          <div className="px-7 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: [
                'radial-gradient(ellipse 68% 50% at 20% 20%, rgba(65,64,252,0.38) 0%, transparent 72%)',
                'radial-gradient(ellipse 82% 58% at 86% 18%, rgba(12,35,173,0.42) 0%, transparent 72%)',
                'radial-gradient(ellipse 90% 56% at 50% 100%, rgba(2,8,38,0.96) 0%, rgba(3,8,44,0.82) 54%, transparent 88%)',
                'linear-gradient(180deg, #1B2943 0%, #143B9D 26%, #0E2FB4 46%, #091C84 68%, #050D34 100%)',
              ].join(', '),
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[180px]"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 46%, transparent 100%)',
            }}
          />
          <div
            aria-hidden
            className="blue-sheen-drift motion-safe:animate-[blue-sheen-drift_12s_ease-in-out_infinite] pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(circle at 26% 14%, rgba(205,205,254,0.2) 0%, transparent 32%)',
            }}
          />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-12">
            <div className="flex min-h-[520px] flex-col justify-center lg:min-h-[600px]">
              <h2 className="display-section max-w-[12ch] text-white">
                {section.headline}
              </h2>
            </div>

            <div className="flex items-stretch">
              <div className="flex w-full flex-col justify-center rounded-[28px] border border-[rgba(205,205,254,0.38)] bg-[linear-gradient(180deg,rgba(244,246,255,0.98)_0%,rgba(255,255,255,1)_100%)] px-8 py-10 shadow-[0_28px_64px_-40px_rgba(2,6,22,0.48)] md:px-10 md:py-12 lg:px-12">
                <div className="max-w-[34rem]">
                  <p className="text-[clamp(1.75rem,2.6vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.04em] text-[#060B23]">
                    {section.body[0]}
                  </p>
                  <p className="mt-7 text-[18px] leading-[1.65] tracking-[-0.014em] text-[#50607D] md:text-[20px]">
                    {section.body[1]}
                  </p>
                </div>
                <div className="mt-10">
                  <motion.a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex overflow-hidden rounded-full bg-blue-600 px-6 py-3.5 text-[15px] font-medium tracking-[-0.015em] text-white shadow-[0_18px_42px_-26px_rgba(65,64,252,0.54)] [transition:background-color_180ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-blue-700 md:px-7 md:py-4 md:text-[16px]"
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    variants={{ tap: { scale: 0.97 } }}
                    transition={{ duration: 0.1, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <motion.span
                      className="flex items-center gap-3"
                      variants={{ rest: { x: 9 }, hover: { x: 0 } }}
                      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <span>Request a Tune fit conversation</span>
                      <motion.span
                        aria-hidden
                        variants={{ rest: { x: 16, opacity: 0 }, hover: { x: 0, opacity: 1 } }}
                        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                        className="text-[18px] leading-none"
                      >→</motion.span>
                    </motion.span>
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
