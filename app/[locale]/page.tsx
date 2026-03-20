import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import FeaturedProperties from '@/components/home/FeaturedProperties'
import ContactButton from '@/components/common/ContactButton'
import { getFeaturedProperties } from '@/lib/properties'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const title = 'Mira Real Estate — Luxury Villas in Koh Samui'
  const description =
    'Discover luxury villas and townhouses for sale in Koh Samui, Thailand. Beachfront properties, sea view villas, and tropical residences.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
      url: `https://www.mira-samui.com/${locale}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: ['/og-default.jpg'],
    },
  }
}

// Homepage: hero + featured properties grid + floating contact button
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const featuredProperties = getFeaturedProperties()

  return (
    <main>
      <HeroSection />
      <FeaturedProperties locale={locale} properties={featuredProperties} />
      <ContactButton whatsappNumber="66812345678" lineId="mira_samui" />
    </main>
  )
}
