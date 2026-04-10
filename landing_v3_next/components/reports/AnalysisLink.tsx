'use client'

import { Fragment } from 'react'

interface AnalysisLinkTextProps {
  text: string
  onNavigate: (analysisId: string) => void
}

const ANALYSIS_RE = /\b(A[1-8])\b/g

export function AnalysisLinkText({ text, onNavigate }: AnalysisLinkTextProps) {
  const parts: (string | { ref: string })[] = []
  let lastIndex = 0

  for (const match of text.matchAll(ANALYSIS_RE)) {
    const idx = match.index!
    if (idx > lastIndex) parts.push(text.slice(lastIndex, idx))
    parts.push({ ref: match[1] })
    lastIndex = idx + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))

  if (parts.length === 1 && typeof parts[0] === 'string') {
    return <>{text}</>
  }

  return (
    <>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <button
            key={i}
            type="button"
            className="analysis-xref"
            onClick={() => onNavigate(part.ref.toLowerCase())}
            title={`Go to Analysis ${part.ref}`}
          >
            {part.ref}
          </button>
        )
      )}
    </>
  )
}
