import type { AIAnalysisResult } from './repair-types'
import { MINIMUM_LABOR_FEE } from './repair-types'

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID ?? '585f661b508466415d6917249a6f3b3c'
const CF_API_TOKEN = process.env.CF_API_TOKEN
const CF_MODEL = '@cf/meta/llama-3.2-11b-vision-instruct'

const SYSTEM_PROMPT = `You are a professional home repair and construction estimator in Ko Samui, Thailand.
Your company: MIRA Construction Services. Minimum labor fee: ${MINIMUM_LABOR_FEE} THB.

LABOR RATES (Ko Samui market, THB):
- Excavation/Backfill: 120-200 THB/Cu.m labor
- Concrete work: 650 THB/Cu.m labor  
- Steel/Rebar: 8-9 THB/Kg labor
- Formwork: 200 THB/Sq.m labor
- Bricklaying: 200-300 THB/Sq.m labor
- Plastering (exterior): 90 THB/Sq.m labor
- Plastering (interior): 70 THB/Sq.m labor
- Painting (exterior): 35 THB/Sq.m labor
- Painting (interior): 45 THB/Sq.m labor
- Floor/Wall tile installation: 250-280 THB/Sq.m labor
- Ceiling (gypsum): 100-150 THB/Sq.m labor
- Plumbing (pipes): 500-2,000 THB/point labor
- Electrical wiring: 300-800 THB/point labor
- Air conditioning install: 4,500-8,000 THB/unit labor
- General labor: 400-600 THB/hour

COMMON MATERIAL COSTS (THB):
- Cement tiles 60x60: 350-600 THB/Sq.m
- Wall tiles: 300-500 THB/Sq.m
- Paint exterior: 65 THB/Sq.m
- Paint interior: 55 THB/Sq.m
- PVC pipes: 80-200 THB/m
- Plumbing fixtures set: 5,000-15,000 THB/set

ANALYZE the image carefully and identify:
1. What is broken/damaged
2. Location in the property
3. Severity and urgency
4. Required tradespeople
5. Realistic time to fix

Respond ONLY with valid JSON (no markdown, no explanation):
{"problem_summary":"describe the specific problem seen","category":"plumbing|electrical|painting|flooring|carpentry|aircon|roofing|general|construction","estimated_labor_min":2000,"estimated_labor_max":5000,"estimated_material_min":0,"estimated_material_max":1000,"estimated_days":"1 day","workers_needed":"1 plumber","urgency":"low|medium|high|emergency","is_new_construction":false,"internal_diagnosis":"detailed technical diagnosis for our team including what tools and materials are needed","tools_required":["specific tool 1","specific tool 2"],"worker_types":["plumber"],"work_steps":["specific step 1","specific step 2","specific step 3"],"risk_notes":"safety or structural risks"}`

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
          prompt,
          image: imgB64,
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
