import type Highcharts from 'highcharts'
import { batchData, batchMeta } from './batch-data'

const BATCH_IDS = ['B01', 'B02', 'B03', 'B04', 'B05', 'B06'] as const

const sharedChartOptions: Partial<Highcharts.Options> = {
  chart: {
    backgroundColor: 'transparent',
    style: { fontFamily: 'Inter, sans-serif' },
    borderRadius: 12,
    animation: { duration: 800 },
  },
  credits: { enabled: false },
  legend: {
    itemStyle: { color: '#475569', fontWeight: '500', fontSize: '12px' },
    itemHoverStyle: { color: '#1e293b' },
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 4, opacity: 1, width: 16 },
    style: { fontSize: '12px', color: '#1e293b' },
    shared: true,
  },
  xAxis: {
    title: { text: 'Time (h)', style: { color: '#64748b', fontSize: '12px' } },
    labels: { style: { color: '#64748b', fontSize: '11px' } },
    gridLineColor: 'rgba(0, 0, 0, 0.04)',
    lineColor: 'rgba(0, 0, 0, 0.08)',
    tickColor: 'rgba(0, 0, 0, 0.08)',
  },
  plotOptions: {
    series: {
      animation: { duration: 1200, easing: 'easeOutQuint' },
      marker: { radius: 3, symbol: 'circle' },
      lineWidth: 2.5,
    },
  },
}

function makeSeries(
  metric: 'od600' | 'wcw' | 'po2' | 'feedRate',
  filterNull = false
): Highcharts.SeriesOptionsType[] {
  return BATCH_IDS
    .filter((id) => {
      if (!filterNull) return true
      return batchData[id].some((d) => d[metric] !== null)
    })
    .map((id) => {
      const meta = batchMeta.find((b) => b.id === id)!
      return {
        type: 'line' as const,
        name: id,
        color: meta.color,
        data: batchData[id]
          .filter((d) => d[metric] !== null)
          .map((d) => [d.time, d[metric] as number]),
      }
    })
}

export function makeOD600Chart(): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'OD600', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series: makeSeries('od600'),
  }
}

export function makeWCWChart(): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'WCW (mg/3mL)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series: makeSeries('wcw'),
  }
}

export function makePO2Chart(): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'pO₂ (% saturation)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      min: 0,
      max: 110,
      plotBands: [
        {
          from: 0,
          to: 20,
          color: 'rgba(220, 38, 38, 0.06)',
          label: {
            text: 'O₂ Limitation Zone (<20%)',
            style: { color: '#dc2626', fontSize: '10px' },
            align: 'left',
            x: 10,
          },
        },
        {
          from: 30,
          to: 50,
          color: 'rgba(22, 163, 74, 0.06)',
          label: {
            text: 'Productive Range (30–50%)',
            style: { color: '#16a34a', fontSize: '10px' },
            align: 'left',
            x: 10,
          },
        },
      ],
    },
    series: makeSeries('po2', true),
  }
}

export function makeFeedRateChart(): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'Feed Rate', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    tooltip: {
      ...sharedChartOptions.tooltip as Highcharts.TooltipOptions,
      formatter: function () {
        const ctx = this as unknown as { x: number; points?: Array<{ series: { name: string }; color: string; y: number }> }
        const points = ctx.points || []
        let s = `<b>Time: ${ctx.x}h</b><br/>`
        points.forEach((p: { series: { name: string }; color: string; y: number }) => {
          const bId = p.series.name
          const unit = bId.match(/B0[123]/) ? 'mL/L/h' : 'mL/h'
          s += `<span style="color:${p.color}">●</span> ${bId}: <b>${p.y} ${unit}</b><br/>`
        })
        return s
      },
    },
    series: makeSeries('feedRate', true),
  }
}

export function makeGrowthRateChart(): Highcharts.Options {
  // Compute μ from OD600 data (Δln(OD)/Δt as a proxy for specific growth rate)
  const series: Highcharts.SeriesOptionsType[] = BATCH_IDS.map((id) => {
    const meta = batchMeta.find((b) => b.id === id)!
    const data = batchData[id]
    const muData: [number, number][] = []
    for (let i = 1; i < data.length; i++) {
      const dt = data[i].time - data[i - 1].time
      if (dt > 0 && data[i].od600 > 0 && data[i - 1].od600 > 0) {
        const mu = (Math.log(data[i].od600) - Math.log(data[i - 1].od600)) / dt
        muData.push([data[i].time, parseFloat(mu.toFixed(4))])
      }
    }
    return {
      type: 'line' as const,
      name: id,
      color: meta.color,
      data: muData,
    }
  })

  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'μ (h⁻¹)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series,
  }
}

export function makeCarbonBalanceChart(): Highcharts.Options {
  const yields: { batch: string; yield: number; color: string }[] = [
    { batch: 'B01', yield: 0.14, color: batchMeta[0].color },
    { batch: 'B02', yield: 0.14, color: batchMeta[1].color },
    { batch: 'B03', yield: 0.25, color: batchMeta[2].color },
    { batch: 'B04', yield: 0.35, color: batchMeta[3].color },
    { batch: 'B05', yield: 0.25, color: batchMeta[4].color },
    { batch: 'B06', yield: 0.14, color: batchMeta[5].color },
  ]

  return {
    ...sharedChartOptions,
    chart: {
      ...sharedChartOptions.chart as Highcharts.ChartOptions,
      type: 'column',
    },
    title: { text: undefined },
    xAxis: {
      ...sharedChartOptions.xAxis as Highcharts.XAxisOptions,
      title: { text: undefined },
      categories: yields.map((y) => y.batch),
    },
    yAxis: {
      title: { text: 'Yx/s (g biomass / g glucose)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      max: 0.5,
      plotBands: [
        {
          from: 0.42,
          to: 0.48,
          color: 'rgba(22, 163, 74, 0.08)',
          label: { text: 'Elite (0.42–0.48)', style: { color: '#16a34a', fontSize: '10px' }, align: 'left', x: 10 },
        },
        {
          from: 0.38,
          to: 0.42,
          color: 'rgba(37, 99, 235, 0.06)',
          label: { text: 'Solid (0.38–0.42)', style: { color: '#2563eb', fontSize: '10px' }, align: 'left', x: 10 },
        },
      ],
    },
    legend: { enabled: false },
    series: [
      {
        type: 'column' as const,
        name: 'Biomass Yield (Yx/s)',
        data: yields.map((y) => ({ y: y.yield, color: y.color })),
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  }
}

export function makeSupplementComparisonChart(): Highcharts.Options {
  const data = batchMeta.map((b) => ({
    batch: b.id,
    duration: b.duration,
    finalOD: b.finalOD,
    color: b.color,
  }))

  return {
    ...sharedChartOptions,
    chart: {
      ...sharedChartOptions.chart as Highcharts.ChartOptions,
      type: 'bar',
    },
    title: { text: undefined },
    xAxis: {
      ...sharedChartOptions.xAxis as Highcharts.XAxisOptions,
      title: { text: undefined },
      categories: data.map((d) => d.batch),
    },
    yAxis: [
      {
        title: { text: 'Duration (h)', style: { color: '#64748b', fontSize: '12px' } },
        labels: { style: { color: '#64748b', fontSize: '11px' } },
        gridLineColor: 'rgba(0, 0, 0, 0.04)',
      },
      {
        title: { text: 'Final OD600', style: { color: '#64748b', fontSize: '12px' } },
        labels: { style: { color: '#64748b', fontSize: '11px' } },
        opposite: true,
        gridLineColor: 'rgba(0, 0, 0, 0.04)',
      },
    ],
    series: [
      {
        type: 'bar' as const,
        name: 'Duration (h)',
        data: data.map((d) => ({ y: d.duration, color: d.color + '99' })),
        yAxis: 0,
        borderRadius: 6,
        borderWidth: 0,
      },
      {
        type: 'bar' as const,
        name: 'Final OD600',
        data: data.map((d) => ({ y: d.finalOD, color: d.color })),
        yAxis: 1,
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  }
}

export function makeOURDecompositionChart(): Highcharts.Options {
  // Simplified OUR decomposition for B04 (best data) using Pirt equation
  // OUR = (μ / Y_XO2_max + mO₂) × X
  // mO₂ = 1.0 mmol O₂/g DCW/h, Y_XO2_max ≈ 1.5 g DCW/mmol O₂
  const mO2 = 1.0
  const Y_XO2_max = 1.5

  const focusBatches = ['B04', 'B05', 'B06'] as const
  const series: Highcharts.SeriesOptionsType[] = []

  focusBatches.forEach((id) => {
    const meta = batchMeta.find((b) => b.id === id)!
    const data = batchData[id]
    const growthOUR: [number, number][] = []
    const maintOUR: [number, number][] = []

    for (let i = 1; i < data.length; i++) {
      const dt = data[i].time - data[i - 1].time
      if (dt <= 0 || data[i].od600 <= 0 || data[i - 1].od600 <= 0) continue

      const mu = (Math.log(data[i].od600) - Math.log(data[i - 1].od600)) / dt
      const dcw = data[i].wcw * 0.25 / 1000 * 3 // rough g/L estimate
      const growthComponent = (Math.max(mu, 0) / Y_XO2_max) * dcw
      const maintComponent = mO2 * dcw

      growthOUR.push([data[i].time, parseFloat(growthComponent.toFixed(3))])
      maintOUR.push([data[i].time, parseFloat(maintComponent.toFixed(3))])
    }

    series.push({
      type: 'area' as const,
      name: `${id} — Growth`,
      color: meta.color,
      fillOpacity: 0.3,
      data: growthOUR,
      stack: id,
    })
    series.push({
      type: 'area' as const,
      name: `${id} — Maintenance`,
      color: meta.color,
      fillOpacity: 0.1,
      dashStyle: 'Dash' as Highcharts.DashStyleValue,
      data: maintOUR,
      stack: id,
    })
  })

  return {
    ...sharedChartOptions,
    chart: {
      ...sharedChartOptions.chart as Highcharts.ChartOptions,
      type: 'area',
    },
    title: { text: undefined },
    yAxis: {
      title: { text: 'OUR (mmol O₂/L/h)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    plotOptions: {
      area: {
        stacking: undefined,
        lineWidth: 2,
        marker: { radius: 2 },
      },
    },
    series,
  }
}
