import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProjectById } from '@/lib/db'
import { t as tl } from '@/lib/types'
import ContactButton from '@/components/common/ContactButton'
import ProjectNav from '@/components/project/ProjectNav'
import GalleryGrid from '@/components/project/GalleryGrid'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  on_sale: 'bg-emerald-100 text-emerald-700',
  coming_soon: 'bg-amber-100 text-amber-700',
  sold_out: 'bg-gray-100 text-gray-500',
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const project = await getProjectById(id).catch(() => null)
  if (!project) notFound()

  const t = await getTranslations('project')
  const lang = locale as 'en' | 'ru' | 'fr' | 'de' | 'es' | 'it' | 'zh'

  const name = tl(project.name, locale)
  const tagline = tl(project.tagline, locale)
  const description = tl(project.description, locale)

  const statusKey = `status_${project.status}` as const
  const statusLabel = t(statusKey as any)

  const priceFormatted = project.price_from
    ? `${project.currency ?? 'THB'} ${project.price_from.toLocaleString()}`
    : null

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] bg-gray-900 overflow-hidden">
        {project.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.cover_image} alt={name} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[project.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {statusLabel}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{name}</h1>
            {tagline && <p className="text-lg text-white/80">{tagline}</p>}
            <p className="text-sm text-white/60 mt-2">{project.location_address}</p>
          </div>
        </div>
      </div>

      {/* Sub-navigation */}
      <ProjectNav locale={locale} projectId={id} active="overview" />

      {/* Stats bar */}
      <div className="bg-ocean-blue text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {project.total_units > 0 && (
            <div>
              <p className="text-2xl font-bold">{project.total_units}</p>
              <p className="text-xs text-white/70 mt-0.5">{t('totalUnits')}</p>
            </div>
          )}
          {project.available_units > 0 && (
            <div>
              <p className="text-2xl font-bold">{project.available_units}</p>
              <p className="text-xs text-white/70 mt-0.5">{t('availableUnits')}</p>
            </div>
          )}
          {project.delivery_date && (
            <div>
              <p className="text-2xl font-bold">{project.delivery_date}</p>
              <p className="text-xs text-white/70 mt-0.5">{t('delivery')}</p>
            </div>
          )}
          {priceFormatted && (
            <div>
              <p className="text-2xl font-bold">{priceFormatted}</p>
              <p className="text-xs text-white/70 mt-0.5">{t('priceFrom')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Description */}
        {description && (
          <div className="mb-12">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        )}

        {/* Gallery */}
        {project.gallery?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('gallery')}</h2>
            <GalleryGrid images={project.gallery} title={name} />
          </div>
        )}

        {/* Quick links to sub-pages */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { href: `/${locale}/projects/${id}/floor-plans`, label: t('floorPlans'), icon: '📐' },
            { href: `/${locale}/projects/${id}/progress`, label: t('progress'), icon: '🏗️' },
            { href: `/${locale}/projects/${id}/materials`, label: t('materials'), icon: '🪵' },
            { href: `/${locale}/projects/${id}/location`, label: t('location'), icon: '📍' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-sky-50 border border-gray-100 hover:border-sky-200 rounded-xl transition-colors text-center group">
              <span className="text-3xl">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-sky-600">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Map */}
        {project.location_lat && project.location_lng && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('location')}</h2>
            <div className="rounded-xl overflow-hidden border border-gray-100 h-64">
              <iframe
                title="location map"
                width="100%" height="100%" style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${project.location_lat},${project.location_lng}&z=15&output=embed`}
              />
            </div>
            {project.location_address && (
              <p className="text-sm text-gray-500 mt-2">📍 {project.location_address}</p>
            )}
          </div>
        )}
      </div>

      <ContactButton whatsappNumber="66812345678" lineId="mira_samui" />
    </div>
  )
}
