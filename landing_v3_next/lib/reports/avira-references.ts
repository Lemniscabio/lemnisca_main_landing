import { jnmReport } from './jnm-data'
import { batchMeta } from './batch-data'
// types used implicitly via jnmReport structure

export interface ReferenceItem {
  id: string          // e.g. 'B04', 'H3', 'od600'
  label: string       // display name in autocomplete
  category: 'batch' | 'hypothesis' | 'chart' | 'section'
}

/** All referenceable items for the # autocomplete dropdown */
export function getReferenceCatalog(): ReferenceItem[] {
  const items: ReferenceItem[] = []

  // Batches
  for (const b of batchMeta) {
    items.push({ id: b.id, label: `${b.id} — ${b.equipment}, ${b.duration}h`, category: 'batch' })
  }

  // Hypotheses
  for (const h of jnmReport.hypotheses) {
    items.push({ id: h.id.toUpperCase(), label: `${h.id.toUpperCase()} — ${h.title}`, category: 'hypothesis' })
  }

  // Charts (from evidence across all hypotheses)
  const seenCharts = new Set<string>()
  for (const h of jnmReport.hypotheses) {
    for (const ev of h.evidence) {
      if (ev.chartId && !seenCharts.has(ev.chartId)) {
        seenCharts.add(ev.chartId)
        items.push({ id: ev.chartId, label: ev.title, category: 'chart' })
      }
    }
  }

  // Sections
  items.push({ id: 'executive-summary', label: 'Executive Summary', category: 'section' })
  items.push({ id: 'recommendations', label: 'Recommendations', category: 'section' })
  items.push({ id: 'overview', label: 'Problem Statement & KPIs', category: 'section' })

  return items
}

/** Resolve a reference ID to its full text content for the prompt */
export function resolveReference(refId: string): string | null {
  const id = refId.trim()
  const idUpper = id.toUpperCase()

  // Batch reference: B01–B06
  const batch = batchMeta.find((b) => b.id === idUpper)
  if (batch) {
    return `[Batch ${batch.id}] Equipment=${batch.equipment} | Scale=${batch.scale}L | Duration=${batch.duration}h (planned ${batch.plannedDuration}h) | Final OD=${batch.finalOD} | Final WCW=${batch.finalWCW} mg/3mL | Supplements=${batch.supplements} | Closure=${batch.closureReason} | Initial Vol=${batch.batchMediumVol}mL | Feed Vol=${batch.totalFeedVol}mL | Supplement Vol=${batch.supplementVol}mL`
  }

  // Hypothesis reference: H1–H7
  const hyp = jnmReport.hypotheses.find((h) => h.id.toUpperCase() === idUpper)
  if (hyp) {
    const evidenceText = hyp.evidence
      .map((ev) => {
        let text = `  - ${ev.type}: "${ev.title}" — ${ev.description}`
        if (ev.tableData) {
          text += `\n    Table: ${ev.tableData.headers.join(' | ')}\n`
          text += ev.tableData.rows.map((r) => `    ${r.join(' | ')}`).join('\n')
        }
        return text
      })
      .join('\n')
    return `[Hypothesis ${hyp.id.toUpperCase()}: ${hyp.title}]\nVerdict: ${hyp.verdict}\nSummary: ${hyp.verdictSummary}\nEvidence:\n${evidenceText}`
  }

  // Chart reference by chartId
  for (const h of jnmReport.hypotheses) {
    for (const ev of h.evidence) {
      if (ev.chartId === id) {
        return `[Chart: ${ev.title} (id=${ev.chartId}), from ${h.id.toUpperCase()}]\n${ev.description}`
      }
    }
  }

  // Section references
  if (id === 'executive-summary') {
    return `[Executive Summary]\n${jnmReport.executiveSummary.bullets.map((b) => `- ${b}`).join('\n')}`
  }
  if (id === 'recommendations') {
    return `[Recommendations]\n${jnmReport.recommendations.map((r) => `${r.title} (${r.source}): ${r.description}`).join('\n')}`
  }
  if (id === 'overview') {
    const kpis = jnmReport.problemStatement.kpis.map((k) => `  ${k.label}: ${k.value}`).join('\n')
    return `[Problem Statement]\n${jnmReport.problemStatement.body}\n\nKPIs:\n${kpis}`
  }

  return null
}
