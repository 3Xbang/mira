import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getProjectById, getFloorPlanById } from '@/lib/db'
import AdminSidebar from '@/components/admin/AdminSidebar'
import FloorPlanForm from './FloorPlanForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function FloorPlanEditPage({ params }: { params: Promise<{ id: string; planId: string }> }) {
  if (!isAuthenticated()) redirect('/admin/login')
  const { id, planId } = await params
  const project = await getProjectById(id).catch(() => null)
  if (!project) redirect('/admin/projects')
  const isNew = planId === 'new'
  const plan = isNew ? null : (await getFloorPlanById(planId).catch(() => null)) ?? null

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Link href={`/admin/projects/${id}/floor-plans`} className="text-gray-400 hover:text-gray-600">← 户型列表</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">{isNew ? '新增户型' : '编辑户型'}</span>
          </div>
          <FloorPlanForm plan={plan} projectId={id} isNew={isNew} />
        </div>
      </main>
    </div>
  )
}
