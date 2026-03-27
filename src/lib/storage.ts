const KEYS = {
  PROGRESS: 'orange_read_progress',
  VOCAB: 'orange_read_vocab',
  CARDS: 'orange_read_cards',
  SETTINGS: 'orange_read_settings',
  KNOWN_CHARS: 'orange_read_known_chars',
} as const

// All localStorage keys used by the app (for export/import)
const ALL_STORAGE_KEYS = [
  'orange_read_progress',
  'orange_read_vocab',
  'orange_read_cards',
  'orange_read_settings',
  'orange_read_known_chars',
  'orange_read_custom_stories',
  'orange_read_milestones',
  'orange_read_streak',
  'orange_read_char_encounters',
  'orange_read_initial_chars_count',
  'orange_read_openai_key',
  'orange_read_last_workshop',
] as const

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export interface SaveSummary {
  cards: number
  stars: number
  knownChars: number
  vocabWords: number
  streak: number
  stories: number
}

export interface SaveFile {
  version: number
  exportedAt: string
  summary: SaveSummary
  data: Record<string, unknown>
}

function buildSummary(): SaveSummary {
  const cards = getItem<Record<string, { unlocked: boolean }>>('orange_read_cards', {})
  const progress = getItem<{ stories: Record<string, { completed: boolean; quizScore: number }>; totalStars: number }>('orange_read_progress', { stories: {}, totalStars: 0 })
  const knownChars = getItem<string[]>('orange_read_known_chars', [])
  const vocab = getItem<unknown[]>('orange_read_vocab', [])
  const streak = getItem<{ currentStreak: number }>('orange_read_streak', { currentStreak: 0 })

  return {
    cards: Object.values(cards).filter(c => c.unlocked).length,
    stars: progress.totalStars,
    knownChars: knownChars.length,
    vocabWords: vocab.length,
    streak: streak.currentStreak,
    stories: Object.values(progress.stories).filter(s => s.completed).length,
  }
}

export function exportAllData(): SaveFile {
  const data: Record<string, unknown> = {}
  for (const key of ALL_STORAGE_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      try { data[key] = JSON.parse(raw) } catch { data[key] = raw }
    }
  }
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    summary: buildSummary(),
    data,
  }
}

export function parseSaveFile(json: string): { ok: true; save: SaveFile } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object') return { ok: false, error: '文件格式错误' }
    if (!parsed.data || typeof parsed.data !== 'object') return { ok: false, error: '存档数据缺失' }
    if (!parsed.summary) return { ok: false, error: '存档摘要缺失' }
    return { ok: true, save: parsed as SaveFile }
  } catch {
    return { ok: false, error: '无法解析文件，请确认是正确的存档文件' }
  }
}

export function importAllData(save: SaveFile): { imported: number } {
  let imported = 0
  for (const [key, value] of Object.entries(save.data)) {
    if (ALL_STORAGE_KEYS.includes(key as typeof ALL_STORAGE_KEYS[number])) {
      localStorage.setItem(key, JSON.stringify(value))
      imported++
    }
  }
  return { imported }
}

export { KEYS, ALL_STORAGE_KEYS }
