'use client'

  import { useState } from 'react'
  import { MessageSquare, X } from 'lucide-react'

  export function AviraChatSidebar() {
    const [isOpen, setIsOpen] = useState(false)
    // Copy your AVIRA chat state + JSX here
    // (message input, simulated responses, toggle button)

    return (
      <>
        <button className="avira-toggle" onClick={() => setIsOpen(!isOpen)}>
          <MessageSquare size={18} /> Ask AVIRA
        </button>
        {isOpen && (
          <div className="avira-sidebar">
            <button className="avira-close" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
            {/* Your chat UI here */}
          </div>
        )}
      </>
    )
  }