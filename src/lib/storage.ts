import { theme } from '../config/theme'

const p = theme.storagePrefix

const KEYS = {
  DIARY_ENTRIES: `${p}entries`,
  KNOWN_CHARS: `${p}known_chars`,
  VOCAB: `${p}vocab`,
  OPENAI_KEY: `${p}openai_key`,
  SETTINGS: `${p}settings`,
  BOOK_READ_RECORDS: `${p}book_records`,
  REWARD_CARDS: `${p}reward_cards`,
  DEVICE_ID: `${p}device_id`,
  UNLOCKED: `${p}unlocked`,
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

// --- Auto backup ---
const BACKUP_KEY = `${p}auto_backups`
const MAX_BACKUPS = 3

export interface AutoBackup {
  timestamp: string
  summary: SaveSummary
  data: Record<string, unknown>
}

export function createAutoBackup(): void {
  try {
    const data: Record<string, unknown> = {}
    for (const key of ALL_STORAGE_KEYS) {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        try { data[key] = JSON.parse(raw) } catch { data[key] = raw }
      }
    }
    const backup: AutoBackup = {
      timestamp: new Date().toISOString(),
      summary: buildSummary(),
      data,
    }
    const backups = getItem<AutoBackup[]>(BACKUP_KEY, [])
    backups.unshift(backup)
    if (backups.length > MAX_BACKUPS) backups.length = MAX_BACKUPS
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups))
  } catch {
    // silently fail - backup is best-effort
  }

  // Also save to filesystem (Capacitor) — fire and forget
  import('./fileBackup').then(m => m.autoBackupToFile()).catch(() => {})
}

export function getAutoBackups(): AutoBackup[] {
  return getItem<AutoBackup[]>(BACKUP_KEY, [])
}

export function restoreAutoBackup(backup: AutoBackup): { imported: number } {
  let imported = 0
  for (const [key, value] of Object.entries(backup.data)) {
    if (ALL_STORAGE_KEYS.includes(key as typeof ALL_STORAGE_KEYS[number])) {
      localStorage.setItem(key, JSON.stringify(value))
      imported++
    }
  }
  return { imported }
}

export { KEYS, ALL_STORAGE_KEYS }
