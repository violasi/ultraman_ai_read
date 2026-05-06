/**
 * Generate a device fingerprint based on browser characteristics.
 * Uses FNV-1a hash for a short, stable string.
 */

function fnv1a(str: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = (hash * 0x01000193) >>> 0
  }
  return hash.toString(36)
}

export function generateDeviceId(): string {
  const parts = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    screen.colorDepth,
    navigator.language,
    navigator.hardwareConcurrency,
    new Date().getTimezoneOffset(),
  ]
  return fnv1a(parts.join('|'))
}
