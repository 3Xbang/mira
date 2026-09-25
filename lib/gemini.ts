import type { AIAnalysisResult, RepairCategory } from './repair-types'
import { MINIMUM_LABOR_FEE } from './repair-types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-pro-latest',
]

async function callGemini(model: string, body: object, apiKey: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  const isAuthKey = apiKey.startsWith('AQ.')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (isAuthKey) {
    headers['x-goog-api-key'] = apiKey
  } else {
    Object.assign(headers, { 'x-goog-api-key': apiKey })
  }

  const res = await fetch(isAuthKey ? url : `${url}?key=${apiKey}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const status = (err as any)?.error?.code
    const msg = (err as any)?.error?.message ?? 'Unknown error'
    throw Object.assign(new Error(msg), { status })
  }

  return res.json()
}

const SYSTEM_PROMPT = `You are an expert Thai home repair and construction estimator.
Analyze the provided images and return a JSON object with repair/construction assessment.

Rules:
- Minimum labor fee is ${MINIMUM_LABOR_FEE} THB
- If this appears to be new building construction (not repair/renovation), set is_new_construction: true
- Be realistic with Thai market prices for Ko Samui area
- All fees in THB
- estimated_days format: "1 day" / "2-3 days" / "1 week" etc
- worker_types examples: ["plumber"], ["electrician"], ["painter", "plasterer"]
- tools_required: specific tools needed

Respond ONLY with valid JSON matching this exact structure:
{
  "problem_summary": "Brief description of the issue in English",
  "category": "plumbing|electrical|painting|flooring|carpentry|aircon|roofing|general|construction",
  "estimated_labor_min": 2000,
  "estimated_labor_max": 5000,
  "estimated_material_min": 0,
  "estimated_material_max": 1000,
  "estimated_days": "1-2 days",
  "workers_needed": "1 plumber",
  "urgency": "low|medium|high|emergency",
  "is_new_construction": false,
  "internal_diagnosis": "Detailed internal diagnosis for our team",
  "tools_required": ["wrench", "sealant"],
  "worker_types": ["plumber"],
  "work_steps": ["Step 1", "Step 2"],
  "risk_notes": "Any safety or risk considerations"
}`

export async function analyzeRepairImages(
  imageUrls: string[],
  userDescription: string,
  language: 'en' | 'zh' | 'th' = 'en'
): Promise<AIAnalysisResult> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')

  // Build image parts
  const imageParts = await Promise.all(
    imageUrls.slice(0, 5).map(async (url) => {
      const res = await fetch(url)
      const buf = await res.arrayBuffer()
      const b64 = Buffer.from(buf).toString('base64')
      const mime = res.headers.get('content-type') ?? 'image/jpeg'
      return { inlineData: { data: b64, mimeType: mime } }
    })
  )

  const userNote = userDescription
    ? `Customer description (${language}): "${userDescription}"`
    : 'No additional description provided.'

  const requestBody = {
    contents: [{
      parts: [
        { text: SYSTEM_PROMPT },
        { text: userNote },
        ...imageParts,
      ],
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  }

  // Try each model with retries on 503
  let lastError: Error = new Error('All models failed')
  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const data = await callGemini(model, requestBody, GEMINI_API_KEY)
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON in Gemini response')
        const result = JSON.parse(jsonMatch[0]) as AIAnalysisResult
        // Enforce minimum labor fee
        if (result.estimated_labor_min < MINIMUM_LABOR_FEE) result.estimated_labor_min = MINIMUM_LABOR_FEE
        if (result.estimated_labor_max < result.estimated_labor_min) result.estimated_labor_max = result.estimated_labor_min
        return result
      } catch (err: any) {
        lastError = err
        // 503 = overloaded, retry after short wait
        if (err.status === 503) {
          if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 1500))
          continue
        }
        // 404 = model not available, try next model
        if (err.status === 404) break
        // Other errors, throw immediately
        throw err
      }
    }
  }

  throw lastError
}

/** Generate a unique order ID */
export function generateOrderId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `MR-${date}-${rand}`
}
