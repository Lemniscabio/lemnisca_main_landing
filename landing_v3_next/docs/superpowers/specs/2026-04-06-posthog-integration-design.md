# PostHog Integration Design Spec

## Overview

Integrate PostHog analytics into the Lemnisca landing site (`landing_v3_next`) for:
- **Autocapture** -- automatic click, form, and input event tracking
- **Session Recording** -- full session replays, no masking, no sampling
- **SPA Pageview Tracking** -- manual pageview capture for Next.js App Router navigation
- **LLM Observability** -- full observability of AVIRA chatbot Gemini calls via `@posthog/ai`

All users remain anonymous (no identification). Free plan (US cloud).

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| LLM observability level | Full (inputs, outputs, tokens, latency, cost) | Maximum insight into AVIRA usage |
| Session recording privacy | Record everything, no masking | Report data is not sensitive |
| User identification | Anonymous only | No auth system, keep simple |
| PostHog region | US cloud (`us.i.posthog.com`) | Matches existing PostHog account |
| Integration approach | Provider pattern + `@posthog/ai` wrapper | Idiomatic Next.js, React hooks available, automatic LLM instrumentation |

## Free Plan Limits

| Product | Monthly Allowance |
|---|---|
| Product Analytics | 1M events |
| Session Recordings | 5,000 recordings |
| LLM Observability | 100K events |

## Architecture

### Client-Side (Browser)

```
layout.tsx
  └── <PHProvider>            # initializes posthog-js, wraps app
        ├── <PostHogPageView> # captures $pageview on route change
        └── {children}        # app pages (autocapture + session recording automatic)
```

**`app/providers.tsx`** (new, `'use client'`):
- Initializes `posthog-js` with:
  - `api_host: 'https://us.i.posthog.com'`
  - `capture_pageview: false` (handled manually for SPA)
  - `capture_pageleave: true`
- Exports `<PHProvider>` wrapping children with `<PostHogProvider>`

**`components/PostHogPageView.tsx`** (new, `'use client'`):
- Uses `usePathname()` + `useSearchParams()` from `next/navigation`
- Fires `posthog.capture('$pageview')` on route change via `useEffect`
- Rendered inside `<PHProvider>` wrapped in `<Suspense>`

**`app/layout.tsx`** (modified):
- Remove placeholder GA script (`YOUR_GA_ID`)
- Import and wrap with `<PHProvider>`
- Add `<PostHogPageView />` inside provider

### Server-Side (API Routes)

**`lib/posthog-server.ts`** (new):
- Singleton `PostHog` client from `posthog-node`
- Initialized with `NEXT_PUBLIC_POSTHOG_KEY` and host URL

**`app/api/avira/route.ts`** (modified):
- Replace `import { GoogleGenAI } from '@google/genai'` with `import { GoogleGenAI } from '@posthog/ai'`
- Initialize with PostHog server client: `new GoogleGenAI({ apiKey, posthog: phClient })`
- Replace `ai.chats.create().sendMessageStream()` with `client.models.generateContentStream()`
  - Pass conversation history as `contents` array
  - Pass system instruction via `config.systemInstruction`
  - Add `posthogDistinctId: 'anonymous'`
- Streaming response to frontend remains unchanged
- SDK automatically captures `$ai_generation` events with model, tokens, latency, input, output

## New Dependencies

| Package | Purpose | Side |
|---|---|---|
| `posthog-js` | Client-side analytics, autocapture, session recording | Client |
| `posthog-node` | Server-side PostHog client | Server |
| `@posthog/ai` | LLM observability wrapper for Gemini | Server |

## Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_POSTHOG_KEY=<your-project-api-key>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## File Changes Summary

### New Files
| File | Purpose |
|---|---|
| `app/providers.tsx` | PostHog client init + provider component |
| `components/PostHogPageView.tsx` | SPA pageview tracking component |
| `lib/posthog-server.ts` | Server-side PostHog singleton |

### Modified Files
| File | Change |
|---|---|
| `app/layout.tsx` | Remove GA placeholder, wrap with PHProvider, add PostHogPageView |
| `app/api/avira/route.ts` | Use `@posthog/ai` Gemini wrapper, switch from chat API to models API |
| `.env.local` | Add PostHog env vars |
| `package.json` | Add posthog-js, posthog-node, @posthog/ai |

### Unchanged
- All frontend components (autocapture handles events automatically)
- AVIRA chat UI components (streaming format unchanged)
- Styling, business logic, data layer

## What Gets Tracked Automatically

| Event | Source |
|---|---|
| Page views | `PostHogPageView` component |
| Page leaves | `capture_pageleave: true` |
| Clicks on links, buttons | Autocapture |
| Form submissions (contact form) | Autocapture |
| Input changes | Autocapture |
| Session recordings | Enabled via PostHog dashboard |
| LLM generations (model, tokens, latency, I/O) | `@posthog/ai` wrapper |
