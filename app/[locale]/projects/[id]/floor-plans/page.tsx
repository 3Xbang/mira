import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProjectById, getFloorPlansByProject } from '@/lib/db'
import { t as tl } from '@/lib/types'
import ContactButton from '@/components/common/ContactButton'
import ProjectNav from '@/components/project/ProjectNav'
import FloorPlanTabs from '@/components/project/FloorPlanTabs'

export const dynamic = 'force-dynamic'

export default async function FloorPlansPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ plan?: string }>
}) {
  const { locale, id } = await params
  const { plan: defaultPlanId } = await searchParams

  const [project, plans] = await Promise.all([
    getProjectById(id).catch(() => null),
    getFloorPlansByProject(id).catch(() => []),
  ])
  if (!project) notFound()

  const t = await getTranslations('project')
  const name = tl(project.name, locale)

  // Find the default tab index based on ?plan= param
  const defaultIndex = defaultPlanId
    ? Math.max(0, plans.findIndex(p => p.id === defaultPlanId))
    : 0

  const labels = {
    floorPlan: t('floorPlan'),
    interiorRender: t('interiorRender'),
    bedrooms: t('bedrooms'),
    bathrooms: t('bathrooms'),
    area: t('area'),
    floors: t('floors'),
    noFloorPlans: t('noFloorPlans'),
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/50 text-sm mb-1">{name}</p>
          <h1 className="text-3xl font-bold text-white">{t('floorPlans')}</h1>
          {plans.length > 0 && (
            <p className="text-white/40 text-sm mt-1">
              {plans.length} {locale === 'zh' ? '种户型' : locale === 'ru' ? 'планировок' : 'floor plans'}
            </p>
          )}
        </div>
      </div>

      <ProjectNav locale={locale} projectId={id} active="floor-plans" />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <FloorPlanTabs
          plans={plans}
          locale={locale}
          labels={labels}
          defaultIndex={defaultIndex}
        />
      </div>

      <ContactButton whatsappNumber="66812345678" lineId="mira_samui" />
    </div>
  )
}
