import { NextRequest, NextResponse } from 'next/server'
import { checkCredentials, createSessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { username = '', password = '' } = body

  // Debug: log what env vars are available (only in server logs, not exposed to client)
  console.log('[login] ADMIN_USERNAME env:', process.env.ADMIN_USERNAME ?? '(not set)')
  console.log('[login] attempt username:', username)

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = createSessionToken(username)
  const res = NextResponse.json({ ok: true })

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return res
}
