import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Felt — Capture how it felt, not just how it looked',
  description: 'Share how your memories actually felt. Living photos, emotional AI, and the story of your life — written beautifully.',
  keywords: ['memories', 'living photos', 'AI', 'legacy', 'story'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
