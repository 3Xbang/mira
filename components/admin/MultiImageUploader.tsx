'use client'
import { useState, useRef } from 'react'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  label?: string
  max?: number
}

export default function MultiImageUploader({ images, onChange, label = '上传图片', max }: Props) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const uploaded: string[] = []
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/admin/api/upload', { method: 'POST', body: fd })
      if (res.ok) { const d = await res.json(); uploaded.push(d.url) }
      else alert(`上传失败: ${file.name}`)
    }
    if (uploaded.length) {
      const next = max === 1 ? uploaded.slice(0, 1) : [...images, ...uploaded].slice(0, max ?? 999)
      onChange(next)
    }
    setUploading(false)
    if (ref.current) ref.current.value = ''
  }

  function addUrl() {
    const url = urlInput.trim()
    if (!url || !url.startsWith('http')) return
    const next = max === 1 ? [url] : [...images, url].slice(0, max ?? 999)
    onChange(next); setUrlInput('')
  }

  function remove(i: number) { onChange(images.filter((_, idx) => idx !== i)) }
  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return
    const n = [...images]; [n[from], n[to]] = [n[to], n[from]]; onChange(n)
  }

  const canAdd = !max || images.length < max

  return (
    <div className="space-y-3">
      {canAdd && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-sky-300 transition-colors cursor-pointer"
          onClick={() => ref.current?.click()}>
          <input ref={ref} type="file" accept="image/*" multiple={max !== 1} className="hidden" onChange={handleFiles} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sky-500 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              上传中...
            </div>
          ) : (
            <div>
              <svg className="w-7 h-7 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
              </svg>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG · PNG · WebP{max !== 1 ? ' · 可多选' : ''}</p>
            </div>
          )}
        </div>
      )}

      {/* URL input */}
      {canAdd && (
        <div className="flex gap-2">
          <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            placeholder="或粘贴图片 URL..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          <button type="button" onClick={addUrl}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors">添加</button>
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className={`grid gap-2 ${max === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {images.map((url, i) => (
            <div key={url + i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && max !== 1 && (
                <div className="absolute top-1 left-1 bg-sky-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">封面</div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {max !== 1 && (
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0}
                    className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white disabled:opacity-30">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                )}
                <button type="button" onClick={() => remove(i)}
                  className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
                {max !== 1 && (
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1}
                    className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white disabled:opacity-30">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
