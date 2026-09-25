import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { saveFloorPlan } from '@/lib/db'
import { translateFromZh, mergeTranslations } from '@/lib/translate'

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()

    const [nameTrans, descTrans] = await Promise.all([
      body.name?.zh ? translateFromZh(body.name.zh) : Promise.resolve({}),
      body.description?.zh ? translateFromZh(body.description.zh) : Promise.resolve({}),
    ])

    const plan = {
      ...body,
      name: mergeTranslations(body.name, nameTrans),
      description: mergeTranslations(body.description, descTrans),
    }

    await saveFloorPlan(plan)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('save floor plan error:', e)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
