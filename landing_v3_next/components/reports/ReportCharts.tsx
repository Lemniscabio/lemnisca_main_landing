'use client'

import { useRef, useState, useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { chartRegistry } from '@/lib/reports/chart-configs'

export function ReportCharts({ chartId, title }: { chartId: string; title: string }) {
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const [expanded, setExpanded] = useState(false)

  const config = useMemo(() => {
    const builder = chartRegistry[chartId]
    return builder ? builder() : undefined
  }, [chartId])

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
