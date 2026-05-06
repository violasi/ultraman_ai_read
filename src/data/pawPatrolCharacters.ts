import type { UltramanCharacter } from './ultramanCharacters'

export const PAW_PATROL_CHARACTERS: UltramanCharacter[] = [
  { id: 'chase', name: '阿奇', shortName: '阿奇', imageUrl: './images/pawpatrol/chase.png', fallbackColor: '#1E3A8A', fallbackChar: '奇' },
  { id: 'marshall', name: '毛毛', shortName: '毛毛', imageUrl: './images/pawpatrol/marshall.png', fallbackColor: '#DC2626', fallbackChar: '毛' },
  { id: 'skye', name: '天天', shortName: '天天', imageUrl: './images/pawpatrol/skye.png', fallbackColor: '#EC4899', fallbackChar: '天' },
  { id: 'rocky', name: '灰灰', shortName: '灰灰', imageUrl: './images/pawpatrol/rocky.png', fallbackColor: '#059669', fallbackChar: '灰' },
  { id: 'rubble', name: '小砾', shortName: '小砾', imageUrl: './images/pawpatrol/rubble.png', fallbackColor: '#F59E0B', fallbackChar: '砾' },
  { id: 'zuma', name: '路马', shortName: '路马', imageUrl: './images/pawpatrol/zuma.png', fallbackColor: '#F97316', fallbackChar: '路' },
  { id: 'everest', name: '珠珠', shortName: '珠珠', imageUrl: './images/pawpatrol/everest.png', fallbackColor: '#06B6D4', fallbackChar: '珠' },
  { id: 'tracker', name: '小克', shortName: '小克', imageUrl: './images/pawpatrol/tracker.png', fallbackColor: '#65A30D', fallbackChar: '克' },
  { id: 'ryder', name: '莱德', shortName: '莱德', imageUrl: './images/pawpatrol/ryder.png', fallbackColor: '#2563EB', fallbackChar: '莱' },
]

export const ALL_PAW_PATROL_IDS = PAW_PATROL_CHARACTERS.map(c => c.id)

export function getCharacterById(id: string): UltramanCharacter | undefined {
  return PAW_PATROL_CHARACTERS.find(c => c.id === id)
}

export function getCharacterName(id: string): string {
  return getCharacterById(id)?.name ?? id
}
