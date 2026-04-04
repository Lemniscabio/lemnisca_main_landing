'use client'

import { useState } from 'react'
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
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
} from 'lucide-react'
import { jnmReport } from '@/lib/reports/jnm-data'
import type { ReportData, KPI } from '@/lib/reports/types'

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

const NAV_IDS = ['overview', 'executive-summary', 'hypotheses', 'recommendations']

function ReportsClient() {
  const report: ReportData = jnmReport
  const { activeSection, registerSection, scrollTo } = useScrollspy(NAV_IDS)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [aviraOpen, setAviraOpen] = useState(false)
  const [aviraWidth, setAviraWidth] = useState(380)
  const chat = useAviraChat()
  const autocomplete = useAutocomplete()
  const chartExpand = useExpandedChart()
  const [expandedHypotheses, setExpandedHypotheses] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)

  useReportAnimations()

  const handleChatSend = async () => {
    const refs = autocomplete.attachedRefs.map((r) => r.id)
    autocomplete.clearRefs()
    await chat.send(refs)
  }

  const handleAttachToAvira = (refId: string, label: string) => {
    if (!aviraOpen) {
      setSidebarCollapsed(true)
      setAviraOpen(true)
    }
    autocomplete.attachRef(refId, label)
  }

  const handleScrollToChart = (chartId: string) => {
    // First, expand the hypothesis that contains this chart
    const parentHyp = report.hypotheses.find((h) =>
      h.evidence.some((ev) => ev.chartId === chartId)
    )
    if (parentHyp) {
      setExpandedHypotheses((prev) => {
        const next = new Set(prev)
        next.add(parentHyp.id)
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
    setSidebarOpen(false)
  }

  const renderKpiIcon = (kpi: KPI) => {
    const IconComp = kpi.icon ? ICON_MAP[kpi.icon] : Activity
    return IconComp ? <IconComp size={20} /> : null
  }

  return (
    <div
      className={`reports-page ${aviraOpen ? 'avira-open' : ''} ${isExporting ? 'is-exporting' : ''}`}
      style={{
        '--dynamic-left': sidebarCollapsed ? '68px' : '260px',
        '--dynamic-right': aviraOpen ? `${aviraWidth}px` : '0px'
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

                        <div className="analysis-visual">
                          {h.evidence
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
      {chartExpand.expandedChart && (
        <ChartExpandOverlay
          expandedChart={chartExpand.expandedChart}
          chartKey={chartExpand.chartKey}
          hiddenSeries={chartExpand.hiddenSeries}
          getExpandedConfig={chartExpand.getExpandedConfig}
          onCollapse={chartExpand.collapse}
          onToggleBatch={chartExpand.toggleBatch}
          onReset={chartExpand.resetFilters}
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
        onSelectReference={(item) => {
          const newInput = autocomplete.selectReference(item, chat.input)
          chat.setInput(newInput)
        }}
        onRemoveRef={autocomplete.removeRef}
        onScrollToChart={handleScrollToChart}
      />
    </div>
  )
}

export default ReportsClient
