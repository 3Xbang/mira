'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`确定要删除「${title}」吗？此操作不可撤销。`)) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/api/properties/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('删除失败，请重试')
      }
    } catch {
      alert('删除失败，请检查网络')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-40 text-sm"
    >
      {loading ? '删除中...' : '删除'}
    </button>
  )
}
