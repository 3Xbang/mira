import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Property } from '@/lib/properties'

interface PropertyCardProps extends Property {
  locale: string
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true" className="shrink-0 text-ocean-blue">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  )
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true" className="shrink-0 text-dark-gray">
      <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
    </svg>
  )
}

function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true" className="shrink-0 text-dark-gray">
      <path d="M7 6c0-1.1.9-2 2-2s2 .9 2 2v1H7V6zm14 5H3V6c0-.55-.45-1-1-1s-1 .45-1 1v13h2v-3h18v3h2V11h-2zm-1 7H4v-5h16v5z" />
    </svg>
  )
}

// Property summary card linking to the detail page
export default async function PropertyCard({
  id,
  title,
  price,
  currency,
  area_sqm,
  bedrooms,
  bathrooms,
  location,
  images,
  locale,
}: PropertyCardProps) {
  const t = await getTranslations('property')

  return (
    <Link
      href={`/${locale}/properties/${id}`}
      className="group block bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail — 16:9 aspect ratio */}
      <div className="relative w-full aspect-video">
        <Image
          src={images[0]}
          alt={title}
          fill
          loading="lazy"
          className="object-cover"
        />
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2">
        {/* Title */}
        <h3 className="font-semibold text-dark-gray text-lg leading-snug line-clamp-2">
          {title}
        </h3>

        {/* Price */}
        <p className="text-ocean-blue font-bold text-xl">
          {price.toLocaleString()} {currency}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <PinIcon />
          <span>{location}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-dark-gray mt-1">
          {/* Bedrooms */}
          <div className="flex items-center gap-1">
            <BedIcon />
            <span>{bedrooms} {t('bedrooms')}</span>
          </div>

          {/* Bathrooms */}
          <div className="flex items-center gap-1">
            <BathIcon />
            <span>{bathrooms} {t('bathrooms')}</span>
          </div>

          {/* Built area */}
          <div className="text-gray-500">
            {area_sqm} m²
          </div>
        </div>
      </div>
    </Link>
  )
}
