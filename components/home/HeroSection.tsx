'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

// Koh Samui beach & palm tree hero images
const BEACH_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1559494007-9f5847c49d94?auto=format&fit=crop&w=1920&q=85',
]

export default function HeroSection({ heroImages }: { heroImages?: string[] }) {
  const t = useTranslations('hero')
  const images = BEACH_IMAGES // always use beach images for hero
  const [current, setCurrent] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
      setAnimKey(k => k + 1)
    }, 7000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">

      {/* ── Background images with Ken Burns animation ──────────── */}
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
              alt="Koh Samui beach"
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

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="relative z-10 text-center px-4 w-full max-w-7xl mx-auto flex flex-col items-center">

        {/* Large brand name */}
        <h1 className="hero-title text-white leading-none tracking-[0.25em] mb-5 select-none"
          style={{
            fontSize: 'clamp(4rem, 13vw, 11rem)',
            fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif",
            textShadow: '0 4px 40px rgba(0,0,0,0.25)',
          }}>
          MIRA
        </h1>

        {/* Tagline */}
        <p className="text-white/90 font-light tracking-[0.35em] uppercase text-sm md:text-base mb-5 hero-fade-in"
          style={{ animationDelay: '0.3s' }}>
          {t('tagline')}
        </p>

        {/* Divider line with badge */}
        <div className="flex items-center gap-4 mb-10 hero-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="h-px w-10 md:w-20 bg-white/50" />
          <span className="text-white/65 tracking-[0.2em] uppercase text-xs font-light">
            Koh Samui &nbsp;·&nbsp; Thailand &nbsp;·&nbsp; Luxury Villas
          </span>
          <div className="h-px w-10 md:w-20 bg-white/50" />
        </div>

        {/* CTA */}
        <Link
          href="#projects"
          className="hero-fade-in inline-flex items-center gap-3 text-white border border-white/55 px-10 md:px-14 py-3.5 text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-gray-900 transition-all duration-400 font-light"
          style={{ animationDelay: '0.7s' }}
        >
          {t('cta')} &nbsp;→
        </Link>
      </div>

      {/* ── Slide indicators (lines) ─────────────────────────────── */}
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
