'use client'

import { useState } from 'react'

type Lang = 'en' | 'zh' | 'th'

interface Props {
  lang: Lang
  onSuccess: (customer: any) => void
  onSkip: () => void
}

const T = {
  en: {
    welcomeTitle: 'Welcome!',
    welcomeSubtitle: 'Sign in to auto-fill your details and track orders',
    benefits: [
      '⚡ Auto-fill your name, phone & address',
      '📋 View all your order history',
      '📧 Get order updates by email',
    ],
    signIn: 'Sign In / Register with Email',
    skip: 'Continue without signing in →',
    emailLabel: 'Email Address',
    emailPlaceholder: 'your@email.com',
    continueBtn: 'Continue',
    checking: 'Checking...',
    returningBadge: '👋 Welcome back!',
    newBadge: '🎉 New account',
    codeSent: 'Code sent to',
    codeLabel: 'Verification Code',
    codePlaceholder: '6-digit code',
    verify: 'Sign In',
    verifying: 'Signing in...',
    resend: 'Resend',
    changeEmail: '← Change email',
    nameLabel: 'Your Name',
    phoneLabel: 'Phone',
    namePlaceholder: 'John Smith',
    phonePlaceholder: '+66...',
  },
  zh: {
    welcomeTitle: '欢迎使用！',
    welcomeSubtitle: '登录后自动填写信息，还能查看历史订单',
    benefits: [
      '⚡ 自动填写姓名、电话和地址',
      '📋 查看所有历史订单',
      '📧 邮件接收订单状态更新',
    ],
    signIn: '📧 邮箱登录 / 注册',
    skip: '跳过，直接下单 →',
    emailLabel: '邮箱地址',
    emailPlaceholder: 'your@email.com',
    continueBtn: '继续',
    checking: '检查中...',
    returningBadge: '👋 欢迎回来！',
    newBadge: '🎉 新账号',
    codeSent: '验证码已发送到',
    codeLabel: '验证码',
    codePlaceholder: '6位数字',
    verify: '登录',
    verifying: '登录中...',
    resend: '重新发送',
    changeEmail: '← 更换邮箱',
    nameLabel: '姓名',
    phoneLabel: '电话',
    namePlaceholder: '请输入姓名',
    phonePlaceholder: '+66...',
  },
  th: {
    welcomeTitle: 'ยินดีต้อนรับ!',
    welcomeSubtitle: 'เข้าสู่ระบบเพื่อกรอกข้อมูลอัตโนมัติและดูประวัติ',
    benefits: [
      '⚡ กรอกข้อมูลอัตโนมัติ',
      '📋 ดูประวัติคำสั่งทั้งหมด',
      '📧 รับการอัปเดตทางอีเมล',
    ],
    signIn: '📧 เข้าสู่ระบบ / สมัครสมาชิก',
    skip: 'ดำเนินการโดยไม่เข้าสู่ระบบ →',
    emailLabel: 'อีเมล',
    emailPlaceholder: 'your@email.com',
    continueBtn: 'ดำเนินการต่อ',
    checking: 'กำลังตรวจสอบ...',
    returningBadge: '👋 ยินดีต้อนรับกลับ!',
    newBadge: '🎉 บัญชีใหม่',
    codeSent: 'ส่งรหัสไปที่',
    codeLabel: 'รหัสยืนยัน',
    codePlaceholder: 'รหัส 6 หลัก',
    verify: 'เข้าสู่ระบบ',
    verifying: 'กำลังเข้าสู่ระบบ...',
    resend: 'ส่งอีกครั้ง',
    changeEmail: '← เปลี่ยนอีเมล',
    nameLabel: 'ชื่อ',
    phoneLabel: 'เบอร์โทร',
    namePlaceholder: 'ชื่อ-นามสกุล',
    phonePlaceholder: '+66...',
  },
}

export default function LoginModal({ lang, onSuccess, onSkip }: Props) {
  const t = T[lang]

  const [view, setView] = useState<'welcome' | 'email' | 'code'>('welcome')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isReturning, setIsReturning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')

  async function handleContinue() {
    if (!email.includes('@')) return
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
      setView('code')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (code.length !== 6) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/repair/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), code, name, phone }),
      })
      if (!res.ok) {
        setError(lang === 'zh' ? '验证码错误或已过期' : lang === 'th' ? 'รหัสไม่ถูกต้อง' : 'Invalid or expired code')
        return
      }
      // Fetch customer info
      const meRes = await fetch('/api/repair/auth/me')
      const meData = await meRes.json()
      onSuccess(meData.customer ?? { email: email.toLowerCase() })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true); setCode(''); setError('')
    await fetch('/api/repair/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), lang }),
    }).finally(() => setResending(false))
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Welcome view */}
        {view === 'welcome' && (
          <>
            <div className="bg-gradient-to-br from-slate-900 to-sky-900 px-6 py-6 text-white">
              <div className="text-3xl mb-2">👋</div>
              <h2 className="text-xl font-bold">{t.welcomeTitle}</h2>
              <p className="text-white/70 text-sm mt-1">{t.welcomeSubtitle}</p>
            </div>
            <div className="px-6 py-4 space-y-2 border-b border-gray-100">
              {t.benefits.map((b, i) => (
                <p key={i} className="text-sm text-gray-700">{b}</p>
              ))}
            </div>
            <div className="px-6 py-5 space-y-3">
              <button
                onClick={() => setView('email')}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
              >
                {t.signIn}
              </button>
              <button
                onClick={onSkip}
                className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
              >
                {t.skip}
              </button>
            </div>
          </>
        )}

        {/* Email input view */}
        {view === 'email' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setView('welcome')} className="text-gray-400 hover:text-gray-600">←</button>
              <h2 className="font-bold text-gray-900">{t.emailLabel}</h2>
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleContinue()}
              placeholder={t.emailPlaceholder}
              autoFocus
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleContinue}
              disabled={loading || !email.includes('@')}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? t.checking : t.continueBtn}
            </button>
            <button onClick={onSkip} className="w-full text-gray-400 text-xs py-1 hover:text-gray-600">
              {t.skip}
            </button>
          </div>
        )}

        {/* OTP view */}
        {view === 'code' && (
          <div className="p-6 space-y-4">
            {/* Status badge */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isReturning ? 'bg-sky-50 border border-sky-200' : 'bg-emerald-50 border border-emerald-200'}`}>
              <span className="text-xl">{isReturning ? '👋' : '🎉'}</span>
              <div>
                <p className={`text-sm font-semibold ${isReturning ? 'text-sky-800' : 'text-emerald-800'}`}>
                  {isReturning ? t.returningBadge : t.newBadge}
                </p>
                <p className={`text-xs ${isReturning ? 'text-sky-600' : 'text-emerald-600'}`}>
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

            {/* New customer: name + phone */}
            {!isReturning && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t.nameLabel}</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder={t.namePlaceholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t.phoneLabel}</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t.phonePlaceholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {loading ? t.verifying : `✅ ${t.verify}`}
            </button>

            <div className="flex justify-between text-sm pt-1">
              <button onClick={() => { setView('email'); setCode(''); setError('') }}
                className="text-gray-400 hover:text-gray-600">{t.changeEmail}</button>
              <button onClick={handleResend} disabled={resending}
                className="text-sky-500 hover:text-sky-700">{resending ? '...' : t.resend}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
