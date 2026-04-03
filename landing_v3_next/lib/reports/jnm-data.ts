import type { ReportData } from './types'

// Re-export batch data types and values from the shared module
export type { BatchDataPoint, BatchMeta } from './batch-data'
export { batchData, batchMeta } from './batch-data'

// ─── Report Content ─────────────────────────────────────────────────────────

export const jnmReport: ReportData = {
  company: { name: 'Jananom' },
  title: 'Fermentation Data Analysis',
  subtitle: 'Carotenoid-producing Saccharomyces cerevisiae — Fed-Batch Process Investigation',

  problemStatement: {
    heading: 'Problem Statement',
    body: 'Six fed-batch fermentation runs (B01–B06) of carotenoid-producing Saccharomyces cerevisiae were conducted at bench scale. Despite consistent protocols, batch outcomes varied significantly — from early termination due to cell death (B01, B04) to extended 120-hour runs with varying productivity (B05, B06). This analysis investigates the root causes of inter-batch variability through quantitative biomass, metabolic, and oxygen-transfer analyses to identify an optimized process strategy.',
    kpis: [
      { label: 'Batches Analyzed', value: '6', subtext: 'B01–B06', icon: 'flask-conical' },
      { label: 'Best Biomass Yield', value: '0.35 g/g', subtext: 'B04 (Yx/s)', trend: 'up', icon: 'trending-up' },
      { label: 'Peak OD600', value: '318', subtext: 'B04 at 66h', trend: 'up', icon: 'activity' },
      { label: 'Max Duration', value: '120h', subtext: 'B05 & B06', icon: 'clock' },
    ],
  },

  hypotheses: [
    {
      id: 'h1',
      title: 'Volume-corrected biomass reveals true productivity differences',
      description: 'Measuring biomass concentration (g/L) alone can be misleading in fed-batch processes where volume increases from feeding. Volume-corrected total dry cell weight (DCW mass = DCW g/L × V(t)) accounts for dilution and provides a more accurate picture of actual biomass produced.',
      verdict: 'supported',
      verdictSummary: 'B04 produced the highest total biomass when volume-corrected, confirming that concentration-only metrics underestimate productivity in fed-batch systems.',
      evidence: [
        {
          type: 'chart',
          title: 'OD600 Growth Curves — All Batches',
          description: 'Optical density at 600nm over time for all 6 batches. B04 reaches the highest peak OD (318 at 66h) but was terminated early at 74h. B05/B06 run longest (120h) with lower peaks.',
          chartId: 'od600',
        },
        {
          type: 'chart',
          title: 'Wet Cell Weight (WCW) Trajectories',
          description: 'WCW (mg/3mL) over time. B04 shows rapid WCW accumulation reaching 1149 mg/3mL. Volume correction (V(t) = V_initial + cumulative_feed + supplements − sampling) is essential — DCW = 0.25 × WCW (Shuler & Kargi, 2002).',
          chartId: 'wcw',
        },
        {
          type: 'chart',
          title: 'Reactor Volume Reconstruction V(t)',
          description: 'Estimated reactor volume over time: V(t) = batch medium + cumulative feed + supplements − sampling losses (~3 mL/sample). B04–B06 show significant volume increases from higher absolute feed rates and supplement additions.',
          chartId: 'reactorVolume',
        },
        {
          type: 'chart',
          title: 'Total DCW Mass (Volume-Corrected)',
          description: 'Total dry cell weight mass = DCW (g/L) × V(t). This is the true productivity metric — concentration alone is misleading in fed-batch. B04 produces the highest total biomass despite shorter duration.',
          chartId: 'totalDCWMass',
        },
        {
          type: 'text',
          title: 'Key Method',
          description: 'V(t) = V_initial + cumulative_feed + supplements − sampling. DCW = 0.25 × WCW. Total DCW mass = DCW (g/L) × V(t). Batches B04, B05, and B06 are the most important and are the primary focus.',
        },
      ],
    },
    {
      id: 'h2',
      title: 'Growth phase segmentation and inoculum concentration determine batch performance',
      description: 'Identifying exponential, linear, and stationary growth phases — combined with varying inoculum concentrations — can explain why some batches outperform others. Higher inoculum may reduce lag phase but could also affect long-term productivity.',
      verdict: 'supported',
      verdictSummary: 'B04 (highest inoculum at 8.64 g/L) showed the highest growth rates overall but had to be stopped at 72h. B06 (lowest inoculum at 1.5 g/L) was metabolically the most stable.',
      evidence: [
        {
          type: 'chart',
          title: 'Specific Growth Rate (μ) Over Time',
          description: 'μ computed from total DCW mass (not concentration) to avoid dilution artifact. B04 has the highest growth rates overall. B05 is noisy up to 20h. Most batches start in exponential phase.',
          chartId: 'growthRate',
        },
        {
          type: 'table',
          title: 'Inoculum Concentrations',
          description: 'The inoculum concentrations varied significantly between key batches. It is not clear if this was intentional.',
          tableData: {
            headers: ['Batch', 'Inoculum (g/L)', 'Result'],
            rows: [
              ['B04', '8.64', 'Highest growth rates — best performer but early termination at 74h'],
              ['B05', '4.01', 'Noisy early growth (10h lag), extended to 120h'],
              ['B06', '1.5', 'Most metabolically stable culture of all 6 batches'],
            ],
          },
        },
      ],
    },
    {
      id: 'h3',
      title: 'Dissolved oxygen above 20% saturation does not limit growth rate',
      description: 'The critical dissolved oxygen concentration (C_critical) for S. cerevisiae is 10–15% air saturation. DO values above 20% should not be growth-limiting. This hypothesis tests whether the observed pO₂–growth rate correlations are causal or coincidental.',
      verdict: 'supported',
      verdictSummary: 'Although correlations appear between DO and growth rate (especially in B03), DO values remained above 20% and were NOT limiting. The correlation is coincidental, not causal.',
      evidence: [
        {
          type: 'chart',
          title: 'Dissolved Oxygen (pO₂) Profiles',
          description: 'pO₂ (% air saturation) over time. B03 shows the best pO₂ profile with steady decline into the productive 30–50% range. B02 hits 20% (limitation threshold). B06 has no pO₂ data available.',
          chartId: 'po2',
        },
        {
          type: 'chart',
          title: 'pO₂ + μ Cross-Correlation (Dual Axis)',
          description: 'Overlay of dissolved oxygen (solid) and specific growth rate μ (dashed) per batch. Visual correlation ≠ causation: pO₂ remains above C_critical (10–15%) in all batches, so DO is not growth-limiting. B06 excluded (no pO₂ probe data).',
          chartId: 'po2MuDualAxis',
        },
        {
          type: 'text',
          title: 'Cross-Correlation Finding',
          description: 'Although there appears to be correlation between DO and growth rate in B03, there is no causation. C_critical for S. cerevisiae is 10–15% air saturation — DO values above 20% are NOT limiting. B03 achieved the best pO₂ profile and drove growth consistently to 65 g/L DCW without oxygen limitation, keeping pO₂ in the productive 30–50% range.',
        },
      ],
    },
    {
      id: 'h4',
      title: 'Carbon balance efficiency (Yx/s) predicts overall batch quality',
      description: 'The biomass yield on glucose (Yx/s) provides a direct measure of how efficiently carbon is being converted to biomass versus lost to ethanol and CO₂. Higher yields indicate less Crabtree overflow and better process control.',
      verdict: 'supported',
      verdictSummary: 'B04 achieved the best yield at 0.35 g/g ("Solid" tier). B01/B02 at 0.14 g/g produced significant ethanol. B05/B06 performance at bench scale was insufficient.',
      evidence: [
        {
          type: 'chart',
          title: 'Carbon Balance — Biomass Yield (Yx/s) by Batch',
          description: 'Yield tiers: "Elite" (0.42–0.48 g/g) = perfectly tuned, no Crabtree. "Solid" (0.38–0.42 g/g) = minor ethanol leaks. B04 performs best, likely producing the least ethanol.',
          chartId: 'carbonBalance',
        },
        {
          type: 'chart',
          title: 'Full Carbon Balance — Glucose In vs Theoretical Max vs Actual DCW',
          description: 'Grouped bar comparing total glucose fed (g), theoretical maximum DCW at elite Yx/s (0.48 g/g), and actual DCW produced per batch. Assumes 500 g/L glucose feed concentration. The gap between theoretical and actual represents carbon lost to ethanol, CO₂, and maintenance.',
          chartId: 'fullCarbonBalance',
        },
        {
          type: 'text',
          title: 'Yield Interpretation',
          description: 'Assumption: All glucose fed is taken up. B01/B02 at 0.14 g/g — cells produce a lot of ethanol. B03 at 0.25 g/g — moderate ethanol production. B04 at 0.35 g/g — approaching "Solid" tier. B05/B06 at 0.25/0.14 g/g — bench-scale performance is not good enough.',
        },
      ],
    },
    {
      id: 'h5',
      title: 'Specific glucose feed rate determines Crabtree effect risk and maintenance burden',
      description: 'The specific glucose uptake rate (qs) has defined efficiency zones: qs > 0.25 g/g/h triggers ethanol production (Crabtree effect), qs < 0.10 causes starvation, and 0.12–0.20 g/g/h is the optimal range. Additionally, at low qs values, maintenance energy consumption becomes a significant tax on glucose utilization.',
      verdict: 'supported',
      verdictSummary: 'B01–B03 suffered Crabtree effect (qs too high). B05/B06 experienced starvation (qs too low). Only B04 maintained qs mostly in the optimal 0.12–0.20 g/g/h range.',
      evidence: [
        {
          type: 'chart',
          title: 'Feed Rate Profiles — All Batches',
          description: 'Feed rate over time for all batches. B04 shows the most controlled feeding strategy with variable segment rates. B05/B06 ramp aggressively in late phases.',
          chartId: 'feedRate',
        },
        {
          type: 'chart',
          title: 'Glucose Mass Balance — Fed vs Consumed (B04–B06)',
          description: 'Cumulative glucose fed over time (solid) vs estimated glucose consumed for biomass production (dashed, using avg Yx/s ≈ 0.30). The gap represents glucose lost to ethanol, CO₂, and maintenance. B05/B06 show large surplus — cells could not metabolize all glucose fed.',
          chartId: 'glucoseMassBalance',
        },
        {
          type: 'text',
          title: 'Maintenance Energy Tax',
          description: 'At qs = 0.05 g/g/h (B05/B06 late-phase), maintenance consumes ~20% of glucose — cells were "eating to survive" not "eating to grow." B05 suffered high initial stress (10h lag) + extended duration (120h) = maximum maintenance rent paid. B06 spike at 30h (~0.31 g/g/h) likely triggered ethanol and diauxic shift for the rest of the run.',
        },
      ],
    },
    {
      id: 'h6',
      title: 'Nutritional supplements and in-situ extraction improve yield and extend viability',
      description: 'Three supplement strategies were tested across B04–B06: amino acids + YNB (biosynthetic support), tocopherol/Vitamin E (antioxidant protection), and IPM solvent overlay (in-situ carotenoid extraction to reduce intracellular toxicity).',
      verdict: 'supported',
      verdictSummary: 'Each supplement had a clear, distinct effect. Amino acids improved yield. Tocopherol extended viability. IPM was the most effective at reducing toxicity. The missing piece for B04 was IPM.',
      evidence: [
        {
          type: 'chart',
          title: 'Supplement Impact — Batch Duration & Final Biomass',
          description: 'Comparison of batch outcomes by supplement strategy. B01–B03 (no supplements) died at 82–96h. B04 (amino acids + tocopherol, no IPM) died at 74h. B05/B06 (tocopherol + IPM) survived to 120h.',
          chartId: 'supplementComparison',
        },
        {
          type: 'chart',
          title: 'OD600 / WCW Ratio Over Time',
          description: 'OD-to-WCW ratio tracks cell morphology changes. A dropping ratio indicates cells becoming denser/heavier (pigment accumulation, stress granules). B01–B03 (Hitachi spectrophotometer) show different baseline ratios from B04–B06 (LABMAN), reflecting instrument calibration differences.',
          chartId: 'odWcwRatio',
        },
        {
          type: 'table',
          title: 'Supplement Effects — Qualitative Analysis',
          description: 'Detailed breakdown of each supplement\'s purpose and observed effect across batches.',
          tableData: {
            headers: ['Supplement', 'Batches', 'Purpose', 'Effect'],
            rows: [
              ['Amino acids + YNB', 'B04', 'Relieve biosynthetic bottleneck, supply vitamins', 'Improved biomass yield significantly. However, product accumulation caused toxicity → early death + non-pigmented cells.'],
              ['Tocopherol (Vitamin E)', 'B04, B05, B06', 'Antioxidant — protect carotenoid from oxidative degradation', 'Increased culture viability. B01–B03 (no tocopherol) died 82–96h. B05/B06 survived to 120h. Did NOT fully prevent pigment loss.'],
              ['IPM (solvent overlay)', 'B05, B06', 'In-situ extraction — remove carotenoid from cells', 'Very effective in reducing toxicity. B06 most stable culture of all 6 batches. Missing from B04 — the key gap.'],
            ],
          },
        },
      ],
    },
    {
      id: 'h7',
      title: 'Oxygen uptake shifts from growth to maintenance in late fermentation phases',
      description: 'Using the Pirt equation (OUR = (μ / Y_XO2_max + mO₂) × X), oxygen uptake can be decomposed into growth-associated and maintenance components. As growth slows in late phases, maintenance oxygen demand should dominate.',
      verdict: 'supported',
      verdictSummary: 'Majority of O₂ was used for maintenance in late phases across all batches. Even B04 (best performer) showed 66% maintenance by hour 75. B06 was metabolically more stable than B05.',
      evidence: [
        {
          type: 'chart',
          title: 'OUR — Growth vs. Maintenance Decomposition',
          description: 'Estimated oxygen uptake rate decomposition using Pirt equation: mO₂ = 1.0 mmol O₂/g DCW/h (Pirt, 1965; Verduyn et al., 1991). Growth-associated OUR declines as μ drops, while maintenance OUR increases with biomass accumulation.',
          chartId: 'ourDecomposition',
        },
        {
          type: 'text',
          title: 'kLa & Oxygen Transfer Observations',
          description: 'kLa values far exceed typical bench-scale range (100–400 h⁻¹). B04 kLa is physically implausible — artefact of (C*−C_L) nearing zero. B04 was receiving amino acids and YNB and may not have needed to oxidize glucose, so its O₂ uptake is low. Its high biomass drove productivity, but product turned toxic, causing cell death and non-pigmented cells ~80h. The kLa profile of B03 looks the best.',
        },
      ],
    },
  ],

  recommendations: [
    {
      title: 'Aeration-Agitation Strategy',
      source: 'from B03',
      description: 'B03 achieved the best pO₂ profile and drove growth consistently to 65 g/L DCW without oxygen limitation. Its aeration strategy kept pO₂ in the productive 30–50% range.',
      icon: 'wind',
    },
    {
      title: 'Nutritional Supplements',
      source: 'from B04',
      description: 'Amino acids + YNB + Tocopherol. The amino acid supplementation in B04 drove the highest biomass yield (0.35 g/g). Tocopherol extends viability via antioxidant protection.',
      icon: 'pill',
    },
    {
      title: 'In-Situ Solvent Extraction',
      source: 'from B05/B06',
      description: 'IPM overlay for in-situ product extraction. Prevents intracellular carotenoid toxicity — the factor that killed B04 at 74h despite excellent growth.',
      icon: 'flask-round',
    },
  ],

  executiveSummary: {
    heading: 'Executive Summary',
    bullets: [
      'Six fed-batch fermentation runs of carotenoid-producing S. cerevisiae were analyzed across multiple quantitative dimensions — biomass, metabolic efficiency, oxygen transfer, and supplement effects.',
      'B04 was the best performer by growth rate and biomass yield (Yx/s = 0.35 g/g), but lacked IPM for in-situ product extraction, leading to carotenoid toxicity and early termination at 74h.',
      'B05/B06 survived to 120h thanks to tocopherol + IPM, but suffered from suboptimal glucose feed rates causing starvation and high maintenance energy costs.',
      'B03 delivered the best oxygen transfer profile (pO₂ in 30–50% productive range) and the most physically reasonable kLa values.',
      'The optimal next run should combine: B03\'s aeration strategy + B04\'s amino acid/YNB supplementation + B05/B06\'s IPM solvent overlay.',
      'Dissolved oxygen was NOT a limiting factor in any batch (all above C_critical of 10–15%), disproving the hypothesis that DO limitation caused growth stalls.',
      'Maintenance energy tax was significant: at low specific feed rates (qs = 0.05 g/g/h), ~20% of glucose was consumed just for cell survival, not growth.',
    ],
  },
}
