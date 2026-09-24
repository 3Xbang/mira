'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProgressUpdate } from '@/lib/types'
import MultiImageUploader from '@/components/admin/MultiImageUploader'

function uid() { return Date.now().toString(36) }

export default function ProgressForm({ update, projectId, isNew }: { update: ProgressUpdate | null; projectId: string; isNew: boolean }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const today = new Date().toISOString().slice(0, 7) // YYYY-MM

  const [form, setForm] = useState({
    title_zh: update?.title?.zh ?? '',
    description_zh: update?.description?.zh ?? '',
    date: update?.date ?? today + '-01',
    images: update?.images ?? [] as string[],
  })

  function set(k: string, v: any) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title_zh.trim()) { setError('标题不能为空'); return }
    if (form.images.length === 0) { setError('请至少上传一张照片'); return }
    setError(''); setSaving(true)
    try {
      const body = {
        id: update?.id ?? `progress-${projectId}-${uid()}`,
        project_id: projectId,
        date: form.date,
        images: form.images,
        title: { zh: form.title_zh, ...(update?.title ?? {}) },
        description: { zh: form.description_zh, ...(update?.description ?? {}) },
      }
      const res = await fetch('/admin/api/progress/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!res.ok) { setError((await res.json()).error ?? '保存失败'); return }
      router.push(`/admin/projects/${projectId}/progress`)
      router.refresh()
    } catch { setError('网络错误') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">进度信息</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">进度标题（中文）<span className="text-red-500">*</span></label>
          <input value={form.title_zh} onChange={e => set('title_zh', e.target.value)} placeholder="2026年9月施工进度"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">进度描述（中文）</label>
          <textarea value={form.description_zh} onChange={e => set('description_zh', e.target.value)} rows={4}
            placeholder="本月完成了地基浇筑，外墙砌砖工作进行中..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">施工照片 <span className="text-red-500">*</span></h2>
        <MultiImageUploader images={form.images} onChange={imgs => set('images', imgs)} label="上传施工现场照片（可多张）" />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">❌ {error}</div>}
      <div className="flex gap-4 pb-10">
        <button type="submit" disabled={saving}
          className="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold px-6 py-2.5 rounded-lg text-sm">
          {saving ? '保存中...' : isNew ? '发布进度' : '保存修改'}
        </button>
        <button type="button" onClick={() => router.push(`/admin/projects/${projectId}/progress`)}
          className="text-gray-500 hover:text-gray-700 text-sm">取消</button>
      </div>
    </form>
  )
}
