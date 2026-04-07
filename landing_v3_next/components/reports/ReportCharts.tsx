'use client'

import { useRef, useState, useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import type { ChartRegistry } from '@/lib/reports/chart-configs'

/**
 * Standalone single-chart renderer.
 *
 * The registry must be passed in (it's bound to a specific report instance
 * upstream — see `createChartRegistry()` in `chart-configs.ts`).
 */
export function ReportCharts({
  chartId,
  title,
  registry,
}: {
  chartId: string
  title: string
  registry: ChartRegistry
}) {
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const [expanded, setExpanded] = useState(false)

  const config = useMemo(() => {
    const builder = registry[chartId]
    return builder ? builder() : undefined
  }, [chartId, registry])

  if (!config) return null

  return (
    <>
      <div className="chart-container" onClick={() => setExpanded(true)}>
        <HighchartsReact highcharts={Highcharts} options={config} ref={chartRef} />
      </div>
      {expanded && (
        <div className="chart-modal-overlay" onClick={() => setExpanded(false)}>
          <div className="chart-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>{title}</h3>
            <HighchartsReact highcharts={Highcharts} options={config} />
            <button onClick={() => setExpanded(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
