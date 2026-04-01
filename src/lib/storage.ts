const KEYS = {
  DIARY_ENTRIES: 'ultraman_diary_entries',
  KNOWN_CHARS: 'ultraman_diary_known_chars',
  VOCAB: 'ultraman_diary_vocab',
  OPENAI_KEY: 'ultraman_diary_openai_key',
  SETTINGS: 'ultraman_diary_settings',
  BOOK_READ_RECORDS: 'ultraman_diary_book_records',
  REWARD_CARDS: 'ultraman_diary_reward_cards',
} as const

const ALL_STORAGE_KEYS = [
  KEYS.DIARY_ENTRIES,
  KEYS.KNOWN_CHARS,
  KEYS.VOCAB,
  KEYS.OPENAI_KEY,
  KEYS.SETTINGS,
  KEYS.BOOK_READ_RECORDS,
  KEYS.REWARD_CARDS,
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
  knownChars: number
  vocabWords: number
  diaryEntries: number
}

export interface SaveFile {
  version: number
  exportedAt: string
  summary: SaveSummary
  data: Record<string, unknown>
}

function buildSummary(): SaveSummary {
  const knownChars = getItem<string[]>(KEYS.KNOWN_CHARS, [])
  const vocab = getItem<unknown[]>(KEYS.VOCAB, [])
  const entries = getItem<unknown[]>(KEYS.DIARY_ENTRIES, [])
  return {
    knownChars: knownChars.length,
    vocabWords: vocab.length,
    diaryEntries: entries.length,
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
