'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function handle() {
    if (!confirm(`确定删除项目「${name}」？此操作不可撤销。`)) return
    setLoading(true)
    const res = await fetch(`/admin/api/projects/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else alert('删除失败')
    setLoading(false)
  }
  return (
    <button onClick={handle} disabled={loading}
      className="text-red-400 hover:text-red-600 text-sm disabled:opacity-40">
      {loading ? '...' : '删除'}
    </button>
  )
}
