// Get tone number from pinyin string by checking tone mark characters
export function getTone(pinyin: string): 0 | 1 | 2 | 3 | 4 {
  if (/[āēīōūǖ]/.test(pinyin)) return 1
  if (/[áéíóúǘ]/.test(pinyin)) return 2
  if (/[ǎěǐǒǔǚ]/.test(pinyin)) return 3
  if (/[àèìòùǜ]/.test(pinyin)) return 4
  return 0
}

// Common initials
const INITIALS = ['zh','ch','sh','b','p','m','f','d','t','n','l','g','k','h','j','q','x','r','z','c','s','y','w']

export function splitPinyin(py: string): { initial: string; final: string } {
  const lower = py.toLowerCase().replace(/[āáǎà]/g,'a').replace(/[ēéěè]/g,'e')
    .replace(/[īíǐì]/g,'i').replace(/[ōóǒò]/g,'o').replace(/[ūúǔù]/g,'u').replace(/[ǖǘǚǜ]/g,'v')
  for (const ini of INITIALS) {
    if (lower.startsWith(ini)) {
      return { initial: ini, final: py.slice(ini.length) }
    }
  }
  return { initial: '', final: py }
}

export function toneColor(tone: number): string {
  const colors: Record<number, string> = {
    1: 'var(--color-tone-1)',
    2: 'var(--color-tone-2)',
    3: 'var(--color-tone-3)',
    4: 'var(--color-tone-4)',
    0: 'var(--color-tone-0)',
  }
  return colors[tone] || colors[0]
}
