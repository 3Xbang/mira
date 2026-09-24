import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getProjectById } from '@/lib/db'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ProjectForm from './ProjectForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated()) redirect('/admin/login')
  const { id } = await params
  const isNew = id === 'new'
  const project = isNew ? null : (await getProjectById(id).catch(() => null)) ?? null
  if (!isNew && !project) redirect('/admin/projects')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin/projects" className="text-gray-400 hover:text-gray-600 text-sm">← 项目列表</Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl font-bold text-gray-900">{isNew ? '新增项目' : '编辑项目'}</h1>
          </div>
          {/* Sub-nav for existing projects */}
          {!isNew && (
            <div className="flex gap-2 mb-6">
              {[
                { href: `/admin/projects/${id}`, label: '基本信息' },
                { href: `/admin/projects/${id}/floor-plans`, label: '户型管理' },
                { href: `/admin/projects/${id}/progress`, label: '施工进度' },
                { href: `/admin/projects/${id}/materials`, label: '装修材料' },
              ].map(tab => (
                <Link key={tab.href} href={tab.href}
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-sky-400 hover:text-sky-600 transition-colors">
                  {tab.label}
                </Link>
              ))}
            </div>
          )}
          <ProjectForm project={project} isNew={isNew} />
        </div>
      </main>
    </div>
  )
}
