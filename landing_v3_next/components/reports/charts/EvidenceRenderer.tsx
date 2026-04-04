'use client'

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { MessageSquare, Maximize2 } from 'lucide-react'
import type { Evidence } from '@/lib/reports/types'

interface EvidenceRendererProps {
  evidence: Evidence
  idx: number
  isExporting: boolean
  resolveChartConfig: (evidence: Evidence) => Highcharts.Options | undefined
  onAttachToAvira: (refId: string, label: string) => void
  onExpandChart: (evidence: Evidence, e: React.MouseEvent) => void
}

export function EvidenceRenderer({
  evidence,
  idx,
  isExporting,
  resolveChartConfig,
  onAttachToAvira,
  onExpandChart,
}: EvidenceRendererProps) {
  switch (evidence.type) {
    case 'chart': {
      const chartConfig = resolveChartConfig(evidence)
      if (!chartConfig) return null

      const printConfig = isExporting
        ? {
            ...chartConfig,
            chart: { ...((chartConfig.chart as Record<string, unknown>) || {}), animation: false },
            plotOptions: {
              ...(chartConfig.plotOptions || {}),
              series: { ...(chartConfig.plotOptions?.series || {}), animation: false },
            },
          } as Highcharts.Options
        : chartConfig

      return (
        <div key={idx} className="evidence-chart glass-card" data-chart-id={evidence.chartId}>
          <div className="evidence-chart-header">
            <h4 className="evidence-title">{evidence.title}</h4>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {!isExporting && (
                <button
                  className="ask-avira-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAttachToAvira(evidence.chartId || evidence.title, evidence.title)
                  }}
                  aria-label={`Ask AVIRA about ${evidence.title}`}
                >
                  <MessageSquare size={13} />
                </button>
              )}
              {!isExporting && (
                <button
                  className="chart-expand-pill"
                  onClick={(e) => onExpandChart(evidence, e)}
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
            <button
              className="ask-avira-btn"
              onClick={() => onAttachToAvira(evidence.title, evidence.title)}
              aria-label={`Ask AVIRA about ${evidence.title}`}
            >
              <MessageSquare size={13} />
            </button>
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
            <button
              className="ask-avira-btn"
              onClick={() => onAttachToAvira(evidence.title, evidence.title)}
              aria-label={`Ask AVIRA about ${evidence.title}`}
            >
              <MessageSquare size={13} />
            </button>
          </div>
          <p className="evidence-desc">{evidence.description}</p>
        </div>
      )
    default:
      return null
  }
}
