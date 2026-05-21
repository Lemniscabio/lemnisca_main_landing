import type { Metadata } from 'next';
import torch from '@/products/torch/content/torch.content';
import { Hero } from '@/products/torch/features/hero/Hero';
import { MoschSection } from '@/products/torch/features/mosch/MoschSection';
import { FaqFooterSection } from '@/products/torch/features/faq-footer/FaqFooterSection';

export const metadata: Metadata = {
  title: torch.meta.title,
  description: torch.meta.description,
  keywords: [
    'fermentation scale-up',
    'bioprocess scale-up',
    'bioreactor scale-up',
    'oxygen transfer',
    'mixing risk',
    'industrial biotech',
    'MOSCH report',
    'Lemnisca',
    'Torch',
  ],
  authors: [{ name: 'Lemnisca' }],
  creator: 'Lemnisca',
  publisher: 'Lemnisca',
  alternates: { canonical: torch.meta.canonical },
  openGraph: {
    title: torch.meta.title,
    description: torch.meta.description,
    url: torch.meta.canonical,
    siteName: 'Lemnisca',
    type: 'website',
    images: [{ url: '/torch-preview.png', width: 1200, height: 630, alt: 'Torch by Lemnisca' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: torch.meta.title,
    description: torch.meta.description,
    images: ['/torch-preview.png'],
  },
};

const torchSoftwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Torch',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: torch.meta.canonical,
  image: 'https://lemnisca.bio/torch-preview.png',
  publisher: {
    '@type': 'Organization',
    name: 'Lemnisca',
    url: 'https://lemnisca.bio',
  },
  description: torch.meta.description,
};

export default function TorchPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(torchSoftwareJsonLd) }}
      />
      <Hero hero={torch.hero} />
      <MoschSection section={torch.mosch} />
      <FaqFooterSection section={torch.faq} />
    </main>
  );
}
