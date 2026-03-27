'use client'

import { useState } from 'react'
import type { Property } from '@/lib/properties'
import PropertyCard from '@/components/property/PropertyCard'

interface FeaturedPropertiesProps {
  locale: string
  properties: Property[]
}

const tabs = [
  { key: 'all', label: 'All Properties' },
  { key: 'new', label: 'New Homes' },
  { key: 'resale', label: 'Resale' },
  { key: 'rental', label: 'For Rent' },
] as const

export default function FeaturedProperties({ locale, properties }: FeaturedPropertiesProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'resale' | 'rental'>('all')

  const filtered = activeTab === 'all'
    ? properties
    : properties.filter((p) => p.type === activeTab)

  return (
    <section id="featured" className="bg-light-gray py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray">
            Featured Properties
          </h2>
          <p className="mt-3 text-gray-500 text-base md:text-lg max-w-xl mx-auto">
            Handpicked luxury villas and residences on Koh Samui
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-white rounded-full shadow-sm p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
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

        {/* Property grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property) => (
              <PropertyCard key={property.id} {...property} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            No properties in this category yet.
          </div>
        )}
      </div>
    </section>
  )
}
