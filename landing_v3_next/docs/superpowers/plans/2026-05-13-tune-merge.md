# Tune Product Landing Merge — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the standalone Tune landing page into the main Lemnisca Next.js app so `/tune` is served by the main app, with isolated CSS/imports under `products/tune/` that won't collide with future Thrust/Torch merges.

**Architecture:** Tune source code lives under `products/tune/{content,features,design-system}/`. Route wiring lives under `app/tune/{page,layout,tune.css}`. Tailwind v4 imports skip Preflight; every custom CSS class is wrapped in `:where(.tune-page)` for collision-free scoping; keyframes and `@property` are prefixed with `tune-`. Main app's vanilla CSS and routes are untouched except for one `metadataBase` addition to root layout.

**Tech Stack:** Next.js 16.2.4 (App Router, React 19, `--webpack` build), Tailwind CSS v4 + `@tailwindcss/postcss`, `motion` (Framer Motion), `zod`, next/font.

**Working directory for all commands:** `/Users/kartikey/Desktop/work_products/lemnisca_main_landing/landing_v3_next`
**Tune source root:** `/Users/kartikey/Desktop/product_LPs/tune`

**Pre-flight context:**
- Main app's working tree is dirty in `app/api/*`, `app/reports/*`, `lib/reports/*`. Do **not** use `git add .` or `git add -A` at any point. Every commit stages explicit paths.
- The full design rationale lives in `docs/superpowers/specs/2026-05-13-tune-merge-design.md`. Read it if any decision is unclear.

---

## File Structure

**New files:**
- `postcss.config.mjs` (repo root)
- `app/tune/page.tsx` (overwrites existing 20-line ComingSoon placeholder)
- `app/tune/layout.tsx`
- `app/tune/tune.css`
- `products/tune/content/{schema,shared.content,tune.content}.ts`
- `products/tune/design-system/primitives/{Button,Eyebrow}.tsx`
- `products/tune/features/hero/{Hero,HeroNav,ConcentricLoop,DotLattice,AccentUnderline}.tsx`
- `products/tune/features/problem-at-stage/ProblemAtStage.tsx`
- `products/tune/features/method/MethodSystem.tsx`
- `products/tune/features/engagement/{EngagementSection,LoopComparisonViz}.tsx`
- `products/tune/features/deliverables/DeliverablesSection.tsx`
- `products/tune/features/sprint-cta/{SprintCta,FaqFooterSection}.tsx`

**Modified files:**
- `package.json` + `package-lock.json` (deps)
- `app/layout.tsx` (add `metadataBase`)

**Untouched:** every other file in the main app, including `app/globals.css`, `app/page.tsx`, `app/thrust/page.tsx`, `app/torch/page.tsx`, `app/reports/**`, `app/api/**`, `components/**`, `lib/**`, `middleware.ts`, `next.config.ts`, `tsconfig.json`.

---

## Task 1: Install Dependencies and Add PostCSS Config

**Why:** Tailwind v4 must be installed and PostCSS configured before any Tune CSS will compile. Verify the main app's vanilla CSS pipeline still works after these additions.

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm)
- Create: `postcss.config.mjs`

- [ ] **Step 1: Install runtime + dev deps**

Run from the main app root:
```bash
npm install motion@^12.38.0 zod@^3.23.8
npm install -D tailwindcss@^4.0.0 @tailwindcss/postcss@^4.0.0
```

Do **not** install `react-hook-form` or `@hookform/resolvers` — confirmed unused in Tune source.

- [ ] **Step 2: Create `postcss.config.mjs` at repo root**

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

- [ ] **Step 3: Verify main app still builds (smoke test before adding Tailwind CSS)**

Run:
```bash
npm run build
```

Expected: build succeeds. The existing `app/globals.css` has no Tailwind directives so the PostCSS plugin passes it through unchanged. If build fails, stop and investigate — do not proceed.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json postcss.config.mjs
git commit -m "chore(tune): add motion, zod, tailwind v4 deps + postcss config"
```

---

## Task 2: Copy Tune Source into `products/tune/`

**Why:** Place Tune's code under an isolated namespace before any rewriting. Pure copy, no edits in this task.

**Files:**
- Create: `products/tune/content/`, `products/tune/features/`, `products/tune/design-system/` (entire trees from Tune source)

- [ ] **Step 1: Create destination directories**

```bash
mkdir -p products/tune/content
mkdir -p products/tune/features/hero
mkdir -p products/tune/features/problem-at-stage
mkdir -p products/tune/features/method
mkdir -p products/tune/features/engagement
mkdir -p products/tune/features/deliverables
mkdir -p products/tune/features/sprint-cta
mkdir -p products/tune/design-system/primitives
```

- [ ] **Step 2: Copy content/, features/, design-system/ from Tune source**

```bash
cp /Users/kartikey/Desktop/product_LPs/tune/content/schema.ts            products/tune/content/schema.ts
cp /Users/kartikey/Desktop/product_LPs/tune/content/shared.content.ts    products/tune/content/shared.content.ts
cp /Users/kartikey/Desktop/product_LPs/tune/content/tune.content.ts      products/tune/content/tune.content.ts

cp /Users/kartikey/Desktop/product_LPs/tune/design-system/primitives/Button.tsx   products/tune/design-system/primitives/Button.tsx
cp /Users/kartikey/Desktop/product_LPs/tune/design-system/primitives/Eyebrow.tsx  products/tune/design-system/primitives/Eyebrow.tsx

cp /Users/kartikey/Desktop/product_LPs/tune/features/hero/Hero.tsx              products/tune/features/hero/Hero.tsx
cp /Users/kartikey/Desktop/product_LPs/tune/features/hero/HeroNav.tsx           products/tune/features/hero/HeroNav.tsx
cp /Users/kartikey/Desktop/product_LPs/tune/features/hero/ConcentricLoop.tsx    products/tune/features/hero/ConcentricLoop.tsx
cp /Users/kartikey/Desktop/product_LPs/tune/features/hero/DotLattice.tsx        products/tune/features/hero/DotLattice.tsx
cp /Users/kartikey/Desktop/product_LPs/tune/features/hero/AccentUnderline.tsx   products/tune/features/hero/AccentUnderline.tsx

cp /Users/kartikey/Desktop/product_LPs/tune/features/problem-at-stage/ProblemAtStage.tsx  products/tune/features/problem-at-stage/ProblemAtStage.tsx

cp /Users/kartikey/Desktop/product_LPs/tune/features/method/MethodSystem.tsx     products/tune/features/method/MethodSystem.tsx

cp /Users/kartikey/Desktop/product_LPs/tune/features/engagement/EngagementSection.tsx  products/tune/features/engagement/EngagementSection.tsx
cp /Users/kartikey/Desktop/product_LPs/tune/features/engagement/LoopComparisonViz.tsx  products/tune/features/engagement/LoopComparisonViz.tsx

cp /Users/kartikey/Desktop/product_LPs/tune/features/deliverables/DeliverablesSection.tsx  products/tune/features/deliverables/DeliverablesSection.tsx

cp /Users/kartikey/Desktop/product_LPs/tune/features/sprint-cta/SprintCta.tsx        products/tune/features/sprint-cta/SprintCta.tsx
cp /Users/kartikey/Desktop/product_LPs/tune/features/sprint-cta/FaqFooterSection.tsx products/tune/features/sprint-cta/FaqFooterSection.tsx
```

- [ ] **Step 3: Sanity-check file counts**

Run:
```bash
find products/tune -type f -name '*.ts' -o -name '*.tsx' | wc -l
```
Expected: `17` (3 content + 2 primitives + 5 hero + 1 problem-at-stage + 1 method + 2 engagement + 1 deliverables + 2 sprint-cta).

If the count is off, re-run Step 2 — a missing file will cause silent runtime errors later.

- [ ] **Step 4: Commit**

```bash
git add products/tune
git commit -m "feat(tune): copy Tune source into products/tune/ (verbatim)"
```

---

## Task 3: Rewrite Imports Inside `products/tune/`

**Why:** Every copied file uses the `@/content/...`, `@/features/...`, `@/design-system/...` aliases from the standalone Tune app. They must resolve under `products/tune/` instead. Mechanical search/replace, no logic changes.

**Files:**
- Modify: every file under `products/tune/` that contains those imports (8 files per the spec's import map).

- [ ] **Step 1: Run the three rewrites with `sed` (in-place)**

These three commands rewrite ALL Tune files at once. Use `sed -i ''` (BSD/macOS form, no extension argument):

```bash
find products/tune -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -exec sed -i '' "s|@/content/|@/products/tune/content/|g" {} \;

find products/tune -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -exec sed -i '' "s|@/features/|@/products/tune/features/|g" {} \;

find products/tune -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -exec sed -i '' "s|@/design-system/|@/products/tune/design-system/|g" {} \;
```

- [ ] **Step 2: Verify zero unrewritten matches remain**

Run:
```bash
rg "@/(content|features|design-system)/" products/tune/ app/tune/ || echo "OK: no matches"
```

Expected output: `OK: no matches` (or `ripgrep` exits with code 1 and prints nothing).

If any matches appear, inspect them — they should be edited by hand before continuing.

- [ ] **Step 3: Verify expected rewrites landed**

Run:
```bash
rg "@/products/tune/" products/tune/ | head -20
```

Expected: at least 8 lines showing the rewritten imports across `Hero.tsx`, `ProblemAtStage.tsx`, `MethodSystem.tsx`, `EngagementSection.tsx`, `DeliverablesSection.tsx`, `SprintCta.tsx`, `FaqFooterSection.tsx`, etc.

- [ ] **Step 4: Type-check Tune source isolation**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors related to module resolution in `products/tune/`. (Errors elsewhere — e.g., in `app/reports/*` — are pre-existing and not this task's concern.)

- [ ] **Step 5: Commit**

```bash
git add products/tune
git commit -m "refactor(tune): rewrite @/content @/features @/design-system imports under products/tune/"
```

---

## Task 4: Fix Canonical URL in Tune Content

**Why:** Tune source has `canonical: 'https://lemnisca.bio/'` (points to root). It must point to `/tune` so search engines and OG renderers see the right URL.

**Files:**
- Modify: `products/tune/content/tune.content.ts` (line 21)

- [ ] **Step 1: Apply the fix**

In `products/tune/content/tune.content.ts`, change line 21:

Before:
```ts
    canonical: 'https://lemnisca.bio/',
```

After:
```ts
    canonical: 'https://lemnisca.bio/tune',
```

- [ ] **Step 2: Verify**

```bash
rg "canonical" products/tune/content/tune.content.ts
```

Expected: shows `canonical: 'https://lemnisca.bio/tune',`

- [ ] **Step 3: Commit**

```bash
git add products/tune/content/tune.content.ts
git commit -m "fix(tune): set canonical URL to /tune"
```

---

## Task 5: Create `app/tune/tune.css` with Full Isolation

**Why:** This is the load-bearing CSS file. It imports Tailwind without Preflight, scopes every custom class under `:where(.tune-page)`, prefixes keyframes and `@property` with `tune-`, and defines the `.tune-page` wrapper styles.

**Files:**
- Create: `app/tune/tune.css`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p app/tune
```

- [ ] **Step 2: Write `app/tune/tune.css`**

Create the file with the **exact** content below. This is a manually-transformed version of Tune's `app/globals.css` — every transformation from spec §5 is already applied.

```css
/* Tune product landing — scoped CSS.
   - Skip Tailwind Preflight to avoid leaking resets into the main app.
   - All custom classes are scoped under :where(.tune-page) so future product
     pages can redefine the same class names without collision.
   - Keyframes and @property are prefixed with tune-.
   See docs/superpowers/specs/2026-05-13-tune-merge-design.md for rationale. */

@layer theme, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

/* Tailwind v4 generates utilities from this @theme block. Kept global; future
   products override differing tokens via cascade in their own wrapper class. */
@theme {
  --color-surface-white: #FFFFFF;

  --color-surface-parchment: #F0EAD8;
  --color-surface-paper: #F0EAD8;
  --color-surface-snow: #FFFFFF;

  --color-line-hairline: #D6CDB8;
  --color-line-hairline-cool: #E5E5E7;

  --color-ink-black: #14110E;
  --color-ink-graphite: #4A453E;
  --color-ink-ash: #8C8579;

  --color-blue-50: #EFEFFF;
  --color-blue-100: #CDCDFE;
  --color-blue-200: #A1A1FE;
  --color-blue-300: #7473FD;
  --color-blue-500: #4140FC;
  --color-blue-700: #0A07D4;
  --color-blue-900: #03027A;

  --color-yellow-50: #FBFC40;
  --color-yellow-100: #D2D234;
  --color-yellow-200: #AAAA28;
  --color-yellow-300: #85841D;
  --color-yellow-500: #5F5F12;
  --color-yellow-700: #3D3D08;
  --color-yellow-900: #1E1E02;

  --color-neutral-50: #F1F1F1;
  --color-neutral-100: #D1D1D3;
  --color-neutral-200: #A9A9AE;
  --color-neutral-300: #848488;
  --color-neutral-500: #50606B;
  --color-neutral-700: #3F3F45;
  --color-neutral-900: #202024;

  --color-accent-lemnisca: #B86A2E;
  --color-accent-tune: #C2783A;
  --color-accent-thrust: #1F4A6B;

  --color-data-ink: #14110E;
  --color-data-muted: #B5AC9C;
  --color-data-diverge: #8B2E2E;
  --color-data-converge: #2F5D3A;

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-serif: var(--font-newsreader), ui-serif, Georgia, serif;
  --font-mono: var(--font-jetbrains), ui-monospace, SFMono-Regular, monospace;
}

/* Wrapper rules: replace the html/body styling that lived in Tune standalone. */
.tune-page {
  font-family: var(--font-sans);
  font-feature-settings: "ss01", "cv11", "cv02";
  background: var(--color-surface-parchment);
  color: var(--color-ink-black);
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  overscroll-behavior-x: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Selection + focus — scoped so main app's defaults are untouched. */
:where(.tune-page) ::selection {
  background: var(--color-blue-500);
  color: var(--color-surface-white);
}

:where(.tune-page) *:focus-visible {
  outline: 2px solid var(--color-ink-black);
  outline-offset: 3px;
  border-radius: 2px;
}

/* ── Type scale ────────────────────────────────────────────── */
:where(.tune-page) .display-hero {
  font-size: clamp(2.75rem, 6.5vw, 5rem);
  line-height: 1.04;
  letter-spacing: -0.032em;
  font-weight: 520;
  font-variation-settings: "wght" 520;
}

:where(.tune-page) .display-section {
  font-size: clamp(2.5rem, 4.4vw, 4.55rem);
  line-height: 0.96;
  letter-spacing: -0.058em;
  font-weight: 500;
  font-variation-settings: "wght" 500;
}

:where(.tune-page) .display-sub {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  line-height: 1.15;
  letter-spacing: -0.018em;
  font-weight: 520;
  font-variation-settings: "wght" 520;
}

:where(.tune-page) .body-xl {
  font-size: clamp(1.125rem, 1.5vw, 1.5rem);
  line-height: 1.4;
  letter-spacing: -0.005em;
  font-weight: 400;
}
:where(.tune-page) .body-l { font-size: 1.25rem; line-height: 1.5; font-weight: 400; }
:where(.tune-page) .body-m { font-size: 1rem; line-height: 1.55; font-weight: 400; }
:where(.tune-page) .body-s { font-size: 0.875rem; line-height: 1.5; letter-spacing: 0.003em; font-weight: 400; }

:where(.tune-page) .label-m {
  font-size: 0.8125rem;
  line-height: 1.35;
  letter-spacing: 0.08em;
  font-weight: 500;
  text-transform: uppercase;
}
:where(.tune-page) .label-s {
  font-size: 0.6875rem;
  line-height: 1.3;
  letter-spacing: 0.10em;
  font-weight: 500;
  text-transform: uppercase;
}

:where(.tune-page) .mono-m { font-family: var(--font-mono); font-size: 0.875rem; line-height: 1.45; }
:where(.tune-page) .mono-s { font-family: var(--font-mono); font-size: 0.75rem; line-height: 1.4; }

:where(.tune-page) .accent-italic {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 500;
  letter-spacing: 0.012em;
  font-feature-settings: "calt" off;
}

:where(.tune-page) .tabular { font-variant-numeric: tabular-nums lining-nums; }

/* ── Background — faint dotted grid ────────────────────────── */
:where(.tune-page) .bg-dot-grid {
  background-image: radial-gradient(circle, rgba(20, 17, 14, 0.09) 1px, transparent 1.2px);
  background-size: 32px 32px;
  background-position: 0 0;
}

/* ── Motion — keyframes prefixed with tune- ───────────────── */
@keyframes tune-settle {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
:where(.tune-page) .motion-settle {
  animation: tune-settle 600ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes tune-hairline-draw {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
:where(.tune-page) .motion-hairline {
  transform-origin: left;
  animation: tune-hairline-draw 700ms cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

@keyframes tune-numeral-fade {
  from { opacity: 0; }
  to   { opacity: 0.08; }
}
:where(.tune-page) .motion-numeral {
  animation: tune-numeral-fade 400ms ease-out backwards;
  opacity: 0.08;
}

/* @property registered globally with tune- prefix to avoid cross-product collision. */
@property --tune-engagement-pill-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes tune-engagement-pill-spin {
  from { --tune-engagement-pill-angle: 0deg; }
  to   { --tune-engagement-pill-angle: 360deg; }
}

@keyframes tune-hero-loop-drift {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

@keyframes tune-blue-sheen-drift {
  0% { transform: translateY(0%); opacity: 0.18; }
  50% { transform: translateY(3%); opacity: 0.28; }
  100% { transform: translateY(0%); opacity: 0.18; }
}

:where(.tune-page) .engagement-transition-pill {
  position: relative;
  display: inline-flex;
  padding: 1px;
  border-radius: 9999px;
  isolation: isolate;
}

:where(.tune-page) .engagement-transition-pill::before,
:where(.tune-page) .engagement-transition-pill::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: conic-gradient(
    from var(--tune-engagement-pill-angle),
    var(--color-blue-50),
    var(--color-blue-200),
    var(--color-blue-500),
    var(--color-blue-700),
    var(--color-blue-900),
    var(--color-blue-50)
  );
  animation: tune-engagement-pill-spin 5.8s linear infinite;
}

:where(.tune-page) .engagement-transition-pill::before {
  filter: blur(10px);
  opacity: 0.22;
  transform: scale(1.02);
}

:where(.tune-page) .engagement-transition-pill::after {
  opacity: 1;
}

:where(.tune-page) .engagement-transition-pill__surface {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.96);
}

@media (prefers-reduced-motion: reduce) {
  :where(.tune-page) .motion-settle,
  :where(.tune-page) .motion-hairline,
  :where(.tune-page) .motion-numeral,
  :where(.tune-page) .engagement-transition-pill::before,
  :where(.tune-page) .engagement-transition-pill::after {
    animation: none !important;
  }
  :where(.tune-page) .hero-loop-drift,
  :where(.tune-page) .blue-sheen-drift {
    animation: none !important;
  }
  :where(.tune-page) .motion-settle { opacity: 1; transform: none; }
  :where(.tune-page) .motion-hairline { transform: scaleX(1); }
  :where(.tune-page) .motion-numeral { opacity: 0.08; }
}
```

- [ ] **Step 3: Verify keyframe references are consistent**

Run:
```bash
rg "animation:" app/tune/tune.css
```

Every `animation:` line should reference a `tune-`-prefixed keyframe. There should be exactly five distinct animation-name references: `tune-settle`, `tune-hairline-draw`, `tune-numeral-fade`, `tune-engagement-pill-spin`. (`tune-hero-loop-drift` and `tune-blue-sheen-drift` are defined for use by components via `animation-name` in JSX style, not directly here.)

```bash
rg "@keyframes|@property" app/tune/tune.css
```

Expected: six `@keyframes` (all `tune-` prefixed) + one `@property --tune-engagement-pill-angle`.

- [ ] **Step 4: Commit**

```bash
git add app/tune/tune.css
git commit -m "feat(tune): add app/tune/tune.css with :where() scoping and prefixed keyframes"
```

---

## Task 6: Create `app/tune/layout.tsx`

**Why:** The route layout loads Tune-specific fonts (Newsreader, JetBrains Mono), imports the scoped CSS, and applies the `.tune-page` wrapper class that activates all the scoped styles from Task 5.

**Files:**
- Create: `app/tune/layout.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { Newsreader, JetBrains_Mono } from 'next/font/google';
import './tune.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'optional',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains',
  display: 'optional',
});

export default function TuneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`tune-page ${newsreader.variable} ${jetbrains.variable}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/tune/layout.tsx
git commit -m "feat(tune): add app/tune/layout.tsx with scoped fonts and .tune-page wrapper"
```

---

## Task 7: Replace `app/tune/page.tsx` with Full Tune Composition

**Why:** Replace the 20-line ComingSoon placeholder with the actual Tune page composition, using the import paths under `products/tune/` and the exact section order from Tune source.

**Files:**
- Modify: `app/tune/page.tsx` (overwrite existing placeholder)

- [ ] **Step 1: Overwrite the file**

Replace the entire content of `app/tune/page.tsx` with:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors in `app/tune/page.tsx` or in any file under `products/tune/`. Errors elsewhere (`app/reports/*`, etc.) are pre-existing and out of scope.

- [ ] **Step 3: Commit**

```bash
git add app/tune/page.tsx
git commit -m "feat(tune): replace ComingSoon placeholder with full Tune page composition"
```

---

## Task 8: Add `metadataBase` to Root Layout

**Why:** Tune's standalone layout set `metadataBase: 'https://lemnisca.bio'` so OpenGraph/canonical URLs resolved correctly. The main app's root layout doesn't set it, so Tune's relative URLs would resolve incorrectly. One-line addition fixes the entire site (Tune, reports, homepage).

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Read the current root layout**

The current `app/layout.tsx` contains a `metadata` object without `metadataBase`. Add `metadataBase` as the first field.

- [ ] **Step 2: Apply the edit**

In `app/layout.tsx`, change:

```ts
  export const metadata = {
    title: 'Lemnisca',
    description: 'Your site description here',
    openGraph: {
      title: 'Lemnisca',
      description: 'Your site description',
      images: ['/preview.png'],
    },
  }
```

To:

```ts
  export const metadata = {
    metadataBase: new URL('https://lemnisca.bio'),
    title: 'Lemnisca',
    description: 'Your site description here',
    openGraph: {
      title: 'Lemnisca',
      description: 'Your site description',
      images: ['/preview.png'],
    },
  }
```

Preserve the existing indentation style (the file uses 2-space indentation with extra leading whitespace — match it exactly).

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add metadataBase to root layout for absolute URL resolution"
```

---

## Task 9: Build and Verify

**Why:** Catch all integration issues (Tailwind compilation, Zod content validation, font loading, route resolution) in one pass. Manual browser verification follows the build.

**Files:** none modified — verification only.

- [ ] **Step 1: Full production build**

Run:
```bash
npm run build
```

Expected: build succeeds. Look for:
- `/tune` listed as a static or server route.
- No Tailwind compilation warnings about missing utilities.
- No Zod validation errors thrown from `tune.content.ts`.
- No "module not found" errors.
- Existing routes (`/`, `/thrust`, `/torch`, `/reports`, `/api/*`) all still build.

If build fails, do **not** proceed. Capture the error and stop for review.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Server should start without errors. Open the URL it prints.

- [ ] **Step 3: Manual route verification (in the browser)**

Visit each route and check:

| Route | Expected |
|---|---|
| `/` | Homepage renders identically to pre-merge: GSAP hero animations, partner marquee, problem cards, loop diagram, stats, team grid, prediction form, footer. No layout shifts, no missing assets. |
| `/tune` | Full Tune page renders: Hero with ConcentricLoop animation, ProblemAtStage, zigzag divider, MethodSystem with LoopComparisonViz, EngagementSection with spinning transition pill, DeliverablesSection, SprintCta with Calendly link, FaqFooterSection. Background is parchment, not black. |
| `/thrust` | Unchanged ComingSoon placeholder. |
| `/torch` | Unchanged ComingSoon placeholder. |
| `/reports/unlock` | Unchanged unlock page. |

- [ ] **Step 4: Cross-route navigation test**

Click around: `/` → `/tune` → `/` (back). Check the homepage still renders correctly after visiting `/tune`. If Preflight had leaked, the homepage would show layout shifts, missing margins on headings, or other reset artifacts. Confirm none of that.

- [ ] **Step 5: Console check**

Open browser DevTools, Console tab. On `/tune`, there should be:
- No React errors.
- No "module not found" errors.
- No hydration warnings.
- No Zod validation errors.
- No missing-font warnings.

- [ ] **Step 6: Responsive check**

In DevTools, toggle device toolbar to mobile (iPhone preset, 375px wide). Verify `/tune`:
- No horizontal scroll.
- Hero text wraps cleanly.
- Mobile zigzag SVG (the `block md:hidden` one) is visible; desktop SVG (`hidden md:block`) is hidden.
- All sections stack vertically without overlap.

- [ ] **Step 7: Canonical + OG meta check**

In DevTools, Elements tab, look at `<head>` on `/tune`. Verify:
- `<link rel="canonical" href="https://lemnisca.bio/tune">` is present.
- OpenGraph `og:url` content equals `https://lemnisca.bio/tune`.

- [ ] **Step 8: No commit needed for verification.**

If everything passes, the merge is complete. If anything fails, stop and report what failed — do not commit fixes blindly.

---

## Repeatable Pattern for Future Merges

When Thrust (or Torch) is merged later:
1. Repeat Tasks 2–4 with `thrust` substituted for `tune` everywhere.
2. Use Task 5 as a template — same isolation pattern, prefix everything with `thrust-`, wrap in `:where(.thrust-page)`.
3. If Thrust needs a different value for any `@theme` token, override via cascade inside `.thrust-page { --color-blue-500: ...; }` in its own CSS file. No rename needed.
4. Skip Task 1 (deps already installed) and Task 8 (`metadataBase` already set).
