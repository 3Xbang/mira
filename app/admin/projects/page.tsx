import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getProjects } from '@/lib/db'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'
import DeleteProjectButton from './DeleteProjectButton'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  on_sale: '在售',
  coming_soon: '即将开售',
  sold_out: '已售罄',
}
const STATUS_COLOR: Record<string, string> = {
  on_sale: 'bg-emerald-100 text-emerald-700',
  coming_soon: 'bg-amber-100 text-amber-700',
  sold_out: 'bg-gray-100 text-gray-500',
}

export default async function ProjectsPage() {
  if (!isAuthenticated()) redirect('/admin/login')
  let projects: Awaited<ReturnType<typeof getProjects>> = []
  try { projects = await getProjects() } catch {}

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
            <Link href="/admin/projects/new"
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新增项目
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 py-20 text-center">
              <div className="text-5xl mb-4">🏗️</div>
              <p className="text-gray-500 mb-4">暂无项目</p>
              <Link href="/admin/projects/new" className="text-sky-500 hover:underline text-sm">立即创建第一个项目</Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((p: any) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 flex gap-5 items-start">
                  <div className="w-28 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {p.cover_image
                      ? <img src={p.cover_image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">🏗️</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </div>
                    <h2 className="font-bold text-gray-900 text-lg">{p.name?.zh ?? p.id}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{p.location_address}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>总套数：{p.total_units ?? '—'}</span>
                      <span>交付：{p.delivery_date ?? '—'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/admin/projects/${p.id}`}
                      className="text-sky-500 hover:text-sky-700 text-sm font-medium">编辑</Link>
                    <Link href={`/admin/projects/${p.id}/floor-plans`}
                      className="text-gray-500 hover:text-gray-700 text-sm">户型</Link>
                    <Link href={`/admin/projects/${p.id}/progress`}
                      className="text-gray-500 hover:text-gray-700 text-sm">进度</Link>
                    <Link href={`/admin/projects/${p.id}/materials`}
                      className="text-gray-500 hover:text-gray-700 text-sm">材料</Link>
                    <DeleteProjectButton id={p.id} name={p.name?.zh ?? p.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
