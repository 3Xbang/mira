'use client'

import { useState, useRef } from 'react'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
}

export default function ImageUploader({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/admin/api/upload', { method: 'POST', body: formData })
        if (!res.ok) { alert(`上传失败: ${file.name}`); continue }
        const data = await res.json()
        uploaded.push(data.url)
      }
      if (uploaded.length) onChange([...images, ...uploaded])
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function addUrl() {
    const url = urlInput.trim()
    if (!url) return
    if (!url.startsWith('http')) { alert('请输入有效的图片 URL'); return }
    onChange([...images, url])
    setUrlInput('')
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx))
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    ;[next[from], next[to]] = [next[to], next[from]]
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-sky-300 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sky-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            上传中...
          </div>
        ) : (
          <div>
            <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-gray-500">点击上传图片</p>
            <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP，可多选</p>
          </div>
        )}
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="或粘贴图片 URL..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
        />
        <button
          type="button"
          onClick={addUrl}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          添加
        </button>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={url + idx} className="relative group rounded-lg overflow-hidden aspect-video bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />

              {/* First image badge */}
              {idx === 0 && (
                <div className="absolute top-1 left-1 bg-sky-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  封面
                </div>
              )}

              {/* Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button type="button" onClick={() => moveImage(idx, idx - 1)} disabled={idx === 0}
                  className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white disabled:opacity-30 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button type="button" onClick={() => removeImage(idx)}
                  className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button type="button" onClick={() => moveImage(idx, idx + 1)} disabled={idx === images.length - 1}
                  className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white disabled:opacity-30 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">第一张图片为封面，鼠标悬停可调整顺序或删除</p>
    </div>
  )
}
