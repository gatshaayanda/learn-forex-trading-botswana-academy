import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Learn Forex Botswana Academy',
  description: 'A practical forex trading academy for building confidence, discipline, and a repeatable edge.',
  generator: 'v0.app',
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/477025417_24047448434843867_6373217605156898040_n-X43MYkCQZB2yR3iTIwK4sw40WF2hZe.jpg',
    apple: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/477025417_24047448434843867_6373217605156898040_n-X43MYkCQZB2yR3iTIwK4sw40WF2hZe.jpg',
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
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
