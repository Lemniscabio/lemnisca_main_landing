import { GoogleGenAI } from '@google/genai'
import { buildSystemPrompt, buildUserMessage } from '@/lib/reports/avira-prompt'
import { resolveReference } from '@/lib/reports/avira-references'
import { getReport } from '@/lib/reports/jnm'

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
