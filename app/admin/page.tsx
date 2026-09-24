import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getAllPropertiesFromDB } from '@/lib/dynamodb'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  if (!isAuthenticated()) redirect('/admin/login')

  let properties: Awaited<ReturnType<typeof getAllPropertiesFromDB>> = []
  let dbError = false
  try {
    properties = await getAllPropertiesFromDB()
  } catch {
    dbError = true
  }

  const total = properties.length
  const featured = properties.filter((p) => p.featured).length
  const byType = {
    new: properties.filter((p) => p.type === 'new').length,
    resale: properties.filter((p) => p.type === 'resale').length,
    rental: properties.filter((p) => p.type === 'rental').length,
  }

  const stats = [
    { label: '全部房产', value: total, color: 'bg-sky-500', icon: '🏠' },
    { label: '精选展示', value: featured, color: 'bg-amber-500', icon: '⭐' },
    { label: '新房', value: byType.new, color: 'bg-emerald-500', icon: '🔑' },
    { label: '二手房', value: byType.resale, color: 'bg-violet-500', icon: '🔄' },
    { label: '租赁', value: byType.rental, color: 'bg-rose-500', icon: '📋' },
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
            <Link
              href="/admin/properties/new"
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新增房产
            </Link>
          </div>

          {/* DB error */}
          {dbError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ 无法连接 DynamoDB，请检查 AWS 凭证和网络连接。
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent properties */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">最新房产</h2>
              <Link href="/admin/properties" className="text-sky-500 text-sm hover:underline">
                查看全部 →
              </Link>
            </div>
            {properties.length === 0 && !dbError ? (
              <div className="px-6 py-12 text-center text-gray-400">
                暂无房产，
                <Link href="/admin/properties/new" className="text-sky-500 hover:underline">立即添加</Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {properties.slice(0, 6).map((p) => (
                  <li key={p.id} className="px-6 py-4 flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">🏠</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-sm text-gray-400 truncate">{p.location}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.type === 'new' ? 'bg-emerald-100 text-emerald-700' :
                      p.type === 'resale' ? 'bg-violet-100 text-violet-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {p.type === 'new' ? '新房' : p.type === 'resale' ? '二手' : '租赁'}
                    </span>
                    <Link
                      href={`/admin/properties/${p.id}`}
                      className="text-sm text-sky-500 hover:underline shrink-0"
                    >
                      编辑
                    </Link>
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
