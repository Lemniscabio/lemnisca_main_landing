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
  const isGrid = !!expandedChart.gridConfigs && expandedChart.gridConfigs.length > 0
  const singleConfig = isGrid ? undefined : getExpandedConfig()

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
          {isGrid ? (
            <div className="chart-expanded-grid">
              {expandedChart.gridConfigs!.map((cfg, i) => (
                <div key={i} className="chart-expanded-grid-cell">
                  <HighchartsReact highcharts={Highcharts} options={cfg} />
                </div>
              ))}
            </div>
          ) : (
            <HighchartsReact key={chartKey} highcharts={Highcharts} options={singleConfig} />
          )}
        </div>
        <div className="chart-expanded-footer">
          <p className="chart-expanded-desc">{expandedChart.evidence.description}</p>
        </div>
      </div>
    </>
  )
}
