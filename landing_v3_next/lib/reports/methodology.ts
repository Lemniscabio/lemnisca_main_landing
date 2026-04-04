export interface ChartMethodology {
  chartId: string
  title: string
  hypothesis: string
  formula: string
  constants?: { name: string; value: string; source: string }[]
  dataSource: string
  sourceDetail: string
  notes?: string
}

export const chartMethodologies: ChartMethodology[] = [
  {
    chartId: 'od600',
    title: 'OD600 Growth Curves',
    hypothesis: 'H1 — Volume-Corrected Biomass',
    formula: 'Direct plot: time (h) vs OD600 per batch',
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"All Batches" tab, column "OD600" — raw spectrophotometer readings at 600nm, measured every 6h',
    notes: 'B01–B03 used Hitachi 1900U spectrophotometer; B04–B06 used LABMAN (LMSP-V325). Absolute values may not be directly comparable across equipment groups.',
  },
  {
    chartId: 'wcw',
    title: 'Wet Cell Weight (WCW) Trajectories',
    hypothesis: 'H1 — Volume-Corrected Biomass',
    formula: 'Direct plot: time (h) vs WCW (mg/3mL) per batch',
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"All Batches" tab, column "WCW (mg/3mL)" — wet pellet mass from 3mL culture samples after centrifugation',
  },
  {
    chartId: 'reactorVolume',
    title: 'Reactor Volume Reconstruction V(t)',
    hypothesis: 'H1 — Volume-Corrected Biomass',
    formula: 'V(t) = V_initial + cumulative_feed + supplements − sampling_losses',
    constants: [
      { name: 'V_initial (batch medium)', value: '1600 mL (B01–B03, B05–B06), 1700 mL (B04)', source: 'JNM_All-Batches-Data_v1.xlsx — "Batch Summary" tab, column 9' },
      { name: 'Cumulative feed', value: '∫ feedRate × dt (integrated from time-series)', source: 'xlsx "All Batches" tab — "Feed Rate" column. B01–B03 in mL/L/h (volume-specific, multiplied by V(t)/1000), B04–B06 in mL/h (absolute)' },
      { name: 'Total feed volumes', value: 'B01: ~780, B02: ~900, B03: ~810, B04: 1580.5, B05: 2250, B06: 2500 mL', source: 'xlsx "Batch Summary" tab, column "Total Feed Vol (mL)"' },
      { name: 'Supplement volumes', value: 'B01–B03: 0, B04: 970 mL (520 AA+YNB + 450 tocopherol), B05: 400 mL, B06: 490 mL', source: 'xlsx "Batch Summary" tab, column "Supplements" — volumes parsed from text descriptions' },
      { name: 'Sampling loss', value: '~3 mL per sampling event', source: 'Standard 3mL sampling protocol (from WCW measurement method)' },
    ],
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"Batch Summary" tab for initial volumes and total feed; "All Batches" tab for feed rate time-series used in cumulative integration',
    notes: 'Supplement additions are distributed uniformly across time intervals as exact addition times are not recorded in the data (except IPM at 24h for B05/B06).',
  },
  {
    chartId: 'totalDCWMass',
    title: 'Total DCW Mass (Volume-Corrected)',
    hypothesis: 'H1 — Volume-Corrected Biomass',
    formula: 'Total DCW mass (g) = DCW (g/L) × V(t) (L), where DCW (g/L) = 0.25 × WCW (mg/3mL) / 3',
    constants: [
      { name: '0.25 (dry-to-wet weight ratio)', value: '0.25 g DCW / g WCW', source: 'Shuler & Kargi, "Bioprocess Engineering: Basic Concepts" (2002). Standard assumption: yeast cells are ~75% water, so dry weight = 25% of wet weight. Also stated in JNM_Fermentation-Analysis_Deck_v1.pdf, page 2 (Analysis 1): "DCW = 0.25 × WCW (Shuler & Kargi, 2002)"' },
      { name: 'WCW unit conversion', value: 'WCW (mg/3mL) ÷ 3 = mg/mL = g/L', source: 'Unit conversion from the measurement protocol — 3mL sample volume' },
    ],
    dataSource: 'JNM_All-Batches-Data_v1.xlsx + computed V(t)',
    sourceDetail: '"All Batches" tab WCW values × V(t) from reactorVolume chart. This is the key analysis metric from the PDF deck — the "true productivity measure" for fed-batch.',
    notes: 'This chart answers the central question of H1: which batch actually produced the most biomass when dilution from feeding is accounted for.',
  },
  {
    chartId: 'growthRate',
    title: 'Specific Growth Rate (μ)',
    hypothesis: 'H2 — Growth Phase Segmentation',
    formula: 'μ = Δln(OD600) / Δt = [ln(OD600_i) − ln(OD600_{i-1})] / (t_i − t_{i-1})',
    constants: [
      { name: 'Δt', value: '6h intervals (from sampling frequency)', source: 'xlsx "All Batches" tab — 6-hourly time points' },
    ],
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"All Batches" tab, column "OD600" — μ computed as the natural log slope between consecutive OD readings',
    notes: 'The PDF deck (Analysis 3, page 4) computes μ from ln(DCW mass) with smoothing applied. Our version uses OD600 directly as a proxy — same growth trend but slightly different absolute values. The PDF also identifies exponential, linear, and stationary phases per batch.',
  },
  {
    chartId: 'po2',
    title: 'Dissolved Oxygen (pO₂) Profiles',
    hypothesis: 'H3 — Dissolved Oxygen',
    formula: 'Direct plot: time (h) vs pO₂ (% air saturation)',
    constants: [
      { name: 'O₂ limitation zone', value: '<20% air saturation', source: 'JNM_Fermentation-Analysis_Deck_v1.pdf, page 5 (Analysis 4): "C_critical for S. cerevisiae is 10–15% air saturation"' },
      { name: 'Productive range', value: '30–50% air saturation', source: 'PDF Analysis 4 — range where B03 achieved best growth without limitation' },
    ],
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"All Batches" tab, column "pO2 (%)" — B06 has all null values (no pO₂ probe data was recorded)',
  },
  {
    chartId: 'po2MuDualAxis',
    title: 'pO₂ + μ Cross-Correlation (Dual Axis)',
    hypothesis: 'H3 — Dissolved Oxygen',
    formula: 'Overlay: Left Y-axis = pO₂ (% saturation), Right Y-axis = μ (h⁻¹). μ = Δln(OD600)/Δt',
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"All Batches" tab — pO₂ column + OD600 column for μ computation. Reproduces PDF Analysis 4, page 5: "pO2 and mu Overlay with C_critical Zone"',
    notes: 'B06 excluded (no pO₂ data). The PDF shows per-batch subplots with C_critical zone shading. Key finding: visual correlation ≠ causation — DO values above 20% are NOT limiting for S. cerevisiae.',
  },
  {
    chartId: 'carbonBalance',
    title: 'Carbon Balance — Biomass Yield (Yx/s)',
    hypothesis: 'H4 — Carbon Balance Efficiency',
    formula: 'Yx/s = actual DCW produced (g) / total glucose consumed (g)',
    constants: [
      { name: 'B01 Yx/s', value: '0.14 g/g', source: 'JNM_Fermentation-Analysis_Deck_v1.pdf, page 6 (Analysis 5) — labelled on grouped bar chart' },
      { name: 'B02 Yx/s', value: '0.14 g/g', source: 'PDF Analysis 5' },
      { name: 'B03 Yx/s', value: '0.14 g/g', source: 'PDF Analysis 5' },
      { name: 'B04 Yx/s', value: '0.35 g/g', source: 'PDF Analysis 5' },
      { name: 'B05 Yx/s', value: '0.25 g/g', source: 'PDF Analysis 5' },
      { name: 'B06 Yx/s', value: '0.25 g/g', source: 'PDF Analysis 5' },
      { name: '"Elite" tier', value: '0.42–0.48 g/g', source: 'PDF Analysis 5: "Target for 2L R&D reactor — perfectly tuned, no Crabtree"' },
      { name: '"Solid" tier', value: '0.38–0.42 g/g', source: 'PDF Analysis 5: "Minor ethanol leaks but stable process"' },
    ],
    dataSource: 'JNM_Fermentation-Analysis_Deck_v1.pdf',
    sourceDetail: 'Page 6 (Analysis 5) — Yx/s values hardcoded from the deck analysis. Assumption stated in PDF: "All glucose fed is taken up".',
  },
  {
    chartId: 'fullCarbonBalance',
    title: 'Full Carbon Balance — Glucose In vs Theoretical Max vs Actual DCW',
    hypothesis: 'H4 — Carbon Balance Efficiency',
    formula: 'Total glucose (g) = totalFeedVol (mL) ÷ 1000 × 500 g/L. Theoretical max DCW = glucose × 0.48. Actual DCW = final WCW × 0.25 / 3 × V(t_final)',
    constants: [
      { name: 'Glucose feed concentration', value: '500 g/L (50% w/v)', source: 'Standard yeast fed-batch glucose feed concentration. Not explicitly stated in xlsx or PDF — industry standard assumption. PDF Analysis 5 (page 6) uses this implicitly in its Yx/s calculations.' },
      { name: 'Theoretical max Yx/s', value: '0.48 g/g', source: 'PDF Analysis 5 "Elite" tier upper bound. Note: PDF uses 0.45 for its theoretical max bars; our code uses 0.48.' },
      { name: '0.25 DCW factor', value: 'See totalDCWMass chart', source: 'Shuler & Kargi (2002), also PDF page 2' },
    ],
    dataSource: 'JNM_All-Batches-Data_v1.xlsx + PDF',
    sourceDetail: 'xlsx "Batch Summary" tab for totalFeedVol; xlsx "All Batches" for final WCW; V(t) from reactorVolume computation. Reproduces PDF Analysis 5 grouped bar chart (page 6).',
    notes: 'Small discrepancy: PDF uses Yx/s = 0.45 for theoretical max bars, our code uses 0.48 (the "Elite" upper bound). This affects the orange "Theoretical Max DCW" bars only.',
  },
  {
    chartId: 'feedRate',
    title: 'Feed Rate Profiles',
    hypothesis: 'H5 — Glucose Feed Rate & Crabtree Risk',
    formula: 'Direct plot: time (h) vs feed rate. B01–B03: mL/L/h (volume-specific). B04–B06: mL/h (absolute)',
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"All Batches" tab, columns "Feed Rate" and "Feed Unit". The different units reflect different equipment setups (KLF2000 vs Sartorius BIOSTAT B).',
    notes: 'The PDF (Analysis 6, page 7) converts feed rates to specific glucose uptake rate qs (g/g/h) using biomass and volume. That derived chart (qs with Crabtree/starvation zones) is not implemented — the raw feed rate is shown instead.',
  },
  {
    chartId: 'glucoseMassBalance',
    title: 'Glucose Mass Balance — Fed vs Consumed',
    hypothesis: 'H5 — Glucose Feed Rate & Crabtree Risk',
    formula: 'Cumulative glucose fed (g) = ∫(feedRate × dt) × (500 g/L ÷ 1000). Consumed estimate (g) = totalDCW(t) / Yx/s_avg',
    constants: [
      { name: 'Glucose feed concentration', value: '500 g/L', source: 'Standard assumption (same as fullCarbonBalance chart)' },
      { name: 'Average Yx/s for consumption estimate', value: '0.30 g/g', source: 'Approximate average across all batches from PDF Analysis 5 yield values' },
    ],
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"All Batches" tab feed rates + WCW for DCW. Reproduces PDF Analysis 6 cont. (page 8): "Glucose Mass Balance — Consumed vs Surplus". PDF shows all 6 batches; our version focuses on B04–B06.',
    notes: 'The "consumed" line is an estimate — actual glucose consumption would require metabolomics data. The gap between "fed" and "consumed" represents carbon lost to ethanol, CO₂, and maintenance.',
  },
  {
    chartId: 'supplementComparison',
    title: 'Supplement Impact — Duration & Final Biomass',
    hypothesis: 'H6 — Supplement Effects',
    formula: 'Horizontal bar chart: duration (h) and final OD600 per batch',
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"Batch Summary" tab — columns "Duration (h)" and "Final OD". Supplements from column "Supplements". Reproduces the qualitative analysis from PDF page 9.',
  },
  {
    chartId: 'odWcwRatio',
    title: 'OD600 / WCW Ratio Trajectory',
    hypothesis: 'H6 — Supplement Effects',
    formula: 'ratio = OD600 / WCW at each timepoint',
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"All Batches" tab, columns "OD600" and "WCW (mg/3mL)". Reproduces PDF Analysis 7 (page 12).',
    notes: 'The PDF separates B01–B03 (Hitachi/KLF2000) and B04–B06 (LABMAN/Sartorius) into two subplots because different spectrophotometers produce different baseline ratios. Our version plots all 6 together — the equipment-group clustering is visible in the data.',
  },
  {
    chartId: 'ourDecomposition',
    title: 'OUR — Growth vs Maintenance Decomposition',
    hypothesis: 'H7 — Oxygen Uptake Rate',
    formula: 'OUR = (μ / Y_XO2_max + mO₂) × X, where X = DCW concentration (g/L)',
    constants: [
      { name: 'mO₂ (maintenance oxygen coefficient)', value: '1.0 mmol O₂/g DCW/h', source: 'Pirt, 1965; Verduyn et al., 1991. Also stated in PDF Analysis 8 (page 10): "mO₂ = 1.0 mmol O₂/g DCW/h"' },
      { name: 'Y_XO2_max (max biomass yield on O₂)', value: '1.5 g DCW/mmol O₂', source: 'Standard value for S. cerevisiae aerobic growth. PDF page 10 header: "Y_XO2=1.25 g/g" (slightly different — PDF uses 1.25, our code uses 1.5)' },
      { name: 'DCW estimation from WCW', value: 'DCW (g/L) = 0.25 × WCW / 3', source: 'Shuler & Kargi (2002), PDF page 2' },
    ],
    dataSource: 'JNM_All-Batches-Data_v1.xlsx',
    sourceDetail: '"All Batches" tab — OD600 for μ calculation, WCW for DCW/X estimation. Reproduces PDF Analysis 8 (page 10). PDF shows all 6 batches; our version focuses on B04–B06.',
    notes: 'The decomposition is an estimate based on the Pirt equation. Growth-associated OUR declines as μ drops in late phases, while maintenance OUR increases proportionally with accumulated biomass.',
  },
]
