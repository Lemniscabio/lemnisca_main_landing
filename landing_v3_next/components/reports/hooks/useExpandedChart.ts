'use client'

import { useState, useCallback } from 'react'
import Highcharts from 'highcharts'
import type { ChartRegistry } from '@/lib/reports/chart-configs'
import { GRID_EXPANDED_CHART_IDS, createExpandedGridConfigs } from '@/lib/reports/chart-configs'
import type { Evidence, ReportData } from '@/lib/reports/types'

export interface ExpandedChartState {
  evidence: Evidence
  chartConfig: Highcharts.Options
  /** When set, the expanded view should render this 2×3 grid instead of the
   *  single chartConfig. Used for qsRate / ourDecomposition / kLa. */
  gridConfigs?: Highcharts.Options[]
  rect: DOMRect
}

export function useExpandedChart(registry: ChartRegistry, report: ReportData) {
  const [expandedChart, setExpandedChart] = useState<ExpandedChartState | null>(null)
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set())
  const [chartKey, setChartKey] = useState(0)

  const resolveChartConfig = useCallback(
    (evidence: Evidence): Highcharts.Options | undefined => {
      if (!evidence.chartId) return undefined
      const builder = registry[evidence.chartId]
      return builder ? builder() : undefined
    },
    [registry]
  )

  const expand = useCallback(
    (evidence: Evidence, e: React.MouseEvent) => {
      const card = (e.currentTarget as HTMLElement).closest('.evidence-chart')
      if (!card) return
      const rect = card.getBoundingClientRect()
      const chartConfig = resolveChartConfig(evidence)
      if (!chartConfig) return
      setHiddenSeries(new Set())
      setChartKey((prev) => prev + 1)

      const gridConfigs =
        evidence.chartId && GRID_EXPANDED_CHART_IDS.has(evidence.chartId)
          ? createExpandedGridConfigs(report, evidence.chartId)
          : undefined

      setExpandedChart({ evidence, chartConfig, gridConfigs, rect })
    },
    [resolveChartConfig, report]
  )

  const collapse = useCallback(() => {
    setExpandedChart(null)
  }, [])

  const toggleBatch = useCallback((batchId: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev)
      if (next.has(batchId)) next.delete(batchId)
      else next.add(batchId)
      return next
    })
    setChartKey((k) => k + 1)
  }, [])

  const resetFilters = useCallback(() => {
    setHiddenSeries(new Set())
    setChartKey((k) => k + 1)
  }, [])

  const getExpandedConfig = useCallback((): Highcharts.Options | undefined => {
    if (!expandedChart?.chartConfig) return undefined
    const base = expandedChart.chartConfig

    const series = (base.series as Highcharts.SeriesOptionsType[])?.map((s) => {
      const seriesName = (s as { name?: string }).name || ''

      let shouldHide = false
      if (['B01', 'B02', 'B03', 'B04', 'B05', 'B06'].includes(seriesName)) {
        shouldHide = hiddenSeries.has(seriesName)
      } else {
        const match = seriesName.match(/^(B0[1-6])/)
        if (match) shouldHide = hiddenSeries.has(match[1])
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
            if (typeof point === 'number') return isHidden ? null : point
            if (point && typeof point === 'object') {
              return { ...point, y: isHidden ? null : (point as { y: number | null }).y }
            }
            return point
          }),
        }
      }

      return {
        ...s,
        visible: !shouldHide,
        events: {
          ...(s as { events?: Record<string, unknown> }).events,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    })

    return {
      ...base,
      chart: {
        ...(base.chart as Record<string, unknown>),
        height: 520,
      },
      legend: {
        ...base.legend,
        title: { text: undefined },
      },
      caption: {
        text: 'Click legend items above to toggle batch visibility',
        align: 'center',
        style: { color: '#94a3b8', fontSize: '11.5px', fontStyle: 'italic' },
      },
      series,
      plotOptions: {
        ...base.plotOptions,
        series: {
          ...base.plotOptions?.series,
          animation: false,
        },
      },
    }
  }, [expandedChart, hiddenSeries])

  return {
    expandedChart,
    hiddenSeries,
    chartKey,
    expand,
    collapse,
    toggleBatch,
    resetFilters,
    getExpandedConfig,
    resolveChartConfig,
  }
}
