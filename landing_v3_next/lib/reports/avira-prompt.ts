import 'server-only'
import type { ReportData, Analysis, Evidence } from './types'

/**
 * AVIRA system + user prompt builders.
 *
 * Server-only: this module is imported by the avira API route handler. It
 * does NOT import the report data directly — the route passes the report in.
 */

const SYSTEM_RULES = `You are AVIRA, the AI Research Assistant for the fermentation analysis report below.

STRICT RULES — FOLLOW WITHOUT EXCEPTION:
1. You may ONLY answer using information provided in the REPORT CONTEXT below.
2. If the answer is not in the report data, respond: "This information is not covered in the report."
3. NEVER speculate, hypothesize, or use knowledge outside the report context.
4. NEVER invent numbers, percentages, or data points. Only use exact values from the report.
5. Always cite which section your answer comes from (e.g., "According to Analysis A3..." or "From the executive summary...").
6. ALWAYS include at least one [See: Chart Title](chartId) link when your answer relates to data shown in a chart. Never just mention a chart by name — always link it using the exact format: [See: Chart Title](chartId). Example: [See: Total DCW Mass (volume-corrected)](totalDCWMass). If multiple charts are relevant, link all of them.
7. Keep answers concise and factual. Use the report's own language and numbers.
8. For batch comparisons, only compare using data explicitly provided — do not extrapolate trends.
9. If the user asks about methodology, only describe what the report states was done.
10. If asked for opinions or predictions, decline and point to the report's recommendations section.`

const CHART_COMPUTATIONS = `=== CHART COMPUTATION METHODS ===
All numerical chart data is read directly from columns of processed_batch_data.csv (produced by fermentation_toolkit.py). The TypeScript layer does NOT re-derive any of these values.

reactorVolume — Reactor Volume V(t): Volume_mL column. V(t) = V_initial + cumulative_feed + cumulative_supplements − sampling_loss (3 mL/sample). [Analysis A1]
dcwConcentration — DCW Concentration: DCW_gL column. DCW = 0.25 × WCW (Shuler & Kargi, 2002). [Analysis A1]
totalDCWMass — Total DCW Mass (volume-corrected): DCW_mass_g column. DCW_mass = DCW_gL × V(t)/1000. The true productivity metric. [Analysis A1]
growthRate — Specific Growth Rate (μ): mu_smooth_h column. μ = d(ln(DCW_mass))/dt with Savitzky-Golay smoothing (window=5, order=2). Per-batch small multiples. [Analysis A2]
po2MuDualAxis — pO₂ + μ Cross-Correlation: per-batch dual-axis small multiples. pO2_pct on the left axis, mu_smooth_h on the right (opposite) axis. C_critical zone (10–15%) shaded. [Analysis A3]
carbonBalance — Carbon Yield (Yx/s): per-batch yields from the deck (Slide 5). B01/B02/B03 = 0.14, B04 = 0.25, B05 = 0.25, B06 = 0.31 g/g. Tier bands: Elite 0.42–0.48, Solid 0.38–0.42. [Analysis A4]
fullCarbonBalance — Full Carbon Balance: Cumul_Glucose_Fed_g vs theoretical max DCW (× Yxs = 0.45, Roels) vs actual DCW_mass_g per batch. [Analysis A4]
qsRate — Specific Glucose Feed Rate (qs): qs_ggh column from the toolkit. qs = (feed_rate × 620 g/L) / DCW_mass_g. Per-batch small multiples with red Crabtree band (qs > 0.25), green best-range band (0.12–0.20), and unshaded starvation zone (qs < 0.10). Batch-phase qs = 0 points are skipped. [Analysis A5]
ourDecomposition — OUR Decomposition (Pirt): OUR_growth_mmol_L_h + OUR_maint_mmol_L_h. Pirt: OUR = (μ/Y_XO2_max + mO2) × X. mO2 = 1.0 mmol O2/g DCW/h; Y_XO2_max = 1.25 g DCW/g O2 (Verduyn 1991). Per-batch stacked area + total OUR line + maintenance % annotation. [Analysis A7]
kLa — kLa Estimates with Y_XO2 sensitivity: kLa_h column. kLa = OUR / (C* − C_L). Three sensitivity lines per batch (Y_XO2 = 1.0 / 1.25 / 1.5) — the 1.0 and 1.5 lines are an algebraic transform of the CSV's Y_XO2 = 1.25 column. Bench-scale typical 100–400 h⁻¹ shaded. B04 values are physically implausible (driving force near zero). B06 has no pO2 data. [Analysis A7]`

function serializeEvidence(ev: Evidence): string {
  const lines: string[] = []
  const typeLabel = ev.type === 'chart' ? `chart, id=${ev.chartId}` : ev.type
  lines.push(`  Evidence (${typeLabel}): "${ev.title}"`)
  lines.push(`    ${ev.description}`)
  if (ev.tableData) {
    lines.push(`    Table: ${ev.tableData.headers.join(' | ')}`)
    for (const row of ev.tableData.rows) {
      lines.push(`    ${row.join(' | ')}`)
    }
  }
  return lines.join('\n')
}

function serializeAnalysis(a: Analysis): string {
  const lines: string[] = [
    `=== ANALYSIS ${a.id.toUpperCase()}: ${a.title} ===`,
    `Verdict: ${a.verdict}`,
    `Summary: ${a.verdictSummary}`,
    '',
  ]
  for (const ev of a.evidence) {
    lines.push(serializeEvidence(ev))
    lines.push('')
  }
  return lines.join('\n')
}

function serializeReport(report: ReportData): string {
  const sections: string[] = []

  sections.push('=== PROBLEM STATEMENT ===')
  sections.push(report.problemStatement.heading)
  sections.push(report.problemStatement.body)
  sections.push('')
  sections.push('Key Performance Indicators:')
  for (const kpi of report.problemStatement.kpis) {
    sections.push(`  ${kpi.label}: ${kpi.value}${kpi.subtext ? ` (${kpi.subtext})` : ''}`)
  }

  sections.push('')
  sections.push('=== EXECUTIVE SUMMARY ===')
  for (const bullet of report.executiveSummary.bullets) {
    sections.push(`- ${bullet}`)
  }

  sections.push('')
  for (const a of report.analyses) {
    sections.push(serializeAnalysis(a))
  }

  sections.push('=== BATCH METADATA ===')
  for (const b of report.batchMeta) {
    const supps = b.supplements.length
      ? b.supplements.map((s) => `${s.type}@${s.timeH}h(${s.volumeMl}mL)`).join(', ')
      : 'none'
    sections.push(
      `${b.id}: Equipment=${b.equipment} | Scale=${b.scaleL}L | Duration=${b.durationH}h (planned ${b.plannedDurationH}h) | Final OD=${b.finalOd} | Final WCW=${b.finalWcw} mg/3mL | Final DCW=${b.finalDcwGperL} g/L (${b.finalDcwMassG} g total) | Yx/s=${b.carbonYield} g/g | V_initial=${b.vInitialMl} mL → V_final=${b.vFinalMl} mL (+${b.vIncreasePct}%) | Cumulative feed=${b.cumulFeedMl} mL | Supplements: ${supps} | Closure: ${b.closureReason ?? 'n/a'}`
    )
  }

  sections.push('')
  sections.push('=== RECOMMENDATIONS ===')
  for (const rec of report.recommendations) {
    sections.push(`${rec.title} (${rec.source}): ${rec.description}`)
  }

  sections.push('')
  sections.push(CHART_COMPUTATIONS)

  return sections.join('\n')
}

export function buildSystemPrompt(report: ReportData): string {
  const reportContext = serializeReport(report)
  return `${SYSTEM_RULES}\n\n--- BEGIN REPORT CONTEXT ---\n${reportContext}\n--- END REPORT CONTEXT ---`
}

export function buildUserMessage(question: string, resolvedReferences: string[]): string {
  if (resolvedReferences.length === 0) return question
  const refBlock = resolvedReferences.join('\n\n')
  return `The user has attached the following report context to their question:\n\n${refBlock}\n\nQuestion: ${question}`
}
