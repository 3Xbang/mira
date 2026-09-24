'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FloorPlan } from '@/lib/types'
import MultiImageUploader from '@/components/admin/MultiImageUploader'

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

function NumField({ label, value, onChange, prefix, suffix, placeholder }: {
  label: string; value: number | string; onChange: (v: number) => void
  prefix?: string; suffix?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-sm text-gray-400 shrink-0">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={0}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        {suffix && <span className="text-sm text-gray-400 shrink-0">{suffix}</span>}
      </div>
    </div>
  )
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className={`bg-white rounded-xl border p-6 space-y-4 ${accent ?? 'border-gray-100'}`}>
      <h2 className="font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  )
}

export default function FloorPlanForm({ plan, projectId, isNew }: { plan: FloorPlan | null; projectId: string; isNew: boolean }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const inv = plan?.investment
  const [form, setForm] = useState({
    name_zh: plan?.name?.zh ?? '',
    description_zh: plan?.description?.zh ?? '',
    floor_plan_images: plan?.floor_plan_images ?? [] as string[],
    preview_images: plan?.preview_images ?? [] as string[],
    area_sqm: plan?.area_sqm ?? 0,
    bedrooms: plan?.bedrooms ?? 2,
    bathrooms: plan?.bathrooms ?? 2,
    floors: plan?.floors ?? 1,
    price_min_thb: plan?.price_min_thb ?? 0,
    price_max_thb: plan?.price_max_thb ?? 0,
    available_units: plan?.available_units ?? 0,
    delivery_date: plan?.delivery_date ?? '',
    sort_order: plan?.sort_order ?? 0,
    // Monthly rental
    monthly_rent_thb: inv?.monthly_rent_thb ?? 0,
    monthly_occupancy_rate: inv?.monthly_occupancy_rate ?? 0,
    monthly_annual_income: inv?.monthly_annual_income ?? 0,
    monthly_roi: inv?.monthly_roi ?? 0,
    monthly_payback_years: inv?.monthly_payback_years ?? 0,
    monthly_mgmt_fee: inv?.monthly_mgmt_fee ?? 0,
    // Daily rental
    daily_rent_thb: inv?.daily_rent_thb ?? 0,
    daily_occupancy_rate: inv?.daily_occupancy_rate ?? 0,
    daily_annual_income: inv?.daily_annual_income ?? 0,
    daily_roi: inv?.daily_roi ?? 0,
    daily_payback_years: inv?.daily_payback_years ?? 0,
    daily_mgmt_fee: inv?.daily_mgmt_fee ?? 0,
  })

  function set(k: string, v: any) { setForm(p => ({ ...p, [k]: v })) }
  function num(k: string) { return (form as any)[k] as number }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name_zh.trim()) { setError('户型名称不能为空'); return }
    setError(''); setSaving(true)
    try {
      const body = {
        id: plan?.id ?? `plan-${projectId}-${uid()}`,
        project_id: projectId,
        floor_plan_images: form.floor_plan_images,
        preview_images: form.preview_images,
        area_sqm: form.area_sqm,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        floors: form.floors,
        price_min_thb: form.price_min_thb || undefined,
        price_max_thb: form.price_max_thb || undefined,
        available_units: form.available_units,
        delivery_date: form.delivery_date || undefined,
        sort_order: form.sort_order,
        investment: {
          monthly_rent_thb: form.monthly_rent_thb || undefined,
          monthly_occupancy_rate: form.monthly_occupancy_rate || undefined,
          monthly_annual_income: form.monthly_annual_income || undefined,
          monthly_roi: form.monthly_roi || undefined,
          monthly_payback_years: form.monthly_payback_years || undefined,
          monthly_mgmt_fee: form.monthly_mgmt_fee || undefined,
          daily_rent_thb: form.daily_rent_thb || undefined,
          daily_occupancy_rate: form.daily_occupancy_rate || undefined,
          daily_annual_income: form.daily_annual_income || undefined,
          daily_roi: form.daily_roi || undefined,
          daily_payback_years: form.daily_payback_years || undefined,
          daily_mgmt_fee: form.daily_mgmt_fee || undefined,
        },
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

      {/* 基本信息 */}
      <Section title="户型信息">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">户型名称（中文）<span className="text-red-500">*</span></label>
          <input value={form.name_zh} onChange={e => set('name_zh', e.target.value)} placeholder="A型 — 两卧室花园别墅"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <NumField label="卧室数" value={form.bedrooms} onChange={v => set('bedrooms', v)} />
          <NumField label="卫生间数" value={form.bathrooms} onChange={v => set('bathrooms', v)} />
          <NumField label="楼层数" value={form.floors} onChange={v => set('floors', v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="建筑面积 (m²)" value={form.area_sqm} onChange={v => set('area_sqm', v)} />
          <NumField label="可售套数" value={form.available_units} onChange={v => set('available_units', v)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">预计交付</label>
          <input value={form.delivery_date} onChange={e => set('delivery_date', e.target.value)}
            placeholder="2027-Q2"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">户型描述（中文）</label>
          <textarea value={form.description_zh} onChange={e => set('description_zh', e.target.value)} rows={3}
            placeholder="介绍这个户型的特色..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">排序（数字小的优先）</label>
          <input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} min={0}
            className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
      </Section>

      {/* 价格区间 */}
      <Section title="💰 价格区间（THB）">
        <div className="grid grid-cols-2 gap-4">
          <NumField label="最低价（THB）" value={form.price_min_thb} onChange={v => set('price_min_thb', v)}
            placeholder="2900000" />
          <NumField label="最高价（THB）" value={form.price_max_thb} onChange={v => set('price_max_thb', v)}
            placeholder="3500000" />
        </div>
        <p className="text-xs text-gray-400">只填最低价则显示"起售 XXX"，两个都填则显示价格区间</p>
      </Section>

      {/* 月租投资数据 */}
      <Section title="🏠 月租投资回报数据" accent="border-blue-100">
        <div className="grid grid-cols-2 gap-4">
          <NumField label="月租金（THB/月）" value={num('monthly_rent_thb')}
            onChange={v => set('monthly_rent_thb', v)} placeholder="80000" />
          <NumField label="年均出租率" value={num('monthly_occupancy_rate')}
            onChange={v => set('monthly_occupancy_rate', v)} suffix="%" placeholder="85" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumField label="年租金收入（THB）" value={num('monthly_annual_income')}
            onChange={v => set('monthly_annual_income', v)} placeholder="816000" />
          <NumField label="年投资回报率" value={num('monthly_roi')}
            onChange={v => set('monthly_roi', v)} suffix="%" placeholder="7.5" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumField label="预计回本年限" value={num('monthly_payback_years')}
            onChange={v => set('monthly_payback_years', v)} suffix="年" placeholder="13" />
          <NumField label="年物业管理费（THB）" value={num('monthly_mgmt_fee')}
            onChange={v => set('monthly_mgmt_fee', v)} placeholder="50000" />
        </div>
        <p className="text-xs text-gray-400">按长租/月租模式计算，留空则前台不显示此板块</p>
      </Section>

      {/* 日租投资数据 */}
      <Section title="🌴 日租/短租投资回报数据" accent="border-amber-100">
        <div className="grid grid-cols-2 gap-4">
          <NumField label="每晚租金（THB/晚）" value={num('daily_rent_thb')}
            onChange={v => set('daily_rent_thb', v)} placeholder="15000" />
          <NumField label="年均出租率" value={num('daily_occupancy_rate')}
            onChange={v => set('daily_occupancy_rate', v)} suffix="%" placeholder="70" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumField label="年租金收入（THB）" value={num('daily_annual_income')}
            onChange={v => set('daily_annual_income', v)} placeholder="3832500" />
          <NumField label="年投资回报率" value={num('daily_roi')}
            onChange={v => set('daily_roi', v)} suffix="%" placeholder="9.0" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumField label="预计回本年限" value={num('daily_payback_years')}
            onChange={v => set('daily_payback_years', v)} suffix="年" placeholder="11" />
          <NumField label="年物业管理费（THB）" value={num('daily_mgmt_fee')}
            onChange={v => set('daily_mgmt_fee', v)} placeholder="80000" />
        </div>
        <p className="text-xs text-gray-400">按短租/民宿模式计算，留空则前台不显示此板块</p>
      </Section>

      {/* 平面图 */}
      <Section title="📐 户型平面图">
        <p className="text-xs text-gray-400 -mt-2">可上传多张，第一张为主图</p>
        <MultiImageUploader images={form.floor_plan_images}
          onChange={imgs => set('floor_plan_images', imgs)} label="上传平面图（可多张）" />
      </Section>

      {/* 效果图 */}
      <Section title="🎨 效果图（可选）">
        <p className="text-xs text-gray-400 -mt-2">室内外效果图，可上传多张</p>
        <MultiImageUploader images={form.preview_images}
          onChange={imgs => set('preview_images', imgs)} label="上传效果图（可多张）" />
      </Section>

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
