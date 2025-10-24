import '../instrumentation'
import { NavigationProgress } from '@/components/navigation-progress'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import './nprogress.css'
import { Toaster } from '@/components/ui/toaster'
import { LayoutContent } from './layout-content'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'sejmofil',
  description: 'Bo posłów trzeba pilnować!',
  keywords: [
    'Sejm',
    'Parlament',
    'sejm-stats',
    'sejmofil',
    'Polska',
    'AI',
    'Analiza danych',
    'Polityka',
    'Prawo',
    'Ustawy',
    'Akty prawne',
    'Polski parlament',
    'Sztuczna inteligencja',
    'Analiza prawa',
    'Legislacja',
    'Interpelacje poselskie',
    'Głosowania sejmowe',
    'Komisje parlamentarne',
  ],
  authors: [
    {
      name: 'Michał Skibiński',
      url: 'https://github.com/miskibin',
    },
  ],
  creator: 'Michał Skibiński',
  publisher: 'sejmofil.pl',
  applicationName: 'Sejmofil',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  category: 'legal',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://sejmofil.pl',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <head>
        <script
          async
          src="https://umami.msulawiak.pl/script.js"
          data-website-id="5b5c27b4-9296-472d-9f68-b205f7706e0b"
        />
      </head>
      <body className={`${inter.variable} bg-neutral-50 antialiased`}>
        {/* Navigation Progress Bar */}
        <NavigationProgress />

        {/* Google Analytics - load asynchronously with afterInteractive strategy */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-094FXXHQDE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-094FXXHQDE');
          `}
        </Script>

        <LayoutContent>{children}</LayoutContent>

        <Toaster />
      </body>
    </html>
  )
}
