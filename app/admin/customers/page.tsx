import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getAllCustomers } from '@/lib/db'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'
import type { Customer } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  if (!isAuthenticated()) redirect('/admin/login')

  let customers: Customer[] = []
  let error = false
  try { customers = await getAllCustomers() } catch { error = true }

  const total = customers.length
  const active = customers.filter(c => c.order_count > 0).length
  const totalRevenue = customers.reduce((s, c) => s + (c.total_spent ?? 0), 0)

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">👤 客户管理</h1>
            <p className="text-gray-500 text-sm mt-1">Customer Management</p>
          </div>

          {error && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ 请先在 AWS 控制台创建 <code>mira-customers</code> 和 <code>mira-otp</code> 表（Partition key: id / email，按需计费）
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: '全部客户', value: total, icon: '👥' },
              { label: '有订单客户', value: active, icon: '✅' },
              { label: '总消费额', value: `฿${totalRevenue.toLocaleString()}`, icon: '💰' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {customers.length === 0 && !error ? (
              <div className="py-20 text-center text-gray-400">
                <div className="text-5xl mb-4">👥</div>
                <p>暂无客户，客户登录后自动出现在这里</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">客户</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">联系方式</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">地址</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-500">订单数</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">总消费</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">最后下单</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{c.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </td>
                        <td className="px-4 py-4">
                          {c.phone && <p className="text-gray-700">📱 {c.phone}</p>}
                          {c.whatsapp && (
                            <a href={`https://wa.me/${c.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                              className="text-xs text-green-600 hover:underline">WA: {c.whatsapp}</a>
                          )}
                          {c.line && <p className="text-xs text-lime-600">Line: {c.line}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs text-gray-500 max-w-[160px] truncate">{c.address ?? '—'}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${c.order_count > 0 ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'}`}>
                            {c.order_count}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-semibold text-gray-900">฿{(c.total_spent ?? 0).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400">
                          {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('zh-CN') : '—'}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <a href={`mailto:${c.email}`}
                            className="text-sky-500 hover:text-sky-700 text-xs font-medium mr-3">发邮件</a>
                          {c.phone && (
                            <a href={`https://wa.me/${c.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                              className="text-green-500 hover:text-green-700 text-xs font-medium">WhatsApp</a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
