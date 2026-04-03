# AVIRA Chatbot — Design Spec

## Overview

AVIRA is a report-grounded Q&A assistant embedded in the fermentation analysis report page. It answers questions strictly from the report data — no external knowledge, no hallucination. Powered by Google Gemini API with a carefully constructed grounding prompt.

## Architecture

1. User asks a question (optionally with `#reference` or clicked chart context)
2. Next.js API route (`POST /api/avira`) receives the question + attached context references + conversation history
3. API route builds a grounding prompt from the full report data (hypotheses, evidence descriptions, batch metadata, recommendations, executive summary)
4. Sends to Gemini API with a strict system prompt that forbids any answer not derivable from the provided report content
5. Response is streamed back to the chat UI with clickable `[See: Chart Title](chartId)` links that scroll-to and highlight the referenced element

The entire report dataset (~15-20KB of structured text) fits within Gemini's context window, so we send it all every request. No RAG, no embeddings, no chunking.

## Anti-Hallucination Prompt Strategy

The system prompt has three layers:

### Layer 1 — Identity & Rules

- You are AVIRA, a research assistant for THIS specific fermentation report
- You may ONLY answer using information provided in the report context below
- If the answer is not in the report data, say "This information is not covered in the report"
- Never speculate, infer beyond what's stated, or use external knowledge
- Always cite which hypothesis, evidence item, or section your answer comes from

### Layer 2 — Full Report Context (injected every request)

Serialized from `jnmReport` + `batchMeta` into structured plain text:

```
=== PROBLEM STATEMENT ===
[heading, body, KPIs]

=== EXECUTIVE SUMMARY ===
[bullets]

=== HYPOTHESIS H1: [title] ===
Verdict: Supported
Summary: [verdictSummary]
Evidence 1 (chart, id=od600): [title] — [description]
Evidence 2 (chart, id=wcw): [title] — [description]
...

=== BATCH B04 ===
Duration: 74h | Final OD: 310 | Yield: 0.35 g/g
Supplements: AA+YNB, Tocopherol (no IPM)
Closure: White cells + cell death at 74h
...

=== RECOMMENDATIONS ===
[title, source, description for each]
```

Plain text with clear delimiters — simple for Gemini to locate information.

### Layer 3 — User Context (per request)

- The user's question
- Any `#references` resolved to their full content (e.g., `#B04` expands to B04's full metadata)
- If a chart was clicked/attached, its title + description + parent hypothesis
- Conversation history (last 10 exchanges) for follow-up support

### Response Format Instructions

- When referencing a chart, wrap as `[See: Chart Title](chartId)` so the frontend can parse and render as clickable
- Keep answers concise and factual
- Use the report's own language and numbers, don't rephrase values

## `#` Reference System

### Hashtaggable References (autocomplete in chat input)

| Prefix | Matches | Example |
|--------|---------|---------|
| `#B01`–`#B06` | Batch metadata | `#B04` → B04's full stats, supplements, closure reason |
| `#H1`–`#H7` | Hypothesis | `#H3` → title, verdict, summary, all evidence descriptions |
| `#od600`, `#wcw`, etc. | Chart by ID | `#carbonBalance` → chart title + description |
| `#recommendations` | Recommendations section | All 3 recommendation cards |
| `#executive-summary` | Executive summary | All 7 bullet points |

- Typing `#` opens a filtered dropdown
- Selected reference appears as a pill/tag in the input area
- Multiple references allowed per message

### Click-to-Attach from Report

- Each chart, table, and section heading gets a small "Ask AVIRA" icon on hover
- Clicking opens the AVIRA sidebar (if closed) and attaches that element as context (same pill/tag as hashtag)
- User then types their question with context pre-attached

## Scroll-to + Highlight

When AVIRA's response references a chart or section:

- `[See: Chart Title](chartId)` links are rendered as clickable elements in the chat bubble
- Clicking a link smooth-scrolls the report to that chart/section
- A brief CSS highlight animation (pulse, ~1.5s) draws attention to the referenced element

## API Route

**`POST /api/avira`**

Request body:
```typescript
{
  messages: { role: 'user' | 'ai', content: string }[]  // last 10 exchanges
  question: string
  references: string[]  // resolved IDs like 'B04', 'H3', 'od600'
}
```

Response: Streamed text (ReadableStream) — tokens appear in real-time in the chat.

API key stored in `.env.local` as `GEMINI_API_KEY`.

## Files

| File | Purpose |
|------|---------|
| `app/api/avira/route.ts` | New — API route, Gemini call, streaming response |
| `lib/reports/avira-prompt.ts` | New — report serializer + system prompt builder |
| `lib/reports/avira-references.ts` | New — reference resolver (ID → full content) |
| `components/reports/ReportsClient.tsx` | Modified — chat logic, click-to-attach, scroll-to-highlight, `#` autocomplete |
| `components/reports/Reports.css` | Modified — highlight animation, pill styles, autocomplete dropdown |

## Dependencies

- `@google/generative-ai` npm package for Gemini API
- `GEMINI_API_KEY` in `.env.local`

## Conversation History

- Last 10 user/AI exchanges included in each request
- Enables follow-up questions like "what about B05 though?" or "explain that number"
- Older messages dropped to keep context window efficient
