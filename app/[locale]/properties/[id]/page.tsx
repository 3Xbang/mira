import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getAllPropertiesFromDB, getPropertyByIdFromDB } from '@/lib/dynamodb'
import { locales } from '@/i18n'
import ImageCarousel from '@/components/property/ImageCarousel'
import PanoramaViewer from '@/components/property/PanoramaViewer'
import ContactButton from '@/components/common/ContactButton'

interface PropertyPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { locale, id } = await params
  const property = await getPropertyByIdFromDB(id)

  const defaultTitle = 'Mira Real Estate — Luxury Villas in Koh Samui'
  const defaultDescription =
    'Discover luxury villas and townhouses for sale in Koh Samui, Thailand.'
  const defaultImage = '/og-default.jpg'

  if (!property) {
    return {
      title: defaultTitle,
      description: defaultDescription,
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        images: [{ url: defaultImage, width: 1200, height: 630 }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: defaultTitle,
        images: [defaultImage],
      },
    }
  }

  const title = `${property.title} — Mira Real Estate`
  const description = property.description.slice(0, 160)
  const image = property.images?.[0] || defaultImage

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
      url: `https://www.mira-samui.com/${locale}/properties/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [image],
    },
  }
}

// Generate static routes for all locale × property id combinations
export async function generateStaticParams() {
  const properties = await getAllPropertiesFromDB()
  return locales.flatMap((locale) =>
    properties.map((p) => ({ locale, id: p.id }))
  )
}

// Bedroom icon
function BedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3" />
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5" />
      <path d="M2 11h20" />
      <path d="M6 11V9h12v2" />
    </svg>
  )
}

// Bathroom icon
function BathIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <line x1="10" y1="5" x2="8" y2="7" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  )
}

// Area / ruler icon
function AreaIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" />
    </svg>
  )
}

// Land / map icon
function LandIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id, locale } = await params
  const property = await getPropertyByIdFromDB(id)

  // Render 404 if property doesn't exist
  if (!property) {
    notFound()
  }

  const t = await getTranslations('property')

  // Format price with locale-aware number formatting
  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: property.currency,
    maximumFractionDigits: 0,
  }).format(property.price)

  return (
    <div className="min-h-screen bg-white">
      {/* Image carousel */}
      <ImageCarousel images={property.images} title={property.title} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Title and price */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {property.title}
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-ocean-blue">
            {formattedPrice}
          </p>
          <p className="text-gray-500 mt-1">{property.location}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col items-center gap-1 p-4 bg-gray-50 rounded-xl">
            <BedIcon />
            <span className="text-xl font-bold text-gray-900">{property.bedrooms}</span>
            <span className="text-xs text-gray-500 text-center">{t('bedrooms')}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 bg-gray-50 rounded-xl">
            <BathIcon />
            <span className="text-xl font-bold text-gray-900">{property.bathrooms}</span>
            <span className="text-xs text-gray-500 text-center">{t('bathrooms')}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 bg-gray-50 rounded-xl">
            <AreaIcon />
            <span className="text-xl font-bold text-gray-900">{property.area_sqm} m²</span>
            <span className="text-xs text-gray-500 text-center">{t('builtArea')}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 bg-gray-50 rounded-xl">
            <LandIcon />
            <span className="text-xl font-bold text-gray-900">{property.land_sqm} m²</span>
            <span className="text-xs text-gray-500 text-center">{t('landArea')}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed mb-10">{property.description}</p>

        {/* 360° panorama viewer — only rendered when panorama_url is present */}
        {property.panorama_url && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('viewTour')}</h2>
            <PanoramaViewer
              panoramaUrl={property.panorama_url}
              hotspots={property.panorama_hotspots}
            />
          </div>
        )}
      </div>

      {/* Floating contact button */}
      <ContactButton whatsappNumber="66812345678" lineId="mira_samui" />
    </div>
  )
}
