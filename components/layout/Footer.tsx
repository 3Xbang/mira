import { useTranslations } from 'next-intl'

// Server component — no 'use client' directive needed
export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-dark-gray text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Brand name */}
          <span className="text-2xl font-bold tracking-widest text-ocean-blue">MIRA</span>

          {/* Tagline */}
          <p className="text-sm text-gray-300">{t('tagline')}</p>

          {/* Address */}
          <p className="text-sm text-gray-400">{t('address')}</p>

          {/* Divider */}
          <div className="w-16 border-t border-gray-600 my-2" />

          {/* Copyright */}
          <p className="text-xs text-gray-500">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
