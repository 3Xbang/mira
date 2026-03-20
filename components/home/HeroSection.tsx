import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

// Full-screen hero section with background image, overlay, and centered CTA
export default async function HeroSection() {
  const t = await getTranslations('hero')

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background image */}
      <Image
        src="/hero.jpg"
        alt="Luxury villa in Koh Samui"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Centered text content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 gap-4">
        {/* Brand name */}
        <span className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-widest text-ocean-blue">
          MIRA
        </span>

        {/* Tagline */}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white max-w-3xl leading-tight">
          {t('tagline')}
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-xl text-white/80 max-w-xl">
          {t('subtitle')}
        </p>

        {/* CTA button */}
        <Link
          href="#featured"
          className="mt-4 inline-block bg-ocean-blue text-white font-semibold px-8 py-3 rounded-full text-base md:text-lg hover:bg-sky-500 transition-colors duration-200"
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  )
}
