import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CFS - Crypto Fantasy Sports',
  description: 'The ultimate crypto-enabled fantasy sports platform',
  keywords: ['fantasy sports', 'crypto', 'blockchain', 'sports betting', 'contests'],
  authors: [{ name: 'CFS Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#6366f1',
  openGraph: {
    title: 'CFS - Crypto Fantasy Sports',
    description: 'The ultimate crypto-enabled fantasy sports platform',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CFS - Crypto Fantasy Sports',
    description: 'The ultimate crypto-enabled fantasy sports platform',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
