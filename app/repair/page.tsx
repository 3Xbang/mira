'use client'

import { useState, useRef, useEffect } from 'react'
import type { AIAnalysisResult } from '@/lib/repair-types'
import { CATEGORY_LABELS, MINIMUM_LABOR_FEE, DEPOSIT_RATE } from '@/lib/repair-types'
import Link from 'next/link'
import RepairDescriptionForm from '@/components/repair/RepairDescriptionForm'

// ─── Company Info ─────────────────────────────────────────────────────────────

const COMPANY = {
  nameZh: '泰国家园',
  nameEn: 'Homeland Corporation Co.,Ltd',
  nameTh: 'โฮมแลนด์ คอร์ปอเรชั่น',
  wa1: '66835234777',
  line: '0835234777',
  area: { en: 'Ko Samui Island', zh: '苏梅岛全岛', th: 'เกาะสมุย ทั้งเกาะ' },
  hours: { en: '8:00 AM – 12:00 AM · 7 days', zh: '每天 8:00 – 24:00，7天服务', th: '8:00 – 24:00 ทุกวัน' },
}

// ─── Translations ─────────────────────────────────────────────────────────────

type Lang = 'en' | 'zh' | 'th'

const T = {
  en: {
    title: 'Repair & Construction Service',
    subtitle: 'Upload photos → AI analysis → Instant quote → Book online',
    tagline: 'Professional team · Ko Samui Island · Open 8am–midnight',
    step1: 'Upload Photos',
    step2: 'AI Analysis',
    step3: 'Confirmed',
    uploadLabel: 'Upload photos of the issue (max 10, multiple angles recommended)',
    uploadHint: 'JPG · PNG · WebP · Max 10 photos',
    analyze: 'Analyze with AI',
    analyzing: 'Analyzing... (may take 15-20 seconds)',
    analysisTitle: 'AI Assessment',
    problem: 'Problem Found',
    category: 'Service Type',
    workers: 'Workers Needed',
    laborFee: 'Labor Fee',
    materialFee: 'Materials (est.)',
    totalFee: 'Estimated Total',
    timeline: 'Duration',
    urgency: 'Urgency',
    minFee: `Min. labor: ฿${MINIMUM_LABOR_FEE.toLocaleString()} (2 workers)`,
    deposit: '50% labor deposit required',
    newConstruction: 'This looks like a new construction project.',
    contactUs: 'Contact Us for a Custom Quote',
    bookNow: 'Book Now',
    formTitle: 'Your Booking Details',
    name: 'Full Name',
    phone: 'Phone Number',
    address: 'Property Address',
    date: 'Preferred Date',
    time: 'Preferred Time',
    morning: 'Morning (8am–12pm)',
    afternoon: 'Afternoon (1pm–6pm)',
    evening: 'Evening (6pm–12am)',
    notes: 'Additional Notes',
    submit: 'Confirm Booking',
    submitting: 'Submitting...',
    disclaimer: 'Final pricing confirmed on-site. Material costs billed separately.',
    trackOrder: 'Track your order',
    trackPlaceholder: 'Enter your Order ID',
    trackBtn: 'Track',
    faqTitle: 'Frequently Asked Questions',
    whyDeposit: 'Why is a deposit required?',
    whyDepositA: 'The deposit covers our minimum call-out fee for 2 workers. It is deducted from your final bill.',
    materialQ: 'How are material costs calculated?',
    materialA: 'Materials are purchased at market price and billed separately after on-site inspection.',
    timeQ: 'How quickly can you come?',
    timeA: 'We typically arrive within 24-48 hours. For emergencies, contact us directly on WhatsApp.',
    guaranteeQ: 'Do you guarantee your work?',
    guaranteeA: '30-day workmanship guarantee on all completed repairs.',
    range: 'to',
    thb: '฿',
  },
  zh: {
    title: '维修 & 小型建筑工程服务',
    subtitle: '上传照片 → AI分析 → 即时报价 → 在线预约',
    tagline: '专业团队 · 苏梅岛全岛服务 · 每天 8:00–24:00',
    step1: '上传照片',
    step2: 'AI 分析',
    step3: '预约成功',
    uploadLabel: '上传问题照片（最多5张，多角度更佳）',
    uploadHint: 'JPG · PNG · WebP · 最多5张',
    analyze: 'AI 智能分析',
    analyzing: '分析中...（约需15-20秒）',
    analysisTitle: 'AI 评估报告',
    problem: '发现问题',
    category: '服务类型',
    workers: '所需工种',
    laborFee: '人工费',
    materialFee: '材料费（预估）',
    totalFee: '预估总费用',
    timeline: '预估工期',
    urgency: '紧急程度',
    minFee: `最低工时费：฿${MINIMUM_LABOR_FEE.toLocaleString()}（2名工人）`,
    deposit: '预约需预付50%人工定金',
    newConstruction: '此项目为新建工程，请联系我们洽谈。',
    contactUs: '联系我们获取报价',
    bookNow: '立即预约',
    formTitle: '填写预约信息',
    name: '姓名',
    phone: '电话号码',
    address: '房屋地址',
    date: '预约日期',
    time: '上门时间',
    morning: '上午（8:00–12:00）',
    afternoon: '下午（13:00–18:00）',
    evening: '晚上（18:00–24:00）',
    notes: '其他备注',
    submit: '确认预约',
    submitting: '提交中...',
    disclaimer: '最终价格以现场确认为准，材料费用另计。',
    trackOrder: '查询订单进度',
    trackPlaceholder: '输入订单号',
    trackBtn: '查询',
    faqTitle: '常见问题',
    whyDeposit: '为什么需要付定金？',
    whyDepositA: '定金用于保障工人出行费用（2人最低消费），最终会从账单中扣除。',
    materialQ: '材料费如何计算？',
    materialA: '材料按市场价采购，现场确认后另行收取，不包含在定金内。',
    timeQ: '多久能上门？',
    timeA: '通常24-48小时内安排上门，紧急情况请直接WhatsApp联系我们。',
    guaranteeQ: '是否有质保？',
    guaranteeA: '所有维修工程提供30天施工质保。',
    range: '至',
    thb: '฿',
  },
  th: {
    title: 'บริการซ่อมแซมและก่อสร้าง',
    subtitle: 'อัปโหลดรูป → AI วิเคราะห์ → ใบเสนอราคา → จองออนไลน์',
    tagline: 'ทีมมืออาชีพ · ให้บริการทั้งเกาะสมุย · เปิด 8 โมง–เที่ยงคืน',
    step1: 'อัปโหลดรูป',
    step2: 'AI วิเคราะห์',
    step3: 'จองสำเร็จ',
    uploadLabel: 'อัปโหลดรูปปัญหา (สูงสุด 10 รูป หลายมุมยิ่งดี)',
    uploadHint: 'JPG · PNG · WebP · สูงสุด 10 รูป',
    analyze: 'วิเคราะห์ด้วย AI',
    analyzing: 'กำลังวิเคราะห์... (ประมาณ 15-20 วินาที)',
    analysisTitle: 'ผลการวิเคราะห์ AI',
    problem: 'ปัญหาที่พบ',
    category: 'ประเภทบริการ',
    workers: 'ช่างที่ต้องการ',
    laborFee: 'ค่าแรง',
    materialFee: 'ค่าวัสดุ (ประมาณ)',
    totalFee: 'ราคาประมาณรวม',
    timeline: 'ระยะเวลา',
    urgency: 'ความเร่งด่วน',
    minFee: `ค่าแรงขั้นต่ำ: ฿${MINIMUM_LABOR_FEE.toLocaleString()} (2 ช่าง)`,
    deposit: 'ต้องชำระมัดจำ 50% ของค่าแรง',
    newConstruction: 'งานนี้เป็นงานก่อสร้างใหม่',
    contactUs: 'ติดต่อเราเพื่อรับใบเสนอราคา',
    bookNow: 'จองเลย',
    formTitle: 'กรอกข้อมูลการจอง',
    name: 'ชื่อ-นามสกุล',
    phone: 'เบอร์โทรศัพท์',
    address: 'ที่อยู่บ้าน',
    date: 'วันที่ต้องการ',
    time: 'ช่วงเวลา',
    morning: 'เช้า (8:00–12:00)',
    afternoon: 'บ่าย (13:00–18:00)',
    evening: 'เย็น (18:00–24:00)',
    notes: 'หมายเหตุเพิ่มเติม',
    submit: 'ยืนยันการจอง',
    submitting: 'กำลังส่ง...',
    disclaimer: 'ราคาสุดท้ายยืนยันที่หน้างาน ค่าวัสดุคิดแยกต่างหาก',
    trackOrder: 'ติดตามคำสั่ง',
    trackPlaceholder: 'กรอกหมายเลขคำสั่ง',
    trackBtn: 'ค้นหา',
    faqTitle: 'คำถามที่พบบ่อย',
    whyDeposit: 'ทำไมต้องชำระมัดจำ?',
    whyDepositA: 'มัดจำครอบคลุมค่าเดินทางขั้นต่ำสำหรับช่าง 2 คน และจะหักออกจากบิลสุดท้าย',
    materialQ: 'ค่าวัสดุคำนวณอย่างไร?',
    materialA: 'วัสดุซื้อตามราคาตลาดและคิดแยกหลังตรวจสอบหน้างาน',
    timeQ: 'ช่างมาเร็วแค่ไหน?',
    timeA: 'โดยทั่วไปภายใน 24-48 ชั่วโมง กรณีเร่งด่วนติดต่อ WhatsApp โดยตรง',
    guaranteeQ: 'มีการรับประกันงานไหม?',
    guaranteeA: 'รับประกันฝีมือ 30 วันสำหรับงานซ่อมทุกชิ้น',
    range: 'ถึง',
    thb: '฿',
  },
}

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
  emergency: { en: 'Emergency ⚠️', zh: '非常紧急 ⚠️', th: 'ฉุกเฉิน ⚠️' },
}

// ─── FAQ Component ────────────────────────────────────────────────────────────

function FAQ({ t, lang }: { t: typeof T['en']; lang: Lang }) {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: t.whyDeposit, a: t.whyDepositA },
    { q: t.materialQ, a: t.materialA },
    { q: t.timeQ, a: t.timeA },
    { q: t.guaranteeQ, a: t.guaranteeA },
  ]
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">❓ {t.faqTitle}</h2>
      </div>
      {faqs.map((f, i) => (
        <div key={i} className="border-b border-gray-50 last:border-0">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full px-6 py-4 text-left flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900 text-sm">{f.q}</span>
            <span className={`text-gray-400 transition-transform shrink-0 ${open === i ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {open === i && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Service Features ─────────────────────────────────────────────────────────

function ServiceFeatures({ lang }: { lang: Lang }) {
  const features = [
    {
      icon: '🤖',
      en: 'AI-Powered Quote', zh: 'AI智能报价', th: 'ใบเสนอราคา AI',
      desc: { en: 'Instant estimate from photos', zh: '照片即时生成报价', th: 'ประเมินราคาจากรูปภาพ' },
    },
    {
      icon: '👷',
      en: 'Min. 2 Workers', zh: '最少2人出行', th: 'ส่งช่างอย่างน้อย 2 คน',
      desc: { en: 'Professional team every visit', zh: '每次专业团队上门', th: 'ทีมมืออาชีพทุกครั้ง' },
    },
    {
      icon: '🕐',
      en: '8am–Midnight', zh: '8:00–24:00', th: '8:00–เที่ยงคืน',
      desc: { en: '7 days a week, Ko Samui', zh: '每周7天，苏梅岛', th: '7 วัน เกาะสมุย' },
    },
    {
      icon: '🛡️',
      en: '30-day Guarantee', zh: '30天质保', th: 'รับประกัน 30 วัน',
      desc: { en: 'Workmanship guarantee', zh: '施工质量保证', th: 'รับประกันฝีมือช่าง' },
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {features.map((f, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <div className="text-3xl mb-2">{f.icon}</div>
          <p className="font-bold text-gray-900 text-sm">{f[lang]}</p>
          <p className="text-xs text-gray-500 mt-0.5">{f.desc[lang]}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Contact Buttons ──────────────────────────────────────────────────────────

function ContactButtons({ lang }: { lang: Lang }) {
  const label = lang === 'zh' ? '有疑问？直接联系我们' : lang === 'th' ? 'มีคำถาม? ติดต่อเราได้เลย' : 'Questions? Contact us directly'
  return (
    <div className="bg-slate-800 rounded-2xl p-5 text-center">
      <p className="text-white/70 text-sm mb-3">{label}</p>
      <div className="flex gap-2 justify-center flex-wrap">
        <a href={`https://wa.me/${COMPANY.wa1}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors">
          📱 WhatsApp
        </a>
        <a href={`https://line.me/ti/p/${COMPANY.line}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors">
          💬 Line
        </a>
      </div>
      <p className="text-white/40 text-xs mt-3">{COMPANY.hours[lang]}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RepairPage() {
  const [lang, setLang] = useState<Lang>('en')
  const t = T[lang]

  // Customer login state
  const [customer, setCustomer] = useState<any | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // Check login status on mount
  useEffect(() => {
    fetch('/api/repair/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.error) setCustomer(d.customer)
        else setShowLoginPrompt(true)
      })
      .catch(() => setShowLoginPrompt(true))
      .finally(() => setAuthChecked(true))
  }, [])

  const [images, setImages] = useState<string[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState({
    name: '', phone: '', address: '',
    date: '', time: 'morning', notes: '', line: '', whatsapp: '',
  })

  // Auto-fill form when customer logs in
  useEffect(() => {
    if (customer) {
      setForm(prev => ({
        ...prev,
        name: customer.name ?? prev.name,
        phone: customer.phone ?? prev.phone,
        address: customer.address ?? prev.address,
        line: customer.line ?? prev.line,
        whatsapp: customer.whatsapp ?? prev.whatsapp,
      }))
    }
  }, [customer])
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [deposit, setDeposit] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 10)
    if (!files.length) return
    setUploading(true)
    const newUrls: string[] = []
    const newPreviews: string[] = []
    for (const file of files) {
      newPreviews.push(URL.createObjectURL(file))
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/admin/api/upload', { method: 'POST', body: fd })
      if (res.ok) { const d = await res.json(); newUrls.push(d.url) }
    }
    setImages(p => [...p, ...newUrls].slice(0, 10))
    setPreviews(p => [...p, ...newPreviews].slice(0, 10))
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImage(i: number) {
    setImages(p => p.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  async function handleAnalyze() {
    if (images.length === 0) return
    setAnalyzing(true)
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch('/api/repair/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images, description, language: lang }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          setAnalysis(data)
          const dep = Math.max(MINIMUM_LABOR_FEE * DEPOSIT_RATE, data.estimated_labor_min * DEPOSIT_RATE)
          setDeposit(dep)
          setStep(2)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        } catch (e: any) {
          if (attempt < 2) await new Promise(r => setTimeout(r, 2000))
          else throw e
        }
      }
    } catch (e: any) {
      alert(lang === 'zh' ? 'AI分析暂时繁忙，请重试' : lang === 'th' ? 'AI ยุ่งอยู่ กรุณาลองใหม่' : 'AI is busy, please try again')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!analysis) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/repair/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, images, description, language: lang,
          ai_analysis: analysis,
          labor_fee: analysis.estimated_labor_min,
          material_fee: analysis.estimated_material_min,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrderId(data.order_id)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e: any) {
      alert('Error: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-xl font-bold tracking-widest text-sky-400">{COMPANY.nameEn}</span>
              <span className="text-white/40 text-xs ml-2">{COMPANY.nameZh}</span>
            </div>
            <div className="flex gap-1">
              {(['en', 'zh', 'th'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${lang === l ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                  {l === 'en' ? 'EN' : l === 'zh' ? '中文' : 'ไทย'}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">🔧 {t.title}</h1>
          <p className="text-white/60 text-sm mb-1">{t.tagline}</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-5">
            {([1, 2, 3] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step > s ? 'bg-emerald-500 text-white' : step === s ? 'bg-sky-500 text-white' : 'bg-white/20 text-white/40'}`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-xs ${step >= s ? 'text-white' : 'text-white/30'}`}>
                  {[t.step1, t.step2, t.step3][i]}
                </span>
                {i < 2 && <div className="w-4 h-px bg-white/20 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── Login Prompt Modal ── */}
        {authChecked && showLoginPrompt && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              {/* Top banner */}
              <div className="bg-gradient-to-br from-slate-900 to-sky-900 px-6 py-6 text-white">
                <div className="text-4xl mb-2">👋</div>
                <h2 className="text-xl font-bold">
                  {lang === 'zh' ? '欢迎使用报修服务' : lang === 'th' ? 'ยินดีต้อนรับ' : 'Welcome!'}
                </h2>
                <p className="text-white/70 text-sm mt-1">
                  {lang === 'zh' ? '登录后可以自动填写信息，查看历史订单' :
                   lang === 'th' ? 'เข้าสู่ระบบเพื่อกรอกข้อมูลอัตโนมัติและดูประวัติ' :
                   'Sign in to auto-fill your details and view order history'}
                </p>
              </div>

              {/* Benefits */}
              <div className="px-6 py-4 space-y-2 border-b border-gray-100">
                {[
                  { icon: '⚡', en: 'Auto-fill your name, phone & address', zh: '自动填写姓名、电话和地址', th: 'กรอกข้อมูลอัตโนมัติ' },
                  { icon: '📋', en: 'View all your order history', zh: '查看所有历史订单', th: 'ดูประวัติคำสั่งทั้งหมด' },
                  { icon: '📧', en: 'Get order updates by email', zh: '邮件接收订单状态更新', th: 'รับการอัปเดตทางอีเมล' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-lg">{b.icon}</span>
                    <span>{b[lang]}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="px-6 py-5 space-y-3">
                <a href={`/repair/login?redirect=/repair`}
                  className="block w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-2xl text-center transition-colors text-sm">
                  {lang === 'zh' ? '📧 邮箱登录 / 注册' :
                   lang === 'th' ? '📧 เข้าสู่ระบบ / สมัครสมาชิก' :
                   '📧 Sign In / Register with Email'}
                </a>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="block w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors text-center">
                  {lang === 'zh' ? '跳过，直接下单 →' :
                   lang === 'th' ? 'ข้ามและสั่งซื้อโดยตรง →' :
                   'Continue without signing in →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Customer greeting (logged in) ── */}
        {authChecked && customer && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">👤</span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  {customer.name ?? customer.email}
                </p>
                <p className="text-xs text-emerald-600">{customer.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="/repair/orders" className="text-xs text-emerald-600 hover:underline">
                {lang === 'zh' ? '我的订单' : lang === 'th' ? 'คำสั่งของฉัน' : 'My Orders'}
              </a>
            </div>
          </div>
        )}

        {/* ── STEP 1: Upload + Describe ── */}
        {step === 1 && (
          <>
            {/* Service features */}
            <ServiceFeatures lang={lang} />

            {/* Upload */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">📸 {t.uploadLabel}</h2>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-sky-300 cursor-pointer transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-sky-500">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {lang === 'zh' ? '上传中...' : lang === 'th' ? 'กำลังอัปโหลด...' : 'Uploading...'}
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600 font-medium text-sm">{t.uploadHint}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {lang === 'zh' ? '点击选择照片' : lang === 'th' ? 'แตะเพื่อเลือกรูป' : 'Tap to select photos'}
                    </p>
                  </>
                )}
              </div>
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {previews.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">
                {lang === 'zh' ? '🔍 描述问题' : lang === 'th' ? '🔍 อธิบายปัญหา' : '🔍 Describe the Problem'}
              </h2>
              <RepairDescriptionForm lang={lang} onChange={(desc) => setDescription(desc)} />
            </div>

            {/* Analyze button */}
            <button onClick={handleAnalyze} disabled={images.length === 0 || analyzing}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2">
              {analyzing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.analyzing}
                </>
              ) : (
                <>🤖 {t.analyze}</>
              )}
            </button>

            {/* FAQ */}
            <FAQ t={t} lang={lang} />

            {/* Contact */}
            <ContactButtons lang={lang} />

            {/* Track order link */}
            <div className="text-center">
              <Link href="/repair/track"
                className="text-sm text-sky-500 hover:underline">
                🔍 {t.trackOrder}
              </Link>
            </div>
          </>
        )}

        {/* ── STEP 2: Analysis Result + Booking Form ── */}
        {step === 2 && analysis && (
          <>
            {analysis.is_new_construction ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">🏗️</div>
                <h2 className="text-xl font-bold text-amber-900 mb-3">{t.newConstruction}</h2>
                <p className="text-amber-700 text-sm mb-5">
                  {lang === 'zh' ? '新建工程需要现场勘察评估，请联系我们预约。' :
                   lang === 'th' ? 'งานก่อสร้างใหม่ต้องตรวจสอบหน้างาน กรุณาติดต่อเรา' :
                   'New construction requires on-site assessment. Please contact us to arrange a visit.'}
                </p>
                <ContactButtons lang={lang} />
              </div>
            ) : (
              <>
                {/* AI Report */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🤖</span>
                    <h2 className="font-bold text-gray-900 text-lg">{t.analysisTitle}</h2>
                  </div>

                  {/* Problem summary */}
                  <div className="bg-sky-50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-sky-500 font-semibold uppercase mb-1">{t.problem}</p>
                    <p className="text-gray-900 font-medium">{analysis.problem_summary}</p>
                  </div>

                  {/* Grid stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">{t.category}</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {CATEGORY_LABELS[analysis.category]?.[lang] ?? analysis.category}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">{t.urgency}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${URGENCY_COLOR[analysis.urgency]}`}>
                        {URGENCY_LABEL[analysis.urgency]?.[lang]}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">{t.workers}</p>
                      <p className="font-semibold text-gray-800 text-sm">{analysis.workers_needed}</p>
                      <p className="text-xs text-gray-500">
                        {lang === 'zh' ? `${Math.max(2, analysis.workers_count ?? 2)} 人` :
                         lang === 'th' ? `${Math.max(2, analysis.workers_count ?? 2)} คน` :
                         `${Math.max(2, analysis.workers_count ?? 2)} workers`}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">{t.timeline}</p>
                      <p className="font-semibold text-gray-800 text-sm">⏱ {analysis.estimated_days}</p>
                    </div>
                  </div>

                  {/* Materials */}
                  {analysis.materials_needed && analysis.materials_needed.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <p className="text-sm font-bold text-amber-900 mb-2">
                        🪵 {lang === 'zh' ? '所需材料清单' : lang === 'th' ? 'รายการวัสดุ' : 'Materials Required'}
                      </p>
                      <div className="space-y-1.5">
                        {analysis.materials_needed.map((mat, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-amber-800 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                              {mat.item}
                            </span>
                            <span className="text-amber-700 font-medium">{mat.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-amber-600 mt-2">
                        {lang === 'zh' ? '⚠️ 材料费现场确认后另计' :
                         lang === 'th' ? '⚠️ ค่าวัสดุคิดแยกหลังตรวจหน้างาน' :
                         '⚠️ Material costs billed separately after on-site inspection'}
                      </p>
                    </div>
                  )}

                  {/* Fee summary */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t.laborFee}</span>
                      <span className="font-semibold">฿{analysis.estimated_labor_min.toLocaleString()} – ฿{analysis.estimated_labor_max.toLocaleString()}</span>
                    </div>
                    {analysis.estimated_material_max > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t.materialFee}</span>
                        <span className="text-gray-700">฿{analysis.estimated_material_min.toLocaleString()} – ฿{analysis.estimated_material_max.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
                      <span>{t.totalFee}</span>
                      <span className="text-sky-600 text-lg">฿{(analysis.estimated_labor_min + analysis.estimated_material_min).toLocaleString()}+</span>
                    </div>
                  </div>

                  {/* Deposit notice */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
                    <span className="text-lg shrink-0">💳</span>
                    <div>
                      <p className="font-semibold text-emerald-800 text-sm">{t.deposit}</p>
                      <p className="text-emerald-700 font-bold mt-0.5">฿{deposit.toLocaleString()}</p>
                      <p className="text-xs text-emerald-500 mt-1">{t.minFee}</p>
                      <p className="text-xs text-emerald-500">
                        {lang === 'zh' ? '🔧 每次最少2名工人出行' :
                         lang === 'th' ? '🔧 ส่งช่างขั้นต่ำ 2 คนทุกครั้ง' :
                         '🔧 Minimum 2 workers per visit'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-4">📋 {t.formTitle}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t.name} *</label>
                        <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t.phone} *</label>
                        <input required value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t.address} *</label>
                      <input required value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))}
                        placeholder={lang === 'zh' ? '苏梅岛具体地址...' : lang === 'th' ? 'ที่อยู่บนเกาะสมุย...' : 'Ko Samui address...'}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t.date} *</label>
                        <input type="date" required value={form.date}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={e => setForm(p => ({...p, date: e.target.value}))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t.time}</label>
                        <select value={form.time} onChange={e => setForm(p => ({...p, time: e.target.value}))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                          <option value="morning">{t.morning}</option>
                          <option value="afternoon">{t.afternoon}</option>
                          <option value="evening">{t.evening}</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp</label>
                        <input value={form.whatsapp} onChange={e => setForm(p => ({...p, whatsapp: e.target.value}))}
                          placeholder="+66..."
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Line ID</label>
                        <input value={form.line} onChange={e => setForm(p => ({...p, line: e.target.value}))}
                          placeholder="line id..."
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t.notes}</label>
                      <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))}
                        rows={2}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-base transition-colors">
                      {submitting ? t.submitting : `✅ ${t.submit}`}
                    </button>
                    <p className="text-xs text-gray-400 text-center">{t.disclaimer}</p>
                  </form>
                </div>

                <ContactButtons lang={lang} />
              </>
            )}
          </>
        )}

        {/* ── STEP 3: Booking Confirmed ── */}
        {step === 3 && orderId && (
          <>
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {lang === 'zh' ? '预约成功！' : lang === 'th' ? 'จองสำเร็จ!' : 'Booking Confirmed!'}
              </h2>
              <p className="text-gray-500 text-sm mb-1">
                {lang === 'zh' ? '请保存您的订单号' : lang === 'th' ? 'กรุณาบันทึกหมายเลขคำสั่ง' : 'Please save your Order ID'}
              </p>
              <div className="bg-sky-50 border border-sky-200 rounded-xl px-6 py-3 inline-block mb-6">
                <p className="font-mono font-bold text-sky-700 text-lg">{orderId}</p>
              </div>

              {/* Next steps */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left mb-5">
                <h3 className="font-bold text-amber-900 mb-3">
                  {lang === 'zh' ? '📋 接下来的步骤' : lang === 'th' ? '📋 ขั้นตอนต่อไป' : '📋 Next Steps'}
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      n: '1',
                      en: 'Contact us on WhatsApp / Line with your Order ID',
                      zh: '通过 WhatsApp 或 Line 联系我们，告知订单号',
                      th: 'ติดต่อเราผ่าน WhatsApp / Line พร้อมแจ้งหมายเลขคำสั่ง',
                    },
                    {
                      n: '2',
                      en: 'We will confirm your booking and send payment details',
                      zh: '我们确认预约后，发送付款信息给您',
                      th: 'เราจะยืนยันการจองและส่งรายละเอียดการชำระเงิน',
                    },
                    {
                      n: '3',
                      en: `Pay 50% deposit (฿${deposit.toLocaleString()}) to confirm`,
                      zh: `支付50%定金（฿${deposit.toLocaleString()}）确认预约`,
                      th: `ชำระมัดจำ 50% (฿${deposit.toLocaleString()}) เพื่อยืนยัน`,
                    },
                    {
                      n: '4',
                      en: 'Our team arrives on your scheduled date',
                      zh: '我们的团队按预约时间上门',
                      th: 'ทีมงานของเราจะมาตามวันที่นัดหมาย',
                    },
                  ].map(step => (
                    <div key={step.n} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {step.n}
                      </span>
                      <p className="text-sm text-amber-900">{step[lang]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact buttons */}
              <ContactButtons lang={lang} />

              {/* Track order */}
              <div className="mt-4">
                <Link href={`/repair/track?order=${orderId}`}
                  className="text-sm text-sky-500 hover:underline">
                  🔍 {t.trackOrder}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
