'use client'

import { useState, useCallback } from 'react'
import Highcharts from 'highcharts'
import { chartRegistry } from '@/lib/reports/chart-configs'
import type { Evidence } from '@/lib/reports/types'

export interface ExpandedChartState {
  evidence: Evidence
  chartConfig: Highcharts.Options
  rect: DOMRect
}

export function resolveChartConfig(evidence: Evidence): Highcharts.Options | undefined {
  if (!evidence.chartId) return undefined
  const builder = chartRegistry[evidence.chartId]
  return builder ? builder() : undefined
}

export function useExpandedChart() {
  const [expandedChart, setExpandedChart] = useState<ExpandedChartState | null>(null)
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set())
  const [chartKey, setChartKey] = useState(0)

  const expand = useCallback((evidence: Evidence, e: React.MouseEvent) => {
    const card = (e.currentTarget as HTMLElement).closest('.evidence-chart')
    if (!card) return
    const rect = card.getBoundingClientRect()
    const chartConfig = resolveChartConfig(evidence)
    if (!chartConfig) return
    setHiddenSeries(new Set())
    setChartKey(prev => prev + 1)
    setExpandedChart({ evidence, chartConfig, rect })
  }, [])

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
    setChartKey(k => k + 1)
  }, [])

  const resetFilters = useCallback(() => {
    setHiddenSeries(new Set())
    setChartKey(k => k + 1)
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
        if (match) {
          shouldHide = hiddenSeries.has(match[1])
        }
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

            if (typeof point === 'number') {
              return isHidden ? null : point
            }
            if (point && typeof point === 'object') {
              return { ...point, y: isHidden ? null : (point as any).y }
            }
            return point
          })
        }
      }

      return {
        ...s,
        visible: !shouldHide,
        events: {
          ...(s as any).events,
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
          }
        }
      } as Highcharts.SeriesOptionsType
    })

    return {
      ...base,
      chart: {
        ...(base.chart as Record<string, unknown>),
        height: 520,
      },
      legend: {
        ...base.legend,
        title: {
          text: undefined
        }
      },
      caption: {
        text: 'Click legend items above to toggle batch visibility',
        align: 'center',
        style: { color: '#94a3b8', fontSize: '11.5px', fontStyle: 'italic' }
      },
      series,
      plotOptions: {
        ...base.plotOptions,
        series: {
          ...base.plotOptions?.series,
          animation: false
        }
      }
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
