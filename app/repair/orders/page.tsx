'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/repair-types'

type Lang = 'en' | 'zh' | 'th'

const STATUS_COLOR: Record<string, string> = {
  pending:     'bg-gray-100 text-gray-600',
  confirmed:   'bg-blue-100 text-blue-700',
  paid:        'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
}

export default function CustomerOrdersPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [data, setData] = useState<{ customer: any; orders: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/repair/auth/me')
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const title = lang === 'zh' ? '我的订单' : lang === 'th' ? 'คำสั่งของฉัน' : 'My Orders'
  const notLoggedIn = lang === 'zh' ? '请先登录查看订单' : lang === 'th' ? 'กรุณาเข้าสู่ระบบ' : 'Please sign in to view your orders'
  const noOrders = lang === 'zh' ? '暂无订单' : lang === 'th' ? 'ยังไม่มีคำสั่ง' : 'No orders yet'

  async function handleSignOut() {
    await fetch('/api/repair/auth/me', { method: 'DELETE' })
    window.location.href = '/repair'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-400">
        <svg className="w-8 h-8 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-900 text-white px-6 py-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/repair" className="text-sky-400 text-sm">← {lang === 'zh' ? '返回' : lang === 'th' ? 'กลับ' : 'Back'}</Link>
            <div className="flex gap-1">
              {(['en', 'zh', 'th'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${lang === l ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/70'}`}>
                  {l === 'en' ? 'EN' : l === 'zh' ? '中文' : 'ไทย'}
                </button>
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-bold">📋 {title}</h1>
          {data?.customer && (
            <div className="mt-2">
              <p className="text-white/70 text-sm">{data.customer.email}</p>
              {data.customer.name && <p className="text-white/50 text-xs">{data.customer.name}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {!data ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-gray-600 mb-4">{notLoggedIn}</p>
            <Link href="/repair/login?redirect=/repair/orders"
              className="bg-sky-500 text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-sky-600 transition-colors">
              {lang === 'zh' ? '立即登录' : lang === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: lang === 'zh' ? '总订单' : lang === 'th' ? 'คำสั่งทั้งหมด' : 'Total Orders', value: data.orders.length },
                { label: lang === 'zh' ? '已完成' : lang === 'th' ? 'เสร็จสิ้น' : 'Completed', value: data.orders.filter((o: any) => o.status === 'completed').length },
                { label: lang === 'zh' ? '总消费' : lang === 'th' ? 'ยอดรวม' : 'Total Spent', value: `฿${data.customer.total_spent?.toLocaleString() ?? 0}` },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-3 shadow-sm text-center">
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Orders list */}
            {data.orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400">
                <div className="text-4xl mb-3">🔧</div>
                <p>{noOrders}</p>
                <Link href="/repair" className="text-sky-500 text-sm mt-2 block hover:underline">
                  {lang === 'zh' ? '立即报修 →' : lang === 'th' ? 'แจ้งซ่อมเลย →' : 'Book a repair →'}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.orders.map((order: any) => (
                  <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono text-xs text-sky-600 font-semibold">{order.id}</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                          {CATEGORY_LABELS[order.category as keyof typeof CATEGORY_LABELS]?.[lang] ?? order.category}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100'}`}>
                        {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]?.[lang] ?? order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>📅 {order.preferred_date}</span>
                      <span className="font-semibold text-sky-600">฿{order.labor_fee?.toLocaleString()}</span>
                    </div>
                    {order.ai_analysis?.problem_summary && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{order.ai_analysis.problem_summary}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Link href={`/repair/track?order=${order.id}`}
                        className="flex-1 text-center text-xs text-sky-600 border border-sky-200 rounded-lg py-1.5 hover:bg-sky-50 transition-colors">
                        {lang === 'zh' ? '查看详情' : lang === 'th' ? 'ดูรายละเอียด' : 'View Details'}
                      </Link>
                      {order.status === 'pending' || order.status === 'confirmed' ? (
                        <Link href={`/repair`}
                          className="flex-1 text-center text-xs text-emerald-600 border border-emerald-200 rounded-lg py-1.5 hover:bg-emerald-50 transition-colors">
                          {lang === 'zh' ? '再次报修' : lang === 'th' ? 'แจ้งซ่อมอีก' : 'Book Again'}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sign out */}
            <div className="text-center pt-2">
              <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
                {lang === 'zh' ? '退出登录' : lang === 'th' ? 'ออกจากระบบ' : 'Sign Out'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
