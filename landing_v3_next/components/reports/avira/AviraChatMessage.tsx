'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface AviraChatMessageProps {
  content: string
  onScrollToChart: (chartId: string) => void
}

/**
 * Renders a Gemini response as markdown, preserving structure end-to-end.
 *
 * Previously this component split the content around `[See: …](chartId)`
 * placeholders and rendered each segment in its own ReactMarkdown instance.
 * That produced ugly literal `**text**` in the output whenever a segment
 * started with indented sub-bullets, because ReactMarkdown interpreted the
 * leading 4-space indent as a code block and stopped parsing inline bold.
 *
 * The fix: render the full content as ONE markdown document and override
 * the `<a>` renderer via ReactMarkdown's `components` prop. Any anchor whose
 * href looks like a chart id (simple word token, no scheme or slashes) is
 * rendered as a "scroll to chart" button; everything else renders as a
 * normal external link.
 */
export function AviraChatMessage({ content, onScrollToChart }: AviraChatMessageProps) {
  const components: Components = {
    a({ href, children }) {
      const isChartId =
        typeof href === 'string' &&
        /^[a-zA-Z][\w-]*$/.test(href) && // word chars only
        !href.includes('/') &&
        !href.includes(':')
      if (isChartId) {
        return (
          <button
            type="button"
            className="avira-chart-link"
            onClick={() => onScrollToChart(href!)}
          >
            {children} ↗
          </button>
        )
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    },
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}
