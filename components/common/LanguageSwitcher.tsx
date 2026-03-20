'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useParams } from 'next/navigation'

const LOCALE_STORAGE_KEY = 'mira-locale'

const locales = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const currentLocale = (params?.locale as string) || 'en'

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // On mount: read localStorage preference but don't override the URL-based locale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.getItem(LOCALE_STORAGE_KEY)
      // We intentionally do not navigate here — the URL locale takes precedence
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(localeCode: string) {
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, localeCode)
    }

    // Replace the locale segment in the current path
    const segments = pathname.split('/')
    // segments[0] is '', segments[1] is the locale
    segments[1] = localeCode
    const newPath = segments.join('/')

    setOpen(false)
    router.push(newPath)
  }

  const current = locales.find((l) => l.code === currentLocale) ?? locales[0]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-dark-gray hover:bg-light-gray transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1"
        >
          {locales.map((locale) => (
            <li key={locale.code} role="option" aria-selected={locale.code === currentLocale}>
              <button
                onClick={() => handleSelect(locale.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-light-gray transition-colors ${
                  locale.code === currentLocale ? 'font-semibold text-ocean-blue' : 'text-dark-gray'
                }`}
              >
                <span>{locale.flag}</span>
                <span>{locale.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
