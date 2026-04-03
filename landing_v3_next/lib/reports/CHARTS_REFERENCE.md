# Charts Reference — JNM Fermentation Report

All charts are defined in `chart-configs.ts`, registered in `chartRegistry`, and referenced by string ID in `jnm-data.ts`.

Raw time-series data lives in `batch-data.ts`. Batch summary fields (volumes, supplements) also in `batch-data.ts`.

---

## Source Documents

| Alias | File | Contents |
|-------|------|----------|
| **XLSX** | `JNM_All-Batches-Data_v1.xlsx` | Two tabs: "All Batches" (104 rows of 6-hourly time-series: OD600, WCW, pO2, feed rate, comments) and "Batch Summary" (per-batch metadata: equipment, scale, duration, final OD/WCW, feed unit, batch medium vol, total feed vol, supplements, closure reason) |
| **PDF** | `JNM_Fermentation-Analysis_Deck_v1.pdf` | 13-page analysis deck with 8 analyses, each containing charts, observations, and derived calculations. This is the **analytical source of truth** — it defines what charts should exist, what they mean, and what conclusions they support. |

---

## Chart Inventory (14 total)

### H1 — Volume-Corrected Biomass (PDF pages 2–3)

| # | Chart ID | Title | Type | PDF Analysis | Data Source | Computation |
|---|----------|-------|------|-------------|-------------|-------------|
| 1 | `od600` | OD600 Growth Curves — All Batches | Line (6 series) | Analysis 1 — left panel context | **XLSX** "All Batches" tab → `OD600` column | Direct plot: time vs OD600 per batch |
| 2 | `wcw` | Wet Cell Weight (WCW) Trajectories | Line (6 series) | Analysis 1 — middle panel | **XLSX** "All Batches" tab → `WCW (mg/3mL)` column | Direct plot: time vs WCW per batch |
| 3 | `reactorVolume` | Reactor Volume Reconstruction V(t) | Line (6 series) | Analysis 1 — left panel "Reactor Volume Reconstruction" | **XLSX** "Batch Summary" tab → batch medium vol, total feed vol, supplement vol | Computed: V(t) = batchMediumVol + cumulative feed (integrated from feedRate × dt) + supplements − sampling losses (~3 mL/sample). B01–B03 feed in mL/L/h (volume-specific), B04–B06 in mL/h (absolute). |
| 4 | `totalDCWMass` | Total DCW Mass (Volume-Corrected) | Line (6 series) | Analysis 1 — right panel "Total DCW Mass (volume-corrected)" | **XLSX** "All Batches" tab → WCW + computed V(t) | Computed: DCW (g/L) = 0.25 × WCW / 3. Total mass (g) = DCW (g/L) × V(t) (L). Conversion factor 0.25 from Shuler & Kargi, 2002. |

### H2 — Growth Phase Segmentation (PDF pages 3–4)

| # | Chart ID | Title | Type | PDF Analysis | Data Source | Computation |
|---|----------|-------|------|-------------|-------------|-------------|
| 5 | `growthRate` | Specific Growth Rate (μ) Over Time | Line (6 series) | Analysis 3 — "Specific Growth Rate (mu) from DCW mass" (6 per-batch subplots) | **XLSX** "All Batches" tab → OD600 | Computed: μ = Δln(OD600) / Δt for each consecutive pair of time points. Note: PDF computes μ from ln(DCW mass) with smoothing; our version uses OD600 as proxy (same trend, slightly different absolute values). |

### H3 — Dissolved Oxygen & Growth Rate (PDF page 5)

| # | Chart ID | Title | Type | PDF Analysis | Data Source | Computation |
|---|----------|-------|------|-------------|-------------|-------------|
| 6 | `po2` | Dissolved Oxygen (pO2) Profiles | Line (5 series) | Analysis 4 — pO2 axis of each subplot | **XLSX** "All Batches" tab → `pO2 (%)` column | Direct plot: time vs pO2. B06 excluded (all null). Includes plotBands for O2 limitation zone (<20%) and productive range (30–50%). |
| 7 | `po2MuDualAxis` | pO2 + μ Cross-Correlation (Dual Axis) | Dual-axis line | Analysis 4 — "pO2 and mu Overlay with C_critical Zone" (per-batch dual-axis subplots) | **XLSX** "All Batches" tab → pO2 + OD600 | Computed: pO2 on left Y-axis (solid lines), μ on right Y-axis (dashed lines). μ = Δln(OD600)/Δt. B06 excluded (no pO2). Shows visual correlation ≠ causation. |

### H4 — Carbon Balance Efficiency (PDF page 6)

| # | Chart ID | Title | Type | PDF Analysis | Data Source | Computation |
|---|----------|-------|------|-------------|-------------|-------------|
| 8 | `carbonBalance` | Carbon Balance — Biomass Yield (Yx/s) by Batch | Column (6 bars) | Analysis 5 — the Yx/s labels on grouped bars (0.14, 0.14, 0.14, 0.35, 0.25, 0.25) | **PDF** — Yx/s values taken directly from Analysis 5 | Hardcoded yields from PDF. Includes plotBands for "Elite" (0.42–0.48) and "Solid" (0.38–0.42) tiers. |
| 9 | `fullCarbonBalance` | Full Carbon Balance — Glucose In vs Theoretical Max vs Actual DCW | Grouped column (3 series × 6 batches) | Analysis 5 — "Carbon Balance: Glucose In vs Biomass Out" grouped bar chart | **XLSX** "Batch Summary" tab → totalFeedVol + **XLSX** "All Batches" → WCW + computed V(t) | Computed: Total glucose (g) = totalFeedVol (mL) / 1000 × 500 g/L. Theoretical max DCW = glucose × 0.48 (elite Yx/s). Actual DCW from final WCW × V(t). Glucose concentration assumed 500 g/L (standard 50% w/v). PDF uses Yx/s=0.45 for theoretical max; our code uses 0.48. |

### H5 — Glucose Feed Rate & Crabtree Risk (PDF pages 7–8)

| # | Chart ID | Title | Type | PDF Analysis | Data Source | Computation |
|---|----------|-------|------|-------------|-------------|-------------|
| 10 | `feedRate` | Feed Rate Profiles — All Batches | Line (6 series) | Analysis 6 — context for qs calculation (feed rate is an input to qs) | **XLSX** "All Batches" tab → `Feed Rate` + `Feed Unit` columns | Direct plot: time vs feedRate. Custom tooltip shows unit per batch (mL/L/h for B01–B03, mL/h for B04–B06). |
| 11 | `glucoseMassBalance` | Glucose Mass Balance — Fed vs Consumed (B04–B06) | Area (6 series: 2 per batch) | Analysis 6 cont. — "Glucose Mass Balance — Consumed vs Surplus" (per-batch stacked area) | **XLSX** "All Batches" tab → feedRate + WCW + computed V(t) | Computed: Cumulative glucose fed = ∫(feedRate × dt × 500 g/L / 1000). Consumed estimate = totalDCW / Yx/s_avg (0.30). Focuses on B04–B06 only. PDF shows all 6 batches; our version shows key 3. |

### H6 — Supplement Effects (PDF pages 9, 12)

| # | Chart ID | Title | Type | PDF Analysis | Data Source | Computation |
|---|----------|-------|------|-------------|-------------|-------------|
| 12 | `supplementComparison` | Supplement Impact — Batch Duration & Final Biomass | Horizontal bar (dual series) | Qualitative Analysis slide — summarized numerically | **XLSX** "Batch Summary" tab → duration, finalOD per batch | Direct plot from batchMeta: duration (h) and finalOD per batch on dual Y-axes. |
| 13 | `odWcwRatio` | OD600 / WCW Ratio Over Time | Line (6 series) | Analysis 7 — "OD/WCW Ratio Trajectory" (two subplots: B01–B03, B04–B06) | **XLSX** "All Batches" tab → OD600 + WCW | Computed: ratio = OD600 / WCW at each timepoint. Declining = heavier cells (pigment/lipid accumulation). B01–B03 vs B04–B06 have different baselines due to different spectrophotometers (Hitachi vs LABMAN). |

### H7 — Oxygen Uptake Rate (PDF pages 10–11)

| # | Chart ID | Title | Type | PDF Analysis | Data Source | Computation |
|---|----------|-------|------|-------------|-------------|-------------|
| 14 | `ourDecomposition` | OUR — Growth vs. Maintenance Decomposition | Stacked area (6 series: 2 per batch) | Analysis 8 — "Estimated OUR — Pirt Equation" (per-batch subplots) | **XLSX** "All Batches" tab → OD600 + WCW | Computed via Pirt equation: OUR = (μ / Y_XO2_max + mO2) × X. Constants: mO2 = 1.0 mmol O2/g DCW/h, Y_XO2_max = 1.5 g DCW/mmol O2 (Pirt, 1965; Verduyn et al., 1991). DCW estimated as 0.25 × WCW / 3 × 1000. Focuses on B04–B06. |

---

## Charts in PDF but NOT implemented

| PDF Chart | Reason Skipped |
|-----------|---------------|
| **kLa Estimates** (Analysis 8 cont., page 11) | Report itself states values are "physically implausible" — artefact of (C*−C_L) nearing zero. Kept as text-only evidence in H7. |
| **Growth Phase Segmentation** per-batch ln(DCW) plots with exponential/linear/stationary labels (Analysis 2, page 3) | Replaced by combined μ chart (`growthRate`) which conveys the same information more concisely. Individual phase segmentation would require manual breakpoint annotations. |
| **Specific Glucose Feed Rate (qs)** per-batch with Crabtree/starvation zones (Analysis 6, page 7) | Would require qs = feedRate × [glucose] / (X × V). Partially represented by `feedRate` chart + text evidence describing qs zones. Could be added as future enhancement. |

---

## Data Flow

```
JNM_All-Batches-Data_v1.xlsx
        │
        ├── "All Batches" tab ──→ batch-data.ts :: batchData (time-series)
        │
        └── "Batch Summary" tab ──→ batch-data.ts :: batchMeta (per-batch metadata)
                                         │
JNM_Fermentation-Analysis_Deck_v1.pdf    │
        │                                │
        ├── Yx/s values ──→ chart-configs.ts :: makeCarbonBalanceChart (hardcoded)
        ├── Analysis structure ──→ jnm-data.ts :: hypotheses + evidence layout
        └── Observations/text ──→ jnm-data.ts :: text evidence descriptions
                                         │
                                         ▼
                                  chart-configs.ts
                                    chartRegistry
                                         │
                                         ▼
                              ReportsClient.tsx (client-side)
                                resolveChartConfig(chartId)
```
