import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { AcademyChat } from '@/components/academy-chat'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'

export const metadata: Metadata = {
  title: 'Learn Forex Botswana Academy',
  description: 'A practical forex education and student learning academy for Botswana.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#080b12',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <AcademyChat />
        <PwaRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
