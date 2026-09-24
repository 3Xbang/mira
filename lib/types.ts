// ─── Multilingual text ───────────────────────────────────────────────────────

export type Locale = 'zh' | 'en' | 'ru' | 'fr' | 'de' | 'es' | 'it'

export type MultiLangText = {
  [key in Locale]?: string
}

// ─── Project ─────────────────────────────────────────────────────────────────

export type ProjectStatus = 'on_sale' | 'coming_soon' | 'sold_out'

export interface Project {
  id: string
  status: ProjectStatus
  cover_image: string
  gallery: string[]           // effect / rendering images
  total_units: number
  available_units: number
  delivery_date: string       // e.g. "2026-Q4"
  location_address: string    // Chinese address
  location_lat?: number
  location_lng?: number
  price_from?: number         // starting price THB
  currency?: string
  name: MultiLangText         // project name in each language
  tagline: MultiLangText      // short tagline
  description: MultiLangText  // full description
  created_at: string
  updated_at: string
}

// ─── Floor Plan ──────────────────────────────────────────────────────────────

export interface FloorPlan {
  id: string
  project_id: string
  floor_plan_image: string    // plan drawing
  preview_image?: string      // interior render
  area_sqm: number
  bedrooms: number
  bathrooms: number
  floors?: number
  price_thb?: number
  available_units?: number
  sort_order: number
  name: MultiLangText         // e.g. "Type A — 2 Bed"
  description: MultiLangText
  created_at: string
}

// ─── Construction Progress ───────────────────────────────────────────────────

export interface ProgressUpdate {
  id: string                  // e.g. "2026-09"
  project_id: string
  date: string                // ISO date "2026-09-01"
  images: string[]
  title: MultiLangText
  description: MultiLangText
  created_at: string
}

// ─── Materials ───────────────────────────────────────────────────────────────

export type MaterialCategory =
  | 'flooring'
  | 'tiles'
  | 'bathroom'
  | 'kitchen'
  | 'doors'
  | 'windows'
  | 'lighting'
  | 'other'

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  flooring: '地板',
  tiles: '瓷砖',
  bathroom: '卫浴',
  kitchen: '厨具',
  doors: '门窗',
  windows: '窗户',
  lighting: '灯具',
  other: '其他',
}

export interface Material {
  id: string
  project_id: string
  category: MaterialCategory
  image: string
  brand?: string
  sort_order: number
  name: MultiLangText
  description: MultiLangText
  created_at: string
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Get text in the requested locale, falling back to en → zh → first available */
export function t(text: MultiLangText | undefined, locale: string): string {
  if (!text) return ''
  return (
    text[locale as Locale] ??
    text.en ??
    text.zh ??
    Object.values(text).find(v => v) ??
    ''
  )
}
