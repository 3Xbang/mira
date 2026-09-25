import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

function getDoc() {
  const credentials = process.env.MIRA_ACCESS_KEY_ID && process.env.MIRA_SECRET_ACCESS_KEY
    ? { accessKeyId: process.env.MIRA_ACCESS_KEY_ID, secretAccessKey: process.env.MIRA_SECRET_ACCESS_KEY }
    : undefined
  return DynamoDBDocumentClient.from(new DynamoDBClient({
    region: process.env.MIRA_AWS_REGION ?? 'us-east-1',
    ...(credentials ? { credentials } : {}),
  }))
}

export async function POST(req: NextRequest) {
  try {
    const { order_id } = await req.json()
    if (!order_id) return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })

    const doc = getDoc()
    await doc.send(new UpdateCommand({
      TableName: process.env.MIRA_TABLE_ORDERS ?? 'mira-repair-orders',
      Key: { id: order_id },
      UpdateExpression: 'SET customer_confirmed = :t, customer_confirmed_at = :ts, #s = :s, updated_at = :ts',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: {
        ':t': true,
        ':ts': new Date().toISOString(),
        ':s': 'confirmed',
      },
    }))

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
