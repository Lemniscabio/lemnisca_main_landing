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

// ─── Helper: compute reactor volume V(t) for a batch ─────────────────────────
// V(t) = batchMediumVol + cumulative feed + supplements (added at known times) − sampling (~3mL per timepoint)
// For B01–B03 feed is mL/L/h (volume-specific), for B04–B06 feed is mL/h (absolute)
function computeVolumeTimeSeries(batchId: string): [number, number][] {
  const meta = batchMeta.find((b) => b.id === batchId)!
  const data = batchData[batchId]
  const points: [number, number][] = []
  let cumulativeFeed = 0
  const SAMPLE_VOL = 3 // mL per sampling event

  // Supplement additions — simplified: spread evenly or at known times
  // B04: 520mL AA+YNB at ~12h, 9×50mL tocopherol spread across run
  // B05: 200mL tocopherol spread, 200mL IPM at 24h
  // B06: 200mL tocopherol spread, 200mL IPM at 24h, 90mL glucose pulse at ~90h
  const totalSupp = meta.supplementVol
  const suppPerInterval = data.length > 1 ? totalSupp / (data.length - 1) : 0
  let cumulativeSupp = 0

  for (let i = 0; i < data.length; i++) {
    if (i > 0) {
      const dt = data[i].time - data[i - 1].time
      const fr = data[i - 1].feedRate ?? 0
      if (meta.id.match(/B0[123]/)) {
        // mL/L/h → need to multiply by current volume in L
        const prevVol = points[i - 1][1]
        cumulativeFeed += fr * (prevVol / 1000) * dt
      } else {
        // mL/h → absolute
        cumulativeFeed += fr * dt
      }
      cumulativeSupp += suppPerInterval
    }
    const samplingLoss = i * SAMPLE_VOL
    const vol = meta.batchMediumVol + cumulativeFeed + cumulativeSupp - samplingLoss
    points.push([data[i].time, parseFloat(vol.toFixed(1))])
  }
  return points
}

export function makeReactorVolumeChart(): Highcharts.Options {
  const series: Highcharts.SeriesOptionsType[] = BATCH_IDS.map((id) => {
    const meta = batchMeta.find((b) => b.id === id)!
    return {
      type: 'line' as const,
      name: id,
      color: meta.color,
      data: computeVolumeTimeSeries(id),
    }
  })

  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'Reactor Volume (mL)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series,
  }
}

export function makeTotalDCWMassChart(): Highcharts.Options {
  const series: Highcharts.SeriesOptionsType[] = BATCH_IDS.map((id) => {
    const meta = batchMeta.find((b) => b.id === id)!
    const volSeries = computeVolumeTimeSeries(id)
    const data = batchData[id]
    const massData: [number, number][] = data.map((d, i) => {
      const dcwGperL = (0.25 * d.wcw) / 3 // g/L (DCW = 0.25 × WCW, WCW is mg/3mL → g/L)
      const volL = volSeries[i][1] / 1000
      const totalMassG = dcwGperL * volL
      return [d.time, parseFloat(totalMassG.toFixed(2))]
    })
    return {
      type: 'line' as const,
      name: id,
      color: meta.color,
      data: massData,
    }
  })

  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'Total DCW Mass (g)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series,
  }
}

export function makePO2MuDualAxisChart(): Highcharts.Options {
  // Dual-axis: pO₂ (left) + μ (right) per batch — only batches with pO₂ data
  const batchesWithPO2 = BATCH_IDS.filter((id) =>
    batchData[id].some((d) => d.po2 !== null)
  )
  const series: Highcharts.SeriesOptionsType[] = []

  batchesWithPO2.forEach((id) => {
    const meta = batchMeta.find((b) => b.id === id)!
    const data = batchData[id]

    // pO₂ series (yAxis 0)
    series.push({
      type: 'line' as const,
      name: `${id} pO₂`,
      color: meta.color,
      data: data.filter((d) => d.po2 !== null).map((d) => [d.time, d.po2 as number]),
      yAxis: 0,
      lineWidth: 2,
    })

    // μ series (yAxis 1)
    const muData: [number, number][] = []
    for (let i = 1; i < data.length; i++) {
      const dt = data[i].time - data[i - 1].time
      if (dt > 0 && data[i].od600 > 0 && data[i - 1].od600 > 0) {
        const mu = (Math.log(data[i].od600) - Math.log(data[i - 1].od600)) / dt
        muData.push([data[i].time, parseFloat(mu.toFixed(4))])
      }
    }
    series.push({
      type: 'line' as const,
      name: `${id} μ`,
      color: meta.color,
      dashStyle: 'Dash' as Highcharts.DashStyleValue,
      data: muData,
      yAxis: 1,
      lineWidth: 1.5,
    })
  })

  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: [
      {
        title: { text: 'pO₂ (% saturation)', style: { color: '#64748b', fontSize: '12px' } },
        labels: { style: { color: '#64748b', fontSize: '11px' } },
        gridLineColor: 'rgba(0, 0, 0, 0.04)',
        min: 0,
      },
      {
        title: { text: 'μ (h⁻¹)', style: { color: '#64748b', fontSize: '12px' } },
        labels: { style: { color: '#64748b', fontSize: '11px' } },
        gridLineColor: 'transparent',
        opposite: true,
      },
    ],
    series,
  }
}

export function makeFullCarbonBalanceChart(): Highcharts.Options {
  // Grouped bar: total glucose fed vs theoretical max DCW vs actual DCW per batch
  const GLUCOSE_CONC = 500 // g/L — standard 50% w/v glucose feed
  const THEORETICAL_YXS_MAX = 0.48 // g DCW / g glucose — elite tier

  const categories: string[] = []
  const glucoseIn: { y: number; color: string }[] = []
  const theoreticalDCW: { y: number; color: string }[] = []
  const actualDCW: { y: number; color: string }[] = []

  BATCH_IDS.forEach((id) => {
    const meta = batchMeta.find((b) => b.id === id)!
    const totalGlucoseG = (meta.totalFeedVol / 1000) * GLUCOSE_CONC // g
    const volSeries = computeVolumeTimeSeries(id)
    const data = batchData[id]
    const lastIdx = data.length - 1
    const finalDcwGperL = (0.25 * data[lastIdx].wcw) / 3
    const finalVolL = volSeries[lastIdx][1] / 1000
    const actualDcwG = finalDcwGperL * finalVolL
    const theoreticalMaxG = totalGlucoseG * THEORETICAL_YXS_MAX

    categories.push(id)
    glucoseIn.push({ y: parseFloat(totalGlucoseG.toFixed(1)), color: '#94a3b8' })
    theoreticalDCW.push({ y: parseFloat(theoreticalMaxG.toFixed(1)), color: '#22c55e' })
    actualDCW.push({ y: parseFloat(actualDcwG.toFixed(1)), color: meta.color })
  })

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
      categories,
    },
    yAxis: {
      title: { text: 'Mass (g)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series: [
      {
        type: 'column' as const,
        name: 'Glucose Fed (g)',
        data: glucoseIn,
        borderRadius: 4,
        borderWidth: 0,
      },
      {
        type: 'column' as const,
        name: 'Theoretical Max DCW (g)',
        data: theoreticalDCW,
        borderRadius: 4,
        borderWidth: 0,
      },
      {
        type: 'column' as const,
        name: 'Actual DCW (g)',
        data: actualDCW,
        borderRadius: 4,
        borderWidth: 0,
      },
    ],
  }
}

export function makeGlucoseMassBalanceChart(): Highcharts.Options {
  // Stacked area: cumulative glucose fed over time, with consumed portion estimated from DCW growth
  const GLUCOSE_CONC = 500 // g/L
  const YXS_ASSUMED = 0.30 // average Yx/s across batches for consumed estimation

  const focusBatches = ['B04', 'B05', 'B06'] as const
  const series: Highcharts.SeriesOptionsType[] = []

  focusBatches.forEach((id) => {
    const meta = batchMeta.find((b) => b.id === id)!
    const data = batchData[id]
    const volSeries = computeVolumeTimeSeries(id)

    let cumulativeFeed = 0
    const totalGlucose: [number, number][] = []
    const consumed: [number, number][] = []

    for (let i = 0; i < data.length; i++) {
      if (i > 0) {
        const dt = data[i].time - data[i - 1].time
        const fr = data[i - 1].feedRate ?? 0
        if (id.match(/B0[123]/)) {
          const prevVol = volSeries[i - 1][1]
          cumulativeFeed += fr * (prevVol / 1000) * dt * (GLUCOSE_CONC / 1000)
        } else {
          cumulativeFeed += (fr / 1000) * dt * GLUCOSE_CONC
        }
      }
      const dcwGperL = (0.25 * data[i].wcw) / 3
      const volL = volSeries[i][1] / 1000
      const totalDcwG = dcwGperL * volL
      const glucoseConsumedG = totalDcwG / YXS_ASSUMED

      totalGlucose.push([data[i].time, parseFloat(cumulativeFeed.toFixed(1))])
      consumed.push([data[i].time, parseFloat(Math.min(glucoseConsumedG, cumulativeFeed).toFixed(1))])
    }

    series.push({
      type: 'area' as const,
      name: `${id} — Total Glucose Fed`,
      color: meta.color,
      fillOpacity: 0.15,
      data: totalGlucose,
      lineWidth: 2,
    })
    series.push({
      type: 'area' as const,
      name: `${id} — Consumed (est.)`,
      color: meta.color,
      fillOpacity: 0.4,
      dashStyle: 'Dash' as Highcharts.DashStyleValue,
      data: consumed,
      lineWidth: 1.5,
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
      title: { text: 'Glucose (g)', style: { color: '#64748b', fontSize: '12px' } },
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

export function makeODWCWRatioChart(): Highcharts.Options {
  const series: Highcharts.SeriesOptionsType[] = BATCH_IDS.map((id) => {
    const meta = batchMeta.find((b) => b.id === id)!
    const data = batchData[id]
    const ratioData: [number, number][] = data
      .filter((d) => d.wcw > 0)
      .map((d) => [d.time, parseFloat((d.od600 / d.wcw).toFixed(4))])
    return {
      type: 'line' as const,
      name: id,
      color: meta.color,
      data: ratioData,
    }
  })

  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'OD600 / WCW ratio', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series,
  }
}

// Registry: maps chart IDs to builder functions (used client-side only)
export const chartRegistry: Record<string, () => Highcharts.Options> = {
  od600: makeOD600Chart,
  wcw: makeWCWChart,
  po2: makePO2Chart,
  feedRate: makeFeedRateChart,
  growthRate: makeGrowthRateChart,
  carbonBalance: makeCarbonBalanceChart,
  supplementComparison: makeSupplementComparisonChart,
  ourDecomposition: makeOURDecompositionChart,
  reactorVolume: makeReactorVolumeChart,
  totalDCWMass: makeTotalDCWMassChart,
  po2MuDualAxis: makePO2MuDualAxisChart,
  fullCarbonBalance: makeFullCarbonBalanceChart,
  glucoseMassBalance: makeGlucoseMassBalanceChart,
  odWcwRatio: makeODWCWRatioChart,
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
