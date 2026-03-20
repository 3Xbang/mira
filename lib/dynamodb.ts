import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import type { Property } from './properties'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const docClient = DynamoDBDocumentClient.from(client)

const TABLE = process.env.DYNAMODB_TABLE ?? 'mira-properties'

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
