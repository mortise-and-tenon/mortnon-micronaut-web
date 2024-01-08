import type { Metadata } from 'next'

// import './normalize.css'
import './globals.css'



export const metadata: Metadata = {
  title: 'Mortnon Web',
  description: 'Mortnon Web',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
