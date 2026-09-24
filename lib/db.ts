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

// ─── Project Summary (auto-aggregated from floor plans) ──────────────────────

export interface ProjectSummary {
  price_min?: number          // lowest price across all floor plans
  price_max?: number          // highest price across all floor plans
  total_units: number         // sum of available_units
  delivery_earliest?: string  // earliest delivery date
  delivery_latest?: string    // latest delivery date
  all_images: string[]        // merged: project gallery + all floor plan images
  floor_plan_count: number
}

export async function getProjectSummary(
  projectId: string,
  projectGallery: string[] = []
): Promise<ProjectSummary> {
  const plans = await getFloorPlansByProject(projectId).catch(() => [])

  let price_min: number | undefined
  let price_max: number | undefined
  let total_units = 0
  let delivery_earliest: string | undefined
  let delivery_latest: string | undefined
  const planImages: string[] = []

  for (const p of plans) {
    // Price range
    const lo = p.price_min_thb ?? p.price_thb
    const hi = p.price_max_thb ?? p.price_thb
    if (lo) price_min = price_min === undefined ? lo : Math.min(price_min, lo)
    if (hi) price_max = price_max === undefined ? hi : Math.max(price_max, hi)

    // Units
    total_units += p.available_units ?? 0

    // Delivery dates (sort lexicographically — "2026-Q4" < "2027-Q2" works fine)
    if (p.delivery_date) {
      if (!delivery_earliest || p.delivery_date < delivery_earliest) delivery_earliest = p.delivery_date
      if (!delivery_latest || p.delivery_date > delivery_latest) delivery_latest = p.delivery_date
    }

    // Images: collect floor plan images + preview images per plan
    for (const img of p.floor_plan_images ?? []) if (img) planImages.push(img)
    for (const img of p.preview_images ?? []) if (img) planImages.push(img)
    // legacy single-image fields
    if ((p as any).floor_plan_image) planImages.push((p as any).floor_plan_image)
    if ((p as any).preview_image) planImages.push((p as any).preview_image)
  }

  // Merge: project gallery first, then floor plan images (deduplicated)
  const seen = new Set<string>()
  const all_images: string[] = []
  for (const img of [...projectGallery, ...planImages]) {
    if (img && !seen.has(img)) { seen.add(img); all_images.push(img) }
  }

  return {
    price_min,
    price_max,
    total_units,
    delivery_earliest,
    delivery_latest,
    all_images,
    floor_plan_count: plans.length,
  }
}
