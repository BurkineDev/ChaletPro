import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChâletPro — Gérez votre chalet à Mont-Tremblant',
  description:
    'Automatisez la gestion de votre chalet à Mont-Tremblant. Synchronisation iCal, alertes ménage automatiques, et bien plus.',
  keywords: [
    'chalet Mont-Tremblant',
    'gestion location courte durée',
    'Airbnb Tremblant',
    'VRBO Tremblant',
    'ménage automatique',
  ],
  openGraph: {
    title: 'ChâletPro — Gérez votre chalet à Mont-Tremblant',
    description:
      'Pendant que vous skiez, ChâletPro gère votre chalet. Synchronisation iCal, alertes SMS automatiques.',
    locale: 'fr_CA',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
