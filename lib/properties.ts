import propertiesData from '@/data/properties.json'

// Represents a navigation hotspot inside a 360° panorama viewer
export interface PanoramaHotspot {
  pitch: number
  yaw: number
  targetPanoramaUrl: string
  label: string
}

// Represents a single property listing
export interface Property {
  id: string
  title: string
  type: 'new' | 'resale' | 'rental'
  price: number
  currency: string
  area_sqm: number
  land_sqm: number
  bedrooms: number
  bathrooms: number
  location: string
  description: string
  images: string[]
  featured: boolean
  // Optional 360° panorama fields
  panorama_url?: string
  panorama_hotspots?: PanoramaHotspot[]
}

// Returns all properties from the static JSON data file
export function getAllProperties(): Property[] {
  return propertiesData as Property[]
}

// Returns only properties marked as featured (shown on the homepage)
export function getFeaturedProperties(): Property[] {
  return getAllProperties().filter((p) => p.featured === true)
}

// Returns the property matching the given id, or undefined if not found
export function getPropertyById(id: string): Property | undefined {
  return getAllProperties().find((p) => p.id === id)
}
