'use client'

import { Bot, X, Send } from 'lucide-react'
import type { ChatMessage } from '../hooks/useAviraChat'
import type { ReferenceItem } from '@/lib/reports/avira-references'
import { AviraChatMessage } from './AviraChatMessage'
import { AviraAutocomplete } from './AviraAutocomplete'

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n- (.+)/g, '<br/>• $1')
    .replace(/\n/g, '<br/>')
}

interface AviraSidebarProps {
  open: boolean
  messages: ChatMessage[]
  input: string
  typing: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  attachedRefs: { id: string; label: string }[]
  showAutocomplete: boolean
  autocompleteItems: ReferenceItem[]
  onClose: () => void
  onInputChange: (val: string) => void
  onSend: () => void
  onSelectReference: (item: ReferenceItem) => void
  onRemoveRef: (refId: string) => void
  onScrollToChart: (chartId: string) => void
}

export function AviraSidebar({
  open,
  messages,
  input,
  typing,
  messagesEndRef,
  attachedRefs,
  showAutocomplete,
  autocompleteItems,
  onClose,
  onInputChange,
  onSend,
  onSelectReference,
  onRemoveRef,
  onScrollToChart,
}: AviraSidebarProps) {
  return (
    <aside
      className={`avira-sidebar ${open ? 'open' : ''}`}
      aria-label="AVIRA assistant"
      onMouseEnter={() => {
        if (open && window.innerWidth > 900) {
          document.body.style.overflow = 'hidden'
          document.body.style.paddingRight = 'var(--r-scrollbar-width, 0px)'
        }
      }}
      onMouseLeave={() => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }}
    >
      <div className="avira-sidebar-header">
        <Bot size={18} />
        <span>AVIRA</span>
        <button className="avira-close" onClick={onClose} aria-label="Close AVIRA">
          <X size={16} />
        </button>
      </div>

      <div className="avira-messages">
        {messages.map((msg, i) => {
          if (msg.role === 'ai' && msg.content === '' && typing) return null
          return (
            <div key={i} className={`msg msg-${msg.role}`}>
              {msg.role === 'ai' && (
                <div className="msg-avatar"><Bot size={14} /></div>
              )}
              <div className="msg-bubble">
                {msg.role === 'ai' ? (
                  <AviraChatMessage content={msg.content} onScrollToChart={onScrollToChart} />
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                )}
              </div>
            </div>
          )
        })}
        {typing && (messages[messages.length - 1]?.content === '' || messages[messages.length - 1]?.role !== 'ai') && (
          <div className="msg msg-ai">
            <div className="msg-avatar"><Bot size={14} /></div>
            <div className="msg-bubble msg-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {attachedRefs.length > 0 && (
        <div className="avira-ref-pills">
          {attachedRefs.map((ref) => (
            <span key={ref.id} className="avira-ref-pill">
              #{ref.id}
              <button onClick={() => onRemoveRef(ref.id)} className="avira-ref-pill-x" aria-label={`Remove ${ref.id}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="avira-input-area" style={{ position: 'relative' }}>
        {showAutocomplete && (
          <AviraAutocomplete items={autocompleteItems} onSelect={onSelectReference} />
        )}
        <textarea
          className="avira-input"
          placeholder="Ask about this report... (use # to reference)"
          value={input}
          onChange={(e) => {
            const val = e.target.value
            onInputChange(val)
            e.target.style.height = 'auto'
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
              const target = e.target as HTMLTextAreaElement
              setTimeout(() => (target.style.height = 'auto'), 0)
            }
          }}
          rows={1}
        />
        <button
          className="avira-send"
          onClick={onSend}
          disabled={!input.trim() || typing}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </aside>
  )
}
