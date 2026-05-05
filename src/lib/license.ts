import { theme } from '../config/theme'

// --- Types ---

export interface LicensePayload {
  customer: string
  expiresAt: number  // ms timestamp
  issuedAt: number   // ms timestamp
  days: number
}

export type LicenseStatus = 'valid' | 'expired' | 'tampered' | 'none'

// --- Storage keys (deliberately vague names) ---

const p = theme.storagePrefix
const K_LICENSE = `${p}_sys_cfg`
const K_TIMESTAMP = `${p}_sys_ts`

// --- HMAC secret (split to mildly deter casual inspection) ---

const _s = ['or4ng3', 'R34d', '_k3y_', '2026!']
function _secret(): string { return _s.join('') }

// --- Crypto helpers ---

async function hmacSign(message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(_secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmacVerify(message: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(message)
  return expected === signature
}

// --- UTF-8-safe base64 helpers ---

function b64Decode(b64: string): string {
  const binStr = atob(b64)
  const bytes = Uint8Array.from(binStr, c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

// --- Simple XOR obfuscation for localStorage ---

const _xk = 0x5A
function obfuscate(data: string): string {
  const bytes = new TextEncoder().encode(data)
  const xored = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) xored[i] = bytes[i] ^ _xk
  return btoa(String.fromCharCode(...xored))
}
function deobfuscate(encoded: string): string {
  try {
    const bin = atob(encoded)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) ^ _xk
    return new TextDecoder().decode(bytes)
  } catch { return '' }
}

function storeData(key: string, value: unknown): void {
  localStorage.setItem(key, obfuscate(JSON.stringify(value)))
}

function loadData<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(deobfuscate(raw)) as T
  } catch { return null }
}

// --- Public API ---

/**
 * Decode and verify a license key string.
 * Token format: base64 of "payloadJson\n" + hmac_hex
 * This avoids re-serialization issues with JSON.stringify key ordering.
 */
export async function parseLicense(key: string): Promise<LicensePayload | null> {
  try {
    const decoded = b64Decode(key.trim())
    const sepIdx = decoded.lastIndexOf('\n')
    if (sepIdx === -1) return null

    const payloadStr = decoded.substring(0, sepIdx)
    const sig = decoded.substring(sepIdx + 1)

    const valid = await hmacVerify(payloadStr, sig)
    if (!valid) return null

    const payload = JSON.parse(payloadStr)
    const { customer, expiresAt, issuedAt, days } = payload
    if (!customer || !expiresAt || !issuedAt || !days) return null

    return { customer, expiresAt, issuedAt, days }
  } catch {
    return null
  }
}

/** Activate a license key. Stores it locally if valid. */
export async function activateLicense(key: string): Promise<{ ok: boolean; error?: string }> {
  const payload = await parseLicense(key)
  if (!payload) return { ok: false, error: '会员码无效，请检查是否完整粘贴' }

  const now = Date.now()
  if (now > payload.expiresAt) return { ok: false, error: '此会员码已过期' }

  storeData(K_LICENSE, { key: key.trim(), payload })
  storeData(K_TIMESTAMP, now)

  return { ok: true }
}

/** Check current license status. Updates last-seen timestamp if valid. */
export function checkLicense(): LicenseStatus {
  const stored = loadData<{ key: string; payload: LicensePayload }>(K_LICENSE)
  if (!stored) return 'none'

  const now = Date.now()
  const { payload } = stored

  // Anti-tampering: current time before issuedAt
  if (now < payload.issuedAt - 60000) return 'tampered'

  // Anti-tampering: clock rolled back (current time < last seen time)
  const lastSeen = loadData<number>(K_TIMESTAMP)
  if (lastSeen && now < lastSeen - 60000) return 'tampered'

  // Check expiration
  if (now > payload.expiresAt) return 'expired'

  // All good — update last seen time
  storeData(K_TIMESTAMP, now)
  return 'valid'
}

/** Get license info for display. Returns null if no license stored. */
export function getLicenseInfo(): { customer: string; daysLeft: number; expiresAt: number } | null {
  const stored = loadData<{ key: string; payload: LicensePayload }>(K_LICENSE)
  if (!stored) return null

  const { payload } = stored
  const msLeft = payload.expiresAt - Date.now()
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))

  return { customer: payload.customer, daysLeft, expiresAt: payload.expiresAt }
}

/** Clear stored license (for testing or reset). */
export function clearLicense(): void {
  localStorage.removeItem(K_LICENSE)
  localStorage.removeItem(K_TIMESTAMP)
}

/** Whether the app is running in license mode. */
export function isLicenseMode(): boolean {
  return import.meta.env.VITE_LICENSE_MODE === 'true'
}
