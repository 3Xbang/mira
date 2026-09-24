'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Property } from '@/lib/properties'
import ImageUploader from './ImageUploader'

interface Props {
  property: Property | null
  isNew: boolean
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function PropertyForm({ property, isNew }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    id: property?.id ?? '',
    title: property?.title ?? '',
    type: property?.type ?? 'new',
    price: property?.price ?? 0,
    currency: property?.currency ?? 'USD',
    area_sqm: property?.area_sqm ?? 0,
    land_sqm: property?.land_sqm ?? 0,
    bedrooms: property?.bedrooms ?? 0,
    bathrooms: property?.bathrooms ?? 0,
    location: property?.location ?? '',
    description: property?.description ?? '',
    featured: property?.featured ?? false,
    images: property?.images ?? [] as string[],
    panorama_url: property?.panorama_url ?? '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : ['price', 'area_sqm', 'land_sqm', 'bedrooms', 'bathrooms'].includes(name)
          ? Number(value)
          : value,
    }))
  }

  // Auto-generate ID from title when creating new
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setForm((prev) => ({
      ...prev,
      title,
      ...(isNew ? { id: slugify(title) } : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!String(form.id).trim()) { setError('ID 不能为空'); return }
    if (!String(form.title).trim()) { setError('标题不能为空'); return }
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/admin/api/properties/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? '保存失败'); return }
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/properties')
        router.refresh()
      }, 800)
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 text-base">基本信息</h2>

        {/* ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            房产 ID <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-1 text-xs">（URL路径，仅限英文字母、数字和连字符）</span>
          </label>
          <input
            name="id"
            value={form.id}
            onChange={handleChange}
            disabled={!isNew}
            required
            placeholder="beachfront-villa-chaweng"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleTitleChange}
            required
            placeholder="Beachfront Villa Chaweng"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Type + Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="new">新房</option>
              <option value="resale">二手房</option>
              <option value="rental">租赁</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">货币</label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="USD">USD</option>
              <option value="THB">THB</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">价格</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            min={0}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">建筑面积 (m²)</label>
            <input type="number" name="area_sqm" value={form.area_sqm} onChange={handleChange} min={0}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">土地面积 (m²)</label>
            <input type="number" name="land_sqm" value={form.land_sqm} onChange={handleChange} min={0}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
        </div>

        {/* Beds + Baths */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">卧室数量</label>
            <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} min={0}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">卫生间数量</label>
            <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} min={0}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Chaweng, Koh Samui"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">房产描述</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="描述这个房产的特色..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
          />
        </div>

        {/* Featured */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="featured"
            id="featured"
            checked={form.featured}
            onChange={handleChange}
            className="w-4 h-4 accent-sky-500 rounded"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
            ⭐ 设为精选（显示在首页）
          </label>
        </div>
      </div>

      {/* Images card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-base">房产图片</h2>
        <ImageUploader
          images={form.images}
          onChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs }))}
        />
      </div>

      {/* Panorama */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-base">360° 全景链接（可选）</h2>
        <input
          name="panorama_url"
          value={form.panorama_url}
          onChange={handleChange}
          placeholder="https://cdn.mira-samui.com/panorama/villa-xxx.jpg"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {/* Feedback */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
          ✅ 保存成功，正在跳转...
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {saving ? '保存中...' : isNew ? '创建房产' : '保存修改'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/properties')}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  )
}
