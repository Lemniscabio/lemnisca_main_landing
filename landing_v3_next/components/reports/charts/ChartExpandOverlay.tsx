'use client'

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { X, RotateCcw } from 'lucide-react'
import { batchMeta } from '@/lib/reports/batch-data'
import type { ExpandedChartState } from '../hooks/useExpandedChart'

interface ChartExpandOverlayProps {
  expandedChart: ExpandedChartState
  chartKey: number
  hiddenSeries: Set<string>
  getExpandedConfig: () => Highcharts.Options | undefined
  onCollapse: () => void
  onToggleBatch: (batchId: string) => void
  onReset: () => void
}

export function ChartExpandOverlay({
  expandedChart,
  chartKey,
  hiddenSeries,
  getExpandedConfig,
  onCollapse,
  onToggleBatch,
  onReset,
}: ChartExpandOverlayProps) {
  const config = getExpandedConfig()
  const hasBatchSeries = (expandedChart.chartConfig.series as any[])?.some((s: any) =>
    ['B01', 'B02', 'B03', 'B04', 'B05', 'B06'].includes(s.name)
  )

  return (
    <>
      <div className="chart-overlay-backdrop" onClick={onCollapse} />
      <div className="chart-expanded glass-card">
        <div className="chart-expanded-header">
          <h3 className="chart-expanded-title">{expandedChart.evidence.title}</h3>
          <div className="chart-expanded-controls">
            <button className="chart-close-btn" onClick={onCollapse} aria-label="Close expanded chart">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="chart-expanded-body">
          <HighchartsReact key={chartKey} highcharts={Highcharts} options={config} />
        </div>
        <div className="chart-expanded-footer">
          <div className="chart-footer-left">
            <p className="chart-expanded-desc">{expandedChart.evidence.description}</p>
            {!hasBatchSeries && (
              <div className="batch-toggles mini">
                <span className="batch-toggles-label">Filter:</span>
                {batchMeta.map((b) => (
                  <button
                    key={b.id}
                    className={`batch-toggle ${hiddenSeries.has(b.id) ? 'off' : ''}`}
                    style={{ '--batch-color': b.color } as React.CSSProperties}
                    onClick={() => onToggleBatch(b.id)}
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
            onClick={onReset}
            disabled={hiddenSeries.size === 0}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </>
  )
}
