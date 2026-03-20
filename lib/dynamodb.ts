import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import type { Property } from './properties'

// On Amplify: uses the service role's IAM permissions automatically
// Locally: reads from MIRA_ACCESS_KEY_ID / MIRA_SECRET_ACCESS_KEY in .env.local
const credentials =
  process.env.MIRA_ACCESS_KEY_ID && process.env.MIRA_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.MIRA_ACCESS_KEY_ID,
        secretAccessKey: process.env.MIRA_SECRET_ACCESS_KEY,
      }
    : undefined

const client = new DynamoDBClient({
  region: process.env.MIRA_REGION ?? 'us-east-1',
  ...(credentials ? { credentials } : {}),
})

const docClient = DynamoDBDocumentClient.from(client)

const TABLE = process.env.MIRA_DYNAMODB_TABLE ?? 'mira-properties'

// Fetch all properties from DynamoDB
export async function getAllPropertiesFromDB(): Promise<Property[]> {
  const result = await docClient.send(new ScanCommand({ TableName: TABLE }))
  return (result.Items ?? []) as Property[]
}

// Fetch a single property by id
export async function getPropertyByIdFromDB(id: string): Promise<Property | undefined> {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLE, Key: { id } })
  )
  return result.Item as Property | undefined
}

// Fetch only featured properties
export async function getFeaturedPropertiesFromDB(): Promise<Property[]> {
  const all = await getAllPropertiesFromDB()
  return all.filter((p) => p.featured === true)
}
