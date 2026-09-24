import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { deleteFloorPlan } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { await deleteFloorPlan(params.id); return NextResponse.json({ ok: true }) }
  catch { return NextResponse.json({ error: '删除失败' }, { status: 500 }) }
}
