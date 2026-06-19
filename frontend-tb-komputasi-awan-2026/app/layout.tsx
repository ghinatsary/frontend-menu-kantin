import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ApiProvider } from '@/lib/api-context'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Tugas Besar Cloud Computing 2026',
  description: 'Tester dan kelola endpoint REST API Anda',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${inter.variable}`}>
      <body className="font-sans antialiased">
        <ApiProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ApiProvider>
      </body>
    </html>
  )
}
