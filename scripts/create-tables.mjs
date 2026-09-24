/**
 * Run once to create all DynamoDB tables:
 * node scripts/create-tables.mjs
 */
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'

// Load .env.local manually
import { readFileSync } from 'fs'
try {
  const env = readFileSync('.env.local', 'utf8')
  for (const line of env.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch {}

const client = new DynamoDBClient({
  region: process.env.MIRA_AWS_REGION ?? 'us-east-1',
  // On EC2: uses IAM role automatically (no credentials needed)
  // Locally: reads from env vars
  ...(process.env.MIRA_ACCESS_KEY_ID ? {
    credentials: {
      accessKeyId: process.env.MIRA_ACCESS_KEY_ID,
      secretAccessKey: process.env.MIRA_SECRET_ACCESS_KEY,
    }
  } : {}),
})

const tables = [
  { TableName: 'mira-projects',    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }], AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }] },
  { TableName: 'mira-floor-plans', KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }], AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }] },
  { TableName: 'mira-progress',    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }], AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }] },
  { TableName: 'mira-materials',   KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }], AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }] },
]

for (const table of tables) {
  try {
    await client.send(new DescribeTableCommand({ TableName: table.TableName }))
    console.log(`✓ Already exists: ${table.TableName}`)
  } catch {
    await client.send(new CreateTableCommand({
      ...table,
      BillingMode: 'PAY_PER_REQUEST',
    }))
    console.log(`✅ Created: ${table.TableName}`)
  }
}
console.log('Done!')
