import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeInitializer from '@/components/ThemeInitializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Forex Trade Journal',
  description: 'Track and analyze your forex trades',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeInitializer />
        {children}
      </body>
    </html>
  )
}
