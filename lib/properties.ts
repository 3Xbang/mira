const API_BASE = process.env.JIUDIAN_API_URL ?? 'https://miraa.homes/mira/api'

export interface PanoramaHotspot {
  pitch: number
  yaw: number
  targetPanoramaUrl: string
  label: string
}

export interface Property {
  id: string | number
  title: string
  type: 'new' | 'resale' | 'rental'
  price: number
  currency: string
  area_sqm?: number
  land_sqm?: number
  bedrooms?: number
  bathrooms?: number
  location?: string
  description?: string
  cover_image?: string
  images: string[]
  featured?: boolean
  panorama_url?: string
  panorama_hotspots?: PanoramaHotspot[]
}

async function fetchFromAPI(path: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/public/miraa${path}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function mapProperty(p: any, type: 'new' | 'resale' | 'rental'): Property {
  return {
    ...p,
    id: String(p.id),
    type: p.type ?? type,
    currency: p.currency ?? 'USD',
    images: p.images ?? (p.cover_image ? [p.cover_image] : []),
  }
}

export async function getAllProperties(): Promise<Property[]> {
  const data = await fetchFromAPI('/properties')
  if (!data?.data) return getFallbackProperties()
  return data.data.map((p: any) => mapProperty(p, p.property_type))
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const all = await getAllProperties()
  return all.filter(p => p.type === 'new' || p.type === 'resale').slice(0, 6)
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  const data = await fetchFromAPI(`/properties/${id}`)
  if (!data) return undefined
  return mapProperty(data, data.property_type)
}

export async function getHeroBanners(): Promise<string[]> {
  const data = await fetchFromAPI('/banners')
  return data?.data ?? []
}

export async function getSiteSettings(): Promise<{ whatsapp: string; lineId: string }> {
  const data = await fetchFromAPI('/settings')
  return {
    whatsapp: data?.miraa_whatsapp ?? '66812345678',
    lineId: data?.miraa_line_id ?? 'mira_samui',
  }
}

// Fallback data when API is unavailable
function getFallbackProperties(): Property[] {
  return []
}
