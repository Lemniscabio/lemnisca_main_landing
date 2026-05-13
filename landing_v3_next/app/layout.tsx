import { Inter, Playfair_Display } from 'next/font/google'
  import './globals.css'
  import { PostHogProvider } from '@/components/PostHogProvider'
  import { PostHogPageView } from '@/components/PostHogPageView'

  const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
  const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

  export const metadata = {
    metadataBase: new URL('https://lemnisca.bio'),
    title: 'Lemnisca',
    description: 'Your site description here',
    openGraph: {
      title: 'Lemnisca',
      description: 'Your site description',
      images: ['/preview.png'],
    },
  }

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <body>
          <PostHogProvider>
            <PostHogPageView />
            {children}
          </PostHogProvider>
        </body>
      </html>
    )
  }