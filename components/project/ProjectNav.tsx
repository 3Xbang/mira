'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const TABS = [
  { key: 'overview', path: '' },
  { key: 'floor-plans', path: '/floor-plans' },
  { key: 'progress', path: '/progress' },
  { key: 'materials', path: '/materials' },
  { key: 'location', path: '/location' },
]

const TAB_I18N: Record<string, string> = {
  overview: 'overview',
  'floor-plans': 'floorPlans',
  progress: 'progress',
  materials: 'materials',
  location: 'location',
}

export default function ProjectNav({ locale, projectId, active }: {
  locale: string; projectId: string; active: string
}) {
  const t = useTranslations('project')
  const base = `/${locale}/projects/${projectId}`

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-16 z-30">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => {
            const isActive = tab.key === active
            return (
              <Link key={tab.key} href={`${base}${tab.path}`}
                className={`shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-ocean-blue text-ocean-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}>
                {t(TAB_I18N[tab.key] as any)}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
