// Tune page content. Edit this file to change page copy.
// Narrative architecture (post-IA recomposition):
//   §01 Hero
//   §02 Problem space — diagnostic tension
//   §03 How Tune works — methodology / system
//   §04 Engagement model — how to start
//
// Source content traces back to Lemnisca_Tune_Thrust_v1.2.html (the original deck).
// No source content has been removed in the recomposition — pieces have been
// reordered and reframed only.

import { productPageSchema, type ProductPageContent } from './schema';

const tuneContent: ProductPageContent = {
  product: 'tune',

  meta: {
    title: 'Tune · fermentation readiness and optimization · Lemnisca',
    description:
      'A Free 10-day sprint reads your strain, baseline, and assay drift, then returns a prioritized experiment plan, variance decomposition, and paid-fit verdict.',
    canonical: 'https://lemnisca.bio/',
  },

  // Mini-TOC reflects the new 4-section narrative architecture.
  sectionToc: [
    { number: '01', label: 'Tune', anchor: '#hero' },
    { number: '02', label: 'Problem', anchor: '#problem' },
    { number: '03', label: 'How Tune works', anchor: '#how' },
    { number: '04', label: 'Engagement', anchor: '#engagement' },
  ],

  // §01 — Hero. Pure value-prop framing: bridge the 0→pilot gap.
  hero: {
    eyebrow: '',
    headlinePre: 'Move promising molecules from shake ',
    headlineAccent: 'flask to pilot',
    headlineMid: ' fermenters ',
    headlineAccent2: '5x faster',
    headlinePost: '',
    sub: 'Lemnisca\'s Tune accelerates early-stage fermentation programs by turning data into decisions. Stop wasting runs on blind optimization. Let Tune guide your next experiment using what your data has already taught it, so you hit productivity targets faster.',
    primaryCta: {
      label: 'Request a Tune fit conversation',
      href: 'https://calendly.com/pushkar-lemnisca/30min',
      variant: 'primary',
    },
  },

  // §02 — Problem space. Diagnostic tension; 4 linked problems verbatim from Slide 4.
  // Lead second sentence from Slide 2 ("noise drowns the signal"). Renumbered to 02.
  problemSection: {
    number: '02',
    eyebrow: 'PROBLEM',
    headline: 'Biology proven. Bioprocess still unproven.',
    lead: 'Most programs don’t stall because the molecule has no potential. They stall because the process is not productive, reproducible, and ready for pilot-scale investment.',
    items: [
      {
        index: '01',
        label: 'ACUTE TRIGGER',
        title: 'The molecule works. The process is not ready.',
        body: '',
      },
      {
        index: '02',
        label: 'PRODUCTIVITY',
        title: 'Productivity misses the pilot threshold.',
        body: 'The process is not producing enough, fast enough, to make the unit economics work.',
      },
      {
        index: '03',
        label: 'REPRODUCIBILITY',
        title: "Runs don't reproduce cleanly.",
        body: 'Every batch still feels like a new experiment, so each cycle starts from scratch.',
      },
      {
        index: '04',
        label: 'CONFIDENCE',
        title: 'Pilot investment needs confidence.',
        body: 'Larger reactors and larger budgets need evidence that the process can deliver beyond the bench.',
        punchline: 'Budget goes in. Clarity does not come out.',
      },
    ],
  },

  engagementJourney: {
    number: '04',
    eyebrow: 'HOW TUNE WORKS',
    headline: 'Audit, model, optimize, deliver.',
    intro:
      'Tune combines bioprocess engineering, process data, modelling, and experimental strategy into a structured program that takes your process from where it is to pilot‑ready.',
    trustLine:
      'Diagnose the process → Run the learning loops → Validate recommendations → Build the pilot-ready package',
    steps: [
      {
        index: '01',
        title: 'Audit',
        body: 'Tune reviews the strain, media, recipe, assays, prior data, and the constraints that define the current process.',
      },
      {
        index: '02',
        title: 'Model',
        body: 'Tune builds a predictive model of your fermentation, calibrated to your strain biology, process design, and reactor physics. The model explains current performance and predicts how it responds to change.',
      },
      {
        index: '03',
        title: 'Optimize',
        body: 'Each cycle, Tune simulates thousands of experiments to find the conditions that increase productivity. Your team validates the top candidates in the wet lab, and the model gets sharper with every round.',
      },
      {
        index: '04',
        title: 'Deliver',
        body: 'Tune hands over the optimized process conditions, expected performance, remaining risks, and the pilot run protocol.',
      },
    ],
    transitionLine: 'Each pass through the loop makes the next run more targeted and more legible.',
    programHeadline: 'A guided path from diagnosis to pilot readiness.',
    programIntro:
      'Tune carries the process reasoning between rounds, so the team stops spending time re-learning what the last experiment should already have settled.',
    loopNodes: ['Wet experiment', 'Data', 'Predictive model', 'Recommendation', 'Next run'],
    modelLabel: 'PREDICTIVE MODEL',
    modelPoints: [
      'Learns from each run',
      'Ranks process variables',
      'Tracks uncertainty',
      'Recommends the next experiment',
      'Narrows the feasible region',
    ],
    heavyLiftingTitle: 'Lemnisca carries the technical heavy lifting.',
    heavyLiftingBody:
      'We handle the modelling, experimental design, interpretation, and next-run recommendation so your team does not burn months in unguided iteration.',
    modes: [
      {
        letter: 'A',
        title: 'Partner wet lab + Lemnisca dry lab',
        description:
          'Your team or wet-lab partner runs the experiments. Lemnisca designs, models, interprets, and recommends each next run.',
        bestFit: 'Best when you already have lab capacity.',
      },
      {
        letter: 'B',
        title: 'Lemnisca integrated wet + dry lab',
        description:
          'Lemnisca runs the wet lab and modelling loop together as one integrated team.',
        bestFit: 'Best when speed or lab capacity is the bottleneck.',
      },
    ],
  },

  // §03 — Solution / system explanation.
  // The section now explains the decision layer in a static 3-part structure:
  // Evidence In -> Hybrid Model -> Decisions Out.
  paidLoop: {
    number: '03',
    headline: 'Tune replaces guesswork with a systematic path to pilot.',
    intro:
      'It establishes your baseline, finds the variables that move productivity, and uses every run to build the case for pilot-scale investment.',
    solutionBento: {
      featureTitle: 'Move from proven molecule to proven bioprocess.',
      featureBody: 'Tune delivers a productive, reproducible process ready for pilot-scale investment.',
      children: [
        {
          title: 'Establish the baseline.',
          body: 'Tune first determines what your process reliably does today: productivity, variability, assay confidence, and run-to-run repeatability.',
        },
        {
          title: 'Find the process levers.',
          body: 'Tune identifies which variables are actually moving titre, yield, productivity, and reproducibility.',
        },
        {
          title: 'Turn R&D runs into process evidence.',
          body: 'Each experiment is designed to reduce a specific uncertainty and move the process closer to pilot-scale acceptance.',
        },
      ],
    },
    vizCaption: 'Every experiment updates the model. Every model update improves the next experiment.',
    chipsLabel: 'Candidate variables',
    loopNodes: [
      { label: 'Initial design' },
      { label: 'Run experiments' },
      { label: 'Train hybrid model + uncertainty' },
      { label: 'Recommend next experiments' },
      { label: 'Update feasible region' },
    ],
    candidates: [
      { label: 'pH' },
      { label: 'DO' },
      { label: 'Feed rate' },
      { label: 'Temperature' },
      { label: 'Induction' },
      { label: 'Media' },
      { label: 'Agitation' },
      { label: 'Inoculum' },
    ],
    evidenceInputs: [
      { label: 'Run history' },
      { label: 'Recipes' },
      { label: 'Feed strategy' },
      { label: 'Assay notes' },
      { label: 'Metadata' },
      { label: 'Deviations' },
    ],
    modelComponents: [
      { label: 'Biological constraints' },
      { label: 'Process logic' },
      { label: 'Experimental data' },
      { label: 'Uncertainty tracking' },
    ],
    decisionOutputs: [
      { label: 'Readiness verdict' },
      { label: 'Variable ranking' },
      { label: 'Next-run recommendation' },
      { label: 'Uncertainty map' },
      { label: 'Feasible-region update' },
      { label: 'Pilot-readiness confidence' },
    ],
    modelTagline: 'MECHANISTIC + STATISTICAL · UNCERTAINTY-AWARE',
    microcopy: 'Every experiment updates the model. Every model update improves the next experiment.',
    // The mode cards are rendered in §04 (Engagement) — the structure of the
    // partnership belongs with the engagement narrative, not the method.
    modesLabel: 'Two engagement modes',
    modes: [
      {
        letter: 'A',
        title: 'Partner wet lab + Lemnisca dry lab',
        body: 'Customer or partner runs experiments. Lemnisca designs, models, interprets, and recommends.',
      },
      {
        letter: 'B',
        title: 'Lemnisca integrated wet + dry lab',
        body: 'Lemnisca runs the wet lab and the modelling loop together as one team.',
      },
    ],
  },

  deliverablesSection: {
    eyebrow: 'What Tune delivers',
    headline: 'Tune delivers a pilot-ready process.',
    intro:
      'Tune delivers optimized process conditions, a pilot run protocol, and model-backed expectations. Everything your team needs to execute the first pilot run with confidence.',
    note:
      'Tune does not replace your wet lab. It helps your wet lab learn faster, decide better, and arrive at a process that is ready to be tested at pilot scale.',
    packageLabel: 'Pilot-Ready Process Package',
    cards: [
      {
        title: 'Optimized process window.',
        body:
          'The recommended process conditions, critical ranges, control logic, and expected bench-scale performance.',
        hoverNote:
          'Helps the team know what to run and where the process has room to operate.',
      },
      {
        title: 'First pilot run protocol.',
        body:
          'A practical plan for what to run, what to measure, what to watch, and how to decide during the pilot.',
        hoverNote:
          'Turns bench learning into a practical first pilot execution plan.',
      },
      {
        title: 'Expected performance and risk signals.',
        body:
          'Model-backed ranges, key uncertainties, early warning signals, and success criteria for the pilot run.',
        hoverNote:
          'Sets expected ranges, warning signs, and success criteria before the batch begins.',
      },
    ],
  },

  // §03 — How Tune works · System outputs.
  // Reframed from "What the paid engagement delivers" → what the method produces.
  // Same 5 deliverables (verbatim from Slide 5 paid column). "What you bring"
  // for the paid tier moves out of focus here — kept for schema continuity but
  // visual placement is reconsidered in the §03 redesign pass.
  paidDeliverables: {
    number: '03',
    headline: 'What the method produces.',
    blockLabel: 'System outputs',
    deliverables: [
      {
        index: '01',
        title: 'Trained hybrid model',
        body: 'Mechanistic + data-driven + uncertainty model of your process.',
      },
      {
        index: '02',
        title: 'Validated operating region',
        body: 'Design space where KPIs are met, validated by experiment.',
      },
      {
        index: '03',
        title: 'Adaptive experiment campaigns',
        body: '3–6 iterations: design → run → model update → recommend.',
      },
      {
        index: '04',
        title: 'Measured KPI uplift',
        body: 'Titre / yield / productivity improvement, with confidence.',
      },
      {
        index: '05',
        title: 'Operating recipe + envelope',
        body: 'SOP-ready recipe with scale-aware operating limits.',
      },
    ],
    whatYouBring: {
      label: 'Operating prerequisites',
      items: [
        'Locked baseline w/ CV target met',
        'Defined variable ranges',
        'Assay precision data',
        'Structured experiment records template',
      ],
    },
  },

  // §04 — Engagement · Step 1: the 10-day technical answer.
  // All deliverables and "what you bring" verbatim from Slide 5 (free column).
  // Reframed from "What the sprint returns" → first conversation / entry point.
  sprintReturns: {
    number: '04',
    headline: 'Step 1: A 10-day technical answer.',
    blockLabel: 'Free · Tune Readiness Sprint · 10 days',
    deliverables: [
      {
        index: '01',
        title: 'Readiness verdict',
        body: 'Ready / partially ready / not ready, with blockers.',
      },
      {
        index: '02',
        title: 'Risk map',
        body: 'Variance decomposition: biology, process, assay, data.',
      },
      {
        index: '03',
        title: 'Data gap summary',
        body: 'Minimum dataset: run types, measurements, frequency.',
      },
      {
        index: '04',
        title: 'Prioritised experiment plan',
        body: 'Top 5 variables and ranges, with effect direction.',
      },
      {
        index: '05',
        title: 'Paid-fit recommendation',
        body: 'Optimize now / fix baseline / defer.',
      },
    ],
    outputLine:
      'Output: technical report and an expert walkdown of findings with your team.',
    whatYouBring: {
      label: 'What you bring',
      items: [
        'Strain ID + version',
        '≥ 3–5 baseline runs',
        '≥ 5 perturbation runs',
        'Assay calibration',
        'Deviations & lots',
      ],
    },
  },

  // §04 — Engagement · The verdict.
  // Reframed from "When the sprint moves to paid" → unified decision artifact.
  // Caption + 5 rows verbatim from Slide 6.
  decisionTable: {
    number: '04',
    headline: 'The verdict.',
    caption:
      'The sprint resolves into one of five readiness states. Each state determines whether, and how, paid optimization is justified.',
    columns: ['Sprint finding', 'What it means', 'Engagement next step'],
    rows: [
      {
        finding: 'Baseline reproducible (CV ≤ target), titre below target',
        meaning: 'System is stable enough to isolate true effects from noise',
        nextStep: 'Hybrid-model-driven optimization on prioritised variables',
      },
      {
        finding: 'Assay validated; ≥ 3 candidate drivers compete for top effect',
        meaning: 'Data can rank variable importance and interactions',
        nextStep: 'Hybrid model + adaptive experiment design',
      },
      {
        finding: 'Controllable levers exist (feed, induction, DO setpoint, T)',
        meaning: 'Optimization can move titre/yield with measurable effect',
        nextStep: 'Iterative wet/dry optimization loop',
      },
      {
        finding: 'DO or kₐ limits already visible at small scale',
        meaning: 'Design space must respect scale-up constraints from day one',
        nextStep: 'Scale-aware hybrid-model optimization',
      },
      {
        finding: 'Replicate CV high, assay drift, or sparse runs',
        meaning: 'Paid optimization would learn noise, not biology',
        nextStep: 'Fix baseline or assays first; revisit in 4–6 weeks',
      },
    ],
  },

  // §04 — Engagement · Start.
  sprintCta: {
    number: '04',
    headline: 'If your process is the bottleneck, let\'s talk.',
    body: [
      'We\'re running a limited number of free 10-day sprints for teams between early data and pilot readiness.',
      'Our team reviews your current data, identifies what\'s blocking pilot readiness, and maps the exact next steps needed to get there.',
    ],
    steps: [
      'promising biology but a process that is not yet pilot-scale productive, reproducible, or ready for pilot-scale investment.',
      'Understand the program',
      'Review the data',
      'Identify the uncertainty',
    ],
    formLabels: {
      name: 'Name',
      email: 'Email',
      company: 'Company',
      program: 'Tell us about your program',
      programHelp: '5–10 lines is plenty: strain, scale, current data, and the decision in front of you.',
      source: 'How did you hear about us',
      submit: 'Share one program',
      submitting: 'Sending…',
    },
    sources: [
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'referral', label: 'Referral' },
      { value: 'search', label: 'Search engine' },
      { value: 'event', label: 'Event or conference' },
      { value: 'other', label: 'Other' },
    ],
    successHeadline: 'Received.',
    successBody:
      'Lemnisca will reply with a data request within two business days. Pushkar',
    errorMessage:
      'Something went wrong sending that. Please try again, or email us directly.',
    fallbackContact: 'pushkar@lemnisca.bio',
  },
};

export default productPageSchema.parse(tuneContent);
