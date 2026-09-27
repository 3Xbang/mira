import type { AIAnalysisResult } from './repair-types'
import { MINIMUM_LABOR_FEE } from './repair-types'

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID ?? '585f661b508466415d6917249a6f3b3c'
const CF_API_TOKEN = process.env.CF_API_TOKEN
const CF_MODEL = '@cf/meta/llama-3.2-11b-vision-instruct'

// ─── Category-specific context prompts ────────────────────────────────────────
// These help AI focus on the right things for each service type

const CATEGORY_CONTEXT: Record<string, string> = {
  plumbing: `FOCUS: This is a PLUMBING job. Look for: pipe damage, water stains, rust, leaks, water pressure issues, drain blockages, toilet/sink problems. Common materials: PVC pipes, fittings, sealant, valves.`,
  electrical: `FOCUS: This is an ELECTRICAL job. Look for: burnt wires, broken sockets, faulty switches, circuit breaker issues, exposed wiring, water damage to electrical components. SAFETY CRITICAL - flag any immediate dangers.`,
  painting: `FOCUS: This is a PAINTING/WALL job. Look for: peeling paint, mold spots, water stains, cracks, surface damage size. Estimate area in square meters carefully.`,
  flooring: `FOCUS: This is a FLOORING job. Look for: cracked tiles, loose tiles, water damage, scratches, missing grout. Count damaged tiles and estimate total area affected.`,
  carpentry: `FOCUS: This is a CARPENTRY job. Look for: door/window alignment, broken hinges, damaged frames, rot, swelling from moisture, lock/handle damage.`,
  aircon: `FOCUS: This is an AIR CONDITIONING job. Look for: water leaking from unit, ice buildup, dirty filters, strange noise signs, refrigerant leak stains, unit brand/model if visible.`,
  roofing: `FOCUS: This is a ROOFING job. Look for: missing/broken tiles, rust on metal roof, water damage patterns, blocked gutters, visible gaps or holes.`,
  construction: `FOCUS: This is a CONSTRUCTION/RENOVATION job. Assess scope carefully - is it minor renovation or major structural work? If new building construction, set is_new_construction: true.`,
  general: `FOCUS: Identify the main problem type first, then apply appropriate analysis.`,
}

// ─── Single image analysis prompt ─────────────────────────────────────────────

function buildPrompt(
  imageIndex: number,
  totalImages: number,
  userDescription: string,
  category: string,
  guidedAnswers: string,
  language: string
): string {
  const categoryCtx = CATEGORY_CONTEXT[category] ?? CATEGORY_CONTEXT.general

  return `You are a professional home repair estimator for Homeland Corporation Co.,Ltd in Ko Samui, Thailand.

CONTEXT FROM CUSTOMER:
- Service type selected: ${category}
- ${guidedAnswers ? `Customer answered these questions: ${guidedAnswers}` : ''}
- ${userDescription ? `Customer description (${language}): "${userDescription}"` : 'No additional description provided.'}
- This is image ${imageIndex} of ${totalImages} total images.

${categoryCtx}

PRICING REFERENCE (Ko Samui 2025-2026, THB all-in):
PLUMBING: PVC pipe 1/2"=15/m, 2"=45/m, 4"=450/m | Toilet=3,600 | Sink=2,700 | Shower=950
ELECTRICAL: Panel=9,000 | Switch=400 | Outlet=450 | Full room wiring=25,000/lot
PAINTING: Interior=100/sqm | Exterior=110/sqm | Ceiling=120/sqm
TILING: Wall tile=500/sqm | Floor 60x60=950/sqm | Plastering=350/sqm
AIRCON: 18k BTU=37,900 | 24k BTU=41,900 | Cleaning=1,500-2,500/unit
ROOFING: Metal sheet=490/sqm | Gutter repair=300-500/m
DOORS: Standard=3,000-25,000 | Sliding=9,000-12,000

RULES:
- Minimum 2 workers per job, minimum labor fee: ${MINIMUM_LABOR_FEE} THB total
- workers_count MUST be >= 2
- Be specific about what you SEE in this image
- If image is unclear, still provide best estimate based on category

Respond ONLY with valid JSON (no markdown, no other text):
{"problem_summary":"what you see in THIS image specifically","category":"${category}","estimated_labor_min":2000,"estimated_labor_max":5000,"estimated_material_min":0,"estimated_material_max":1000,"estimated_days":"1-2 days","workers_needed":"2 plumbers","workers_count":2,"urgency":"low|medium|high|emergency","is_new_construction":false,"materials_needed":[{"item":"material name","quantity":"amount","unit_price_thb":100}],"internal_diagnosis":"technical details for team - what tools to bring, specific observations","tools_required":["tool1","tool2"],"worker_types":["plumber"],"worker_count_needed":2,"work_steps":["step1","step2","step3"],"risk_notes":"safety issues if any","image_observations":"key observations from this specific image"}`
}

// ─── Analyze single image ─────────────────────────────────────────────────────

async function analyzeOneImage(
  imageUrl: string,
  imageIndex: number,
  totalImages: number,
  userDescription: string,
  category: string,
  guidedAnswers: string,
  language: string
): Promise<AIAnalysisResult | null> {
  if (!CF_API_TOKEN) throw new Error('CF_API_TOKEN not configured')

  // Fetch image and convert to base64
  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) return null
  const imgBuf = await imgRes.arrayBuffer()
  const imgB64 = Buffer.from(imgBuf).toString('base64')

  const prompt = buildPrompt(imageIndex, totalImages, userDescription, category, guidedAnswers, language)
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image: imgB64,
          max_tokens: 800,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw Object.assign(new Error((err as any)?.errors?.[0]?.message ?? `HTTP ${res.status}`), { status: res.status })
      }

      const data = await res.json()
      const text = (data as any)?.result?.response ?? ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')

      const result = JSON.parse(jsonMatch[0]) as AIAnalysisResult & { image_observations?: string }
      return result
    } catch (err: any) {
      if (attempt < 2) await new Promise(r => setTimeout(r, 1500))
      else return null
    }
  }
  return null
}

// ─── Merge multiple image results into one ────────────────────────────────────

function mergeResults(results: (AIAnalysisResult & { image_observations?: string })[]): AIAnalysisResult {
  const valid = results.filter(Boolean)
  if (valid.length === 0) throw new Error('All image analyses failed')

  // Pick the most severe urgency
  const urgencyOrder = ['emergency', 'high', 'medium', 'low']
  const urgency = urgencyOrder.find(u => valid.some(r => r.urgency === u)) as AIAnalysisResult['urgency'] ?? 'medium'

  // Use highest labor estimate (worst case)
  const laborMin = Math.max(MINIMUM_LABOR_FEE, ...valid.map(r => r.estimated_labor_min ?? 0))
  const laborMax = Math.max(laborMin, ...valid.map(r => r.estimated_labor_max ?? 0))

  // Use highest material estimate
  const matMin = Math.max(0, ...valid.map(r => r.estimated_material_min ?? 0))
  const matMax = Math.max(matMin, ...valid.map(r => r.estimated_material_max ?? 0))

  // Max workers needed
  const workersCount = Math.max(2, ...valid.map(r => r.workers_count ?? 2))

  // Merge materials (deduplicate by item name)
  const materialsMap = new Map<string, any>()
  valid.forEach(r => {
    (r.materials_needed ?? []).forEach(m => {
      const key = m.item.toLowerCase()
      if (!materialsMap.has(key)) materialsMap.set(key, m)
    })
  })

  // Merge tools (deduplicate)
  const toolsSet = new Set<string>()
  valid.forEach(r => (r.tools_required ?? []).forEach(t => toolsSet.add(t)))

  // Merge worker types (deduplicate)
  const workersSet = new Set<string>()
  valid.forEach(r => (r.worker_types ?? []).forEach(w => workersSet.add(w)))

  // Build comprehensive problem summary from all images
  const summaries = valid.map((r, i) => {
    const obs = (r as any).image_observations
    return obs ? `Image ${i+1}: ${obs}` : `Image ${i+1}: ${r.problem_summary}`
  }).filter(Boolean)

  // Use first valid result as base, override with merged values
  const base = valid[0]

  // Build comprehensive internal diagnosis
  const diagnoses = valid.map((r, i) => `[Image ${i+1}] ${r.internal_diagnosis}`).join(' | ')

  return {
    ...base,
    problem_summary: base.problem_summary,
    urgency,
    estimated_labor_min: laborMin,
    estimated_labor_max: laborMax,
    estimated_material_min: matMin,
    estimated_material_max: matMax,
    workers_count: workersCount,
    workers_needed: `${workersCount} ${Array.from(workersSet).join('/')}`,
    materials_needed: Array.from(materialsMap.values()),
    tools_required: Array.from(toolsSet),
    worker_types: Array.from(workersSet),
    internal_diagnosis: `${diagnoses} | Images analyzed: ${valid.length}/${results.length}`,
    work_steps: base.work_steps,
    risk_notes: valid.map(r => r.risk_notes).filter(Boolean).join(' | ') || 'None',
  }
}

// ─── Main export: Analyze ALL images ─────────────────────────────────────────

export async function analyzeRepairImages(
  imageUrls: string[],
  userDescription: string,
  language: 'en' | 'zh' | 'th' = 'en',
  category?: string,
  guidedAnswers?: string
): Promise<AIAnalysisResult> {
  if (!imageUrls.length) throw new Error('No images provided')

  const cat = category ?? 'general'
  const answers = guidedAnswers ?? ''
  const total = imageUrls.length

  // Analyze all images in parallel (max 10)
  const analysisPromises = imageUrls.slice(0, 10).map((url, i) =>
    analyzeOneImage(url, i + 1, total, userDescription, cat, answers, language)
  )

  const results = await Promise.all(analysisPromises)
  const validResults = results.filter(Boolean) as AIAnalysisResult[]

  if (validResults.length === 0) throw new Error('Failed to analyze any images')

  const merged = mergeResults(validResults)

  // Enforce minimums
  if (merged.estimated_labor_min < MINIMUM_LABOR_FEE)
    merged.estimated_labor_min = MINIMUM_LABOR_FEE
  if (merged.estimated_labor_max < merged.estimated_labor_min)
    merged.estimated_labor_max = merged.estimated_labor_min
  if ((merged.workers_count ?? 2) < 2)
    merged.workers_count = 2

  return merged
}

// ─── Order ID generator ───────────────────────────────────────────────────────

export function generateOrderId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `MR-${date}-${rand}`
}
