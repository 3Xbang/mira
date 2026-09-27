import { NextRequest, NextResponse } from 'next/server'
import { getCustomerByEmail, getOrdersByCustomer } from '@/lib/db'

const SESSION_COOKIE = 'homeland_customer'

function getEmailFromToken(token: string): string | null {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return null
  const payload = token.slice(0, lastDot)
  const email = payload.split(':')[0]
  return email || null
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const email = getEmailFromToken(token)
  if (!email) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  try {
    const customer = await getCustomerByEmail(email)
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

    const orders = await getOrdersByCustomer(email)
    return NextResponse.json({ customer, orders })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
