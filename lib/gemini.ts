import type { AIAnalysisResult } from './repair-types'
import { MINIMUM_LABOR_FEE } from './repair-types'

const MINIMUM_WORKERS = 2
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID ?? '585f661b508466415d6917249a6f3b3c'
const CF_API_TOKEN = process.env.CF_API_TOKEN
const CF_MODEL = '@cf/meta/llama-3.2-11b-vision-instruct'

const SYSTEM_PROMPT = `You are a professional home repair and construction estimator in Ko Samui, Thailand.
Your company: MIRA Construction Services.
IMPORTANT RULES:
- Minimum 2 workers per job (minimum call-out fee: ${MINIMUM_LABOR_FEE} THB covers 2 workers)
- Each worker costs 1,000 THB/day minimum
- Always estimate for at least 2 workers: workers_count MUST be >= 2
- For complex jobs requiring specialists, add more workers accordingly

REFERENCE PRICES (Ko Samui market 2025-2026, THB, all-in rates):
STRUCTURE:
- Excavation: 100 THB/Cu.m | Concrete work: 3,200 THB/Cu.m | Formwork: 150 THB/Sq.m
- Rebar DB12/16: 23 THB/kg | Rebar DB20: 23 THB/kg | Round bar RB6/9: 30 THB/kg
- Precast slab: 350 THB/Sq.m | Wire mesh: 30 THB/Sq.m

WALLS & PLASTERING:
- Lightweight block wall: 550 THB/Sq.m | Red brick wall: 650 THB/Sq.m
- Plastering: 350 THB/Sq.m | Cement molding: 300 THB/m

FLOORING & TILING:
- Wall tiles 10x16": 500 THB/Sq.m | Floor tiles 60x60: 950 THB/Sq.m
- Floor tiles 30x30: 500 THB/Sq.m | Grout repair: 150-250 THB/Sq.m

PAINTING & CEILING:
- Interior paint: 100 THB/Sq.m | Exterior paint: 110 THB/Sq.m
- Ceiling paint: 120 THB/Sq.m | Ceiling installation: 450-500 THB/Sq.m

DOORS & WINDOWS:
- Standard door: 3,000-25,000 THB/panel | Sliding door: 9,000-12,000 THB

ELECTRICAL:
- Load center (panel box): 9,000 THB/set | Downlight: 300 THB/set
- Switch: 400 THB | Socket/outlet: 450 THB | Full room wiring: 25,000 THB/lot

PLUMBING:
- PVC 1/2": 15 THB/m | PVC 2": 45 THB/m | PVC 4": 450 THB/m | PVC 6": 650 THB/m
- Septic tank: 7,500 THB | Toilet: 3,600 THB | Sink: 2,700 THB | Shower: 950 THB
- Water heater 150L: 22,500-45,000 THB

ROOFING:
- Metal roof sheet: 490 THB/Sq.m | C-channel steel: 720 THB/piece

AIR CONDITIONING (supply + install):
- 18,000 BTU: 37,900-41,900 THB | 24,000 BTU: 41,900 THB | 60,000 BTU: 89,900 THB
- Air duct work: 3,500 THB/m | Cleaning service: 1,500-2,500 THB/unit

STAIRS: 12,500 THB/unit

ANALYZE the image carefully. Respond ONLY with valid JSON (no markdown, no other text):
{"problem_summary":"specific problem description","category":"plumbing|electrical|painting|flooring|carpentry|aircon|roofing|general|construction","estimated_labor_min":2000,"estimated_labor_max":5000,"estimated_material_min":0,"estimated_material_max":1000,"estimated_days":"1-2 days","workers_needed":"1 plumber","workers_count":1,"urgency":"low|medium|high|emergency","is_new_construction":false,"materials_needed":[{"item":"PVC pipe 4 inch","quantity":"2 meters","unit_price_thb":450},{"item":"PVC fittings","quantity":"4 pcs","unit_price_thb":80}],"internal_diagnosis":"detailed technical diagnosis for team","tools_required":["pipe cutter","wrench","sealant"],"worker_types":["plumber"],"worker_count_needed":1,"work_steps":["step1","step2","step3"],"risk_notes":"any safety risks"}`

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
