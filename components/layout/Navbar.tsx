'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'

/**
 * Navbar Component - Refactored for single-market website (Thailand real estate only)
 * Removed all market switcher logic and UI elements
 * Simplified navigation structure focusing on property-related links
 * Maintains full language switcher functionality
 * 
 * This component has been refactored as part of the website restructure task 3.1
 */
export default function Navbar() {
  const t = useTranslations('nav')
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  const [menuOpen, setMenuOpen] = useState(false)

  // Simplified navigation links for single-market real estate website
  const navLinks = [
    { label: t('home'), href: `/${locale}` },
    { label: t('properties'), href: `/${locale}#featured` },
    { label: t('contact'), href: `/${locale}#contact` },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href={`/${locale}`}
            className="text-2xl font-bold tracking-widest text-ocean-blue hover:text-dark-blue transition-colors"
            aria-label="MIRA Real Estate Home"
          >
            MIRA
          </Link>

          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-dark-gray hover:text-ocean-blue hover:scale-105 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: language switcher and mobile menu button */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            {/* Mobile hamburger menu button */}
            <button
              className="md:hidden p-2 rounded-md text-dark-gray hover:bg-light-gray hover:text-ocean-blue transition-colors"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                // X icon for close state
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon for open state
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-2 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-dark-gray hover:text-ocean-blue hover:bg-light-blue transition-colors border-b border-gray-50 last:border-b-0"
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
