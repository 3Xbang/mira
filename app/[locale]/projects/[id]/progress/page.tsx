import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProjectById, getProgressByProject } from '@/lib/db'
import { t as tl } from '@/lib/types'
import ContactButton from '@/components/common/ContactButton'
import ProjectNav from '@/components/project/ProjectNav'
import GalleryGrid from '@/components/project/GalleryGrid'

export const dynamic = 'force-dynamic'

export default async function ProgressPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const [project, updates] = await Promise.all([
    getProjectById(id).catch(() => null),
    getProgressByProject(id).catch(() => []),
  ])
  if (!project) notFound()

  const t = await getTranslations('project')
  const name = tl(project.name, locale)

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/50 text-sm mb-1">{name}</p>
          <h1 className="text-3xl font-bold text-white">{t('progress')}</h1>
        </div>
      </div>

      <ProjectNav locale={locale} projectId={id} active="progress" />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {updates.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🏗️</div>
            <p>{t('noProgress')}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 hidden md:block" />

            <div className="space-y-12">
              {updates.map((update) => {
                const title = tl(update.title, locale)
                const desc = tl(update.description, locale)
                const dateObj = update.date ? new Date(update.date) : null
                const dateStr = dateObj
                  ? dateObj.toLocaleDateString(locale, { year: 'numeric', month: 'long' })
                  : update.date

                return (
                  <div key={update.id} className="md:pl-16 relative">
                    {/* Timeline dot */}
                    <div className="hidden md:flex absolute left-0 top-1 w-12 h-12 bg-ocean-blue rounded-full items-center justify-center text-white font-bold text-xs shadow-md">
                      {dateObj ? dateObj.toLocaleDateString(locale, { month: 'short' }) : '📸'}
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-6 pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                          <span className="text-sm text-gray-400 shrink-0">{dateStr}</span>
                        </div>
                        {desc && (
                          <p className="text-gray-600 mt-2 leading-relaxed">{desc}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{update.images.length} 张照片</p>
                      </div>

                      {/* Photos */}
                      {update.images.length > 0 && (
                        <div className="px-6 pb-6">
                          <GalleryGrid images={update.images} title={title} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <ContactButton whatsappNumber="66812345678" lineId="mira_samui" />
    </div>
  )
}
