import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProjectById, getFloorPlansByProject, getProjectSummary } from '@/lib/db'
import { t as tl } from '@/lib/types'
import ContactButton from '@/components/common/ContactButton'
import ProjectNav from '@/components/project/ProjectNav'
import MixedGallery from '@/components/project/MixedGallery'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  on_sale: 'bg-emerald-100 text-emerald-700',
  coming_soon: 'bg-amber-100 text-amber-700',
  sold_out: 'bg-gray-100 text-gray-500',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 10_000) return `฿${(n / 10_000).toFixed(0)}万`
  return `฿${n.toLocaleString()}`
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const [project, plans] = await Promise.all([
    getProjectById(id).catch(() => null),
    getFloorPlansByProject(id).catch(() => []),
  ])
  if (!project) notFound()

  // Auto-aggregate from floor plans
  const summary = await getProjectSummary(id, project.gallery ?? [])

  const t = await getTranslations('project')
  const name = tl(project.name, locale)
  const tagline = tl(project.tagline, locale)
  const description = tl(project.description, locale)

  const statusKey = `status_${project.status}` as const
  const statusLabel = t(statusKey as any)

  // Price: prefer aggregated, fall back to project-level
  const priceMin = summary.price_min ?? project.price_from
  const priceMax = summary.price_max
  const priceStr = priceMin
    ? priceMax && priceMax > priceMin
      ? `${fmt(priceMin)} – ${fmt(priceMax)}`
      : `${fmt(priceMin)}+`
    : null

  // Units & delivery from summary
  const totalUnits = summary.total_units > 0
    ? summary.total_units
    : (project.total_units ?? 0)
  const delivery = summary.delivery_earliest
    ? summary.delivery_earliest === summary.delivery_latest
      ? summary.delivery_earliest
      : `${summary.delivery_earliest} ~ ${summary.delivery_latest}`
    : project.delivery_date

  // Mixed images: project gallery + floor plan images
  const allImages = summary.all_images.length > 0
    ? summary.all_images
    : project.cover_image ? [project.cover_image] : []

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero with MixedGallery ── */}
      <div className="relative">
        {allImages.length > 0 ? (
          <div className="max-h-[70vh] overflow-hidden">
            <MixedGallery
              images={allImages}
              title={name}
              aspectRatio="wide"
              interval={4500}
            />
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-slate-800 to-slate-900" />
        )}

        {/* Overlay info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-6 pb-8 pt-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[project.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {statusLabel}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-1">{name}</h1>
            {tagline && <p className="text-lg text-white/80">{tagline}</p>}
            <p className="text-sm text-white/50 mt-1">{project.location_address}</p>
          </div>
        </div>
      </div>

      {/* Sub-navigation */}
      <ProjectNav locale={locale} projectId={id} active="overview" />

      {/* ── Auto-aggregated stats bar ── */}
      <div className="bg-ocean-blue text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-8 text-center">
          {priceStr && (
            <div>
              <p className="text-xl font-bold">{priceStr}</p>
              <p className="text-xs text-white/70 mt-0.5">{t('priceFrom')}</p>
            </div>
          )}
          {totalUnits > 0 && (
            <div>
              <p className="text-xl font-bold">{totalUnits}</p>
              <p className="text-xs text-white/70 mt-0.5">{t('totalUnits')}</p>
            </div>
          )}
          {summary.floor_plan_count > 0 && (
            <div>
              <p className="text-xl font-bold">{summary.floor_plan_count}</p>
              <p className="text-xs text-white/70 mt-0.5">{t('floorPlans')}</p>
            </div>
          )}
          {delivery && (
            <div>
              <p className="text-xl font-bold">{delivery}</p>
              <p className="text-xs text-white/70 mt-0.5">{t('delivery')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">

        {/* ── Description ── */}
        {description && (
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{description}</p>
        )}

        {/* ── Floor plan cards (auto from DB) ── */}
        {plans.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('floorPlans')}</h2>
              <Link href={`/${locale}/projects/${id}/floor-plans`}
                className="text-sky-500 text-sm hover:underline">
                {locale === 'zh' ? '查看全部户型 →' : 'View all →'}
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map(plan => {
                const planName = tl(plan.name, locale)
                const imgs = plan.floor_plan_images?.length
                  ? plan.floor_plan_images
                  : plan.preview_images?.length
                    ? plan.preview_images
                    : (plan as any).floor_plan_image
                      ? [(plan as any).floor_plan_image]
                      : []
                const priceMin = plan.price_min_thb ?? plan.price_thb
                const priceMax = plan.price_max_thb
                const planPrice = priceMin
                  ? priceMax && priceMax > priceMin
                    ? `${fmt(priceMin)}–${fmt(priceMax)}`
                    : `${fmt(priceMin)}+`
                  : null

                return (
                  <Link key={plan.id}
                    href={`/${locale}/projects/${id}/floor-plans`}
                    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gray-50 overflow-hidden">
                      {imgs.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgs[0]} alt={planName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📐</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-gray-900 mb-2">{planName}</p>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {plan.bedrooms > 0 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            🛏 {plan.bedrooms}
                          </span>
                        )}
                        {plan.area_sqm > 0 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            📐 {plan.area_sqm}m²
                          </span>
                        )}
                        {plan.delivery_date && (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            📅 {plan.delivery_date}
                          </span>
                        )}
                      </div>
                      {planPrice && (
                        <p className="text-sky-600 font-semibold text-sm mt-2">{planPrice}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Quick links ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* ── Map ── */}
        {project.location_lat && project.location_lng && (
          <div>
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
