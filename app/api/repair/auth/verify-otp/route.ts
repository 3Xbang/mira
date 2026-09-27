import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP, getCustomerByEmail, upsertCustomer } from '@/lib/db'

const SESSION_COOKIE = 'homeland_customer'

function signToken(email: string): string {
  const secret = process.env.ADMIN_SECRET ?? 'homeland-secret'
  const payload = `${email}:${Date.now()}`
  const encoder = new TextEncoder()
  const data = encoder.encode(payload + secret)
  let hash = 0
  for (const byte of data) hash = (hash * 31 + byte) >>> 0
  return `${payload}.${hash.toString(36)}`
}

export async function POST(req: NextRequest) {
  try {
    const { email, code, name, phone } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const valid = await verifyOTP(email.toLowerCase(), code)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    // Create or update customer
    const existing = await getCustomerByEmail(email.toLowerCase()).catch(() => undefined)
    await upsertCustomer({
      id: email.toLowerCase(),
      email: email.toLowerCase(),
      name: name ?? existing?.name,
      phone: phone ?? existing?.phone,
    })

    const token = signToken(email.toLowerCase())
    const res = NextResponse.json({ ok: true, email: email.toLowerCase() })
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    return res
  } catch (e: any) {
    console.error('Verify OTP error:', e)
    return NextResponse.json({ error: e.message ?? 'Verification failed' }, { status: 500 })
  }
}
