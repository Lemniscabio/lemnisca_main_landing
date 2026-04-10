'use client'

import { useState, useMemo, useCallback } from 'react'
import { useReportAnimations } from './hooks/useReportAnimations'
import { useAviraChat } from './hooks/useAviraChat'
import { useAutocomplete } from './hooks/useAutocomplete'
import { useExpandedChart } from './hooks/useExpandedChart'
import { useIdleTimeout } from './hooks/useIdleTimeout'
import { EvidenceRenderer } from './charts/EvidenceRenderer'
import { ChartExpandOverlay } from './charts/ChartExpandOverlay'
import { AviraSidebar } from './avira/AviraSidebar'
import { AnalysisLinkText } from './AnalysisLink'
import {
  FlaskConical,
  TrendingUp,
  Activity,
  Clock,
  Wind,
  Pill,
  FlaskRound,
  ChevronRight,
  MessageSquare,
  LogOut,
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

type TabId = 'overview' | 'analyses' | 'hypotheses' | 'references'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'analyses', label: 'Analyses' },
  { id: 'hypotheses', label: 'Hypotheses' },
  { id: 'references', label: 'References' },
]

interface ReportsClientProps {
  report: ReportData
  referenceCatalog: ReferenceItem[]
}

function ReportsClient({ report, referenceCatalog }: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [aviraOpen, setAviraOpen] = useState(false)
  const [aviraWidth, setAviraWidth] = useState(380)
  const chat = useAviraChat()
  const autocomplete = useAutocomplete(referenceCatalog)
  const chartRegistry = useMemo(() => createChartRegistry(report), [report])
  const chartExpand = useExpandedChart(chartRegistry, report)
  const [expandedHypotheses, setExpandedHypotheses] = useState<Set<string>>(new Set())

  const allReferences = useMemo(() => {
    if (!report.hypothesisDiscussion) return []
    const seen = new Map<string, { citation: string; description: string; usedBy: string[] }>()
    for (const h of report.hypothesisDiscussion.hypotheses) {
      for (const lit of h.literature) {
        const key = lit.citation.slice(0, 60)
        if (seen.has(key)) {
          seen.get(key)!.usedBy.push(h.id)
        } else {
          seen.set(key, { citation: lit.citation, description: lit.description, usedBy: [h.id] })
        }
      }
    }
    return Array.from(seen.values())
  }, [report.hypothesisDiscussion])

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useReportAnimations()

  const performLogout = useCallback(async (reason?: string) => {
    await fetch('/api/reports/logout', { method: 'POST' })
    window.location.href = reason
      ? `/reports/unlock?reason=${reason}`
      : '/reports/unlock'
  }, [])

  const handleIdleTimeout = useCallback(() => {
    performLogout('idle')
  }, [performLogout])

  useIdleTimeout(15 * 60 * 1000, handleIdleTimeout)

  const switchTab = useCallback((tab: TabId) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0 })
  }, [])

  const navigateToAnalysis = useCallback((analysisId: string) => {
    setActiveTab('analyses')
    setExpandedHypotheses((prev) => {
      const next = new Set(prev)
      next.add(analysisId)
      return next
    })
    setTimeout(() => {
      const el = document.getElementById(`hypothesis-accordion-${analysisId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  const handleChatSend = async () => {
    const refs = autocomplete.attachedRefs.map((r) => r.id)
    autocomplete.clearRefs()
    await chat.send(refs)
  }

  const handleSelectExamplePrompt = async (prompt: string) => {
    if (chat.typing) return
    if (!aviraOpen) setAviraOpen(true)
    const refs = autocomplete.attachedRefs.map((r) => r.id)
    autocomplete.clearRefs()
    await chat.send(refs, prompt)
  }

  const handleAttachToAvira = (refId: string, label: string) => {
    if (!aviraOpen) setAviraOpen(true)
    autocomplete.attachRef(refId, label)
  }

  const handleScrollToChart = (chartId: string) => {
    setActiveTab('analyses')

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
    }, 200)
  }

  const toggleAvira = () => {
    setAviraOpen(!aviraOpen)
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
        className={`reports-page ${aviraOpen ? 'avira-open' : ''}`}
        style={{ '--dynamic-right': aviraOpen ? `${aviraWidth}px` : '0px' } as React.CSSProperties}
      >
        <div className="reports-bg" />

        {/* Tab Header */}
        <header className="report-tab-header">
          <div className="tab-header-left">
            <a href="/" className="tab-header-logo">
              <img src="/white_bg_logo_lemnisca.svg" alt="Lemnisca" className="tab-logo-img" />
            </a>
            <span className="tab-header-sep">&times;</span>
            <span className="tab-header-company">{report.company.name}</span>
          </div>

          <nav className="tab-header-nav">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-header-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => switchTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="tab-header-right">
            {!aviraOpen && (
              <button className="avira-btn" onClick={toggleAvira} aria-label="Open AVIRA assistant">
                <MessageSquare size={16} />
                <span>Ask AVIRA</span>
              </button>
            )}
            <button className="logout-btn" onClick={() => setShowLogoutModal(true)} aria-label="Log out" title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <main className="reports-main tab-layout">
          {activeTab === 'overview' && (
            <div className="tab-panel" key="overview">
              {/* ───── Section: Overview ───── */}
              <section className="report-section" id="overview">
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
            </div>
          )}

          {activeTab === 'analyses' && (
            <div className="tab-panel" key="analyses">
              {/* ───── Section: Analyses ───── */}
              <section className="report-section" id="hypotheses">
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
                    const isExpanded = expandedHypotheses.has(a.id)
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
                                        isExporting={false}
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
                                          isExporting={false}
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
            </div>
          )}

          {activeTab === 'hypotheses' && (
            <div className="tab-panel" key="hypotheses">
              {/* ───── Section: Hypothesis Discussion ───── */}
              {report.hypothesisDiscussion && (
                <section
                  className="report-section"
                  id="hypothesis-discussion"
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

                        <p className="hd-lead">
                          <AnalysisLinkText text={h.lead} onNavigate={navigateToAnalysis} />
                        </p>

                        <div className="hd-block hd-evidence-block">
                          <h4 className="hd-block-heading">Evidence from Analysis</h4>
                          <div className="hd-evidence-list">
                            {h.evidence.map((ev, i) => (
                              <div key={i} className="hd-evidence-item">
                                <h5 className="hd-evidence-title">{ev.title}</h5>
                                {ev.body.split('\n\n').map((para, pi) => (
                                  <p key={pi} className="hd-evidence-body">
                                    <AnalysisLinkText text={para} onNavigate={navigateToAnalysis} />
                                  </p>
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
                              <li key={i}>
                                <AnalysisLinkText text={item} onNavigate={navigateToAnalysis} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === 'references' && (
            <div className="tab-panel" key="references">
              <section className="report-section">
                <div className="section-header">
                  <span className="section-badge">References</span>
                  <h2 className="section-title">Literature References</h2>
                  <p className="section-desc">
                    All literature cited across the hypothesis analyses, deduplicated.
                  </p>
                </div>

                <div className="references-list">
                  {allReferences.map((ref, i) => (
                    <div key={i} className="reference-card glass-card">
                      <div className="ref-number">{i + 1}</div>
                      <div className="ref-content">
                        <p className="ref-citation">{ref.citation}</p>
                        <p className="ref-description">{ref.description}</p>
                        <div className="ref-used-by">
                          {ref.usedBy.map((hId) => (
                            <span key={hId} className="ref-hyp-tag">{hId}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

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

        {/* ───── Logout Confirmation Modal ───── */}
        {showLogoutModal && (
          <div className="logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
            <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="logout-modal-title">Log out?</h3>
              <p className="logout-modal-desc">
                You will need to re-enter your credentials to access this report.
              </p>
              <div className="logout-modal-actions">
                <button
                  className="logout-modal-cancel"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="logout-modal-confirm"
                  onClick={() => performLogout()}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ReportsClient
