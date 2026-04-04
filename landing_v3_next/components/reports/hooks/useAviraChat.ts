import { useEffect, useRef, useState } from 'react'

export interface ChatMessage {
  role: 'user' | 'ai'
  content: string
}

const WELCOME_MSG: ChatMessage = {
  role: 'ai',
  content: 'Hello! I\'m AVIRA, your AI research assistant. Ask me anything about this fermentation analysis report — batch comparisons, growth rates, supplement effects, or recommendations.',
}

export function useAviraChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (attachedRefIds: string[]) => {
    const text = input.trim()
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
