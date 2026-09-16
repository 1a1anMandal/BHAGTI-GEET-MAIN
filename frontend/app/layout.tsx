import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { BottomNav } from '../components/BottomNav'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#FF7A00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Bhagi Geet - Synchronized Live Bhajan Singing',
  description: 'Join Bhagi Geet to sing bhajans together in real-time. Create live synchronized rooms, share lyrics, and experience divine music with devotees worldwide.',
  keywords: ['Bhajan', 'Live Singing', 'Synchronized Lyrics', 'Devotional Music', 'Hinduism', 'Kirtan', 'Online Bhajan', 'Bhagi Geet', 'Lyrics Sync'],
  authors: [{ name: 'Bhagi Geet Team' }],
  openGraph: {
    title: 'Bhagi Geet - Synchronized Live Bhajan Singing',
    description: 'Sing bhajans together in real-time with synchronized lyrics and live queues. Join the ultimate online sanctuary for devotees.',
    url: 'https://bhagi-geet.vercel.app',
    siteName: 'Bhagi Geet',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582631583095-236b3dbba964?q=80&w=1200&h=630&fit=crop', // A beautiful divine template placeholder
        width: 1200,
        height: 630,
        alt: 'Bhagi Geet - Divine Music Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bhagi Geet - Live Bhajan Platform',
    description: 'Sing bhajans together in real-time with synchronized lyrics.',
    images: ['https://images.unsplash.com/photo-1582631583095-236b3dbba964?q=80&w=1200&h=630&fit=crop'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json', // Best practice for mobile apps
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black`}>
        <div className="app-container flex flex-col">
          {children}
          <BottomNav />
          <Analytics />
        </div>
      </body>
    </html>
  )
}
