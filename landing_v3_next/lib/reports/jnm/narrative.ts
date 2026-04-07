import 'server-only'
import type { ReportNarrative } from '../types'

/**
 * Jananom report narrative — text content shown to the customer.
 *
 * Source of truth: `JNM_Fermentation-Analysis_Deck_v1-final.pdf`.
 * Numbers and conclusions in this file should match the deck verbatim.
 * Per-batch numerical data lives in `batches.generated.ts`.
 */

export const jnmNarrative: ReportNarrative = {
  company: { name: 'Jananom' },
  title: 'JNM Fermentation Data Analysis',
  subtitle:
    'Carotenoid-producing Saccharomyces cerevisiae — Fed-Batch Process Investigation',

  problemStatement: {
    heading: 'Problem Statement',
    body:
      'Six fed-batch fermentation runs (B01–B06) of carotenoid-producing Saccharomyces cerevisiae were conducted at bench scale. Despite shared protocols, batch outcomes varied dramatically — from early termination due to cell death (B01, B04) to extended 120-hour runs with widely different productivity and pigment stability (B05, B06). This analysis investigates the root causes of inter-batch variability through quantitative biomass, metabolic, and oxygen-transfer analyses, and identifies the combination of process levers that should drive the next campaign.',
    kpis: [
      { label: 'Batches Analyzed', value: '6', subtext: 'B01–B06', icon: 'flask-conical' },
      { label: 'Best Carbon Yield', value: '0.31 g/g', subtext: 'B06 (Yx/s)', trend: 'up', icon: 'trending-up' },
      { label: 'Highest Total Biomass', value: '365 g', subtext: 'B04 at 74h', trend: 'up', icon: 'activity' },
      { label: 'Max Duration', value: '120 h', subtext: 'B05 & B06', icon: 'clock' },
    ],
  },

  analyses: [
    // ─── A1 ────────────────────────────────────────────────────────────────
    {
      id: 'a1',
      title: 'Volume-corrected biomass reveals true productivity differences',
      description:
        'Concentration-only metrics (g/L) are misleading in fed-batch processes where reactor volume increases substantially from feeding. Volume-corrected total dry cell weight — DCW mass = DCW(g/L) × V(t) — accounts for dilution and is the true productivity metric.',
      verdict: 'supported',
      verdictSummary:
        'B06 produced the highest total biomass when volume-corrected, confirming that concentration-only metrics underestimate productivity in fed-batch systems.',
      evidence: [
        {
          type: 'chart',
          title: 'Reactor Volume Reconstruction V(t)',
          description:
            'Reconstructed reactor volume over time: V(t) = V_initial + cumulative feed + cumulative supplements − sampling losses (3 mL/sample). B06 reaches ~4.4 L at 120 h (largest expansion), B01 ends at ~3.0 L at 82 h (smallest). All six batches share the same 1500 mL batch medium; differences come from feed strategy and supplement volumes.',
          chartId: 'reactorVolume',
        },
        {
          type: 'chart',
          title: 'DCW Concentration (not volume-corrected)',
          description:
            'Dry cell weight concentration over time, computed as DCW = 0.25 × WCW (Shuler & Kargi, 2002). B04 reaches the highest concentration (~96 g/L) but in only 74 h. B01–B03 plateau at 48–65 g/L.',
          chartId: 'dcwConcentration',
        },
        {
          type: 'chart',
          title: 'Total DCW Mass (volume-corrected)',
          description:
            'Total dry cell weight in the reactor: DCW_mass = DCW(g/L) × V(t). This is the true productivity metric. B04 (365 g in 74 h) and B06 (364 g in 120 h) are essentially tied on absolute biomass; concentration alone hides this. B05 reaches 333 g.',
          chartId: 'totalDCWMass',
        },
        {
          type: 'text',
          title: 'Key Method',
          description:
            'V(t) = V_initial + cumulative_feed + supplements − sampling. DCW = 0.25 × WCW (Shuler & Kargi, 2002). Total DCW mass = DCW(g/L) × V(t). All batches share 1500 mL of batch medium; V_initial differs only because of the inoculum volume.',
        },
      ],
    },

    // ─── A2 ────────────────────────────────────────────────────────────────
    {
      id: 'a2',
      title: 'Specific growth rate (μ) computed from total biomass exposes phase transitions',
      description:
        'Growth rate computed from concentration is contaminated by dilution from feeding. Computing μ from total DCW mass — μ = d(ln X)/dt where X = DCW_mass — gives a clean signal for identifying exponential, linear, stationary, and decline phases.',
      verdict: 'supported',
      verdictSummary:
        'All batches start in exponential phase and decay through linear into stationary. B04 has the lowest sustained μ in linear phase (~0.04 h⁻¹) yet the highest absolute biomass — illustrating that high inoculum + supplementation  leads to high biomass.',
      evidence: [
        {
          type: 'chart',
          title: 'Specific Growth Rate (μ) Over Time',
          description:
            'μ = d(ln(DCW_mass))/dt, smoothed with a Savitzky-Golay filter (window = 5, order = 2). B01–B03 show steep early μ (0.18–0.21 h⁻¹) declining sharply by ~42 h. B04 stays low throughout (peak 0.06 h⁻¹). B05/B06 have broader peaks (0.07–0.10 h⁻¹) and longer linear phases.',
          chartId: 'growthRate',
        },
        {
          type: 'table',
          title: 'Inoculum Concentrations',
          description:
            'Inoculum concentration varied significantly between key batches. It is not clear from the records whether this was intentional.',
          tableData: {
            headers: ['Batch', 'Inoculum (g/L)', 'Outcome'],
            rows: [
              ['B04', '8.64', 'Highest absolute biomass; terminated at 74 h (pigment loss)'],
              ['B05', '4.01', 'Extended 120 h run; healthy linear phase to ~108 h'],
              ['B06', '1.5',  'Most stable culture of all six batches'],
            ],
          },
        },
      ],
    },

    // ─── A3 ────────────────────────────────────────────────────────────────
    {
      id: 'a3',
      title: 'Dissolved oxygen above 20% is not limiting growth',
      description:
        'C_critical for S. cerevisiae is 10–15% air saturation. pO₂ values above 20% should not be growth-limiting. This analysis tests whether observed pO₂–μ correlations are causal or coincidental.',
      verdict: 'supported',
      verdictSummary:
        'pO₂ never drops into the C_critical zone (10–15%) in any batch with available data. Although B03 shows visual correlation between pO₂ and μ, the correlation is coincidental, not causal — oxygen is not limiting growth in any batch.',
      evidence: [
        {
          type: 'chart',
          title: 'pO₂ + μ Cross-Correlation (per batch)',
          description:
            'Per-batch dual-axis overlay of dissolved oxygen (solid, left axis) and specific growth rate μ (dashed, right axis). C_critical zone (10–15%) shaded. Visual correlation does not imply causation: pO₂ never enters the critical zone, so DO is not the cause of declining μ.',
          chartId: 'po2MuDualAxis',
        },
      ],
    },

    // ─── A4 ────────────────────────────────────────────────────────────────
    {
      id: 'a4',
      title: 'Carbon balance (Yx/s) ranks the batches and quantifies overflow loss',
      description:
        'The biomass yield on glucose (Yx/s = g DCW / g glucose) is a direct measure of how efficiently fed carbon is converted to biomass versus lost to ethanol, CO₂, and maintenance. The theoretical aerobic maximum is ~0.45 g/g (Roels, 1983); deviations quantify overflow.',
      verdict: 'supported',
      verdictSummary:
        '1) B04 achieved the best yield at 0.35 g/g. B01,B02 at 0.14 g/g produced significant ethanol. B05,B06 performance at bench scale was insufficient.​ 2) Fermenters show an average of 96 fold drop in Astaxanthin yield and an average 8 fold drop in total carotenoids yield compared to the shake flasks. Diversion of carbon flux to ethanol instead of the mevalonate pathway may explain this.',
      evidence: [
        {
          type: 'chart',
          title: 'Carbon Balance — Biomass Yield (Yx/s) by Batch',
          description:
            'Benchmarks for Yx/s for lab-scale fermentations: Best-in-class Yx/s: 0.42–0.48 g/g that exhibit no crabtree; Good Yx/s: 0.38–0.42 g/g exhibit minor ethanol production. B04 performs best at 0.35g/g, likely producing the least ethanol.',
          chartId: 'carbonBalance',
        },
        {
          type: 'chart',
          title: 'Full Carbon Balance — Glucose In vs Theoretical Max DCW vs Actual DCW',
          description:
            'Per-batch comparison of total glucose fed (g), theoretical maximum DCW assuming Yx/s = 0.45 g/g (Roels), and actual DCW produced. Feed concentration assumed at 620 g/L (client batch reports). The gap between theoretical and actual represents carbon lost to ethanol, CO₂, and maintenance.',
          chartId: 'fullCarbonBalance',
        },
        {
          type: 'text',
          title: 'Yield Interpretation',
          description:
            'Assumption: all glucose fed is taken up (no residual glucose at end). B01–B03 at 0.14 g/g — cells produce a lot of ethanol. B05-B05 at 0.25 g/g — much less overflow, but B05-B06 bench-scale performance is still not good enough for a 2 L R&D reactor target. B04 at 0.35 g/g is the best of the six.',
        },
      ],
    },

    // ─── A5 ────────────────────────────────────────────────────────────────
    {
      id: 'a5',
      title: 'Specific glucose feed rate (qs) determines Crabtree risk and starvation regime',
      description:
        'Specific glucose feed rate has defined zones: qs > 0.25 g/g/h triggers ethanol production (Crabtree), qs < 0.10 causes starvation, and 0.12–0.20 g/g/h is the optimal range.',
      verdict: 'supported',
      verdictSummary:
        'B01–B03 spent significant time above the Crabtree threshold (qs > 0.25 g/g/h). B05/B06 dipped into the starvation zone in late phases. Only B04 maintained qs mostly in the 0.12–0.20 g/g/h optimal band — the cleanest qs profile of the six.',
      evidence: [
        {
          type: 'chart',
          title: 'Specific Glucose Feed Rate (qs) — All Batches',
          description:
            'qs over time, with shaded zones: red = Crabtree (qs > 0.25 g/g/h), green = best range (0.12–0.20 g/g/h), unshaded below 0.10 = starvation. B01–B03 sit above the Crabtree threshold throughout the early phase. B04 stays in the best range from ~24 h onward. B05/B06 cross into starvation in late phases.',
          chartId: 'qsRate',
        },
        {
          type: 'text',
          title: 'qs Efficiency Zones',
          description:
            'qs > 0.25 g/g/h → ethanol is produced (Crabtree effect). qs < 0.10 → starvation. 0.12–0.20 g/g/h is the best operating band. Observations: B01–B03 — Crabtree effect. B05/B06 — late-phase starvation. B04 — mostly in the best range.',
        },
      ],
    },

    // ─── A6 ────────────────────────────────────────────────────────────────
    {
      id: 'a6',
      title: 'Nutritional supplements and in-situ extraction together determine viability',
      description:
        'Three supplement strategies were tested across B04–B06: amino acids + YNB (biosynthetic support), tocopherol / Vitamin E (antioxidant protection of carotenoid), and IPM solvent overlay (in-situ extraction to reduce intracellular product toxicity).',
      verdict: 'supported',
      verdictSummary:
        'Each supplement had a distinct, interpretable effect. Amino acids drove biomass yield. Tocopherol extended viability but did not prevent pigment loss. IPM was the most effective at reducing toxicity. The missing piece for B04 was IPM.',
      evidence: [
        {
          type: 'table',
          title: 'Supplement Effects — Qualitative Analysis',
          description: "Each supplement's purpose and observed effect.",
          tableData: {
            headers: ['Supplement', 'Batches', 'Purpose', 'Effect'],
            rows: [
              [
                'Amino acids + YNB',
                'B04',
                'Relieve biosynthetic bottleneck, supply vitamins',
                'Improved biomass yield significantly. However, selection pressure may have been lost if Leu2 auotrophic selection marker was used causing non-pigmented cells.',
              ],
              [
                'Tocopherol (Vitamin E)',
                'B04, B05, B06',
                'Antioxidant — protect carotenoid from oxidative degradation',
                'Increased culture viability. B01–B03 (no toco) died 82–96 h. B05-B06 survived to 120 h. Did NOT fully prevent pigment loss.',
              ],
              [
                'IPM (solvent overlay)',
                'B05, B06',
                'In-situ extraction — remove carotenoid from cells',
                'Effective in reducing toxicity. B06 most stable culture of all six batches. ',
              ],
            ],
          },
        },
      ],
    },

    // ─── A7 ────────────────────────────────────────────────────────────────
    {
      id: 'a7',
      title: 'Oxygen uptake shifts from growth to maintenance in late phases',
      description:
        'Pirt equation: OUR = (μ / Y_XO₂_max + mO₂) × X. The OUR was estimated using literature values of Y_XO₂_max and mO₂.  As growth slows in late phases, maintenance oxygen demand dominates.',
      verdict: 'supported',
      verdictSummary:
        'Maintenance dominates O₂ consumption in late phases across all batches. Even B04 (best performer) shows ~66% maintenance by hour 75. B06 is metabolically more stable than B05.',
      evidence: [
        {
          type: 'chart',
          title: 'OUR — Growth vs Maintenance Decomposition (per batch)',
          description:
            'Stacked OUR (mmol O₂ / L · h) per batch, decomposed into growth-associated (μ-dependent) and maintenance (mO₂-dependent) components. mO₂ = 1.0 mmol O₂ / (g DCW · h) (Pirt 1965; Verduyn 1991). Maintenance term is always present and grows with biomass; in late phases it dominates.',
          chartId: 'ourDecomposition',
        },
        {
          type: 'chart',
          title: 'kLa Estimates from Oxygen Balance',
          description:
            'Volumetric oxygen transfer coefficient kLa = OUR / (C* − C_L), per batch. Typical bench-scale range is 100–400 h⁻¹ (shaded). B03 produces the most realistic kLa profile. B04 values are physically implausible — driving force (C* − C_L) approaches zero, blowing up the ratio. B06 has no pO₂ data and is excluded.',
          chartId: 'kLa',
        },
        {
          type: 'text',
          title: 'kLa & Oxygen Transfer Observations',
          description:
            'kLa values for B04 far exceed the typical bench-scale range (100–400 h⁻¹). The B04 kLa is physically implausible — an artefact of (C* − C_L) approaching zero because the culture was well-oxygenated and OUR was low. B04 was receiving amino acids and YNB and may not have needed to oxidise glucose, so its O₂ uptake stayed low.',
        },
      ],
    },

    // ─── A8 (NEW from deck Slide 10) ───────────────────────────────────────
    {
      id: 'a8',
      title: 'Astaxanthin yield collapses ~96-fold in fermenters vs shake flasks',
      description:
        'The deck reports a >90-fold drop in astaxanthin titre and an 8-fold drop in total carotenoids when moving from shake flasks to fermenters. The Crabtree effect alone cannot explain a drop of this magnitude. Two further mechanisms are proposed: product toxicity at high cell density, and possible genetic instability of the carotenoid pathway under selection pressure.',
      verdict: 'partially',
      verdictSummary:
        'Fermenters show an average 96-fold drop in astaxanthin yield and 8-fold drop in total carotenoids vs shake flasks. Crabtree partially explains it; the accumulation of pathway intermediates with only ~3.2% conversion to astaxanthin is consistent with metalloenzyme failure (Fe/Cu depletion) at WCW > 300 g/L, and white-cell phenotypes in B04 are consistent with loss of carotenoid pathway selection.',
      evidence: [
        {
          type: 'text',
          title: 'Headline Finding',
          description:
            'Fermenters show an average 96-fold drop in astaxanthin yield and an average 8-fold drop in total carotenoids yield compared to shake flasks. Although Crabtree effect might explain part of this, genetic stability is also a potential cause.',
        },
        {
          type: 'text',
          title: 'Pathway-Intermediate Hypothesis',
          description:
            'Accumulation of pathway intermediates with only ~3.2% conversion to astaxanthin may be a sign of metalloenzyme failure due to iron/copper depletion at WCW > 300 g/L. B04 reaches WCW ~383 g/L; B03 ~262 g/L. At those densities, micronutrient limitation becomes acute and trace-metal-dependent oxidation steps in the carotenoid pathway are the first to fail.',
        },
        {
          type: 'text',
          title: 'Genetic Stability Hypothesis',
          description:
            'White-cell phenotypes (loss of pigment without loss of growth) appearing in B04 around 80 h are consistent with loss of carotenoid-pathway selection — for example, loss of a Leu2 auxotrophic marker if used. Confirming this requires qPCR for carotenoid gene copy number and selection-marker tracking on the next campaign.',
        },
      ],
    },
  ],

  recommendations: [
    {
      title: 'Aeration & Agitation Strategy',
      source: 'from B03',
      description:
        'B03 achieved the best pO₂ profile and the only physically reasonable kLa values, driving growth consistently to 65 g/L DCW without oxygen limitation. Its aeration strategy keeps pO₂ in the productive 30–50% range and should anchor the next campaign.',
      icon: 'wind',
    },
    {
      title: 'Nutritional Supplements',
      source: 'from B04',
      description:
        'Amino acids + YNB + tocopherol. Amino-acid supplementation in B04 drove the highest biomass yield (0.25 g/g) and the largest absolute biomass (365 g). Tocopherol extends viability via antioxidant protection. Carry both forward.',
      icon: 'pill',
    },
    {
      title: 'In-Situ Solvent Extraction',
      source: 'from B05/B06',
      description:
        'IPM overlay for in-situ product extraction. Prevents intracellular carotenoid toxicity — the factor that killed B04 at 74 h despite excellent growth. B06 (with IPM) was the most stable culture of all six.',
      icon: 'flask-round',
    },
    {
      title: 'Genetic Stability Assays',
      source: 'from A8',
      description:
        'Add qPCR for carotenoid-pathway gene copy number and selection-marker tracking to the next campaign. Yield collapse versus shake flasks is too large to explain by Crabtree alone — genetic instability and trace-metal limitation at high WCW must be ruled out.',
      icon: 'flask-round',
    },
  ],

  executiveSummary: {
    heading: 'Executive Summary',
    bullets: [
      'Six fed-batch fermentation runs of carotenoid-producing S. cerevisiae were analysed across biomass, metabolic efficiency, oxygen transfer, and supplement strategy. B04 and B06 produced essentially equal absolute biomass (365 g and 364 g); B06 did so with the best carbon yield of all six.',
      'B06 achieved the highest biomass yield (Yx/s = 0.31 g/g) and the most stable culture of the six. Its combination of tocopherol + IPM + measured feed strategy is the closest of the six to a shippable bench protocol.',
      'B04 was the highest absolute-biomass performer (365 g in 74 h) but lacked IPM for in-situ product extraction, leading to carotenoid toxicity, white cells, and early termination at 74 h.',
      'B05/B06 survived to 120 h thanks to tocopherol + IPM, but suffered from suboptimal late-phase qs, dipping into starvation territory and paying a substantial maintenance-energy tax.',
      'B03 delivered the best oxygen-transfer profile (pO₂ in the 30–50% productive range) and the only physically reasonable kLa values — its aeration strategy should anchor the next campaign.',
      'Dissolved oxygen was NOT a limiting factor in any batch (all values stayed above C_critical of 10–15%), disproving the hypothesis that DO limitation caused growth stalls.',
      'The optimal next run should combine: B03\'s aeration strategy + B04\'s amino-acid / YNB supplementation + B05/B06\'s IPM solvent overlay + B06\'s late-phase qs control.',
      'Astaxanthin titre drops ~96-fold in fermenters vs shake flasks. Crabtree alone cannot account for this; product toxicity at high cell density and possible genetic instability of the carotenoid pathway must be investigated in the next campaign.',
    ],
  },
}
