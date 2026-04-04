'use client'

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { X } from 'lucide-react'
import type { ExpandedChartState } from '../hooks/useExpandedChart'

interface ChartExpandOverlayProps {
  expandedChart: ExpandedChartState
  chartKey: number
  getExpandedConfig: () => Highcharts.Options | undefined
  onCollapse: () => void
}

export function ChartExpandOverlay({
  expandedChart,
  chartKey,
  getExpandedConfig,
  onCollapse,
}: ChartExpandOverlayProps) {
  const config = getExpandedConfig()

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
          <p className="chart-expanded-desc">{expandedChart.evidence.description}</p>
        </div>
      </div>
    </>
  )
}
