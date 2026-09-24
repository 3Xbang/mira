'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { FloorPlan } from '@/lib/types'

export default function FloorPlanList({ plans, projectId }: { plans: FloorPlan[]; projectId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`删除户型「${name}」？`)) return
    setDeleting(id)
    await fetch(`/admin/api/floor-plans/${id}`, { method: 'DELETE' })
    router.refresh()
    setDeleting(null)
  }

  if (plans.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
      <div className="text-4xl mb-3">📐</div>
      <p>暂无户型，<Link href={`/admin/projects/${projectId}/floor-plans/new`} className="text-sky-500 hover:underline">立即添加</Link></p>
    </div>
  )

  return (
    <div className="grid gap-4">
      {plans.map(p => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 flex gap-4">
          <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
            {p.floor_plan_image
              ? <img src={p.floor_plan_image} alt="" className="w-full h-full object-contain" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">📐</div>}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{p.name?.zh ?? p.id}</p>
            <div className="flex gap-4 text-sm text-gray-500 mt-1">
              <span>🛏 {p.bedrooms} 卧</span>
              <span>🚿 {p.bathrooms} 卫</span>
              <span>📐 {p.area_sqm} m²</span>
              {p.price_thb && <span>💰 {p.price_thb.toLocaleString()} THB</span>}
            </div>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description?.zh}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0 text-sm">
            <Link href={`/admin/projects/${projectId}/floor-plans/${p.id}`}
              className="text-sky-500 hover:underline">编辑</Link>
            <button onClick={() => handleDelete(p.id, p.name?.zh ?? p.id)}
              disabled={deleting === p.id}
              className="text-red-400 hover:text-red-600 disabled:opacity-40">
              {deleting === p.id ? '...' : '删除'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
