'use client'
import { useState } from 'react'

export default function GalleryGrid({ images, title }: { images: string[]; title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (!images.length) return null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.map((src, i) => (
          <button key={i} onClick={() => setLightbox(i)}
            className={`relative overflow-hidden rounded-xl bg-gray-100 hover:opacity-90 transition-opacity ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
            style={{ aspectRatio: i === 0 ? '16/9' : '4/3' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
            {images.length > 6 && i === 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-xl">+{images.length - 6}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none"
            onClick={() => setLightbox(null)}>×</button>
          <button className="absolute left-4 text-white/70 hover:text-white text-4xl leading-none"
            onClick={e => { e.stopPropagation(); setLightbox(l => l !== null ? Math.max(0, l - 1) : null) }}>‹</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[lightbox]} alt={`${title} ${lightbox + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()} />
          <button className="absolute right-4 text-white/70 hover:text-white text-4xl leading-none"
            onClick={e => { e.stopPropagation(); setLightbox(l => l !== null ? Math.min(images.length - 1, l + 1) : null) }}>›</button>
          <div className="absolute bottom-4 text-white/50 text-sm">
            {lightbox + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
