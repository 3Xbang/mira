import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getAllPropertiesFromDB } from '@/lib/dynamodb'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'
import DeleteButton from './DeleteButton'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage() {
  if (!isAuthenticated()) redirect('/admin/login')

  let properties: Awaited<ReturnType<typeof getAllPropertiesFromDB>> = []
  try {
    properties = await getAllPropertiesFromDB()
  } catch {
    // show empty state
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">房产管理</h1>
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

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {properties.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <div className="text-5xl mb-4">🏠</div>
                <p className="text-lg font-medium mb-2">暂无房产</p>
                <Link href="/admin/properties/new" className="text-sky-500 hover:underline text-sm">
                  立即添加第一个房产
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">房产</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">类型</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">价格</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">位置</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">精选</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {p.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">🏠</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 max-w-[200px] truncate">{p.title}</p>
                            <p className="text-gray-400 text-xs">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          p.type === 'new' ? 'bg-emerald-100 text-emerald-700' :
                          p.type === 'resale' ? 'bg-violet-100 text-violet-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {p.type === 'new' ? '新房' : p.type === 'resale' ? '二手' : '租赁'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-medium">
                        {p.currency} {p.price?.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-gray-500 max-w-[160px] truncate">{p.location}</td>
                      <td className="px-4 py-4">
                        {p.featured ? (
                          <span className="text-amber-500">⭐</span>
                        ) : (
                          <span className="text-gray-200">★</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/en/properties/${p.id}`}
                            target="_blank"
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                            title="前台预览"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/properties/${p.id}`}
                            className="text-sky-500 hover:text-sky-700 font-medium transition-colors"
                          >
                            编辑
                          </Link>
                          <DeleteButton id={String(p.id)} title={p.title} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
