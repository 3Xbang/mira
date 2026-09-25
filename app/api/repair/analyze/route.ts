import { NextRequest, NextResponse } from 'next/server'
import { analyzeRepairImages } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { images, description, language } = await req.json()
    if (!images?.length) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }
    const result = await analyzeRepairImages(images, description ?? '', language ?? 'en')
    return NextResponse.json(result)
  } catch (e: any) {
    console.error('Analyze error:', e)
    return NextResponse.json({ error: e.message ?? 'Analysis failed' }, { status: 500 })
  }
}
