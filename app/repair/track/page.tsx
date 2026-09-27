'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { RepairOrder } from '@/lib/repair-types'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/repair-types'

type Lang = 'en' | 'zh' | 'th'

const STATUS_COLOR: Record<string, string> = {
  pending:     'bg-gray-100 text-gray-600',
  confirmed:   'bg-blue-100 text-blue-700',
  quoted:      'bg-purple-100 text-purple-700',
  paid:        'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
}

const STATUS_ICON: Record<string, string> = {
  pending: '⏳',
  confirmed: '✅',
  quoted: '📋',
  paid: '💳',
  in_progress: '🔧',
  completed: '🎉',
  cancelled: '❌',
}

function TrackContent() {
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<Lang>('en')
  const [orderId, setOrderId] = useState(searchParams.get('order') ?? '')
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-search if order param provided
  useEffect(() => {
    if (searchParams.get('order')) {
      handleTrack()
    }
  }, [])

  async function handleTrack() {
    if (!orderId.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await fetch(`/api/repair/order/${orderId.trim()}`)
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(lang === 'zh' ? '找不到该订单，请检查订单号' :
                  lang === 'th' ? 'ไม่พบคำสั่งนี้ กรุณาตรวจสอบหมายเลข' :
                  'Order not found. Please check your Order ID.')
      } else {
        setOrder(data)
      }
    } catch {
      setError(lang === 'zh' ? '查询失败，请重试' : 'Query failed, please try again')
    } finally {
      setLoading(false)
    }
  }

  const title = lang === 'zh' ? '订单追踪' : lang === 'th' ? 'ติดตามคำสั่ง' : 'Track Order'
  const placeholder = lang === 'zh' ? '输入订单号 MR-XXXXXXXX-XXXX' : lang === 'th' ? 'กรอกหมายเลข MR-XXXXXXXX-XXXX' : 'Enter Order ID: MR-XXXXXXXX-XXXX'

  // Build timeline from order status
  const timeline = [
    { key: 'pending',     icon: '📝', en: 'Order Placed',       zh: '订单已提交',    th: 'ส่งคำสั่งแล้ว' },
    { key: 'confirmed',   icon: '✅', en: 'Booking Confirmed',  zh: '预约已确认',    th: 'ยืนยันการจองแล้ว' },
    { key: 'paid',        icon: '💳', en: 'Deposit Paid',       zh: '定金已付',      th: 'ชำระมัดจำแล้ว' },
    { key: 'in_progress', icon: '🔧', en: 'Work In Progress',   zh: '施工中',        th: 'กำลังดำเนินการ' },
    { key: 'completed',   icon: '🎉', en: 'Completed',          zh: '已完成',        th: 'เสร็จสิ้น' },
  ]

  const statusOrder = ['pending', 'confirmed', 'paid', 'in_progress', 'completed']
  const currentIdx = order ? statusOrder.indexOf(order.status) : -1

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
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${lang === l ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/70'}`}>
                  {l === 'en' ? 'EN' : l === 'zh' ? '中文' : 'ไทย'}
                </button>
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-bold">🔍 {title}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Search bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex gap-2">
            <input
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
            />
            <button onClick={handleTrack} disabled={loading || !orderId.trim()}
              className="px-5 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors text-sm">
              {loading ? '...' : lang === 'zh' ? '查询' : lang === 'th' ? 'ค้นหา' : 'Track'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Order details */}
        {order && (
          <>
            {/* Status banner */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    {lang === 'zh' ? '订单号' : lang === 'th' ? 'หมายเลขคำสั่ง' : 'Order ID'}
                  </p>
                  <p className="font-mono font-bold text-sky-600">{order.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLOR[order.status] ?? 'bg-gray-100'}`}>
                  {STATUS_ICON[order.status]} {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]?.[lang] ?? order.status}
                </span>
              </div>

              {/* Timeline */}
              {order.status !== 'cancelled' && (
                <div className="space-y-1">
                  {timeline.map((step, i) => {
                    const done = i <= currentIdx
                    const current = i === currentIdx
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${done ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'} ${current ? 'ring-2 ring-emerald-300' : ''}`}>
                          {done ? (current ? step.icon : '✓') : step.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step[lang]}
                          </p>
                        </div>
                        {i < timeline.length - 1 && (
                          <div className={`w-px h-4 ml-4 ${i < currentIdx ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Order info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">
                {lang === 'zh' ? '订单详情' : lang === 'th' ? 'รายละเอียดคำสั่ง' : 'Order Details'}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{lang === 'zh' ? '服务类型' : lang === 'th' ? 'ประเภทบริการ' : 'Service'}</span>
                  <span className="font-medium">{CATEGORY_LABELS[order.category as keyof typeof CATEGORY_LABELS]?.[lang] ?? order.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{lang === 'zh' ? '预约日期' : lang === 'th' ? 'วันที่นัด' : 'Date'}</span>
                  <span className="font-medium">{order.preferred_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{lang === 'zh' ? '地址' : lang === 'th' ? 'ที่อยู่' : 'Address'}</span>
                  <span className="font-medium text-right max-w-[60%]">{order.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{lang === 'zh' ? '人工费' : lang === 'th' ? 'ค่าแรง' : 'Labor'}</span>
                  <span className="font-bold text-sky-600">฿{order.labor_fee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{lang === 'zh' ? '定金' : lang === 'th' ? 'มัดจำ' : 'Deposit'}</span>
                  <span className={`font-medium ${order.deposit_paid ? 'text-emerald-600' : 'text-red-500'}`}>
                    ฿{order.deposit_fee?.toLocaleString()} {order.deposit_paid ? '✅' : '⏳'}
                  </span>
                </div>
                {(order as any).final_total_fee && (order as any).final_total_fee !== order.total_fee && (
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="text-gray-500 font-medium">{lang === 'zh' ? '最终报价' : lang === 'th' ? 'ราคาสุดท้าย' : 'Final Quote'}</span>
                    <span className="font-bold text-purple-600">฿{(order as any).final_total_fee?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin notes for customer */}
            {(order as any).admin_notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-xs text-blue-500 font-semibold mb-1">
                  {lang === 'zh' ? '💬 团队留言' : lang === 'th' ? '💬 ข้อความจากทีมงาน' : '💬 Message from our team'}
                </p>
                <p className="text-sm text-blue-900">{(order as any).admin_notes}</p>
              </div>
            )}

            {/* Confirm updated quote button */}
            {(order as any).final_total_fee && !(order as any).customer_confirmed && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-center">
                <p className="text-purple-900 font-semibold mb-3">
                  {lang === 'zh' ? '📋 请确认更新后的报价' :
                   lang === 'th' ? '📋 กรุณายืนยันราคาที่อัปเดต' :
                   '📋 Please confirm the updated quote'}
                </p>
                <Link href={`/repair/confirm/${order.id}`}
                  className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-2.5 rounded-full transition-colors text-sm">
                  {lang === 'zh' ? '查看并确认' : lang === 'th' ? 'ดูและยืนยัน' : 'View & Confirm'}
                </Link>
              </div>
            )}

            {/* Contact */}
            <div className="bg-slate-800 rounded-2xl p-4 text-center">
              <p className="text-white/60 text-xs mb-3">
                {lang === 'zh' ? '有问题？联系我们' : lang === 'th' ? 'มีคำถาม? ติดต่อเรา' : 'Questions? Contact us'}
              </p>
              <div className="flex gap-2 justify-center">
                <a href="https://wa.me/66835234777" target="_blank" rel="noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded-full text-xs font-semibold">📱 WhatsApp</a>
                <a href="https://line.me/ti/p/0835234777" target="_blank" rel="noreferrer"
                  className="bg-lime-500 text-white px-4 py-2 rounded-full text-xs font-semibold">💬 Line</a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  )
}
