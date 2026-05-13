import type { PaidLoop as PaidLoopContent } from '@/content/schema';
import { AccentUnderline } from '@/features/hero/AccentUnderline';
import { LoopComparisonViz } from '@/features/engagement/LoopComparisonViz';

type MethodSystemProps = {
  section: PaidLoopContent;
  id?: string;
};

const BENTO_LAYOUT = [
  'lg:col-span-4',
  'lg:col-span-3',
  'lg:col-span-7',
] as const;

export function MethodSystem({ section, id = 'how-method' }: MethodSystemProps) {
  return (
    <section id={id} className="relative bg-white">
      <div className="mx-auto max-w-[1340px] px-6 pt-24 pb-32 md:px-10 md:pt-32 md:pb-40 lg:px-14">
        <div className="max-w-[1040px]">
          <TransitionPill>THE SOLUTION</TransitionPill>
          <h2 className="display-section mt-5 max-w-[14ch] text-ink-black md:max-w-none">
            {section.headline}
          </h2>
          <p className="body-xl mt-8 max-w-[60ch] text-ink-graphite/82">
            {section.intro}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {section.solutionBento.children.map((card, index) => (
            <SolutionChildCard
              key={card.title}
              title={card.title}
              body={card.body}
              className={BENTO_LAYOUT[index]}
            />
          ))}

          <SolutionFeatureCard
            title={section.solutionBento.featureTitle}
            body={section.solutionBento.featureBody}
            className="lg:col-span-5 lg:row-span-2 lg:col-start-8 lg:row-start-1"
          />
        </div>

        <div className="mt-20 md:mt-24">
          <div className="max-w-[860px]">
            <h3 className="mt-5 max-w-[16ch] text-[clamp(2rem,3.4vw,3rem)] font-medium leading-[1.04] tracking-[-0.03em] text-ink-black">
              Run fewer but smarter experiments. 
            </h3>
            <p className="mt-5 max-w-[58ch] text-[16px] leading-[1.65] text-ink-graphite md:text-[18px]">
              Tune replaces slow wet-lab loops with an accelerated loop that samples 100× more of the design space, so your physical runs are the winners from thousands of virtual ones.
            </p>
          </div>

          <div className="mt-12">
            <LoopComparisonViz />
          </div>
        </div>
      </div>
    </section>
  );
}

function TransitionPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="engagement-transition-pill">
      <span className="engagement-transition-pill__surface px-4 py-2 mono-s text-blue-700">
        {children}
      </span>
    </span>
  );
}

function SolutionChildCard({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <article
      className={`group motion-settle flex min-h-[220px] flex-col rounded-[24px] border border-line-hairline-cool bg-white px-6 py-6 shadow-[0_20px_64px_-58px_rgba(20,17,14,0.24)] transition-[transform,box-shadow,border-color] duration-180 ease-out hover:border-blue-100 hover:shadow-[0_24px_68px_-52px_rgba(20,17,14,0.22)] active:scale-[0.995] md:px-7 md:py-7 ${className ?? ''}`}
    >
      {title !== 'Months, not years.' ? (
        <h3 className="max-w-[14ch] text-[clamp(1.55rem,2vw,2rem)] font-medium leading-[1.06] tracking-[-0.026em] text-ink-black">
          {title}
        </h3>
      ) : null}
      {title === 'Months, not years.' ? (
        <div className="mt-4 max-w-[72ch] text-ink-graphite">
          <h3 className="max-w-[16ch] text-[clamp(1.7rem,2.6vw,2.7rem)] font-medium leading-[1.02] tracking-[-0.032em] text-ink-black">
            <AccentUnderline delayMs={200}>
              <span>Months</span>
            </AccentUnderline>
            , not years.
          </h3>
          <p className="mt-5 max-w-[26ch] text-[clamp(1.05rem,1.55vw,1.28rem)] leading-[1.5] text-ink-graphite md:text-[19px]">
            Tune explores{' '}
            <span className="inline-block align-[-0.12em] text-[clamp(2.7rem,5vw,4.6rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-ink-black">
              100x
            </span>{' '}
            more conditions between wet-lab rounds than your team could.
          </p>
          <p className="mt-4 max-w-[38ch] text-[15px] leading-[1.62] md:text-[16px]">
            Years of search compress into months.
          </p>
        </div>
      ) : (
        <p className="mt-4 max-w-[32ch] text-[15px] leading-[1.62] text-ink-graphite md:text-[16px]">
          {body}
        </p>
      )}
    </article>
  );
}

function SolutionFeatureCard({
  title,
  body,
  className,
}: {
  title: string;
  body?: string;
  className?: string;
}) {
  return (
    <article
      className={`group motion-settle relative flex min-h-[220px] flex-col overflow-hidden rounded-[24px] border border-blue-200/45 px-6 py-6 shadow-[0_28px_84px_-60px_rgba(3,2,122,0.42)] transition-[box-shadow,border-color] duration-200 ease-out hover:border-blue-100 hover:shadow-[0_34px_92px_-56px_rgba(3,2,122,0.5)] active:scale-[0.995] md:px-8 md:py-8 lg:px-9 lg:py-9 ${className ?? ''}`}
      style={{
        backgroundImage: 'linear-gradient(135deg, #03027A 0%, #1612B8 52%, #4140FC 100%)',
      }}
    >
      <div
        aria-hidden
        className="blue-sheen-drift motion-safe:animate-[blue-sheen-drift_10s_ease-in-out_infinite] pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(circle at 72% 18%, rgba(205,205,254,0.22) 0%, transparent 28%), radial-gradient(circle at 28% 86%, rgba(205,205,254,0.16) 0%, transparent 32%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 58%, transparent 100%)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <h3 className="mt-5 max-w-[13ch] text-[clamp(2rem,4.2vw,3.15rem)] font-medium leading-[1.02] tracking-[-0.038em] text-white">
          {title}
        </h3>
        {body && (
          <p className="mt-4 max-w-[28ch] text-[15px] leading-[1.62] text-blue-100/80 md:text-[16px]">
            {body}
          </p>
        )}
      </div>
    </article>
  );
}
