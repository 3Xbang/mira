'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

// Error icon for the not-found page
function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="64"
      height="64"
      className="text-ocean-blue"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export default function NotFound() {
  const t = useTranslations('errors')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-white">
      <ErrorIcon />
      <h1 className="mt-6 text-3xl md:text-4xl font-bold text-gray-900">
        {t('notFound')}
      </h1>
      <p className="mt-3 text-gray-500 max-w-md">
        {t('notFoundDesc')}
      </p>
      <Link
        href="/"
        className="mt-8 inline-block px-6 py-3 rounded-full bg-ocean-blue text-white font-medium hover:bg-sky-600 transition-colors duration-200"
      >
        {t('backHome')}
      </Link>
    </div>
  )
}
