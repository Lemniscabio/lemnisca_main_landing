import { jnmReport } from './jnm-data'
import { batchMeta } from './batch-data'
import type { ReportData, Hypothesis, Evidence } from './types'

const SYSTEM_RULES = `You are AVIRA, the AI Research Assistant for the fermentation analysis report below.

STRICT RULES — FOLLOW WITHOUT EXCEPTION:
1. You may ONLY answer using information provided in the REPORT CONTEXT below.
2. If the answer is not in the report data, respond: "This information is not covered in the report."
3. NEVER speculate, hypothesize, or use knowledge outside the report context.
4. NEVER invent numbers, percentages, or data points. Only use exact values from the report.
5. Always cite which section your answer comes from (e.g., "According to Hypothesis H3..." or "From the executive summary...").
6. When referencing a chart, format as: [See: Chart Title](chartId) — e.g., [See: OD600 Growth Curves](od600)
7. Keep answers concise and factual. Use the report's own language and numbers.
8. For batch comparisons, only compare using data explicitly provided — do not extrapolate trends.
9. If the user asks about methodology, only describe what the report states was done.
10. If asked for opinions or predictions, decline and point to the report's recommendations section.`

const CHART_COMPUTATIONS = `=== CHART COMPUTATION METHODS ===
These describe how each chart in the report was computed.

od600 — OD600 Growth Curves: Direct plot of time vs optical density at 600nm per batch.
wcw — WCW Trajectories: Direct plot of time vs wet cell weight (mg/3mL) per batch.
reactorVolume — Reactor Volume Reconstruction V(t): V(t) = batchMediumVol + cumulative feed (integrated from feedRate × dt) + supplements − sampling losses (~3 mL/sample). B01–B03 feed in mL/L/h (volume-specific), B04–B06 in mL/h (absolute).
totalDCWMass — Total DCW Mass (Volume-Corrected): DCW (g/L) = 0.25 × WCW / 3. Total mass (g) = DCW (g/L) × V(t) (L). Conversion factor 0.25 from Shuler & Kargi, 2002.
growthRate — Specific Growth Rate (μ): μ = Δln(OD600) / Δt for each consecutive pair of time points. Uses OD600 as proxy.
po2 — Dissolved Oxygen (pO₂) Profiles: Direct plot of time vs pO₂ (% air saturation). B06 excluded (no probe data). Plot bands: O₂ limitation zone (<20%) and productive range (30–50%).
po2MuDualAxis — pO₂ + μ Cross-Correlation: pO₂ on left Y-axis (solid), μ on right Y-axis (dashed). B06 excluded. Visual correlation ≠ causation.
carbonBalance — Biomass Yield (Yx/s) by Batch: Hardcoded yields from analysis. Plot bands: "Elite" (0.42–0.48 g/g) and "Solid" (0.38–0.42 g/g).
fullCarbonBalance — Full Carbon Balance: Total glucose (g) = totalFeedVol (mL) / 1000 × 500 g/L. Theoretical max DCW = glucose × 0.48 (elite Yx/s). Actual DCW from final WCW × V(t). Glucose concentration assumed 500 g/L (standard 50% w/v).
feedRate — Feed Rate Profiles: Direct plot of time vs feedRate. Units: mL/L/h for B01–B03, mL/h for B04–B06.
glucoseMassBalance — Glucose Mass Balance (B04–B06): Cumulative glucose fed = ∫(feedRate × dt × 500 g/L / 1000). Consumed estimate = totalDCW / Yx/s_avg (0.30).
supplementComparison — Supplement Impact: Duration (h) and finalOD per batch on dual Y-axes.
odWcwRatio — OD600/WCW Ratio: ratio = OD600 / WCW at each timepoint. Declining = heavier cells (pigment/lipid accumulation). B01–B03 vs B04–B06 have different baselines due to different spectrophotometers (Hitachi vs LABMAN).
ourDecomposition — OUR Decomposition: Pirt equation: OUR = (μ / Y_XO2_max + mO₂) × X. Constants: mO₂ = 1.0 mmol O₂/g DCW/h, Y_XO2_max = 1.5 g DCW/mmol O₂.

Charts NOT in report (and why):
- kLa Estimates: Values are physically implausible — artefact of (C*−C_L) nearing zero. Kept as text-only evidence.
- Growth Phase Segmentation per-batch: Replaced by combined μ chart which conveys same information more concisely.
- Specific Glucose Feed Rate (qs) per-batch: Partially represented by feedRate chart + text evidence describing qs zones.`

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

function serializeHypothesis(h: Hypothesis): string {
  const lines: string[] = [
    `=== HYPOTHESIS ${h.id.toUpperCase()}: ${h.title} ===`,
    `Verdict: ${h.verdict}`,
    `Summary: ${h.verdictSummary}`,
    '',
  ]
  for (const ev of h.evidence) {
    lines.push(serializeEvidence(ev))
    lines.push('')
  }
  return lines.join('\n')
}

function serializeReport(report: ReportData): string {
  const sections: string[] = []

  // Problem statement
  sections.push(`=== PROBLEM STATEMENT ===`)
  sections.push(report.problemStatement.heading)
  sections.push(report.problemStatement.body)
  sections.push('')
  sections.push('Key Performance Indicators:')
  for (const kpi of report.problemStatement.kpis) {
    sections.push(`  ${kpi.label}: ${kpi.value}${kpi.subtext ? ` (${kpi.subtext})` : ''}`)
  }

  // Executive summary
  sections.push('')
  sections.push(`=== EXECUTIVE SUMMARY ===`)
  for (const bullet of report.executiveSummary.bullets) {
    sections.push(`- ${bullet}`)
  }

  // Hypotheses
  sections.push('')
  for (const h of report.hypotheses) {
    sections.push(serializeHypothesis(h))
  }

  // Batch metadata
  sections.push(`=== BATCH METADATA ===`)
  for (const b of batchMeta) {
    sections.push(
      `${b.id}: Equipment=${b.equipment} | Scale=${b.scale}L | Duration=${b.duration}h (planned ${b.plannedDuration}h) | Final OD=${b.finalOD} | Final WCW=${b.finalWCW} mg/3mL | Supplements=${b.supplements} | Closure=${b.closureReason} | Initial Vol=${b.batchMediumVol}mL | Feed Vol=${b.totalFeedVol}mL | Supplement Vol=${b.supplementVol}mL`
    )
  }

  // Recommendations
  sections.push('')
  sections.push(`=== RECOMMENDATIONS ===`)
  for (const rec of report.recommendations) {
    sections.push(`${rec.title} (${rec.source}): ${rec.description}`)
  }

  // Chart computation reference
  sections.push('')
  sections.push(CHART_COMPUTATIONS)

  return sections.join('\n')
}

export function buildSystemPrompt(): string {
  const reportContext = serializeReport(jnmReport)
  return `${SYSTEM_RULES}\n\n--- BEGIN REPORT CONTEXT ---\n${reportContext}\n--- END REPORT CONTEXT ---`
}

export function buildUserMessage(question: string, resolvedReferences: string[]): string {
  if (resolvedReferences.length === 0) return question
  const refBlock = resolvedReferences.join('\n\n')
  return `The user has attached the following report context to their question:\n\n${refBlock}\n\nQuestion: ${question}`
}
