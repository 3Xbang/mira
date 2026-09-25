import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { saveProject } from '@/lib/db'
import { translateFromZh, mergeTranslations } from '@/lib/translate'

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    if (!body.id?.trim()) return NextResponse.json({ error: 'ID 不能为空' }, { status: 400 })
    if (!body.name?.zh?.trim()) return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 })

    // Auto-translate Chinese fields into all languages
    const [nameTrans, taglineTrans, descTrans] = await Promise.all([
      translateFromZh(body.name.zh),
      body.tagline?.zh ? translateFromZh(body.tagline.zh) : Promise.resolve({}),
      body.description?.zh ? translateFromZh(body.description.zh) : Promise.resolve({}),
    ])

    const project = {
      ...body,
      name: mergeTranslations(body.name, nameTrans),
      tagline: mergeTranslations(body.tagline, taglineTrans),
      description: mergeTranslations(body.description, descTrans),
    }

    await saveProject(project)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('save project error:', e)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
