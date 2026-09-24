import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProjectById } from '@/lib/db'
import { t as tl } from '@/lib/types'
import ContactButton from '@/components/common/ContactButton'
import ProjectNav from '@/components/project/ProjectNav'

export const dynamic = 'force-dynamic'

export default async function LocationPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const project = await getProjectById(id).catch(() => null)
  if (!project) notFound()

  const t = await getTranslations('project')
  const name = tl(project.name, locale)

  const hasMap = !!(project.location_lat && project.location_lng)
  const mapSrc = hasMap
    ? `https://maps.google.com/maps?q=${project.location_lat},${project.location_lng}&z=15&output=embed`
    : null

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/50 text-sm mb-1">{name}</p>
          <h1 className="text-3xl font-bold text-white">{t('location')}</h1>
        </div>
      </div>

      <ProjectNav locale={locale} projectId={id} active="location" />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {project.location_address && (
          <div className="flex items-start gap-3 mb-8">
            <span className="text-2xl mt-0.5">📍</span>
            <p className="text-lg text-gray-700">{project.location_address}</p>
          </div>
        )}

        {mapSrc ? (
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[500px]">
            <iframe
              title="Project location"
              src={mapSrc}
              width="100%" height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📍</div>
            <p>{project.location_address ?? 'Location details coming soon.'}</p>
          </div>
        )}
      </div>

      <ContactButton whatsappNumber="66812345678" lineId="mira_samui" />
    </div>
  )
}
