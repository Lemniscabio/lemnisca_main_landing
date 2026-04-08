import type Highcharts from 'highcharts'
import type { ReportData, BatchMeta, BatchDataPoint } from './types'
import {
  YIELD_TIER_ELITE,
  YIELD_TIER_SOLID,
  PO2_PRODUCTIVE_PCT,
  CRABTREE_QS_GGH,
  QS_STARVATION_GGH,
  YXS_THEORETICAL,
} from './jnm/constants'

/**
 * Chart builders for the Jananom report.
 *
 * RULES:
 * 1. No raw values are recomputed in JavaScript. All numerical chart series
 *    read directly from columns of `processed_batch_data.csv` (already baked
 *    into `report.batchData` by the ingestion script).
 * 2. Builders take batch data + meta as parameters — no module-level data
 *    imports. Use `createChartRegistry(report)` to get a registry bound to a
 *    specific report instance.
 */

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function metaOf(meta: BatchMeta[], id: string): BatchMeta | undefined {
  return meta.find((b) => b.id === id)
}

function pointsToSeries(
  points: BatchDataPoint[],
  field: keyof BatchDataPoint
): [number, number][] {
  return points
    .filter((p) => {
      const v = p[field]
      return v !== null && v !== undefined && Number.isFinite(v as number)
    })
    .map((p) => [p.time, p[field] as number])
}

/** Build one line series per batch reading a single numeric field. */
function makeOverlaySeries(
  report: ReportData,
  field: keyof BatchDataPoint
): Highcharts.SeriesOptionsType[] {
  return BATCH_IDS.map((id) => {
    const meta = metaOf(report.batchMeta, id)
    if (!meta) return null
    const data = pointsToSeries(report.batchData[id] || [], field)
    if (data.length === 0) return null
    return {
      type: 'line' as const,
      name: id,
      color: meta.color,
      data,
    }
  }).filter(Boolean) as Highcharts.SeriesOptionsType[]
}

// ─── Overlay charts (all batches on one axes) ────────────────────────────────

function makeOD600Chart(report: ReportData): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'OD600', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series: makeOverlaySeries(report, 'od600'),
  }
}

function makeWCWChart(report: ReportData): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'WCW (mg/3mL)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series: makeOverlaySeries(report, 'wcw'),
  }
}

function makePO2Chart(report: ReportData): Highcharts.Options {
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
          from: 0, to: 20,
          color: 'rgba(220, 38, 38, 0.06)',
          label: { text: 'O₂ Limitation Zone (<20%)', style: { color: '#dc2626', fontSize: '10px' }, align: 'left', x: 10 },
        },
        {
          from: PO2_PRODUCTIVE_PCT[0], to: PO2_PRODUCTIVE_PCT[1],
          color: 'rgba(22, 163, 74, 0.06)',
          label: { text: `Productive Range (${PO2_PRODUCTIVE_PCT[0]}–${PO2_PRODUCTIVE_PCT[1]}%)`, style: { color: '#16a34a', fontSize: '10px' }, align: 'left', x: 10 },
        },
      ],
    },
    series: makeOverlaySeries(report, 'po2'),
  }
}

function makeFeedRateChart(report: ReportData): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'Feed Rate', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    tooltip: {
      ...(sharedChartOptions.tooltip as Highcharts.TooltipOptions),
      formatter: function () {
        const ctx = this as unknown as { x: number; points?: Array<{ series: { name: string }; color: string; y: number }> }
        const points = ctx.points || []
        let s = `<b>Time: ${ctx.x}h</b><br/>`
        points.forEach((p) => {
          const bId = p.series.name
          const unit = bId.match(/B0[123]/) ? 'mL/L/h' : 'mL/h'
          s += `<span style="color:${p.color}">●</span> ${bId}: <b>${p.y} ${unit}</b><br/>`
        })
        return s
      },
    },
    series: makeOverlaySeries(report, 'feedRate'),
  }
}

function makeReactorVolumeChart(report: ReportData): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'Reactor Volume (mL)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series: makeOverlaySeries(report, 'volumeMl'),
  }
}

function makeDcwConcentrationChart(report: ReportData): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'DCW (g/L)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series: makeOverlaySeries(report, 'dcwGperL'),
  }
}

function makeTotalDCWMassChart(report: ReportData): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'Total DCW Mass (g)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series: makeOverlaySeries(report, 'dcwMassG'),
  }
}

function makeODWCWRatioChart(report: ReportData): Highcharts.Options {
  return {
    ...sharedChartOptions,
    title: { text: undefined },
    yAxis: {
      title: { text: 'OD600 / WCW ratio', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series: makeOverlaySeries(report, 'odWcwRatio'),
  }
}

// ─── Per-batch column charts ─────────────────────────────────────────────────

function makeCarbonBalanceChart(report: ReportData): Highcharts.Options {
  return {
    ...sharedChartOptions,
    chart: { ...(sharedChartOptions.chart as Highcharts.ChartOptions), type: 'column' },
    title: { text: undefined },
    xAxis: {
      ...(sharedChartOptions.xAxis as Highcharts.XAxisOptions),
      title: { text: undefined },
      categories: report.batchMeta.map((b) => b.id),
    },
    yAxis: {
      title: { text: 'Yx/s (g biomass / g glucose)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      max: 0.5,
      plotBands: [
        {
          from: YIELD_TIER_ELITE[0], to: YIELD_TIER_ELITE[1],
          color: 'rgba(22, 163, 74, 0.08)',
          label: { text: `Elite (${YIELD_TIER_ELITE[0]}–${YIELD_TIER_ELITE[1]})`, style: { color: '#16a34a', fontSize: '10px' }, align: 'left', x: 10 },
        },
        {
          from: YIELD_TIER_SOLID[0], to: YIELD_TIER_SOLID[1],
          color: 'rgba(37, 99, 235, 0.06)',
          label: { text: `Solid (${YIELD_TIER_SOLID[0]}–${YIELD_TIER_SOLID[1]})`, style: { color: '#2563eb', fontSize: '10px' }, align: 'left', x: 10 },
        },
      ],
    },
    series: [
      {
        type: 'column' as const,
        name: 'Biomass Yield (Yx/s)',
        data: report.batchMeta.map((b) => ({ y: b.biomassYield, color: b.color })),
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  }
}

function makeFullCarbonBalanceChart(report: ReportData): Highcharts.Options {
  // Glucose fed: read directly from the last Cumul_Glucose_Fed_g of each batch.
  // Theoretical max: glucose × YXS_THEORETICAL.
  // Actual: final DCW_mass_g.
  const categories: string[] = []
  const glucoseIn: number[] = []
  const theoreticalDCW: number[] = []
  const actualDCW: number[] = []

  for (const meta of report.batchMeta) {
    const points = report.batchData[meta.id] || []
    const last = points[points.length - 1]
    const totalGlucose = last?.cumulGlucoseFedG ?? 0
    categories.push(meta.id)
    glucoseIn.push(parseFloat(totalGlucose.toFixed(1)))
    theoreticalDCW.push(parseFloat((totalGlucose * YXS_THEORETICAL).toFixed(1)))
    actualDCW.push(parseFloat((meta.finalDcwMassG ?? 0).toFixed(1)))
  }

  return {
    ...sharedChartOptions,
    chart: { ...(sharedChartOptions.chart as Highcharts.ChartOptions), type: 'column' },
    title: { text: undefined },
    xAxis: {
      ...(sharedChartOptions.xAxis as Highcharts.XAxisOptions),
      title: { text: undefined },
      categories,
    },
    yAxis: {
      title: { text: 'Mass (g)', style: { color: '#64748b', fontSize: '12px' } },
      labels: { style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
    },
    series: [
      { type: 'column' as const, name: 'Glucose Fed (g)',         color: '#94a3b8', data: glucoseIn,      borderRadius: 4, borderWidth: 0 },
      { type: 'column' as const, name: 'Theoretical Max DCW (g)', color: '#22c55e', data: theoreticalDCW, borderRadius: 4, borderWidth: 0 },
      { type: 'column' as const, name: 'Actual DCW (g)',          color: '#f59e0b', data: actualDCW,      borderRadius: 4, borderWidth: 0 },
    ],
  }
}

function makeSupplementComparisonChart(report: ReportData): Highcharts.Options {
  return {
    ...sharedChartOptions,
    chart: { ...(sharedChartOptions.chart as Highcharts.ChartOptions), type: 'bar' },
    title: { text: undefined },
    xAxis: {
      ...(sharedChartOptions.xAxis as Highcharts.XAxisOptions),
      title: { text: undefined },
      categories: report.batchMeta.map((b) => b.id),
    },
    yAxis: [
      {
        title: { text: 'Duration (h)', style: { color: '#64748b', fontSize: '12px' } },
        labels: { style: { color: '#64748b', fontSize: '11px' } },
        gridLineColor: 'rgba(0, 0, 0, 0.04)',
      },
      {
        title: { text: 'Total DCW Mass (g)', style: { color: '#64748b', fontSize: '12px' } },
        labels: { style: { color: '#64748b', fontSize: '11px' } },
        opposite: true,
        gridLineColor: 'rgba(0, 0, 0, 0.04)',
      },
    ],
    series: [
      {
        type: 'bar' as const,
        name: 'Duration (h)',
        color: '#60a5fa',
        data: report.batchMeta.map((b) => b.durationH ?? 0),
        yAxis: 0,
        borderRadius: 6,
        borderWidth: 0,
      },
      {
        type: 'bar' as const,
        name: 'Total DCW Mass (g)',
        color: '#f59e0b',
        data: report.batchMeta.map((b) => b.finalDcwMassG ?? 0),
        yAxis: 1,
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  }
}

// ─── Small-multiples (per-batch panels) ──────────────────────────────────────
//
// Highcharts doesn't natively render panel grids in a single chart instance
// without `multipane`. Rather than pull in another module, we render small
// multiples as a single chart with panes — one Y-axis per batch — using the
// stacked-pane Highcharts pattern (each series bound to its own yAxis index).

function makeSmallMultiples(
  report: ReportData,
  field: keyof BatchDataPoint,
  yTitle: string,
  opts: { plotBands?: Highcharts.YAxisPlotBandsOptions[]; secondField?: keyof BatchDataPoint; secondTitle?: string } = {}
): Highcharts.Options {
  const visibleBatches = BATCH_IDS.filter((id) => {
    const points = report.batchData[id] || []
    return points.some((p) => {
      const v = p[field]
      return v !== null && v !== undefined && Number.isFinite(v as number)
    })
  })

  const PANE_HEIGHT = 100 / visibleBatches.length // % of total
  const PANE_GAP = 4 // %

  const yAxis: Highcharts.YAxisOptions[] = []
  const series: Highcharts.SeriesOptionsType[] = []

  visibleBatches.forEach((id, i) => {
    const meta = metaOf(report.batchMeta, id)!
    const top = i * PANE_HEIGHT
    const height = PANE_HEIGHT - PANE_GAP

    yAxis.push({
      title: { text: `${id} — ${yTitle}`, style: { color: meta.color, fontSize: '10px', fontWeight: '600' } },
      labels: { style: { color: '#64748b', fontSize: '10px' } },
      top: `${top}%`,
      height: `${height}%`,
      offset: 0,
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      plotBands: opts.plotBands,
    } as Highcharts.YAxisOptions)

    const points = report.batchData[id] || []
    series.push({
      type: 'line' as const,
      name: id,
      color: meta.color,
      data: pointsToSeries(points, field),
      yAxis: i,
      lineWidth: 2,
      // Force markers on regardless of viewport. Highcharts' auto rule
      // (enabled when avg pixel spacing > enabledThreshold) flips state
      // unpredictably for low-point-count series like B04 (~13 points)
      // when the chart is resized.
      marker: { enabled: true, radius: 3, symbol: 'circle' },
    })

    if (opts.secondField) {
      series.push({
        type: 'line' as const,
        name: `${id} ${opts.secondTitle ?? ''}`,
        color: meta.color,
        dashStyle: 'Dash' as Highcharts.DashStyleValue,
        data: pointsToSeries(points, opts.secondField),
        yAxis: i,
        lineWidth: 1.5,
        marker: { enabled: true, radius: 2.5, symbol: 'circle' },
      })
    }
  })

  return {
    ...sharedChartOptions,
    chart: {
      ...(sharedChartOptions.chart as Highcharts.ChartOptions),
      height: 120 * visibleBatches.length,
    },
    title: { text: undefined },
    legend: { enabled: false },
    yAxis,
    series,
  }
}

function makeGrowthRateChart(report: ReportData): Highcharts.Options {
  return makeSmallMultiples(report, 'muSmooth', 'μ (h⁻¹)', {
    plotBands: [{ from: 0, to: 0, color: 'rgba(0,0,0,0.15)' } as Highcharts.YAxisPlotBandsOptions],
  })
}

function makeQsRateChart(report: ReportData): Highcharts.Options {
  // Per-batch small multiples for specific glucose feed rate (qs).
  //
  // Two corrections vs the generic small-multiples helper:
  //   1. The toolkit reports qs = 0 during the pre-feed batch phase. We skip
  //      those points (along with any nulls) so the line starts at the first
  //      real qs value rather than drawing a flat line at 0 then a vertical
  //      jump when feeding begins.
  //   2. Zone colors per the deck:
  //        qs > 0.25         → red    (Crabtree overflow)
  //        0.12 ≤ qs ≤ 0.20  → green  (best range)
  //        qs < 0.10         → white  (starvation, no shading)

  const visibleBatches = BATCH_IDS.filter((id) =>
    (report.batchData[id] || []).some(
      (p) => p.qs !== null && Number.isFinite(p.qs) && (p.qs as number) > 0
    )
  )

  const PANE_HEIGHT = 100 / visibleBatches.length
  const PANE_GAP = 4
  const yAxis: Highcharts.YAxisOptions[] = []
  const series: Highcharts.SeriesOptionsType[] = []

  visibleBatches.forEach((id, i) => {
    const meta = metaOf(report.batchMeta, id)!
    const points = report.batchData[id] || []
    const top = i * PANE_HEIGHT
    const height = PANE_HEIGHT - PANE_GAP

    yAxis.push({
      title: {
        text: `${id} — qs (g/g/h)`,
        style: { color: '#475569', fontSize: '10px', fontWeight: '600' },
      },
      labels: { style: { color: '#64748b', fontSize: '10px' } },
      top: `${top}%`,
      height: `${height}%`,
      offset: 0,
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      min: 0,
      plotBands: [
        // Crabtree (red)
        {
          from: CRABTREE_QS_GGH,
          to: 10,
          color: 'rgba(220, 38, 38, 0.10)',
          label: {
            text: `Crabtree (>${CRABTREE_QS_GGH})`,
            style: { color: '#dc2626', fontSize: '9px' },
            align: 'right',
            x: -8,
          },
        },
        // Best range (green)
        {
          from: 0.12,
          to: 0.20,
          color: 'rgba(22, 163, 74, 0.14)',
          label: {
            text: 'Best (0.12–0.20)',
            style: { color: '#16a34a', fontSize: '9px' },
            align: 'right',
            x: -8,
          },
        },
        // Starvation zone left intentionally unshaded (white)
      ],
    } as Highcharts.YAxisOptions)

    // Skip qs == 0 (batch phase, no feed) and nulls so the line starts at
    // the first real qs measurement.
    const data: [number, number][] = points
      .filter((p) => p.qs !== null && Number.isFinite(p.qs) && (p.qs as number) > 0)
      .map((p) => [p.time, p.qs as number])

    series.push({
      type: 'line' as const,
      name: id,
      color: meta.color,
      data,
      yAxis: i,
      lineWidth: 2,
    })
  })

  return {
    ...sharedChartOptions,
    chart: {
      ...(sharedChartOptions.chart as Highcharts.ChartOptions),
      height: 130 * visibleBatches.length,
    },
    title: { text: undefined },
    legend: { enabled: false },
    yAxis,
    series,
  }
}

function makePO2MuDualAxisChart(report: ReportData): Highcharts.Options {
  // Per-batch small multiples with TRUE dual axes: pO₂ on the left axis,
  // μ on the right (opposite) axis. Matches the deck Slide 4 layout.

  const COLOR_PO2 = '#2563eb' // blue — pO₂
  const COLOR_MU  = '#dc2626' // red  — μ

  const visibleBatches = BATCH_IDS.filter((id) =>
    (report.batchData[id] || []).some((p) => p.po2 !== null && Number.isFinite(p.po2))
  )

  const PANE_HEIGHT = 100 / visibleBatches.length
  const PANE_GAP = 5
  const yAxis: Highcharts.YAxisOptions[] = []
  const series: Highcharts.SeriesOptionsType[] = []

  visibleBatches.forEach((id, i) => {
    const points = report.batchData[id] || []
    const top = i * PANE_HEIGHT
    const height = PANE_HEIGHT - PANE_GAP

    // Left axis: pO₂
    yAxis.push({
      title: {
        text: `${id} — pO₂ (%)`,
        style: { color: COLOR_PO2, fontSize: '10px', fontWeight: '600' },
      },
      labels: { style: { color: COLOR_PO2, fontSize: '10px' } },
      top: `${top}%`,
      height: `${height}%`,
      offset: 0,
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      min: 0,
      max: 110,
      plotBands: [
        {
          from: 10, to: 15,
          color: 'rgba(220, 38, 38, 0.10)',
          label: { text: 'C_critical', style: { color: '#dc2626', fontSize: '9px' } },
        },
      ],
    } as Highcharts.YAxisOptions)

    // Right axis: μ (opposite)
    yAxis.push({
      title: {
        text: 'μ (h⁻¹)',
        style: { color: COLOR_MU, fontSize: '10px', fontWeight: '600' },
      },
      labels: { style: { color: COLOR_MU, fontSize: '10px' } },
      top: `${top}%`,
      height: `${height}%`,
      offset: 0,
      opposite: true,
      gridLineColor: 'transparent',
    } as Highcharts.YAxisOptions)

    // pO₂ series → left axis (index = i*2)
    series.push({
      type: 'line' as const,
      name: `${id} pO₂`,
      color: COLOR_PO2,
      data: pointsToSeries(points, 'po2'),
      yAxis: i * 2,
      lineWidth: 2,
      marker: { radius: 2.5 },
    })

    // μ series → right axis (index = i*2 + 1)
    series.push({
      type: 'line' as const,
      name: `${id} μ`,
      color: COLOR_MU,
      dashStyle: 'Dash' as Highcharts.DashStyleValue,
      data: pointsToSeries(points, 'muSmooth'),
      yAxis: i * 2 + 1,
      lineWidth: 1.75,
      marker: { radius: 2 },
    })
  })

  return {
    ...sharedChartOptions,
    chart: {
      ...(sharedChartOptions.chart as Highcharts.ChartOptions),
      height: 150 * visibleBatches.length,
    },
    title: { text: undefined },
    legend: { enabled: false },
    yAxis,
    series,
  }
}

function makeOURDecompositionChart(report: ReportData): Highcharts.Options {
  // Per-batch small multiples — match the deck (Slide 7) exactly:
  //   - Maintenance area (orange) at the bottom
  //   - Growth-associated area (blue) stacked on top
  //   - Total OUR line (solid blue) drawn over the stack
  //   - "Maint: NN%" annotation at the last point
  // Colors are FIXED across all panels (not per-batch) per the deck.

  const COLOR_MAINT  = '#f59e0b'   // amber/orange — maintenance fill
  const COLOR_GROWTH = '#93c5fd'   // light blue   — growth fill
  const COLOR_TOTAL  = '#1e40af'   // deep blue    — total OUR line

  const visibleBatches = BATCH_IDS.filter((id) =>
    (report.batchData[id] || []).some((p) => p.ourGrowth !== null || p.ourMaint !== null)
  )

  const PANE_HEIGHT = 100 / visibleBatches.length
  const PANE_GAP = 4
  const yAxis: Highcharts.YAxisOptions[] = []
  const series: Highcharts.SeriesOptionsType[] = []

  visibleBatches.forEach((id, i) => {
    const points = report.batchData[id] || []
    const top = i * PANE_HEIGHT
    const height = PANE_HEIGHT - PANE_GAP

    yAxis.push({
      title: {
        text: `${id} — OUR (mmol O₂/L/h)`,
        style: { color: '#475569', fontSize: '10px', fontWeight: '600' },
      },
      labels: { style: { color: '#64748b', fontSize: '10px' } },
      top: `${top}%`,
      height: `${height}%`,
      offset: 0,
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      min: 0,
    } as Highcharts.YAxisOptions)

    // Maintenance area (orange) — drawn first so it sits at the bottom of the stack
    series.push({
      type: 'area' as const,
      name: `${id} — Maintenance (mO₂=1.0)`,
      color: COLOR_MAINT,
      fillOpacity: 0.55,
      lineWidth: 0,
      data: pointsToSeries(points, 'ourMaint'),
      yAxis: i,
      stack: id,
    })
    // Growth-associated area (blue) — stacked on top of maintenance
    series.push({
      type: 'area' as const,
      name: `${id} — Growth-associated`,
      color: COLOR_GROWTH,
      fillOpacity: 0.55,
      lineWidth: 0,
      data: pointsToSeries(points, 'ourGrowth'),
      yAxis: i,
      stack: id,
    })

    // Total OUR line (sum) — read directly from ourTotal column where available,
    // otherwise compute as ourGrowth + ourMaint at points where both exist.
    const totalLine: [number, number][] = points
      .filter((p) => {
        const g = p.ourGrowth, m = p.ourMaint, t = p.ourTotal
        return (
          (t !== null && Number.isFinite(t)) ||
          (g !== null && Number.isFinite(g) && m !== null && Number.isFinite(m))
        )
      })
      .map((p) => {
        const t =
          p.ourTotal !== null
            ? p.ourTotal
            : ((p.ourGrowth ?? 0) + (p.ourMaint ?? 0))
        return [p.time, parseFloat(t.toFixed(3))]
      })
    series.push({
      type: 'line' as const,
      name: `${id} — Total OUR`,
      color: COLOR_TOTAL,
      data: totalLine,
      yAxis: i,
      lineWidth: 2,
      marker: { radius: 3, symbol: 'circle' },
      stack: undefined,
    } as Highcharts.SeriesOptionsType)

    // "Maint: NN%" annotation at the last point where both terms are present
    const lastWithBoth = [...points].reverse().find(
      (p) =>
        p.ourGrowth !== null && Number.isFinite(p.ourGrowth) &&
        p.ourMaint !== null && Number.isFinite(p.ourMaint)
    )
    if (lastWithBoth) {
      const total = (lastWithBoth.ourGrowth ?? 0) + (lastWithBoth.ourMaint ?? 0)
      const maintPct = total > 0 ? Math.round(((lastWithBoth.ourMaint ?? 0) / total) * 100) : 0
      // Single-point overlay series to anchor the data label
      series.push({
        type: 'scatter' as const,
        name: `${id} — Maint %`,
        color: COLOR_TOTAL,
        marker: { enabled: false },
        data: [
          {
            x: lastWithBoth.time,
            y: total,
            dataLabels: {
              enabled: true,
              format: `Maint: ${maintPct}%`,
              align: 'right',
              verticalAlign: 'bottom',
              style: { color: COLOR_TOTAL, fontSize: '10px', fontWeight: '600', textOutline: '2px white' },
              y: -4,
            },
          },
        ],
        yAxis: i,
        showInLegend: false,
        enableMouseTracking: false,
      } as Highcharts.SeriesOptionsType)
    }
  })

  return {
    ...sharedChartOptions,
    chart: {
      ...(sharedChartOptions.chart as Highcharts.ChartOptions),
      type: 'area',
      height: 150 * visibleBatches.length,
    },
    title: { text: undefined },
    legend: { enabled: false },
    yAxis,
    plotOptions: {
      area: { stacking: 'normal', lineWidth: 0, marker: { radius: 1.5, symbol: 'circle' } },
      line: { stacking: undefined },
    },
    series,
  }
}

function makeKLaChart(report: ReportData): Highcharts.Options {
  // Per-batch small multiples with Y_XO₂ sensitivity (deck Slide 8).
  //
  // The CSV stores kLa computed at Y_XO₂ = 1.25 (toolkit default). To draw
  // the three sensitivity curves (1.0, 1.25, 1.5) without re-doing any
  // science we use a closed-form algebraic transform of pre-computed values:
  //
  //   OUR_total_csv = ourGrowth_csv + ourMaint
  //   driving_force = OUR_total_csv / kLa_csv          (recovered from CSV)
  //
  //   For a target Y_XO₂':
  //     ourGrowth'  = ourGrowth_csv × (Y_XO₂_csv / Y_XO₂')   (only this term scales)
  //     ourMaint'   = ourMaint                                (independent of Y_XO₂)
  //     OUR_total'  = ourGrowth' + ourMaint
  //     kLa'        = OUR_total' / driving_force
  //
  // No re-derivation of biology — just inverse-proportional rescaling of one
  // pre-computed column.

  const Y_XO2_CSV = 1.25
  const Y_XO2_VARIANTS = [1.0, 1.25, 1.5] as const
  const VARIANT_COLORS: Record<number, string> = {
    1.0:  '#1e40af', // deep blue
    1.25: '#f59e0b', // amber (matches the deck legend ordering)
    1.5:  '#16a34a', // green
  }

  const visibleBatches = BATCH_IDS.filter((id) =>
    (report.batchData[id] || []).some((p) => p.kLa !== null && Number.isFinite(p.kLa))
  )

  const PANE_HEIGHT = 100 / visibleBatches.length
  const PANE_GAP = 4
  const yAxis: Highcharts.YAxisOptions[] = []
  const series: Highcharts.SeriesOptionsType[] = []

  visibleBatches.forEach((id, i) => {
    const points = report.batchData[id] || []
    const top = i * PANE_HEIGHT
    const height = PANE_HEIGHT - PANE_GAP

    yAxis.push({
      title: {
        text: `${id} — kLa (h⁻¹)`,
        style: { color: '#475569', fontSize: '10px', fontWeight: '600' },
      },
      labels: { style: { color: '#64748b', fontSize: '10px' } },
      top: `${top}%`,
      height: `${height}%`,
      offset: 0,
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      plotBands: [
        {
          from: 100,
          to: 400,
          color: 'rgba(22, 163, 74, 0.10)',
          label: {
            text: 'Typical kLa (100–400 h⁻¹)',
            style: { color: '#16a34a', fontSize: '9px' },
            align: 'left',
            x: 8,
          },
        },
      ],
    } as Highcharts.YAxisOptions)

    for (const yxo2 of Y_XO2_VARIANTS) {
      const scale = Y_XO2_CSV / yxo2
      // IMPORTANT: keep ALL timepoints in the array, emitting `null` for any
      // point the toolkit dropped (kLa = NaN where driving force ≈ 0). This
      // makes Highcharts draw a gap at those positions instead of connecting
      // the line straight across — matching the deck's "X pts dropped" look.
      const data: Array<[number, number | null]> = points.map((p) => {
        const kla = p.kLa
        const og = p.ourGrowth
        const om = p.ourMaint
        if (
          kla === null || !Number.isFinite(kla) || kla <= 0 ||
          og === null || !Number.isFinite(og) ||
          om === null || !Number.isFinite(om)
        ) {
          return [p.time, null]
        }
        const ourTotalCsv  = og + om
        const drivingForce = ourTotalCsv / kla          // recovered from CSV
        const ourGrowthNew = og * scale                  // only growth scales
        const ourTotalNew  = ourGrowthNew + om
        const klaNew       = ourTotalNew / drivingForce
        return [p.time, parseFloat(klaNew.toFixed(2))]
      })

      series.push({
        type: 'line' as const,
        name: `${id} — Y_XO₂=${yxo2.toFixed(2)}`,
        color: VARIANT_COLORS[yxo2],
        data,
        yAxis: i,
        lineWidth: 1.75,
        marker: { radius: 2, symbol: 'circle' },
        dashStyle: yxo2 === Y_XO2_CSV ? ('Solid' as Highcharts.DashStyleValue) : ('ShortDot' as Highcharts.DashStyleValue),
        connectNulls: false,
      } as Highcharts.SeriesOptionsType)
    }
  })

  return {
    ...sharedChartOptions,
    chart: {
      ...(sharedChartOptions.chart as Highcharts.ChartOptions),
      height: 150 * visibleBatches.length,
    },
    title: { text: undefined },
    legend: {
      enabled: true,
      itemStyle: { color: '#475569', fontWeight: '500', fontSize: '10px' },
      labelFormatter: function () {
        // Strip the "BXX — " prefix so the legend reads "Y_XO₂=1.00" etc.,
        // and dedupe by hiding duplicate batch entries.
        const name = (this as { name: string }).name
        return name.replace(/^B0[1-6] — /, '')
      },
    },
    yAxis,
    series,
  }
}

// ─── A8: Carotenoid intermediates conversion (100% stacked column) ──────────
//
// Static data baked into the builder — not from the CSV. Numbers come from
// the deck (A8, Slide "Conversion of carotenoid intermediates to Astaxanthin
// drops from ~63% to ~4%"). Highcharts `stacking: 'percent'` normalises each
// bar to 100% so the visual matches the deck, even though B06's raw numbers
// don't sum to exactly 100.

const CAROTENOID_PROCESSES = [
  'YNB AA + 20% IPM + 0.4% Toco T-5b',
  'B06',
] as const

const CAROTENOID_DATA: Array<{
  name: string
  color: string
  values: readonly [number, number]
}> = [
  { name: 'Astaxanthin',    color: '#d55e00', values: [63.7, 4.4] },
  { name: 'Canthaxanthin',  color: '#0072b2', values: [9.7,  55.0] },
  { name: 'Zeaxanthin',     color: '#e69f00', values: [24.3, 40.6] },
  { name: 'Beta carotene',  color: '#009e73', values: [2.3,  38.6] },
]

function makeCarotenoidConversionChart(): Highcharts.Options {
  return {
    ...sharedChartOptions,
    chart: {
      ...(sharedChartOptions.chart as Highcharts.ChartOptions),
      type: 'column',
      height: 380,
    },
    title: { text: undefined },
    xAxis: {
      ...(sharedChartOptions.xAxis as Highcharts.XAxisOptions),
      title: { text: undefined },
      categories: [...CAROTENOID_PROCESSES],
      labels: { style: { color: '#64748b', fontSize: '11px' } },
    },
    yAxis: {
      title: { text: '% of total carotenoids', style: { color: '#64748b', fontSize: '12px' } },
      labels: { format: '{value}%', style: { color: '#64748b', fontSize: '11px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      min: 0,
      max: 100,
    },
    tooltip: {
      ...(sharedChartOptions.tooltip as Highcharts.TooltipOptions),
      shared: true,
      headerFormat: '<b>{point.key}</b><br/>',
      pointFormat:
        '<span style="color:{series.color}">●</span> {series.name}: <b>{point.percentage:.1f}%</b> ({point.y} raw)<br/>',
    },
    plotOptions: {
      column: {
        stacking: 'percent',
        borderRadius: 0,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.percentage:.0f}%',
          style: { color: '#fff', fontSize: '10px', fontWeight: '600', textOutline: '1px rgba(0,0,0,0.3)' },
        },
      },
    },
    series: CAROTENOID_DATA.map((c) => ({
      type: 'column' as const,
      name: c.name,
      color: c.color,
      data: [...c.values],
    })),
  }
}

// ─── Per-batch single-panel builders (for the expanded 2×3 grid view) ───────
//
// In the inline (non-expanded) view qsRate / ourDecomposition / kLa render as
// stacked-pane small multiples in a single Highcharts instance. When the user
// expands one of those charts, we instead render 6 INDEPENDENT Highcharts
// instances in a 2×3 grid (one per batch). These functions build a single
// per-batch config that the grid renders.

function makeQsSingle(report: ReportData, batchId: string): Highcharts.Options {
  const meta = metaOf(report.batchMeta, batchId)
  const points = (report.batchData[batchId] || []).filter(
    (p) => p.qs !== null && Number.isFinite(p.qs) && (p.qs as number) > 0
  )
  return {
    ...sharedChartOptions,
    chart: { ...(sharedChartOptions.chart as Highcharts.ChartOptions), height: 380 },
    title: {
      text: batchId,
      style: { color: meta?.color ?? '#475569', fontSize: '13px', fontWeight: '600' },
    },
    legend: { enabled: false },
    yAxis: {
      title: { text: 'qs (g/g/h)', style: { color: '#64748b', fontSize: '11px' } },
      labels: { style: { color: '#64748b', fontSize: '10px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      min: 0,
      plotBands: [
        {
          from: CRABTREE_QS_GGH, to: 10,
          color: 'rgba(220, 38, 38, 0.12)',
          label: { text: `Crabtree (>${CRABTREE_QS_GGH})`, style: { color: '#dc2626', fontSize: '9px' }, align: 'right', x: -8 },
        },
        {
          from: 0.12, to: 0.20,
          color: 'rgba(22, 163, 74, 0.16)',
          label: { text: 'Best (0.12–0.20)', style: { color: '#16a34a', fontSize: '9px' }, align: 'right', x: -8 },
        },
      ],
    },
    series: [
      {
        type: 'line' as const,
        name: batchId,
        color: meta?.color ?? '#475569',
        data: points.map((p) => [p.time, p.qs as number]),
        lineWidth: 2,
        marker: { radius: 3 },
      },
    ],
  }
}

function makeOurSingle(report: ReportData, batchId: string): Highcharts.Options {
  const meta = metaOf(report.batchMeta, batchId)
  const points = report.batchData[batchId] || []

  const COLOR_MAINT  = '#f59e0b'
  const COLOR_GROWTH = '#93c5fd'
  const COLOR_TOTAL  = '#1e40af'

  const totalLine: [number, number][] = points
    .filter((p) => {
      const t = p.ourTotal, g = p.ourGrowth, m = p.ourMaint
      return (t !== null && Number.isFinite(t)) ||
             (g !== null && Number.isFinite(g) && m !== null && Number.isFinite(m))
    })
    .map((p) => {
      const t = p.ourTotal !== null ? p.ourTotal : ((p.ourGrowth ?? 0) + (p.ourMaint ?? 0))
      return [p.time, parseFloat(t.toFixed(3))]
    })

  const lastWithBoth = [...points].reverse().find(
    (p) =>
      p.ourGrowth !== null && Number.isFinite(p.ourGrowth) &&
      p.ourMaint !== null && Number.isFinite(p.ourMaint)
  )
  const maintPct = lastWithBoth
    ? Math.round(((lastWithBoth.ourMaint ?? 0) / ((lastWithBoth.ourGrowth ?? 0) + (lastWithBoth.ourMaint ?? 0))) * 100)
    : null

  const series: Highcharts.SeriesOptionsType[] = [
    {
      type: 'area' as const,
      name: 'Maintenance (mO₂=1.0)',
      color: COLOR_MAINT,
      fillOpacity: 0.55,
      lineWidth: 0,
      data: pointsToSeries(points, 'ourMaint'),
      stack: batchId,
    },
    {
      type: 'area' as const,
      name: 'Growth-associated',
      color: COLOR_GROWTH,
      fillOpacity: 0.55,
      lineWidth: 0,
      data: pointsToSeries(points, 'ourGrowth'),
      stack: batchId,
    },
    {
      type: 'line' as const,
      name: 'Total OUR',
      color: COLOR_TOTAL,
      data: totalLine,
      lineWidth: 2,
      marker: { radius: 3, symbol: 'circle' },
    } as Highcharts.SeriesOptionsType,
  ]

  if (lastWithBoth && maintPct !== null) {
    series.push({
      type: 'scatter' as const,
      name: 'Maint %',
      color: COLOR_TOTAL,
      marker: { enabled: false },
      data: [
        {
          x: lastWithBoth.time,
          y: (lastWithBoth.ourGrowth ?? 0) + (lastWithBoth.ourMaint ?? 0),
          dataLabels: {
            enabled: true,
            format: `Maint: ${maintPct}%`,
            align: 'right',
            verticalAlign: 'bottom',
            style: { color: COLOR_TOTAL, fontSize: '11px', fontWeight: '600', textOutline: '2px white' },
            y: -4,
          },
        },
      ],
      showInLegend: false,
      enableMouseTracking: false,
    } as Highcharts.SeriesOptionsType)
  }

  return {
    ...sharedChartOptions,
    chart: {
      ...(sharedChartOptions.chart as Highcharts.ChartOptions),
      type: 'area',
      height: 380,
    },
    title: {
      text: batchId,
      style: { color: meta?.color ?? '#475569', fontSize: '13px', fontWeight: '600' },
    },
    legend: { enabled: true, itemStyle: { color: '#475569', fontSize: '10px' } },
    yAxis: {
      title: { text: 'OUR (mmol O₂/L/h)', style: { color: '#64748b', fontSize: '11px' } },
      labels: { style: { color: '#64748b', fontSize: '10px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      min: 0,
    },
    plotOptions: {
      area: { stacking: 'normal', lineWidth: 0, marker: { radius: 1.5 } },
      line: { stacking: undefined },
    },
    series,
  }
}

function makeKLaSingle(report: ReportData, batchId: string): Highcharts.Options {
  const meta = metaOf(report.batchMeta, batchId)
  const points = report.batchData[batchId] || []
  const Y_XO2_CSV = 1.25
  const Y_XO2_VARIANTS = [1.0, 1.25, 1.5] as const
  const VARIANT_COLORS: Record<number, string> = {
    1.0:  '#1e40af',
    1.25: '#f59e0b',
    1.5:  '#16a34a',
  }

  const hasAnyKla = points.some((p) => p.kLa !== null && Number.isFinite(p.kLa))

  if (!hasAnyKla) {
    // B06 — no pO₂ data, so no kLa. Render an empty pane with a label.
    return {
      ...sharedChartOptions,
      chart: { ...(sharedChartOptions.chart as Highcharts.ChartOptions), height: 380 },
      title: {
        text: `${batchId} — no pO₂ data`,
        style: { color: meta?.color ?? '#475569', fontSize: '13px', fontWeight: '600' },
      },
      legend: { enabled: false },
      yAxis: { title: { text: 'kLa (h⁻¹)' }, min: 0, max: 1 },
      series: [],
    }
  }

  const series: Highcharts.SeriesOptionsType[] = Y_XO2_VARIANTS.map((yxo2) => {
    const scale = Y_XO2_CSV / yxo2
    const data: Array<[number, number | null]> = points.map((p) => {
      const kla = p.kLa, og = p.ourGrowth, om = p.ourMaint
      if (
        kla === null || !Number.isFinite(kla) || kla <= 0 ||
        og === null || !Number.isFinite(og) ||
        om === null || !Number.isFinite(om)
      ) {
        return [p.time, null]
      }
      const ourTotalCsv  = og + om
      const drivingForce = ourTotalCsv / kla
      const ourGrowthNew = og * scale
      const ourTotalNew  = ourGrowthNew + om
      const klaNew       = ourTotalNew / drivingForce
      return [p.time, parseFloat(klaNew.toFixed(2))]
    })
    return {
      type: 'line' as const,
      name: `Y_XO₂=${yxo2.toFixed(2)}`,
      color: VARIANT_COLORS[yxo2],
      data,
      lineWidth: 2,
      marker: { radius: 3, symbol: 'circle' },
      dashStyle: yxo2 === Y_XO2_CSV ? ('Solid' as Highcharts.DashStyleValue) : ('ShortDot' as Highcharts.DashStyleValue),
      connectNulls: false,
    } as Highcharts.SeriesOptionsType
  })

  return {
    ...sharedChartOptions,
    chart: { ...(sharedChartOptions.chart as Highcharts.ChartOptions), height: 380 },
    title: {
      text: batchId,
      style: { color: meta?.color ?? '#475569', fontSize: '13px', fontWeight: '600' },
    },
    legend: { enabled: true, itemStyle: { color: '#475569', fontSize: '10px' } },
    yAxis: {
      title: { text: 'kLa (h⁻¹)', style: { color: '#64748b', fontSize: '11px' } },
      labels: { style: { color: '#64748b', fontSize: '10px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      plotBands: [
        {
          from: 100, to: 400,
          color: 'rgba(22, 163, 74, 0.12)',
          label: { text: 'Typical (100–400)', style: { color: '#16a34a', fontSize: '9px' }, align: 'left', x: 8 },
        },
      ],
    },
    series,
  }
}

function makeGrowthRateSingle(report: ReportData, batchId: string): Highcharts.Options {
  const meta = metaOf(report.batchMeta, batchId)
  const points = report.batchData[batchId] || []
  return {
    ...sharedChartOptions,
    chart: { ...(sharedChartOptions.chart as Highcharts.ChartOptions), height: 380 },
    title: {
      text: batchId,
      style: { color: meta?.color ?? '#475569', fontSize: '13px', fontWeight: '600' },
    },
    legend: { enabled: false },
    yAxis: {
      title: { text: 'μ (h⁻¹)', style: { color: '#64748b', fontSize: '11px' } },
      labels: { style: { color: '#64748b', fontSize: '10px' } },
      gridLineColor: 'rgba(0, 0, 0, 0.04)',
      plotLines: [{ value: 0, color: 'rgba(0,0,0,0.2)', width: 1 }],
    },
    series: [
      {
        type: 'line' as const,
        name: batchId,
        color: meta?.color ?? '#475569',
        data: pointsToSeries(points, 'muSmooth'),
        lineWidth: 2,
        marker: { radius: 3 },
      },
    ],
  }
}

function makePO2MuSingle(report: ReportData, batchId: string): Highcharts.Options {
  const meta = metaOf(report.batchMeta, batchId)
  const points = report.batchData[batchId] || []
  const COLOR_PO2 = '#2563eb'
  const COLOR_MU  = '#dc2626'

  const hasPO2 = points.some((p) => p.po2 !== null && Number.isFinite(p.po2))
  if (!hasPO2) {
    return {
      ...sharedChartOptions,
      chart: { ...(sharedChartOptions.chart as Highcharts.ChartOptions), height: 380 },
      title: {
        text: `${batchId} — no pO₂ data`,
        style: { color: meta?.color ?? '#475569', fontSize: '13px', fontWeight: '600' },
      },
      legend: { enabled: false },
      yAxis: { title: { text: 'pO₂ (%)' }, min: 0, max: 110 },
      series: [],
    }
  }

  return {
    ...sharedChartOptions,
    chart: { ...(sharedChartOptions.chart as Highcharts.ChartOptions), height: 380 },
    title: {
      text: batchId,
      style: { color: meta?.color ?? '#475569', fontSize: '13px', fontWeight: '600' },
    },
    legend: { enabled: true, itemStyle: { color: '#475569', fontSize: '10px' } },
    yAxis: [
      {
        title: { text: 'pO₂ (%)', style: { color: COLOR_PO2, fontSize: '11px', fontWeight: '600' } },
        labels: { style: { color: COLOR_PO2, fontSize: '10px' } },
        gridLineColor: 'rgba(0, 0, 0, 0.04)',
        min: 0,
        max: 110,
        plotBands: [
          {
            from: 10, to: 15,
            color: 'rgba(220, 38, 38, 0.10)',
            label: { text: 'C_critical', style: { color: '#dc2626', fontSize: '9px' } },
          },
        ],
      },
      {
        title: { text: 'μ (h⁻¹)', style: { color: COLOR_MU, fontSize: '11px', fontWeight: '600' } },
        labels: { style: { color: COLOR_MU, fontSize: '10px' } },
        opposite: true,
        gridLineColor: 'transparent',
      },
    ],
    series: [
      {
        type: 'line' as const,
        name: 'pO₂',
        color: COLOR_PO2,
        data: pointsToSeries(points, 'po2'),
        yAxis: 0,
        lineWidth: 2,
        marker: { radius: 2.5 },
      },
      {
        type: 'line' as const,
        name: 'μ',
        color: COLOR_MU,
        dashStyle: 'Dash' as Highcharts.DashStyleValue,
        data: pointsToSeries(points, 'muSmooth'),
        yAxis: 1,
        lineWidth: 1.75,
        marker: { radius: 2 },
      },
    ],
  }
}

/** Chart IDs that render as a 2×3 grid of independent charts when expanded. */
export const GRID_EXPANDED_CHART_IDS = new Set([
  'growthRate',
  'po2MuDualAxis',
  'qsRate',
  'ourDecomposition',
  'kLa',
])

/** Build the 2×3 grid for an expanded chart. Returns 6 configs (B01–B06). */
export function createExpandedGridConfigs(
  report: ReportData,
  chartId: string
): Highcharts.Options[] {
  const builder =
    chartId === 'growthRate' ? makeGrowthRateSingle :
    chartId === 'po2MuDualAxis' ? makePO2MuSingle :
    chartId === 'qsRate' ? makeQsSingle :
    chartId === 'ourDecomposition' ? makeOurSingle :
    chartId === 'kLa' ? makeKLaSingle :
    null
  if (!builder) return []
  return BATCH_IDS.map((id) => builder(report, id))
}

// ─── Registry factory ────────────────────────────────────────────────────────

export type ChartBuilder = (report: ReportData) => Highcharts.Options

const BUILDERS: Record<string, ChartBuilder> = {
  od600:             makeOD600Chart,
  wcw:               makeWCWChart,
  po2:               makePO2Chart,
  feedRate:          makeFeedRateChart,
  reactorVolume:     makeReactorVolumeChart,
  dcwConcentration:  makeDcwConcentrationChart,
  totalDCWMass:      makeTotalDCWMassChart,
  odWcwRatio:        makeODWCWRatioChart,
  carbonBalance:     makeCarbonBalanceChart,
  fullCarbonBalance: makeFullCarbonBalanceChart,
  supplementComparison: makeSupplementComparisonChart,
  growthRate:        makeGrowthRateChart,
  qsRate:            makeQsRateChart,
  po2MuDualAxis:     makePO2MuDualAxisChart,
  ourDecomposition:  makeOURDecompositionChart,
  kLa:               makeKLaChart,
  carotenoidConversion: makeCarotenoidConversionChart,
}

/**
 * Bind every chart builder to a specific report instance. Returns a registry
 * keyed by chartId where each value is a zero-arg function that produces a
 * fresh Highcharts.Options object.
 */
export function createChartRegistry(
  report: ReportData
): Record<string, () => Highcharts.Options> {
  const out: Record<string, () => Highcharts.Options> = {}
  for (const [id, builder] of Object.entries(BUILDERS)) {
    out[id] = () => builder(report)
  }
  return out
}

export type ChartRegistry = ReturnType<typeof createChartRegistry>
