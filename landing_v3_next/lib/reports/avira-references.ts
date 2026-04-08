import type { ReportData, BatchMeta, Analysis } from './types'

/**
 * Avira reference catalog + resolver.
 *
 * IMPORTANT: this module does NOT import the report data directly. Both the
 * catalog builder and the resolver take the report as an argument so the
 * client bundle can use them safely (the catalog itself ships to the client
 * via props after the server renders the page).
 */

export interface ReferenceItem {
  id: string                    // e.g. 'B04', 'A3', 'od600'
  label: string                 // display name in autocomplete
  category: 'batch' | 'analysis' | 'chart' | 'section'
}

/** All referenceable items for the # autocomplete dropdown. */
export function getReferenceCatalog(report: ReportData): ReferenceItem[] {
  const items: ReferenceItem[] = []

  // Batches
  for (const b of report.batchMeta) {
    items.push({
      id: b.id,
      label: `${b.id} — ${b.equipment}, ${b.durationH}h`,
      category: 'batch',
    })
  }

  // Analyses
  for (const a of report.analyses) {
    items.push({
      id: a.id.toUpperCase(),
      label: `${a.id.toUpperCase()} — ${a.title}`,
      category: 'analysis',
    })
  }

  // Evidence (charts, tables, text) from all analyses
  const seen = new Set<string>()
  for (const a of report.analyses) {
    for (const ev of a.evidence) {
      if (ev.chartId && !seen.has(ev.chartId)) {
        seen.add(ev.chartId)
        items.push({ id: ev.chartId, label: ev.title, category: 'chart' })
      } else if (!ev.chartId && !seen.has(ev.title)) {
        seen.add(ev.title)
        items.push({
          id: ev.title,
          label: `${ev.title} (${a.id.toUpperCase()})`,
          category: ev.type === 'table' ? 'batch' : 'section',
        })
      }
    }
  }

  // Top-level sections
  items.push({ id: 'executive-summary', label: 'Executive Summary', category: 'section' })
  items.push({ id: 'hypothesis-discussion', label: 'Hypothesis Discussion (H1–H4)', category: 'section' })
  items.push({ id: 'overview',          label: 'Problem Statement & KPIs', category: 'section' })

  return items
}

/** Resolve a reference ID to its full text content (for the LLM prompt). */
export function resolveReference(report: ReportData, refId: string): string | null {
  const id = refId.trim()
  const idUpper = id.toUpperCase()

  // Batch reference: B01–B06
  const batch = report.batchMeta.find((b: BatchMeta) => b.id === idUpper)
  if (batch) {
    return [
      `[Batch ${batch.id}]`,
      `Equipment=${batch.equipment} | Scale=${batch.scaleL}L`,
      `Duration=${batch.durationH}h`,
      `Final OD=${batch.finalOd} | Final WCW=${batch.finalWcw} mg/3mL`,
      `Final DCW=${batch.finalDcwGperL} g/L | Total DCW mass=${batch.finalDcwMassG} g`,
      `Biomass yield Yx/s=${batch.biomassYield} g/g`,
      `V_initial=${batch.vInitialMl} mL | V_final=${batch.vFinalMl} mL (+${batch.vIncreasePct}%)`,
      `Cumulative feed=${batch.cumulFeedMl} mL`,
      batch.supplements.length
        ? `Supplements: ${batch.supplements.map((s) => `${s.type}@${s.timeH}h(${s.volumeMl}mL)`).join(', ')}`
        : 'Supplements: none',
      batch.closureReason ? `Closure: ${batch.closureReason}` : '',
    ]
      .filter(Boolean)
      .join(' | ')
  }

  // Analysis reference: A1–A8
  const ana = report.analyses.find((a: Analysis) => a.id.toUpperCase() === idUpper)
  if (ana) {
    const evidenceText = ana.evidence
      .map((ev) => {
        let text = `  - ${ev.type}: "${ev.title}" — ${ev.description}`
        if (ev.tableData) {
          text += `\n    Table: ${ev.tableData.headers.join(' | ')}\n`
          text += ev.tableData.rows.map((r) => `    ${r.join(' | ')}`).join('\n')
        }
        return text
      })
      .join('\n')
    return `[Analysis ${ana.id.toUpperCase()}: ${ana.title}]\nVerdict: ${ana.verdict}\nSummary: ${ana.verdictSummary}\nEvidence:\n${evidenceText}`
  }

  // Chart reference by chartId
  for (const a of report.analyses) {
    for (const ev of a.evidence) {
      if (ev.chartId === id) {
        return `[Chart: ${ev.title} (id=${ev.chartId}), from ${a.id.toUpperCase()}]\n${ev.description}`
      }
    }
  }

  // Evidence reference by title (text/table without chartId)
  for (const a of report.analyses) {
    for (const ev of a.evidence) {
      if (ev.title === id) {
        let text = `[Evidence: "${ev.title}" (${ev.type}), from ${a.id.toUpperCase()}: ${a.title}]\n${ev.description}`
        if (ev.tableData) {
          text += `\nTable: ${ev.tableData.headers.join(' | ')}\n`
          text += ev.tableData.rows.map((r) => r.join(' | ')).join('\n')
        }
        return text
      }
    }
  }

  // Section references
  if (id === 'executive-summary') {
    const exec = report.executiveSummary
    const lines: string[] = ['[Executive Summary]']
    if (exec.intro) lines.push(exec.intro)
    if (exec.hypotheses && exec.hypotheses.length > 0) {
      for (const h of exec.hypotheses) {
        lines.push(`${h.id} ${h.title}: ${h.finding} [Status: ${h.status}]`)
      }
    } else {
      lines.push(...exec.bullets.map((b) => `- ${b}`))
    }
    if (exec.closing) lines.push(exec.closing)
    return lines.join('\n')
  }
  if (id === 'hypothesis-discussion') {
    const hd = report.hypothesisDiscussion
    if (!hd) return null
    const out: string[] = [`[${hd.heading}]`, hd.intro, '']
    for (const h of hd.hypotheses) {
      out.push(`── ${h.id} ${h.title} (${h.role}) ──`)
      out.push(h.lead)
      out.push('Evidence:')
      for (const ev of h.evidence) {
        out.push(`  • ${ev.title}`)
        out.push(`    ${ev.body}`)
        if (ev.footnote) out.push(`    ${ev.footnote}`)
      }
      out.push('Literature:')
      for (const lit of h.literature) {
        out.push(`  • ${lit.citation}`)
        out.push(`    → ${lit.description}`)
      }
      out.push('What we need to confirm:')
      for (const item of h.whatWeNeed) out.push(`  • ${item}`)
      out.push('')
    }
    out.push(`── ${hd.causalStructure.heading} ──`)
    out.push(hd.causalStructure.intro)
    for (const row of hd.causalStructure.rows) {
      out.push(`${row.id} ${row.title}: ${row.text}`)
    }
    if (hd.closingNote) {
      out.push('')
      out.push(hd.closingNote)
    }
    return out.join('\n')
  }
  if (id === 'recommendations') {
    return `[Recommendations]\n${report.recommendations.map((r) => `${r.title} (${r.source}): ${r.description}`).join('\n')}`
  }
  if (id === 'overview') {
    const kpis = report.problemStatement.kpis.map((k) => `  ${k.label}: ${k.value}`).join('\n')
    return `[Problem Statement]\n${report.problemStatement.body}\n\nKPIs:\n${kpis}`
  }

  return null
}
