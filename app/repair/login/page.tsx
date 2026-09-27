'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Lang = 'en' | 'zh' | 'th'

const T = {
  en: {
    title: 'Sign In / Register',
    subtitle: 'Use your email to track orders and auto-fill your details',
    emailLabel: 'Email Address',
    emailPlaceholder: 'your@email.com',
    sendCode: 'Send Verification Code',
    sending: 'Sending...',
    codeLabel: 'Verification Code',
    codePlaceholder: '6-digit code from your email',
    verify: 'Verify & Sign In',
    verifying: 'Verifying...',
    codeSent: 'Code sent! Check your inbox',
    nameLabel: 'Your Name (optional)',
    phoneLabel: 'Phone Number (optional)',
    skip: 'Continue without signing in',
    backToRepair: '← Back to Repair',
    alreadyLoggedIn: "You're signed in as",
    viewOrders: 'View My Orders',
    signOut: 'Sign Out',
    benefits: ['Auto-fill your details next time', 'View all your order history', 'Get status updates by email'],
  },
  zh: {
    title: '登录 / 注册',
    subtitle: '用邮箱登录，下次自动填写信息，还能查看历史订单',
    emailLabel: '邮箱地址',
    emailPlaceholder: 'your@email.com',
    sendCode: '发送验证码',
    sending: '发送中...',
    codeLabel: '验证码',
    codePlaceholder: '邮箱收到的6位数字',
    verify: '验证并登录',
    verifying: '验证中...',
    codeSent: '验证码已发送，请查收邮件',
    nameLabel: '您的姓名（可选）',
    phoneLabel: '电话号码（可选）',
    skip: '不登录，直接下单',
    backToRepair: '← 返回报修页面',
    alreadyLoggedIn: '已登录账号',
    viewOrders: '查看我的订单',
    signOut: '退出登录',
    benefits: ['下次自动填写信息', '查看所有历史订单', '通过邮件接收订单状态'],
  },
  th: {
    title: 'เข้าสู่ระบบ / สมัครสมาชิก',
    subtitle: 'ใช้อีเมลเข้าสู่ระบบ เพื่อกรอกข้อมูลอัตโนมัติและดูประวัติคำสั่ง',
    emailLabel: 'อีเมล',
    emailPlaceholder: 'your@email.com',
    sendCode: 'ส่งรหัสยืนยัน',
    sending: 'กำลังส่ง...',
    codeLabel: 'รหัสยืนยัน',
    codePlaceholder: 'รหัส 6 หลักจากอีเมล',
    verify: 'ยืนยันและเข้าสู่ระบบ',
    verifying: 'กำลังยืนยัน...',
    codeSent: 'ส่งรหัสแล้ว กรุณาตรวจสอบอีเมล',
    nameLabel: 'ชื่อของคุณ (ไม่บังคับ)',
    phoneLabel: 'เบอร์โทร (ไม่บังคับ)',
    skip: 'สั่งซื้อโดยไม่เข้าสู่ระบบ',
    backToRepair: '← กลับหน้าแจ้งซ่อม',
    alreadyLoggedIn: 'เข้าสู่ระบบแล้ว',
    viewOrders: 'ดูคำสั่งของฉัน',
    signOut: 'ออกจากระบบ',
    benefits: ['กรอกข้อมูลอัตโนมัติครั้งหน้า', 'ดูประวัติคำสั่งทั้งหมด', 'รับการอัปเดตสถานะทางอีเมล'],
  },
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/repair'

  const [lang, setLang] = useState<Lang>('en')
  const t = T[lang]

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSendCode() {
    if (!email.includes('@')) { setError('Please enter a valid email'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/repair/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), lang }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setStep('code')
      setSuccess(t.codeSent)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (code.length !== 6) { setError('Please enter the 6-digit code'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/repair/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), code, name, phone }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      router.push(redirect)
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-900 text-white px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href={redirect} className="text-sky-400 text-sm">{t.backToRepair}</Link>
            <div className="flex gap-1">
              {(['en', 'zh', 'th'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${lang === l ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/70'}`}>
                  {l === 'en' ? 'EN' : l === 'zh' ? '中文' : 'ไทย'}
                </button>
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">👤 {t.title}</h1>
          <p className="text-white/60 text-sm">{t.subtitle}</p>

          {/* Benefits */}
          <div className="mt-4 space-y-1.5">
            {t.benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
                <span className="text-emerald-400">✓</span> {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">

        {/* Login form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {step === 'email' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleSendCode} disabled={loading || !email}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors">
                {loading ? t.sending : t.sendCode}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700">
                ✅ {success || t.codeSent}
                <span className="font-semibold ml-1">{email}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.codeLabel}</label>
                <input type="text" inputMode="numeric" maxLength={6} value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  placeholder={t.codePlaceholder}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono text-center text-2xl tracking-widest" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t.nameLabel}</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="—"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t.phoneLabel}</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="—"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button onClick={handleVerify} disabled={loading || code.length !== 6}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors">
                {loading ? t.verifying : t.verify}
              </button>

              <button onClick={() => { setStep('email'); setCode(''); setError('') }}
                className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors">
                ← {lang === 'zh' ? '重新输入邮箱' : lang === 'th' ? 'กรอกอีเมลใหม่' : 'Change email'}
              </button>
            </div>
          )}
        </div>

        {/* Skip login */}
        <div className="text-center">
          <Link href={redirect} className="text-sm text-gray-400 hover:text-gray-600 underline">
            {t.skip}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>
}
