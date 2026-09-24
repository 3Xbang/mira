'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Material, MaterialCategory } from '@/lib/types'
import { MATERIAL_CATEGORY_LABELS } from '@/lib/types'
import MultiImageUploader from '@/components/admin/MultiImageUploader'

function uid() { return Date.now().toString(36) }

export default function MaterialForm({ material, projectId, isNew }: { material: Material | null; projectId: string; isNew: boolean }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name_zh: material?.name?.zh ?? '',
    description_zh: material?.description?.zh ?? '',
    category: material?.category ?? 'flooring' as MaterialCategory,
    brand: material?.brand ?? '',
    image: material?.image ?? '',
    sort_order: material?.sort_order ?? 0,
  })

  function set(k: string, v: any) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name_zh.trim()) { setError('材料名称不能为空'); return }
    if (!form.image) { setError('请上传材料图片'); return }
    setError(''); setSaving(true)
    try {
      const body = {
        id: material?.id ?? `mat-${projectId}-${uid()}`,
        project_id: projectId,
        category: form.category,
        image: form.image,
        brand: form.brand,
        sort_order: form.sort_order,
        name: { zh: form.name_zh, ...(material?.name ?? {}) },
        description: { zh: form.description_zh, ...(material?.description ?? {}) },
      }
      const res = await fetch('/admin/api/materials/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!res.ok) { setError((await res.json()).error ?? '保存失败'); return }
      router.push(`/admin/projects/${projectId}/materials`)
      router.refresh()
    } catch { setError('网络错误') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">材料信息</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">材料名称（中文）<span className="text-red-500">*</span></label>
          <input value={form.name_zh} onChange={e => set('name_zh', e.target.value)} placeholder="木纹地板"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">类别</label>
          <select value={form.category} onChange={e => set('category', e.target.value as MaterialCategory)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
            {Object.entries(MATERIAL_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
          <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Porcelanosa"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">材料描述（中文）</label>
          <textarea value={form.description_zh} onChange={e => set('description_zh', e.target.value)} rows={3}
            placeholder="产品型号、颜色、规格等说明..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
          <input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} min={0}
            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">材料图片 <span className="text-red-500">*</span></h2>
        <MultiImageUploader images={form.image ? [form.image] : []} max={1}
          onChange={imgs => set('image', imgs[0] ?? '')} label="上传材料样品图（1张）" />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">❌ {error}</div>}
      <div className="flex gap-4 pb-10">
        <button type="submit" disabled={saving}
          className="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold px-6 py-2.5 rounded-lg text-sm">
          {saving ? '保存中...' : isNew ? '添加材料' : '保存修改'}
        </button>
        <button type="button" onClick={() => router.push(`/admin/projects/${projectId}/materials`)}
          className="text-gray-500 hover:text-gray-700 text-sm">取消</button>
      </div>
    </form>
  )
}
