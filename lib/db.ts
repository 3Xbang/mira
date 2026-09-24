import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import type { Project, FloorPlan, ProgressUpdate, Material } from './types'

// ─── Lazy client (created on first use, not at module load time) ─────────────

let _doc: DynamoDBDocumentClient | null = null

function getDoc(): DynamoDBDocumentClient {
  if (_doc) return _doc
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
    requestHandler: { requestTimeout: 5000 },
  })
  _doc = DynamoDBDocumentClient.from(client)
  return _doc
}

// ─── Table names ─────────────────────────────────────────────────────────────

const T_PROJECTS   = process.env.MIRA_TABLE_PROJECTS   ?? 'mira-projects'
const T_PLANS      = process.env.MIRA_TABLE_PLANS      ?? 'mira-floor-plans'
const T_PROGRESS   = process.env.MIRA_TABLE_PROGRESS   ?? 'mira-progress'
const T_MATERIALS  = process.env.MIRA_TABLE_MATERIALS  ?? 'mira-materials'

// ─── Helper ──────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString()
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const doc = getDoc()
  const res = await doc.send(new ScanCommand({ TableName: T_PROJECTS }))
  const items = (res.Items ?? []) as Project[]
  return items.sort((a, b) => a.created_at?.localeCompare(b.created_at ?? '') ?? 0)
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const doc = getDoc()
  const res = await doc.send(new GetCommand({ TableName: T_PROJECTS, Key: { id } }))
  return res.Item as Project | undefined
}

export async function saveProject(project: Partial<Project> & { id: string }): Promise<void> {
  const doc = getDoc()
  const ts = now()
  const existing = await getProjectById(project.id).catch(() => undefined)
  await doc.send(new PutCommand({
    TableName: T_PROJECTS,
    Item: {
      created_at: ts,
      ...existing,
      ...project,
      updated_at: ts,
    },
  }))
}

export async function deleteProject(id: string): Promise<void> {
  const doc = getDoc()
  await doc.send(new DeleteCommand({ TableName: T_PROJECTS, Key: { id } }))
}

// ─── Floor Plans ──────────────────────────────────────────────────────────────

export async function getFloorPlansByProject(projectId: string): Promise<FloorPlan[]> {
  const doc = getDoc()
  const res = await doc.send(new ScanCommand({
    TableName: T_PLANS,
    FilterExpression: 'project_id = :pid',
    ExpressionAttributeValues: { ':pid': projectId },
  }))
  const items = (res.Items ?? []) as FloorPlan[]
  return items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

export async function getFloorPlanById(id: string): Promise<FloorPlan | undefined> {
  const doc = getDoc()
  const res = await doc.send(new GetCommand({ TableName: T_PLANS, Key: { id } }))
  return res.Item as FloorPlan | undefined
}

export async function saveFloorPlan(plan: Partial<FloorPlan> & { id: string }): Promise<void> {
  const doc = getDoc()
  const ts = now()
  const existing = await getFloorPlanById(plan.id).catch(() => undefined)
  await doc.send(new PutCommand({
    TableName: T_PLANS,
    Item: { created_at: ts, sort_order: 0, ...existing, ...plan },
  }))
}

export async function deleteFloorPlan(id: string): Promise<void> {
  const doc = getDoc()
  await doc.send(new DeleteCommand({ TableName: T_PLANS, Key: { id } }))
}

// ─── Progress Updates ─────────────────────────────────────────────────────────

export async function getProgressByProject(projectId: string): Promise<ProgressUpdate[]> {
  const doc = getDoc()
  const res = await doc.send(new ScanCommand({
    TableName: T_PROGRESS,
    FilterExpression: 'project_id = :pid',
    ExpressionAttributeValues: { ':pid': projectId },
  }))
  const items = (res.Items ?? []) as ProgressUpdate[]
  return items.sort((a, b) => b.date?.localeCompare(a.date ?? '') ?? 0) // newest first
}

export async function getProgressById(id: string): Promise<ProgressUpdate | undefined> {
  const doc = getDoc()
  const res = await doc.send(new GetCommand({ TableName: T_PROGRESS, Key: { id } }))
  return res.Item as ProgressUpdate | undefined
}

export async function saveProgress(update: Partial<ProgressUpdate> & { id: string }): Promise<void> {
  const doc = getDoc()
  const ts = now()
  const existing = await getProgressById(update.id).catch(() => undefined)
  await doc.send(new PutCommand({
    TableName: T_PROGRESS,
    Item: { created_at: ts, images: [], ...existing, ...update },
  }))
}

export async function deleteProgress(id: string): Promise<void> {
  const doc = getDoc()
  await doc.send(new DeleteCommand({ TableName: T_PROGRESS, Key: { id } }))
}

// ─── Materials ────────────────────────────────────────────────────────────────

export async function getMaterialsByProject(projectId: string): Promise<Material[]> {
  const doc = getDoc()
  const res = await doc.send(new ScanCommand({
    TableName: T_MATERIALS,
    FilterExpression: 'project_id = :pid',
    ExpressionAttributeValues: { ':pid': projectId },
  }))
  const items = (res.Items ?? []) as Material[]
  return items.sort((a, b) => {
    const catCmp = a.category?.localeCompare(b.category ?? '') ?? 0
    if (catCmp !== 0) return catCmp
    return (a.sort_order ?? 0) - (b.sort_order ?? 0)
  })
}

export async function getMaterialById(id: string): Promise<Material | undefined> {
  const doc = getDoc()
  const res = await doc.send(new GetCommand({ TableName: T_MATERIALS, Key: { id } }))
  return res.Item as Material | undefined
}

export async function saveMaterial(material: Partial<Material> & { id: string }): Promise<void> {
  const doc = getDoc()
  const ts = now()
  const existing = await getMaterialById(material.id).catch(() => undefined)
  await doc.send(new PutCommand({
    TableName: T_MATERIALS,
    Item: { created_at: ts, sort_order: 0, ...existing, ...material },
  }))
}

export async function deleteMaterial(id: string): Promise<void> {
  const doc = getDoc()
  await doc.send(new DeleteCommand({ TableName: T_MATERIALS, Key: { id } }))
}
