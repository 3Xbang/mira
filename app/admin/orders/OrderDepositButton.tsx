'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderDepositButton({
  orderId,
  depositPaid,
  depositFee,
}: {
  orderId: string
  depositPaid: boolean
  depositFee?: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    const msg = depositPaid
      ? `取消定金收款确认？`
      : `确认已收到定金 ฿${depositFee?.toLocaleString()}？`
    if (!confirm(msg)) return

    setLoading(true)
    try {
      const res = await fetch(`/admin/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_paid: !depositPaid,
          deposit_paid_at: !depositPaid ? new Date().toISOString() : null,
          status: !depositPaid ? 'paid' : 'confirmed',
        }),
      })
      if (res.ok) router.refresh()
      else alert('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (depositPaid) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className="w-full text-xs text-gray-400 border border-gray-200 rounded-lg py-2 hover:border-red-300 hover:text-red-400 transition-colors"
      >
        {loading ? '...' : '✅ 已收款（点击撤销）'}
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="w-full text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2.5 transition-colors disabled:opacity-50"
    >
      {loading ? '处理中...' : `✅ 确认收到定金 ฿${depositFee?.toLocaleString()}`}
    </button>
  )
}
