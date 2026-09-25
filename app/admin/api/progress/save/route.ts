import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { saveProgress } from '@/lib/db'
import { translateFromZh, mergeTranslations } from '@/lib/translate'

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()

    const [titleTrans, descTrans] = await Promise.all([
      body.title?.zh ? translateFromZh(body.title.zh) : Promise.resolve({}),
      body.description?.zh ? translateFromZh(body.description.zh) : Promise.resolve({}),
    ])

    const update = {
      ...body,
      title: mergeTranslations(body.title, titleTrans),
      description: mergeTranslations(body.description, descTrans),
    }

    await saveProgress(update)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('save progress error:', e)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
