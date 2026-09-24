'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FloorPlan } from '@/lib/types'
import MultiImageUploader from '@/components/admin/MultiImageUploader'

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

export default function FloorPlanForm({ plan, projectId, isNew }: { plan: FloorPlan | null; projectId: string; isNew: boolean }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name_zh: plan?.name?.zh ?? '',
    description_zh: plan?.description?.zh ?? '',
    floor_plan_image: plan?.floor_plan_image ?? '',
    preview_image: plan?.preview_image ?? '',
    area_sqm: plan?.area_sqm ?? 0,
    bedrooms: plan?.bedrooms ?? 2,
    bathrooms: plan?.bathrooms ?? 2,
    floors: plan?.floors ?? 1,
    price_thb: plan?.price_thb ?? 0,
    available_units: plan?.available_units ?? 0,
    sort_order: plan?.sort_order ?? 0,
  })

  function set(k: string, v: any) { setForm(p => ({ ...p, [k]: v })) }
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    set(name, ['area_sqm','bedrooms','bathrooms','floors','price_thb','available_units','sort_order'].includes(name) ? Number(value) : value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name_zh.trim()) { setError('户型名称不能为空'); return }
    setError(''); setSaving(true)
    try {
      const body = {
        id: plan?.id ?? `plan-${projectId}-${uid()}`,
        project_id: projectId,
        ...form,
        name: { zh: form.name_zh, ...(plan?.name ?? {}) },
        description: { zh: form.description_zh, ...(plan?.description ?? {}) },
      }
      const res = await fetch('/admin/api/floor-plans/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!res.ok) { setError((await res.json()).error ?? '保存失败'); return }
      router.push(`/admin/projects/${projectId}/floor-plans`)
      router.refresh()
    } catch { setError('网络错误') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">户型信息</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">户型名称（中文）<span className="text-red-500">*</span></label>
          <input name="name_zh" value={form.name_zh} onChange={handleChange} placeholder="A型 — 两卧室花园别墅"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['bedrooms','卧室数'],['bathrooms','卫生间数'],['floors','楼层数']].map(([n,l]) => (
            <div key={n}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              <input type="number" name={n} value={(form as any)[n]} onChange={handleChange} min={0}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['area_sqm','建筑面积 (m²)'],['price_thb','价格 (THB)'],['available_units','可售套数']].map(([n,l]) => (
            <div key={n}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              <input type="number" name={n} value={(form as any)[n]} onChange={handleChange} min={0}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">户型描述（中文）</label>
          <textarea name="description_zh" value={form.description_zh} onChange={handleChange} rows={3}
            placeholder="介绍这个户型的特色..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">排序（数字小的优先显示）</label>
          <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} min={0}
            className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">户型平面图</h2>
        <MultiImageUploader images={form.floor_plan_image ? [form.floor_plan_image] : []} max={1}
          onChange={imgs => set('floor_plan_image', imgs[0] ?? '')} label="上传平面图（1张）" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">效果图（可选）</h2>
        <MultiImageUploader images={form.preview_image ? [form.preview_image] : []} max={1}
          onChange={imgs => set('preview_image', imgs[0] ?? '')} label="上传室内效果图（1张）" />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">❌ {error}</div>}
      <div className="flex gap-4 pb-10">
        <button type="submit" disabled={saving}
          className="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold px-6 py-2.5 rounded-lg text-sm">
          {saving ? '保存中...' : isNew ? '添加户型' : '保存修改'}
        </button>
        <button type="button" onClick={() => router.push(`/admin/projects/${projectId}/floor-plans`)}
          className="text-gray-500 hover:text-gray-700 text-sm">取消</button>
      </div>
    </form>
  )
}
