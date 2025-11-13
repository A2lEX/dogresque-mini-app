import type { Metadata } from 'next'
import './globals.css'
import Footer from '@/components/Footer'
import { LanguageProvider } from '@/contexts/LanguageContext'
import LanguageUpdater from '@/components/LanguageUpdater'

export const metadata: Metadata = {
  title: 'patrons.dog - Help for Dogs',
  description: 'Service for dog donations',
  icons: {
    icon: [
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <LanguageUpdater />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}

