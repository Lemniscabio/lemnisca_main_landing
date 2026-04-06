# PostHog Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate PostHog into the Lemnisca landing site for autocapture, session recording, SPA pageview tracking, and full LLM observability of the AVIRA Gemini chatbot.

**Architecture:** Client-side `PostHogProvider` wraps the app for autocapture + session recording + pageviews. Server-side `@posthog/ai` Gemini wrapper instruments AVIRA's LLM calls automatically. Two PostHog clients: `posthog-js` (browser) and `posthog-node` (server, used by `@posthog/ai`).

**Tech Stack:** Next.js 16 (App Router), React 19, posthog-js, posthog-node, @posthog/ai

**Spec:** `docs/superpowers/specs/2026-04-06-posthog-integration-design.md`

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install PostHog packages**

```bash
cd landing_v3_next && npm install posthog-js posthog-node @posthog/ai
```

- [ ] **Step 2: Verify installation**

```bash
cd landing_v3_next && node -e "require('posthog-js'); require('posthog-node'); require('@posthog/ai/gemini'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add landing_v3_next/package.json landing_v3_next/package-lock.json
git commit -m "chore: add posthog-js, posthog-node, @posthog/ai dependencies"
```

---

### Task 2: Add Environment Variables

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add PostHog env vars to `.env.local`**

Add these two lines to the existing `.env.local` (which already has `GEMINI_API_KEY`):

```
NEXT_PUBLIC_POSTHOG_KEY=<your-project-api-key>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Replace `<your-project-api-key>` with the actual API key from PostHog dashboard (Project Settings > Project API Key).

- [ ] **Step 2: Verify env vars load**

```bash
cd landing_v3_next && node -e "require('dotenv').config({ path: '.env.local' }); console.log('KEY:', process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'set' : 'missing'); console.log('HOST:', process.env.NEXT_PUBLIC_POSTHOG_HOST ? 'set' : 'missing')"
```

Expected: Both show `set`. (If `dotenv` is not available, just verify manually that `.env.local` has the lines.)

Note: Do NOT commit `.env.local` -- it is already in `.gitignore`.

---

### Task 3: Create PostHog Provider

**Files:**
- Create: `app/providers.tsx`

- [ ] **Step 1: Create `app/providers.tsx`**

```tsx
'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
  })
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd landing_v3_next && npx tsc --noEmit app/providers.tsx 2>&1 || echo "Check for errors above"
```

- [ ] **Step 3: Commit**

```bash
git add landing_v3_next/app/providers.tsx
git commit -m "feat: add PostHog client-side provider"
```

---

### Task 4: Create PostHogPageView Component

**Files:**
- Create: `components/PostHogPageView.tsx`

- [ ] **Step 1: Create `components/PostHogPageView.tsx`**

```tsx
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'

export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      const params = searchParams.toString()
      if (params) {
        url = url + '?' + params
      }
      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams, posthog])

  return null
}
```

- [ ] **Step 2: Commit**

```bash
git add landing_v3_next/components/PostHogPageView.tsx
git commit -m "feat: add PostHogPageView component for SPA pageview tracking"
```

---

### Task 5: Wire Provider and PageView into Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update `app/layout.tsx`**

Replace the entire file with:

```tsx
import { Inter, Playfair_Display } from 'next/font/google'
import { Suspense } from 'react'
import { PHProvider } from './providers'
import { PostHogPageView } from '@/components/PostHogPageView'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata = {
  title: 'Lemnisca',
  description: 'Your site description here',
  openGraph: {
    title: 'Lemnisca',
    description: 'Your site description',
    images: ['/preview.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <PHProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PHProvider>
      </body>
    </html>
  )
}
```

Changes from original:
- Removed the placeholder GA `<script>` tags (non-functional `YOUR_GA_ID`)
- Removed the `<head>` block entirely (GA was the only thing in it)
- Added `PHProvider` wrapping body contents
- Added `PostHogPageView` inside `Suspense` (required because `useSearchParams` needs Suspense boundary)

- [ ] **Step 2: Verify the app builds**

```bash
cd landing_v3_next && npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 3: Smoke test locally**

```bash
cd landing_v3_next && npm run dev &
sleep 3
curl -s http://localhost:3000 | grep -q "posthog" && echo "PostHog script loaded" || echo "Check PostHog init"
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add landing_v3_next/app/layout.tsx
git commit -m "feat: wire PostHog provider and pageview tracking into root layout"
```

---

### Task 6: Create Server-Side PostHog Client

**Files:**
- Create: `lib/posthog-server.ts`

- [ ] **Step 1: Create `lib/posthog-server.ts`**

```ts
import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogServer(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    })
  }
  return posthogClient
}
```

- [ ] **Step 2: Commit**

```bash
git add landing_v3_next/lib/posthog-server.ts
git commit -m "feat: add server-side PostHog client singleton"
```

---

### Task 7: Refactor AVIRA Route for LLM Observability

**Files:**
- Modify: `app/api/avira/route.ts`

- [ ] **Step 1: Update `app/api/avira/route.ts`**

Replace the entire file with:

```ts
import { GoogleGenAI } from '@posthog/ai/gemini'
import { getPostHogServer } from '@/lib/posthog-server'
import { buildSystemPrompt, buildUserMessage } from '@/lib/reports/avira-prompt'
import { resolveReference } from '@/lib/reports/avira-references'

const phClient = getPostHogServer()

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  posthog: phClient,
})

interface ChatMsg {
  role: 'user' | 'ai'
  content: string
}

interface RequestBody {
  messages: ChatMsg[]
  question: string
  references: string[]
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json()
    const { messages, question, references } = body

    if (!question || typeof question !== 'string') {
      return Response.json({ error: 'Question is required' }, { status: 400 })
    }

    // Resolve references to full text
    const resolvedRefs: string[] = []
    for (const refId of references ?? []) {
      const resolved = resolveReference(refId)
      if (resolved) resolvedRefs.push(resolved)
    }

    // Build conversation history (last 10 exchanges)
    const history = (messages ?? []).slice(-20).map((msg) => ({
      role: msg.role === 'ai' ? ('model' as const) : ('user' as const),
      parts: [{ text: msg.content }],
    }))

    const systemPrompt = buildSystemPrompt()
    const userMessage = buildUserMessage(question, resolvedRefs)

    // Build contents array: history + new user message
    const contents = [
      ...history,
      { role: 'user' as const, parts: [{ text: userMessage }] },
    ]

    const stream = ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
      posthogDistinctId: 'anonymous',
      posthogProperties: { feature: 'avira' },
    })

    // Convert to ReadableStream for the frontend
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('AVIRA API error:', err)
    return Response.json({ error: message }, { status: 500 })
  }
}
```

Key changes from original:
- Import `GoogleGenAI` from `@posthog/ai/gemini` instead of `@google/genai`
- Initialize with `posthog: phClient` in constructor
- Replace `ai.chats.create().sendMessageStream()` with `ai.models.generateContentStream()`
- Build `contents` array manually (history + new user message)
- Pass `posthogDistinctId: 'anonymous'` and `posthogProperties: { feature: 'avira' }`
- System instruction moved to `config.systemInstruction` (same as before)
- Streaming response to frontend is unchanged

- [ ] **Step 2: Verify the app builds**

```bash
cd landing_v3_next && npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 3: Test AVIRA chat manually**

Start dev server, open the reports page, send a message to AVIRA, and verify:
1. Chat still streams responses correctly
2. Check PostHog dashboard > Activity > look for `$ai_generation` events

- [ ] **Step 4: Commit**

```bash
git add landing_v3_next/app/api/avira/route.ts
git commit -m "feat: add PostHog LLM observability to AVIRA chatbot via @posthog/ai"
```

---

### Task 8: Remove Direct @google/genai Dependency (Optional Cleanup)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Check if @google/genai is used elsewhere**

```bash
cd landing_v3_next && grep -r "@google/genai" --include="*.ts" --include="*.tsx" -l
```

Expected: No files (after Task 7, the only import was in `route.ts` which now uses `@posthog/ai/gemini`).

- [ ] **Step 2: Remove direct dependency if unused**

```bash
cd landing_v3_next && npm uninstall @google/genai
```

`@posthog/ai` brings `@google/genai` as its own dependency, so the Gemini SDK is still available.

- [ ] **Step 3: Verify build still works**

```bash
cd landing_v3_next && npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add landing_v3_next/package.json landing_v3_next/package-lock.json
git commit -m "chore: remove direct @google/genai dependency (provided by @posthog/ai)"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Full build check**

```bash
cd landing_v3_next && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: End-to-end smoke test**

Start `npm run dev` and verify:

1. **Landing page (`/`)**: Opens normally. Check browser Network tab for requests to `us.i.posthog.com` -- should see autocapture and pageview events.
2. **Navigate to `/reports`**: Check Network tab for another `$pageview` event to PostHog.
3. **Click buttons/links**: Check PostHog dashboard for `$autocapture` events.
4. **Send AVIRA chat message**: Verify streaming still works. Check PostHog dashboard for `$ai_generation` event with model, tokens, input, output.
5. **Session recording**: Check PostHog dashboard > Session Replay > should see a recording of your session.

- [ ] **Step 3: Final commit (if any fixes needed)**

```bash
git add -A && git commit -m "fix: posthog integration adjustments"
```

Only if fixes were needed in step 2.
