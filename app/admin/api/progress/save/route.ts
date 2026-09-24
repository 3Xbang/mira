import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { saveProgress } from '@/lib/db'

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    await saveProgress(body)
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: '保存失败' }, { status: 500 }) }
}
