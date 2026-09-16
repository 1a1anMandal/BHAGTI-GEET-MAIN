import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bhajan Library | Bhagi Geet',
  description: 'Explore our vast collection of Devotional Bhajans. View lyrics, transliterations, and add them to your live singing queue.',
  openGraph: {
    title: 'Bhajan Library | Bhagi Geet',
    description: 'Explore our vast collection of Devotional Bhajans. View lyrics, transliterations, and add them to your live singing queue.',
  }
}

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
