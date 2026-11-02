import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getProjects, getAllCustomers, getOrderStats } from '@/lib/db'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  if (!isAuthenticated()) redirect('/admin/login')

  const [projects, customers, orderStats] = await Promise.all([
    getProjects().catch(() => []),
    getAllCustomers().catch(() => []),
    getOrderStats().catch(() => null),
  ])

  const total      = projects.length
  const onSale     = projects.filter((p) => p.status === 'on_sale').length
  const comingSoon = projects.filter((p) => p.status === 'coming_soon').length

  const totalCustomers   = customers.length
  const activeCustomers  = customers.filter(c => c.order_count > 0).length
  const totalRevenue     = customers.reduce((s, c) => s + (c.total_spent ?? 0), 0)

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">

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

          {/* ── Section 1: Projects ───────────────────────────────────── */}
          <div className="mb-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🏗️ 项目概览</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: '全部项目', value: total,      icon: '🏗️', color: 'text-gray-900' },
              { label: '在售',     value: onSale,     icon: '✅', color: 'text-emerald-600' },
              { label: '即将开售', value: comingSoon, icon: '🔜', color: 'text-amber-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Section 2: Customers ─────────────────────────────────── */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">👥 客户统计</h2>
              <Link href="/admin/customers" className="text-xs text-sky-500 hover:underline mb-3">查看全部 →</Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: '注册客户',   value: totalCustomers,                              icon: '👥', color: 'text-gray-900' },
              { label: '有订单客户', value: activeCustomers,                             icon: '🛒', color: 'text-sky-600' },
              { label: '客户总消费', value: `฿${totalRevenue.toLocaleString()}`,          icon: '💰', color: 'text-emerald-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Section 3: Repair Orders ─────────────────────────────── */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🔧 维修订单统计</h2>
              <Link href="/admin/orders" className="text-xs text-sky-500 hover:underline mb-3">查看全部 →</Link>
            </div>
          </div>
          {orderStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: '全部工单',   value: orderStats.total,       icon: '📋', color: 'text-gray-900' },
                { label: '待处理',     value: orderStats.pending,     icon: '⏳', color: 'text-amber-600' },
                { label: '施工中',     value: orderStats.in_progress, icon: '🚧', color: 'text-blue-600'  },
                { label: '已完成',     value: orderStats.completed,   icon: '✅', color: 'text-emerald-600' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ 无法加载订单统计，请检查 mira-repair-orders 表是否已创建。
            </div>
          )}

          {/* ── Revenue Summary ──────────────────────────────────────── */}
          {orderStats && (orderStats.revenue_total > 0 || orderStats.revenue_month > 0) && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-5 border border-sky-100">
                <div className="text-sm text-sky-600 font-medium mb-1">本月营收</div>
                <div className="text-3xl font-bold text-sky-700">฿{orderStats.revenue_month.toLocaleString()}</div>
                <div className="text-xs text-sky-500 mt-1">{orderStats.this_month} 笔订单</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
                <div className="text-sm text-emerald-600 font-medium mb-1">累计营收</div>
                <div className="text-3xl font-bold text-emerald-700">฿{orderStats.revenue_total.toLocaleString()}</div>
                <div className="text-xs text-emerald-500 mt-1">共 {orderStats.completed} 笔完成</div>
              </div>
            </div>
          )}

          {/* ── Recent Projects ──────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">项目列表</h2>
              <Link href="/admin/projects" className="text-sky-500 text-sm hover:underline">
                查看全部 →
              </Link>
            </div>
            {projects.length === 0 ? (
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
                      p.status === 'on_sale'     ? 'bg-emerald-100 text-emerald-700' :
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
