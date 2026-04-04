'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface AviraChatMessageProps {
  content: string
  onScrollToChart: (chartId: string) => void
}

export function AviraChatMessage({ content, onScrollToChart }: AviraChatMessageProps) {
  const CHART_LINK_RE = /\[See:\s*([^\]]+)\]\(([^)]+)\)/g
  const chartLinks: { title: string; chartId: string }[] = []
  const processed = content.replace(CHART_LINK_RE, (_match, title, chartId) => {
    const idx = chartLinks.length
    chartLinks.push({ title, chartId })
    return `%%CHART_LINK_${idx}%%`
  })

  const segments = processed.split(/(%%CHART_LINK_\d+%%)/)
  return (
    <>
      {segments.map((segment, i) => {
        const placeholderMatch = segment.match(/%%CHART_LINK_(\d+)%%/)
        if (placeholderMatch) {
          const link = chartLinks[parseInt(placeholderMatch[1])]
          return (
            <button
              key={i}
              className="avira-chart-link"
              onClick={() => onScrollToChart(link.chartId)}
            >
              {link.title} ↗
            </button>
          )
        }
        if (!segment.trim()) return null
        return (
          <ReactMarkdown
            key={i}
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
          >
            {segment}
          </ReactMarkdown>
        )
      })}
    </>
  )
}
