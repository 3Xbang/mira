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
    continueBtn: 'Continue',
    checking: 'Checking...',
    // Returning customer
    returningTitle: 'Welcome back! 👋',
    returningSubtitle: 'We sent a quick verification code to confirm it\'s you',
    // New customer
    newTitle: 'Create your account',
    newSubtitle: 'Enter the code from your email to get started',
    codeLabel: 'Verification Code',
    codePlaceholder: '6-digit code',
    verify: 'Sign In',
    verifying: 'Signing in...',
    codeSent: 'Code sent to',
    nameLabel: 'Your Name',
    phoneLabel: 'Phone Number',
    namePlaceholder: 'John Smith',
    phonePlaceholder: '+66...',
    skip: 'Continue without signing in',
    backToRepair: '← Back',
    benefits: ['Auto-fill your details next time', 'View all your order history', 'Get status updates by email'],
    resend: 'Resend code',
    changeEmail: '← Change email',
  },
  zh: {
    title: '登录 / 注册',
    subtitle: '用邮箱登录，下次自动填写信息，还能查看历史订单',
    emailLabel: '邮箱地址',
    emailPlaceholder: 'your@email.com',
    continueBtn: '继续',
    checking: '检查中...',
    returningTitle: '欢迎回来！👋',
    returningSubtitle: '我们已向您的邮箱发送验证码，以确认您的身份',
    newTitle: '创建账号',
    newSubtitle: '输入邮箱收到的验证码开始使用',
    codeLabel: '验证码',
    codePlaceholder: '6位数字',
    verify: '登录',
    verifying: '登录中...',
    codeSent: '验证码已发送到',
    nameLabel: '您的姓名',
    phoneLabel: '电话号码',
    namePlaceholder: '请输入姓名',
    phonePlaceholder: '+66...',
    skip: '不登录，直接下单',
    backToRepair: '← 返回',
    benefits: ['下次自动填写信息', '查看所有历史订单', '通过邮件接收订单状态'],
    resend: '重新发送',
    changeEmail: '← 更换邮箱',
  },
  th: {
    title: 'เข้าสู่ระบบ / สมัครสมาชิก',
    subtitle: 'ใช้อีเมลเข้าสู่ระบบเพื่อกรอกข้อมูลอัตโนมัติ',
    emailLabel: 'อีเมล',
    emailPlaceholder: 'your@email.com',
    continueBtn: 'ดำเนินการต่อ',
    checking: 'กำลังตรวจสอบ...',
    returningTitle: 'ยินดีต้อนรับกลับ! 👋',
    returningSubtitle: 'เราส่งรหัสยืนยันไปยังอีเมลของคุณแล้ว',
    newTitle: 'สร้างบัญชีใหม่',
    newSubtitle: 'กรอกรหัสจากอีเมลเพื่อเริ่มใช้งาน',
    codeLabel: 'รหัสยืนยัน',
    codePlaceholder: 'รหัส 6 หลัก',
    verify: 'เข้าสู่ระบบ',
    verifying: 'กำลังเข้าสู่ระบบ...',
    codeSent: 'ส่งรหัสไปที่',
    nameLabel: 'ชื่อของคุณ',
    phoneLabel: 'เบอร์โทร',
    namePlaceholder: 'ชื่อ-นามสกุล',
    phonePlaceholder: '+66...',
    skip: 'ดำเนินการโดยไม่เข้าสู่ระบบ',
    backToRepair: '← กลับ',
    benefits: ['กรอกข้อมูลอัตโนมัติครั้งหน้า', 'ดูประวัติคำสั่งทั้งหมด', 'รับการอัปเดตทางอีเมล'],
    resend: 'ส่งรหัสอีกครั้ง',
    changeEmail: '← เปลี่ยนอีเมล',
  },
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/repair'

  const [lang, setLang] = useState<Lang>('en')
  const t = T[lang]

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [isReturning, setIsReturning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)

  // Step 1: Check email and send OTP
  async function handleContinue() {
    if (!email.includes('@')) {
      setError(lang === 'zh' ? '请输入有效的邮箱地址' : lang === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email')
      return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/repair/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setIsReturning(data.isReturning)
      setStep('code')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  async function handleVerify() {
    if (code.length !== 6) {
      setError(lang === 'zh' ? '请输入6位验证码' : 'Please enter the 6-digit code')
      return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/repair/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), code, name, phone }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      router.push(redirectTo)
      router.refresh()
    } catch (e: any) {
      setError(lang === 'zh' ? '验证码错误或已过期，请重试' : lang === 'th' ? 'รหัสไม่ถูกต้องหรือหมดอายุ' : 'Invalid or expired code, please try again')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  async function handleResend() {
    setResending(true); setCode(''); setError('')
    try {
      await fetch('/api/repair/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), lang }),
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-900 text-white px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-5">
            <Link href={redirectTo} className="text-sky-400 text-sm">{t.backToRepair}</Link>
            <div className="flex gap-1">
              {(['en', 'zh', 'th'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${lang === l ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/70'}`}>
                  {l === 'en' ? 'EN' : l === 'zh' ? '中文' : 'ไทย'}
                </button>
              ))}
            </div>
          </div>

          {step === 'email' ? (
            <>
              <h1 className="text-2xl font-bold mb-1">👤 {t.title}</h1>
              <p className="text-white/60 text-sm">{t.subtitle}</p>
              <div className="mt-4 space-y-1.5">
                {t.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-emerald-400">✓</span> {b}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">
                {isReturning ? t.returningTitle : t.newTitle}
              </h1>
              <p className="text-white/60 text-sm">
                {isReturning ? t.returningSubtitle : t.newSubtitle}
              </p>
              <p className="text-sky-300 text-sm mt-2 font-medium">{email}</p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">

          {/* Step 1: Email */}
          {step === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleContinue()}
                  placeholder={t.emailPlaceholder}
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleContinue}
                disabled={loading || !email}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                {loading ? t.checking : t.continueBtn}
              </button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 'code' && (
            <div className="space-y-4">
              {/* Status badge */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isReturning ? 'bg-sky-50 border border-sky-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                <span className="text-2xl">{isReturning ? '👋' : '🎉'}</span>
                <div>
                  <p className={`text-sm font-semibold ${isReturning ? 'text-sky-800' : 'text-emerald-800'}`}>
                    {isReturning
                      ? (lang === 'zh' ? '老客户，欢迎回来！' : lang === 'th' ? 'ลูกค้าเก่า ยินดีต้อนรับกลับ!' : 'Returning customer!')
                      : (lang === 'zh' ? '新账号，注册中...' : lang === 'th' ? 'บัญชีใหม่' : 'New account')}
                  </p>
                  <p className={`text-xs mt-0.5 ${isReturning ? 'text-sky-600' : 'text-emerald-600'}`}>
                    {t.codeSent} <strong>{email}</strong>
                  </p>
                </div>
              </div>

              {/* OTP input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.codeLabel}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  placeholder={t.codePlaceholder}
                  autoFocus
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl text-center text-3xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              {/* New customer: collect name + phone */}
              {!isReturning && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.nameLabel}</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.phoneLabel}</label>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors text-base"
              >
                {loading ? t.verifying : `✅ ${t.verify}`}
              </button>

              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  onClick={() => { setStep('email'); setCode(''); setError('') }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {t.changeEmail}
                </button>
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sky-500 hover:text-sky-700 transition-colors"
                >
                  {resending ? '...' : t.resend}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href={redirectTo} className="text-sm text-gray-400 hover:text-gray-600 underline">
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
