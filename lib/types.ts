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

export interface RentalInvestment {
  // Monthly rental
  monthly_rent_thb?: number        // monthly rent (THB)
  monthly_occupancy_rate?: number  // occupancy rate % e.g. 85
  monthly_annual_income?: number   // annual income (THB)
  monthly_roi?: number             // annual ROI % e.g. 7.5
  monthly_payback_years?: number   // payback period (years)
  monthly_mgmt_fee?: number        // annual management fee (THB)

  // Daily / short-stay rental
  daily_rent_thb?: number          // nightly rate (THB)
  daily_occupancy_rate?: number    // occupancy rate % e.g. 70
  daily_annual_income?: number     // annual income (THB)
  daily_roi?: number               // annual ROI % e.g. 9.0
  daily_payback_years?: number     // payback period (years)
  daily_mgmt_fee?: number          // annual management fee (THB)
}

export interface FloorPlan {
  id: string
  project_id: string
  floor_plan_images: string[]   // multiple floor plan drawings
  preview_images: string[]      // multiple interior renders
  area_sqm: number
  bedrooms: number
  bathrooms: number
  floors?: number
  // Price range
  price_min_thb?: number        // minimum price (THB)
  price_max_thb?: number        // maximum price (THB)
  price_thb?: number            // legacy single price (kept for backward compat)
  available_units?: number
  delivery_date?: string        // e.g. "2027-Q2"
  sort_order: number
  investment?: RentalInvestment
  name: MultiLangText
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
