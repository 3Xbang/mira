import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getProjects } from '@/lib/db'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  if (!isAuthenticated()) redirect('/admin/login')

  let projects: Awaited<ReturnType<typeof getProjects>> = []
  let dbError = false
  try {
    projects = await getProjects()
  } catch {
    dbError = true
  }

  const total = projects.length
  const onSale = projects.filter((p) => p.status === 'on_sale').length
  const comingSoon = projects.filter((p) => p.status === 'coming_soon').length

  const stats = [
    { label: '全部项目', value: total, icon: '🏗️' },
    { label: '在售', value: onSale, icon: '✅' },
    { label: '即将开售', value: comingSoon, icon: '🔜' },
  ]

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
              <p className="text-gray-500 text-sm mt-1">Mira Real Estate · Koh Samui</p>
            </div>
            <Link href="/admin/projects/new"
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新增项目
            </Link>
          </div>

          {/* DB error */}
          {dbError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ 无法连接 DynamoDB，请检查 AWS 凭证和网络连接。
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">项目列表</h2>
              <Link href="/admin/projects" className="text-sky-500 text-sm hover:underline">
                查看全部 →
              </Link>
            </div>
            {projects.length === 0 && !dbError ? (
              <div className="px-6 py-12 text-center text-gray-400">
                暂无项目，
                <Link href="/admin/projects/new" className="text-sky-500 hover:underline">立即添加</Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {projects.slice(0, 6).map((p) => (
                  <li key={p.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {p.cover_image
                        ? <img src={p.cover_image} alt={p.name?.zh ?? p.id} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🏗️</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.name?.zh ?? p.id}</p>
                      <p className="text-sm text-gray-400 truncate">{p.location_address}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.status === 'on_sale' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'coming_soon' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {p.status === 'on_sale' ? '在售' : p.status === 'coming_soon' ? '即将开售' : '已售罄'}
                    </span>
                    <Link href={`/admin/projects/${p.id}`}
                      className="text-sm text-sky-500 hover:underline shrink-0">编辑</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
