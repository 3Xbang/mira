import type { AIAnalysisResult } from './repair-types'
import { MINIMUM_LABOR_FEE } from './repair-types'

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY
const SILICONFLOW_URL = 'https://api.siliconflow.cn/v1/chat/completions'

// Vision-capable models on SiliconFlow, in priority order
const VISION_MODELS = [
  'deepseek-ai/DeepSeek-V4.1-Flash',
  'Qwen/Qwen2.5-VL-72B-Instruct',
  'Qwen/Qwen2-VL-72B-Instruct',
  'Pro/Qwen/Qwen2-VL-7B-Instruct',
]

const SYSTEM_PROMPT = `You are an expert Thai home repair and construction estimator based in Ko Samui, Thailand.
Analyze the provided images and return a JSON assessment.

Rules:
- Minimum labor fee is ${MINIMUM_LABOR_FEE} THB
- If this is new building construction (not repair/renovation), set is_new_construction: true
- Use realistic Ko Samui market prices (THB)
- estimated_days format: "1 day" / "2-3 days" / "1 week"
- worker_types examples: ["plumber"], ["electrician"], ["painter", "plasterer"]

Respond ONLY with valid JSON, no other text:
{
  "problem_summary": "Brief description in English",
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
  if (!SILICONFLOW_API_KEY) throw new Error('SILICONFLOW_API_KEY not configured')

  const userNote = userDescription
    ? `Customer description (${language}): "${userDescription}"`
    : 'Please analyze the images carefully.'

  // Build content array with images (OpenAI format)
  const imageContent = imageUrls.slice(0, 5).map(url => ({
    type: 'image_url',
    image_url: { url, detail: 'high' },
  }))

  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: [
        ...imageContent,
        { type: 'text', text: userNote },
      ],
    },
  ]

  let lastError: Error = new Error('All models failed')

  for (const model of VISION_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(SILICONFLOW_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
            max_tokens: 1024,
            stream: false,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          const code = (err as any)?.error?.code ?? res.status
          const msg = (err as any)?.error?.message ?? 'API error'
          const e = Object.assign(new Error(msg), { status: res.status, code })
          throw e
        }

        const data = await res.json()
        const text = data.choices?.[0]?.message?.content ?? ''

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON in response')

        const result = JSON.parse(jsonMatch[0]) as AIAnalysisResult

        // Enforce minimum
        if (result.estimated_labor_min < MINIMUM_LABOR_FEE)
          result.estimated_labor_min = MINIMUM_LABOR_FEE
        if (result.estimated_labor_max < result.estimated_labor_min)
          result.estimated_labor_max = result.estimated_labor_min

        return result
      } catch (err: any) {
        lastError = err
        const status = err.status ?? 0
        // 429 = rate limit or 503 = busy → retry
        if (status === 429 || status === 503) {
          if (attempt < 2) await new Promise(r => setTimeout(r, 2000))
          continue
        }
        // 400/404 on this model → try next
        if (status === 400 || status === 404) break
        // Other errors → throw immediately
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
