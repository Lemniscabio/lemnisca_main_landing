import type { Metadata } from 'next';
import torch from '@/products/torch/content/torch.content';
import { Hero } from '@/products/torch/features/hero/Hero';
import { MoschSection } from '@/products/torch/features/mosch/MoschSection';
import { FaqFooterSection } from '@/products/torch/features/faq-footer/FaqFooterSection';

export const metadata: Metadata = {
  title: torch.meta.title,
  description: torch.meta.description,
  alternates: { canonical: torch.meta.canonical },
  openGraph: {
    title: torch.meta.title,
    description: torch.meta.description,
    url: torch.meta.canonical,
    type: 'website',
  },
};

export default function TorchPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <Hero hero={torch.hero} />
      <MoschSection section={torch.mosch} />
      <FaqFooterSection section={torch.faq} />
    </main>
  );
}
