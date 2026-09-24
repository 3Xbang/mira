'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Material, MaterialCategory } from '@/lib/types'

export default function MaterialList({ materials, projectId, categoryLabels }: {
  materials: Material[]; projectId: string; categoryLabels: Record<MaterialCategory, string>
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`删除「${name}」？`)) return
    setDeleting(id)
    await fetch(`/admin/api/materials/${id}`, { method: 'DELETE' })
    router.refresh(); setDeleting(null)
  }

  if (materials.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
      <div className="text-4xl mb-3">🪵</div>
      <p>暂无材料，<Link href={`/admin/projects/${projectId}/materials/new`} className="text-sky-500 hover:underline">立即添加</Link></p>
    </div>
  )

  // Group by category
  const grouped = materials.reduce<Record<string, Material[]>>((acc, m) => {
    const cat = m.category ?? 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            {categoryLabels[cat as MaterialCategory] ?? cat}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map(m => (
              <div key={m.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
                <div className="aspect-square bg-gray-50">
                  {m.image
                    ? <img src={m.image} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">🪵</div>}
                </div>
                <div className="p-3">
                  <p className="font-medium text-gray-900 text-sm truncate">{m.name?.zh ?? m.id}</p>
                  {m.brand && <p className="text-xs text-gray-400">{m.brand}</p>}
                  <div className="flex gap-3 mt-2">
                    <Link href={`/admin/projects/${projectId}/materials/${m.id}`}
                      className="text-xs text-sky-500 hover:underline">编辑</Link>
                    <button onClick={() => handleDelete(m.id, m.name?.zh ?? m.id)}
                      disabled={deleting === m.id} className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40">
                      {deleting === m.id ? '...' : '删除'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
