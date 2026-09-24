import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProjectById, getFloorPlansByProject } from '@/lib/db'
import { t as tl } from '@/lib/types'
import ContactButton from '@/components/common/ContactButton'
import ProjectNav from '@/components/project/ProjectNav'
import GalleryGrid from '@/components/project/GalleryGrid'

export const dynamic = 'force-dynamic'

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
              // Support both old single-image and new multi-image fields
              const floorPlanImgs: string[] = plan.floor_plan_images?.length
                ? plan.floor_plan_images
                : (plan as any).floor_plan_image ? [(plan as any).floor_plan_image] : []
              const previewImgs: string[] = plan.preview_images?.length
                ? plan.preview_images
                : (plan as any).preview_image ? [(plan as any).preview_image] : []

              return (
                <div key={plan.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {/* Top: info + first floor plan side by side */}
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* First floor plan image */}
                    <div className="bg-gray-50 p-6 flex items-center justify-center min-h-[300px]">
                      {floorPlanImgs.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={floorPlanImgs[0]} alt={planName}
                          className="max-w-full max-h-[400px] object-contain" />
                      ) : (
                        <div className="text-gray-300 text-center">
                          <div className="text-5xl mb-2">📐</div>
                          <p className="text-sm">{t('floorPlan')}</p>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-8 flex flex-col justify-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{planName}</h2>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
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
                        {plan.floors && plan.floors > 0 ? (
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-gray-900">{plan.floors}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t('floors')}</p>
                          </div>
                        ) : null}
                      </div>

                      {/* Price */}
                      {plan.price_thb && plan.price_thb > 0 ? (
                        <p className="text-xl font-semibold text-ocean-blue mb-4">
                          THB {plan.price_thb.toLocaleString()}
                        </p>
                      ) : null}

                      {/* Description */}
                      {planDesc && (
                        <p className="text-gray-600 text-sm leading-relaxed">{planDesc}</p>
                      )}
                    </div>
                  </div>

                  {/* Extra floor plan images (2nd onwards) */}
                  {floorPlanImgs.length > 1 && (
                    <div className="border-t border-gray-100 p-6">
                      <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">{t('floorPlan')}</p>
                      <GalleryGrid images={floorPlanImgs.slice(1)} title={planName} />
                    </div>
                  )}

                  {/* Interior renders */}
                  {previewImgs.length > 0 && (
                    <div className="border-t border-gray-100 p-6">
                      <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">{t('interiorRender')}</p>
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
