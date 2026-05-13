# Tune Product Landing Page Merge — Design Spec

**Date:** 2026-05-13
**Target repo:** `/Users/kartikey/Desktop/work_products/lemnisca_main_landing/landing_v3_next`
**Source repo:** `/Users/kartikey/Desktop/product_LPs/tune`
**Scope:** Merge the standalone Tune landing page into the main Lemnisca Next.js app so `/tune` is served as a normal internal route. Establish a repeatable isolation pattern for the future `/thrust` and `/torch` merges.

---

## 1. Goal & Non-Goals

### Goal
- `lemnisca.bio/tune` is served directly by the main app, replacing the current `ComingSoon` placeholder.
- Tune's code (content, features, design-system) lives in `products/tune/`, isolated from main app code and from the future `products/thrust/` and `products/torch/` trees.
- Zero regressions on the existing main app (`/`, `/reports/*`, `/api/*`, `/thrust` placeholder, `/torch` placeholder).

### Non-Goals
- **Do not** migrate the main app's vanilla CSS to Tailwind. The main app's ~1930-line `app/globals.css` (GSAP animations, film-grain overlays, custom class names) stays untouched.
- **Do not** introduce Next.js multi-zones, rewrites, or proxies. Single deployed Next.js app.
- **Do not** merge `/thrust` or `/torch` in this pass. The design must make those merges trivial later, but they are out of scope here.
- **Do not** refactor or improve Tune's components beyond what the merge requires.

---

## 2. Target Architecture

### Final directory shape (relevant portions)
```
landing_v3_next/
├── app/
│   ├── tune/
│   │   ├── page.tsx          (composes Tune sections, sets metadata)
│   │   ├── layout.tsx        (loads Newsreader + JetBrains fonts, wraps in .tune-page)
│   │   └── tune.css          (Tailwind partial import + isolated Tune CSS)
│   ├── thrust/page.tsx       (unchanged ComingSoon placeholder)
│   ├── torch/page.tsx        (unchanged ComingSoon placeholder)
│   ├── reports/...            (untouched)
│   ├── api/...                (untouched)
│   ├── layout.tsx             (one small addition: metadataBase)
│   └── globals.css            (untouched)
├── components/...             (untouched)
├── lib/...                    (untouched)
├── products/
│   └── tune/
│       ├── content/
│       │   ├── schema.ts
│       │   ├── shared.content.ts
│       │   └── tune.content.ts
│       ├── features/
│       │   ├── hero/...
│       │   ├── problem-at-stage/...
│       │   ├── method/...
│       │   ├── engagement/...
│       │   ├── deliverables/...
│       │   └── sprint-cta/...
│       └── design-system/
│           └── primitives/
│               ├── Button.tsx
│               └── Eyebrow.tsx
├── postcss.config.mjs         (new file, single plugin)
└── package.json               (4 new deps)
```

### Isolation contract
- **`products/tune/`** — owns all Tune-specific code (content, components, primitives). Imports from inside `products/tune/` only.
- **`app/tune/`** — owns route wiring: page composition, metadata, font loading, route-specific CSS. References `products/tune/` via the `@/products/tune/...` alias.
- **No cross-product imports.** Components inside `products/tune/` never import from `products/thrust/` (and vice versa). Shared cross-product primitives — if/when needed later — would go into a `products/_shared/` namespace, but no such need exists today.

### Why this split
- Pasting Tune source directly into `app/tune/` would invite name collisions (`features/hero` vs a future `features/hero` for thrust) and tangle route wiring with implementation.
- The `products/<name>/` namespace gives every future product a parallel structure. Merging Thrust is a copy of this spec with `tune` → `thrust`.

---

## 3. Dependencies

### Install in main app (runtime)
```
motion@^12.38.0
zod@^3.23.8
```

### Install in main app (dev)
```
tailwindcss@^4.0.0
@tailwindcss/postcss@^4.0.0
```

### Do NOT install
- `react-hook-form` — present in Tune's `package.json` but `grep` confirms zero usage in `.ts`/`.tsx` files. Dead weight.
- `@hookform/resolvers` — same.

### React/Next version alignment
- Main app: `react@19.2.4`, `next@^16.2.4`.
- Tune source: `react@19.2.5`, `next@^16.2.4`.
- Only main app's `package.json` survives the merge. The 19.2.4 / 19.2.5 delta is a patch — Tune components will run fine.

---

## 4. Build Configuration

### `postcss.config.mjs` (new file at repo root)
```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
export default config;
```

**Why this exact form:** Tailwind v4's official PostCSS plugin is the only plugin needed. The main app's existing `app/globals.css` contains no Tailwind directives, so PostCSS will pass it through unchanged. Verified safe with webpack (main app forces `next dev --webpack` and `next build --webpack`).

### `next.config.ts`
**No changes.** Specifically:
- Do **not** carry over Tune's `output: 'export'` — main app has dynamic API routes (`/api/contact`, `/api/avira`, `/api/reports/auth`, `/api/reports/logout`) and protected routes (`/reports/[id]`). Static export would break them.
- Do **not** carry over `images: { unoptimized: true }` — Tune has no image assets; main app uses Next.js default optimization for its assets.
- Do **not** carry over `turbopack: { root: __dirname }` — irrelevant to merged app.
- Do **not** carry over `allowedDevOrigins` — LAN dev concern only.

### `tsconfig.json`
**No changes.** Main app already has `"paths": { "@/*": ["./*"] }`. The new `products/tune/` folder resolves through this alias automatically.

### `package.json` scripts
**No changes.** Main app keeps its `--webpack` flag on `dev` and `build`. Tailwind v4 PostCSS works with webpack.

---

## 5. CSS Isolation Strategy

This is the load-bearing decision of the merge. Three layers; each addressed independently.

### Layer A — Tailwind import (skip Preflight)

**Problem:** Next.js App Router CSS is always global. `@import "tailwindcss"` includes Preflight (Tailwind's CSS reset), which would globally rewrite browser defaults the moment a user navigates to `/tune`, potentially breaking the main homepage on back-navigation.

**Solution:** Import only the layers Tune needs:

```css
/* app/tune/tune.css — first lines */
@layer theme, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```

This pulls in Tune's `@theme` token system and all Tailwind utilities, but skips Preflight entirely. Main app's vanilla CSS is untouched.

**Why this exact form:** Tailwind v4's standard `@import "tailwindcss"` expands to three sub-imports — theme, preflight (base), utilities. Importing them individually lets us omit preflight. The explicit `@layer theme, components, utilities;` declaration establishes layer ordering so utilities win over components.

### Layer B — Custom CSS classes (`:where(.tune-page)` prefix)

**Problem:** Tune's design system uses generic class names — `.display-hero`, `.display-section`, `.body-xl`, `.label-s`, `.mono-m`, `.motion-settle`, `.engagement-transition-pill`, `.bg-dot-grid`, etc. Thrust and Torch share the same design system and will redefine these same class names with different values. Plain global definitions would collide on the second merge.

**Solution:** Prefix every custom class selector in `tune.css` with `:where(.tune-page)`:

```css
:where(.tune-page) .display-hero  { ... }
:where(.tune-page) .display-section { ... }
:where(.tune-page) .body-xl       { ... }
:where(.tune-page) .motion-settle { ... }
:where(.tune-page) .engagement-transition-pill { ... }
:where(.tune-page) .engagement-transition-pill::before { ... }
/* ... etc for every custom class ... */
```

**Why `:where()` and not `@scope`:**
- `:where()` has **zero specificity** — the inner selector keeps its original specificity (0,1,0 for a class). Tailwind utility classes have (0,1,0) specificity, so utility overrides still work exactly as they do in standalone Tune.
- `@scope (.tune-page)` would add the scope root's specificity to every inner rule, bumping `.display-hero` from (0,1,0) to (0,2,0), and **Tailwind utilities would no longer override Tune's custom classes** — a silent regression.
- `:where()` has universal browser support since 2021; `@scope` is newer (Chrome 118+, Safari 17.4+, Firefox 128+).

**When Thrust merges:** `thrust.css` uses the same pattern with `:where(.thrust-page)`. Identical class names coexist as totally separate rules.

### Layer C — Globally-scoped CSS features (keyframes, `@property`, `::selection`, `:focus-visible`)

These can't be wrapped in `:where()` because they're not class selectors. Each is handled individually:

**Keyframes — prefix with `tune-`:**
```css
@keyframes tune-settle           { ... }
@keyframes tune-hairline-draw    { ... }
@keyframes tune-numeral-fade     { ... }
@keyframes tune-engagement-pill-spin { ... }
@keyframes tune-hero-loop-drift  { ... }
@keyframes tune-blue-sheen-drift { ... }
```

And update every `animation:` declaration that references them. The references live entirely inside `tune.css` (six keyframes, ~8 references total).

**`@property` — prefix with `--tune-`:**
```css
@property --tune-engagement-pill-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
```

And update the two references inside the `.engagement-transition-pill::before/::after` `conic-gradient(from var(--tune-engagement-pill-angle), ...)` declarations. `@property` registers globally with the browser; two products registering the same property name with different value types is a runtime conflict.

**`::selection` — scope to subtree:**
```css
:where(.tune-page) ::selection {
  background: var(--color-blue-500);
  color: var(--color-surface-white);
}
```

**`:focus-visible` — scope to subtree:**
```css
:where(.tune-page) *:focus-visible {
  outline: 2px solid var(--color-ink-black);
  outline-offset: 3px;
  border-radius: 2px;
}
```

**`prefers-reduced-motion` block** — keep as-is but update the keyframe-class references inside it (the class names like `.motion-settle` need their `:where(.tune-page)` prefix; the keyframe references inside `animation: none` don't need updating since they target classes, not keyframe names).

### Layer D — `@theme` tokens (keep global for first merge)

Tune's `@theme` block defines tokens like `--color-blue-500`, `--color-surface-parchment`, `--color-accent-tune`. Tailwind v4 reads `@theme` at build time to generate utilities (`bg-blue-500`, `bg-surface-parchment`, `bg-accent-tune`).

**Decision: keep `@theme` global, do NOT rename tokens in this merge.**

Rationale:
- The legacy accent tokens (`--color-accent-tune`, `--color-accent-thrust`, `--color-accent-lemnisca`) are already namespaced by product — no future collision.
- The design-system tokens (`--color-blue-*`, `--color-surface-*`, ramp tokens) are intentionally shared across products. Renaming all of them would cascade into a search-and-replace across every Tune component using utilities like `bg-blue-500`, `text-ink-black`, `border-line-hairline` — high churn for zero benefit if Thrust/Torch use the same design system.
- **When Thrust/Torch merge:** if they need a token at a different value (e.g., Thrust wants `--color-blue-500` to be a different blue), they override it via cascade in their own wrapper:
  ```css
  .thrust-page { --color-blue-500: #DIFFERENT; }
  ```
  The Tailwind utility `bg-blue-500` resolves to whichever variable is in scope. No rebuild, no rename, no collision.
- If a future product needs an entirely new token, it adds it to its own `@theme` block; Tailwind merges all `@theme` blocks across files.

**Token additions in `tune.css`:** the `@theme` block in Tune source maps `--font-sans`, `--font-serif`, `--font-mono` to next/font CSS variables. These stay as-is — they reference `--font-inter`, `--font-newsreader`, `--font-jetbrains`, which the route layout sets on the wrapper element (`§7`).

### Layer E — `.tune-page` wrapper rules

Tune's source `globals.css` has commented-out `html`/`body` rules that set background, color, antialiasing, etc. These were the page's actual ground styling — without them, the page renders against the main app's `#root { background: black }` defined in `app/globals.css`.

**Move those rules onto `.tune-page` directly:**
```css
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
```

This explicitly paints over the main app's black `#root` background on the `/tune` route. No global side-effects.

---

## 6. Route Layout — `app/tune/layout.tsx`

New file. Loads Tune-specific fonts, wraps children in the `.tune-page` class to activate scoped CSS, and applies the font CSS variables to the wrapper.

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

### Decisions inside this layout

- **`display: 'optional'`** — preserved from Tune source. Prevents CLS at the cost of occasionally falling back to system fonts on slow first loads. Matches Tune's existing design intent.
- **No Inter reload** — main app's root layout already loads Inter as `--font-inter`. Tune's `@theme` references it via `--font-sans: var(--font-inter), ...`. CSS variable cascade handles the rest.
- **No Playfair reload** — main app loads it; Tune doesn't use it. Not on the wrapper.
- **No metadata export from layout** — page-level metadata in `app/tune/page.tsx` is sufficient. Layout sets no title/description/canonical.
- **No `SiteHeader`** — Tune's `Hero` component renders its own `HeroNav`. Main app's `SiteHeader` is opt-in per page (`/reports` includes it, `/tune` should not).

---

## 7. Route Page — `app/tune/page.tsx`

Replace the current `ComingSoon` placeholder with a composition that mirrors Tune's standalone `app/page.tsx`, but with rewritten imports.

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

export default function TunePage() {
  return (
    <>
      <Hero hero={tune.hero} sectionToc={tune.sectionToc} accent="tune" />
      <SectionZigZag />
      <ProblemAtStage section={tune.problemSection} accent="tune" />
      <MethodSystem loop={tune.paidLoop} />
      <EngagementSection journey={tune.engagementJourney} />
      <DeliverablesSection section={tune.deliverablesSection} />
      <SprintCta cta={tune.sprintCta} product="tune" />
      <FaqFooterSection />
    </>
  );
}

function SectionZigZag() {
  /* identical inline SVG as Tune source — copy verbatim */
}
```

### Decisions inside this page

- **Section order preserved exactly** — Hero → divider → ProblemAtStage → MethodSystem → EngagementSection → DeliverablesSection → SprintCta → FaqFooterSection. Order is part of the design and must not drift.
- **`SectionZigZag` stays inline** — defined in Tune source as a local helper inside `page.tsx`. Keep it that way; no extraction.
- **Metadata is page-level** (not layout-level) so each future product page sets its own canonical/og without inheritance pitfalls.
- **Canonical URL fix:** Tune source has `canonical: 'https://lemnisca.bio/'` (wrong, points to root). Fix in `products/tune/content/tune.content.ts` during the copy step → `'https://lemnisca.bio/tune'`.

---

## 8. Root Layout — One Small Addition

In `app/layout.tsx`, add `metadataBase`:

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://lemnisca.bio'),
  title: 'Lemnisca',
  /* existing fields */
};
```

**Why:** Tune source set `metadataBase` in its standalone layout to make relative og/canonical URLs resolve correctly. Setting it on the main root layout fixes it for the whole site (Tune, reports, homepage), one line. The existing `app/tune/page.tsx` metadata becomes correctly absolute.

This is the **only** edit to existing main-app files outside `app/tune/`.

---

## 9. File-Level Action List

### Files copied verbatim (with import paths rewritten — see §10)

From `/Users/kartikey/Desktop/product_LPs/tune/` → main app `products/tune/`:

| Source path | Destination path |
|---|---|
| `content/schema.ts` | `products/tune/content/schema.ts` |
| `content/shared.content.ts` | `products/tune/content/shared.content.ts` |
| `content/tune.content.ts` | `products/tune/content/tune.content.ts` ★ canonical fix |
| `design-system/primitives/Button.tsx` | `products/tune/design-system/primitives/Button.tsx` |
| `design-system/primitives/Eyebrow.tsx` | `products/tune/design-system/primitives/Eyebrow.tsx` |
| `features/hero/Hero.tsx` | `products/tune/features/hero/Hero.tsx` |
| `features/hero/HeroNav.tsx` | `products/tune/features/hero/HeroNav.tsx` |
| `features/hero/ConcentricLoop.tsx` | `products/tune/features/hero/ConcentricLoop.tsx` |
| `features/hero/DotLattice.tsx` | `products/tune/features/hero/DotLattice.tsx` |
| `features/hero/AccentUnderline.tsx` | `products/tune/features/hero/AccentUnderline.tsx` |
| `features/problem-at-stage/ProblemAtStage.tsx` | `products/tune/features/problem-at-stage/ProblemAtStage.tsx` |
| `features/method/MethodSystem.tsx` | `products/tune/features/method/MethodSystem.tsx` |
| `features/engagement/EngagementSection.tsx` | `products/tune/features/engagement/EngagementSection.tsx` |
| `features/engagement/LoopComparisonViz.tsx` | `products/tune/features/engagement/LoopComparisonViz.tsx` |
| `features/deliverables/DeliverablesSection.tsx` | `products/tune/features/deliverables/DeliverablesSection.tsx` |
| `features/sprint-cta/SprintCta.tsx` | `products/tune/features/sprint-cta/SprintCta.tsx` |
| `features/sprint-cta/FaqFooterSection.tsx` | `products/tune/features/sprint-cta/FaqFooterSection.tsx` |

### Files transformed (not pure copies)

| Source | Destination | Transformation |
|---|---|---|
| `app/globals.css` | `app/tune/tune.css` | Apply all CSS rules in §5: skip Preflight, `:where(.tune-page)` prefix, prefix keyframes + `@property`, scope `::selection` + `:focus-visible`, add `.tune-page` wrapper rules. |
| `app/page.tsx` | `app/tune/page.tsx` | Rewrite imports, **overwrite** existing ComingSoon placeholder. |

### Files NEWLY created in main app

- `app/tune/layout.tsx` (per §6)
- `app/tune/tune.css` (per §5)
- `postcss.config.mjs` (per §4)
- `products/tune/` directory tree (per copy list above)
- `docs/superpowers/specs/2026-05-13-tune-merge-design.md` (this file)

### Files DELIBERATELY NOT copied from Tune

- `app/layout.tsx` — Tune's root layout. Replaced by the new `app/tune/layout.tsx`.
- `package.json` / `package-lock.json` — only specific deps installed (§3).
- `next.config.ts` — main app keeps its own (§4).
- `postcss.config.mjs` — recreated at main app root (§4); content is identical but kept as a new file for explicitness.
- `tsconfig.json` — main app keeps its own.
- `.next/`, `node_modules/`, `out/` — build artifacts.
- `.claude/settings.local.json` — Tune's local settings, not relevant.

### Files in main app NOT touched

- `app/globals.css` — main app's vanilla CSS, untouched.
- `app/page.tsx` — homepage, untouched.
- `app/thrust/page.tsx`, `app/torch/page.tsx` — placeholders, untouched.
- `app/reports/**` — untouched.
- `app/api/**` — untouched.
- `components/**` — untouched (including `ComingSoon`, which still serves thrust/torch).
- `lib/**` — untouched.
- `middleware.ts` — untouched.

---

## 10. Import Rewriting

### Pattern (mechanical, run once per merged product)

In every copied `.ts` / `.tsx` file under `products/tune/`, rewrite the three import prefixes:

| Old prefix | New prefix |
|---|---|
| `@/content/` | `@/products/tune/content/` |
| `@/features/` | `@/products/tune/features/` |
| `@/design-system/` | `@/products/tune/design-system/` |

### Concrete component-by-component import map

Determined by reading every component during exploration:

- `products/tune/features/hero/Hero.tsx`:
  - `@/design-system/primitives/Button` → `@/products/tune/design-system/primitives/Button`
  - `@/content/shared.content` → `@/products/tune/content/shared.content`
  - `@/content/schema` → `@/products/tune/content/schema`
- `products/tune/features/problem-at-stage/ProblemAtStage.tsx`:
  - `@/content/schema` → `@/products/tune/content/schema`
  - `@/design-system/primitives/Eyebrow` → `@/products/tune/design-system/primitives/Eyebrow`
- `products/tune/features/method/MethodSystem.tsx`:
  - `@/content/schema` → `@/products/tune/content/schema`
  - `@/features/hero/AccentUnderline` → `@/products/tune/features/hero/AccentUnderline`
  - `@/features/engagement/LoopComparisonViz` → `@/products/tune/features/engagement/LoopComparisonViz`
- `products/tune/features/engagement/EngagementSection.tsx`:
  - `@/content/schema` → `@/products/tune/content/schema`
  - `@/content/shared.content` → `@/products/tune/content/shared.content`
  - `@/design-system/primitives/Eyebrow` → `@/products/tune/design-system/primitives/Eyebrow`
  - `@/features/hero/AccentUnderline` → `@/products/tune/features/hero/AccentUnderline`
- `products/tune/features/deliverables/DeliverablesSection.tsx`:
  - `@/content/schema` → `@/products/tune/content/schema`
  - `@/design-system/primitives/Eyebrow` → `@/products/tune/design-system/primitives/Eyebrow`
- `products/tune/features/sprint-cta/SprintCta.tsx`:
  - `@/content/schema` → `@/products/tune/content/schema`
  - `@/content/shared.content` → `@/products/tune/content/shared.content`
- `products/tune/features/sprint-cta/FaqFooterSection.tsx`:
  - `@/content/shared.content` → `@/products/tune/content/shared.content`
  - `@/design-system/primitives/Eyebrow` → `@/products/tune/design-system/primitives/Eyebrow`

Components with **no `@/` imports** (only relative or third-party): `HeroNav.tsx`, `ConcentricLoop.tsx`, `DotLattice.tsx`, `AccentUnderline.tsx`, `LoopComparisonViz.tsx`, `Button.tsx`, `Eyebrow.tsx`. These copy unchanged.

### Verification command (run after rewrite)
```
rg "@/(content|features|design-system)/" products/tune/ app/tune/
```
**Expected output:** zero matches.

---

## 11. Content & Metadata Fixes

Inside `products/tune/content/tune.content.ts`:

- `meta.canonical`: `'https://lemnisca.bio/'` → `'https://lemnisca.bio/tune'`

Verify after fix:
- `meta.title` and `meta.description` are reasonable for the route.
- No other absolute URLs reference the wrong root.

---

## 12. Edge Cases & Risks (Resolved Decisions)

| Edge case | Resolution |
|---|---|
| Tailwind Preflight leaking globally | Skip Preflight in `tune.css` import (§5 Layer A). |
| Class name collision when Thrust/Torch merge | `:where(.tune-page)` prefix on every custom class (§5 Layer B). |
| Specificity regression breaking Tailwind utility overrides | Use `:where()` not `@scope` — zero specificity (§5 Layer B rationale). |
| `@property` global registration collision | Prefix to `--tune-engagement-pill-angle` (§5 Layer C). |
| Keyframe name collision | Prefix all six keyframes with `tune-` (§5 Layer C). |
| `::selection` / `:focus-visible` global rules | Scope under `:where(.tune-page)` (§5 Layer C). |
| `@theme` token clash across products | Keep `@theme` global; future products override via wrapper cascade (§5 Layer D). |
| `#root { background: black }` showing through Tune | `.tune-page` sets explicit `background: var(--color-surface-parchment)` (§5 Layer E). |
| Tune's `output: 'export'` breaking `/api/*` routes | Do not carry over (§4). |
| Tune's `turbopack.root` mis-targeting | Do not carry over (§4). |
| `react-hook-form` dead weight | Skip install (§3). |
| Canonical URL wrong in Tune content | Fix to `/tune` (§11). |
| Missing `metadataBase` for OG URL resolution | Add to root layout (§8). |
| Cross-feature import in `MethodSystem.tsx` | Captured in §10 import map. |
| Tune `motion/react` components needing `'use client'` | Already present in Tune source — preserved by copy. |
| Main app dirty working tree (reports files) | Stage only merge-related paths explicitly (§14). |
| Webpack vs Turbopack build compatibility | Tailwind v4 PostCSS works with both — no change. |
| Main app's `SiteHeader` overlapping Tune's `HeroNav` | Root layout doesn't render `SiteHeader`; `/tune` page doesn't include it. No overlap. |
| Inter font double-load | Tune layout doesn't reload Inter — relies on root layout's `--font-inter`. |
| Zod validation failure at build | `tune.content.ts` parses against `productPageSchema` at import — surfaces immediately during `npm run build`. |
| `prefers-reduced-motion` block referencing renamed keyframes | Block uses **class** selectors (`.motion-settle`, etc.) not keyframe names — survives keyframe renames untouched, but its class selectors still need the `:where(.tune-page)` prefix. |
| `middleware.ts` matching `/tune` | Matcher targets `/reports/*` and `/api/avira` only — `/tune` is not matched. Verified during exploration. |

---

## 13. Verification Plan

Run in order. Each step must pass before moving on.

1. **Static type check:** `npx tsc --noEmit` — catches import path typos and missing module errors.
2. **Build:** `npm run build` — catches Zod validation failures, missing dependencies, CSS parse errors, webpack issues.
3. **Dev server smoke test:** `npm run dev`, visit each route and verify:
   - `/` — homepage renders identically to pre-merge (GSAP animations, film grain, partner marquee, prediction form).
   - `/tune` — full Tune page renders (hero with ConcentricLoop, ProblemAtStage, MethodSystem with LoopComparisonViz, EngagementSection, DeliverablesSection, SprintCta, FaqFooterSection).
   - `/thrust` — ComingSoon placeholder unchanged.
   - `/torch` — ComingSoon placeholder unchanged.
   - `/reports/unlock` — unchanged.
   - Protected `/reports/[id]` — auth/middleware unchanged.
4. **Visual regression check (manual, in browser):**
   - Homepage: hero, partner marquee, problem cards, loop diagram, stats, team grid, prediction form, footer — pixel parity vs pre-merge.
   - `/tune`: hero animations, accent underline, engagement transition pill (conic-gradient spin), section transitions, CTA buttons, FAQ accordion behavior.
   - Back-navigate from `/tune` → `/` — homepage still correct (Preflight has not leaked).
   - Forward-navigate `/` → `/tune` → `/reports/unlock` — each route's styling is independent.
5. **Console check:** no React errors, no missing-module errors, no Zod validation errors, no hydration warnings, no missing-font warnings.
6. **Mobile viewport** (Chrome DevTools, iPhone preset): `/tune` is fully responsive; no horizontal overflow; nav usable.
7. **Reduced motion:** with `prefers-reduced-motion: reduce` set, Tune's animations are disabled (verifies the media query block survived transformation).
8. **OG meta inspection:** view `/tune` source, confirm `<link rel="canonical" href="https://lemnisca.bio/tune">` and `og:url` are correct absolute URLs.

---

## 14. Commit Strategy

**Main app's working tree is already dirty** in `app/api/avira/route.ts`, `app/reports/[id]/page.tsx`, `app/reports/unlock/page.tsx`, reports hooks/components, `lib/reports/*`. Those are unrelated work that must not be folded into this merge commit.

### Rules
- **Never** use `git add .` or `git add -A` in the main app during this merge.
- Stage **only** the paths created/modified by this spec, by explicit name.

### Staged paths for the merge commit
```
git add \
  app/tune/page.tsx \
  app/tune/layout.tsx \
  app/tune/tune.css \
  app/layout.tsx \
  products/tune \
  postcss.config.mjs \
  package.json \
  package-lock.json \
  docs/superpowers/specs/2026-05-13-tune-merge-design.md
```

(`products/tune` recursively adds the entire copied tree.)

### Commit message
```
Merge Tune product landing into main app at /tune

- Move Tune source under products/tune/ for isolation
- Add app/tune/{page,layout,tune.css} for route wiring
- Skip Tailwind Preflight; scope custom CSS under :where(.tune-page)
- Prefix keyframes and @property with tune- to avoid global collisions
- Add metadataBase to root layout; fix Tune canonical to /tune
- Install motion, zod, tailwindcss, @tailwindcss/postcss
```

### Pre-commit safety check
```
git status --short
```
Verify the staged list matches the intended paths exactly. Unstaged changes in `app/api/*`, `app/reports/*`, `lib/reports/*` should remain unstaged.

---

## 15. Repeatable Pattern for Future Merges

When merging Thrust later, this spec is the template. The diff is:
- `tune` → `thrust` everywhere (paths, classes, prefixes, route).
- New `.thrust-page` wrapper class.
- Same isolation guarantees, same dependency set (assuming Thrust shares Tune's stack — which it does today).
- Same staged-paths discipline.
- Same `@theme` decision (keep shared; override differing tokens via `.thrust-page` cascade if needed).

Torch follows identically.

After all three are merged, the main app has:
- `products/tune/`, `products/thrust/`, `products/torch/` — fully isolated.
- `app/tune/`, `app/thrust/`, `app/torch/` — three slim route-wiring directories.
- One PostCSS config, one set of Tailwind deps, three scoped CSS files.
- Zero cross-product import paths, zero CSS class collisions.
