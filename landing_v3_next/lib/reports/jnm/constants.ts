/**
 * Load-bearing scientific constants used by the Jananom report.
 *
 * NOTE: These are public reference values (Pirt coefficients, Crabtree
 * thresholds, citations from the literature) — NOT customer data. They are
 * safe to ship to the client and are used by `chart-configs.ts` to render
 * plot bands and labels. Customer data lives in `batches.generated.ts` and
 * `narrative.ts`, both of which are server-only.
 *
 * These mirror the constants in `jananom_data/fermentation_toolkit.py`.
 * Update them in only ONE place — here — and re-run `node scripts/ingest-jnm.mjs`
 * if any value used by the toolkit changes.
 */

// ─── Biomass conversion ──────────────────────────────────────────────────────
/** g DCW / g WCW. Wet weight is ~75% water (Shuler & Kargi, 2002). */
export const DCW_WCW_RATIO = 0.25

// ─── Glucose / carbon balance ────────────────────────────────────────────────
/** g/L — concentration of the continuous glucose feed (client batch reports). */
export const FEED_GLUCOSE_GPL = 620
/** g/L — 50% w/v glucose bolus used in B04 pulses. */
export const PULSE_GLUCOSE_GPL = 500
/** g/L — initial glucose in the batch medium. */
export const BATCH_MEDIUM_GLUCOSE_GPL = 20
/** mL — batch medium volume across all batches (excludes inoculum). */
export const BATCH_MEDIUM_VOL_ML = 1500
/** g DCW / g glucose — theoretical aerobic yield (Roels, 1983). */
export const YXS_THEORETICAL = 0.45

// ─── Crabtree thresholds ─────────────────────────────────────────────────────
/** g/L glucose — overflow metabolism threshold (Verduyn 1991). */
export const CRABTREE_GLUCOSE_GPL = 0.1
/** g glucose / (g DCW · h) — critical specific feed rate (Postma 1989; Van Hoek 1998). */
export const CRABTREE_QS_GGH = 0.25
/** Below this qs, cells starve. */
export const QS_STARVATION_GGH = 0.10
/** Best operating range for qs. */
export const QS_BEST_RANGE: readonly [number, number] = [0.12, 0.20]

// ─── Yield tiers (deck Slide 5) ──────────────────────────────────────────────
export const YIELD_TIER_ELITE: readonly [number, number] = [0.42, 0.48]
export const YIELD_TIER_SOLID: readonly [number, number] = [0.38, 0.42]

// ─── Oxygen transfer & Pirt equation ─────────────────────────────────────────
/** g DCW / g O₂ (Verduyn 1991; Heijnen & Van Dijken 1992). */
export const Y_XO2_MAX = 1.25
/** mmol O₂ / (g DCW · h) — maintenance coefficient (Pirt 1965; Verduyn 1991). */
export const M_O2 = 1.0
export const O2_MW = 32
/** mg O₂ / L — saturated DO at 30°C, 1 atm air, salts (Schumpe 1982). */
export const C_STAR_MGL = 7.3
/** % air saturation — C_critical for S. cerevisiae. */
export const PO2_CRITICAL_PCT: readonly [number, number] = [10, 15]
/** % air saturation — productive operating range. */
export const PO2_PRODUCTIVE_PCT: readonly [number, number] = [30, 50]
/** h⁻¹ — typical bench-scale kLa range. */
export const KLA_BENCH_RANGE: readonly [number, number] = [100, 400]

// ─── Sampling ────────────────────────────────────────────────────────────────
/** mL removed per sampling event. */
export const SAMPLE_VOL_ML = 3

// ─── Citations ───────────────────────────────────────────────────────────────
export const CITATIONS = {
  shulerKargi: 'Shuler & Kargi (2002), Bioprocess Engineering: Basic Concepts',
  pirt:        'Pirt, S. J. (1965). The maintenance energy of bacteria in growing cultures.',
  verduyn:     'Verduyn et al. (1991). A theoretical evaluation of growth yields of yeasts.',
  vanDenBerg:  'Van den Berg et al. (2013).',
  postma:      'Postma et al. (1989). Enzymic analysis of the Crabtree effect.',
  vanHoek:     "Van Hoek et al. (1998). Effect of specific growth rate on fermentative capacity of baker's yeast.",
  heijnen:     'Heijnen & Van Dijken (1992).',
  schumpe:     'Schumpe et al. (1982).',
  roels:       'Roels, J. A. (1983). Energetics and Kinetics in Biotechnology.',
} as const
