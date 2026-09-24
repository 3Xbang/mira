import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getProjectById, getMaterialById } from '@/lib/db'
import AdminSidebar from '@/components/admin/AdminSidebar'
import MaterialForm from './MaterialForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MaterialEditPage({ params }: { params: Promise<{ id: string; matId: string }> }) {
  if (!isAuthenticated()) redirect('/admin/login')
  const { id, matId } = await params
  const project = await getProjectById(id).catch(() => null)
  if (!project) redirect('/admin/projects')
  const isNew = matId === 'new'
  const material = isNew ? null : (await getMaterialById(matId).catch(() => null)) ?? null

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Link href={`/admin/projects/${id}/materials`} className="text-gray-400 hover:text-gray-600">← 装修材料</Link>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-700">{isNew ? '新增材料' : '编辑材料'}</span>
          </div>
          <MaterialForm material={material} projectId={id} isNew={isNew} />
        </div>
      </main>
    </div>
  )
}
