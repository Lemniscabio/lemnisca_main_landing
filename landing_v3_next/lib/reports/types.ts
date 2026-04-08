/**
 * Types for the report data passed from server → client.
 *
 * `BatchDataPoint` and `BatchMeta` mirror the columns produced by
 * `fermentation_toolkit.py` (see `jananom_data/processed_batch_data.csv`).
 * The data is generated from the CSVs by `scripts/ingest-jnm.mjs` and lives
 * in `lib/reports/jnm/batches.generated.ts` (server-only).
 */

// ─── Per-timepoint sample (one row of processed_batch_data.csv) ──────────────
export interface BatchDataPoint {
  time: number                       // Time_h
  od600: number                      // OD600
  wcw: number                        // WCW_mg3mL
  po2: number | null                 // pO2_pct (B06 has none)
  feedRate: number | null            // Feed_Rate (mL/L/h or mL/h)
  feedUnit: string                   // 'mL/L/h' (B01–B03) or 'mL/h' (B04–B06)
  volumeMl: number | null            // Volume_mL — reconstructed reactor volume V(t)
  cumulFeedMl: number | null         // Cumul_Feed_mL
  dcwGperL: number | null            // DCW_gL = WCW_gL × 0.25
  dcwMassG: number | null            // DCW_mass_g = DCW_gL × V(t)/1000
  muSmooth: number | null            // mu_smooth_h — Savitzky-Golay smoothed μ
  growthPhase: string | null         // 'lag' | 'exponential' | 'linear' | 'stationary' | 'transition' | 'decline'
  odWcwRatio: number | null          // OD600 / WCW_mg3mL
  cumulGlucoseFedG: number | null    // Cumul_Glucose_Fed_g
  glucoseConcGperL: number | null    // Glucose_Conc_gL
  crabtree: boolean | null           // Crabtree_Flag (glucose > 0.1 g/L)
  qs: number | null                  // qs_ggh — specific glucose feed rate
  crabtreeQs: boolean | null         // Crabtree_qs_Flag (qs > 0.25 g/g/h)
  ourGrowth: number | null           // OUR_growth_mmol_L_h — Pirt growth term
  ourMaint: number | null            // OUR_maint_mmol_L_h — Pirt maintenance term
  ourTotal: number | null            // OUR_mmol_L_h — total OUR
  kLa: number | null                 // kLa_h — volumetric O₂ transfer coefficient
}

// ─── Per-batch metadata (one entry per batch) ────────────────────────────────
export interface FeedSegment {
  startH: number
  endH: number
  rate: number
  unit: string
  description: string
}

export interface SupplementEntry {
  type: string                       // 'amino_acid_ynb' | 'tocopherol' | 'ipm' | 'glucose_pulse'
  timeH: number
  volumeMl: number
  description: string
}

export interface BatchEvent {
  type: string                       // 'termination' | 'growth_stall' | 'decline'
  startH: number
  endH: number
  description: string
}

export interface BatchMeta {
  id: string                         // 'B01' .. 'B06'
  equipment: string
  spectrophotometer: string
  scaleL: number | null
  color: string
  durationH: number | null
  vInitialMl: number | null
  vFinalMl: number | null
  vIncreasePct: number | null
  cumulFeedMl: number | null
  finalDcwGperL: number | null
  finalDcwMassG: number | null
  finalOd: number | null
  finalWcw: number | null
  inoculumOd: number | null
  inoculumWcw: number | null
  biomassYield: number               // Yx/s — biomass yield on glucose, g DCW / g glucose (deck Slide 5).
  closureReason: string | null
  feedSegments: FeedSegment[]
  supplements: SupplementEntry[]
  events: BatchEvent[]
}

// ─── Report narrative shape (deck content) ───────────────────────────────────
export interface KPI {
  label: string
  value: string
  subtext?: string
  trend?: 'up' | 'down' | 'stable'
  icon?: string
}

export interface Evidence {
  type: 'chart' | 'table' | 'text'
  title: string
  description: string
  chartId?: string
  tableData?: { headers: string[]; rows: string[][] }
}

export interface Analysis {
  id: string                         // 'a1' .. 'a8'
  title: string
  description: string
  verdict: 'supported' | 'partially' | 'refuted'
  verdictSummary: string
  evidence: Evidence[]
}

export interface Recommendation {
  title: string
  source: string
  description: string
  icon: string
}

export interface ReportNarrative {
  company: { name: string; logo?: string }
  title: string
  subtitle: string
  problemStatement: {
    heading: string
    body: string
    kpis: KPI[]
  }
  analyses: Analysis[]
  recommendations: Recommendation[]
  executiveSummary: {
    heading: string
    bullets: string[]
  }
}

// ─── The full report passed from server → client ─────────────────────────────
export interface ReportData extends ReportNarrative {
  batchMeta: BatchMeta[]
  batchData: Record<string, BatchDataPoint[]>
}
