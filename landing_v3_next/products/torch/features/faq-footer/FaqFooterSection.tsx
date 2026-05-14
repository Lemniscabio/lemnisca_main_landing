'use client';

// FAQ + footer wordmark.
// Uses the torch gradient — overhead magenta carry-through plus a rising bloom
// from the bottom so the big TORCH wordmark sits in reflected light.

import { AnimatePresence, motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { Eyebrow } from '@/products/torch/design-system/primitives/Eyebrow';
import type { Faq } from '@/products/torch/content/schema';

export function FaqFooterSection({ section, id = 'faq' }: { section: Faq; id?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const footerRef = useRef<HTMLElement>(null);
  const footerInView = useInView(footerRef, { once: true, margin: '-80px 0px' });

  return (
    <section
      id={id}
      className="relative isolate overflow-hidden"
      style={{ background: '#050507' }}
    >
      {/* Rising torch — mirror of the hero's overhead torchlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 160% 130% at 50% 108%, rgba(185,30,92,0.32) 0%, rgba(126,18,56,0.18) 38%, rgba(61,8,23,0.10) 62%, transparent 88%)',
            'radial-gradient(ellipse 135% 115% at 50% 106%, rgba(229,56,139,0.46) 0%, rgba(229,56,139,0.22) 32%, rgba(185,30,92,0.10) 58%, transparent 84%)',
            'radial-gradient(ellipse 95% 85% at 50% 102%, rgba(244,114,182,0.52) 0%, rgba(229,56,139,0.28) 28%, transparent 68%)',
          ].join(', '),
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 motion-flame"
        style={{
          height: '75%',
          background: [
            'radial-gradient(ellipse 36% 50% at 50% 104%, rgba(255,235,245,0.90) 0%, rgba(253,231,240,0.50) 24%, rgba(249,168,201,0.20) 45%, transparent 62%)',
            'radial-gradient(ellipse 58% 70% at 50% 100%, rgba(229,56,139,0.68) 0%, rgba(229,56,139,0.30) 32%, transparent 70%)',
          ].join(', '),
          filter: 'blur(2px)',
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(1px 1px at 8% 28%, rgba(241,236,227,0.35), transparent 50%)',
            'radial-gradient(1px 1px at 22% 52%, rgba(241,236,227,0.30), transparent 50%)',
            'radial-gradient(0.8px 0.8px at 14% 76%, rgba(241,236,227,0.40), transparent 50%)',
            'radial-gradient(1px 1px at 38% 38%, rgba(241,236,227,0.32), transparent 50%)',
            'radial-gradient(1.2px 1.2px at 56% 64%, rgba(241,236,227,0.40), transparent 50%)',
            'radial-gradient(0.8px 0.8px at 72% 22%, rgba(241,236,227,0.32), transparent 50%)',
            'radial-gradient(1px 1px at 86% 48%, rgba(241,236,227,0.38), transparent 50%)',
            'radial-gradient(0.8px 0.8px at 94% 78%, rgba(241,236,227,0.34), transparent 50%)',
            'radial-gradient(1px 1px at 64% 86%, rgba(241,236,227,0.28), transparent 50%)',
          ].join(', '),
        }}
      />

      <div className="relative mx-auto max-w-[1320px] px-6 pt-24 pb-12 md:px-10 md:pt-32 lg:px-14">
        <div className="mx-auto max-w-[1080px]">
          <div className="flex justify-start">
            <Eyebrow>{section.eyebrow}</Eyebrow>
          </div>

          <div
            className="mt-14 border-t"
            style={{ borderColor: 'rgba(241,236,227,0.12)' }}
          >
            {section.items.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={item.question}
                  className="border-b py-6"
                  style={{ borderColor: 'rgba(241,236,227,0.12)' }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenIndex((current) => (current === index ? null : index))
                    }
                    className="group flex w-full cursor-pointer items-start justify-between gap-6 rounded-[18px] text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="max-w-[42ch] text-[22px] font-medium leading-[1.18] tracking-[-0.018em] transition-colors duration-150 ease-out"
                      style={{
                        color: isOpen ? '#F1ECE3' : 'rgba(241,236,227,0.92)',
                      }}
                    >
                      {item.question}
                    </span>
                    <motion.span
                      className="mt-1 text-[24px] leading-none"
                      style={{ color: '#E5388B' }}
                      animate={{ rotate: isOpen ? 45 : 0, x: isOpen ? 0 : 2 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    >
                      +
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0, y: -6 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -4 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="origin-top overflow-hidden"
                      >
                        <p
                          className="body-m mt-4 max-w-[64ch]"
                          style={{ color: 'rgba(241,236,227,0.72)' }}
                        >
                          {item.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <footer ref={footerRef} className="relative mt-24 pt-10 md:mt-32">
          <div className="overflow-hidden">
            <motion.div
              aria-label={`${section.wordmark.primary} ${section.wordmark.by} ${section.wordmark.secondary}`}
              className="flex items-end justify-center gap-4 text-left md:gap-8"
              initial={{ opacity: 0, y: 18 }}
              animate={footerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <p
                className="text-[clamp(3rem,13vw,12rem)] font-medium leading-none tracking-[-0.08em] text-white"
                style={{ textShadow: '0 0 80px rgba(229,56,139,0.45)' }}
              >
                {section.wordmark.primary}
              </p>
              <div className="mb-3 flex flex-col items-start justify-end md:mb-5">
                <p
                  className="mb-1 text-[14px] font-medium tracking-[-0.02em] md:mb-1.5 md:text-[16px]"
                  style={{ color: 'rgba(241,236,227,0.78)' }}
                >
                  {section.wordmark.by}
                </p>
                <p
                  className="text-[clamp(1.3rem,3.6vw,3.2rem)] font-medium leading-none tracking-[-0.05em]"
                  style={{ color: 'rgba(241,236,227,0.96)' }}
                >
                  {section.wordmark.secondary}
                </p>
              </div>
            </motion.div>
          </div>
        </footer>
      </div>
    </section>
  );
}
