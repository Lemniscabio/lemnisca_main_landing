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

// ─── Hypothesis Discussion section ───────────────────────────────────────────

export interface HypothesisEvidence {
  /** e.g. "Evidence 1 — Low biomass yield" */
  title: string
  /** Body paragraph(s). Use `\n\n` to separate paragraphs. */
  body: string
  /** Optional asterisk footnote rendered below the body. */
  footnote?: string
}

export interface HypothesisLiterature {
  /** Full citation text (author, year, title, journal). */
  citation: string
  /** Description following the `→` glyph in the source doc. */
  description: string
}

export interface Hypothesis {
  id: string                          // 'H1', 'H2', 'H3', 'H4'
  title: string                       // 'Overflow Metabolism — Crabtree Effect'
  role: string                        // 'primary failure mode', 'downstream consequence of H3'
  lead: string                        // intro paragraph(s); supports `\n\n`
  evidence: HypothesisEvidence[]
  literature: HypothesisLiterature[]
  whatWeNeed: string[]                // bullet list items
}

export interface CausalStructureRow {
  id: string                          // 'H1', 'H2', …
  title: string                       // 'Crabtree'
  text: string                        // role-and-connections cell content
}

export interface HypothesisDiscussion {
  heading: string                     // 'Hypothesis Discussion'
  intro: string
  hypotheses: Hypothesis[]
  causalStructure: {
    heading: string                   // 'Summary: Proposed Causal Structure'
    intro: string
    rows: CausalStructureRow[]
  }
  /** Optional closing note rendered after the causal-structure table. */
  closingNote?: string
}

export interface ReportNarrative {
  company: { name: string; logo?: string }
  title: string
  subtitle: string
  problemStatement: {
    heading: string
    body: string
    /** Optional sub-points rendered as a labelled bullet list under the body. */
    bullets?: { title: string; text: string }[]
    /** Optional closing statement (e.g. the core question) rendered after bullets. */
    closingQuestion?: string
    kpis: KPI[]
  }
  analyses: Analysis[]
  /** Optional discussion-level hypotheses section, layered on top of `analyses`. */
  hypothesisDiscussion?: HypothesisDiscussion
  recommendations: Recommendation[]
  executiveSummary: {
    heading: string
    /** Optional intro paragraph rendered above the hypotheses table. */
    intro?: string
    /** Hypotheses table (H1, H2, …). When present, replaces the bullet list. */
    hypotheses?: {
      id: string         // 'H1', 'H2', …
      title: string      // 'Crabtree effect'
      finding: string
      status: string
    }[]
    /** Optional closing paragraph(s) rendered below the table. */
    closing?: string
    /** Legacy bullet list — used only when `hypotheses` is not provided. */
    bullets: string[]
  }
}

// ─── The full report passed from server → client ─────────────────────────────
export interface ReportData extends ReportNarrative {
  batchMeta: BatchMeta[]
  batchData: Record<string, BatchDataPoint[]>
}
