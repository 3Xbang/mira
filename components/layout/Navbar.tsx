'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'

export default function Navbar() {
  const t = useTranslations('nav')
  const params = useParams()
  const pathname = usePathname()
  const locale = (params?.locale as string) || 'en'

  const [menuOpen, setMenuOpen] = useState(false)

  const isUK = pathname.includes('/uk')

  const navLinks = isUK
    ? [
        { label: 'Home', href: `/${locale}/uk` },
        { label: 'Reference Letters', href: `/${locale}/uk/rs-ref` },
        { label: 'Property Management', href: `/${locale}/uk/mira-manage` },
      ]
    : [
        { label: t('home'), href: `/${locale}` },
        { label: t('properties'), href: `/${locale}#featured` },
      ]

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href={`/${locale}`}
            className="text-2xl font-bold tracking-widest text-ocean-blue"
          >
            MIRA
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-dark-gray hover:text-ocean-blue transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: market switcher + language switcher + mobile hamburger */}
          <div className="flex items-center gap-3">
            {/* Market switcher */}
            <div className="hidden md:flex items-center bg-light-gray rounded-full p-1 text-xs font-semibold">
              <Link
                href={`/`}
                className={`px-3 py-1 rounded-full transition-colors ${!isUK ? 'bg-ocean-blue text-white' : 'text-gray-500 hover:text-dark-gray'}`}
              >
                🇹🇭 Thailand
              </Link>
              <Link
                href={`/uk`}
                className={`px-3 py-1 rounded-full transition-colors ${isUK ? 'bg-ocean-blue text-white' : 'text-gray-500 hover:text-dark-gray'}`}
              >
                🇬🇧 UK
              </Link>
            </div>
            <LanguageSwitcher />

            {/* Hamburger button — mobile only */}
            <button
              className="md:hidden p-2 rounded-md text-dark-gray hover:bg-light-gray transition-colors"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                // X icon
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-2">
            {/* Mobile market switcher */}
            <div className="flex gap-2 px-4 py-2">
              <Link
                href={`/`}
                onClick={() => setMenuOpen(false)}
                className={`flex-1 text-center text-xs font-semibold py-2 rounded-full transition-colors ${!isUK ? 'bg-ocean-blue text-white' : 'bg-light-gray text-gray-500'}`}
              >
                🇹🇭 Thailand
              </Link>
              <Link
                href={`/uk`}
                onClick={() => setMenuOpen(false)}
                className={`flex-1 text-center text-xs font-semibold py-2 rounded-full transition-colors ${isUK ? 'bg-ocean-blue text-white' : 'bg-light-gray text-gray-500'}`}
              >
                🇬🇧 UK
              </Link>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-dark-gray hover:text-ocean-blue hover:bg-light-gray transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
