'use client'

import { useEffect, useRef } from 'react'
import type { PanoramaHotspot } from '@/lib/properties'

// Extend the Window interface to include the Pannellum viewer API
declare global {
  interface Window {
    pannellum: {
      viewer: (
        container: string | HTMLElement,
        config: Record<string, unknown>
      ) => { destroy: () => void }
    }
  }
}

interface PanoramaViewerProps {
  panoramaUrl: string
  hotspots?: PanoramaHotspot[]
}

export default function PanoramaViewer({ panoramaUrl, hotspots }: PanoramaViewerProps) {
  // Ref to hold the Pannellum viewer instance for cleanup
  const viewerRef = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    let cssLink: HTMLLinkElement | null = null
    let script: HTMLScriptElement | null = null

    // Load Pannellum CSS
    cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'
    document.head.appendChild(cssLink)

    // Load Pannellum JS, then initialize the viewer
    script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'
    script.async = true

    script.onload = () => {
      if (!window.pannellum) return

      // Map our hotspot format to Pannellum's expected format
      const mappedHotspots = hotspots?.map((hs) => ({
        pitch: hs.pitch,
        yaw: hs.yaw,
        type: 'scene',
        sceneId: hs.targetPanoramaUrl,
        text: hs.label,
      }))

      viewerRef.current = window.pannellum.viewer('panorama-container', {
        type: 'equirectangular',
        panorama: panoramaUrl,
        autoLoad: true,
        hotSpots: mappedHotspots,
      })
    }

    document.body.appendChild(script)

    // Cleanup: destroy viewer and remove injected elements on unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
      if (cssLink && document.head.contains(cssLink)) {
        document.head.removeChild(cssLink)
      }
      if (script && document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [panoramaUrl, hotspots])

  return (
    <div className="w-full">
      {/* Loading placeholder shown until Pannellum initializes */}
      <div
        id="panorama-container"
        style={{ width: '100%', height: '400px' }}
        className="bg-gray-800 flex items-center justify-center text-white text-sm"
      >
        <span className="animate-pulse">Loading 360° tour…</span>
      </div>
    </div>
  )
}
