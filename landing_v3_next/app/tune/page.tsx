import type { Metadata } from 'next';
import tune from '@/products/tune/content/tune.content';
import { Hero } from '@/products/tune/features/hero/Hero';
import { ProblemAtStage } from '@/products/tune/features/problem-at-stage/ProblemAtStage';
import { MethodSystem } from '@/products/tune/features/method/MethodSystem';
import { EngagementSection } from '@/products/tune/features/engagement/EngagementSection';
import { DeliverablesSection } from '@/products/tune/features/deliverables/DeliverablesSection';
import { FaqFooterSection } from '@/products/tune/features/sprint-cta/FaqFooterSection';
import { SprintCta } from '@/products/tune/features/sprint-cta/SprintCta';

export const metadata: Metadata = {
  title: tune.meta.title,
  description: tune.meta.description,
  alternates: { canonical: tune.meta.canonical },
  openGraph: {
    title: tune.meta.title,
    description: tune.meta.description,
    url: tune.meta.canonical,
    type: 'website',
  },
};

// Section order mirrors Tune standalone app/page.tsx exactly:
//   Hero → ProblemAtStage → SectionZigZag divider → MethodSystem
//   → EngagementSection → DeliverablesSection → SprintCta → FaqFooterSection
export default function TunePage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <Hero hero={tune.hero} sectionToc={tune.sectionToc} accent="tune" />

      <div id="problem">
        <ProblemAtStage section={tune.problemSection} accent="tune" />
      </div>

      <SectionZigZag />

      <div id="how">
        <MethodSystem section={tune.paidLoop} />
      </div>

      <div id="engagement">
        <EngagementSection section={tune.engagementJourney} />
        <DeliverablesSection section={tune.deliverablesSection} />
        <SprintCta section={tune.sprintCta} product="tune" />
        <FaqFooterSection />
      </div>
    </main>
  );
}

function SectionZigZag() {
  return (
    <div className="bg-white py-1 md:py-8">
      <svg
        viewBox="0 0 100 56"
        className="block h-8 w-full md:hidden"
        aria-hidden
        preserveAspectRatio="none"
      >
        <path
          d="M 0 33 L 5 24 L 11 9 L 17 41 L 25 13 L 33 36 L 41 8 L 47 39 L 55 16 L 63 31 L 70 10 L 79 43 L 87 12 L 94 26 L 100 34"
          fill="none"
          stroke="#FBFC40"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <svg
        viewBox="0 0 200 56"
        className="hidden h-10 w-full md:block"
        aria-hidden
        preserveAspectRatio="none"
      >
        <path
          d="M 0 33 L 6 27 L 12 23 L 18 17 L 24 10 L 31 23 L 38 39 L 46 26 L 54 14 L 62 22 L 72 35 L 82 14 L 90 9 L 100 24 L 110 37 L 122 21 L 132 12 L 142 28 L 154 39 L 166 20 L 176 11 L 186 22 L 200 31"
          fill="none"
          stroke="#FBFC40"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
