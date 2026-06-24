import type { Metadata } from 'next'
import './globals.css'
import AnimatedFavicon from '@/components/ui/AnimatedFavicon'

export const metadata: Metadata = {
  title: 'felt.',
  description: 'Share how your memories actually felt. Living photos, emotional AI, and the story of your life — written beautifully.',
  keywords: ['memories', 'living photos', 'AI', 'legacy', 'story'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AnimatedFavicon />
        {children}
      </body>
    </html>
  )
}