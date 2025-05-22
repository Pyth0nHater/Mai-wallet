import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MAI Wallet',
  description: 'Pyt0nHater',
  generator: 'Pyt0nHater',
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
