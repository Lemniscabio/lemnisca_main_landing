import { PostHogGoogleGenAI } from '@posthog/ai/gemini'
import { getPostHogServer } from '@/lib/posthog-server'
import { buildSystemPrompt, buildUserMessage } from '@/lib/reports/avira-prompt'
import { resolveReference } from '@/lib/reports/avira-references'

const phClient = getPostHogServer()

const ai = new PostHogGoogleGenAI({
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
