import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { generateOrderId } from '@/lib/gemini'
import { MINIMUM_LABOR_FEE, DEPOSIT_RATE } from '@/lib/repair-types'
import type { RepairOrder } from '@/lib/repair-types'

function getDoc() {
  const credentials = process.env.MIRA_ACCESS_KEY_ID && process.env.MIRA_SECRET_ACCESS_KEY
    ? { accessKeyId: process.env.MIRA_ACCESS_KEY_ID, secretAccessKey: process.env.MIRA_SECRET_ACCESS_KEY }
    : undefined
  const client = new DynamoDBClient({
    region: process.env.MIRA_AWS_REGION ?? 'us-east-1',
    ...(credentials ? { credentials } : {}),
  })
  return DynamoDBDocumentClient.from(client)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, phone, address, date, time, notes,
      line, whatsapp, images, description,
      language, ai_analysis, labor_fee, material_fee,
    } = body

    if (!name || !phone || !address || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const labor = Math.max(Number(labor_fee) || 0, MINIMUM_LABOR_FEE)
    const material = Number(material_fee) || 0
    const deposit = Math.ceil(labor * DEPOSIT_RATE)

    const order: RepairOrder = {
      id: generateOrderId(),
      service_type: ai_analysis?.category === 'construction' ? 'construction' : 'repair',
      category: ai_analysis?.category ?? 'general',
      status: 'pending',
      customer_name: name,
      customer_phone: phone,
      customer_line: line || undefined,
      customer_whatsapp: whatsapp || undefined,
      address,
      preferred_date: date,
      preferred_time: time ?? 'morning',
      notes: notes || undefined,
      language: language ?? 'en',
      images: images ?? [],
      ai_analysis: ai_analysis ?? undefined,
      labor_fee: labor,
      material_fee: material,
      total_fee: labor + material,
      deposit_fee: deposit,
      deposit_paid: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const doc = getDoc()
    await doc.send(new PutCommand({
      TableName: process.env.MIRA_TABLE_ORDERS ?? 'mira-repair-orders',
      Item: order,
    }))

    return NextResponse.json({ ok: true, order_id: order.id, deposit_fee: deposit })
  } catch (e: any) {
    console.error('Order error:', e)
    return NextResponse.json({ error: e.message ?? 'Order failed' }, { status: 500 })
  }
}
