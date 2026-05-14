// MOSCH report section — introduces the five risk domains.
// Dark canvas continuation of the hero, eyebrow pill + headline + 5-column matrix.

import { Eyebrow } from '@/products/torch/design-system/primitives/Eyebrow';
import type { Mosch, Domain } from '@/products/torch/content/schema';

export function MoschSection({ section }: { section: Mosch }) {
  return (
    <section
      id="mosch"
      className="relative isolate overflow-hidden"
      style={{ background: '#050507' }}
    >
      <div className="relative mx-auto max-w-[1320px] px-6 py-24 md:px-10 md:py-32 lg:px-14">
        <div className="flex justify-center">
          <Eyebrow>{section.eyebrow}</Eyebrow>
        </div>

        <h2 className="display-section mt-8 text-center text-balance text-white">
          {section.headlinePre}{' '}
          <span className="accent-italic" style={{ color: '#F472B6' }}>
            {section.headlineAccent}
          </span>
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-5">
          {section.domains.map((d) => (
            <DomainCard key={d.letter} domain={d} />
          ))}
        </div>

        <div
          className="mt-12 rounded-xl border p-5 md:mt-14 md:p-6"
          style={{
            background:
              'linear-gradient(180deg, rgba(241,236,227,0.04) 0%, rgba(241,236,227,0.015) 100%)',
            borderColor: 'rgba(241,236,227,0.16)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 48px -32px rgba(0,0,0,0.6)',
          }}
        >
          <div className="flex items-start gap-4">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E5388B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-[1px] h-5 w-5 shrink-0"
              style={{ filter: 'drop-shadow(0 0 8px rgba(229,56,139,0.5))' }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="min-w-0 flex-1">
              <p
                className="text-[14px] font-[600] tracking-[-0.01em]"
                style={{ color: '#F1ECE3' }}
              >
                {section.callout.title}
              </p>
              <p
                className="mt-2 text-[12.5px] leading-[1.6]"
                style={{ color: 'rgba(241,236,227,0.62)' }}
              >
                {section.callout.body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DomainCard({ domain }: { domain: Domain }) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border p-5 transition-[border-color,background-color] duration-200 ease-out hover:bg-[rgba(241,236,227,0.04)] hover:border-[rgba(241,236,227,0.22)]"
      style={{
        background: 'rgba(241,236,227,0.018)',
        borderColor: 'rgba(241,236,227,0.10)',
      }}
    >
      <span
        className="block text-[clamp(2.75rem,3.4vw,3.75rem)] leading-none font-[520] tracking-[-0.035em]"
        style={{ color: '#F1ECE3' }}
      >
        {domain.letter}
      </span>

      <p
        className="mt-5 text-[15px] font-[600] tracking-[-0.005em]"
        style={{ color: '#F1ECE3' }}
      >
        {domain.name}
      </p>

      <p
        className="mt-3 text-[14px] leading-[1.45]"
        style={{ color: 'rgba(241,236,227,0.80)' }}
      >
        {domain.question}
      </p>

      <span
        aria-hidden
        className="mt-5 block h-px w-10 transition-[width] duration-300 ease-out group-hover:w-16"
        style={{ background: 'rgba(241,236,227,0.32)' }}
      />

      <p
        className="mt-5 text-[13px] leading-[1.62]"
        style={{ color: 'rgba(241,236,227,0.55)' }}
      >
        {domain.detail}
      </p>
    </div>
  );
}
