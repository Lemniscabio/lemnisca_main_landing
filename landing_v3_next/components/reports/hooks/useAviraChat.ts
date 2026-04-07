import { useEffect, useRef, useState } from 'react'

export interface ChatMessage {
  role: 'user' | 'ai'
  content: string
}

const WELCOME_MSG: ChatMessage = {
  role: 'ai',
  content: 'Hello! I\'m AVIRA, your AI research assistant. Ask me anything about this fermentation analysis report — batch comparisons, growth rates, supplement effects, or recommendations.',
}

// Per-tab survival across refresh: persist the chat thread to localStorage.
// This is a single-customer MVP report, so we use a fixed key. If the report
// ever becomes multi-customer, key this by report id.
const STORAGE_KEY = 'avira:jnm:messages'
const STORAGE_VERSION = 1
// Cap how much we persist so we don't blow past localStorage's ~5 MB quota
// during a long streaming session.
const MAX_PERSISTED = 100

interface PersistedThread {
  v: number
  messages: ChatMessage[]
}

function loadPersisted(): ChatMessage[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedThread
    if (parsed.v !== STORAGE_VERSION || !Array.isArray(parsed.messages)) return null
    return parsed.messages
  } catch {
    return null
  }
}

function savePersisted(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return
  try {
    const payload: PersistedThread = {
      v: STORAGE_VERSION,
      messages: messages.slice(-MAX_PERSISTED),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota exceeded or storage disabled — silently ignore.
  }
}

export function useAviraChat() {
  // Always start with the welcome message to keep the first client render
  // identical to the server render (avoids React hydration mismatch). The
  // saved thread is restored in a post-mount effect.
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const hydratedRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Restore from localStorage once on mount (client only).
  useEffect(() => {
    const restored = loadPersisted()
    if (restored && restored.length > 0) {
      setMessages(restored)
    }
    hydratedRef.current = true
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Persist on every change AFTER hydration. Skipping the very first render
  // prevents us from clobbering a saved thread with the placeholder welcome
  // message before the restore effect has had a chance to run.
  useEffect(() => {
    if (!hydratedRef.current) return
    savePersisted(messages)
  }, [messages])

  const send = async (attachedRefIds: string[], overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || typing) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setTyping(true)

    // Placeholder for streaming
    setMessages((prev) => [...prev, { role: 'ai', content: '' }])

    try {
      const res = await fetch('/api/avira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(-20),
          question: text,
          references: attachedRefIds,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', content: `**Error:** ${err.error || 'Something went wrong. Please try again.'}` }
          return updated
        })
        setTyping(false)
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
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'ai', content: current }
            return updated
          })
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'ai', content: '**Error:** Could not reach AVIRA. Please check your connection and try again.' }
        return updated
      })
    }

    setTyping(false)
  }

  return { messages, input, setInput, typing, messagesEndRef, send }
}
