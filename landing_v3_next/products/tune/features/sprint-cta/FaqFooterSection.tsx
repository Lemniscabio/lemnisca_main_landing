'use client';

import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { shared } from '@/content/shared.content';
import { Eyebrow } from '@/design-system/primitives/Eyebrow';

const FAQS = [
  {
    question: 'Is Tune right for our stage?',
    answer:
      "Tune is built for teams with promising early fermentation data but no mature, reproducible process yet. You've seen signals in flasks or early bioreactor runs, but can't reliably replicate the good ones or systematically avoid the bad ones. If you're asking \"what should we test next?\" or \"are we ready to optimize?\", Tune is a fit. If you already have a stable baseline and controlled DoE experience, you might want to explore our full learning loop iteration program, we can discuss the right entry point during the fit conversation.",
  },
  {
    question: 'What data do we need for the sprint?',
    answer:
      "Any format works. Send us what you have: Excel sheets, ELN exports, PDFs, Word docs, scanned notebook pages, CSV files etc. We'll pull out what we need: strain info, run conditions, measurements, recipes, assay notes. The sprint is format-agnostic. If you have it, we can work with it.",
  },
  {
    question: "How long does the sprint take, and what's the workflow?",
    answer:
      "7-10 days from data handoff to interactive report. You send us what you have (batch records, recipes, assay notes). We run a statistical, biological, and engineering review. You get back a verdict (ready / fix baseline first / improve assays / defer), a risk map showing where your process is fragile, data gaps prioritized, and the next experiments we'd recommend. One call at the end to walk through it.",
  },
  {
    question: "We can't share our data. IP concerns.",
    answer:
      "Understood. We sign NDAs as standard. Data stays secure, access-controlled storage. If you have extra compliance requirements, we can discuss those before you send anything.",
  },
  {
    question: 'What if the verdict is "no, you\'re not ready"?',
    answer:
      "Then we tell you exactly why and what to fix first. The report will say \"stabilize your baseline before optimization\" or \"tighten your assay precision\" or \"run 3 more replicates at the current condition\", whatever the actual blocker is. You'll know whether to spend the next 2 months on reproducibility, analytics, or earning more data. That's the point of the sprint: don't start optimizing a system that isn't ready to be optimized. A \"not ready\" verdict saves you 6 months of wasted DoE cycles.",
  },
  {
    question: 'What happens if we are ready and want to proceed?',
    answer:
      "We move to the full Tune program: hybrid model-guided optimization with either your wet lab (we design, you run) or our integrated wet + dry lab (we run everything). The models update after every experiment round. Learning compounds. We'll scope the program during the sprint debrief call based on what your process needs.",
  },
  {
    question: 'We can do this ourselves. Why bring in Lemnisca?',
    answer:
      "You could, but your team is already running experiments and managing the program. The readiness sprint needs three disciplines working together: bioprocess engineering, modeling, and experimental design, which is a rare combination to have sitting idle. We turn a 4-6 week analysis (competing with everything else on your plate) into a 7-day focused review. More importantly, we surface the gotchas before you're waist-deep in optimization: unstable baselines, assay precision issues, wrong variable prioritization. Early detection saves months. That's the value.",
  },
] as const;

export function FaqFooterSection({ id = 'engagement-faq' }: { id?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const footerRef = useRef<HTMLElement>(null);
  const footerInView = useInView(footerRef, { once: true, margin: '-80px 0px' });

  return (
    <section
      id={id}
      className="relative isolate overflow-hidden"
      style={{
        backgroundImage: [
          'radial-gradient(ellipse 90% 58% at 50% 20%, rgba(42,132,235,0.54) 0%, rgba(18,70,203,0.34) 38%, transparent 72%)',
          'radial-gradient(ellipse 70% 60% at 18% 50%, rgba(8,43,143,0.58) 0%, transparent 70%)',
          'radial-gradient(ellipse 82% 46% at 62% 110%, rgba(2,4,28,0.98) 0%, rgba(4,10,55,0.74) 50%, transparent 76%)',
          'linear-gradient(180deg, #FFFFFF 0%, #F4FAFF 4%, #DCEEFF 10%, #9FCBF3 18%, #236BDF 30%, #0B2CB8 46%, #061663 64%, #03082A 82%, #020414 100%)',
        ].join(', '),
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[220px]"
        style={{
          background:
            'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.88) 30%, rgba(236,247,255,0.4) 65%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 pt-24 pb-12 md:px-10 md:pt-32 lg:px-14">
        <div className="mx-auto max-w-[1080px]">
          <Eyebrow>Frequently Asked Questions</Eyebrow>

          <div className="mt-14 border-t border-white/14">
            {FAQS.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={item.question} className="border-b border-white/14" style={{ contain: 'layout style' }}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                    className="group flex w-full cursor-pointer items-start justify-between gap-6 rounded-[18px] py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className={`min-w-0 flex-1 text-[22px] font-medium leading-[1.18] tracking-[-0.018em] transition-colors duration-150 ease-out ${isOpen ? 'text-white' : 'text-white/92 group-hover:text-white'}`}>
                      {item.question}
                    </span>
                    <span
                      className="mt-1 flex-shrink-0 text-[24px] leading-none text-blue-100"
                      style={{
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                        willChange: 'transform',
                        display: 'inline-block',
                      }}
                    >
                      +
                    </span>
                  </button>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateRows: isOpen ? '1fr' : '0fr',
                      transition: 'grid-template-rows 260ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div style={{ overflow: 'hidden', minHeight: 0 }}>
                      <p
                        className="body-m mt-4 mb-6 w-full text-white"
                        style={{
                          opacity: isOpen ? 1 : 0,
                          transform: isOpen ? 'translateY(0)' : 'translateY(-4px)',
                          transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                          willChange: 'opacity, transform',
                        }}
                      >
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer ref={footerRef} className="relative mt-24 pt-10 md:mt-32">
          <div className="mt-1 overflow-hidden">
            <motion.div
              aria-label={shared.brand.name}
              className="flex items-end justify-center gap-4 text-left md:gap-8"
              initial={{ opacity: 0, y: 18 }}
              animate={footerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[clamp(3.6rem,18vw,17rem)] font-medium leading-none tracking-[-0.08em] text-white">
                {shared.brand.name.toUpperCase()}
              </p>
              <div className="mb-4 flex flex-col items-start justify-end md:mb-6.5">
                <p className="mb-1.5 text-[16px] font-medium tracking-[-0.02em] text-blue-100/88 md:mb-2 md:text-[18px]">
                  by
                </p>
                <p className="text-[clamp(1.6rem,4.6vw,4.25rem)] font-medium leading-none tracking-[-0.05em] text-white/96">
                  Lemnisca
                </p>
              </div>
            </motion.div>
          </div>
        </footer>
      </div>
    </section>
  );
}
