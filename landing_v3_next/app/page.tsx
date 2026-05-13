import type { Metadata } from 'next'
  import LandingPage from '@/components/LandingPage'

  // Root layout already sets title, description, OG, Twitter card, and the
  // Organization JSON-LD. We restate the canonical here so future child routes
  // can't accidentally pick up a wrong canonical via inheritance fallback.
  export const metadata: Metadata = {
    alternates: { canonical: 'https://lemnisca.bio' },
  }

  export default function Home() {
    return <LandingPage />
  }
