import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bhagi Geet - Real-time Bhajan Singing',
  description: 'Synchronized bhajan lyrics sharing and group singing platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen max-w-7xl mx-auto flex flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}
