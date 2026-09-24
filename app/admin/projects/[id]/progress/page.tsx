import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getProjectById, getProgressByProject } from '@/lib/db'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'
import ProgressList from './ProgressList'

export const dynamic = 'force-dynamic'

export default async function ProgressPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated()) redirect('/admin/login')
  const { id } = await params
  const project = await getProjectById(id).catch(() => null)
  if (!project) redirect('/admin/projects')
  const updates = await getProgressByProject(id).catch(() => [])

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/projects" className="text-gray-400 hover:text-gray-600 text-sm">← 项目列表</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 text-sm">{project.name?.zh ?? id}</span>
          </div>
          <div className="flex gap-2 mb-6">
            {[
              { href: `/admin/projects/${id}`, label: '基本信息' },
              { href: `/admin/projects/${id}/floor-plans`, label: '户型管理' },
              { href: `/admin/projects/${id}/progress`, label: '施工进度', active: true },
              { href: `/admin/projects/${id}/materials`, label: '装修材料' },
            ].map(t => (
              <Link key={t.href} href={t.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${t.active ? 'bg-sky-500 text-white border-sky-500' : 'bg-white border-gray-200 text-gray-600 hover:border-sky-400 hover:text-sky-600'}`}>
                {t.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">施工进度</h1>
            <Link href={`/admin/projects/${id}/progress/new`}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新增进度更新
            </Link>
          </div>
          <ProgressList updates={updates} projectId={id} />
        </div>
      </main>
    </div>
  )
}
