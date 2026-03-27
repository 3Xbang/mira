'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Property } from '@/lib/properties'

interface FeaturedPropertiesProps {
  locale: string
  properties: Property[]
}

const tabs = [
  { key: 'new', label: 'New Homes' },
  { key: 'resale', label: 'Resale' },
  { key: 'rental', label: 'For Rent' },
] as const

// Placeholder image for empty slots
const PLACEHOLDER = 'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596228/mira_homes_A_erq6cj.png'

export default function FeaturedProperties({ locale, properties }: FeaturedPropertiesProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'resale' | 'rental'>('new')

  const filtered = properties.filter((p) => p.type === activeTab)

  return (
    <section id="featured" className="bg-light-gray py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray">Properties</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Luxury villas and residences on Koh Samui
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-full shadow-sm p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-ocean-blue text-white shadow'
                    : 'text-gray-500 hover:text-dark-gray'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid — 3 columns, as many rows as needed */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {filtered.length > 0 ? filtered.map((property) => (
              <Link
                key={property.id}
                href={`/${locale}/properties/${property.id}`}
                className="relative aspect-square overflow-hidden rounded-lg group"
              >
                <Image
                  src={property.images[0] || PLACEHOLDER}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                  <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-semibold leading-tight line-clamp-1">{property.title}</p>
                    <p className="text-xs text-white/80">{property.location}</p>
                  </div>
                </div>
              </Link>
            )) : (
            <div className="col-span-3 text-center py-16 text-gray-400">
              No properties in this category yet.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
