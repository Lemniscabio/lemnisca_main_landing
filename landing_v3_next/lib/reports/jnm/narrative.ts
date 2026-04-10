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
  title: 'JNM Fed-Batch Fermentation Investigation',
  subtitle:
    'Biomass Underperformance and Carotenoid Yield Collapse in Bench-Scale Fermentation',

  problemStatement: {
    heading: 'Problem Statement',
    body:
      'A recombinant Saccharomyces cerevisiae strain (JNM) engineered to produce astaxanthin was evaluated across six fed-batch fermentations at bench scale (1.5–2 L working volume). The strain had demonstrated acceptable growth and carotenoid production in shake-flask conditions. Upon transfer to bench-top bioreactors, two problems emerged that were not resolved across any of the six runs:',
    bullets: [
      {
        title: 'Biomass underperformance.',
        text: 'Biomass yield (Yₓ/ₛ) in the bioreactor runs ranged from 0.14 to 0.35 g/g, compared to an expected bench-scale target of ≥0.38 g/g. The best-performing batch (B04) reached only 0.35 g/g; the worst (B01, B02) reached 0.14 g/g — less than one-third of the target.',
      },
      {
        title: 'Carotenoid yield collapse.',
        text: 'Fermenters showed  >50-fold drop in astaxanthin yield compared to shake-flask controls. In B06, astaxanthin accounted for only 4.4% of total carotenoids, versus 63.7% in the shake-flask reference condition.',
      },
    ],
    closingQuestion:
      'All six batches developed a population of non-pigmented (white) cells between hours 66 and 84 — a visible marker of carotenoid pathway failure — after which growth stalled and batches were terminated. The two batches in which isopropyl myristate (IPM) was added as an in-situ extractant (B05, B06) extended viable production to 120 hours, but still failed to match shake-flask productivity. The core question this report addresses is: why does the JNM strain fail to replicate its shake-flask performance in the bioreactor, and what is driving the progressive loss of pigmented, productive cells?',
    kpis: [
      { label: 'Batches Analyzed', value: '6', subtext: 'B01–B06', icon: 'flask-conical' },
      { label: 'Best Biomass Yield', value: '0.35 g/g', subtext: 'B04 (Yx/s)', trend: 'up', icon: 'trending-up' },
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
            'Per-batch comparison of total glucose fed (g), theoretical maximum DCW assuming Yx/s = 0.45 g/g (Roels), and actual DCW produced. Feed concentration assumed at 620 g/L (client batch reports). The gap between theoretical and actual represents carbon lost to ethanol, CO₂.',
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
        'Each supplement had a distinct, interpretable effect. Amino acids drove biomass yield. Tocopherol extended viability but did not prevent pigment loss. IPM was the most effective at reducing toxicity.',
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

    // ─── A8 (from deck Slide 10 + conversion-profile slide) ───────────────
    {
      id: 'a8',
      title: 'Astaxanthin yield and % conversion reduce significantly in fermenters',
      description: '',
      verdict: 'partially',
      verdictSummary:
        'Fermenters show > 50-fold drop in astaxanthin yield compared to the shake flasks. Conversion of carotenoid intermediates to astaxanthin drops from ~63% (shake flask, YNB AA + 20% IPM + 0.4% Toco T-5b) to ~4% (B06). The accumulation of pathway intermediates with only ~3.2% conversion of precursors to astaxanthin in B06 is consistent with metalloenzyme failure due to iron/copper depletion at WCW > 300 g/L.',
      evidence: [
        {
          type: 'chart',
          title: 'Total Yield of Astaxanthin per Batch',
          description:
            'Fermenters show > 50-fold drop in astaxanthin yield compared to the shake flasks. Batch I–VI achieve only 0.03–0.12 mg Asta/g WCW, whereas shake-flask conditions (YNB AA ± IPM ± Toco) reach 0.93–6.18 mg Asta/g WCW.',
          chartId: 'astaxanthinYield',
        },
        {
          type: 'chart',
          title: 'Carotenoid Conversion Profile — Shake Flask vs B06',
          description:
            'Per-process breakdown of carotenoid intermediates (% of total carotenoids). Shake-flask T-5b (YNB AA + 20% IPM + 0.4% Toco) converts ~63.7% of intermediates to astaxanthin, whereas B06 converts only ~4.4% — the rest accumulates as canthaxanthin (55.0%), zeaxanthin (40.6%), and β-carotene (38.6%), indicating the downstream oxidation steps are not running to completion.',
          chartId: 'carotenoidConversion',
        },
      ],
    },
  ],

  hypothesisDiscussion: {
    heading: 'Hypotheses',
    intro:
      'All six fed-batch runs of the JNM strain share a common terminal phenotype: non-pigmented (white) cells appear between h66 and h84, growth stalls, and carotenoid yield is far below shake-flask benchmarks. The following section presents four mechanistic hypotheses to explain this failure.',
    hypotheses: [
      {
        id: 'H1',
        title: 'Overflow Metabolism — Crabtree Effect',
        role: 'primary failure mode',
        lead:
          "S. cerevisiae preferentially ferments glucose to ethanol even under aerobic conditions when the rate of glucose supply exceeds the cell's respiratory capacity. This aerobic ethanol production — the Crabtree effect — wastes carbon, suppresses biomass yield, and competes with the mevalonate pathway for acetyl-CoA, the central precursor to carotenoid synthesis.",
        evidence: [
          {
            title: 'Evidence 1 — Low biomass yield',
            body:
              'Assuming glucose-limited conditions, the carbon balance shows that only 14–35% of the glucose taken up is converted to biomass (0.14 ≤ Yₓ/ₛ ≤ 0.35 g/g across batches; A4). For a well-run bench-scale aerobic fed-batch, Yₓ/ₛ should exceed 0.38 g/g. The depressed yield is consistent with partial oxidation of glucose to ethanol: the carbon flux diverted to ethanol competes directly with flux to acetyl-CoA, the entry point of the mevalonate pathway and the key precursor for carotenoid synthesis. B04 performs best at 0.35 g/g; B01/B02 are worst at 0.14 g/g. A8 also notes that fermenters show an average 96-fold* drop in astaxanthin yield and 8-fold* drop in total carotenoid yield compared to shake-flask controls — a magnitude that ethanol-driven flux diversion can plausibly explain.',
          },
          {
            title: 'Evidence 2 — Specific glucose feed rate above Crabtree threshold (Analysis 6: qₛ and Crabtree Risk)',
            body:
              'A5 calculates the specific glucose feed rate (qₛ) for each batch over time and benchmarks it against Crabtree risk zones: qₛ > 0.25 g/g/h triggers overflow metabolism (red zone); 0.12–0.20 g/g/h is the optimal respiratory window (green zone); qₛ < 0.10 g/g/h risks starvation (white zone). B01–B03 operate in the red zone at multiple timepoints, consistent with their low Yₓ/ₛ of 0.14 g/g. B04 spends most of its fed-batch phase in the green zone, consistent with its superior yield of 0.35 g/g. B05–B06 fall into the starvation zone for much of their extended runs. While B01–B03 are clearly Crabtree-affected throughout, it is worth noting that even a transient Crabtree episode at the start of feeding can trigger a metabolic switch to ethanol production that may be slow to reverse once glucose levels normalise.',
          },
        ],
        literature: [
          {
            citation:
              'Postma E, Verduyn C, Scheffers WA, Van Dijken JP (1989) Enzymic analysis of the Crabtree effect in glucose-limited chemostat cultures of Saccharomyces cerevisiae. Appl Environ Microbiol 55(2):468–477.',
            description:
              'Establishes the critical dilution rate of 0.30 h⁻¹ (equivalent to qₛ,꜀ᵣᵢₜ ≈ 3.3 mmol/g DCW/h ≈ 0.60 g/g/h) above which aerobic ethanol formation begins. Below this rate, Yₓ/ₛ ≈ 0.50 g/g; above it, yield drops sharply to 0.16 g/g. Provides the mechanistic and quantitative basis for the Crabtree risk zones used in Analysis 6.',
          },
          {
            citation:
              'Sonnleitner B, Käppeli O (1986) Growth of Saccharomyces cerevisiae is controlled by its limited respiratory capacity: formulation and verification of a hypothesis. Biotechnol Bioeng 28(6):927–937.',
            description:
              'Establishes the respiratory bottleneck model: ethanol is produced when glucose uptake exceeds maximum oxidative capacity. Provides the mechanistic framework for interpreting qₛ thresholds.',
          },
          {
            citation:
              'Shuler ML, Kargi F (2002) Bioprocess Engineering: Basic Concepts, 2nd ed. Prentice Hall.',
            description:
              'Referenced in A1 for the DCW = 0.25 × WCW conversion factor. Also provides benchmark Yₓ/ₛ values for aerobic yeast fermentation (0.40–0.50 g/g under fully respiratory conditions).',
          },
        ],
        whatWeNeed: [
          'Residual glucose concentration profiles. Without these, the glucose-limited assumption underlying the carbon balance (A4) cannot be verified.',
          'Ethanol accumulation trajectories to confirm onset and magnitude of overflow metabolism. Even end-of-batch measurements from archived samples would be informative.',
          'CO₂ evolution rate (CER) data to calculate the respiratory quotient (RQ). An RQ > 1.0 confirms net ethanol production.',
          'Feed addition timing log at fine resolution to assess lag between step-changes in feed rate and the DO response, which would clarify whether short-term Crabtree episodes occur at each step-change.',
        ],
      },
      {
        id: 'H2',
        title: 'Metalloenzyme Failure — Trace Metal Depletion at High Cell Density',
        role: 'primary failure mode',
        lead:
          'The late steps of the astaxanthin biosynthetic pathway — ketolase and hydroxylase — are iron- and copper-dependent oxidoreductases. At high cell density, intracellular demand for these metals can exceed delivery from the fixed-concentration trace metal stock, causing selective failure of non-essential heterologous pathway enzymes while essential housekeeping metalloproteins remain functional. This hypothesis explains the disproportionate accumulation of pathway intermediates relative to final product.',
        evidence: [
          {
            title: 'Evidence 1 — Collapse of astaxanthin conversion efficiency',
            body:
              'The carotenoid intermediate profile from A8 shows a dramatic shift between shake-flask and fermenter conditions. In the shake-flask control (YNB + AA + 20% IPM + 0.4% tocopherol), astaxanthin accounts for 63.7% of total carotenoids. In B06, this drops to 4.4%, with canthaxanthin at 55.0%, zeaxanthin at 40.6%, and β-carotene at 38.6%. The accumulation of canthaxanthin and zeaxanthin — which are direct substrates of the ketolase and hydroxylase enzymes respectively — is consistent with a specific block at the final two oxidation steps. These steps require iron or copper cofactors; their selective failure is the expected signature of trace metal limitation at high cell density.',
          },
          {
            title: 'Evidence 2 — High cell density in late fed-batch',
            body:
              'Analysis 1 shows that B06 produced the highest total biomass when volume-corrected. B04 reached wet cell weights of ~383 mg/mL and B03 ~262 mg/3 mL in the late fed-batch phase. At these densities, working volume had approximately doubled through continuous feeding, meaning trace metal delivery per cell had halved from the intended dose. Micronutrient limitation at high cell density is a known and well-documented phenomenon in fed-batch yeast processes.',
          },
          {
            title: 'Evidence 3 — Membrane rigidification compounds metal import failure (cross-link with H3)',
            body:
              'A7 notes that kLa estimates for B04 are physically implausible, attributed to (C*−Cₑ) approaching zero — consistent with reduced oxygen uptake in a cell whose carotenoid-induced membrane rigidification (H3) has impaired membrane-embedded metal transporter function. Liu et al. (2016) demonstrated directly that carotenoid-producing S. cerevisiae shows decreased membrane fluidity causing a secondary metal ion deficiency, providing an independent mechanistic path to metalloenzyme failure.',
          },
        ],
        literature: [
          {
            citation:
              'Liu P, Sun L, Sun Y, Shang F, Yan G (2016) Decreased fluidity of cell membranes causes a metal ion deficiency in recombinant Saccharomyces cerevisiae producing carotenoids. J Ind Microbiol Biotechnol 43(4):525–535.',
            description:
              'Direct experimental evidence that heterologous carotenoid production in S. cerevisiae reduces membrane fluidity and causes intracellular metal ion deficiency. Provides the mechanistic link between H3 (product toxicity) and H2.',
          },
          {
            citation:
              'Verduyn C, Postma E, Scheffers WA, Van Dijken JP (1991) Physiology of Saccharomyces cerevisiae in anaerobic glucose-limited chemostat cultures. J Gen Microbiol 136(3):395–403.',
            description:
              'Establishes maintenance oxygen coefficient mₒ₂ = 1.0 mmol O₂/g DCW/h, used in A7 Pirt decomposition. Also provides physiological benchmarks for aerobic yeast growth.',
          },
          {
            citation:
              'Verwaal R et al. (2007) High-level production of beta-carotene in Saccharomyces cerevisiae by successive transformation with carotenogenic genes from Xanthophyllomyces dendrorhous. Appl Environ Microbiol 73(13):4342–4350.',
            description:
              'Characterises the CrtYB/CrtI/CrtE pathway architecture used in X. dendrorhous-derived constructs, confirming which enzymatic steps are present and their cofactor requirements.',
          },
        ],
        whatWeNeed: [
          'HPLC carotenoid intermediate profiling at 3–4 timepoints per batch (phytoene, lycopene, β-carotene, canthaxanthin, zeaxanthin, astaxanthin). The single end-point comparison in A8 needs time-resolution to determine when the enzymatic block appears.',
          'Trace metal stock composition and dosing schedule — verify that per-cell delivery remains adequate as working volume doubles through the fed-batch.',
          'Confirmation of the specific enzymatic steps encoded in the JNM strain and their metal cofactor requirements.',
          'Verification of the 3.2% conversion figure with full methodology disclosure (extraction protocol, analytical standards, quantification method).',
        ],
      },
      {
        id: 'H3',
        title: 'Intracellular Product Toxicity from Carotenoid Accumulation',
        role: 'primary — drives H4',
        lead:
          'Carotenoids are large, rigid, hydrophobic C40 molecules that intercalate into the plasma membrane when they accumulate intracellularly. Unlike native producers such as X. dendrorhous, which have evolved lipid droplet machinery and membrane remodelling capacity for carotenoid storage, S. cerevisiae has neither. We propose that progressive intracellular carotenoid accumulation is the primary driver of the white-cell phenotype and is the upstream cause of the genetic instability described in H4.',
        evidence: [
          {
            title: 'Evidence 1 — IPM addition delays white-cell onset by ~30–40 hours',
            body:
              'A6 identifies IPM addition at h24 in B05 and B06 as the most effective intervention across all batches. White cells appear after h108 in both runs, compared to h66–84 in B01–B04. IPM functions as an in-situ extractant, partitioning intracellular carotenoids into the organic phase and continuously maintaining lower intracellular concentrations. If genetic instability were driven by an inherent property of the plasmid or by elapsed generation number, IPM addition would not delay its onset. The consistent ~30–40 hour delay is quantitatively consistent with the time required for intracellular carotenoid concentrations to re-accumulate to a cytotoxic threshold following extraction — implicating concentration, not time, as the proximate trigger.',
          },
          {
            title: 'Evidence 2 — Tocopherol extends culture viability but does not prevent pigment loss',
            body:
              'B01–B03 received no tocopherol and terminated at h82–96. B04–B06 received tocopherol (Vitamin E, an antioxidant) and survived to h74–120. However, tocopherol did not prevent pigment loss or the appearance of white cells in any batch. This supports a membrane-stress mechanism rather than pure oxidative degradation of carotenoids: antioxidant protection preserves carotenoid molecules once produced, but does not alleviate the physical rigidification of the membrane caused by their intercalation. B04 illustrates the ceiling of what is achievable with amino acid + YNB + tocopherol supplementation alone — the missing intervention was IPM-mediated extraction.',
          },
          {
            title: 'Evidence 3 — B04: highest growth rate, earliest failure',
            body:
              'A2 identifies B04 as the batch with the highest growth rates overall. A7 notes that B04 had physically implausible kLa estimates — attributed to (C*−Cₑ) approaching zero — and that B04 had the highest biomass and was terminated at h72–74 due to dead and non-pigmented cells. High growth rates generate high carotenoid synthesis flux, which fills intracellular storage capacity faster. B04 reached toxic intracellular concentrations earlier precisely because it grew better.',
          },
        ],
        literature: [
          {
            citation:
              'Verwaal R et al. (2010) Heterologous carotenoid production in Saccharomyces cerevisiae induces the pleiotropic drug resistance stress response. Yeast 27(12):983–998.',
            description:
              "Transcriptome analysis of carotenoid-producing S. cerevisiae shows specific induction of pleiotropic drug resistance (PDR) genes including ABC transporters PDR5, PDR10, PDR15, SNQ2, and YOR1. These are the cell's toxin-efflux machinery, activated when it detects carotenoids as toxic membrane-perturbing compounds. Deletion of PDR10 decreased the transformation efficiency of a plasmid carrying carotenogenic genes — the direct mechanistic link from product toxicity to plasmid instability.",
          },
          {
            citation:
              'Liu P et al. (2016) Decreased fluidity of cell membranes causes a metal ion deficiency in recombinant Saccharomyces cerevisiae producing carotenoids. J Ind Microbiol Biotechnol 43(4):525–535.',
            description:
              'Directly measures reduced membrane fluidity in carotenoid-producing yeast and demonstrates the resulting metal transporter impairment. Provides the biophysical mechanism by which product toxicity compounds metalloenzyme failure (H2).',
          },
          {
            citation:
              'Ro D-K et al. (2008) Production of the antimalarial drug precursor artemisinic acid in engineered yeast. Nature 440:940–943; supplementary data on plasmid stability.',
            description:
              'Closest published analogue to the JNM situation. In artemisinic acid-producing S. cerevisiae, plasmid stability was markedly lower than in strains producing only the upstream hydrocarbon amorphadiene. Inactivation of the oxidative enzyme restored plasmid stability, confirming product accumulation — not pathway enzyme expression — as the driver of instability. PDR gene expression was massively induced in the producing strain.',
          },
        ],
        whatWeNeed: [
          'Intracellular carotenoid concentration (mg/g DCW) at multiple timepoints in runs with and without IPM — to directly test whether the toxicity threshold is concentration-dependent.',
          'PDR gene expression profiling (RT-qPCR for PDR5, PDR10, SNQ2) over the course of a batch. Timing of PDR induction relative to white-cell onset is the key diagnostic test.',
          'Membrane fluidity measurement (laurdan generalised polarisation or fluorescence anisotropy) at early, mid, and late fed-batch phase.',
          'Growth rate comparison of isolated white-cell and pigmented-cell populations to quantify the fitness advantage conferred by loss of carotenoid production.',
        ],
      },
      {
        id: 'H4',
        title: 'Carotenoid Pathway Gene Loss — Genetic Instability',
        role: 'downstream consequence of H3',
        lead:
          'We propose that genetic instability — the expansion of non-pigmented, pathway-deficient cell subpopulations — is not an independent primary failure mode but the cellular adaptation to sustained product toxicity (H3). Cells that spontaneously lose the pathway expression cassette eliminate their source of membrane stress, recover a growth rate advantage, and progressively displace pigmented cells under the poor selection conditions of a yeast-extract-rich medium.',
        evidence: [
          {
            title: 'Evidence 1 — Gene loss through nullified auxotrophic selection pressure or gene silencing',
            body:
              'A6 notes that amino acid + YNB supplementation in B04 improved biomass yield significantly but may have caused loss of selection pressure if a Leu2 or His3 auxotrophic selection marker was used. The JNM medium contains 5 g/L yeast extract in the batch phase and 50 g/L in the feed, supplying a broad spectrum of amino acids and vitamins through non-selective uptake. If the complemented auxotrophic nutrient is present in excess, the selective advantage of plasmid-bearing cells is eliminated, and cells that have lost the plasmid face no growth penalty from the marker — only from carotenoid pathway expression.\nFor integrated constructs, glucose-repression chromatin remodelling can silence loci near sub-telomeric regions. PDR activation (driven by H3) may compound this by altering histone acetylation through competition for acetyl-CoA. Cells under this mechanism retain intact pathway DNA but produce no transcript — distinguishable only by RT-PCR.',
          },
          {
            title: 'Evidence 2 — Consistent onset window across platforms and scales',
            body:
              'White cells appear at h82 in B01, later stages of B02 (96h run), h84 in B03, and ~h74 in B04 — across two different bioreactor platforms (KLF 2000 and BIOSTAT B), two working volumes (1.5L and 2L), and different supplementation strategies. The consistency of onset across such different process conditions argues against a random genetic event and instead supports a threshold-dependent, concentration-driven mechanism. Under H4 as a downstream consequence of H3, this consistency is explained by the shared trajectory of intracellular carotenoid accumulation reaching a common cytotoxic threshold, rather than by any fixed genetic property of the strain.',
          },
          {
            title: 'Evidence 3 — IPM delays genetic instability phenotype (Analysis qualitative: Supplement Effects)',
            body:
              'As described under H3, the ~30–40 hour delay in white-cell onset in IPM-containing batches B05/B06 is the most direct evidence that genetic instability is concentration-driven rather than time-driven. A plasmid loss process operating on a fixed genetic clock would not be delayed by changing the intracellular product concentration.',
          },
        ],
        literature: [
          {
            citation:
              'Ro D-K et al. (2008) Production of the antimalarial drug precursor artemisinic acid in engineered yeast. Nature 440:940–943.',
            description:
              'Demonstrates directly that terpenoid product accumulation — not pathway enzyme expression — reduces plasmid stability in S. cerevisiae, through a mechanism involving PDR induction and growth rate penalty on producing cells.',
          },
          {
            citation:
              'Verwaal R et al. (2010) Heterologous carotenoid production in Saccharomyces cerevisiae induces the pleiotropic drug resistance stress response. Yeast 27(12):983–998.',
            description:
              'Deletion of PDR10 (an ABC transporter induced by carotenoid stress) specifically decreased transformation efficiency for carotenogenic plasmids, directly linking carotenoid membrane toxicity to reduced plasmid uptake and maintenance.',
          },
          {
            citation:
              'Sun J, Shao Z, Zhao H et al. (2012) Cloning and characterization of a panel of constitutive promoters for applications in pathway engineering in Saccharomyces cerevisiae. Biotechnol Bioeng 109(8):2082–2092.',
            description:
              'Discusses how selection marker choice and medium composition interact with plasmid stability in S. cerevisiae pathway engineering contexts.',
          },
        ],
        whatWeNeed: [
          'Confirm selection marker identity and verify that the fermentation medium genuinely depletes the complemented auxotrophic nutrient at the concentrations used.',
          'Molecular characterisation of isolated white-cell colonies: genomic PCR for pathway gene presence; RT-PCR for pathway gene transcription. This distinguishes plasmid loss (gene absent) from epigenetic silencing (gene present, no transcript).',
        ],
      },
    ],
    causalStructure: {
      heading: 'Summary: Proposed Causal Structure',
      intro:
        'The four hypotheses operate at different causal levels and interact with each other. H1 and H2 are independent primary failure modes that act on carbon flux and enzymatic capacity respectively. H3 is a third primary failure mode that acts on membrane integrity and cellular fitness — and is the upstream cause of H4, which is therefore a downstream cellular adaptation rather than an independent phenomenon.',
      rows: [
        {
          id: 'H1',
          title: 'Crabtree',
          text:
            'Primary, independent. Suppresses biomass yield and diverts carbon from the MVA pathway. Ethanol/acetaldehyde add membrane stress that compounds H4.',
        },
        {
          id: 'H2',
          title: 'Trace metals',
          text:
            'Primary, independent. Metalloenzyme failure causes late-pathway block (canthaxanthin/zeaxanthin accumulation). Also reinforced by H4 → membrane rigidification reduces metal transporter activity.',
        },
        {
          id: 'H3',
          title: 'Product toxicity',
          text:
            'Primary, upstream of H4. Carotenoid membrane intercalation triggers PDR response, reduces metal transporter efficiency (compounding H2), and creates growth rate penalty on producing cells that drives H4.',
        },
        {
          id: 'H4',
          title: 'Genetic instability',
          text:
            'Downstream consequence of H3. Not an independent failure mode. Plasmid-free or silenced cells outcompete producing cells because H3 imposes a fitness cost on the pathway. Amplified by loss of selection pressure in complex medium.',
        },
      ],
    },
    closingNote:
      'Recommended first experiments. (1) Offline glucose and ethanol from archived samples — tests H1 without any new runs. (2) HPLC carotenoid intermediates across timepoints — tests H2. (3) RT-qPCR for PDR5/PDR10/SNQ2 over a single batch — tests H4. (4) Confirm selection marker identity with the client — takes minutes and is foundational for interpreting H3.',
  },

  // Recommendations section temporarily emptied — replacement content pending.
  recommendations: [],

  executiveSummary: {
    heading: 'Executive Summary',
    intro:
      'Eight quantitative analyses of the fermenter and shake flask data were conducted, covering volume-corrected biomass, specific growth rate, growth phase segmentation, dissolved oxygen profiles, carbon balance, specific glucose feed rate, oxygen uptake rate decomposition, and carotenoid yield and % conversion. The analyses point to four interacting failure mechanisms, structured below in order of causal priority.',
    hypotheses: [
      {
        id: 'H1',
        title: 'Crabtree effect',
        finding:
          'Biomass yield (0.14–0.35 g/g) is well below the respiratory target of ≥0.38 g/g across all batches. Specific glucose feed rates exceeded the Crabtree threshold (qₛ > 0.25 g/g/h) in B01–B03 throughout, and transiently at fed-batch initiation in all batches. Carbon diverted to ethanol instead of the mevalonate pathway is the leading explanation for the >50-fold astaxanthin yield drop vs. shake flasks.',
        status:
          'Supported by carbon balance and qₛ analysis. Unconfirmed — no glucose or ethanol measurements available.',
      },
      {
        id: 'H2',
        title: 'Trace metal depletion',
        finding:
          'Astaxanthin accounts for only 4.4% of total carotenoids in B06, with canthaxanthin and zeaxanthin accumulating as intermediates. This pattern is consistent with failure of the iron/copper-dependent late-pathway enzymes (ketolase, hydroxylase) at high cell density, when per-cell trace metal delivery halves as working volume doubles through feeding.',
        status:
          'Supported by intermediate profile. Unconfirmed — no trace metal stock composition or time-resolved intermediate data available.',
      },
      {
        id: 'H3',
        title: 'Product toxicity',
        finding:
          'Carotenoids accumulating in the plasma membrane rigidify it, triggering the pleiotropic drug resistance (PDR) response and imposing a growth penalty on pathway-bearing cells. The 30–40 hour delay in white-cell onset in IPM-supplemented batches (B05/B06 vs. B01–B04) is the strongest available evidence that it is intracellular carotenoid concentration — not elapsed time or generation number — that triggers failure.',
        status:
          'Strongly supported by IPM delay effect and published transcriptomics (Verwaal et al. 2010). Unconfirmed mechanistically in JNM.',
      },
      {
        id: 'H4',
        title: 'Genetic instability',
        finding:
          'The progressive expansion of non-pigmented white cells is a downstream consequence of H3, not an independent failure mode. Product toxicity creates a fitness advantage for cells that lose the pathway. This is amplified by likely loss of auxotrophic selection pressure in yeast-extract-rich medium. The pattern is consistent with published analogues in terpenoid-producing yeast (artemisinic acid, Ro et al. 2008).',
        status:
          'Supported by temporal pattern and literature. Causal relationship to H3 unconfirmed — no molecular data on white-cell isolates available.',
      },
    ],
    closing:
      'The hypotheses are not mutually exclusive. H1, H2, and H3 can all operate simultaneously, and H4 is the proximate consequence of H3. The most actionable finding is that product toxicity — not an inherent genetic limitation of the strain — appears to be driving the instability. This is remediable: B06 is the most metabolically stable batch in the dataset precisely because IPM continuously extracts the carotenoid burden. The path to a productive bioreactor process likely requires combining controlled glucose feeding (to address H1) with in-situ extraction from the start of the run (to address H3 and thereby H4), and verifying trace metal adequacy at scale (H2).',
    bullets: [],
  },
}
