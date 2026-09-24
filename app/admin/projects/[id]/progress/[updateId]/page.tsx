import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getProjectById, getProgressById } from '@/lib/db'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ProgressForm from './ProgressForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProgressEditPage({ params }: { params: Promise<{ id: string; updateId: string }> }) {
  if (!isAuthenticated()) redirect('/admin/login')
  const { id, updateId } = await params
  const project = await getProjectById(id).catch(() => null)
  if (!project) redirect('/admin/projects')
  const isNew = updateId === 'new'
  const update = isNew ? null : (await getProgressById(updateId).catch(() => null)) ?? null

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Link href={`/admin/projects/${id}/progress`} className="text-gray-400 hover:text-gray-600">← 施工进度</Link>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-700">{isNew ? '新增进度更新' : '编辑进度'}</span>
          </div>
          <ProgressForm update={update} projectId={id} isNew={isNew} />
        </div>
      </main>
    </div>
  )
}
