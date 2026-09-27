import { NextRequest, NextResponse } from 'next/server'
import { saveOTP, getCustomerByEmail } from '@/lib/db'
import { generateOTP, sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, lang = 'en' } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const emailLower = email.toLowerCase()

    // Check if returning customer (already registered)
    const existing = await getCustomerByEmail(emailLower).catch(() => null)
    const isReturning = !!existing

    // Always send OTP for security — but tell client if returning
    const otp = generateOTP()
    await saveOTP(emailLower, otp)
    await sendOTPEmail(email, otp, lang)

    return NextResponse.json({ ok: true, isReturning })
  } catch (e: any) {
    console.error('Send OTP error:', e)
    return NextResponse.json({ error: e.message ?? 'Failed to send OTP' }, { status: 500 })
  }
}
