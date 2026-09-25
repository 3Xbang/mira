'use client'

import { useState } from 'react'
import type { FloorPlan } from '@/lib/types'
import { t as tl } from '@/lib/types'
import GalleryGrid from './GalleryGrid'
import InvestmentCard from './InvestmentCard'

function formatPrice(min?: number, max?: number, legacy?: number): string | null {
  const lo = min ?? legacy
  if (!lo) return null
  const fmt = (n: number) => `฿${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (max && max > lo) return `${fmt(lo)} – ${fmt(max)}`
  return `${fmt(lo)}+`
}

interface Props {
  plans: FloorPlan[]
  locale: string
  defaultIndex?: number
  labels: {
    floorPlan: string
    interiorRender: string
    bedrooms: string
    bathrooms: string
    area: string
    floors: string
    noFloorPlans: string
  }
}

export default function FloorPlanTabs({ plans, locale, labels, defaultIndex = 0 }: Props) {
  const [active, setActive] = useState(defaultIndex)

  if (plans.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-4">📐</div>
        <p>{labels.noFloorPlans}</p>
      </div>
    )
  }

  const plan = plans[active]
  const planName = tl(plan.name, locale)
  const planDesc = tl(plan.description, locale)

  const floorPlanImgs: string[] = plan.floor_plan_images?.length
    ? plan.floor_plan_images
    : (plan as any).floor_plan_image ? [(plan as any).floor_plan_image] : []
  const previewImgs: string[] = plan.preview_images?.length
    ? plan.preview_images
    : (plan as any).preview_image ? [(plan as any).preview_image] : []

  const priceStr = formatPrice(plan.price_min_thb, plan.price_max_thb, plan.price_thb)

  return (
    <div>
      {/* ── Tab selector ── */}
      {plans.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {plans.map((p, i) => {
            const n = tl(p.name, locale)
            const isActive = i === active
            return (
              <button
                key={p.id}
                onClick={() => setActive(i)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                  isActive
                    ? 'bg-ocean-blue text-white border-ocean-blue shadow-md shadow-sky-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:text-sky-600'
                }`}
              >
                {n}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Active floor plan detail ── */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">

      {/* Top: floor plan image FULL WIDTH, then info below */}
      <div className="flex flex-col">
        {/* Full-width image */}
        <div className="w-full bg-gray-50 flex items-center justify-center overflow-hidden rounded-t-2xl"
          style={{ minHeight: '320px', maxHeight: '520px' }}>
          {floorPlanImgs.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={floorPlanImgs[0]} alt={planName}
              className="w-full h-full object-cover" style={{ maxHeight: '520px' }} />
          ) : (
            <div className="text-gray-300 text-center py-16">
              <div className="text-6xl mb-3">📐</div>
              <p className="text-sm">{labels.floorPlan}</p>
            </div>
          )}
        </div>

        {/* Info panel below the image */}
        <div className="p-8 flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-gray-900">{planName}</h2>

          {/* Badges */}
          <div className="flex flex-wrap gap-3">
            {priceStr && (
              <span className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 border border-sky-200 px-4 py-2 rounded-full text-base font-semibold">
                💰 {priceStr}
              </span>
            )}
            {plan.delivery_date && (
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-full text-base font-semibold">
                📅 {plan.delivery_date}
              </span>
            )}
            {plan.available_units != null && plan.available_units > 0 && (
              <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-full text-base font-semibold">
                🏠 {plan.available_units} {locale === 'zh' ? '套' : locale === 'ru' ? 'ед.' : 'units'}
              </span>
            )}
          </div>

          {/* Stat chips — larger grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {plan.bedrooms > 0 && (
              <div className="bg-gray-50 rounded-2xl p-5 text-center">
                <p className="text-4xl font-bold text-gray-900">{plan.bedrooms}</p>
                <p className="text-sm text-gray-500 mt-1">{labels.bedrooms}</p>
              </div>
            )}
            {plan.bathrooms > 0 && (
              <div className="bg-gray-50 rounded-2xl p-5 text-center">
                <p className="text-4xl font-bold text-gray-900">{plan.bathrooms}</p>
                <p className="text-sm text-gray-500 mt-1">{labels.bathrooms}</p>
              </div>
            )}
            {plan.area_sqm > 0 && (
              <div className="bg-gray-50 rounded-2xl p-5 text-center">
                <p className="text-4xl font-bold text-gray-900">{plan.area_sqm}</p>
                <p className="text-sm text-gray-500 mt-1">{labels.area} m²</p>
              </div>
            )}
            {plan.floors != null && plan.floors > 0 && (
              <div className="bg-gray-50 rounded-2xl p-5 text-center">
                <p className="text-4xl font-bold text-gray-900">{plan.floors}</p>
                <p className="text-sm text-gray-500 mt-1">{labels.floors}</p>
              </div>
            )}
          </div>

          {planDesc && (
            <p className="text-gray-600 text-lg leading-relaxed">{planDesc}</p>
          )}
        </div>
      </div>

        {/* Investment returns */}
        {plan.investment && (
          <div className="border-t border-gray-100 p-6">
            <InvestmentCard investment={plan.investment} locale={locale} />
          </div>
        )}

        {/* Extra floor plan images */}
        {floorPlanImgs.length > 1 && (
          <div className="border-t border-gray-100 p-6">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">{labels.floorPlan}</p>
            <GalleryGrid images={floorPlanImgs.slice(1)} title={planName} />
          </div>
        )}

        {/* Interior renders */}
        {previewImgs.length > 0 && (
          <div className="border-t border-gray-100 p-6">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">{labels.interiorRender}</p>
            <GalleryGrid images={previewImgs} title={`${planName} interior`} />
          </div>
        )}
      </div>

      {/* Prev / Next navigation */}
      {plans.length > 1 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setActive(i => Math.max(0, i - 1))}
            disabled={active === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {locale === 'zh' ? '上一个' : locale === 'ru' ? 'Предыдущий' : 'Previous'}
          </button>
          <span className="text-sm text-gray-400 self-center">
            {active + 1} / {plans.length}
          </span>
          <button
            onClick={() => setActive(i => Math.min(plans.length - 1, i + 1))}
            disabled={active === plans.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {locale === 'zh' ? '下一个' : locale === 'ru' ? 'Следующий' : 'Next'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
