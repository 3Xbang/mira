import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '@/i18n'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import TrackingScripts from '@/components/tracking/TrackingScripts'
import '../globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Mira Real Estate — Koh Samui',
  description: 'Luxury villas and townhouses in Koh Samui, Thailand',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
        <TrackingScripts
          ga4Id={process.env.NEXT_PUBLIC_GA4_ID ?? ''}
          fbPixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? ''}
        />
      </body>
    </html>
  )
}
