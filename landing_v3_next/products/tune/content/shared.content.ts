// Brand-level shared content — nav and footer copy.
// This app is Tune-only; cross-product (Thrust) lives in a separate app.

export const CALENDLY_URL = 'https://calendly.com/pushkar-lemnisca/30min';
const currentYear = new Date().getFullYear();

export const shared = {
  brand: {
    name: 'Tune',
    suffix: 'by Lemnisca',
  },
  nav: {
    items: [
      { label: 'Tune', href: '/tune' },
      { label: 'Thrust', href: '/thrust' },
      { label: 'Torch', href: '/torch' },
      { label: 'Request a conversation', href: CALENDLY_URL, cta: true },
    ],
  },
  footer: {
    copyright: `© ${currentYear} Lemnisca. All rights reserved.`,
  },
} as const;
