import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'
import type { RepairOrder } from '@/lib/repair-types'
import { STATUS_LABELS, CATEGORY_LABELS, URGENCY_LABELS } from '@/lib/repair-types'
import OrderDepositButton from './OrderDepositButton'

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
  high: 'text-orange-600', emergency: 'text-red-600 font-bold',
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
  const unpaid  = orders.filter(o => !o.deposit_paid && o.status !== 'cancelled').length
  const paid    = orders.filter(o => o.deposit_paid).length
  const completed = orders.filter(o => o.status === 'completed').length

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">🔧 维修订单管理</h1>
            <p className="text-gray-500 text-sm mt-1">Repair & Construction Orders</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ 无法连接数据库
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '全部订单', value: orders.length, icon: '📋', color: 'bg-white' },
              { label: '待处理', value: pending, icon: '⏳', color: 'bg-amber-50 border-amber-200' },
              { label: '⚠️ 未收定金', value: unpaid, icon: '💳', color: unpaid > 0 ? 'bg-red-50 border-red-200' : 'bg-white' },
              { label: '已收定金', value: paid, icon: '✅', color: 'bg-emerald-50 border-emerald-200' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-4 border shadow-sm`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Orders */}
          {orders.length === 0 && !error ? (
            <div className="bg-white rounded-xl border border-gray-100 py-20 text-center text-gray-400">
              <div className="text-5xl mb-4">📋</div>
              <p>暂无订单</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  !order.deposit_paid && order.status !== 'cancelled' ? 'border-amber-200' : 'border-gray-100'
                }`}>
                  {/* Order header */}
                  <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-sky-600 font-semibold">{order.id}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100'}`}>
                        {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]?.zh ?? order.status}
                      </span>
                      {order.ai_analysis?.urgency && order.ai_analysis.urgency !== 'low' && (
                        <span className={`text-xs font-semibold ${URGENCY_COLOR[order.ai_analysis.urgency]}`}>
                          {order.ai_analysis.urgency === 'emergency' ? '🚨 紧急' :
                           order.ai_analysis.urgency === 'high' ? '⚠️ 高' : ''}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleString('zh-CN')}
                    </span>
                  </div>

                  <div className="p-5 grid md:grid-cols-4 gap-5">

                    {/* 1. Customer photos */}
                    <div className="md:col-span-1">
                      <p className="text-xs font-semibold text-gray-500 mb-2">📸 客户照片</p>
                      {order.images?.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1">
                          {order.images.slice(0, 9).map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noreferrer"
                              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              {i === 8 && order.images.length > 9 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                                  +{order.images.length - 9}
                                </div>
                              )}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-300 text-sm">无照片</div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{order.images?.length ?? 0} 张照片 · 点击查看大图</p>
                    </div>

                    {/* 2. Customer info + AI diagnosis */}
                    <div className="md:col-span-2 space-y-3">
                      {/* Customer */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">👤 客户信息</p>
                        <p className="font-bold text-gray-900">{order.customer_name}</p>
                        <p className="text-sm text-gray-600">{order.customer_phone}</p>
                        <div className="flex gap-2 mt-1">
                          {order.customer_whatsapp && (
                            <a href={`https://wa.me/${order.customer_whatsapp.replace(/\D/g,'')}`}
                              target="_blank" rel="noreferrer"
                              className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200">
                              📱 WA: {order.customer_whatsapp}
                            </a>
                          )}
                          {order.customer_line && (
                            <a href={`https://line.me/ti/p/${order.customer_line}`}
                              target="_blank" rel="noreferrer"
                              className="text-xs bg-lime-100 text-lime-700 px-2 py-0.5 rounded-full hover:bg-lime-200">
                              💬 Line: {order.customer_line}
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">📍 {order.address}</p>
                        <p className="text-xs text-gray-500">📅 {order.preferred_date} · {order.preferred_time}</p>
                      </div>

                      {/* AI diagnosis for team */}
                      {order.ai_analysis && (
                        <div className="bg-slate-800 rounded-xl p-3">
                          <p className="text-xs font-semibold text-slate-400 mb-1">🤖 AI内部诊断</p>
                          <p className="text-xs text-slate-200 mb-2">
                            {order.ai_analysis.problem_summary}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-amber-400">🔧 带工具：</span>
                              <span className="text-slate-300">{order.ai_analysis.tools_required?.slice(0,3).join(', ')}</span>
                            </div>
                            <div>
                              <span className="text-sky-400">👷 派工：</span>
                              <span className="text-slate-300">{order.ai_analysis.worker_types?.join(', ')} × {Math.max(2, order.ai_analysis.workers_count ?? 2)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">⏱ {order.ai_analysis.estimated_days}</p>
                        </div>
                      )}
                    </div>

                    {/* 3. Payment status */}
                    <div className="md:col-span-1">
                      <p className="text-xs font-semibold text-gray-500 mb-2">💰 收款状态</p>

                      {/* Deposit status - prominent */}
                      <div className={`rounded-xl p-3 mb-3 ${
                        order.deposit_paid
                          ? 'bg-emerald-50 border border-emerald-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <p className={`text-sm font-bold ${order.deposit_paid ? 'text-emerald-700' : 'text-red-600'}`}>
                          {order.deposit_paid ? '✅ 定金已收' : '❌ 定金未收'}
                        </p>
                        <p className={`text-lg font-bold mt-0.5 ${order.deposit_paid ? 'text-emerald-600' : 'text-red-500'}`}>
                          ฿{order.deposit_fee?.toLocaleString()}
                        </p>
                        {order.deposit_paid && order.deposit_paid_at && (
                          <p className="text-xs text-emerald-500 mt-0.5">
                            {new Date(order.deposit_paid_at).toLocaleDateString('zh-CN')}
                          </p>
                        )}
                      </div>

                      {/* Total fee */}
                      <div className="text-sm space-y-1 mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">人工费</span>
                          <span className="font-medium">฿{order.labor_fee?.toLocaleString()}</span>
                        </div>
                        {(order as any).final_total_fee && (
                          <div className="flex justify-between text-purple-600">
                            <span>最终报价</span>
                            <span className="font-bold">฿{(order as any).final_total_fee?.toLocaleString()}</span>
                          </div>
                        )}
                        {(order as any).balance_fee != null && (
                          <div className="flex justify-between text-red-600">
                            <span>尾款</span>
                            <span className="font-bold">฿{(order as any).balance_fee?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-2">
                        {/* Deposit confirmation button */}
                        <OrderDepositButton
                          orderId={order.id}
                          depositPaid={order.deposit_paid}
                          depositFee={order.deposit_fee}
                        />

                        {/* View details */}
                        <Link href={`/admin/orders/${order.id}`}
                          className="block w-full text-center text-xs text-sky-600 border border-sky-200 rounded-lg py-2 hover:bg-sky-50 transition-colors">
                          详情 / 调整报价
                        </Link>

                        {/* WhatsApp quick contact */}
                        {order.customer_whatsapp && (
                          <a href={`https://wa.me/${order.customer_whatsapp.replace(/\D/g,'')}?text=您好${order.customer_name}，您的订单${order.id}已确认，请支付定金฿${order.deposit_fee}`}
                            target="_blank" rel="noreferrer"
                            className="block w-full text-center text-xs bg-green-500 text-white rounded-lg py-2 hover:bg-green-600 transition-colors">
                            📱 发收款请求
                          </a>
                        )}
                      </div>
                    </div>
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
