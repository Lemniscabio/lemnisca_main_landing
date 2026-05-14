# Torch Landing Merge — Plan

> **Date:** 2026-05-14
> **Target branch:** `torch-landing-merge` (off `main`). Do not merge to `main` until Torch launch day (see `docs/REPO_GUIDE.md` §12).
> **Source repo:** `/Users/kartikey/Desktop/product_LPs/torch` (active code lives under `frontend/`, not at repo root).
> **Template:** Tune merge — `docs/superpowers/specs/2026-05-13-tune-merge-design.md` + `docs/superpowers/plans/2026-05-13-tune-merge.md`. This plan reuses that pattern verbatim with `torch` substituted for `tune`, and notes the few places Torch differs.

---

## 0. Pre-flight (do once before any code change)

- [ ] Landing repo on `main`, working tree clean except `docs/REPO_GUIDE.md` (§12 addition). Either commit that first or stash it.
- [ ] `git checkout -b torch-landing-merge` off current `main`.
- [ ] `git tag pre-torch-merge` on `main` (one-command rollback anchor — see §12.6).
- [ ] Confirm `npm run build` passes on the new branch *before* any change, so any later breakage is unambiguously our doing.

---

## 1. How Torch differs from Tune (read this before executing)

The Tune playbook applies almost verbatim. The differences:

| Aspect | Tune | Torch |
|---|---|---|
| Source root | repo root | `frontend/` subdirectory |
| Sections | 8 sections (Hero, ProblemAtStage, SectionZigZag, MethodSystem, EngagementSection, DeliverablesSection, SprintCta, FaqFooterSection) | **3 sections only** (Hero, MoschSection, FaqFooterSection) |
| Content layer | Zod-validated `content/{schema,shared.content,tune.content}.ts` | **No content layer.** Copy is inlined as const arrays in components (`NAV_ITEMS`, `STATS`, `DOMAINS`, `FAQS`). |
| `shared.content.ts` | exists; powers cross-product nav | **does not exist** |
| HeroNav cross-product links | yes | **no** — currently only "See example" and "Run assessment" |
| `public/` assets | image assets exist | **none** — Torch is 100% CSS/SVG/React |
| `@keyframes` to prefix | 6 | **5** (`settle`, `hairline-draw`, `flame-flicker`, `wash-breathe`, `ember-rise`) |
| `@property` to prefix | 1 (`--tune-engagement-pill-angle`) | **0** |
| Tailwind import currently | scoped (per spec) | bare `@import "tailwindcss"` (will need to switch to `theme.css` + `utilities.css`) |
| Deps to add | motion, zod, tailwindcss, @tailwindcss/postcss | **none** — already installed for Tune |

**Decision: do we refactor Torch content to Zod-validated files like Tune?**

- **Option A — Keep inlined consts (faster, smaller diff).** Just port components verbatim, keep `NAV_ITEMS`/`STATS`/`DOMAINS`/`FAQS` where they are. CTA URL and cross-product nav handled by editing the relevant component.
- **Option B — Refactor to `content/{schema,shared.content,torch.content}.ts` (matches Tune, easier later).** Pays off when Thrust merges (shared nav schema) and when copy edits become frequent.

**Recommendation: Option B**, because (a) the §12 plan envisions Thrust following next and benefiting from a shared `nav.items` shape, (b) `HeroNav` needs to be updated anyway to add cross-product links — doing it via content keeps the component identical to Tune's, (c) it's ~30 minutes of work for material long-term gain. If launch pressure spikes, fall back to Option A.

---

## 2. Target directory layout (landing repo, post-merge)

```
app/torch/
├── page.tsx              # composes Hero → MoschSection → FaqFooterSection, sets metadata
├── layout.tsx            # loads Newsreader + JetBrains fonts, wraps in .torch-page
├── torch.css             # scoped Tailwind + scoped Preflight subset + Torch custom classes
└── opengraph-image.png   # 1200×630 (placeholder OK for branch; final for launch)

products/torch/
├── content/
│   ├── schema.ts                 # Zod schemas (mirror Tune's; copy + simplify)
│   ├── shared.content.ts         # nav.items (Tune/Thrust/Torch + CTA), brand
│   └── torch.content.ts          # page copy: hero, stats, domains, faqs, canonical /torch
├── design-system/
│   └── primitives/
│       └── Eyebrow.tsx           # (Torch doesn't use Button; only Eyebrow)
└── features/
    ├── hero/
    │   ├── Hero.tsx
    │   ├── HeroNav.tsx           # updated to consume shared.nav.items
    │   └── AccentUnderline.tsx
    ├── mosch/
    │   └── MoschSection.tsx
    └── faq-footer/
        └── FaqFooterSection.tsx
```

Files outside `app/torch/` and `products/torch/` that change:
- `package.json` / `package-lock.json` — **no change expected** (deps already present); regenerate lock only if `npm install` mutates it.
- `app/layout.tsx` — **no change** (already has `metadataBase`).
- `postcss.config.mjs` — **no change** (already configured for Tailwind v4).
- `components/SiteHeader.tsx` — **no change** (already links to `/torch`).
- `middleware.ts` — **no change** (`/torch` is public).

---

## 3. Step-by-step execution

### Task 1 — Branch + tag (5 min)
1. `cd /Users/kartikey/Desktop/work_products/lemnisca_main_landing/landing_v3_next`
2. Commit or stash the §12 `docs/REPO_GUIDE.md` change on `main` first.
3. `git tag pre-torch-merge`
4. `git checkout -b torch-landing-merge`
5. `npm run build` — record baseline (must pass before any edit).

### Task 2 — Copy Torch source into `products/torch/` (15 min)
1. `mkdir -p products/torch/{content,design-system/primitives,features/hero,features/mosch,features/faq-footer}`
2. Copy verbatim from `/Users/kartikey/Desktop/product_LPs/torch/frontend/`:
   - `design-system/primitives/Eyebrow.tsx` → `products/torch/design-system/primitives/Eyebrow.tsx`
   - `features/hero/Hero.tsx` → `products/torch/features/hero/Hero.tsx`
   - `features/hero/HeroNav.tsx` → `products/torch/features/hero/HeroNav.tsx`
   - `features/hero/AccentUnderline.tsx` → `products/torch/features/hero/AccentUnderline.tsx`
   - `features/mosch/MoschSection.tsx` → `products/torch/features/mosch/MoschSection.tsx`
   - `features/faq-footer/FaqFooterSection.tsx` → `products/torch/features/faq-footer/FaqFooterSection.tsx`
3. Do **not** copy `app/`, `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `node_modules/`, `.next/`, `.git/`, or the `old/` directory.

### Task 3 — Rewrite imports inside copied files (10 min)
Patterns to replace inside `products/torch/**/*.tsx`:
- `from "@/design-system/` → `from "@/products/torch/design-system/`
- `from "@/features/` → `from "@/products/torch/features/`
- `from "@/content/` → `from "@/products/torch/content/` (only relevant after Task 4)
- Relative imports (`./`, `../`) inside a single subdirectory are fine to leave as-is.

Verify: `grep -rE "from ['\"]@/(design-system|features|content)" products/torch/` returns zero matches.

### Task 4 — Build the content layer (Option B) (30 min)
1. **`products/torch/content/schema.ts`** — copy from `products/tune/content/schema.ts` and trim to what Torch needs:
   - `NavItemSchema` (label, href, cta?)
   - `SharedContentSchema` (brand, brandSuffix, nav: { items: NavItemSchema[] })
   - `HeroContentSchema` (eyebrow, headline, sub, stats: { value, label, suffix? }[], primaryCta, secondaryCta)
   - `MoschContentSchema` (eyebrow, headline, sub, domains: { letter, name, question, detail }[])
   - `FaqContentSchema` (eyebrow, headline, faqs: { question, answer }[], wordmark)
   - `TorchContentSchema = { canonical, title, description, hero, mosch, faq }`
2. **`products/torch/content/shared.content.ts`** — mirror Tune's exactly:
   ```ts
   export const shared = SharedContentSchema.parse({
     brand: 'Lemnisca',
     brandSuffix: 'Torch',
     nav: {
       items: [
         { label: 'Tune', href: '/tune' },
         { label: 'Thrust', href: '/thrust' },
         { label: 'Torch', href: '/torch' },
         { label: 'Run assessment', href: '#assessment', cta: true },
       ],
     },
   })
   ```
   (CTA label/href TBD — pick the one currently in Torch standalone `Hero.tsx`'s `NAV_ITEMS`.)
3. **`products/torch/content/torch.content.ts`** — extract `STATS`, `DOMAINS`, `FAQS`, hero copy from Torch standalone components, parse through `TorchContentSchema`. Set `canonical: 'https://lemnisca.bio/torch'`.
4. **Update components** to consume content:
   - `Hero.tsx`: remove inline `NAV_ITEMS`, `STATS` consts; accept content as prop or import from `@/products/torch/content/torch.content`.
   - `HeroNav.tsx`: import `shared` from `@/products/torch/content/shared.content`, render `shared.nav.items` (filter `cta:true` out of the inline list, render it as the standalone CTA pill — match Tune's pattern in `products/tune/features/hero/HeroNav.tsx`).
   - `MoschSection.tsx`: remove inline `DOMAINS`, consume content.
   - `FaqFooterSection.tsx`: remove inline `FAQS`, consume content.

### Task 5 — Create `app/torch/torch.css` (20 min)
Model on `app/tune/tune.css`. Replace `tune` with `torch` throughout.

1. **Top of file — Tailwind imports (scoped, NOT bare):**
   ```css
   @import "tailwindcss/theme.css";
   @import "tailwindcss/utilities.css";
   ```
   Do **not** import bare `tailwindcss` (would re-enable global Preflight and break the marketing homepage).

2. **`@theme` block** — port Torch's color palette and font tokens from its `frontend/app/globals.css` `@theme` section verbatim. If any token name collides with Tune's (`--color-accent-*`, etc.), prefix Torch's variant with `--torch-` or rely on cascade-override inside `.torch-page` (preferred — keeps utilities like `text-accent-500` working per-product).

3. **Scoped Preflight subset under `@layer base`:**
   ```css
   @layer base {
     :where(.torch-page) *,
     :where(.torch-page) *::before,
     :where(.torch-page) *::after { box-sizing: border-box; border-width: 0; border-style: solid; }
     :where(.torch-page) a { color: inherit; text-decoration: inherit; }
     :where(.torch-page) button { background-color: transparent; background-image: none; }
     :where(.torch-page) h1, :where(.torch-page) h2, :where(.torch-page) h3,
     :where(.torch-page) h4, :where(.torch-page) h5, :where(.torch-page) h6 { font-size: inherit; font-weight: inherit; }
     :where(.torch-page) ul, :where(.torch-page) ol { list-style: none; margin: 0; padding: 0; }
     :where(.torch-page) input, :where(.torch-page) button, :where(.torch-page) textarea, :where(.torch-page) select { font: inherit; color: inherit; }
     /* …full subset from app/tune/tune.css… */
   }
   ```
   Copy the exact subset from `app/tune/tune.css` `@layer base` block — it already covers the four §4 regression categories.

4. **Custom classes** — port from Torch standalone `globals.css`:
   - Type scale: `.display-hero`, `.body-m`, `.label-s`, `.mono-m`, etc. Wrap each in `:where(.torch-page) .display-hero { … }`.
   - Motion classes: `.motion-settle`, `.flame-flicker`, `.wash-breathe`, `.ember-rise` — same scoping.
   - `bg-dot-grid` or similar utilities — same scoping.

5. **Prefix all 5 keyframes with `torch-`:**
   - `@keyframes settle` → `@keyframes torch-settle`
   - `@keyframes hairline-draw` → `@keyframes torch-hairline-draw`
   - `@keyframes flame-flicker` → `@keyframes torch-flame-flicker`
   - `@keyframes wash-breathe` → `@keyframes torch-wash-breathe`
   - `@keyframes ember-rise` → `@keyframes torch-ember-rise`
   - Update every `animation:` declaration in `torch.css` AND in any component using these animations (likely inline classes on Hero / MoschSection elements).

6. **`@media (prefers-reduced-motion: reduce)`** block — scope under `:where(.torch-page)` and disable animations.

7. **`::selection` and `:focus-visible`** — scope under `:where(.torch-page)`.

### Task 6 — Create `app/torch/layout.tsx` (5 min)
Mirror `app/tune/layout.tsx` exactly. Replace `tune` with `torch`:

```tsx
import { Newsreader, JetBrains_Mono } from 'next/font/google'
import './torch.css'

const newsreader = Newsreader({ subsets: ['latin'], display: 'optional', variable: '--font-newsreader' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], display: 'optional', variable: '--font-jetbrains' })

export default function TorchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`torch-page ${newsreader.variable} ${jetbrains.variable}`}>
      {children}
    </div>
  )
}
```
(Adjust font choice if Torch's standalone `app/layout.tsx` uses different fonts — verify before writing.)

### Task 7 — Replace `app/torch/page.tsx` (15 min)
1. Delete current `ComingSoon` content.
2. Import Hero, MoschSection, FaqFooterSection from `@/products/torch/features/...`.
3. Import `torchContent` from `@/products/torch/content/torch.content`.
4. Export `metadata` object: title, description, `alternates.canonical: '/torch'`, `openGraph.url`, OG image reference.
5. Compose: `<><Hero {...torchContent.hero} /><MoschSection {...torchContent.mosch} /><FaqFooterSection {...torchContent.faq} /></>` (or pass full content object — match the prop pattern used by Tune).

### Task 8 — OG image (5 min)
- For branch state: copy a placeholder `opengraph-image.png` to `app/torch/opengraph-image.png` (1200×630). A flat-color PNG with "Torch" text is fine.
- Replace with final art before launch-day merge.

### Task 9 — Build + verify on branch (20 min)
Run the §12.4 pre-merge checklist:
- [ ] `npm run build` passes. No new warnings for `app/torch/**` or `products/torch/**`.
- [ ] `npx tsc --noEmit` clean for `app/torch/**`, `products/torch/**`, `app/layout.tsx`.
- [ ] `npm run dev` and manually check, in this order:
  - `/` — marketing homepage. Look specifically for: link underlines (should NOT have appeared), button backgrounds (should NOT be gray), heading sizes (should NOT have collapsed), list bullets (should NOT have disappeared). These are the four §4 regression signs of Preflight leakage.
  - `/tune` — verify it still works identically (back-navigate from `/torch` to `/tune` and refresh — verifies CSS isolation under client nav).
  - `/torch` — visual parity with the standalone Torch app (open standalone on port 3002 in another tab to compare side-by-side).
  - `/thrust` — still `ComingSoon`. Unchanged.
  - `/reports/unlock` — auth gate still works.
  - `/api/contact` — POST a test payload, confirm 200.
- [ ] Navigate `/` → `/torch` → `/tune` → `/` repeatedly. Confirms no CSS leakage across client transitions.
- [ ] Console: no errors, no font 404s, no animation/keyframe warnings.
- [ ] DevTools "Coverage" panel on `/`: confirm no Torch CSS rules are loaded.

### Task 10 — Commit on branch (5 min)
Stage explicit paths only (per REPO_GUIDE §8 — `git add .` is forbidden):
```bash
git add app/torch/ products/torch/
# Only stage package.json / package-lock.json if they actually changed
git status --short   # verify staged set
git commit -m "feat(torch): merge Torch landing into main app at /torch"
```
Then iterate on UI tweaks in additional commits on the branch as needed.

### Task 11 — Hold the branch
- **Do not merge to `main` until Torch launch day** (per REPO_GUIDE §12.1).
- Rebase onto `main` every few days if Thrust work or shared-file changes land on `main`.
- On launch day: rebase once more, re-run the §12.4 checklist, then `git checkout main && git merge --no-ff torch-landing-merge`. Deploy.

---

## 4. Risk register (Torch-specific)

| Risk | Likelihood | Mitigation |
|---|---|---|
| Bare `@import "tailwindcss"` accidentally retained in `torch.css` → Preflight leaks to `/` | Med | grep for `@import "tailwindcss"` (without `/theme.css` or `/utilities.css`) before commit. Visual check on `/` per §3 Task 9. |
| Keyframe name collision (`settle` exists in both Tune and Torch) | High if missed | Mechanically prefix all 5 with `torch-`; grep `@keyframes ` in `torch.css` to confirm. Same grep in components for `animation-name:` references. |
| Color token collision (Torch and Tune both use `--color-accent-*`) | Med | Override inside `.torch-page` cascade rather than renaming globally. Tune is unaffected because its own `.tune-page` cascade override wins for its routes. |
| Content extraction error (missing field, schema mismatch) | Med | Zod parse runs at build time. Build fails loud — fix the content file, not the schema. |
| HeroNav cross-product CTA URL not yet decided | Low | Use `#assessment` placeholder pointing to current Torch CTA; finalize before launch-day merge. |
| `frontend/` confusion (forgetting Torch source is one level deeper than Tune's was) | Low | All paths in §3 Task 2 explicitly prefix `frontend/`. |
| Torch product app at `torch.lemnisca.bio` doesn't exist yet — CTA target undefined | Low | CTA links to `#assessment` in-page for now; switch to `https://torch.lemnisca.bio` on or before launch day. |
| `opengraph-image.png` placeholder ships to prod | Low | Pre-merge checklist on launch day must verify final art is in place. |

---

## 5. Rollback

If anything goes wrong on the branch, the branch is the rollback — `main` is untouched until launch day. If a regression is discovered *after* the launch-day merge:
```bash
git revert -m 1 <merge-commit-sha>
```
The `pre-torch-merge` tag is the known-good reference.

---

## 6. Open questions (answer before launch-day merge)

1. Final CTA URL for the Torch landing — `torch.lemnisca.bio/signup`? `lemnisca.bio/contact?product=torch`? An in-page anchor?
2. Final OG image art — who's producing it, by when?
3. Final Torch page copy frozen? (Inlined consts in standalone may still be in flux.)
4. Does Torch landing share fonts with Tune (Newsreader + JetBrains) or use Inter only? Confirm against `frontend/app/layout.tsx` before Task 6.
5. Will Thrust branch start in parallel after Torch branch is created, or sequentially after Torch launches? (REPO_GUIDE §12.1 says either is fine; pick one before Thrust work begins.)
