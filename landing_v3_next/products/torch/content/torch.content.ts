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
  },
  mosch: {
    eyebrow: 'The MOSCH report · A new standard for fermentation scale-up',
    headlinePre: 'Five critical questions.',
    headlineAccent: 'One structured report.',
    domains: [
      {
        letter: 'M',
        name: 'Mixing',
        question: 'Is mixing fast enough to dissipate gradients?',
        detail:
          'Scored based on the ratio of the required mixing timescale to the mixing time.',
      },
      {
        letter: 'O',
        name: 'Oxygen Transfer',
        question: 'Can the reactor deliver sufficient oxygen to the cells at scale?',
        detail:
          'Scored based on the ratio of the oxygen transfer rate (OTR) to the oxygen uptake rate (OUR) of the microbe.',
      },
      {
        letter: 'S',
        name: 'Shear Stress',
        question: 'Is impeller tip speed causing shear damage to cells?',
        detail:
          'Scored based on the ratio of shear tolerance of the microbe to the shear due to the impeller.',
      },
      {
        letter: 'C',
        name: 'CO₂ Accumulation',
        question: 'Is dissolved CO₂ accumulating at toxic levels?',
        detail:
          'Scored based on the ratio of the CO₂ toxicity threshold of the microbe to the CO₂ present in the reactor.',
      },
      {
        letter: 'H',
        name: 'Heat Transfer',
        question: 'Can the reactor withdraw the heat generated at scale?',
        detail:
          'Scored based on the ratio of the heat removal capacity of the reactor to the metabolic heat generated during the culture.',
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
        question: 'How does Torch generate my MOSCH report?',
        answer:
          'Your report is built using a combination of kinetics, thermodynamics, transport phenomena, metabolism, and uncertainty quantification. Together, these produce risk scores across all categories based on the inputs you provide.',
      },
      {
        question: 'How are operating conditions estimated for the target scale?',
        answer:
          'Torch runs an optimization algorithm that matches your chosen scale-up criterion across both the lab and target scales. It accounts for scale-relevant operational constraints to recommend the best operating conditions at your target scale.',
      },
      {
        question: 'How can I improve my scale-up risk scores?',
        answer:
          'Use the What-If analysis in your interactive MOSCH report. You can adjust operating conditions, like increasing oxygen enrichment, and watch your risk scores update in real time.',
      },
      {
        question: 'Where can I find my past assessments?',
        answer:
          'All of your past assessments are available on your dashboard. You can also save any MOSCH report as a PDF to keep a local copy on your machine.',
      },
      {
        question: 'Do I need historical batch data to run an assessment?',
        answer:
          'No. Torch is parameter-driven, not data-driven. You enter your lab-scale process inputs and target reactor geometry once. The engine derives oxygen uptake, kLa, gas hold-up, mixing time, and heat load from first-principles correlations. Batch history is useful if you have it, but not required to get a first risk reading.',
      },
      {
        question: 'How is this different from running a detailed process model?',
        answer:
          'The detailed process models tell you exactly what is happening; Torch tells you whether you should be worried before committing to that level of analysis. Think of it as the engineering second opinion that runs in minutes instead of weeks, identifying which domain to invest deeper modelling in.',
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
