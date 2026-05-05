import type { UltramanCharacter } from './ultramanCharacters'

export const ELSA_CHARACTERS: UltramanCharacter[] = [
  { id: 'elsa', name: '艾莎公主', shortName: '艾莎', imageUrl: './images/elsa/elsa.png', fallbackColor: '#5B9BD5', fallbackChar: '艾' },
  { id: 'anna', name: '安娜公主', shortName: '安娜', imageUrl: './images/elsa/anna.png', fallbackColor: '#D35B8D', fallbackChar: '安' },
  { id: 'olaf', name: '雪宝', shortName: '雪宝', imageUrl: './images/elsa/olaf.png', fallbackColor: '#87CEEB', fallbackChar: '雪' },
  { id: 'kristoff', name: '克里斯托夫', shortName: '克里斯托夫', imageUrl: './images/elsa/kristoff.png', fallbackColor: '#8B7355', fallbackChar: '克' },
  { id: 'sven', name: '斯温', shortName: '斯温', imageUrl: './images/elsa/sven.png', fallbackColor: '#CD853F', fallbackChar: '斯' },
  { id: 'hans', name: '汉斯王子', shortName: '汉斯', imageUrl: './images/elsa/hans.png', fallbackColor: '#B8860B', fallbackChar: '汉' },
  { id: 'marshmallow', name: '棉花糖', shortName: '棉花糖', imageUrl: './images/elsa/marshmallow.png', fallbackColor: '#E0E8F0', fallbackChar: '棉' },
  { id: 'agnarr', name: '阿格纳尔国王', shortName: '国王', imageUrl: './images/elsa/agnarr.png', fallbackColor: '#4A6FA5', fallbackChar: '王' },
  { id: 'iduna', name: '伊杜娜王后', shortName: '王后', imageUrl: './images/elsa/iduna.png', fallbackColor: '#9370DB', fallbackChar: '后' },
]

export const ALL_ELSA_IDS = ELSA_CHARACTERS.map(c => c.id)

export function getCharacterById(id: string): UltramanCharacter | undefined {
  return ELSA_CHARACTERS.find(c => c.id === id)
}

export function getCharacterName(id: string): string {
  return getCharacterById(id)?.name ?? id
}
