// Brand + cross-product nav for the Torch landing.
// Mirrors products/tune/content/shared.content.ts shape so future Thrust merge
// can use the same nav schema.

import { sharedContentSchema, type SharedContent } from './schema';

export const shared: SharedContent = sharedContentSchema.parse({
  brand: {
    name: 'Torch',
    suffix: 'by Lemnisca',
  },
  nav: {
    items: [
      { label: 'Tune', href: '/tune' },
      { label: 'Thrust', href: '/thrust' },
      { label: 'Torch', href: '/torch' },
      { label: 'Run assessment', href: 'https://torch.lemnisca.bio/assess?utm_source=lemnisca_landing&utm_medium=torch_landing_cta&utm_campaign=torch_assessment&cta_location=nav', cta: true },
    ],
  },
});
