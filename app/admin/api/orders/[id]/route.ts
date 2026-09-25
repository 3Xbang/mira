import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

function getDoc() {
  const credentials = process.env.MIRA_ACCESS_KEY_ID && process.env.MIRA_SECRET_ACCESS_KEY
    ? { accessKeyId: process.env.MIRA_ACCESS_KEY_ID, secretAccessKey: process.env.MIRA_SECRET_ACCESS_KEY }
    : undefined
  return DynamoDBDocumentClient.from(new DynamoDBClient({
    region: process.env.MIRA_AWS_REGION ?? 'us-east-1',
    ...(credentials ? { credentials } : {}),
  }))
}

const TABLE = process.env.MIRA_TABLE_ORDERS ?? 'mira-repair-orders'

// GET — fetch single order
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doc = getDoc()
  const res = await doc.send(new GetCommand({ TableName: TABLE, Key: { id: params.id } }))
  if (!res.Item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(res.Item)
}

// PATCH — update order (quote adjustment, status change, admin notes)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const doc = getDoc()

  const entries = Object.entries(body).filter(([k]) => k !== 'id')
  if (entries.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

  const UpdateExpression = 'SET ' + entries.map(([k], i) => `#f${i} = :v${i}`).join(', ') + ', updated_at = :ts'
  const ExpressionAttributeNames = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]))
  const ExpressionAttributeValues = {
    ...Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v])),
    ':ts': new Date().toISOString(),
  }

  await doc.send(new UpdateCommand({
    TableName: TABLE,
    Key: { id: params.id },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  }))

  return NextResponse.json({ ok: true })
}
