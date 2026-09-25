import type { AIAnalysisResult } from './repair-types'
import { MINIMUM_LABOR_FEE } from './repair-types'

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID ?? '585f661b508466415d6917249a6f3b3c'
const CF_API_TOKEN = process.env.CF_API_TOKEN
const CF_MODEL = '@cf/llava-1.5-7b-hf'

const SYSTEM_PROMPT = `You are an expert Thai home repair and construction estimator in Ko Samui, Thailand.
Analyze the image and return ONLY valid JSON (no other text):
{
  "problem_summary": "Brief English description",
  "category": "plumbing|electrical|painting|flooring|carpentry|aircon|roofing|general|construction",
  "estimated_labor_min": 2000,
  "estimated_labor_max": 5000,
  "estimated_material_min": 0,
  "estimated_material_max": 1000,
  "estimated_days": "1-2 days",
  "workers_needed": "1 plumber",
  "urgency": "low|medium|high|emergency",
  "is_new_construction": false,
  "internal_diagnosis": "Detailed diagnosis for our team",
  "tools_required": ["tool1", "tool2"],
  "worker_types": ["plumber"],
  "work_steps": ["Step 1", "Step 2"],
  "risk_notes": "Safety notes"
}
Rules: minimum labor fee ${MINIMUM_LABOR_FEE} THB, use Ko Samui market prices.`

export async function analyzeRepairImages(
  imageUrls: string[],
  userDescription: string,
  language: 'en' | 'zh' | 'th' = 'en'
): Promise<AIAnalysisResult> {
  if (!CF_API_TOKEN) throw new Error('CF_API_TOKEN not configured')

  // Fetch first image and convert to base64
  const imageUrl = imageUrls[0]
  if (!imageUrl) throw new Error('No image provided')

  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error('Failed to fetch image')
  const imgBuf = await imgRes.arrayBuffer()
  const imgB64 = Buffer.from(imgBuf).toString('base64')

  const userNote = userDescription
    ? `Customer says (${language}): "${userDescription}". `
    : ''

  const prompt = `${userNote}${SYSTEM_PROMPT}`

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`

  let lastError: Error = new Error('Analysis failed')

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: Array.from(new Uint8Array(imgBuf)),
          prompt,
          max_tokens: 1024,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = (err as any)?.errors?.[0]?.message ?? `HTTP ${res.status}`
        throw Object.assign(new Error(msg), { status: res.status })
      }

      const data = await res.json()
      const text = (data as any)?.result?.response ?? ''

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response: ' + text.slice(0, 100))

      const result = JSON.parse(jsonMatch[0]) as AIAnalysisResult

      if (result.estimated_labor_min < MINIMUM_LABOR_FEE)
        result.estimated_labor_min = MINIMUM_LABOR_FEE
      if (result.estimated_labor_max < result.estimated_labor_min)
        result.estimated_labor_max = result.estimated_labor_min

      return result
    } catch (err: any) {
      lastError = err
      if (attempt < 3) await new Promise(r => setTimeout(r, 1500))
    }
  }

  throw lastError
}

export function generateOrderId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `MR-${date}-${rand}`
}
