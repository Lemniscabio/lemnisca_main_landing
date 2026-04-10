'use client'

import { useState, useMemo } from 'react'
import { useScrollspy } from './hooks/useScrollspy'
import { useReportAnimations } from './hooks/useReportAnimations'
import { useAviraChat } from './hooks/useAviraChat'
import { useAutocomplete } from './hooks/useAutocomplete'
import { useExpandedChart } from './hooks/useExpandedChart'
import { EvidenceRenderer } from './charts/EvidenceRenderer'
import { ChartExpandOverlay } from './charts/ChartExpandOverlay'
import { AviraSidebar } from './avira/AviraSidebar'
import Highcharts from 'highcharts'
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
  PanelLeftClose,
  PanelLeftOpen,
  Download,
} from 'lucide-react'
import type { ReportData, KPI } from '@/lib/reports/types'
import type { ReferenceItem } from '@/lib/reports/avira-references'
import { createChartRegistry } from '@/lib/reports/chart-configs'

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
  { id: 'hypotheses', label: 'Analyses', icon: Lightbulb },
  { id: 'hypothesis-discussion', label: 'Hypothesis Discussion', icon: Target },
]

const NAV_IDS = ['overview', 'executive-summary', 'hypotheses', 'hypothesis-discussion']

interface ReportsClientProps {
  report: ReportData
  referenceCatalog: ReferenceItem[]
}

function ReportsClient({ report, referenceCatalog }: ReportsClientProps) {
  const { activeSection, registerSection, scrollTo } = useScrollspy(NAV_IDS)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [aviraOpen, setAviraOpen] = useState(false)
  const [aviraWidth, setAviraWidth] = useState(380)
  const chat = useAviraChat()
  const autocomplete = useAutocomplete(referenceCatalog)
  const chartRegistry = useMemo(() => createChartRegistry(report), [report])
  const chartExpand = useExpandedChart(chartRegistry, report)
  const [expandedHypotheses, setExpandedHypotheses] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)

  useReportAnimations()

  const handleChatSend = async () => {
    const refs = autocomplete.attachedRefs.map((r) => r.id)
    autocomplete.clearRefs()
    await chat.send(refs)
  }

  const handleSelectExamplePrompt = async (prompt: string) => {
    if (chat.typing) return
    if (!aviraOpen) {
      setSidebarCollapsed(true)
      setAviraOpen(true)
    }
    const refs = autocomplete.attachedRefs.map((r) => r.id)
    autocomplete.clearRefs()
    await chat.send(refs, prompt)
  }

  const handleAttachToAvira = (refId: string, label: string) => {
    if (!aviraOpen) {
      setSidebarCollapsed(true)
      setAviraOpen(true)
    }
    autocomplete.attachRef(refId, label)
  }

  const handleScrollToChart = (chartId: string) => {
    // First, expand the analysis that contains this chart
    const parent = report.analyses.find((a) =>
      a.evidence.some((ev) => ev.chartId === chartId)
    )
    if (parent) {
      setExpandedHypotheses((prev) => {
        const next = new Set(prev)
        next.add(parent.id)
        return next
      })
    }

    // Wait for DOM to update after accordion expansion, then scroll
    setTimeout(() => {
      const el = document.querySelector(`[data-chart-id="${chartId}"]`) as HTMLElement
        || document.getElementById(chartId)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('avira-highlight')
      setTimeout(() => el.classList.remove('avira-highlight'), 2000)
    }, 150)
  }

  const toggleAvira = () => {
    if (!aviraOpen) {
      setSidebarCollapsed(true)
    }
    setAviraOpen(!aviraOpen)
  }

  const handleNavClick = (id: string) => {
    scrollTo(id)
  }

  const renderKpiIcon = (kpi: KPI) => {
    const IconComp = kpi.icon ? ICON_MAP[kpi.icon] : Activity
    return IconComp ? <IconComp size={20} /> : null
  }

  return (
    <>
    {/* Desktop-only notice for small screens */}
    <div className="desktop-only-notice">
      <div className="notice-icon">🖥️</div>
      <h2>Desktop Only</h2>
      <p>This report is optimized for desktop viewing. Please open it on a device with a screen width of at least 1024px.</p>
    </div>

    <div
      className={`reports-page ${aviraOpen ? 'avira-open' : ''} ${isExporting ? 'is-exporting' : ''}`}
      style={{
        '--dynamic-left': sidebarCollapsed ? '68px' : '260px',
        '--dynamic-right': aviraOpen ? `${aviraWidth}px` : '0px'
      } as React.CSSProperties}
    >
      {/* Blurred background layer */}
      <div className="reports-bg" />

      {/* Sidebar */}
      <aside
        className={`reports-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
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
                onClick={() => handleNavClick(sec.id)}
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
            {report.problemStatement.bullets && report.problemStatement.bullets.length > 0 && (
              <ul className="problem-bullets">
                {report.problemStatement.bullets.map((b, i) => (
                  <li key={i} className="problem-bullet">
                    <span className="problem-bullet-title">{b.title}</span>{' '}
                    <span className="problem-bullet-text">{b.text}</span>
                  </li>
                ))}
              </ul>
            )}
            {report.problemStatement.closingQuestion && (
              <p className="problem-closing">{report.problemStatement.closingQuestion}</p>
            )}
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
            {report.executiveSummary.intro && (
              <p className="exec-intro">{report.executiveSummary.intro}</p>
            )}

            {report.executiveSummary.hypotheses && report.executiveSummary.hypotheses.length > 0 ? (
              <div className="exec-hypotheses-table-wrap">
                <table className="exec-hypotheses-table">
                  <thead>
                    <tr>
                      <th>Hypothesis</th>
                      <th>Finding</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.executiveSummary.hypotheses.map((h) => (
                      <tr key={h.id}>
                        <td className="hyp-cell">
                          <span className="hyp-id">{h.id}</span>
                          <span className="hyp-name">{h.title}</span>
                        </td>
                        <td className="finding-cell">{h.finding}</td>
                        <td className="status-cell">{h.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="exec-bullets">
                {report.executiveSummary.bullets.map((bullet, i) => (
                  <li key={i} className="exec-bullet">
                    <span className="bullet-dot" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {report.executiveSummary.closing && (
              <div className="exec-closing">
                {report.executiveSummary.closing.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ───── Section: Analyses ───── */}
        <section className="report-section" id="hypotheses" ref={registerSection('hypotheses')}>
          <div className="section-header">
            <span className="section-badge">Analyses</span>
            <p className="section-desc">
              Eight analyses were derived from the fermentation data to systematically investigate
              inter-batch variability, identify process optimization opportunities, and explain the
              astaxanthin yield gap between shake flasks and fermenters. Click to expand and view evidence.
            </p>
          </div>

          <div className="hypotheses-list">
            {report.analyses.map((a, i) => {
              const isExpanded = isExporting || expandedHypotheses.has(a.id)
              return (
                <div key={a.id} className={`hypothesis-accordion ${isExpanded ? 'expanded' : ''}`}>
                  <button
                    className="hypothesis-list-item glass-card"
                    onClick={() => {
                      setExpandedHypotheses((prev) => {
                        const next = new Set(prev)
                        if (next.has(a.id)) next.delete(a.id)
                        else next.add(a.id)
                        return next
                      })
                    }}
                    id={`hypothesis-accordion-${a.id}`}
                  >
                    <div className="hyp-index">A{i + 1}</div>
                    <div className="hyp-content">
                      <h3 className="hyp-title">{a.title}</h3>
                    </div>
                    <ChevronRight size={18} className="hyp-arrow" />
                  </button>

                  {isExpanded && (() => {
                    const hasCharts = a.evidence.some((e) => e.type === 'chart')
                    return (
                      <div className="hypothesis-expanded-content">
                        <div
                          className={`analysis-section ${
                            hasCharts ? (i % 2 === 0 ? 'layout-lr' : 'layout-rl') : 'layout-single'
                          }`}
                        >
                          <div className="analysis-text">
                            <p className="analysis-description">{a.description}</p>
                            <div className="analysis-summary glass-card">
                              <strong>Finding:</strong> {a.verdictSummary}
                            </div>

                            {a.evidence
                              .filter((e) => e.type === 'text' || e.type === 'table')
                              .map((e, idx) => (
                                <EvidenceRenderer
                                  key={idx}
                                  evidence={e}
                                  idx={idx}
                                  isExporting={isExporting}
                                  resolveChartConfig={chartExpand.resolveChartConfig}
                                  onAttachToAvira={handleAttachToAvira}
                                  onExpandChart={chartExpand.expand}
                                />
                              ))}
                          </div>

                          {hasCharts && (
                            <div className="analysis-visual">
                              {a.evidence
                                .filter((e) => e.type === 'chart')
                                .map((e, idx) => (
                                  <EvidenceRenderer
                                    key={idx}
                                    evidence={e}
                                    idx={idx}
                                    isExporting={isExporting}
                                    resolveChartConfig={chartExpand.resolveChartConfig}
                                    onAttachToAvira={handleAttachToAvira}
                                    onExpandChart={chartExpand.expand}
                                  />
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        </section>

        {/* ───── Section: Hypothesis Discussion ───── */}
        {report.hypothesisDiscussion && (
          <section
            className="report-section"
            id="hypothesis-discussion"
            ref={registerSection('hypothesis-discussion')}
          >
            <div className="section-header">
              <span className="section-badge">Discussion</span>
              <h2 className="section-title">{report.hypothesisDiscussion.heading}</h2>
              <p className="section-desc">{report.hypothesisDiscussion.intro}</p>
            </div>

            <div className="hypotheses-discussion-list">
              {report.hypothesisDiscussion.hypotheses.map((h) => (
                <article key={h.id} className="hypothesis-discussion-card glass-card">
                  <header className="hd-header">
                    <span className="hd-id">{h.id}</span>
                    <div className="hd-title-wrap">
                      <h3 className="hd-title">{h.title}</h3>
                      <span className="hd-role">{h.role}</span>
                    </div>
                  </header>

                  <p className="hd-lead">{h.lead}</p>

                  <div className="hd-block hd-evidence-block">
                    <h4 className="hd-block-heading">Evidence from Analysis</h4>
                    <div className="hd-evidence-list">
                      {h.evidence.map((ev, i) => (
                        <div key={i} className="hd-evidence-item">
                          <h5 className="hd-evidence-title">{ev.title}</h5>
                          {ev.body.split('\n\n').map((para, pi) => (
                            <p key={pi} className="hd-evidence-body">{para}</p>
                          ))}
                          {ev.footnote && (
                            <p className="hd-evidence-footnote">{ev.footnote}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hd-block hd-literature-block">
                    <h4 className="hd-block-heading">Support from Literature</h4>
                    <ul className="hd-literature-list">
                      {h.literature.map((lit, i) => (
                        <li key={i} className="hd-literature-item">
                          <p className="hd-citation">{lit.citation}</p>
                          <p className="hd-citation-desc">
                            <span className="hd-arrow" aria-hidden="true">→</span>{' '}
                            {lit.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="hd-block hd-confirm-block">
                    <h4 className="hd-block-heading">What we need to confirm this</h4>
                    <ul className="hd-confirm-list">
                      {h.whatWeNeed.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

          </section>
        )}

        {/* Footer */}
        <footer className="reports-footer">
          <p>&copy; {new Date().getFullYear()} Lemnisca. All rights reserved.</p>
        </footer>
      </main>

      {/* ───── Expanded Chart Overlay ───── */}
      {chartExpand.expandedChart && (
        <ChartExpandOverlay
          expandedChart={chartExpand.expandedChart}
          chartKey={chartExpand.chartKey}
          getExpandedConfig={chartExpand.getExpandedConfig}
          onCollapse={chartExpand.collapse}
        />
      )}

      {/* ───── AVIRA Right Sidebar ───── */}
      <AviraSidebar
        open={aviraOpen}
        messages={chat.messages}
        input={chat.input}
        typing={chat.typing}
        messagesEndRef={chat.messagesEndRef}
        attachedRefs={autocomplete.attachedRefs}
        showAutocomplete={autocomplete.showAutocomplete}
        autocompleteItems={autocomplete.autocompleteItems}
        onClose={() => { setAviraOpen(false); setAviraWidth(380) }}
        onWidthChange={(w) => setAviraWidth(w)}
        onInputChange={(val) => {
          chat.setInput(val)
          autocomplete.handleInputChange(val)
        }}
        onSend={handleChatSend}
        onSelectExamplePrompt={handleSelectExamplePrompt}
        onSelectReference={(item) => {
          const newInput = autocomplete.selectReference(item, chat.input)
          chat.setInput(newInput)
        }}
        onRemoveRef={autocomplete.removeRef}
        onScrollToChart={handleScrollToChart}
      />
    </div>
    </>
  )
}

export default ReportsClient
