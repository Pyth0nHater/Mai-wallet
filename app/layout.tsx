import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MAI Wallet',
  description: 'MAI Wallet',
  generator: 'MAI Wallet',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
