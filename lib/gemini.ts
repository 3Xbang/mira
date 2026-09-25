import type { AIAnalysisResult, RepairCategory } from './repair-types'
import { MINIMUM_LABOR_FEE } from './repair-types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent'

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

  // AQ. auth keys use x-goog-api-key header (new format from May 2026)
  // AIzaSy... standard keys use ?key= query param (legacy)
  const isAuthKey = GEMINI_API_KEY.startsWith('AQ.')
  const url = isAuthKey
    ? GEMINI_URL
    : `${GEMINI_URL}?key=${GEMINI_API_KEY}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (isAuthKey) headers['x-goog-api-key'] = GEMINI_API_KEY

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
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
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini API error: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in Gemini response')

  const result = JSON.parse(jsonMatch[0]) as AIAnalysisResult

  // Enforce minimum labor fee
  if (result.estimated_labor_min < MINIMUM_LABOR_FEE) {
    result.estimated_labor_min = MINIMUM_LABOR_FEE
  }
  if (result.estimated_labor_max < result.estimated_labor_min) {
    result.estimated_labor_max = result.estimated_labor_min
  }

  return result
}

/** Generate a unique order ID */
export function generateOrderId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `MR-${date}-${rand}`
}
