'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

// Fallback: original Cloudinary renders (used only when no project gallery images)
const FALLBACK_IMAGES = [
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596228/mira_homes_A_erq6cj.png',
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596227/mira_homes_3_zrnq2v.png',
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596227/mira_homes2_t8csmh.png',
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596228/mira_homes._1_qqk5ip.png',
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596225/mira_homeC_qqqme3.png',
  'https://res.cloudinary.com/ddb3tk1ep/image/upload/v1774596198/mira_homes_4_vogftx.png',
]

// Confirmed Koh Samui island photos — Wikimedia Commons (CC)
const ISLAND_IMAGES = [
  // Lipa Noi Beach, Ko Samui — sunset + coconut palms
  'https://upload.wikimedia.org/wikipedia/commons/8/80/Koh_Samui_Lipa_Noi2.jpg',
  // Lamai Beach, Koh Samui
  'https://upload.wikimedia.org/wikipedia/commons/f/fb/Lamai_Beach%2C_Koh_Samui_%2848107374183%29.jpg',
  // Choeng Mon Beach, Koh Samui
  'https://upload.wikimedia.org/wikipedia/commons/b/bb/Choeng_Mon_Beach%2C_Koh_Samui_%2828034183446%29.jpg',
  // Chaweng Beach, Koh Samui
  'https://upload.wikimedia.org/wikipedia/commons/b/b2/Chaweng-beach_koh_Samui.jpg',
  // Chaweng Noi Beach, Koh Samui
  'https://upload.wikimedia.org/wikipedia/commons/5/5e/Chaweng_Noi_Beach%2C_Koh_Samui_%2848107363622%29.jpg',
]

export default function HeroSection({ heroImages }: { heroImages?: string[] }) {
  const t = useTranslations('hero')
  const images = (heroImages && heroImages.length > 0) ? heroImages : FALLBACK_IMAGES

  // Main slideshow
  const [current, setCurrent] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  // Island photo panel — independent timer
  const [islandCurrent, setIslandCurrent] = useState(0)
  const [islandKey, setIslandKey] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
      setAnimKey(k => k + 1)
    }, 7000)
    return () => clearInterval(timer)
  }, [images.length])

  useEffect(() => {
    const timer = setInterval(() => {
      setIslandCurrent(prev => (prev + 1) % ISLAND_IMAGES.length)
      setIslandKey(k => k + 1)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">

      {/* ── Main background images (Ken Burns) ───────────────────── */}
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            key={i === current ? animKey : i}
            className={i === current ? 'kenburns absolute inset-0' : 'absolute inset-0'}
          >
            <Image
              src={src}
              alt="Mira Villa Koh Samui"
              fill
              priority={i === 0}
              className="object-cover object-center"
              unoptimized
            />
          </div>
        </div>
      ))}

      {/* ── Gradient overlay ─────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="relative z-10 text-center px-4 w-full max-w-7xl mx-auto flex flex-col items-center">

        <h1
          className="hero-title text-white leading-none tracking-[0.25em] mb-5 select-none"
          style={{
            fontSize: 'clamp(4rem, 13vw, 11rem)',
            fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif",
            textShadow: '0 4px 40px rgba(0,0,0,0.25)',
          }}
        >
          MIRA
        </h1>

        <p
          className="text-white/90 font-light tracking-[0.35em] uppercase text-sm md:text-base mb-5 hero-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          {t('tagline')}
        </p>

        <div className="flex items-center gap-4 mb-10 hero-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="h-px w-10 md:w-20 bg-white/50" />
          <span className="text-white/65 tracking-[0.2em] uppercase text-xs font-light">
            Koh Samui &nbsp;·&nbsp; Thailand &nbsp;·&nbsp; Luxury Villas
          </span>
          <div className="h-px w-10 md:w-20 bg-white/50" />
        </div>

        <Link
          href="#projects"
          className="hero-fade-in inline-flex items-center gap-3 text-white border border-white/55 px-10 md:px-14 py-3.5 text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-gray-900 transition-all duration-300 font-light"
          style={{ animationDelay: '0.7s' }}
        >
          {t('cta')} &nbsp;→
        </Link>
      </div>

      {/* ── Island photo card (bottom-left) ──────────────────────── */}
      <div className="absolute bottom-24 left-6 z-20 hidden md:block hero-fade-in" style={{ animationDelay: '1s' }}>
        {/* Frame */}
        <div className="relative w-56 h-40 overflow-hidden border border-white/35 shadow-2xl">
          {ISLAND_IMAGES.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-[1600ms] ease-in-out ${
                i === islandCurrent ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                key={i === islandCurrent ? islandKey : i}
                className={i === islandCurrent ? 'island-kenburns absolute inset-0' : 'absolute inset-0'}
              >
                <Image
                  src={src}
                  alt="Koh Samui island"
                  fill
                  className="object-cover object-center"
                  unoptimized
                />
              </div>
            </div>
          ))}
          {/* Bottom label */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 z-10">
            <p className="text-white text-[9px] tracking-[0.3em] uppercase font-light">
              Koh Samui · Thailand
            </p>
          </div>
        </div>
        {/* Dot indicators */}
        <div className="flex gap-1.5 mt-2 justify-center">
          {ISLAND_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIslandCurrent(i); setIslandKey(k => k + 1) }}
              className={`rounded-full transition-all duration-300 ${
                i === islandCurrent ? 'bg-white w-3 h-1.5' : 'bg-white/40 w-1.5 h-1.5'
              }`}
              aria-label={`Island photo ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Slide indicators (main) ──────────────────────────────── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setAnimKey(k => k + 1) }}
            className={`h-px transition-all duration-500 ${
              i === current ? 'bg-white w-10' : 'bg-white/40 w-4'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Scroll hint ──────────────────────────────────────────── */}
      <div className="absolute bottom-10 right-8 z-10 hidden md:flex flex-col items-center gap-2">
        <div className="scroll-line" />
        <span className="text-white/40 text-[10px] tracking-[0.25em] uppercase font-light">Scroll</span>
      </div>

    </section>
  )
}
