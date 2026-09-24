import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      { error: 'Cloudinary 未配置，请在环境变量中设置 CLOUDINARY_CLOUD_NAME 和 CLOUDINARY_UPLOAD_PRESET' },
      { status: 500 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '没有收到文件' }, { status: 400 })
    }

    // Forward to Cloudinary
    const cloudinaryForm = new FormData()
    cloudinaryForm.append('file', file)
    cloudinaryForm.append('upload_preset', uploadPreset)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: cloudinaryForm }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Cloudinary error:', JSON.stringify(err))
      const msg = err?.error?.message ?? '上传到 Cloudinary 失败'
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ url: data.secure_url })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
