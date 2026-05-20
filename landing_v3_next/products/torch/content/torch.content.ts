// Torch page copy — validated at module load against torchContentSchema.

import { torchContentSchema, type TorchContent } from './schema';

const torch: TorchContent = torchContentSchema.parse({
  meta: {
    title: 'Torch · fermentation scale-up risk predictor · Lemnisca',
    description:
      'Predict scale-up risk across oxygen, mixing, shear, CO₂, and heat. Find the bottleneck before pilot.',
    canonical: 'https://torch.lemnisca.bio',
  },
  hero: {
    headlinePre: 'Stop scaling up your fermentation process in the dark, carry your',
    headlineAccent: 'Torch',
    headlinePost: 'along',
    sub: 'Enter your lab-scale process parameters and get a comprehensive MOSCH report that qualitatively and quantitatively shows you how risky it is to scale-up your process from lab → pilot → industry.',
    primaryCta: { label: 'Run assessment', href: 'https://torch.lemnisca.bio/assess' },
    secondaryCta: { label: 'See an example assessment', href: 'https://torch.lemnisca.bio/example' },
    stats: [
      { value: 'Free', label: 'No cost, no pitch' },
      { value: '5', label: 'Risk domains covered' },
      { value: '100%', label: 'Assumptions visible' },
      { value: '90d', label: 'Report link persistence' },
    ],
  },
  mosch: {
    eyebrow: 'The MOSCH report · A new standard for fermentation scale-up',
    headlinePre: 'Five critical questions.',
    headlineAccent: 'One structured report.',
    domains: [
      {
        letter: 'M',
        name: 'Mixing',
        question: 'Is the tip speed low enough to dissipate gradients?',
        detail:
          'Scored on the ratio of liquid uptake time to mixing time. Slow mixing at large scale creates concentration gradients, starving cells unevenly and compromising yield reproducibility.',
      },
      {
        letter: 'O',
        name: 'Oxygen Transfer',
        question: 'Can my reactor deliver sufficient oxygen to the cells?',
        detail:
          'Scored on the ratio of OTR (oxygen transfer rate) to OUR (oxygen uptake rate). At large scale, kLa drops and oxygen delivery often becomes the first limiting constraint on cell growth.',
      },
      {
        letter: 'S',
        name: 'Shear Stress',
        question: 'Is the tip speed low enough to protect my cells from damage?',
        detail:
          'Scored on the ratio of organism tip-speed threshold to impeller tip speed. Compensating for poor mixing by increasing agitation can cross the shear-tolerance limit of sensitive organisms.',
      },
      {
        letter: 'C',
        name: 'CO₂ Accumulation',
        question: 'Is CO₂ accumulation low enough to prevent inhibition of cell growth?',
        detail:
          'Scored on the ratio of organism CO₂ partial-pressure threshold to the partial pressure at the reactor bottom. Dissolved CO₂ rises with reactor depth at larger scales and is often overlooked until it manifests as yield loss.',
      },
      {
        letter: 'H',
        name: 'Heat Transfer',
        question: 'Can my heat-transfer equipment dissipate metabolic heat?',
        detail:
          'Scored on the ratio of heat withdrawal capacity to metabolic heat generated. As biomass increases, surface-area-to-volume ratio drops and heat removal becomes a limiting design constraint that is underestimated at bench scale.',
      },
    ],
    callout: {
      title: 'A decision-support layer, not a black box.',
      body: 'The MOSCH report projects a dimensionless risk score at both lab and target scale. So you can see where scale-up assumptions diverge before committing to any infrastructure investment. Lower scores indicate higher risk. Risk categories are reported as Low, Moderate, High, and Critical. Treat it like getting a second opinion on the most critical parameters that define the success of your process.',
    },
  },
  faq: {
    eyebrow: 'Frequently Asked Questions',
    items: [
      {
        question: 'What does the MOSCH report actually contain?',
        answer:
          'A dimensionless risk score across the five scale-up domains (Mixing, Oxygen Transfer, Shear, CO₂, Heat Transfer) at both lab and target scale. Each score comes with the underlying assumptions, the equations used, the inputs that drove it, and a categorical reading (Low / Moderate / High / Critical). Everything is traceable — no black-box outputs.',
      },
      {
        question: 'Do I need historical batch data to run an assessment?',
        answer:
          'No. Torch is parameter-driven, not data-driven. You enter your lab-scale process inputs and target reactor geometry once. The engine derives oxygen uptake, kLa, gas hold-up, mixing time, and heat load from first-principles correlations. Batch history is useful if you have it, but not required to get a first risk reading.',
      },
      {
        question: 'How is this different from running CFD or a full process model?',
        answer:
          'CFD and detailed process models tell you exactly what is happening; Torch tells you whether you should be worried before committing to that level of analysis. Think of it as the engineering second opinion that runs in minutes instead of weeks, identifying which domain to invest deeper modelling in.',
      },
      {
        question: 'What happens to the data I put in?',
        answer:
          'Your inputs and results are tied to your account and never shared. We do not train models on your data. You can delete an assessment at any time and the underlying records go with it. Assessments are accessible via signed report links that expire after 90 days.',
      },
      {
        question: 'What if my organism or process does not fit standard assumptions?',
        answer:
          'You can override the defaults for every parameter — organism shear tolerance, oxygen demand, viscosity model, impeller geometry, gas composition. Where overrides are applied, the report flags them explicitly so reviewers can see exactly which assumptions diverge from the typical scale-up template.',
      },
    ],
    wordmark: {
      primary: 'TORCH',
      by: 'by',
      secondary: 'Lemnisca',
    },
  },
});

export default torch;
