import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { deletePropertyFromDB } from '@/lib/dynamodb'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deletePropertyFromDB(params.id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Delete property error:', e)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
