import { Inter, Playfair_Display } from 'next/font/google'
  import './globals.css'

  const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
  const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

  export const metadata = {
    title: 'Lemnisca',
    description: 'Your site description here',
    icons: { icon: '/favicon.ico' },
    openGraph: {
      title: 'Lemnisca',
      description: 'Your site description',
      images: ['/preview.png'],
    },
  }

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <head>
          {/* Google Analytics */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'YOUR_GA_ID');
              `,
            }}
          />
        </head>
        <body>{children}</body>
      </html>
    )
  }