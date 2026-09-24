'use client'

import Link from 'next/link'
import type { Project } from '@/lib/types'
import { t as tl } from '@/lib/types'
import MixedGallery from '@/components/project/MixedGallery'

const STATUS_LABEL: Record<string, Record<string, string>> = {
  en: { on_sale: 'On Sale', coming_soon: 'Coming Soon', sold_out: 'Sold Out' },
  ru: { on_sale: 'В продаже', coming_soon: 'Скоро', sold_out: 'Продано' },
  fr: { on_sale: 'En vente', coming_soon: 'Bientôt', sold_out: 'Vendu' },
  de: { on_sale: 'Im Verkauf', coming_soon: 'Demnächst', sold_out: 'Ausverkauft' },
  es: { on_sale: 'En venta', coming_soon: 'Próximamente', sold_out: 'Agotado' },
  it: { on_sale: 'In vendita', coming_soon: 'Prossimamente', sold_out: 'Esaurito' },
  zh: { on_sale: '在售', coming_soon: '即将开售', sold_out: '已售罄' },
}

const STATUS_COLOR: Record<string, string> = {
  on_sale: 'bg-emerald-500',
  coming_soon: 'bg-amber-500',
  sold_out: 'bg-gray-400',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  return `฿${(n / 10_000).toFixed(0)}万`
}

interface Props {
  project: Project
  locale: string
  allImages?: string[]   // pre-fetched mixed images (gallery + floor plan images)
  priceMin?: number
  priceMax?: number
  delivery?: string
  totalUnits?: number
}

export default function ProjectCard({ project, locale, allImages, priceMin, priceMax, delivery, totalUnits }: Props) {
  const lang = locale as keyof typeof STATUS_LABEL
  const name = tl(project.name, locale)
  const tagline = tl(project.tagline, locale)
  const statusLabel = STATUS_LABEL[lang]?.[project.status] ?? project.status
  const statusColor = STATUS_COLOR[project.status] ?? 'bg-gray-400'

  // Use mixed images if provided, else fall back to gallery/cover
  const images = allImages?.length
    ? allImages
    : project.gallery?.length
      ? project.gallery
      : project.cover_image
        ? [project.cover_image]
        : []

  const lo = priceMin ?? project.price_from
  const hi = priceMax
  const priceStr = lo
    ? hi && hi > lo
      ? `${fmt(lo)} – ${fmt(hi)}`
      : `${fmt(lo)}+`
    : null

  const units = totalUnits ?? project.total_units ?? 0

  return (
    <Link href={`/${locale}/projects/${project.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">

      {/* Mixed gallery */}
      <div className="relative">
        {images.length > 0 ? (
          <MixedGallery
            images={images}
            title={name}
            aspectRatio="video"
            interval={3500}
          />
        ) : (
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl">
            🏗️
          </div>
        )}
        {/* Status badge */}
        <div className={`absolute top-3 left-3 z-10 ${statusColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow`}>
          {statusLabel}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-ocean-blue transition-colors">
          {name}
        </h3>
        {tagline && <p className="text-gray-500 text-sm mb-3">{tagline}</p>}

        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-3 text-gray-400">
            {units > 0 && <span>🏠 {units} units</span>}
            {delivery && <span>📅 {delivery}</span>}
          </div>
          {priceStr && (
            <span className="font-semibold text-ocean-blue">{priceStr}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
