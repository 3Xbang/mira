'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ProgressUpdate } from '@/lib/types'

export default function ProgressList({ updates, projectId }: { updates: ProgressUpdate[]; projectId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, title: string) {
    if (!confirm(`删除「${title}」？`)) return
    setDeleting(id)
    await fetch(`/admin/api/progress/${id}`, { method: 'DELETE' })
    router.refresh(); setDeleting(null)
  }

  if (updates.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
      <div className="text-4xl mb-3">📸</div>
      <p>暂无进度更新，<Link href={`/admin/projects/${projectId}/progress/new`} className="text-sky-500 hover:underline">立即上传</Link></p>
    </div>
  )

  return (
    <div className="space-y-4">
      {updates.map(u => (
        <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-5 flex gap-4">
          {/* Images preview */}
          <div className="flex gap-1 shrink-0">
            {u.images.slice(0, 3).map((img, i) => (
              <div key={i} className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {u.images.length > 3 && (
              <div className="w-20 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-medium">
                +{u.images.length - 3}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{u.title?.zh ?? u.id}</p>
              <span className="text-xs text-gray-400">{u.date}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{u.description?.zh}</p>
            <p className="text-xs text-gray-400 mt-1">{u.images.length} 张照片</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0 text-sm">
            <Link href={`/admin/projects/${projectId}/progress/${u.id}`} className="text-sky-500 hover:underline">编辑</Link>
            <button onClick={() => handleDelete(u.id, u.title?.zh ?? u.id)}
              disabled={deleting === u.id} className="text-red-400 hover:text-red-600 disabled:opacity-40">
              {deleting === u.id ? '...' : '删除'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
