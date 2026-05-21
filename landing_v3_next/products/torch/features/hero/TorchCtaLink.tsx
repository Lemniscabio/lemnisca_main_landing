'use client';

import Link from 'next/link';
import posthog from 'posthog-js';
import type { CSSProperties, ReactNode } from 'react';

type Props = {
  href: string;
  ctaLocation: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function TorchCtaLink({ href, ctaLocation, className, style, children }: Props) {
  return (
    <Link
      href={href}
      onClick={() => captureTorchCtaClick(ctaLocation, href)}
      className={className}
      style={style}
    >
      {children}
    </Link>
  );
}

function captureTorchCtaClick(ctaLocation: string, destination: string) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.register({
    product: 'torch',
    surface: 'marketing',
    app: 'lemnisca_landing',
  });
  posthog.capture('torch_landing_cta_clicked', {
    cta_location: ctaLocation,
    destination,
  });
}
