import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProjectById, getFloorPlansByProject } from '@/lib/db'
import { t as tl } from '@/lib/types'
import ContactButton from '@/components/common/ContactButton'
import ProjectNav from '@/components/project/ProjectNav'
import GalleryGrid from '@/components/project/GalleryGrid'
import InvestmentCard from '@/components/project/InvestmentCard'

export const dynamic = 'force-dynamic'

function formatPrice(min?: number, max?: number, legacy?: number): string | null {
  const lo = min ?? legacy
  if (!lo) return null
  const fmt = (n: number) => `฿${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (max && max > lo) return `${fmt(lo)} – ${fmt(max)}`
  return `${fmt(lo)}+`
}

export default async function FloorPlansPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const [project, plans] = await Promise.all([
    getProjectById(id).catch(() => null),
    getFloorPlansByProject(id).catch(() => []),
  ])
  if (!project) notFound()

  const t = await getTranslations('project')
  const name = tl(project.name, locale)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/50 text-sm mb-1">{name}</p>
          <h1 className="text-3xl font-bold text-white">{t('floorPlans')}</h1>
        </div>
      </div>

      <ProjectNav locale={locale} projectId={id} active="floor-plans" />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {plans.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📐</div>
            <p>{t('noFloorPlans')}</p>
          </div>
        ) : (
          <div className="space-y-16">
            {plans.map((plan) => {
              const planName = tl(plan.name, locale)
              const planDesc = tl(plan.description, locale)

              // Support both new multi-image and legacy single-image fields
              const floorPlanImgs: string[] = plan.floor_plan_images?.length
                ? plan.floor_plan_images
                : (plan as any).floor_plan_image ? [(plan as any).floor_plan_image] : []
              const previewImgs: string[] = plan.preview_images?.length
                ? plan.preview_images
                : (plan as any).preview_image ? [(plan as any).preview_image] : []

              const priceStr = formatPrice(plan.price_min_thb, plan.price_max_thb, plan.price_thb)

              return (
                <div key={plan.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">

                  {/* ── Top: floor plan image + info ── */}
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* First floor plan */}
                    <div className="bg-gray-50 p-6 flex items-center justify-center min-h-[300px]">
                      {floorPlanImgs.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={floorPlanImgs[0]} alt={planName}
                          className="max-w-full max-h-[420px] object-contain" />
                      ) : (
                        <div className="text-gray-300 text-center">
                          <div className="text-5xl mb-2">📐</div>
                          <p className="text-sm">{t('floorPlan')}</p>
                        </div>
                      )}
                    </div>

                    {/* Info panel */}
                    <div className="p-8 flex flex-col justify-center gap-5">
                      <h2 className="text-2xl font-bold text-gray-900">{planName}</h2>

                      {/* Price + delivery badges */}
                      <div className="flex flex-wrap gap-2">
                        {priceStr && (
                          <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                            💰 {priceStr}
                          </span>
                        )}
                        {plan.delivery_date && (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                            📅 {plan.delivery_date}
                          </span>
                        )}
                        {plan.available_units != null && plan.available_units > 0 && (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-sm font-semibold">
                            🏠 {plan.available_units} {locale === 'zh' ? '套' : locale === 'ru' ? 'ед.' : 'units'}
                          </span>
                        )}
                      </div>

                      {/* Stat chips */}
                      <div className="grid grid-cols-2 gap-3">
                        {plan.bedrooms > 0 && (
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-gray-900">{plan.bedrooms}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t('bedrooms')}</p>
                          </div>
                        )}
                        {plan.bathrooms > 0 && (
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-gray-900">{plan.bathrooms}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t('bathrooms')}</p>
                          </div>
                        )}
                        {plan.area_sqm > 0 && (
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-gray-900">{plan.area_sqm}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t('area')} m²</p>
                          </div>
                        )}
                        {plan.floors != null && plan.floors > 0 && (
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-gray-900">{plan.floors}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t('floors')}</p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {planDesc && (
                        <p className="text-gray-600 text-sm leading-relaxed">{planDesc}</p>
                      )}
                    </div>
                  </div>

                  {/* ── Investment returns ── */}
                  {plan.investment && (
                    <div className="border-t border-gray-100 p-6">
                      <InvestmentCard investment={plan.investment} locale={locale} />
                    </div>
                  )}

                  {/* ── Extra floor plan images (2nd+) ── */}
                  {floorPlanImgs.length > 1 && (
                    <div className="border-t border-gray-100 p-6">
                      <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">{t('floorPlan')}</p>
                      <GalleryGrid images={floorPlanImgs.slice(1)} title={planName} />
                    </div>
                  )}

                  {/* ── Interior renders ── */}
                  {previewImgs.length > 0 && (
                    <div className="border-t border-gray-100 p-6">
                      <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">{t('interiorRender')}</p>
                      <GalleryGrid images={previewImgs} title={`${planName} interior`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ContactButton whatsappNumber="66812345678" lineId="mira_samui" />
    </div>
  )
}
