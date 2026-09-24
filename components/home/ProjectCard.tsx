import Link from 'next/link'
import type { Project } from '@/lib/types'
import { t as tl } from '@/lib/types'

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

export default function ProjectCard({ project, locale }: { project: Project; locale: string }) {
  const lang = locale as keyof typeof STATUS_LABEL
  const name = tl(project.name, locale)
  const tagline = tl(project.tagline, locale)
  const statusLabel = STATUS_LABEL[lang]?.[project.status] ?? project.status
  const statusColor = STATUS_COLOR[project.status] ?? 'bg-gray-400'

  const priceFormatted = project.price_from
    ? `${project.currency ?? 'THB'} ${project.price_from.toLocaleString()}`
    : null

  return (
    <Link href={`/${locale}/projects/${project.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
      {/* Image */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {project.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.cover_image} alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-100 to-gray-200">
            🏗️
          </div>
        )}
        <div className={`absolute top-3 left-3 ${statusColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
          {statusLabel}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-ocean-blue transition-colors">
          {name}
        </h3>
        {tagline && <p className="text-gray-500 text-sm mb-3">{tagline}</p>}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex gap-3">
            {project.total_units > 0 && <span>🏠 {project.total_units} units</span>}
            {project.delivery_date && <span>📅 {project.delivery_date}</span>}
          </div>
          {priceFormatted && (
            <span className="font-semibold text-ocean-blue">{priceFormatted}+</span>
          )}
        </div>
      </div>
    </Link>
  )
}
