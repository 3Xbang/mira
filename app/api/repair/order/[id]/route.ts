import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'

function getDoc() {
  const credentials = process.env.MIRA_ACCESS_KEY_ID && process.env.MIRA_SECRET_ACCESS_KEY
    ? { accessKeyId: process.env.MIRA_ACCESS_KEY_ID, secretAccessKey: process.env.MIRA_SECRET_ACCESS_KEY }
    : undefined
  return DynamoDBDocumentClient.from(new DynamoDBClient({
    region: process.env.MIRA_AWS_REGION ?? 'us-east-1',
    ...(credentials ? { credentials } : {}),
  }))
}

// Public — client can fetch their own order by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = getDoc()
    const res = await doc.send(new GetCommand({
      TableName: process.env.MIRA_TABLE_ORDERS ?? 'mira-repair-orders',
      Key: { id: params.id },
    }))
    if (!res.Item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // Return safe fields only (no internal AI diagnosis)
    const { ai_analysis, ...safeOrder } = res.Item as any
    return NextResponse.json({
      ...safeOrder,
      // Only expose customer-facing AI fields
      problem_summary: ai_analysis?.problem_summary,
      estimated_days: ai_analysis?.estimated_days,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
