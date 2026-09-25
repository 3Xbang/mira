'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RepairOrder } from '@/lib/repair-types'

const STATUS_OPTIONS = [
  { value: 'pending',     label: '待确认' },
  { value: 'confirmed',   label: '已确认' },
  { value: 'paid',        label: '已付定金' },
  { value: 'in_progress', label: '施工中' },
  { value: 'completed',   label: '已完成' },
  { value: 'cancelled',   label: '已取消' },
]

export default function OrderActions({ order }: { order: RepairOrder }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const existing = order as any
  const [form, setForm] = useState({
    status: order.status,
    final_labor_fee: existing.final_labor_fee ?? order.labor_fee ?? 0,
    final_material_fee: existing.final_material_fee ?? order.material_fee ?? 0,
    admin_notes: existing.admin_notes ?? '',
    deposit_paid: order.deposit_paid ?? false,
  })

  const finalTotal = Number(form.final_labor_fee) + Number(form.final_material_fee)
  const balance = finalTotal - (order.deposit_fee ?? 0)

  async function handleSave() {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch(`/admin/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: form.status,
          final_labor_fee: Number(form.final_labor_fee),
          final_material_fee: Number(form.final_material_fee),
          final_total_fee: finalTotal,
          admin_notes: form.admin_notes,
          deposit_paid: form.deposit_paid,
          balance_fee: balance,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setMsg('✅ 保存成功')
      router.refresh()
    } catch {
      setMsg('❌ 保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <h2 className="font-bold text-gray-900">⚙️ 调整报价 & 状态</h2>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
        <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Deposit paid toggle */}
      <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
        <input type="checkbox" id="deposit_paid" checked={form.deposit_paid}
          onChange={e => setForm(p => ({ ...p, deposit_paid: e.target.checked }))}
          className="w-4 h-4 accent-emerald-500" />
        <label htmlFor="deposit_paid" className="text-sm font-medium text-emerald-800">
          ✅ 已收到定金 ฿{order.deposit_fee?.toLocaleString()}
        </label>
      </div>

      {/* Final quote */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">📝 现场调整报价（如有变化）</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">最终人工费（THB）</label>
            <input type="number" value={form.final_labor_fee}
              onChange={e => setForm(p => ({ ...p, final_labor_fee: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">最终材料费（THB）</label>
            <input type="number" value={form.final_material_fee}
              onChange={e => setForm(p => ({ ...p, final_material_fee: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
          <div className="flex justify-between text-gray-600">
            <span>最终总价</span>
            <span className="font-bold">฿{finalTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>已付定金</span>
            <span className="text-emerald-600">- ฿{order.deposit_fee?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1">
            <span>客户尾款</span>
            <span className="text-red-600">฿{Math.max(0, balance).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Admin notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">内部备注 / 给客户的说明</label>
        <textarea value={form.admin_notes}
          onChange={e => setForm(p => ({ ...p, admin_notes: e.target.value }))}
          rows={3} placeholder="如：现场发现额外问题，需要更换管道..."
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
      </div>

      {msg && (
        <div className={`text-sm px-3 py-2 rounded-lg ${msg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {msg}
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-3 rounded-xl transition-colors">
        {saving ? '保存中...' : '💾 保存更改'}
      </button>
    </div>
  )
}
