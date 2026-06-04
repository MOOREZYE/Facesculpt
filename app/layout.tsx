import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FaceSculpt™ — Professional Training Platform',
  description: 'Complete LMS for facial sculpting training course',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-stone-50">{children}</body>
    </html>
  )
}
