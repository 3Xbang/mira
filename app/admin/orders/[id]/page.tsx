import { redirect, notFound } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { RepairOrder } from '@/lib/repair-types'
import { STATUS_LABELS, CATEGORY_LABELS, URGENCY_LABELS } from '@/lib/repair-types'
import OrderActions from './OrderActions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getOrder(id: string): Promise<RepairOrder | null> {
  const credentials = process.env.MIRA_ACCESS_KEY_ID && process.env.MIRA_SECRET_ACCESS_KEY
    ? { accessKeyId: process.env.MIRA_ACCESS_KEY_ID, secretAccessKey: process.env.MIRA_SECRET_ACCESS_KEY }
    : undefined
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({
    region: process.env.MIRA_AWS_REGION ?? 'us-east-1',
    ...(credentials ? { credentials } : {}),
  }))
  const res = await doc.send(new GetCommand({
    TableName: process.env.MIRA_TABLE_ORDERS ?? 'mira-repair-orders',
    Key: { id },
  }))
  return (res.Item as RepairOrder) ?? null
}

const STATUS_COLOR: Record<string, string> = {
  pending:     'bg-gray-100 text-gray-600',
  confirmed:   'bg-blue-100 text-blue-700',
  quoted:      'bg-purple-100 text-purple-700',
  paid:        'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  )
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated()) redirect('/admin/login')
  const { id } = await params
  const order = await getOrder(id).catch(() => null)
  if (!order) notFound()

  const confirmUrl = `https://miraa.homes/repair/confirm/${order.id}`
  const waMsg = encodeURIComponent(`Hi ${order.customer_name}, your service quote has been updated. Please confirm: ${confirmUrl}`)
  const lineMsg = encodeURIComponent(`Please confirm your updated quote: ${confirmUrl}`)

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600 text-sm">← 订单列表</Link>
            <span className="text-gray-300">/</span>
            <span className="font-mono text-sky-600 font-semibold">{order.id}</span>
            <span className={`ml-2 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100'}`}>
              {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]?.zh ?? order.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Left: Customer Info */}
            <div className="space-y-5">

              {/* Customer */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-3">👤 客户信息</h2>
                <InfoRow label="姓名" value={order.customer_name} />
                <InfoRow label="电话" value={order.customer_phone} />
                <InfoRow label="Line" value={order.customer_line} />
                <InfoRow label="WhatsApp" value={order.customer_whatsapp} />
                <InfoRow label="地址" value={order.address} />
                <InfoRow label="预约日期" value={order.preferred_date} />
                <InfoRow label="时间" value={order.preferred_time} />
                <InfoRow label="备注" value={order.notes} />
                <InfoRow label="语言" value={order.language?.toUpperCase()} />
                <InfoRow label="下单时间" value={new Date(order.created_at).toLocaleString('zh-CN')} />
              </div>

              {/* Photos */}
              {order.images?.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-3">📸 客户上传照片</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {order.images.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full aspect-square object-cover rounded-xl hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Internal Diagnosis */}
              {order.ai_analysis && (
                <div className="bg-slate-900 rounded-2xl p-5 shadow-sm">
                  <h2 className="font-bold text-white mb-3">🤖 AI 内部诊断</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">诊断详情</p>
                      <p className="text-sm text-slate-200">{order.ai_analysis.internal_diagnosis}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">🔧 需要工具</p>
                        <ul className="text-xs text-amber-300 space-y-0.5">
                          {order.ai_analysis.tools_required?.map((t, i) => <li key={i}>• {t}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">👷 派工类型</p>
                        <ul className="text-xs text-sky-300 space-y-0.5">
                          {order.ai_analysis.worker_types?.map((w, i) => <li key={i}>• {w}</li>)}
                        </ul>
                      </div>
                    </div>
                    {order.ai_analysis.work_steps?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">📋 施工步骤</p>
                        <ol className="text-xs text-slate-300 space-y-0.5 list-decimal list-inside">
                          {order.ai_analysis.work_steps.map((s, i) => <li key={i}>{s}</li>)}
                        </ol>
                      </div>
                    )}
                    {order.ai_analysis.risk_notes && (
                      <div className="bg-red-900/30 rounded-lg p-3">
                        <p className="text-xs text-red-400">⚠️ {order.ai_analysis.risk_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Quote + Actions */}
            <div className="space-y-5">

              {/* Current Quote */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-3">💰 当前报价</h2>
                <InfoRow label="人工费" value={`฿${order.labor_fee?.toLocaleString()}`} />
                <InfoRow label="材料费" value={`฿${order.material_fee?.toLocaleString()}`} />
                <div className="flex justify-between py-2.5 border-t border-gray-100 mt-1">
                  <span className="font-bold text-gray-900">总费用</span>
                  <span className="text-xl font-bold text-sky-600">฿{order.total_fee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">定金（50%工时费）</span>
                  <span className="font-semibold text-gray-900">
                    ฿{order.deposit_fee?.toLocaleString()}
                    {order.deposit_paid && <span className="ml-2 text-emerald-500">✅ 已付</span>}
                  </span>
                </div>
                {(order as any).final_labor_fee != null && (
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                    <p className="text-xs text-purple-500 font-semibold mb-2">📝 调整后报价</p>
                    <InfoRow label="最终人工费" value={`฿${(order as any).final_labor_fee?.toLocaleString()}`} />
                    <InfoRow label="最终材料费" value={`฿${(order as any).final_material_fee?.toLocaleString()}`} />
                    <div className="flex justify-between py-2">
                      <span className="font-bold text-gray-900">最终总价</span>
                      <span className="font-bold text-purple-600">฿{(order as any).final_total_fee?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-500">客户尾款</span>
                      <span className="font-bold text-red-600">
                        ฿{((order as any).final_total_fee - order.deposit_fee)?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notify Customer */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-3">📤 通知客户确认</h2>
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-400 mb-1">客户确认链接</p>
                  <p className="font-mono text-xs text-sky-600 break-all">{confirmUrl}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* Copy link */}
                  <button
                    onClick={() => { if (typeof navigator !== 'undefined') navigator.clipboard.writeText(confirmUrl) }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors">
                    📋 复制链接
                  </button>
                  {/* WhatsApp */}
                  {order.customer_whatsapp && (
                    <a href={`https://wa.me/${order.customer_whatsapp.replace(/\D/g, '')}?text=${waMsg}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors">
                      📱 发 WhatsApp
                    </a>
                  )}
                  {/* Line */}
                  {order.customer_line && (
                    <a href={`https://line.me/R/ti/p/${order.customer_line}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-xl text-sm font-medium transition-colors">
                      💬 打开 Line
                    </a>
                  )}
                </div>
              </div>

              {/* Actions: adjust quote + update status */}
              <OrderActions order={order} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
