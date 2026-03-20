import { getTranslations } from 'next-intl/server'
import type { Property } from '@/lib/properties'
import PropertyCard from '@/components/property/PropertyCard'

interface FeaturedPropertiesProps {
  locale: string
  properties: Property[]
}

// Featured properties grid section shown on the homepage
export default async function FeaturedProperties({ locale, properties }: FeaturedPropertiesProps) {
  const t = await getTranslations('property')

  return (
    <section id="featured" className="bg-light-gray py-16 px-4 md:px-8 lg:px-16">
      {/* Section heading */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray">
            {t('featuredTitle')}
          </h2>
          <p className="mt-3 text-gray-500 text-base md:text-lg max-w-xl mx-auto">
            {t('featuredSubtitle')}
          </p>
        </div>

        {/* Responsive property grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
