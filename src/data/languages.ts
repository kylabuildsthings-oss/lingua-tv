import type { Language, LanguageMeta } from '../types'

export const DEFAULT_LANGUAGES: LanguageMeta[] = [
  { id: 'french', code: 'FR', flag: '🇫🇷', label: 'French' },
  { id: 'mandarin', code: 'CN', flag: '🇨🇳', label: 'Mandarin' },
  { id: 'spanish', code: 'SP', flag: '🇲🇽', label: 'Spanish' },
  { id: 'korean', code: 'KR', flag: '🇰🇷', label: 'Korean' },
  { id: 'portuguese', code: 'BR', flag: '🇧🇷', label: 'Portuguese' },
  { id: 'farsi', code: 'IR', flag: '🇮🇷', label: 'Farsi' },
]

export function mergeLanguages(custom: LanguageMeta[] = []): LanguageMeta[] {
  const seen = new Set(DEFAULT_LANGUAGES.map((item) => item.id))
  const extras = custom.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
  return [...DEFAULT_LANGUAGES, ...extras]
}

export function languageMeta(id: Language, languages: LanguageMeta[]): LanguageMeta {
  return (
    languages.find((item) => item.id === id) ?? {
      id,
      code: id.slice(0, 2).toUpperCase(),
      flag: '🏳️',
      label: id,
    }
  )
}

export function slugifyLanguage(label: string): Language {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'language'
}
