import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'
import { exportAllData, type SaveFile } from './storage'
import { theme } from '../config/theme'

const BACKUP_DIR = 'backups'

/** Returns true only on real native platform (Android/iOS), not web */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fileName(): string {
  return `${theme.exportFilePrefix}-${todayStr()}.json`
}

/** Ensure backups directory exists */
async function ensureDir(): Promise<void> {
  try {
    await Filesystem.mkdir({
      path: BACKUP_DIR,
      directory: Directory.Documents,
      recursive: true,
    })
  } catch {
    // already exists
  }
}

/** Save current data as a JSON file to Documents/backups/ (native only) */
export async function saveBackupToFile(data?: SaveFile): Promise<string | null> {
  if (!isNativePlatform()) return null  // web: no real filesystem
  await ensureDir()
  const save = data ?? exportAllData()
  const path = `${BACKUP_DIR}/${fileName()}`
  await Filesystem.writeFile({
    path,
    data: JSON.stringify(save, null, 2),
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  })
  return path
}

/** Auto-backup: save to filesystem once per day (native only) */
export async function autoBackupToFile(): Promise<void> {
  if (!isNativePlatform()) return  // web: skip
  try {
    await saveBackupToFile()
  } catch {
    console.warn('[backup] Filesystem write failed, skipping file backup')
  }
}

/** List all backup files */
export async function listBackupFiles(): Promise<{ name: string; uri: string; mtime: number }[]> {
  try {
    await ensureDir()
    const result = await Filesystem.readdir({
      path: BACKUP_DIR,
      directory: Directory.Documents,
    })
    return result.files
      .filter(f => f.name.endsWith('.json'))
      .map(f => ({ name: f.name, uri: f.uri, mtime: f.mtime || 0 }))
      .sort((a, b) => b.mtime - a.mtime)
  } catch {
    return []
  }
}

/** Read a backup file and return its content */
export async function readBackupFile(name: string): Promise<string> {
  const result = await Filesystem.readFile({
    path: `${BACKUP_DIR}/${name}`,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  })
  return result.data as string
}
