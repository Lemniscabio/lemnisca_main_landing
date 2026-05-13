import type { DeliverablesSection as DeliverablesSectionContent } from '@/content/schema';
import { Eyebrow } from '@/design-system/primitives/Eyebrow';

type DeliverablesSectionProps = {
  section: DeliverablesSectionContent;
  id?: string;
};

export function DeliverablesSection({
  section,
  id = 'what-tune-delivers',
}: DeliverablesSectionProps) {
  return (
    <section id={id} className="bg-white">
      <div className="mx-auto max-w-[1320px] px-6 py-18 md:py-22">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
          <div>
            <Eyebrow className="border-blue-100 bg-[rgba(244,245,255,0.92)] text-blue-500 shadow-none backdrop-blur-0">
              {section.eyebrow}
            </Eyebrow>
            <h2 className="display-section mt-7 max-w-[12ch] text-ink-black">
              {section.headline}
            </h2>
            <p className="mt-7 max-w-[25ch] text-[18px] leading-[1.6] tracking-[-0.018em] text-[#50607D] md:text-[19px]">
              {section.intro}
            </p>

          </div>

          <div className="rounded-[30px] border border-line-hairline-cool bg-white p-4 shadow-[0_24px_70px_-46px_rgba(20,17,14,0.2)] md:p-5">
            <div className="rounded-[999px] border border-dashed border-blue-100 bg-[rgba(244,245,255,0.58)] px-5 py-3.5 text-center">
              <p className="text-[19px] font-medium leading-[1.2] tracking-[-0.03em] text-blue-700 md:text-[21px]">
                {section.packageLabel}
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {section.cards.map((card, index) => (
                <article
                  key={card.title}
                  className="flex h-full min-h-[390px] flex-col rounded-[28px] border border-[rgba(205,205,254,0.78)] bg-white px-5 py-5 text-left shadow-[0_18px_44px_-42px_rgba(20,17,14,0.16)] transition-colors duration-300 ease-in hover:border-blue-300 md:min-h-[450px] md:px-6 md:py-6"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#050A1E] shadow-[0_20px_38px_-28px_rgba(5,10,30,0.78)] md:h-18 md:w-18">
                    <DeliverableIcon index={index} />
                  </div>

                  <h3 className="mt-7 max-w-[11ch] text-[20px] font-medium leading-[1.08] tracking-[-0.035em] text-[#060B23] md:text-[22px]">
                    {card.title}
                  </h3>

                  <p className="mt-5 text-[14px] leading-[1.58] tracking-[-0.012em] text-[#50607D] md:text-[15px]">
                    {card.body}
                  </p>

                  <div className="mt-auto rounded-[26px] border border-[rgba(229,229,231,0.8)] bg-white px-4 py-4 shadow-[0_16px_34px_-26px_rgba(20,17,14,0.18)]">
                    <p className="text-[13px] leading-[1.48] tracking-[-0.014em] text-[#3F4E6A] md:text-[14px]">
                      {card.hoverNote}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DeliverableIcon({ index }: { index: number }) {
  const common = {
    fill: 'none',
    stroke: 'white',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
        <rect x="6" y="4.5" width="12" height="15" rx="2" {...common} />
        <path d="M9 8.5h6" {...common} />
        <path d="M9 12l2 2 4-4" {...common} />
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
        <path d="M8 4.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 19V6A1.5 1.5 0 0 1 8.5 4.5Z" {...common} />
        <path d="M14 4.5V9h4.5" {...common} />
        <path d="M10 13h4" {...common} />
        <path d="M10 16.5h4" {...common} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
      <path d="M12 5.2 20 19H4L12 5.2Z" {...common} />
      <path d="M12 10v4.5" {...common} />
      <circle cx="12" cy="17.2" r="0.9" fill="white" />
    </svg>
  );
}
