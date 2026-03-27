'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

const FALLBACK_IMAGES = [
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596228/mira_homes_A_erq6cj.png',
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596227/mira_homes_3_zrnq2v.png',
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596227/mira_homes2_t8csmh.png',
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596228/mira_homes._1_qqk5ip.png',
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596225/mira_homeC_qqqme3.png',
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596198/mira_homes_4_vogftx.png',
]

export default function HeroSection({ heroImages }: { heroImages?: string[] }) {
  const t = useTranslations('hero')
  const images = heroImages && heroImages.length > 0 ? heroImages : FALLBACK_IMAGES
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Blurred background */}
          <Image src={src} alt="" fill priority={i === 0} className="object-cover object-center scale-110 blur-md opacity-60" aria-hidden="true" />
          {/* Full image centered */}
          <Image src={src} alt="Luxury villa in Koh Samui" fill priority={i === 0} className="object-contain object-center" />
        </div>
      ))}
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 flex flex-col items-center text-center px-4 gap-4">
        <span className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-widest text-ocean-blue">MIRA</span>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white max-w-3xl leading-tight">{t('tagline')}</h1>
        <p className="text-base md:text-xl text-white/80 max-w-xl">{t('subtitle')}</p>
        <Link href="#featured" className="mt-4 inline-block bg-ocean-blue text-white font-semibold px-8 py-3 rounded-full text-base md:text-lg hover:bg-sky-500 transition-colors duration-200">
          {t('cta')}
        </Link>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50'}`} aria-label={`Go to slide ${i + 1}`} />
        ))}
      </div>
    </section>
  )
}
