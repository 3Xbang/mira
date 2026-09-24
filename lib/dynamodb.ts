import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import type { Property } from './properties'

const credentials =
  process.env.MIRA_ACCESS_KEY_ID && process.env.MIRA_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.MIRA_ACCESS_KEY_ID,
        secretAccessKey: process.env.MIRA_SECRET_ACCESS_KEY,
      }
    : undefined

const client = new DynamoDBClient({
  region: process.env.MIRA_AWS_REGION ?? process.env.MIRA_REGION ?? 'us-east-1',
  ...(credentials ? { credentials } : {}),
})

const docClient = DynamoDBDocumentClient.from(client)

const TABLE = process.env.MIRA_DYNAMODB_TABLE ?? 'mira-properties'

// ─── READ ────────────────────────────────────────────────────────────────────

export async function getAllPropertiesFromDB(): Promise<Property[]> {
  const result = await docClient.send(new ScanCommand({ TableName: TABLE }))
  return (result.Items ?? []) as Property[]
}

export async function getPropertyByIdFromDB(id: string): Promise<Property | undefined> {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLE, Key: { id } })
  )
  return result.Item as Property | undefined
}

export async function getFeaturedPropertiesFromDB(): Promise<Property[]> {
  const all = await getAllPropertiesFromDB()
  return all.filter((p) => p.featured === true)
}

// ─── WRITE ───────────────────────────────────────────────────────────────────

export async function putPropertyToDB(property: Property): Promise<void> {
  await docClient.send(
    new PutCommand({ TableName: TABLE, Item: property })
  )
}

export async function updatePropertyInDB(
  id: string,
  fields: Partial<Omit<Property, 'id'>>
): Promise<void> {
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return

  const UpdateExpression =
    'SET ' + entries.map(([k], i) => `#f${i} = :v${i}`).join(', ')
  const ExpressionAttributeNames = Object.fromEntries(
    entries.map(([k], i) => [`#f${i}`, k])
  )
  const ExpressionAttributeValues = Object.fromEntries(
    entries.map(([, v], i) => [`:v${i}`, v])
  )

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    })
  )
}

export async function deletePropertyFromDB(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: TABLE, Key: { id } })
  )
}
