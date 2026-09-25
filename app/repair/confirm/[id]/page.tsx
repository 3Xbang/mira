'use client'

import { useState, useEffect } from 'react'
import type { RepairOrder } from '@/lib/repair-types'
import { CATEGORY_LABELS } from '@/lib/repair-types'

const T = {
  en: {
    title: 'Order Confirmation',
    loading: 'Loading your order...',
    notFound: 'Order not found.',
    orderId: 'Order ID',
    category: 'Service Type',
    address: 'Address',
    date: 'Scheduled Date',
    laborFee: 'Labor Fee',
    materialFee: 'Material Fee',
    totalFee: 'Total',
    deposit: 'Deposit Paid',
    balance: 'Balance Due',
    notes: 'Notes from our team',
    confirmBtn: 'Confirm & Proceed to Payment',
    confirming: 'Confirming...',
    confirmed: 'Confirmed! Thank you.',
    confirmedMsg: 'Please proceed with the balance payment.',
    contactUs: 'Questions? Contact us:',
    alreadyConfirmed: 'You have already confirmed this order.',
    originalQuote: 'Original AI Quote',
    updatedQuote: 'Updated Quote',
  },
  zh: {
    title: '订单确认',
    loading: '加载订单中...',
    notFound: '订单不存在。',
    orderId: '订单号',
    category: '服务类型',
    address: '地址',
    date: '预约日期',
    laborFee: '人工费',
    materialFee: '材料费',
    totalFee: '总费用',
    deposit: '已付定金',
    balance: '尾款',
    notes: '我们的说明',
    confirmBtn: '确认报价并付款',
    confirming: '确认中...',
    confirmed: '已确认！谢谢您。',
    confirmedMsg: '请支付尾款完成订单。',
    contactUs: '有疑问请联系我们：',
    alreadyConfirmed: '您已确认此订单。',
    originalQuote: '原始AI报价',
    updatedQuote: '调整后报价',
  },
  th: {
    title: 'ยืนยันคำสั่ง',
    loading: 'กำลังโหลด...',
    notFound: 'ไม่พบคำสั่ง',
    orderId: 'หมายเลขคำสั่ง',
    category: 'ประเภทบริการ',
    address: 'ที่อยู่',
    date: 'วันที่นัด',
    laborFee: 'ค่าแรง',
    materialFee: 'ค่าวัสดุ',
    totalFee: 'รวม',
    deposit: 'มัดจำที่ชำระแล้ว',
    balance: 'ยอดค้างชำระ',
    notes: 'หมายเหตุจากทีมงาน',
    confirmBtn: 'ยืนยันและชำระเงิน',
    confirming: 'กำลังยืนยัน...',
    confirmed: 'ยืนยันแล้ว! ขอบคุณ',
    confirmedMsg: 'กรุณาชำระยอดค้างชำระ',
    contactUs: 'มีคำถาม? ติดต่อเรา:',
    alreadyConfirmed: 'คุณได้ยืนยันคำสั่งนี้แล้ว',
    originalQuote: 'ราคาประเมินจาก AI',
    updatedQuote: 'ราคาที่ปรับปรุงแล้ว',
  },
}

type Lang = 'en' | 'zh' | 'th'

export default function ConfirmPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<(RepairOrder & { final_labor_fee?: number; final_material_fee?: number; final_total_fee?: number; admin_notes?: string; balance_fee?: number; customer_confirmed?: boolean }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    fetch(`/api/repair/order/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setOrder(d)
        if (d.language) setLang(d.language as Lang)
        if (d.customer_confirmed) setConfirmed(true)
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [params.id])

  const t = T[lang]

  async function handleConfirm() {
    setConfirming(true)
    try {
      const res = await fetch('/api/repair/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: params.id }),
      })
      if (res.ok) setConfirmed(true)
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">🔧</div>
        <p className="text-gray-500">{T.en.loading}</p>
      </div>
    </div>
  )

  if (!order || (order as any).error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-3">❌</div>
        <p className="text-gray-500">{T.en.notFound}</p>
      </div>
    </div>
  )

  const hasUpdate = order.final_total_fee != null && order.final_total_fee !== order.total_fee
  const displayTotal = order.final_total_fee ?? order.total_fee
  const displayLabor = order.final_labor_fee ?? order.labor_fee
  const displayMaterial = order.final_material_fee ?? order.material_fee
  const balanceDue = order.balance_fee ?? Math.max(0, displayTotal - (order.deposit_fee ?? 0))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-900 text-white px-6 py-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold tracking-widest text-sky-400">MIRA</span>
            <div className="flex gap-1">
              {(['en', 'zh', 'th'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${lang === l ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/70'}`}>
                  {l === 'en' ? 'EN' : l === 'zh' ? '中' : 'ไทย'}
                </button>
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-bold">🔧 {t.title}</h1>
          <p className="text-white/60 text-sm mt-1 font-mono">{order.id}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-5">

        {/* Updated quote banner */}
        {hasUpdate && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-bold text-purple-900">{t.updatedQuote}</p>
              <p className="text-sm text-purple-600 mt-0.5">
                {lang === 'zh' ? '我们的团队已根据现场情况调整了报价，请查看并确认。' :
                 lang === 'th' ? 'ทีมงานได้ปรับราคาตามสภาพจริงในสถานที่' :
                 'Our team has adjusted the quote based on on-site conditions.'}
              </p>
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">{t.category}</span>
            <span className="text-sm font-medium text-gray-900">
              {CATEGORY_LABELS[order.category]?.[lang] ?? order.category}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">{t.address}</span>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{order.address}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">{t.date}</span>
            <span className="text-sm font-medium text-gray-900">{order.preferred_date}</span>
          </div>
        </div>

        {/* Quote */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">
            {hasUpdate ? t.updatedQuote : t.originalQuote}
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.laborFee}</span>
              <span className="font-medium">฿{displayLabor?.toLocaleString()}</span>
            </div>
            {(displayMaterial ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.materialFee}</span>
                <span className="font-medium">฿{displayMaterial?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
              <span>{t.totalFee}</span>
              <span className="text-lg">฿{displayTotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.deposit}</span>
              <span className="text-emerald-600 font-medium">- ฿{order.deposit_fee?.toLocaleString()} ✅</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-100 pt-2">
              <span className="text-gray-900">{t.balance}</span>
              <span className="text-xl text-red-600">฿{balanceDue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Admin notes */}
        {order.admin_notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs text-amber-600 font-semibold mb-1">{t.notes}</p>
            <p className="text-sm text-amber-900">{order.admin_notes}</p>
          </div>
        )}

        {/* Confirm button / Already confirmed */}
        {confirmed ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-bold text-emerald-800 text-lg">{t.confirmed}</p>
            <p className="text-sm text-emerald-600 mt-2">{t.confirmedMsg}</p>
            <p className="text-sm font-bold text-red-600 mt-3">
              {t.balance}: ฿{balanceDue.toLocaleString()}
            </p>
          </div>
        ) : (
          <button onClick={handleConfirm} disabled={confirming}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-4 rounded-2xl text-lg transition-colors">
            {confirming ? t.confirming : t.confirmBtn}
          </button>
        )}

        {/* Contact */}
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-3">{t.contactUs}</p>
          <div className="flex gap-3 justify-center">
            <a href="https://wa.me/66812345678" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors">
              📱 WhatsApp
            </a>
            <a href="https://line.me/ti/p/mira_samui" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-lime-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-lime-600 transition-colors">
              💬 Line
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
