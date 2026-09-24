import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { saveProject } from '@/lib/db'

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    if (!body.id?.trim()) return NextResponse.json({ error: 'ID 不能为空' }, { status: 400 })
    if (!body.name?.zh?.trim()) return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 })
    await saveProject(body)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('save project error:', e)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
