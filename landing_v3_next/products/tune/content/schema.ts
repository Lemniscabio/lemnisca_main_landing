// Content schema — single source of truth.
// Every page's content file is validated against these schemas at module load.

import { z } from 'zod';

export const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  variant: z.enum(['primary', 'ghost']),
});

export const heroSchema = z.object({
  eyebrow: z.string(),
  headlinePre: z.string(),
  headlineAccent: z.string(),
  headlineMid: z.string().optional(),
  headlineAccent2: z.string().optional(),
  headlinePost: z.string(),
  sub: z.string(),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.optional(),
});

export const problemItemSchema = z.object({
  index: z.string().regex(/^\d{2}$/),
  label: z.string(),
  title: z.string(),
  body: z.string(),
  punchline: z.string().optional(),
});

export const problemSectionSchema = z.object({
  number: z.string().regex(/^\d{2}$/),
  eyebrow: z.string(),
  headline: z.string(),
  lead: z.string(),
  items: z.array(problemItemSchema).length(4),
});

export const sectionTocItemSchema = z.object({
  number: z.string().regex(/^\d{2}$/),
  label: z.string(),
  anchor: z.string().optional(),
});

// Deliverables stack — used for §03 (free sprint returns) and §06 (paid deliverables).
export const deliverableSchema = z.object({
  index: z.string().regex(/^\d{2}$/),
  title: z.string(),
  body: z.string(),
});

export const whatYouBringSchema = z.object({
  label: z.string(),
  items: z.array(z.string()).min(1),
});

export const sprintBlockSchema = z.object({
  number: z.string().regex(/^\d{2}$/),
  headline: z.string(),
  blockLabel: z.string(),
  deliverables: z.array(deliverableSchema).min(3),
  outputLine: z.string().optional(),
  whatYouBring: whatYouBringSchema,
});

// Backwards-compat alias.
export const sprintReturnsSchema = sprintBlockSchema;

// §04 — Decision table
export const decisionRowSchema = z.object({
  finding: z.string(),
  meaning: z.string(),
  nextStep: z.string(),
});

export const decisionTableSchema = z.object({
  number: z.string().regex(/^\d{2}$/),
  headline: z.string(),
  caption: z.string(),
  columns: z.tuple([z.string(), z.string(), z.string()]),
  rows: z.array(decisionRowSchema).min(3),
});

export const engagementStepSchema = z.object({
  index: z.string().regex(/^\d{2}$/),
  title: z.string(),
  body: z.string(),
  microPoints: z.array(z.string()).min(2).max(3).optional(),
});

export const engagementModeSchema = z.object({
  letter: z.enum(['A', 'B']),
  title: z.string(),
  description: z.string(),
  bestFit: z.string(),
});

export const engagementJourneySchema = z.object({
  number: z.string().regex(/^\d{2}$/),
  eyebrow: z.string(),
  headline: z.string(),
  intro: z.string(),
  trustLine: z.string(),
  steps: z.array(engagementStepSchema).length(4),
  transitionLine: z.string(),
  programHeadline: z.string(),
  programIntro: z.string(),
  loopNodes: z.tuple([
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
  ]),
  modelLabel: z.string(),
  modelPoints: z.array(z.string()).length(5),
  heavyLiftingTitle: z.string(),
  heavyLiftingBody: z.string(),
  modes: z.tuple([engagementModeSchema, engagementModeSchema]),
});

// §07 — Final CTA / sprint intake
export const intakeSourceSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const sprintCtaSchema = z.object({
  number: z.string().regex(/^\d{2}$/),
  headline: z.string(),
  body: z.array(z.string()).min(1),
  steps: z.array(z.string()).length(4),
  formLabels: z.object({
    name: z.string(),
    email: z.string(),
    company: z.string(),
    program: z.string(),
    programHelp: z.string(),
    source: z.string(),
    submit: z.string(),
    submitting: z.string(),
  }),
  sources: z.array(intakeSourceSchema).min(2),
  successHeadline: z.string(),
  successBody: z.string(),
  errorMessage: z.string(),
  fallbackContact: z.string(),
});

// What gets POST'd to the intake endpoint.
export const intakePayloadSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  company: z.string().optional(),
  program: z.string().min(30, '5–10 lines is plenty, please give us enough to assess fit'),
  source: z.string().optional(),
  product: z.enum(['tune', 'thrust', 'lemnisca']),
});

export type IntakePayload = z.infer<typeof intakePayloadSchema>;
export type SprintCta = z.infer<typeof sprintCtaSchema>;

// §05 — Paid loop + Convergence viz + Mode A/B
export const loopNodeSchema = z.object({ label: z.string() });
export const candidateChipSchema = z.object({ label: z.string() });
export const systemPanelItemSchema = z.object({ label: z.string() });

export const modeCardSchema = z.object({
  letter: z.enum(['A', 'B']),
  title: z.string(),
  body: z.string(),
});

export const solutionBentoCardSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export const deliverableFeatureCardSchema = z.object({
  title: z.string(),
  body: z.string(),
  hoverNote: z.string(),
});

export const deliverablesSectionSchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  intro: z.string(),
  note: z.string(),
  packageLabel: z.string(),
  cards: z.tuple([
    deliverableFeatureCardSchema,
    deliverableFeatureCardSchema,
    deliverableFeatureCardSchema,
  ]),
});

export const paidLoopSchema = z.object({
  number: z.string().regex(/^\d{2}$/),
  headline: z.string(),
  intro: z.string(),
  solutionBento: z.object({
    featureTitle: z.string(),
    featureBody: z.string().optional(),
    children: z.tuple([
      solutionBentoCardSchema,
      solutionBentoCardSchema,
      solutionBentoCardSchema,
    ]),
  }),
  vizCaption: z.string(),
  chipsLabel: z.string(),
  loopNodes: z.array(loopNodeSchema).length(5),
  candidates: z.array(candidateChipSchema).length(8),
  evidenceInputs: z.array(systemPanelItemSchema).length(6),
  modelComponents: z.array(systemPanelItemSchema).length(4),
  decisionOutputs: z.array(systemPanelItemSchema).length(6),
  modelTagline: z.string().optional(),
  microcopy: z.string(),
  modesLabel: z.string(),
  modes: z.tuple([modeCardSchema, modeCardSchema]),
});

export const productPageSchema = z.object({
  product: z.enum(['tune', 'thrust']),
  meta: z.object({
    title: z.string(),
    description: z.string().max(160),
    canonical: z.string().url(),
  }),
  sectionToc: z.array(sectionTocItemSchema).min(3),
  hero: heroSchema,
  problemSection: problemSectionSchema,
  engagementJourney: engagementJourneySchema,
  sprintReturns: sprintBlockSchema,
  decisionTable: decisionTableSchema,
  paidLoop: paidLoopSchema,
  deliverablesSection: deliverablesSectionSchema,
  paidDeliverables: sprintBlockSchema,
  sprintCta: sprintCtaSchema,
});

export type Hero = z.infer<typeof heroSchema>;
export type ProblemSection = z.infer<typeof problemSectionSchema>;
export type SectionTocItem = z.infer<typeof sectionTocItemSchema>;
export type EngagementJourney = z.infer<typeof engagementJourneySchema>;
export type SprintBlock = z.infer<typeof sprintBlockSchema>;
export type SprintReturns = SprintBlock;
export type DecisionTable = z.infer<typeof decisionTableSchema>;
export type Deliverable = z.infer<typeof deliverableSchema>;
export type DecisionRow = z.infer<typeof decisionRowSchema>;
export type PaidLoop = z.infer<typeof paidLoopSchema>;
export type DeliverablesSection = z.infer<typeof deliverablesSectionSchema>;
export type LoopNode = z.infer<typeof loopNodeSchema>;
export type CandidateChip = z.infer<typeof candidateChipSchema>;
export type ModeCard = z.infer<typeof modeCardSchema>;
export type ProductPageContent = z.infer<typeof productPageSchema>;
