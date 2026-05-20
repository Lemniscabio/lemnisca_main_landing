// Torch content schema — single source of truth.
// Validated at module load via zod's .parse() in torch.content.ts and shared.content.ts.

import { z } from 'zod';

export const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  cta: z.boolean().optional(),
});

export const sharedContentSchema = z.object({
  brand: z.object({
    name: z.string(),
    suffix: z.string().optional(),
  }),
  nav: z.object({
    items: z.array(navItemSchema).min(1),
  }),
});

export const heroSchema = z.object({
  headlinePre: z.string(),
  headlineAccent: z.string(),
  headlinePost: z.string(),
  sub: z.string(),
  primaryCta: z.object({ label: z.string(), href: z.string() }),
  secondaryCta: z.object({ label: z.string(), href: z.string() }),
});

export const domainSchema = z.object({
  letter: z.string().length(1),
  name: z.string(),
  question: z.string(),
  detail: z.string(),
});

export const moschSchema = z.object({
  eyebrow: z.string(),
  headlinePre: z.string(),
  headlineAccent: z.string(),
  domains: z.array(domainSchema).length(5),
  callout: z.object({
    title: z.string(),
    body: z.string(),
  }),
});

export const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const faqSchema = z.object({
  eyebrow: z.string(),
  items: z.array(faqItemSchema).min(1),
  wordmark: z.object({
    primary: z.string(),
    by: z.string(),
    secondary: z.string(),
  }),
});

export const torchContentSchema = z.object({
  meta: z.object({
    title: z.string(),
    description: z.string().max(200),
    canonical: z.string().url(),
  }),
  hero: heroSchema,
  mosch: moschSchema,
  faq: faqSchema,
});

export type NavItem = z.infer<typeof navItemSchema>;
export type SharedContent = z.infer<typeof sharedContentSchema>;
export type Hero = z.infer<typeof heroSchema>;
export type Domain = z.infer<typeof domainSchema>;
export type Mosch = z.infer<typeof moschSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type TorchContent = z.infer<typeof torchContentSchema>;
