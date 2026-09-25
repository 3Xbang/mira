/**
 * Google Cloud Translation API v2
 * Translates Chinese text into all supported locales.
 */

const TARGET_LOCALES = ['en', 'ru', 'fr', 'de', 'es', 'it'] as const
type TargetLocale = (typeof TARGET_LOCALES)[number]

/** Translate a single string from Chinese to one target language */
async function translateOne(text: string, target: TargetLocale): Promise<string> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!key) throw new Error('GOOGLE_TRANSLATE_API_KEY not set')

  const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: 'zh', target, format: 'text' }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Translation failed (${target}): ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  return data.data?.translations?.[0]?.translatedText ?? text
}

/**
 * Translate Chinese text into all 6 target languages in parallel.
 * Returns a MultiLangText object including the original Chinese.
 */
export async function translateFromZh(zhText: string): Promise<Record<string, string>> {
  if (!zhText?.trim()) return { zh: zhText }

  const results = await Promise.allSettled(
    TARGET_LOCALES.map(async (locale) => ({
      locale,
      text: await translateOne(zhText, locale),
    }))
  )

  const translated: Record<string, string> = { zh: zhText }
  for (const result of results) {
    if (result.status === 'fulfilled') {
      translated[result.value.locale] = result.value.text
    }
  }

  return translated
}

/**
 * Merge new translations with existing ones.
 * Existing non-zh translations are preserved if translation fails.
 * zh is always overwritten with the new Chinese text.
 */
export function mergeTranslations(
  existing: Record<string, string> | undefined,
  fresh: Record<string, string>
): Record<string, string> {
  return { ...(existing ?? {}), ...fresh }
}
