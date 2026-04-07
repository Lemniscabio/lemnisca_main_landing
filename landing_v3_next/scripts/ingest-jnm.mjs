#!/usr/bin/env node
/**
 * Jananom data ingestion script.
 *
 * Reads the authoritative CSVs from `../jananom_data/`:
 *   - processed_batch_data.csv  (per-timepoint raw + computed columns)
 *   - batch_metadata.csv        (feed_segment, supplement, event rows)
 *   - summary.csv               (per-batch totals)
 *
 * Emits `lib/reports/jnm/batches.generated.ts` — a generated TypeScript file
 * containing two constants:
 *
 *   export const batchMeta: BatchMeta[]
 *   export const batchData: Record<string, BatchDataPoint[]>
 *
 * Re-run this script whenever the source CSVs are corrected:
 *
 *   node scripts/ingest-jnm.mjs
 *
 * Then commit the regenerated file. Do NOT edit batches.generated.ts by hand.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_DIR = join(ROOT, '..', 'jananom_data')
const OUT_FILE = join(ROOT, 'lib', 'reports', 'jnm', 'batches.generated.ts')

// ─── CSV parsing (no deps) ───────────────────────────────────────────────────
// All Jananom CSVs use simple comma separation with whitespace padding for
// alignment. No quoted fields with embedded commas — except event rows where
// the Description is wrapped in double quotes. We handle that minimally.

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = splitRow(lines[0]).map((h) => h.trim())
  const rows = lines.slice(1).map((line) => {
    const fields = splitRow(line).map((f) => f.trim())
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = fields[i] ?? ''
    })
    return obj
  })
  return { headers, rows }
}

// Split a single CSV row honoring double-quoted fields (used in event rows)
function splitRow(line) {
  const out = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuote = !inQuote
      continue
    }
    if (ch === ',' && !inQuote) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out
}

function parseNumOrNull(s) {
  if (s === undefined || s === null) return null
  const trimmed = String(s).trim()
  if (trimmed === '' || trimmed.toLowerCase() === 'nan') return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

function parseBoolOrNull(s) {
  const t = String(s ?? '').trim().toLowerCase()
  if (t === 'true') return true
  if (t === 'false') return false
  return null
}

// Round to N decimals to keep generated file readable
function r(n, d = 4) {
  if (n === null || n === undefined) return null
  if (!Number.isFinite(n)) return null
  return parseFloat(n.toFixed(d))
}

// ─── Read sources ────────────────────────────────────────────────────────────

const processed = parseCSV(readFileSync(join(DATA_DIR, 'processed_batch_data.csv'), 'utf-8'))
const metadata  = parseCSV(readFileSync(join(DATA_DIR, 'batch_metadata.csv'), 'utf-8'))
const summary   = parseCSV(readFileSync(join(DATA_DIR, 'summary.csv'), 'utf-8'))

// ─── Build per-timepoint batchData ───────────────────────────────────────────

const batchData = {}
for (const row of processed.rows) {
  const id = row['Batch']
  if (!id) continue
  if (!batchData[id]) batchData[id] = []
  batchData[id].push({
    time: parseNumOrNull(row['Time_h']),
    od600: parseNumOrNull(row['OD600']),
    wcw: parseNumOrNull(row['WCW_mg3mL']),
    po2: parseNumOrNull(row['pO2_pct']),
    feedRate: parseNumOrNull(row['Feed_Rate']),
    feedUnit: (row['Feed_Unit'] || '').trim(),
    volumeMl: r(parseNumOrNull(row['Volume_mL']), 1),
    cumulFeedMl: r(parseNumOrNull(row['Cumul_Feed_mL']), 1),
    dcwGperL: r(parseNumOrNull(row['DCW_gL']), 3),
    dcwMassG: r(parseNumOrNull(row['DCW_mass_g']), 3),
    muSmooth: r(parseNumOrNull(row['mu_smooth_h']), 5),
    growthPhase: (row['growth_phase'] || '').trim() || null,
    odWcwRatio: r(parseNumOrNull(row['OD_WCW_ratio']), 5),
    cumulGlucoseFedG: r(parseNumOrNull(row['Cumul_Glucose_Fed_g']), 2),
    glucoseConcGperL: r(parseNumOrNull(row['Glucose_Conc_gL']), 4),
    crabtree: parseBoolOrNull(row['Crabtree_Flag']),
    qs: r(parseNumOrNull(row['qs_ggh']), 4),
    crabtreeQs: parseBoolOrNull(row['Crabtree_qs_Flag']),
    ourGrowth: r(parseNumOrNull(row['OUR_growth_mmol_L_h']), 3),
    ourMaint: r(parseNumOrNull(row['OUR_maint_mmol_L_h']), 3),
    ourTotal: r(parseNumOrNull(row['OUR_mmol_L_h']), 3),
    kLa: r(parseNumOrNull(row['kLa_h']), 2),
  })
}

// ─── Build per-batch metadata ────────────────────────────────────────────────

// Carbon yields per the deck (Slide 5). Using deck values verbatim — these
// are the customer-facing numbers, not values recomputed from the CSV.
const CARBON_YIELDS = {
  B01: 0.14, B02: 0.14, B03: 0.14, B04: 0.25, B05: 0.25, B06: 0.31,
}

// Planned durations (from current report scaffolding; deck doesn't always state).
const PLANNED_DURATION = {
  B01: 96, B02: 96, B03: 96, B04: 96, B05: 120, B06: 120,
}

// Story-driven Okabe-Ito (colorblind-safe) palette.
// Cool tones for the KLF2000 family (B01–B03, no supplements baseline),
// warm tones for the Sartorius family (B04–B06, supplemented).
const BATCH_COLORS = {
  B01: '#0072b2', // deep blue       — KLF2000 baseline
  B02: '#56b4e9', // sky blue        — KLF2000 baseline
  B03: '#009e73', // bluish-green    — KLF2000 baseline (best aeration)
  B04: '#d55e00', // vermillion      — Sartorius, high biomass, failed (attention)
  B05: '#cc79a7', // reddish-purple  — Sartorius, extended run with IPM
  B06: '#e69f00', // orange          — Sartorius, best stability + best yield
}

// Pull static fields from the first row of each batch in processed.csv
function batchStatic(id) {
  const r0 = processed.rows.find((r) => r['Batch'] === id)
  return {
    equipment: (r0?.['Equipment'] || '').trim(),
    spectrophotometer: (r0?.['Spectrophotometer'] || '').trim(),
    scaleL: parseNumOrNull(r0?.['Scale_L']),
  }
}

// Group metadata rows by batch + table
const feedSegments = {}
const supplements = {}
const events = {}
for (const row of metadata.rows) {
  const id = row['Batch']
  const table = row['Table']
  if (!id || !table) continue
  if (table === 'feed_segment') {
    if (!feedSegments[id]) feedSegments[id] = []
    feedSegments[id].push({
      startH: parseNumOrNull(row['Start_h']),
      endH: parseNumOrNull(row['End_h']),
      rate: parseNumOrNull(row['Rate_or_Volume']),
      unit: (row['Unit'] || '').trim(),
      description: (row['Description'] || '').trim(),
    })
  } else if (table === 'supplement') {
    if (!supplements[id]) supplements[id] = []
    supplements[id].push({
      type: (row['Type'] || '').trim(),
      timeH: parseNumOrNull(row['Start_h']),
      volumeMl: parseNumOrNull(row['Rate_or_Volume']),
      description: (row['Description'] || '').trim(),
    })
  } else if (table === 'event') {
    if (!events[id]) events[id] = []
    events[id].push({
      type: (row['Type'] || '').trim(),
      startH: parseNumOrNull(row['Start_h']),
      endH: parseNumOrNull(row['End_h']),
      description: (row['Description'] || '').trim(),
    })
  }
}

// Pull totals from summary.csv keyed by batch id
const summaryById = {}
for (const row of summary.rows) {
  summaryById[row['Batch']] = {
    durationH: parseNumOrNull(row['Duration_h']),
    vInitialMl: parseNumOrNull(row['V_initial_mL']),
    vFinalMl: parseNumOrNull(row['V_final_mL']),
    vIncreasePct: parseNumOrNull(row['V_increase_%']),
    finalDcwGperL: parseNumOrNull(row['DCW_final_gL']),
    finalDcwMassG: parseNumOrNull(row['DCW_mass_final_g']),
    cumulFeedMl: parseNumOrNull(row['Cumul_Feed_mL']),
  }
}

const BATCH_IDS = ['B01', 'B02', 'B03', 'B04', 'B05', 'B06']

const batchMeta = BATCH_IDS.map((id) => {
  const stat = batchStatic(id)
  const sum = summaryById[id] || {}
  const points = batchData[id] || []
  const last = points[points.length - 1] || {}
  const first = points[0] || {}
  const term = (events[id] || []).find((e) => e.type === 'termination')
  return {
    id,
    equipment: stat.equipment,
    spectrophotometer: stat.spectrophotometer,
    scaleL: stat.scaleL,
    color: BATCH_COLORS[id],
    durationH: sum.durationH,
    plannedDurationH: PLANNED_DURATION[id],
    vInitialMl: sum.vInitialMl,
    vFinalMl: sum.vFinalMl,
    vIncreasePct: sum.vIncreasePct,
    cumulFeedMl: sum.cumulFeedMl,
    finalDcwGperL: sum.finalDcwGperL,
    finalDcwMassG: sum.finalDcwMassG,
    finalOd: last.od600 ?? null,
    finalWcw: last.wcw ?? null,
    inoculumOd: first.od600 ?? null,
    inoculumWcw: first.wcw ?? null,
    carbonYield: CARBON_YIELDS[id],
    closureReason: term?.description || null,
    feedSegments: feedSegments[id] || [],
    supplements: supplements[id] || [],
    events: events[id] || [],
  }
})

// ─── Emit TypeScript ─────────────────────────────────────────────────────────

const json = (v) => JSON.stringify(v, null, 2)

const ts = `// AUTO-GENERATED FILE — DO NOT EDIT.
// Regenerate with: node scripts/ingest-jnm.mjs
//
// Source CSVs: jananom_data/processed_batch_data.csv,
//              jananom_data/batch_metadata.csv,
//              jananom_data/summary.csv
//
// Pre-computed columns (DCW, μ, qs, OUR, kLa, etc.) come from
// fermentation_toolkit.py — DO NOT recompute in TypeScript.

import 'server-only'
import type { BatchDataPoint, BatchMeta } from '../types'

export const batchMeta: BatchMeta[] = ${json(batchMeta)}

export const batchData: Record<string, BatchDataPoint[]> = ${json(batchData)}
`

mkdirSync(dirname(OUT_FILE), { recursive: true })
writeFileSync(OUT_FILE, ts)

console.log(`✓ Wrote ${OUT_FILE}`)
console.log(`  ${BATCH_IDS.length} batches, ${Object.values(batchData).reduce((a, p) => a + p.length, 0)} timepoints total`)
