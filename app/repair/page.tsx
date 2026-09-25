'use client'

import { useState, useRef } from 'react'
import type { AIAnalysisResult } from '@/lib/repair-types'
import { CATEGORY_LABELS, MINIMUM_LABOR_FEE, DEPOSIT_RATE } from '@/lib/repair-types'
import Link from 'next/link'

// ─── Translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Repair & Construction Service',
    subtitle: 'Upload photos → AI analysis → Instant quote → Book online',
    step1: 'Upload Photos',
    step2: 'AI Analysis',
    step3: 'Book & Pay',
    uploadLabel: 'Upload photos of the issue (max 5)',
    uploadHint: 'JPG · PNG · WebP · Max 5 photos',
    descLabel: 'Describe the issue (optional)',
    descPlaceholder: 'e.g. Water leaking from ceiling in bedroom...',
    analyze: 'Analyze with AI',
    analyzing: 'Analyzing...',
    analysisTitle: 'AI Assessment',
    problem: 'Problem',
    category: 'Service Type',
    workers: 'Workers Needed',
    laborFee: 'Labor Fee',
    materialFee: 'Material Fee (est.)',
    totalFee: 'Estimated Total',
    timeline: 'Estimated Duration',
    urgency: 'Urgency',
    minFee: `Minimum labor fee: ฿${MINIMUM_LABOR_FEE.toLocaleString()}`,
    deposit: '50% deposit required at booking',
    newConstruction: 'This looks like a new construction project.',
    contactUs: 'Contact Us for a Custom Quote',
    bookNow: 'Book Now',
    formTitle: 'Your Details',
    name: 'Full Name',
    phone: 'Phone Number',
    address: 'Property Address',
    date: 'Preferred Date',
    time: 'Preferred Time',
    morning: 'Morning (8am-12pm)',
    afternoon: 'Afternoon (1pm-5pm)',
    allday: 'All Day',
    notes: 'Additional Notes',
    submit: 'Confirm Booking',
    submitting: 'Submitting...',
    disclaimer: 'Final pricing confirmed on-site. Material costs billed separately.',
    range: 'to',
    thb: '฿',
  },
  zh: {
    title: '维修 & 小型建筑工程服务',
    subtitle: '上传照片 → AI分析 → 即时报价 → 在线预约',
    step1: '上传照片',
    step2: 'AI 分析',
    step3: '预约付款',
    uploadLabel: '上传问题照片（最多5张）',
    uploadHint: 'JPG · PNG · WebP · 最多5张',
    descLabel: '描述问题（可选）',
    descPlaceholder: '例如：卧室天花板漏水...',
    analyze: 'AI 智能分析',
    analyzing: '分析中...',
    analysisTitle: 'AI 评估报告',
    problem: '问题描述',
    category: '服务类型',
    workers: '所需工种',
    laborFee: '人工费',
    materialFee: '材料费（预估）',
    totalFee: '预估总费用',
    timeline: '预估工期',
    urgency: '紧急程度',
    minFee: `最低工时费：฿${MINIMUM_LABOR_FEE.toLocaleString()}`,
    deposit: '预约需预付50%定金',
    newConstruction: '此项目为新建工程，请与我们联系洽谈。',
    contactUs: '联系我们获取定制报价',
    bookNow: '立即预约',
    formTitle: '填写预约信息',
    name: '姓名',
    phone: '电话号码',
    address: '房屋地址',
    date: '预约日期',
    time: '上门时间',
    morning: '上午（8:00-12:00）',
    afternoon: '下午（13:00-17:00）',
    allday: '全天均可',
    notes: '其他备注',
    submit: '确认预约',
    submitting: '提交中...',
    disclaimer: '最终价格以现场确认为准，材料费用另计。',
    range: '至',
    thb: '฿',
  },
  th: {
    title: 'บริการซ่อมแซมและก่อสร้าง',
    subtitle: 'อัปโหลดรูป → AI วิเคราะห์ → ใบเสนอราคาทันที → จองออนไลน์',
    step1: 'อัปโหลดรูปภาพ',
    step2: 'AI วิเคราะห์',
    step3: 'จองและชำระ',
    uploadLabel: 'อัปโหลดรูปปัญหา (สูงสุด 5 รูป)',
    uploadHint: 'JPG · PNG · WebP · สูงสุด 5 รูป',
    descLabel: 'อธิบายปัญหา (ไม่บังคับ)',
    descPlaceholder: 'เช่น น้ำรั่วจากเพดานในห้องนอน...',
    analyze: 'วิเคราะห์ด้วย AI',
    analyzing: 'กำลังวิเคราะห์...',
    analysisTitle: 'ผลการวิเคราะห์ AI',
    problem: 'ปัญหาที่พบ',
    category: 'ประเภทบริการ',
    workers: 'ช่างที่ต้องการ',
    laborFee: 'ค่าแรง',
    materialFee: 'ค่าวัสดุ (ประมาณ)',
    totalFee: 'ราคาประมาณรวม',
    timeline: 'ระยะเวลาโดยประมาณ',
    urgency: 'ความเร่งด่วน',
    minFee: `ค่าแรงขั้นต่ำ: ฿${MINIMUM_LABOR_FEE.toLocaleString()}`,
    deposit: 'ต้องชำระมัดจำ 50% เมื่อจอง',
    newConstruction: 'โปรเจกต์นี้เป็นงานก่อสร้างใหม่',
    contactUs: 'ติดต่อเราเพื่อรับใบเสนอราคา',
    bookNow: 'จองตอนนี้',
    formTitle: 'กรอกข้อมูลการจอง',
    name: 'ชื่อ-นามสกุล',
    phone: 'เบอร์โทรศัพท์',
    address: 'ที่อยู่บ้าน',
    date: 'วันที่ต้องการ',
    time: 'ช่วงเวลา',
    morning: 'เช้า (8:00-12:00)',
    afternoon: 'บ่าย (13:00-17:00)',
    allday: 'ตลอดวัน',
    notes: 'หมายเหตุเพิ่มเติม',
    submit: 'ยืนยันการจอง',
    submitting: 'กำลังส่ง...',
    disclaimer: 'ราคาสุดท้ายยืนยันที่หน้างาน ค่าวัสดุคิดแยกต่างหาก',
    range: 'ถึง',
    thb: '฿',
  },
}

type Lang = 'en' | 'zh' | 'th'

const URGENCY_COLOR: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
}

const URGENCY_LABEL: Record<string, Record<Lang, string>> = {
  low: { en: 'Low', zh: '低', th: 'ต่ำ' },
  medium: { en: 'Medium', zh: '中等', th: 'ปานกลาง' },
  high: { en: 'High', zh: '紧急', th: 'สูง' },
  emergency: { en: 'Emergency', zh: '非常紧急', th: 'ฉุกเฉิน' },
}

export default function RepairPage() {
  const [lang, setLang] = useState<Lang>('en')
  const t = T[lang]

  const [images, setImages] = useState<string[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [form, setForm] = useState({
    name: '', phone: '', address: '',
    date: '', time: 'morning', notes: '',
    line: '', whatsapp: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5)
    if (!files.length) return
    setUploading(true)
    const newUrls: string[] = []
    const newPreviews: string[] = []
    for (const file of files) {
      const localUrl = URL.createObjectURL(file)
      newPreviews.push(localUrl)
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/admin/api/upload', { method: 'POST', body: fd })
      if (res.ok) { const d = await res.json(); newUrls.push(d.url) }
    }
    setImages(prev => [...prev, ...newUrls].slice(0, 5))
    setPreviews(prev => [...prev, ...newPreviews].slice(0, 5))
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImage(i: number) {
    setImages(p => p.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  // AI analysis
  async function handleAnalyze() {
    if (images.length === 0) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/repair/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, description, language: lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnalysis(data)
      setStep(2)
    } catch (e: any) {
      alert('Analysis failed: ' + e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  // Order submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!analysis) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/repair/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          images,
          description,
          language: lang,
          ai_analysis: analysis,
          labor_fee: analysis.estimated_labor_min,
          material_fee: analysis.estimated_material_min,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrderId(data.order_id)
      setStep(3)
    } catch (e: any) {
      alert('Submission failed: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const deposit = analysis
    ? Math.max(MINIMUM_LABOR_FEE * DEPOSIT_RATE, analysis.estimated_labor_min * DEPOSIT_RATE)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-900 text-white px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/en" className="text-2xl font-bold tracking-widest text-sky-400">MIRA</Link>
            {/* Language switcher */}
            <div className="flex gap-1">
              {(['en', 'zh', 'th'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${lang === l ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                  {l === 'en' ? 'EN' : l === 'zh' ? '中文' : 'ไทย'}
                </button>
              ))}
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">🔧 {t.title}</h1>
          <p className="text-white/70">{t.subtitle}</p>

          {/* Steps indicator */}
          <div className="flex gap-4 mt-6">
            {([1, 2, 3] as const).map(s => (
              <div key={s} className={`flex items-center gap-2 text-sm ${step >= s ? 'text-white' : 'text-white/30'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > s ? 'bg-emerald-500' : step === s ? 'bg-sky-500' : 'bg-white/20'}`}>
                  {step > s ? '✓' : s}
                </div>
                {[t.step1, t.step2, t.step3][s - 1]}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* ── STEP 1: Upload ── */}
        {step === 1 && (
          <>
            {/* Upload area */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-4">📸 {t.uploadLabel}</h2>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-sky-300 cursor-pointer transition-colors"
                onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-sky-500">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  <div>
                    <div className="text-5xl mb-3">📷</div>
                    <p className="text-gray-600 font-medium">{t.uploadLabel}</p>
                    <p className="text-gray-400 text-sm mt-1">{t.uploadHint}</p>
                  </div>
                )}
              </div>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {previews.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label className="block font-bold text-gray-900 mb-3">💬 {t.descLabel}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={3} placeholder={t.descPlaceholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
            </div>

            {/* Analyze button */}
            <button onClick={handleAnalyze}
              disabled={images.length === 0 || analyzing}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-3">
              {analyzing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {t.analyzing}
                </>
              ) : (
                <>🤖 {t.analyze}</>
              )}
            </button>
          </>
        )}

        {/* ── STEP 2: Analysis + Booking Form ── */}
        {step === 2 && analysis && (
          <>
            {/* New construction redirect */}
            {analysis.is_new_construction ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">🏗️</div>
                <h2 className="text-xl font-bold text-amber-900 mb-3">{t.newConstruction}</h2>
                <a href="https://wa.me/66812345678" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full transition-colors">
                  💬 {t.contactUs}
                </a>
              </div>
            ) : (
              <>
                {/* AI Analysis Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-bold text-gray-900 text-xl mb-5">🤖 {t.analysisTitle}</h2>

                  <div className="space-y-4">
                    {/* Problem */}
                    <div className="bg-sky-50 rounded-xl p-4">
                      <p className="text-xs text-sky-500 font-semibold uppercase tracking-wide mb-1">{t.problem}</p>
                      <p className="text-gray-900 font-medium">{analysis.problem_summary}</p>
                    </div>

                    {/* Category + Urgency */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{t.category}</p>
                        <p className="font-semibold text-gray-800">
                          {CATEGORY_LABELS[analysis.category]?.[lang] ?? analysis.category}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{t.urgency}</p>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-sm font-semibold ${URGENCY_COLOR[analysis.urgency]}`}>
                          {URGENCY_LABEL[analysis.urgency]?.[lang]}
                        </span>
                      </div>
                    </div>

                    {/* Workers + Timeline */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{t.workers}</p>
                        <p className="font-semibold text-gray-800">{analysis.workers_needed}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{t.timeline}</p>
                        <p className="font-semibold text-gray-800">⏱ {analysis.estimated_days}</p>
                      </div>
                    </div>

                    {/* Fees */}
                    <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t.laborFee}</span>
                        <span className="font-bold text-gray-900">
                          {t.thb}{analysis.estimated_labor_min.toLocaleString()} {t.range} {t.thb}{analysis.estimated_labor_max.toLocaleString()}
                        </span>
                      </div>
                      {analysis.estimated_material_max > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t.materialFee}</span>
                          <span className="font-semibold text-gray-700">
                            {t.thb}{analysis.estimated_material_min.toLocaleString()} {t.range} {t.thb}{analysis.estimated_material_max.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-900">{t.totalFee}</span>
                        <span className="text-xl font-bold text-sky-600">
                          {t.thb}{(analysis.estimated_labor_min + analysis.estimated_material_min).toLocaleString()}+
                        </span>
                      </div>
                    </div>

                    {/* Deposit notice */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                      <span className="text-xl">💳</span>
                      <div>
                        <p className="font-semibold text-emerald-800">{t.deposit}</p>
                        <p className="text-sm text-emerald-600 mt-0.5">
                          {lang === 'zh' ? '定金：' : lang === 'th' ? 'มัดจำ: ' : 'Deposit: '}
                          {t.thb}{deposit.toLocaleString()}
                        </p>
                        <p className="text-xs text-emerald-500 mt-1">{t.minFee}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 text-center">{t.disclaimer}</p>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-bold text-gray-900 text-xl mb-5">📋 {t.formTitle}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.name} *</label>
                        <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone} *</label>
                        <input required value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.address} *</label>
                      <input required value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.date} *</label>
                        <input type="date" required value={form.date}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={e => setForm(p => ({...p, date: e.target.value}))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.time}</label>
                        <select value={form.time} onChange={e => setForm(p => ({...p, time: e.target.value}))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                          <option value="morning">{t.morning}</option>
                          <option value="afternoon">{t.afternoon}</option>
                          <option value="allday">{t.allday}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.notes}</label>
                      <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
                    </div>

                    {/* Line / WhatsApp */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Line ID</label>
                        <input value={form.line} onChange={e => setForm(p => ({...p, line: e.target.value}))}
                          placeholder="@lineid"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                        <input value={form.whatsapp} onChange={e => setForm(p => ({...p, whatsapp: e.target.value}))}
                          placeholder="+66..."
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                    </div>

                    <button type="submit" disabled={submitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-lg transition-colors">
                      {submitting ? t.submitting : `✅ ${t.submit}`}
                    </button>
                  </form>
                </div>
              </>
            )}
          </>
        )}

        {/* ── STEP 3: Payment ── */}
        {step === 3 && orderId && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {lang === 'zh' ? '预约成功！' : lang === 'th' ? 'จองสำเร็จ!' : 'Booking Confirmed!'}
            </h2>
            <p className="text-gray-500 mb-6">
              {lang === 'zh' ? '订单号：' : lang === 'th' ? 'หมายเลขคำสั่ง: ' : 'Order ID: '}
              <span className="font-bold text-sky-600">{orderId}</span>
            </p>

            {/* Payment info */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left mb-6">
              <h3 className="font-bold text-amber-900 mb-4 text-center">
                💳 {lang === 'zh' ? '请支付定金' : lang === 'th' ? 'กรุณาชำระมัดจำ' : 'Please Pay Deposit'}
              </h3>
              <p className="text-3xl font-bold text-amber-600 text-center mb-4">
                ฿{deposit.toLocaleString()}
              </p>

              {/* Payment details - TO BE FILLED */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-amber-200">
                  <span className="text-amber-700 font-medium">
                    {lang === 'zh' ? '银行' : lang === 'th' ? 'ธนาคาร' : 'Bank'}
                  </span>
                  <span className="font-bold text-amber-900">— Coming Soon —</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200">
                  <span className="text-amber-700 font-medium">
                    {lang === 'zh' ? '账户名' : lang === 'th' ? 'ชื่อบัญชี' : 'Account Name'}
                  </span>
                  <span className="font-bold text-amber-900">—</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-amber-700 font-medium">
                    {lang === 'zh' ? '账号' : lang === 'th' ? 'เลขบัญชี' : 'Account Number'}
                  </span>
                  <span className="font-bold text-amber-900">—</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <p className="text-gray-500 text-sm mb-4">
              {lang === 'zh' ? '付款后请联系我们确认' : lang === 'th' ? 'หลังชำระเงินกรุณาติดต่อเรา' : 'After payment please contact us to confirm'}
            </p>
            <div className="flex gap-3 justify-center">
              <a href="https://wa.me/66812345678" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm">
                📱 WhatsApp
              </a>
              <a href="https://line.me/ti/p/mira_samui" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm">
                💬 Line
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
