'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/types'
import MultiImageUploader from '@/components/admin/MultiImageUploader'

function slug(t: string) {
  return t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export default function ProjectForm({ project, isNew }: { project: Project | null; isNew: boolean }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    id: project?.id ?? '',
    status: project?.status ?? 'coming_soon',
    cover_image: project?.cover_image ?? '',
    gallery: project?.gallery ?? [] as string[],
    total_units: project?.total_units ?? 0,
    available_units: project?.available_units ?? 0,
    delivery_date: project?.delivery_date ?? '',
    location_address: project?.location_address ?? '',
    location_lat: project?.location_lat ?? '',
    location_lng: project?.location_lng ?? '',
    price_from: project?.price_from ?? 0,
    currency: project?.currency ?? 'THB',
    name_zh: project?.name?.zh ?? '',
    tagline_zh: project?.tagline?.zh ?? '',
    description_zh: project?.description?.zh ?? '',
  })

  function set(k: string, v: any) { setForm(p => ({ ...p, [k]: v })) }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    set(name, ['total_units','available_units','price_from'].includes(name) ? Number(value) : value)
  }

  function handleNameZh(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    set('name_zh', v)
    if (isNew) set('id', slug(v))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.id.trim()) { setError('项目 ID 不能为空'); return }
    if (!form.name_zh.trim()) { setError('项目名称不能为空'); return }
    setError(''); setSaving(true)
    try {
      const body = {
        id: form.id,
        status: form.status,
        cover_image: form.cover_image,
        gallery: form.gallery,
        total_units: form.total_units,
        available_units: form.available_units,
        delivery_date: form.delivery_date,
        location_address: form.location_address,
        location_lat: form.location_lat ? Number(form.location_lat) : undefined,
        location_lng: form.location_lng ? Number(form.location_lng) : undefined,
        price_from: form.price_from,
        currency: form.currency,
        name: { zh: form.name_zh, ...(project?.name ?? {}) },
        tagline: { zh: form.tagline_zh, ...(project?.tagline ?? {}) },
        description: { zh: form.description_zh, ...(project?.description ?? {}) },
      }
      const res = await fetch('/admin/api/projects/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!res.ok) { setError((await res.json()).error ?? '保存失败'); return }
      setSuccess(true)
      setTimeout(() => router.push('/admin/projects'), 800)
    } catch { setError('网络错误') } finally { setSaving(false) }
  }

  const field = (label: string, name: string, opts?: { type?: string; placeholder?: string; required?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{opts?.required && <span className="text-red-500 ml-1">*</span>}</label>
      <input type={opts?.type ?? 'text'} name={name} value={(form as any)[name]} onChange={handleChange}
        placeholder={opts?.placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 基本信息 */}
      <Section title="基本信息">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">项目 ID <span className="text-red-500">*</span><span className="text-gray-400 text-xs ml-1">（URL用，仅英文/数字/连字符）</span></label>
          <input name="id" value={form.id} onChange={handleChange} disabled={!isNew} placeholder="mira-villa-koh-samui"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:bg-gray-50 disabled:text-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">项目名称（中文）<span className="text-red-500">*</span></label>
          <input name="name_zh" value={form.name_zh} onChange={handleNameZh} placeholder="Mira Villa 苏梅岛"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">短标语（中文）</label>
          <input name="tagline_zh" value={form.tagline_zh} onChange={handleChange} placeholder="苏梅岛顶级度假别墅"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">项目状态</label>
          <select name="status" value={form.status} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="coming_soon">即将开售</option>
            <option value="on_sale">在售</option>
            <option value="sold_out">已售罄</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field('总套数', 'total_units', { type: 'number' })}
          {field('可售套数', 'available_units', { type: 'number' })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field('预计交付', 'delivery_date', { placeholder: '2026-Q4' })}
          {field('起售价格', 'price_from', { type: 'number' })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">货币</label>
            <select name="currency" value={form.currency} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
              <option value="THB">THB 泰铢</option>
              <option value="USD">USD 美元</option>
            </select>
          </div>
          {field('项目地址', 'location_address', { placeholder: '苏梅岛 Chaweng 区' })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field('纬度（可选）', 'location_lat', { placeholder: '9.5120' })}
          {field('经度（可选）', 'location_lng', { placeholder: '100.0136' })}
        </div>
      </Section>

      {/* 项目描述 */}
      <Section title="项目描述（中文）">
        <textarea name="description_zh" value={form.description_zh} onChange={handleChange} rows={6}
          placeholder="详细介绍项目亮点、设施、周边环境..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
      </Section>

      {/* 封面图 */}
      <Section title="封面图">
        <MultiImageUploader
          images={form.cover_image ? [form.cover_image] : []}
          max={1}
          onChange={imgs => set('cover_image', imgs[0] ?? '')}
          label="上传封面图（1张）"
        />
      </Section>

      {/* 效果图相册 */}
      <Section title="效果图相册">
        <MultiImageUploader
          images={form.gallery}
          onChange={imgs => set('gallery', imgs)}
          label="上传效果图（可多张）"
        />
      </Section>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">❌ {error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">✅ 保存成功，跳转中...</div>}

      <div className="flex gap-4 pb-10">
        <button type="submit" disabled={saving}
          className="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          {saving ? '保存中...' : isNew ? '创建项目' : '保存修改'}
        </button>
        <button type="button" onClick={() => router.push('/admin/projects')}
          className="text-gray-500 hover:text-gray-700 text-sm">取消</button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  )
}
