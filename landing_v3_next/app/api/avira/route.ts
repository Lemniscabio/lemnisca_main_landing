import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'
import { buildSystemPrompt, buildUserMessage } from '@/lib/reports/avira-prompt'
import { resolveReference } from '@/lib/reports/avira-references'
import { getReport } from '@/lib/reports/jnm'

export const runtime = 'nodejs'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

// ── In-memory rate limiter (per-IP sliding window) ─────────────────────────
// 10 messages per 60 seconds. Single-process MVP — same caveat as the auth
// route: on Vercel, parallel serverless instances have independent counters,
// so this is best-effort. For stricter enforcement use Vercel KV / Upstash.
const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX = 10
const hits = new Map<string, number[]>()

function rateLimitOk(ip: string): boolean {
  const now = Date.now()
  const prior = hits.get(ip) ?? []
  const recent = prior.filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent)
    return false
  }
  recent.push(now)
  hits.set(ip, recent)
  return true
}

function clientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

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
    const ip = clientIp(request)
    if (!rateLimitOk(ip)) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Too many messages — please wait a minute before sending more.' },
        { status: 429 }
      )
    }

    const body: RequestBody = await request.json()
    const { messages, question, references } = body

    if (!question || typeof question !== 'string') {
      return Response.json({ error: 'Question is required' }, { status: 400 })
    }

    const report = getReport()

    // Resolve references to full text
    const resolvedRefs: string[] = []
    for (const refId of references ?? []) {
      const resolved = resolveReference(report, refId)
      if (resolved) resolvedRefs.push(resolved)
    }

    // Build conversation history (last 10 exchanges)
    const history = (messages ?? []).slice(-20).map((msg) => ({
      role: msg.role === 'ai' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.content }],
    }))

    const systemPrompt = buildSystemPrompt(report)
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
