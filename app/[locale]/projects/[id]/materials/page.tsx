import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProjectById, getMaterialsByProject } from '@/lib/db'
import { t as tl, type Material } from '@/lib/types'
import type { MaterialCategory } from '@/lib/types'

import ContactButton from '@/components/common/ContactButton'
import ProjectNav from '@/components/project/ProjectNav'

export const dynamic = 'force-dynamic'

const CAT_ICON: Record<MaterialCategory, string> = {
  flooring: '🪵', tiles: '🔲', bathroom: '🚿',
  kitchen: '🍳', doors: '🚪', windows: '🪟',
  lighting: '💡', other: '📦',
}

export default async function MaterialsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const [project, materials] = await Promise.all([
    getProjectById(id).catch(() => null),
    getMaterialsByProject(id).catch(() => []),
  ])
  if (!project) notFound()

  const t = await getTranslations('project')
  const name = tl(project.name, locale)

  // Group by category
  const grouped = materials.reduce<Record<string, Material[]>>((acc, m) => {
    const cat = m.category ?? 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})

  const catLabel = (cat: string) => {
    try { return t(`cat_${cat}` as any) } catch { return cat }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/50 text-sm mb-1">{name}</p>
          <h1 className="text-3xl font-bold text-white">{t('materials')}</h1>
        </div>
      </div>

      <ProjectNav locale={locale} projectId={id} active="materials" />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {materials.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🪵</div>
            <p>{t('noMaterials')}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">{CAT_ICON[cat as MaterialCategory] ?? '📦'}</span>
                  <h2 className="text-xl font-bold text-gray-900">{catLabel(cat)}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((material) => {
                    const matName = tl(material.name, locale)
                    const matDesc = tl(material.description, locale)
                    return (
                      <div key={material.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gray-50">
                          {material.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={material.image} alt={matName}
                              className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              {CAT_ICON[material.category] ?? '📦'}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-gray-900 text-sm">{matName}</p>
                          {material.brand && (
                            <p className="text-xs text-ocean-blue mt-0.5">{material.brand}</p>
                          )}
                          {matDesc && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{matDesc}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContactButton whatsappNumber="66812345678" lineId="mira_samui" />
    </div>
  )
}
