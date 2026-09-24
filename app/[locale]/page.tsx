import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ContactButton from '@/components/common/ContactButton'
import { getProjects } from '@/lib/db'
import { getSiteSettings } from '@/lib/properties'
import ProjectCard from '@/components/home/ProjectCard'
import HeroSection from '@/components/home/HeroSection'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const title = 'Mira Real Estate — Luxury Villas in Koh Samui'
  const description =
    'Discover luxury villas and residences in Koh Samui, Thailand. Premium developer projects with stunning designs.'
  return {
    title,
    description,
    openGraph: {
      title, description,
      images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
      url: `https://miraa.homes/${locale}`,
      type: 'website',
    },
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params

  const [projects, settings] = await Promise.all([
    getProjects().catch(() => []),
    getSiteSettings().catch(() => ({ whatsapp: '66812345678', lineId: 'mira_samui' })),
  ])

  // Collect hero images from all projects
  const heroImages = projects.flatMap(p => p.gallery?.slice(0, 2) ?? []).filter(Boolean)

  return (
    <main>
      <HeroSection heroImages={heroImages.length > 0 ? heroImages : undefined} />

      {/* Projects section */}
      <section id="projects" className="bg-light-gray py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-gray">Our Projects</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Premium residential developments in Koh Samui, Thailand
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🏗️</div>
              <p>Projects coming soon.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ContactButton whatsappNumber={settings.whatsapp} lineId={settings.lineId} />
    </main>
  )
}
