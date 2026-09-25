import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'
import type { RepairOrder } from '@/lib/repair-types'
import { STATUS_LABELS, CATEGORY_LABELS, URGENCY_LABELS } from '@/lib/repair-types'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  pending:     'bg-gray-100 text-gray-600',
  confirmed:   'bg-blue-100 text-blue-700',
  paid:        'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
}

const URGENCY_COLOR: Record<string, string> = {
  low: 'text-green-600', medium: 'text-amber-600',
  high: 'text-orange-600', emergency: 'text-red-600',
}

async function getOrders(): Promise<RepairOrder[]> {
  const credentials = process.env.MIRA_ACCESS_KEY_ID && process.env.MIRA_SECRET_ACCESS_KEY
    ? { accessKeyId: process.env.MIRA_ACCESS_KEY_ID, secretAccessKey: process.env.MIRA_SECRET_ACCESS_KEY }
    : undefined
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({
    region: process.env.MIRA_AWS_REGION ?? 'us-east-1',
    ...(credentials ? { credentials } : {}),
  }))
  const res = await doc.send(new ScanCommand({
    TableName: process.env.MIRA_TABLE_ORDERS ?? 'mira-repair-orders',
  }))
  const items = (res.Items ?? []) as RepairOrder[]
  return items.sort((a, b) => b.created_at?.localeCompare(a.created_at ?? '') ?? 0)
}

export default async function OrdersPage() {
  if (!isAuthenticated()) redirect('/admin/login')

  let orders: RepairOrder[] = []
  let error = false
  try { orders = await getOrders() } catch { error = true }

  const pending = orders.filter(o => o.status === 'pending').length
  const paid = orders.filter(o => o.status === 'paid' || o.status === 'in_progress').length
  const completed = orders.filter(o => o.status === 'completed').length

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">🔧 维修订单管理</h1>
            <p className="text-gray-500 text-sm mt-1">Repair & Construction Orders</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ 无法连接数据库，请检查 mira-repair-orders 表是否已创建。
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: '全部订单', value: orders.length, icon: '📋', color: 'bg-white' },
              { label: '待处理', value: pending, icon: '⏳', color: 'bg-amber-50' },
              { label: '进行中', value: paid, icon: '🔧', color: 'bg-blue-50' },
              { label: '已完成', value: completed, icon: '✅', color: 'bg-green-50' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-4 border border-gray-100 shadow-sm`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Orders table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {orders.length === 0 && !error ? (
              <div className="py-20 text-center text-gray-400">
                <div className="text-5xl mb-4">📋</div>
                <p>暂无订单</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">订单号</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">客户</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">类型</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">AI诊断</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">工具/人员</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">紧急</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">费用</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">预约日期</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-mono text-xs text-sky-600 font-semibold">{order.id}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('zh-CN')}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-900">{order.customer_name}</p>
                          <p className="text-xs text-gray-500">{order.customer_phone}</p>
                          {order.customer_whatsapp && (
                            <a href={`https://wa.me/${order.customer_whatsapp.replace(/\D/g,'')}`}
                              target="_blank" rel="noreferrer"
                              className="text-xs text-green-600 hover:underline">WA</a>
                          )}
                          {order.customer_line && (
                            <span className="text-xs text-lime-600 ml-2">Line: {order.customer_line}</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {CATEGORY_LABELS[order.category]?.zh ?? order.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 max-w-[200px]">
                          {order.ai_analysis ? (
                            <p className="text-xs text-gray-700 line-clamp-2">
                              {order.ai_analysis.internal_diagnosis}
                            </p>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {order.ai_analysis ? (
                            <div className="text-xs space-y-1">
                              <p className="text-amber-700 font-medium">
                                🔧 {order.ai_analysis.tools_required?.slice(0, 2).join(', ')}
                              </p>
                              <p className="text-blue-700">
                                👷 {order.ai_analysis.worker_types?.join(', ')}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {order.ai_analysis?.urgency && (
                            <span className={`text-xs font-bold ${URGENCY_COLOR[order.ai_analysis.urgency] ?? ''}`}>
                              {URGENCY_LABELS[order.ai_analysis.urgency]?.zh}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-900">
                            ฿{order.total_fee?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            定金: ฿{order.deposit_fee?.toLocaleString()}
                            {order.deposit_paid && ' ✅'}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-700">{order.preferred_date}</p>
                          <p className="text-xs text-gray-400">{order.preferred_time}</p>
                          <p className="text-xs text-gray-400 mt-0.5 max-w-[120px] truncate">{order.address}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] ?? ''}`}>
                            {STATUS_LABELS[order.status]?.zh ?? order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link href={`/admin/orders/${order.id}`}
                            className="text-sky-500 hover:text-sky-700 text-sm font-medium">
                            详情
                          </Link>
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
