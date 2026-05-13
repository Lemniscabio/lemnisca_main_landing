# Lemnisca Landing — Repo Guide

> **Audience:** any developer or AI agent picking this repo up cold. This document is the single source of truth for what this repo is, what it contains, what we just changed, why we chose what we chose, and how to safely extend it. Read this in full before making non-trivial changes.
>
> **Last updated:** 2026-05-13

---

## 1. TL;DR

This is the main Next.js app for **lemnisca.bio**. It serves three categories of traffic from one deployment:

1. **Public marketing** — homepage (`/`), product landing pages (`/tune`, `/thrust`, `/torch`), contact form API. GSAP-animated, vanilla CSS.
2. **Authenticated reports dashboard** — `/reports/*` + `/api/reports/*` + `/api/avira` (Gemini-backed chat). Sits behind a signed-cookie gate enforced by `middleware.ts`.
3. **Static assets** — partner logos, team photos, hero loops.

The repo was recently extended to host product landing pages directly (no multi-zone deployments). Tune is fully merged in (May 2026). Thrust and Torch are placeholders waiting for the same treatment.

The reports dashboard mixes marketing-grade infrastructure with product-grade requirements (auth, customer data, AI chat). A code audit by Codex (May 2026) flagged this as the largest structural concern. We chose to **keep reports here for now** and **extract later** — section 9 documents the exact extraction playbook so the future move is reversible and low-risk.

---

## 2. What This Repo Is — and Is Not

**It is:**
- The deployed Next.js app at `lemnisca.bio` and its subroutes.
- The home for public marketing pages and content.
- A temporary host for the authenticated reports dashboard until that gets extracted.

**It is not (yet):**
- A multi-app monorepo.
- A pure marketing site (the reports half is product-grade).
- Tailwind-based for main marketing pages — `/` uses ~1900 lines of handcrafted vanilla CSS with GSAP animations. Only product pages under `/tune` (and future `/thrust`, `/torch`) use Tailwind v4.

---

## 3. Route Map

| Route | Type | Owner | Notes |
|---|---|---|---|
| `/` | Static | Marketing | Hero, partners marquee, problem, solution, stats, team, prediction form, footer. GSAP + film-grain overlays. See `components/LandingPage.tsx`. |
| `/tune` | Static | Product (Tune) | Full product page. Lives in `app/tune/` + `products/tune/`. See §5 for architecture. |
| `/thrust` | Static | Placeholder | Renders `ComingSoon` component. Merge with same pattern as Tune when ready. |
| `/torch` | Static | Placeholder | Renders `ComingSoon` component. Same pattern. |
| `/reports` | Static | Product (Reports) | Behind auth cookie. Gateway page. |
| `/reports/[id]` | Dynamic | Product (Reports) | Per-report dashboard with charts + AVIRA chat. |
| `/reports/unlock` | Static | Product (Reports) | Username/password gate. |
| `/api/contact` | Dynamic | Marketing | Contact form intake. |
| `/api/reports/auth` | Dynamic | Product (Reports) | Issues signed-cookie session. |
| `/api/reports/logout` | Dynamic | Product (Reports) | Clears cookie. |
| `/api/avira` | Dynamic | Product (Reports) | Gemini-backed chat. Gated by middleware. |

Middleware (`middleware.ts`) gates `/reports/*` and `/api/avira/*` only. It does NOT touch marketing routes.

---

## 4. Recent Changes — Tune Merge (May 2026)

### What was done
Tune previously lived as a separate Next.js app at `/Users/kartikey/Desktop/product_LPs/tune` and was about to be deployed via Vercel rewrites/multi-zones. That added complexity (preview URLs, separate backlinks). We chose instead to merge Tune's code into this app so `/tune` is served directly.

### Strategy
- Tune source code moved under `products/tune/{content,features,design-system}/` — an isolated namespace so future Thrust/Torch merges don't collide.
- Route wiring lives under `app/tune/{page,layout,tune.css}`.
- Tailwind v4 + PostCSS added — but **Tailwind Preflight is NOT imported globally**. A scoped subset is re-implemented under `:where(.tune-page)` to prevent reset leakage to the main marketing pages.
- Every custom CSS class (e.g., `.display-hero`, `.body-xl`, `.engagement-transition-pill`) is wrapped in `:where(.tune-page)` so identical class names defined later by Thrust/Torch can coexist without collision.
- All `@keyframes` and `@property` are prefixed with `tune-` to avoid global namespace clashes.
- Main app's existing `app/globals.css` and homepage code were not touched (except adding `metadataBase` to `app/layout.tsx`).

### Commit log
```
a0cb365 fix(tune): drop SprintCta headline min-height on mobile
07007e5 fix(tune): reset button background in Preflight subset
8ca99c1 fix(tune): wrap scoped Preflight subset in @layer base
73d0e6c fix(tune): add scoped Preflight subset under .tune-page
3490ec5 feat: add metadataBase to root layout for absolute URL resolution
6fd634e feat(tune): replace ComingSoon placeholder with full Tune page composition
5262c55 feat(tune): add app/tune/layout.tsx with scoped fonts and .tune-page wrapper
8fb053e feat(tune): add app/tune/tune.css with :where() scoping and prefixed keyframes
d1f7346 fix(tune): set canonical URL to /tune
a11a3b0 refactor(tune): rewrite @/content @/features @/design-system imports under products/tune/
b9c56a5 feat(tune): copy Tune source into products/tune/ (verbatim)
7ead7bd chore(tune): add motion, zod, tailwind v4 deps + postcss config
```

### Design/plan docs
- Spec: `docs/superpowers/specs/2026-05-13-tune-merge-design.md` — full rationale for every decision.
- Plan: `docs/superpowers/plans/2026-05-13-tune-merge.md` — the implementation plan with exact code and commands.

### Cross-product nav in product headers
The Tune header (`products/tune/features/hero/HeroNav.tsx`) now exposes all three product routes (`/tune`, `/thrust`, `/torch`) plus the CTA. This keeps a user on a product page one click away from any sibling product, matching the main marketing `components/SiteHeader.tsx` pattern. Responsive behavior:

- **Desktop (md+):** all items render inline. Identical to the main site header's desktop strip.
- **Mobile (<md):** only the CTA pill and a hamburger toggle are visible on the bar. Tapping the toggle expands a sheet directly beneath the bar with the three product links. Closes on tap, on Escape, or on resize past the md breakpoint.
- **Active-route indication:** the current page's nav link is marked with a persistent underline + medium font weight on desktop, and a tinted background + small `Current` label on the mobile sheet. Detection uses `usePathname()` from `next/navigation` plus a small helper that treats `/tune` as active for `/tune` and any `/tune/*` subpath. External (`http*`) and anchor (`#*`) hrefs are never marked active. The link also gets `aria-current="page"` for screen readers.

**Implementation notes for the future Thrust/Torch headers:**
- The nav source is `products/tune/content/shared.content.ts` → `shared.nav.items`. When Thrust merges, create `products/thrust/content/shared.content.ts` with the same shape (the four items: Tune, Thrust, Torch, CTA). Each product owns its own copy because the CTA URL and brand text may differ.
- `HeroNav.tsx` filters `cta: true` out of the mobile sheet (only the link list renders), then re-renders the CTA as a compact pill on the top bar. Preserve this split when porting.
- The hamburger uses an inline SVG (two morphing lines → X) rather than `lucide-react` to keep `products/tune/` free of external icon-library deps. Keep that pattern in Thrust/Torch.
- The bar adopts the "scrolled" white-blur chrome whenever the menu is open OR scrolled past 80px. Without this, opening the menu over the transparent hero would leave the sheet floating against the blue gradient with no separation.

### Post-merge bug fixes (and why they happened)
We discovered three regressions after the initial merge. All three traced to the same root cause: Tune was built on top of Tailwind Preflight (the global CSS reset), and we deliberately skipped that import to avoid leaking it to the main marketing pages. We then had to re-implement the relevant subset of Preflight rules under `:where(.tune-page)`:

1. **Links rendered with underlines** (`73d0e6c`) — Preflight's `a { text-decoration: inherit }` was missing. Added it scoped.
2. **FAQ accordion items collapsed into each other** (`8ca99c1`) — initial Preflight subset was unlayered, which in CSS cascade gives it higher precedence than `@layer utilities`. So `margin: 0; padding: 0` on buttons was overriding Tailwind's `py-6`. Fix: wrap subset in `@layer base` so utilities correctly override resets.
3. **Buttons rendered with light-gray browser-default background** (`07007e5`) — Preflight resets `background-color: transparent` on buttons; we missed it.
4. **Mobile empty space in SprintCta** (`a0cb365`) — `min-h-[520px]` on the headline column was a desktop-only concern (matching two-column layout heights) but was forcing 520px of empty space on mobile.

**Lesson encoded for the future:** when Thrust/Torch are merged, expect the same class of bugs and check the same things first (link decoration, button backgrounds, list margins, heading font-size inheritance, form element font inheritance). The scoped Preflight subset in `app/tune/tune.css` is the reference — copy that pattern verbatim into `app/thrust/thrust.css`.

---

## 5. Architecture — Product Isolation Model

### Directory layout
```
app/
├── api/                       # API routes (marketing contact + reports auth)
├── reports/                   # Reports dashboard (PRODUCT, see §9 for extraction plan)
├── tune/                      # Tune route wiring
│   ├── page.tsx               # Composes sections, sets metadata
│   ├── layout.tsx             # Loads Newsreader + JetBrains fonts, wraps in .tune-page
│   └── tune.css               # Scoped Tailwind + scoped Preflight subset + Tune custom classes
├── thrust/page.tsx            # ComingSoon placeholder
├── torch/page.tsx             # ComingSoon placeholder
├── globals.css                # MARKETING vanilla CSS (~1900 lines, GSAP-tied). DO NOT TOUCH casually.
├── layout.tsx                 # Root layout. Loads Inter + Playfair, sets metadataBase, mounts PostHog.
└── page.tsx                   # Marketing homepage.

components/                    # Marketing + reports components.
├── LandingPage.tsx            # Homepage component (703 lines, GSAP timeline).
├── SiteHeader.tsx             # Nav. Hard-coded links to /tune, /thrust, /torch.
├── coming_soon/               # Placeholder component used by /thrust, /torch.
├── partners_marquee/, hero_bg/  # Homepage sub-components.
└── reports/                   # Reports dashboard UI (Reports.css 3326 lines, ReportsClient.tsx 592 lines).

lib/                           # Server-side libs.
├── mongodb.ts                 # Marketing contact form DB connection.
├── google-chat.ts             # Contact form notification.
├── posthog-server.ts          # Analytics.
├── reportAuth.ts              # JWT-style signed cookie for reports auth (120 lines).
└── reports/                   # Report data + AVIRA chat helpers.
    ├── chart-configs.ts       # Highcharts config (1483 lines).
    ├── avira-prompt.ts        # Gemini system prompt.
    ├── avira-references.ts
    ├── types.ts
    └── jnm/                   # Customer-specific data (batches, narrative, constants).

products/                      # PRODUCT LANDING SOURCE — isolated per product.
└── tune/
    ├── content/               # Zod-validated copy (schema.ts, shared.content.ts, tune.content.ts)
    ├── design-system/         # Tune-only primitives (Button, Eyebrow)
    └── features/              # Tune sections (hero, problem-at-stage, method, engagement, deliverables, sprint-cta)

middleware.ts                  # Gates /reports/* and /api/avira/* behind signed cookie.
postcss.config.mjs             # Loads @tailwindcss/postcss for /tune (passes /'s CSS through unchanged).
next.config.ts                 # Empty.
```

### The product isolation contract
- **`products/<name>/`** owns all per-product source. Components inside `products/tune/` only import from inside `products/tune/`. Never cross-import between products.
- **`app/<name>/`** owns route wiring (page composition, metadata, route-specific layout, route-specific CSS). References `products/<name>/` via the `@/products/<name>/...` alias.
- **Shared marketing components** (`components/`) are NOT used by product pages. Tune's `Hero` includes its own nav (`HeroNav`); it does not render `components/SiteHeader.tsx`.

### CSS isolation strategy (the load-bearing decision)

Next.js App Router has no true route-scoped CSS — any CSS imported anywhere in the tree affects all pages on subsequent navigations. So we encode isolation in the CSS itself:

1. **Skip Tailwind Preflight globally.** `app/tune/tune.css` imports only `tailwindcss/theme.css` and `tailwindcss/utilities.css` — never bare `tailwindcss` — so the reset never runs on marketing routes.
2. **Re-implement Preflight scoped.** A subset of Preflight rules is defined under `:where(.tune-page) ...` inside `@layer base`. This gives Tune the base it expects without leaking to `/`. The `@layer base` is critical: unlayered rules outrank any layered rule in the cascade, which would break Tailwind utilities (this caused the FAQ bug — see §4).
3. **Scope every custom class.** `.display-hero`, `.body-xl`, `.motion-settle`, etc. are all written as `:where(.tune-page) .display-hero { ... }`. The `:where()` wrapper has **zero specificity**, so Tailwind utilities (`text-xl`) still correctly override Tune custom classes. Using `@scope` instead would bump specificity and break this contract.
4. **Prefix keyframes and `@property`.** Six keyframes prefixed `tune-`. `@property --tune-engagement-pill-angle` prefixed. These have no scoping mechanism in CSS — only prefixing prevents collision when Thrust/Torch register their own.
5. **`@theme` tokens stay global.** Tailwind v4 reads `@theme` at build time to generate utilities. If Thrust needs a different `--color-blue-500`, it overrides via cascade inside `.thrust-page { --color-blue-500: ...; }` in its own CSS file — no rename needed.

### Repeating for Thrust/Torch
The pattern is mechanical:
1. Copy Thrust standalone source under `products/thrust/`.
2. Rewrite imports.
3. Create `app/thrust/{page,layout,thrust.css}` mirroring Tune's structure.
4. In `thrust.css`: identical Preflight subset wrapped in `@layer base`, identical `:where(.thrust-page)` scoping, prefix keyframes/`@property` with `thrust-`.
5. Test the same four regression categories from §4.

Same for Torch. No shared CSS surface between products beyond Tailwind utilities and the `@theme` defaults.

---

## 6. Code Audit (Codex, May 2026) — Findings and Our Position

A code audit by Codex flagged the following. Each entry has our verdict and what we did (or deferred) about it.

### 6.1 Mixed product boundaries [DEFERRED]
**Finding:** Public landing routes, contact capture, authenticated reports, AVIRA chat, and customer data all live together (`package.json:10`, `middleware.ts:13`, `app/api/avira/route.ts:1`).

**Our position:** Accurate. This is the largest structural concern in the repo. Decision: **keep reports here for now**, extract later. The extraction playbook in §9 is detailed enough that the move can happen on a day's work when prioritized. Until then, accept the coupling.

### 6.2 No DX foundation [PARTIAL]
**Finding:** `package.json` only has `dev`, `build`, `start`. No `lint`, `typecheck`, `test`, `format`, or CI scripts. README is the default Next template.

**Our position:** Accurate. Acceptable for a small-team marketing repo today; will hurt as the surface grows. Minimum bar to add when convenient: `"typecheck": "tsc --noEmit"`. Lint and CI are a separate task.

### 6.3 Large, hard-to-change files [ACKNOWLEDGED]
**Finding:** `components/reports/Reports.css` is 3326 lines. `lib/reports/chart-configs.ts` is 1483 lines. `components/reports/ReportsClient.tsx` is 592 lines. `components/LandingPage.tsx` is 703 lines.

**Our position:** All four files are tightly coupled to current behavior and not on the critical path. Splitting them is high-risk and low-value while reports are about to be extracted. When extracting reports (§9), the new repo is the right place to do the decomposition. `LandingPage.tsx` (marketing) can wait — it's old and stable.

### 6.4 Customer data in repo [DEFERRED — RESOLVED BY §9]
**Finding:** `lib/reports/jnm/` contains customer narrative + generated batch data committed to a public marketing repo.

**Our position:** Real concern. Extraction (§9) is the right fix. Until then, do not push this repo to any public remote without confirming `lib/reports/jnm/` is acceptable to expose. **Action item: confirm with the team whether this content is sensitive before any public push.**

### 6.5 Demo-grade auth [DEFERRED]
**Finding:** Shared username/password, in-memory rate limit (resets per deploy), no server-enforced token expiry. `app/api/reports/auth/route.ts:11`, `lib/reportAuth.ts:65`.

**Our position:** Accurate. Acceptable for the current internal demo audience; not acceptable for broader customer access. Fix during extraction — the new reports app should get per-user auth, durable rate limiting (Redis/Upstash), and short-lived signed tokens with refresh.

### 6.6 Potential XSS in AVIRA chat [INVESTIGATE]
**Finding:** Chat messages converted by regex and rendered via `dangerouslySetInnerHTML` without escaping. `components/reports/avira/AviraSidebar.tsx:10` and `:159`.

**Our position:** Needs verification of whether user input ever reaches the rendered string vs only model output. If user input reaches it: real vuln, fix now. If only model output reaches it: lower priority, but escape it on principle. **Action item: trace the data flow before declaring safe.**

### 6.7 Scattered env handling [ACCEPTED]
**Finding:** Env vars read directly across routes with non-null assertions like `process.env.GEMINI_API_KEY!`. `app/api/avira/route.ts:12`.

**Our position:** Worth fixing eventually with a single typed env module (Zod), but low priority. The non-null assertion will fail loud at boot if missing — that's acceptable failure behavior for a small surface. Address during extraction.

### 6.8 Middleware deprecation warning [TRACK]
**Finding:** Next.js build prints a deprecation warning that `middleware.ts` should become `proxy.ts` (or follow the new Proxy API).

**Our position:** Tracked. Not breaking. Fix during extraction (the new reports app will rewrite this anyway) or before the next major Next upgrade, whichever comes first.

### 6.9 `metadataBase` missing OG warning [RESOLVED]
**Finding:** `metadataBase` missing from root layout caused OG image URL resolution warnings.

**Our position:** Fixed in commit `3490ec5` as part of the Tune merge.

---

## 7. Decision Log

| Decision | Date | Rationale |
|---|---|---|
| Merge Tune into main app (no multi-zones) | 2026-05-13 | Single deployment = simpler preview URLs, no rewrite latency, no backlink fragmentation. |
| Keep reports in this repo for now | 2026-05-13 | Extraction is a separate project; current setup works for the internal-demo audience. §9 makes future extraction low-risk. |
| Tune product code under `products/tune/` (not `app/tune/`) | 2026-05-13 | Prevents collision when Thrust/Torch merge. Same generic filenames (`Hero.tsx`, `Button.tsx`) can coexist. |
| Skip Tailwind Preflight global import, scope subset | 2026-05-13 | Preflight is a global CSS reset; importing it would break the marketing pages' vanilla-CSS layout. Scoped subset keeps Tune working without touching `/`. |
| `:where()` wrapper, not `@scope` | 2026-05-13 | `:where()` has zero specificity, preserving Tailwind utility override behavior. `@scope` would silently raise specificity and break utility cascades. |
| Keep `@theme` tokens global, prefix only conflict-prone things (keyframes, `@property`) | 2026-05-13 | Theme tokens benefit from sharing across products; conflict-prone CSS features have no scoping mechanism so they must be prefixed. |
| Do not migrate main app `globals.css` to Tailwind | 2026-05-13 | 1900 lines of handcrafted CSS tied to GSAP timelines. Conversion is its own project with real regression risk; no upside while it's working. |

---

## 8. Operational Reference

### Local development
```bash
npm install
npm run dev          # webpack-backed dev server (NOT turbopack — see package.json scripts)
```
Open `http://localhost:3000`. Test all four route categories before declaring a change done:
- `/` (marketing homepage)
- `/tune` (product page)
- `/reports/unlock` (auth gate)
- `/api/contact` POST (smoke test the contact API)

### Production build
```bash
npm run build
```
Build must pass before any commit lands. If `/tune` regresses to a Dynamic route or `tsc` errors appear in `app/tune/`, `app/layout.tsx`, or `products/tune/`, stop and investigate.

### Environment variables (required for full functionality)
| Var | Used by | Notes |
|---|---|---|
| `MONGODB_URI` | `/api/contact` | Contact form persistence. |
| `GOOGLE_CHAT_WEBHOOK_URL` | `/api/contact` | Optional notification. |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | All routes | Analytics. |
| `REPORT_ID` | `/reports/[id]` | Which report to show. |
| `REPORT_USERNAME`, `REPORT_PASSWORD` | `/api/reports/auth` | Shared auth credentials. |
| `REPORT_AUTH_SECRET` | `lib/reportAuth.ts` | HMAC secret for cookie signing. **Rotate to invalidate all sessions.** |
| `REPORT_DEMO` | Reports | Toggles demo mode. |
| `REPORT_REDACT` | `lib/reports/redact.ts` | PII redaction toggle. |
| `GEMINI_API_KEY` | `/api/avira` | Google GenAI key. |

### Git workflow
- The working tree is regularly dirty in `app/api/avira/*`, `app/reports/*`, `lib/reports/*`, `components/reports/*` (active reports work). **Never use `git add .` or `git add -A`** — always stage explicit paths to avoid folding unrelated work into a commit.
- Branch from `main` for non-trivial features.
- Commit messages follow conventional commits prefix: `feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`, `refactor(scope): ...`. Scope is the route or product (`tune`, `reports`, `landing`).

### Pushing
- Origin is set up but is currently 9+ commits ahead of `origin/main`. Confirm with the team before pushing — the dirty reports work may not be ready for remote.

---

## 9. Future Plan: Reports Extraction Playbook

When the team decides reports should live in their own deployment (recommended target: `reports.lemnisca.com`), follow this playbook. The decision today is **defer**, not **never**.

### 9.1 Why extract
- Public marketing repo would no longer contain customer data (`lib/reports/jnm/`).
- Reports gets product-grade auth, rate limiting, and tests without dragging the marketing repo along.
- Dependency surface of the marketing repo shrinks dramatically (Highcharts, Gemini, Katex, MongoDB are reports-only).
- Deploy blast radius is reduced — a reports bug can't break the marketing pages.

### 9.2 Extraction steps

**Step 1: Create new private repo `lemnisca-reports`.** Use the same Next.js + React versions for consistency. Start from a fresh `create-next-app` and port over.

**Step 2: Copy the following paths into the new repo:**
```
app/reports/**
app/api/reports/**
app/api/avira/**
components/reports/**
lib/reports/**
lib/reportAuth.ts
lib/posthog-server.ts
scripts/ingest-jnm.mjs
scripts/avira-redteam.mjs
scripts/avira-redteam.md
```

**Step 3: Copy reports-only dependencies:**
```
@google/genai
@posthog/ai
highcharts
highcharts-react-official
katex
react-markdown
rehype-katex
remark-gfm
remark-math
posthog-node
mongodb (only if reports actually use it — verify)
```

**Step 4: Copy reports env vars to the new deployment:**
```
REPORT_ID
REPORT_USERNAME
REPORT_PASSWORD
REPORT_AUTH_SECRET   # rotate during cutover to invalidate old sessions
REPORT_DEMO
REPORT_REDACT
GEMINI_API_KEY
```

**Step 5: In `lemnisca-reports`, also do the security-grade work that the audit (§6.5, §6.6, §6.7) flagged:**
- Per-user auth (not shared password).
- Durable rate limiting (Redis/Upstash).
- Server-enforced token expiry.
- Trace and escape AVIRA chat rendering paths.
- Single typed env module (Zod).

**Step 6: Deploy `lemnisca-reports` at `reports.lemnisca.com` (separate Vercel project).** Test the auth flow with real users on the new domain before flipping the marketing repo.

**Step 7: In the marketing repo (`landing_v3_next`), remove the migrated code:**
```bash
git rm -r app/reports app/api/reports app/api/avira components/reports lib/reports
git rm lib/reportAuth.ts lib/posthog-server.ts
git rm scripts/ingest-jnm.mjs scripts/avira-redteam.mjs scripts/avira-redteam.md
git rm middleware.ts   # only if no other public-site purpose uses it
```

**Step 8: Remove reports-only deps:**
```bash
npm uninstall @google/genai @posthog/ai highcharts highcharts-react-official katex react-markdown rehype-katex remark-gfm remark-math posthog-node
# audit mongodb usage — keep if /api/contact still uses it
```

**Step 9: Remove reports env vars from the marketing Vercel project.**

**Step 10: Verify:**
```bash
npm run build
```
Build must pass. Manually check `/`, `/tune`, `/thrust`, `/torch`, `/api/contact` POST. Confirm `/reports/*` returns 404.

**Step 11: Update `components/SiteHeader.tsx` if it linked to `/reports`.** As of 2026-05-13 it does not.

**Step 12: Update DNS/redirects.** Add a 301 redirect from `lemnisca.bio/reports*` → `reports.lemnisca.com/reports*` so old links survive.

### 9.3 Rollback plan
If extraction goes wrong, revert the deletion commit on the marketing repo and re-deploy. The reports code is still in `lemnisca-reports` for the second attempt. Customer data exposure during extraction window: zero, since the marketing repo's data is unchanged until Step 7.

### 9.4 What does NOT move
These stay in the marketing repo:
- `app/api/contact` (marketing contact form)
- `lib/mongodb.ts` (if contact form uses it)
- `lib/google-chat.ts` (contact form notification)
- All marketing components (`components/LandingPage.tsx`, `components/hero_bg/`, `components/partners_marquee/`, `components/SiteHeader.tsx`, `components/coming_soon/`)
- All product pages (`app/tune/`, `app/thrust/`, `app/torch/`, `products/`)
- `app/globals.css`, `app/layout.tsx`, `app/page.tsx`

---

## 10. Conventions for Making Changes

### Before any non-trivial change
1. Read this guide.
2. Read the relevant spec/plan in `docs/superpowers/` if one exists.
3. Identify which "owner" your change touches: Marketing, Tune, Thrust, Torch, or Reports. Touching multiple owners in one commit is usually wrong — split it.

### CSS changes
- **Marketing routes (`/`, etc.):** edit `app/globals.css`. Keep changes scoped to existing class names; do NOT add Tailwind utilities to the marketing homepage.
- **Tune route:** edit `app/tune/tune.css` for new tokens/keyframes (prefix anything global with `tune-`). Edit `products/tune/features/...` components for Tailwind utility tweaks.
- **Adding a new product page (Thrust/Torch):** follow §5 "Repeating for Thrust/Torch" + the Tune spec/plan in `docs/superpowers/`.
- **Never** import `tailwindcss` (bare) anywhere — only the sub-imports `tailwindcss/theme.css` and `tailwindcss/utilities.css`.

### Component changes
- Marketing components in `components/` are NOT used by product pages and vice versa. Don't blur the boundary.
- Tune components in `products/tune/` import only from inside `products/tune/`. If you need shared cross-product code later, create `products/_shared/` rather than reaching across products.

### Adding a dependency
- Marketing-only: install normally.
- Reports-only: tag it mentally for the extraction list in §9.2.
- Tune-only: install at the workspace root for now (no monorepo split today). If it grows to many product-specific deps, revisit the structure.

### Adding a route
- Public: just add `app/<name>/page.tsx`.
- Gated: add the path to `middleware.ts` matcher and ensure the same auth model.
- If gated and product-grade: strongly consider whether it belongs in `lemnisca-reports` (§9) instead of here.

### Pre-commit checklist
- [ ] `npm run build` passes.
- [ ] `npx tsc --noEmit` clean for files you touched (pre-existing errors in `app/reports/*` are not your problem unless you touched them).
- [ ] Manual check of the route(s) your change touches in a browser.
- [ ] For CSS changes that touch `/tune`: also re-check `/` for unintended regressions (back-navigate).
- [ ] `git status --short` shows only the files you meant to commit.
- [ ] Commit message follows conventional-commits prefix.

---

## 11. Quick Reference — "I want to..."

| Goal | Where to look |
|---|---|
| Change Tune copy | `products/tune/content/tune.content.ts` (Zod-validated — build will fail loud on shape errors) |
| Change Tune visuals | `products/tune/features/...` (Tailwind utilities) or `app/tune/tune.css` (custom classes/keyframes) |
| Add a new Tune section | New component under `products/tune/features/<section>/`, import in `app/tune/page.tsx` |
| Change Tune nav items (cross-product links, CTA) | `products/tune/content/shared.content.ts` → `shared.nav.items`. Component: `products/tune/features/hero/HeroNav.tsx` |
| Merge Thrust | §5 + Tune spec/plan in `docs/superpowers/` as template |
| Change marketing homepage copy | `components/LandingPage.tsx` (use grep — it's 703 lines) |
| Change marketing styles | `app/globals.css` |
| Adjust reports auth | `lib/reportAuth.ts` + `app/api/reports/auth/route.ts` + `middleware.ts` (and read §6.5 first) |
| Fix an AVIRA chat issue | `components/reports/avira/*` + `app/api/avira/route.ts` (and verify §6.6 before touching render path) |
| Add typecheck script | `package.json`, add `"typecheck": "tsc --noEmit"` |
| Extract reports to new repo | §9 |
