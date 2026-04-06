import { Inter, Playfair_Display } from 'next/font/google'
import { Suspense } from 'react'
import { PHProvider } from './providers'
import { PostHogPageView } from '@/components/PostHogPageView'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata = {
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
        <PHProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PHProvider>
      </body>
    </html>
  )
}
