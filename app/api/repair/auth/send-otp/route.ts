import { NextRequest, NextResponse } from 'next/server'
import { saveOTP } from '@/lib/db'
import { generateOTP, sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, lang = 'en' } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const otp = generateOTP()
    await saveOTP(email.toLowerCase(), otp)
    await sendOTPEmail(email, otp, lang)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Send OTP error:', e)
    return NextResponse.json({ error: e.message ?? 'Failed to send OTP' }, { status: 500 })
  }
}
