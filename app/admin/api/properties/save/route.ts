import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { putPropertyToDB } from '@/lib/dynamodb'

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Basic validation
    if (!body.id?.trim()) return NextResponse.json({ error: 'ID 不能为空' }, { status: 400 })
    if (!body.title?.trim()) return NextResponse.json({ error: '标题不能为空' }, { status: 400 })

    const property = {
      id: String(body.id).trim(),
      title: String(body.title).trim(),
      type: body.type ?? 'new',
      price: Number(body.price) || 0,
      currency: body.currency ?? 'USD',
      area_sqm: Number(body.area_sqm) || 0,
      land_sqm: Number(body.land_sqm) || 0,
      bedrooms: Number(body.bedrooms) || 0,
      bathrooms: Number(body.bathrooms) || 0,
      location: String(body.location ?? '').trim(),
      description: String(body.description ?? '').trim(),
      featured: Boolean(body.featured),
      images: Array.isArray(body.images) ? body.images : [],
      ...(body.panorama_url ? { panorama_url: body.panorama_url } : {}),
    }

    await putPropertyToDB(property)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Save property error:', e)
    return NextResponse.json({ error: '保存失败，请重试' }, { status: 500 })
  }
}
