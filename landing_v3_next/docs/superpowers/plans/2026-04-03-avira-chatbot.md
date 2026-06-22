# AVIRA Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder AVIRA chatbot with a Gemini-powered, report-grounded Q&A assistant that only answers from the fermentation report data, supports `#references` and click-to-attach, and links responses back to report charts via scroll-to-highlight.

**Architecture:** Next.js API route serializes the full report into a grounding prompt, sends it to Gemini with conversation history, and streams the response back. The frontend parses `[See: Title](chartId)` links in responses to create clickable scroll-to-highlight interactions. A `#` autocomplete system and click-to-attach buttons let users scope questions to specific report elements.

**Tech Stack:** Next.js 16 App Router, React 19, `@google/genai` SDK, Gemini 2.5 Flash, TypeScript

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/reports/avira-prompt.ts` | Create | Serialize report data → plain text, build system prompt |
| `lib/reports/avira-references.ts` | Create | Resolve `#` reference IDs to content, define reference catalog for autocomplete |
| `app/api/avira/route.ts` | Create | POST handler: validate input, build prompt, call Gemini, stream response |
| `components/reports/ReportsClient.tsx` | Modify | Replace placeholder chat with streaming Gemini integration, add `#` autocomplete, click-to-attach, scroll-to-highlight |
| `components/reports/Reports.css` | Modify | Add styles for reference pills, autocomplete dropdown, highlight animation, chart links |
| `.env.local` | Create | `GEMINI_API_KEY` |

---

### Task 1: Install dependency and create env file

**Files:**
- Modify: `landing_v3_next/package.json`
- Create: `landing_v3_next/.env.local`

- [ ] **Step 1: Install @google/genai**

```bash
cd /Users/visheshpaliwal/repo/lem-all/lemnisca_main_landing/landing_v3_next && npm install @google/genai
```

- [ ] **Step 2: Create .env.local**

Create `landing_v3_next/.env.local`:

```
GEMINI_API_KEY=your-api-key-here
```

- [ ] **Step 3: Add .env.local to .gitignore if not already present**

Check if `.gitignore` already includes `.env.local`. If not, append it.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: add @google/genai dependency and env setup"
```

---

### Task 2: Report data serializer and system prompt builder

**Files:**
- Create: `landing_v3_next/lib/reports/avira-prompt.ts`

This is the core anti-hallucination layer. It serializes the entire report into structured plain text for Gemini's context.

- [ ] **Step 1: Create `avira-prompt.ts`**

```typescript
import { jnmReport } from './jnm-data'
import { batchMeta } from './batch-data'
import type { ReportData, Hypothesis, Evidence, Recommendation } from './types'

const SYSTEM_RULES = `You are AVIRA, the AI Research Assistant for the fermentation analysis report below.

STRICT RULES — FOLLOW WITHOUT EXCEPTION:
1. You may ONLY answer using information provided in the REPORT CONTEXT below.
2. If the answer is not in the report data, respond: "This information is not covered in the report."
3. NEVER speculate, hypothesize, or use knowledge outside the report context.
4. NEVER invent numbers, percentages, or data points. Only use exact values from the report.
5. Always cite which section your answer comes from (e.g., "According to Hypothesis H3..." or "From the executive summary...").
6. When referencing a chart, format as: [See: Chart Title](chartId) — e.g., [See: OD600 Growth Curves](od600)
7. Keep answers concise and factual. Use the report's own language and numbers.
8. For batch comparisons, only compare using data explicitly provided — do not extrapolate trends.
9. If the user asks about methodology, only describe what the report states was done.
10. If asked for opinions or predictions, decline and point to the report's recommendations section.`

function serializeEvidence(ev: Evidence): string {
  const lines: string[] = []
  const typeLabel = ev.type === 'chart' ? `chart, id=${ev.chartId}` : ev.type
  lines.push(`  Evidence (${typeLabel}): "${ev.title}"`)
  lines.push(`    ${ev.description}`)
  if (ev.tableData) {
    lines.push(`    Table: ${ev.tableData.headers.join(' | ')}`)
    for (const row of ev.tableData.rows) {
      lines.push(`    ${row.join(' | ')}`)
    }
  }
  return lines.join('\n')
}

function serializeHypothesis(h: Hypothesis): string {
  const lines: string[] = [
    `=== HYPOTHESIS ${h.id.toUpperCase()}: ${h.title} ===`,
    `Verdict: ${h.verdict}`,
    `Summary: ${h.verdictSummary}`,
    '',
  ]
  for (const ev of h.evidence) {
    lines.push(serializeEvidence(ev))
    lines.push('')
  }
  return lines.join('\n')
}

function serializeReport(report: ReportData): string {
  const sections: string[] = []

  // Problem statement
  sections.push(`=== PROBLEM STATEMENT ===`)
  sections.push(report.problemStatement.heading)
  sections.push(report.problemStatement.body)
  sections.push('')
  sections.push('Key Performance Indicators:')
  for (const kpi of report.problemStatement.kpis) {
    sections.push(`  ${kpi.label}: ${kpi.value}${kpi.subtext ? ` (${kpi.subtext})` : ''}`)
  }

  // Executive summary
  sections.push('')
  sections.push(`=== EXECUTIVE SUMMARY ===`)
  for (const bullet of report.executiveSummary.bullets) {
    sections.push(`- ${bullet}`)
  }

  // Hypotheses
  sections.push('')
  for (const h of report.hypotheses) {
    sections.push(serializeHypothesis(h))
  }

  // Batch metadata
  sections.push(`=== BATCH METADATA ===`)
  for (const b of batchMeta) {
    sections.push(
      `${b.id}: Equipment=${b.equipment} | Scale=${b.scale}L | Duration=${b.duration}h (planned ${b.plannedDuration}h) | Final OD=${b.finalOD} | Final WCW=${b.finalWCW} mg/3mL | Supplements=${b.supplements} | Closure=${b.closureReason} | Initial Vol=${b.batchMediumVol}mL | Feed Vol=${b.totalFeedVol}mL | Supplement Vol=${b.supplementVol}mL`
    )
  }

  // Recommendations
  sections.push('')
  sections.push(`=== RECOMMENDATIONS ===`)
  for (const rec of report.recommendations) {
    sections.push(`${rec.title} (${rec.source}): ${rec.description}`)
  }

  return sections.join('\n')
}

export function buildSystemPrompt(): string {
  const reportContext = serializeReport(jnmReport)
  return `${SYSTEM_RULES}\n\n--- BEGIN REPORT CONTEXT ---\n${reportContext}\n--- END REPORT CONTEXT ---`
}

export function buildUserMessage(question: string, resolvedReferences: string[]): string {
  if (resolvedReferences.length === 0) return question
  const refBlock = resolvedReferences.join('\n\n')
  return `The user has attached the following report context to their question:\n\n${refBlock}\n\nQuestion: ${question}`
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/reports/avira-prompt.ts
git commit -m "feat(avira): add report data serializer and grounding prompt builder"
```

---

### Task 3: Reference resolver and catalog

**Files:**
- Create: `landing_v3_next/lib/reports/avira-references.ts`

Resolves `#B04`, `#H3`, `#od600`, etc. to full text content, and provides a catalog for the autocomplete dropdown.

- [ ] **Step 1: Create `avira-references.ts`**

```typescript
import { jnmReport } from './jnm-data'
import { batchMeta } from './batch-data'
import type { Evidence } from './types'

export interface ReferenceItem {
  id: string          // e.g. 'B04', 'H3', 'od600'
  label: string       // display name in autocomplete
  category: 'batch' | 'hypothesis' | 'chart' | 'section'
}

/** All referenceable items for the # autocomplete dropdown */
export function getReferenceCatalog(): ReferenceItem[] {
  const items: ReferenceItem[] = []

  // Batches
  for (const b of batchMeta) {
    items.push({ id: b.id, label: `${b.id} — ${b.equipment}, ${b.duration}h`, category: 'batch' })
  }

  // Hypotheses
  for (const h of jnmReport.hypotheses) {
    items.push({ id: h.id.toUpperCase(), label: `${h.id.toUpperCase()} — ${h.title}`, category: 'hypothesis' })
  }

  // Charts (from evidence across all hypotheses)
  const seenCharts = new Set<string>()
  for (const h of jnmReport.hypotheses) {
    for (const ev of h.evidence) {
      if (ev.chartId && !seenCharts.has(ev.chartId)) {
        seenCharts.add(ev.chartId)
        items.push({ id: ev.chartId, label: ev.title, category: 'chart' })
      }
    }
  }

  // Sections
  items.push({ id: 'executive-summary', label: 'Executive Summary', category: 'section' })
  items.push({ id: 'recommendations', label: 'Recommendations', category: 'section' })
  items.push({ id: 'overview', label: 'Problem Statement & KPIs', category: 'section' })

  return items
}

/** Resolve a reference ID to its full text content for the prompt */
export function resolveReference(refId: string): string | null {
  const id = refId.trim()
  const idUpper = id.toUpperCase()

  // Batch reference: B01–B06
  const batch = batchMeta.find((b) => b.id === idUpper)
  if (batch) {
    return `[Batch ${batch.id}] Equipment=${batch.equipment} | Scale=${batch.scale}L | Duration=${batch.duration}h (planned ${batch.plannedDuration}h) | Final OD=${batch.finalOD} | Final WCW=${batch.finalWCW} mg/3mL | Supplements=${batch.supplements} | Closure=${batch.closureReason} | Initial Vol=${batch.batchMediumVol}mL | Feed Vol=${batch.totalFeedVol}mL | Supplement Vol=${batch.supplementVol}mL`
  }

  // Hypothesis reference: H1–H7
  const hyp = jnmReport.hypotheses.find((h) => h.id.toUpperCase() === idUpper)
  if (hyp) {
    const evidenceText = hyp.evidence
      .map((ev) => {
        let text = `  - ${ev.type}: "${ev.title}" — ${ev.description}`
        if (ev.tableData) {
          text += `\n    Table: ${ev.tableData.headers.join(' | ')}\n`
          text += ev.tableData.rows.map((r) => `    ${r.join(' | ')}`).join('\n')
        }
        return text
      })
      .join('\n')
    return `[Hypothesis ${hyp.id.toUpperCase()}: ${hyp.title}]\nVerdict: ${hyp.verdict}\nSummary: ${hyp.verdictSummary}\nEvidence:\n${evidenceText}`
  }

  // Chart reference by chartId
  for (const h of jnmReport.hypotheses) {
    for (const ev of h.evidence) {
      if (ev.chartId === id) {
        return `[Chart: ${ev.title} (id=${ev.chartId}), from ${h.id.toUpperCase()}]\n${ev.description}`
      }
    }
  }

  // Section references
  if (id === 'executive-summary') {
    return `[Executive Summary]\n${jnmReport.executiveSummary.bullets.map((b) => `- ${b}`).join('\n')}`
  }
  if (id === 'recommendations') {
    return `[Recommendations]\n${jnmReport.recommendations.map((r) => `${r.title} (${r.source}): ${r.description}`).join('\n')}`
  }
  if (id === 'overview') {
    const kpis = jnmReport.problemStatement.kpis.map((k) => `  ${k.label}: ${k.value}`).join('\n')
    return `[Problem Statement]\n${jnmReport.problemStatement.body}\n\nKPIs:\n${kpis}`
  }

  return null
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/reports/avira-references.ts
git commit -m "feat(avira): add reference resolver and autocomplete catalog"
```

---

### Task 4: API route with Gemini streaming

**Files:**
- Create: `landing_v3_next/app/api/avira/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
import { GoogleGenAI } from '@google/genai'
import { buildSystemPrompt, buildUserMessage } from '@/lib/reports/avira-prompt'
import { resolveReference } from '@/lib/reports/avira-references'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

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
      role: msg.role === 'ai' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.content }],
    }))

    const systemPrompt = buildSystemPrompt()
    const userMessage = buildUserMessage(question, resolvedRefs)

    // Create chat with history and stream response
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemPrompt,
      },
      history,
    })

    const stream = await chat.sendMessageStream({ message: userMessage })

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

- [ ] **Step 2: Verify the route loads**

```bash
cd /Users/visheshpaliwal/repo/lem-all/lemnisca_main_landing/landing_v3_next && npm run build 2>&1 | head -30
```

Expect no TypeScript errors for the new route.

- [ ] **Step 3: Commit**

```bash
git add app/api/avira/route.ts
git commit -m "feat(avira): add Gemini streaming API route"
```

---

### Task 5: Frontend — Replace placeholder chat with streaming Gemini integration

**Files:**
- Modify: `landing_v3_next/components/reports/ReportsClient.tsx`

This task replaces the `setTimeout` placeholder with a real streaming call to `/api/avira`.

- [ ] **Step 1: Add new state for references and streaming**

At `ReportsClient.tsx:84` (after `const [chatTyping, setChatTyping] = useState(false)`), add:

```typescript
const [attachedRefs, setAttachedRefs] = useState<{ id: string; label: string }[]>([])
const [showAutocomplete, setShowAutocomplete] = useState(false)
const [autocompleteFilter, setAutocompleteFilter] = useState('')
const [autocompleteItems, setAutocompleteItems] = useState<{ id: string; label: string; category: string }[]>([])
```

At the top imports, add:

```typescript
import { getReferenceCatalog } from '@/lib/reports/avira-references'
import type { ReferenceItem } from '@/lib/reports/avira-references'
```

Add a ref for the autocomplete catalog (inside the component, after state declarations):

```typescript
const refCatalog = useRef<ReferenceItem[]>(getReferenceCatalog())
```

- [ ] **Step 2: Replace `handleChatSend` with streaming version**

Replace the existing `handleChatSend` function (lines 197–213) with:

```typescript
const handleChatSend = async () => {
  const text = chatInput.trim()
  if (!text || chatTyping) return

  const userMsg = { role: 'user' as const, content: text }
  setChatMessages((prev) => [...prev, userMsg])
  setChatInput('')
  setChatTyping(true)
  const refs = attachedRefs.map((r) => r.id)
  setAttachedRefs([])

  // Add placeholder AI message for streaming
  const aiMsgIndex = chatMessages.length + 1 // +1 for the user message we just added
  setChatMessages((prev) => [...prev, { role: 'ai', content: '' }])

  try {
    const res = await fetch('/api/avira', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: chatMessages.slice(-20), // last 10 exchanges (20 messages)
        question: text,
        references: refs,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }))
      setChatMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'ai', content: `**Error:** ${err.error || 'Something went wrong. Please try again.'}` }
        return updated
      })
      setChatTyping(false)
      return
    }

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let accumulated = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        const current = accumulated
        setChatMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', content: current }
          return updated
        })
      }
    }
  } catch {
    setChatMessages((prev) => {
      const updated = [...prev]
      updated[updated.length - 1] = { role: 'ai', content: '**Error:** Could not reach AVIRA. Please check your connection and try again.' }
      return updated
    })
  }

  setChatTyping(false)
}
```

- [ ] **Step 3: Add `#` autocomplete handler to textarea onChange**

Replace the textarea `onChange` handler (around line 835) with:

```typescript
onChange={(e) => {
  const val = e.target.value
  setChatInput(val)
  e.target.style.height = 'auto'
  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`

  // # autocomplete detection
  const hashMatch = val.match(/#(\S*)$/)
  if (hashMatch) {
    const filter = hashMatch[1].toLowerCase()
    setAutocompleteFilter(filter)
    const filtered = refCatalog.current.filter(
      (item) =>
        item.id.toLowerCase().includes(filter) ||
        item.label.toLowerCase().includes(filter)
    )
    setAutocompleteItems(filtered)
    setShowAutocomplete(filtered.length > 0)
  } else {
    setShowAutocomplete(false)
  }
}}
```

- [ ] **Step 4: Add autocomplete selection handler**

Add this function after `handleChatSend`:

```typescript
const handleSelectReference = (item: ReferenceItem) => {
  // Remove the #partial from input
  const newInput = chatInput.replace(/#\S*$/, '')
  setChatInput(newInput)
  setAttachedRefs((prev) => {
    if (prev.some((r) => r.id === item.id)) return prev
    return [...prev, { id: item.id, label: item.label }]
  })
  setShowAutocomplete(false)
}

const handleRemoveRef = (refId: string) => {
  setAttachedRefs((prev) => prev.filter((r) => r.id !== refId))
}
```

- [ ] **Step 5: Add click-to-attach handler**

Add this function after `handleRemoveRef`:

```typescript
const handleAttachToAvira = (refId: string, label: string) => {
  if (!aviraOpen) {
    setSidebarCollapsed(true)
    setAviraOpen(true)
  }
  setAttachedRefs((prev) => {
    if (prev.some((r) => r.id === refId)) return prev
    return [...prev, { id: refId, label }]
  })
}
```

- [ ] **Step 6: Commit**

```bash
git add components/reports/ReportsClient.tsx
git commit -m "feat(avira): replace placeholder chat with Gemini streaming + reference state"
```

---

### Task 6: Frontend — Autocomplete dropdown, reference pills, and click-to-attach buttons in JSX

**Files:**
- Modify: `landing_v3_next/components/reports/ReportsClient.tsx`

- [ ] **Step 1: Add reference pills above textarea**

In the AVIRA sidebar JSX, just before the `<textarea>` element (around line 825), insert:

```tsx
{/* Reference pills */}
{attachedRefs.length > 0 && (
  <div className="avira-ref-pills">
    {attachedRefs.map((ref) => (
      <span key={ref.id} className="avira-ref-pill">
        #{ref.id}
        <button onClick={() => handleRemoveRef(ref.id)} className="avira-ref-pill-x" aria-label={`Remove ${ref.id}`}>
          <X size={12} />
        </button>
      </span>
    ))}
  </div>
)}
```

- [ ] **Step 2: Add autocomplete dropdown above the input area**

Right before the `<div className="avira-input-area">` element, insert:

```tsx
{showAutocomplete && (
  <div className="avira-autocomplete">
    {autocompleteItems.slice(0, 8).map((item) => (
      <button
        key={item.id}
        className="avira-autocomplete-item"
        onClick={() => handleSelectReference(item)}
      >
        <span className={`avira-ref-cat avira-ref-cat-${item.category}`}>{item.category}</span>
        <span className="avira-autocomplete-label">{item.label}</span>
      </button>
    ))}
  </div>
)}
```

- [ ] **Step 3: Add "Ask AVIRA" hover buttons on evidence charts**

Find the evidence chart rendering section (search for `evidence-chart` class in the JSX). On each chart card, add an ask-AVIRA button. Locate the evidence rendering loop inside hypothesis accordions — it will look something like mapping over `h.evidence`. Inside each evidence card's header or top-right corner, add:

```tsx
<button
  className="ask-avira-btn"
  onClick={(e) => {
    e.stopPropagation()
    handleAttachToAvira(
      ev.chartId || ev.title,
      ev.title
    )
  }}
  aria-label={`Ask AVIRA about ${ev.title}`}
>
  <MessageSquare size={13} />
</button>
```

This button should be placed inside each evidence card container. The exact insertion point depends on the evidence card JSX structure — look for the `evidence-chart`, `evidence-table`, and `evidence-text` class divs within the hypothesis accordion content.

- [ ] **Step 4: Add "Ask AVIRA" buttons on section headings**

For each main section heading (overview, executive-summary, hypotheses, recommendations), add a similar button. Find the section heading elements and add:

```tsx
<button
  className="ask-avira-btn section-ask"
  onClick={() => handleAttachToAvira('executive-summary', 'Executive Summary')}
  aria-label="Ask AVIRA about Executive Summary"
>
  <MessageSquare size={13} />
</button>
```

Repeat for each section with the appropriate refId and label.

- [ ] **Step 5: Commit**

```bash
git add components/reports/ReportsClient.tsx
git commit -m "feat(avira): add autocomplete dropdown, reference pills, and click-to-attach buttons"
```

---

### Task 7: Frontend — Scroll-to-highlight for chart links in AI responses

**Files:**
- Modify: `landing_v3_next/components/reports/ReportsClient.tsx`

- [ ] **Step 1: Add scroll-to-highlight handler**

Add this function after `handleAttachToAvira`:

```typescript
const handleScrollToChart = (chartId: string) => {
  // Find the chart element by data attribute
  const el = document.querySelector(`[data-chart-id="${chartId}"]`) as HTMLElement
    || document.getElementById(chartId)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.add('avira-highlight')
  setTimeout(() => el.classList.remove('avira-highlight'), 2000)
}
```

- [ ] **Step 2: Add `data-chart-id` attributes to evidence chart containers**

In the evidence rendering JSX, add a `data-chart-id` attribute to each chart's container div:

```tsx
<div className="evidence-chart" data-chart-id={ev.chartId}>
```

This lets `handleScrollToChart` find them.

- [ ] **Step 3: Replace `dangerouslySetInnerHTML` in AI message bubbles with parsed content**

Replace the AI message bubble rendering to parse `[See: Title](chartId)` links:

```typescript
function renderAIMessage(content: string): React.ReactNode {
  // Split on [See: ...](chartId) pattern
  const parts = content.split(/(\[See:\s*[^\]]+\]\([^)]+\))/)
  return parts.map((part, i) => {
    const linkMatch = part.match(/\[See:\s*([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      const [, title, chartId] = linkMatch
      return (
        <button
          key={i}
          className="avira-chart-link"
          onClick={() => handleScrollToChart(chartId)}
        >
          {title} ↗
        </button>
      )
    }
    return <span key={i} dangerouslySetInnerHTML={{ __html: renderMarkdown(part) }} />
  })
}
```

Add this inside the component (after `handleScrollToChart`). Then update the AI message bubble JSX from:

```tsx
<div
  className="msg-bubble"
  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
/>
```

To:

```tsx
<div className="msg-bubble">
  {msg.role === 'ai' ? renderAIMessage(msg.content) : (
    <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
  )}
</div>
```

- [ ] **Step 4: Commit**

```bash
git add components/reports/ReportsClient.tsx
git commit -m "feat(avira): add scroll-to-highlight for chart links in AI responses"
```

---

### Task 8: CSS — Reference pills, autocomplete, highlight animation, chart links

**Files:**
- Modify: `landing_v3_next/components/reports/Reports.css`

- [ ] **Step 1: Add reference pill styles**

Append to `Reports.css`:

```css
/* ─── AVIRA Reference Pills ───── */
.avira-ref-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px 0;
}

.avira-ref-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

.avira-ref-pill-x {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.avira-ref-pill-x:hover {
  opacity: 1;
}
```

- [ ] **Step 2: Add autocomplete dropdown styles**

```css
/* ─── AVIRA Autocomplete ───── */
.avira-autocomplete {
  position: absolute;
  bottom: 100%;
  left: 12px;
  right: 12px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  max-height: 280px;
  overflow-y: auto;
  z-index: 20;
  padding: 6px;
}

.avira-autocomplete-item {
  all: unset;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #1e293b;
  transition: background 0.15s;
  box-sizing: border-box;
}

.avira-autocomplete-item:hover {
  background: rgba(99, 102, 241, 0.06);
}

.avira-ref-cat {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.avira-ref-cat-batch { background: #fef3c7; color: #92400e; }
.avira-ref-cat-hypothesis { background: #ede9fe; color: #6d28d9; }
.avira-ref-cat-chart { background: #dbeafe; color: #1e40af; }
.avira-ref-cat-section { background: #d1fae5; color: #065f46; }

.avira-autocomplete-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- [ ] **Step 3: Add highlight animation**

```css
/* ─── AVIRA Scroll-to Highlight ───── */
@keyframes avira-highlight-pulse {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.15); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}

.avira-highlight {
  animation: avira-highlight-pulse 0.7s ease-out 3;
  outline: 2px solid rgba(99, 102, 241, 0.5);
  outline-offset: 4px;
  border-radius: 12px;
}
```

- [ ] **Step 4: Add chart link styles in chat bubbles**

```css
/* ─── AVIRA Chart Links ───── */
.avira-chart-link {
  all: unset;
  cursor: pointer;
  color: #6366f1;
  font-weight: 600;
  font-size: 12px;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s;
}

.avira-chart-link:hover {
  color: #4f46e5;
}
```

- [ ] **Step 5: Add "Ask AVIRA" hover button styles**

```css
/* ─── Ask AVIRA Hover Button ───── */
.ask-avira-btn {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  opacity: 0;
  transition: opacity 0.2s, background 0.15s;
}

.evidence-chart:hover .ask-avira-btn,
.evidence-table:hover .ask-avira-btn,
.evidence-text:hover .ask-avira-btn,
.section-heading:hover .ask-avira-btn {
  opacity: 1;
}

.ask-avira-btn:hover {
  background: rgba(99, 102, 241, 0.16);
}

.section-ask {
  margin-left: 8px;
  vertical-align: middle;
}
```

- [ ] **Step 6: Make the input area position: relative for autocomplete positioning**

Add to the existing `.avira-input-area` rule:

```css
.avira-input-area {
  position: relative;
}
```

- [ ] **Step 7: Commit**

```bash
git add components/reports/Reports.css
git commit -m "feat(avira): add CSS for pills, autocomplete, highlight animation, chart links"
```

---

### Task 9: Fix hydration mismatch

**Files:**
- Modify: `landing_v3_next/components/reports/ReportsClient.tsx`

- [ ] **Step 1: Fix the date hydration issue**

At line 532, change:

```tsx
<p><strong>Generated on:</strong> {new Date().toLocaleDateString()}</p>
```

To:

```tsx
<p suppressHydrationWarning><strong>Generated on:</strong> {new Date().toLocaleDateString()}</p>
```

- [ ] **Step 2: Commit**

```bash
git add components/reports/ReportsClient.tsx
git commit -m "fix: suppress hydration warning on dynamic date rendering"
```

---

### Task 10: Integration test — manual verification

- [ ] **Step 1: Set the real Gemini API key**

Edit `landing_v3_next/.env.local` and replace `your-api-key-here` with the actual API key.

- [ ] **Step 2: Start the dev server**

```bash
cd /Users/visheshpaliwal/repo/lem-all/lemnisca_main_landing/landing_v3_next && npm run dev
```

- [ ] **Step 3: Verify basic chat**

Open `http://localhost:3000/reports`, click "Ask AVIRA", and ask: "What was B04's yield?"

Expected: Streaming response mentioning `0.35 g/g`, citing Hypothesis H4, possibly with a `[See: Carbon Balance](carbonBalance)` link.

- [ ] **Step 4: Verify `#` autocomplete**

Type `#B` in the input. Expected: Dropdown showing B01–B06 with metadata previews. Select `#B04`, then ask "Why did this batch terminate early?"

Expected: Answer about carotenoid toxicity, white cells, lack of IPM, citing H6.

- [ ] **Step 5: Verify click-to-attach**

Hover over any chart card in the report. Expected: Small MessageSquare icon appears. Click it. Expected: AVIRA sidebar opens with that chart attached as a pill.

- [ ] **Step 6: Verify scroll-to-highlight**

Ask AVIRA a question that references a chart. Click the `[See: ...]` link in the response. Expected: Report scrolls to that chart with a purple pulse highlight animation.

- [ ] **Step 7: Verify anti-hallucination**

Ask: "What is the GDP of France?" Expected: "This information is not covered in the report."

- [ ] **Step 8: Verify follow-up context**

Ask: "What was B04's yield?" Then follow up: "How does that compare to B03?" Expected: Accurate comparison using exact values (B04: 0.35 g/g, B03: 0.25 g/g) from the report data.
