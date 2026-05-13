import type { Metadata } from 'next'
  import { Inter, Playfair_Display } from 'next/font/google'
  import './globals.css'
  import { PostHogProvider } from '@/components/PostHogProvider'
  import { PostHogPageView } from '@/components/PostHogPageView'

  const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
  const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

  const description =
    'Biology is the ultimate manufacturing engine. Lemnisca exists to democratize the biomanufacturing engine by bridging the gap between innovation & industrial reality.'

  export const metadata: Metadata = {
    metadataBase: new URL('https://lemnisca.bio'),
    // `title.template` lets child routes set their own title and have it
    // automatically suffixed with the site name — e.g. /tune sets
    // 'Tune · …' and the browser tab renders 'Tune · … · Lemnisca'.
    title: { default: 'Lemnisca', template: '%s · Lemnisca' },
    description,
    applicationName: 'Lemnisca',
    keywords: [
      'biomanufacturing',
      'fermentation',
      'bioprocess optimization',
      'industrial biotech',
      'pilot scale',
      'model-guided fermentation',
      'Lemnisca',
      'Tune',
    ],
    authors: [{ name: 'Lemnisca' }],
    creator: 'Lemnisca',
    publisher: 'Lemnisca',
    // Disables iOS Safari auto-linking of phone numbers / emails / addresses
    // in the page body — keeps the marketing copy from being auto-styled.
    formatDetection: { telephone: false, address: false, email: false },
    alternates: { canonical: 'https://lemnisca.bio' },
    openGraph: {
      type: 'website',
      siteName: 'Lemnisca',
      title: 'Lemnisca',
      description,
      url: 'https://lemnisca.bio',
      images: [{ url: '/preview.png', width: 1200, height: 630, alt: 'Lemnisca' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Lemnisca',
      description,
      images: ['/preview.png'],
    },
    robots: { index: true, follow: true },
  }

  // Schema.org Organization markup — surfaces in Google Knowledge Graph and
  // helps crawlers connect the brand name to the site. Kept minimal and
  // accurate; add `sameAs` (LinkedIn / X / etc.) when those URLs are settled.
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lemnisca',
    url: 'https://lemnisca.bio',
    logo: 'https://lemnisca.bio/assets/Landing_assets/logo.svg',
    description,
  }

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <body>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          <PostHogProvider>
            <PostHogPageView />
            {children}
          </PostHogProvider>
        </body>
      </html>
    )
  }
