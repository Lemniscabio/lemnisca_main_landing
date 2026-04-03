'use client'

import { useEffect, useRef, useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FlaskConical,
  TrendingUp,
  Activity,
  Clock,
  Wind,
  Pill,
  FlaskRound,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Lightbulb,
  Target,
  MessageSquare,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Bot,
  Maximize2,
  RotateCcw,
  Download,
} from 'lucide-react'
import { jnmReport, batchMeta } from '@/lib/reports/jnm-data'
import { chartRegistry } from '@/lib/reports/chart-configs'
import type { ReportData, Evidence, KPI } from '@/lib/reports/types'
import { getReferenceCatalog } from '@/lib/reports/avira-references'
import type { ReferenceItem } from '@/lib/reports/avira-references'

gsap.registerPlugin(ScrollTrigger)

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'flask-conical': FlaskConical,
  'trending-up': TrendingUp,
  'activity': Activity,
  'clock': Clock,
  'wind': Wind,
  'pill': Pill,
  'flask-round': FlaskRound,
}

const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'executive-summary', label: 'Executive Summary', icon: FileText },
  { id: 'hypotheses', label: 'Hypotheses & Analysis', icon: Lightbulb },
  { id: 'recommendations', label: 'Recommendations', icon: Target },
]

interface ChatMessage {
  role: 'user' | 'ai'
  content: string
}

const WELCOME_MSG: ChatMessage = {
  role: 'ai',
  content: 'Hello! I\'m AVIRA, your AI research assistant. Ask me anything about this fermentation analysis report — batch comparisons, growth rates, supplement effects, or recommendations.',
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n- (.+)/g, '<br/>• $1')
    .replace(/\n/g, '<br/>')
}

function resolveChartConfig(evidence: Evidence): Highcharts.Options | undefined {
  if (!evidence.chartId) return undefined
  const builder = chartRegistry[evidence.chartId]
  return builder ? builder() : undefined
}

function ReportsClient() {
  const report: ReportData = jnmReport
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [aviraOpen, setAviraOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([WELCOME_MSG])
  const [chatInput, setChatInput] = useState('')
  const [chatTyping, setChatTyping] = useState(false)
  const [attachedRefs, setAttachedRefs] = useState<{ id: string; label: string }[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteItems, setAutocompleteItems] = useState<ReferenceItem[]>([])
  const refCatalog = useRef<ReferenceItem[]>(getReferenceCatalog())
  const [expandedChart, setExpandedChart] = useState<{ evidence: Evidence; chartConfig: Highcharts.Options; rect: DOMRect } | null>(null)
  const [expandedHypotheses, setExpandedHypotheses] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set())
  const [chartKey, setChartKey] = useState(0)
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Classic scrollspy
  useEffect(() => {
    const navIds = ['overview', 'executive-summary', 'hypotheses', 'recommendations']
    const offset = 120

    const onScroll = () => {
      const scrollY = window.scrollY + offset
      const pageBottom = window.scrollY + window.innerHeight

      if (pageBottom >= document.documentElement.scrollHeight - 20) {
        setActiveSection(navIds[navIds.length - 1])
        return
      }

      let current = navIds[0]
      for (const id of navIds) {
        const el = sectionsRef.current.get(id)
        if (el && el.offsetTop <= scrollY) {
          current = id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // GSAP scroll-driven animations
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('.glass-card').forEach((card) => {
        if (card.closest('#overview')) return
        gsap.fromTo(
          card,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

      gsap.fromTo(
        '.hypothesis-list-item',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.hypotheses-list',
            start: 'top 80%',
          },
        }
      )

      gsap.fromTo(
        '.rec-card',
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.recommendations-grid',
            start: 'top 80%',
          },
        }
      )
    })

    return () => mm.revert()
  }, [])

  // Scrollbar width
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.documentElement.style.setProperty('--r-scrollbar-width', `${scrollbarWidth}px`)
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleChatSend = async () => {
    const text = chatInput.trim()
    if (!text || chatTyping) return

    setChatMessages((prev) => [...prev, { role: 'user', content: text }])
    setChatInput('')
    setChatTyping(true)
    const refs = attachedRefs.map((r) => r.id)
    setAttachedRefs([])

    // Add placeholder AI message for streaming
    setChatMessages((prev) => [...prev, { role: 'ai', content: '' }])

    try {
      const res = await fetch('/api/avira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages.slice(-20),
          question: text,
          references: refs,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setChatMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', content: `**Error:** ${err.error || 'Something went wrong. Please try again.'}` }
          return updated
        })
        setChatTyping(false)
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
          setChatMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'ai', content: current }
            return updated
          })
        }
      }
    } catch {
      setChatMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'ai', content: '**Error:** Could not reach AVIRA. Please check your connection and try again.' }
        return updated
      })
    }

    setChatTyping(false)
  }

  const handleSelectReference = (item: ReferenceItem) => {
    const newInput = chatInput.replace(/#\S*$/, '')
    setChatInput(newInput)
    setAttachedRefs((prev) => {
      if (prev.some((r) => r.id === item.id)) return prev
      return [...prev, { id: item.id, label: item.label }]
    })
    setShowAutocomplete(false)
  }

  const handleRemoveRef = (refId: string) => {
    setAttachedRefs((prev) => prev.filter((r) => r.id !== refId))
  }

  const handleAttachToAvira = (refId: string, label: string) => {
    if (!aviraOpen) {
      setSidebarCollapsed(true)
      setAviraOpen(true)
    }
    setAttachedRefs((prev) => {
      if (prev.some((r) => r.id === refId)) return prev
      return [...prev, { id: refId, label }]
    })
  }

  const handleScrollToChart = (chartId: string) => {
    const el = document.querySelector(`[data-chart-id="${chartId}"]`) as HTMLElement
      || document.getElementById(chartId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('avira-highlight')
    setTimeout(() => el.classList.remove('avira-highlight'), 2000)
  }

  function renderAIMessage(content: string): React.ReactNode {
    const parts = content.split(/(\[See:\s*[^\]]+\]\([^)]+\))/)
    return parts.map((part, i) => {
      const linkMatch = part.match(/\[See:\s*([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        const [, title, chartId] = linkMatch
        return (
          <button
            key={i}
            className="avira-chart-link"
            onClick={() => handleScrollToChart(chartId)}
          >
            {title} ↗
          </button>
        )
      }
      return <span key={i} dangerouslySetInnerHTML={{ __html: renderMarkdown(part) }} />
    })
  }

  const handleExpandChart = (evidence: Evidence, e: React.MouseEvent) => {
    const card = (e.currentTarget as HTMLElement).closest('.evidence-chart')
    if (!card) return
    const rect = card.getBoundingClientRect()
    const chartConfig = resolveChartConfig(evidence)
    if (!chartConfig) return
    setHiddenSeries(new Set())
    setChartKey(prev => prev + 1)
    setExpandedChart({ evidence, chartConfig, rect })
  }

  const handleCollapseChart = () => {
    setExpandedChart(null)
  }

  const toggleAvira = () => {
    if (!aviraOpen) {
      setSidebarCollapsed(true)
    }
    setAviraOpen(!aviraOpen)
  }

  const getExpandedChartConfig = (): Highcharts.Options | undefined => {
    if (!expandedChart?.chartConfig) return undefined
    const base = expandedChart.chartConfig

    const series = (base.series as Highcharts.SeriesOptionsType[])?.map((s) => {
      const seriesName = (s as { name?: string }).name || ''

      let shouldHide = false
      if (['B01', 'B02', 'B03', 'B04', 'B05', 'B06'].includes(seriesName)) {
        shouldHide = hiddenSeries.has(seriesName)
      } else {
        const match = seriesName.match(/^(B0[1-6])/)
        if (match) {
          shouldHide = hiddenSeries.has(match[1])
        }
      }

      const categories = Array.isArray(base.xAxis)
        ? base.xAxis[0]?.categories
        : (base.xAxis as Highcharts.XAxisOptions)?.categories

      const sData = (s as { data?: unknown[] }).data

      if (categories && sData) {
        return {
          ...s,
          visible: true,
          data: sData.map((point, index) => {
            const batchId = categories[index]
            const isHidden = batchId && hiddenSeries.has(batchId)

            if (typeof point === 'number') {
              return isHidden ? null : point
            }
            if (point && typeof point === 'object') {
              return { ...point, y: isHidden ? null : (point as any).y }
            }
            return point
          })
        }
      }

      return {
        ...s,
        visible: !shouldHide,
        events: {
          ...(s as any).events,
          legendItemClick: function (this: { name: string }, e: any) {
            const name = this.name
            const isBatch = ['B01', 'B02', 'B03', 'B04', 'B05', 'B06'].includes(name)
            const match = name.match(/^(B0[1-6])/)

            if (isBatch || match) {
              e.preventDefault()
              const batchId = match ? match[1] : name
              setHiddenSeries((prev) => {
                const next = new Set(prev)
                if (next.has(batchId)) next.delete(batchId)
                else next.add(batchId)
                return next
              })
            }
          }
        }
      } as Highcharts.SeriesOptionsType
    })

    return {
      ...base,
      chart: {
        ...(base.chart as Record<string, unknown>),
        height: 520,
      },
      legend: {
        ...base.legend,
        title: {
          text: undefined
        }
      },
      caption: {
        text: 'Click legend items above to toggle batch visibility',
        align: 'center',
        style: { color: '#94a3b8', fontSize: '11.5px', fontStyle: 'italic' }
      },
      series,
      plotOptions: {
        ...base.plotOptions,
        series: {
          ...base.plotOptions?.series,
          animation: false
        }
      }
    }
  }

  const scrollTo = (id: string) => {
    const el = sectionsRef.current.get(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setSidebarOpen(false)
    }
  }

  const registerSection = (id: string) => (el: HTMLElement | null) => {
    if (el) {
      el.setAttribute('data-section-id', id)
      sectionsRef.current.set(id, el)
    }
  }

  const renderKpiIcon = (kpi: KPI) => {
    const IconComp = kpi.icon ? ICON_MAP[kpi.icon] : Activity
    return IconComp ? <IconComp size={20} /> : null
  }

  const renderEvidence = (evidence: Evidence, idx: number) => {
    switch (evidence.type) {
      case 'chart': {
        const chartConfig = resolveChartConfig(evidence)
        if (!chartConfig) return null

        const printConfig = isExporting ? {
          ...chartConfig,
          chart: { ...(chartConfig.chart as Record<string, unknown> || {}), animation: false },
          plotOptions: {
            ...(chartConfig.plotOptions || {}),
            series: { ...(chartConfig.plotOptions?.series || {}), animation: false }
          }
        } as Highcharts.Options : chartConfig

        return (
          <div key={idx} className="evidence-chart glass-card" data-chart-id={evidence.chartId}>
            <div className="evidence-chart-header">
              <h4 className="evidence-title">{evidence.title}</h4>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {!isExporting && (
                  <button
                    className="ask-avira-btn"
                    onClick={(e) => { e.stopPropagation(); handleAttachToAvira(evidence.chartId || evidence.title, evidence.title) }}
                    aria-label={`Ask AVIRA about ${evidence.title}`}
                  >
                    <MessageSquare size={13} />
                  </button>
                )}
                {!isExporting && (
                  <button
                    className="chart-expand-pill"
                    onClick={(e) => handleExpandChart(evidence, e)}
                    aria-label="Expand chart"
                  >
                    <Maximize2 size={12} />
                    <span>Expand</span>
                  </button>
                )}
              </div>
            </div>
            <p className="evidence-desc">{evidence.description}</p>
            <div className="chart-container">
              <HighchartsReact highcharts={Highcharts} options={printConfig} />
            </div>
          </div>
        )
      }
      case 'table':
        return (
          <div key={idx} className="evidence-table glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className="evidence-title">{evidence.title}</h4>
              <button className="ask-avira-btn" onClick={() => handleAttachToAvira(evidence.title, evidence.title)} aria-label={`Ask AVIRA about ${evidence.title}`}><MessageSquare size={13} /></button>
            </div>
            <p className="evidence-desc">{evidence.description}</p>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {evidence.tableData!.headers.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evidence.tableData!.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'text':
        return (
          <div key={idx} className="evidence-text glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className="evidence-title">{evidence.title}</h4>
              <button className="ask-avira-btn" onClick={() => handleAttachToAvira(evidence.title, evidence.title)} aria-label={`Ask AVIRA about ${evidence.title}`}><MessageSquare size={13} /></button>
            </div>
            <p className="evidence-desc">{evidence.description}</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`reports-page ${aviraOpen ? 'avira-open' : ''}`}
      style={{
        '--dynamic-left': sidebarCollapsed ? '68px' : '260px',
        '--dynamic-right': aviraOpen ? '380px' : '0px'
      } as React.CSSProperties}
    >
      {/* Blurred background layer */}
      <div className="reports-bg" />

      {/* Mobile sidebar toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`reports-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
        role="navigation"
        aria-label="Report sections"
      >
        <div className="sidebar-brand">
          <a href="/" className="sidebar-logo">
            <img src="/favicon.ico" alt="Lemnisca" className="sidebar-logo-icon" />
            <span className="nav-label sidebar-logo-text">lemnisca</span>
          </a>
          <span className="sidebar-x nav-label">×</span>
          <span className="sidebar-company nav-label">{report.company.name}</span>
          <button
            className="sidebar-brand-collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((sec) => {
            const Icon = sec.icon
            return (
              <button
                key={sec.id}
                className={`sidebar-nav-item ${activeSection === sec.id ? 'active' : ''}`}
                onClick={() => scrollTo(sec.id)}
                aria-current={activeSection === sec.id ? 'true' : undefined}
                title={sidebarCollapsed ? sec.label : undefined}
              >
                <Icon size={18} />
                <span className="nav-label">{sec.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-export-btn"
            onClick={() => {
              setIsExporting(true)
              const originalTitle = document.title
              document.title = `${report.company.name}_Fermentation_Report_${new Date().toISOString().split('T')[0]}`
              setTimeout(() => {
                Highcharts.charts.forEach(chart => chart?.reflow())
                setTimeout(() => {
                  window.print()
                  document.title = originalTitle
                  setIsExporting(false)
                }, 100)
              }, 600)
            }}
            aria-label="Export report"
            title={sidebarCollapsed ? 'Export report' : undefined}
          >
            <Download size={18} />
            <span className="nav-label">Export report</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="reports-main">
        {/* Print Cover Page */}
        <div className="print-cover-page" aria-hidden={!isExporting}>
          <img src="/favicon.ico" alt="Lemnisca Logo" className="print-logo" />
          <h1 className="print-title">{report.title}</h1>
          <h2 className="print-subtitle">{report.subtitle}</h2>
          <div className="print-cover-bottom">
            <p><strong>Prepared for:</strong> {report.company.name}</p>
            <p suppressHydrationWarning><strong>Generated on:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Top navbar */}
        <header className="reports-topbar">
          <div className="topbar-left">
            <span className="topbar-report-label">{report.company.name} Report</span>
            <span className="topbar-sep">/</span>
            <span className="topbar-active-section">
              {NAV_SECTIONS.find((s) => s.id === activeSection)?.label || 'Overview'}
            </span>
          </div>
          <div className="topbar-right">
            {!aviraOpen && (
              <button
                className="avira-btn"
                onClick={toggleAvira}
                aria-label="Open AVIRA assistant"
              >
                <MessageSquare size={16} />
                <span>Ask AVIRA</span>
              </button>
            )}
          </div>
        </header>

        {/* ───── Section: Overview ───── */}
        <section className="report-section" id="overview" ref={registerSection('overview')}>
          <div className="section-header">
            <span className="section-badge">Overview</span>
            <h1 className="section-title">{report.problemStatement.heading}</h1>
          </div>

          <div className="problem-statement glass-card">
            <p>{report.problemStatement.body}</p>
          </div>

          <div className="kpi-grid">
            {report.problemStatement.kpis.map((kpi, i) => (
              <div key={i} className="kpi-card glass-card">
                <div className="kpi-icon-wrap">
                  {renderKpiIcon(kpi)}
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">{kpi.label}</span>
                  <span className="kpi-value">{kpi.value}</span>
                  <span className="kpi-subtext">
                    {kpi.trend === 'up' && <TrendingUp size={12} className="trend-up" />}
                    {kpi.subtext}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="section-subtitle">{report.subtitle}</p>
        </section>

        {/* ───── Section: Executive Summary ───── */}
        <section
          className="report-section"
          id="executive-summary"
          ref={registerSection('executive-summary')}
        >
          <div className="section-header">
            <span className="section-badge">Executive Summary</span>
            <h2 className="section-title">{report.executiveSummary.heading}</h2>
          </div>

          <div className="exec-summary glass-card">
            <ul className="exec-bullets">
              {report.executiveSummary.bullets.map((bullet, i) => (
                <li key={i} className="exec-bullet">
                  <span className="bullet-dot" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───── Section: Hypotheses & Analysis ───── */}
        <section className="report-section" id="hypotheses" ref={registerSection('hypotheses')}>
          <div className="section-header">
            <span className="section-badge">Hypotheses & Analysis</span>
            <h2 className="section-title">Investigation Framework</h2>
            <p className="section-desc">
              Seven hypotheses were derived from the fermentation data to systematically investigate
              inter-batch variability and identify process optimization opportunities. Click to expand and view evidence.
            </p>
          </div>

          <div className="hypotheses-list">
            {report.hypotheses.map((h, i) => {
              const isExpanded = isExporting || expandedHypotheses.has(h.id)
              return (
                <div key={h.id} className={`hypothesis-accordion ${isExpanded ? 'expanded' : ''}`}>
                  <button
                    className="hypothesis-list-item glass-card"
                    onClick={() => {
                      setExpandedHypotheses((prev) => {
                        const next = new Set(prev)
                        if (next.has(h.id)) next.delete(h.id)
                        else next.add(h.id)
                        return next
                      })
                    }}
                    id={`hypothesis-accordion-${h.id}`}
                  >
                    <div className="hyp-index">H{i + 1}</div>
                    <div className="hyp-content">
                      <h3 className="hyp-title">{h.title}</h3>
                      <p className="hyp-desc">{h.description}</p>
                    </div>
                    <ChevronRight size={18} className="hyp-arrow" />
                  </button>

                  {isExpanded && (
                    <div className="hypothesis-expanded-content">
                      <div className={`analysis-section ${i % 2 === 0 ? 'layout-lr' : 'layout-rl'}`}>
                        <div className="analysis-text">
                          <div className="analysis-header">
                            <span className="analysis-badge">H{i + 1} Evidence</span>
                          </div>
                          <div className="analysis-summary glass-card">
                            <strong>Finding:</strong> {h.verdictSummary}
                          </div>

                          {h.evidence
                            .filter((e) => e.type === 'text' || e.type === 'table')
                            .map((e, idx) => renderEvidence(e, idx))}
                        </div>

                        <div className="analysis-visual">
                          {h.evidence
                            .filter((e) => e.type === 'chart')
                            .map((e, idx) => renderEvidence(e, idx))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ───── Section: Recommendations ───── */}
        <section
          className="report-section"
          id="recommendations"
          ref={registerSection('recommendations')}
        >
          <div className="section-header">
            <span className="section-badge">Next Steps</span>
            <h2 className="section-title">Recommended Optimized Next Run</h2>
            <p className="section-desc">
              Combining the best elements from each batch into an optimized process strategy.
            </p>
          </div>

          <div className="recommendations-grid">
            {report.recommendations.map((rec, i) => {
              const Icon = ICON_MAP[rec.icon] || FlaskConical
              return (
                <div key={i} className="rec-card glass-card">
                  <div className="rec-icon-wrap">
                    <Icon size={24} />
                  </div>
                  <div className="rec-source">{rec.source}</div>
                  <h3 className="rec-title">{rec.title}</h3>
                  <p className="rec-desc">{rec.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="reports-footer">
          <p>&copy; {new Date().getFullYear()} Lemnisca. All rights reserved.</p>
        </footer>
      </main>

      {/* ───── Expanded Chart Overlay ───── */}
      {expandedChart && (
        <>
          <div className="chart-overlay-backdrop" onClick={handleCollapseChart} />
          <div className="chart-expanded glass-card">
            <div className="chart-expanded-header">
              <h3 className="chart-expanded-title">{expandedChart.evidence.title}</h3>
              <div className="chart-expanded-controls">
                <button className="chart-close-btn" onClick={handleCollapseChart} aria-label="Close expanded chart">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="chart-expanded-body">
              <HighchartsReact key={chartKey} highcharts={Highcharts} options={getExpandedChartConfig()} />
            </div>
            <div className="chart-expanded-footer">
              <div className="chart-footer-left">
                <p className="chart-expanded-desc">{expandedChart.evidence.description}</p>
                {expandedChart.chartConfig?.series && !(expandedChart.chartConfig.series as any[])?.some(s =>
                  ['B01','B02','B03','B04','B05','B06'].includes(s.name)
                ) && (
                  <div className="batch-toggles mini">
                    <span className="batch-toggles-label">Filter:</span>
                    {batchMeta.map((b) => (
                      <button
                        key={b.id}
                        className={`batch-toggle ${hiddenSeries.has(b.id) ? 'off' : ''}`}
                        style={{ '--batch-color': b.color } as React.CSSProperties}
                        onClick={() => {
                          setHiddenSeries((prev) => {
                            const next = new Set(prev)
                            if (next.has(b.id)) next.delete(b.id)
                            else next.add(b.id)
                            return next
                          })
                          setChartKey(k => k + 1)
                        }}
                      >
                        <span className="batch-toggle-dot" />
                        {b.id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="chart-reset-btn"
                onClick={() => { setHiddenSeries(new Set()); setChartKey(k => k + 1) }}
                disabled={hiddenSeries.size === 0}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ───── AVIRA Right Sidebar ───── */}
      <aside
        className={`avira-sidebar ${aviraOpen ? 'open' : ''}`}
        aria-label="AVIRA assistant"
        onMouseEnter={() => {
          if (aviraOpen && window.innerWidth > 900) {
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
          <button className="avira-close" onClick={() => setAviraOpen(false)} aria-label="Close AVIRA">
            <X size={16} />
          </button>
        </div>

        <div className="avira-messages">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`msg msg-${msg.role}`}>
              {msg.role === 'ai' && (
                <div className="msg-avatar"><Bot size={14} /></div>
              )}
              <div className="msg-bubble">
                {msg.role === 'ai' ? renderAIMessage(msg.content) : (
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                )}
              </div>
            </div>
          ))}
          {chatTyping && (
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

        <div className="avira-input-area" style={{ position: 'relative' }}>
          {showAutocomplete && (
            <div className="avira-autocomplete">
              {autocompleteItems.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  className="avira-autocomplete-item"
                  onClick={() => handleSelectReference(item)}
                >
                  <span className={`avira-ref-cat avira-ref-cat-${item.category}`}>{item.category}</span>
                  <span className="avira-autocomplete-label">{item.label}</span>
                </button>
              ))}
            </div>
          )}
          {attachedRefs.length > 0 && (
            <div className="avira-ref-pills">
              {attachedRefs.map((ref) => (
                <span key={ref.id} className="avira-ref-pill">
                  #{ref.id}
                  <button onClick={() => handleRemoveRef(ref.id)} className="avira-ref-pill-x" aria-label={`Remove ${ref.id}`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <textarea
            className="avira-input"
            placeholder="Ask about this report... (use # to reference)"
            value={chatInput}
            onChange={(e) => {
              const val = e.target.value
              setChatInput(val)
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`

              // # autocomplete detection
              const hashMatch = val.match(/#(\S*)$/)
              if (hashMatch) {
                const filter = hashMatch[1].toLowerCase()
                const filtered = refCatalog.current.filter(
                  (item) =>
                    item.id.toLowerCase().includes(filter) ||
                    item.label.toLowerCase().includes(filter)
                )
                setAutocompleteItems(filtered)
                setShowAutocomplete(filtered.length > 0)
              } else {
                setShowAutocomplete(false)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleChatSend()
                const target = e.target as HTMLTextAreaElement
                setTimeout(() => target.style.height = 'auto', 0)
              }
            }}
            rows={1}
          />
          <button
            className="avira-send"
            onClick={handleChatSend}
            disabled={!chatInput.trim() || chatTyping}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </aside>
    </div>
  )
}

export default ReportsClient
