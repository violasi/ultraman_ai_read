export interface UltramanCharacter {
  id: string
  name: string
  shortName: string
  imageUrl: string
  fallbackColor: string
  fallbackChar: string
}

export const ULTRAMAN_CHARACTERS: UltramanCharacter[] = [
  { id: 'taro', name: '泰罗奥特曼', shortName: '泰罗', imageUrl: '/images/ultraman/taro.png', fallbackColor: '#E53E3E', fallbackChar: '泰' },
  { id: 'zero', name: '赛罗奥特曼', shortName: '赛罗', imageUrl: '/images/ultraman/zero.png', fallbackColor: '#3182CE', fallbackChar: '赛' },
  { id: 'tiga', name: '迪迦奥特曼', shortName: '迪迦', imageUrl: '/images/ultraman/tiga.png', fallbackColor: '#805AD5', fallbackChar: '迪' },
  { id: 'belial', name: '贝利亚奥特曼', shortName: '贝利亚', imageUrl: '/images/ultraman/belial.png', fallbackColor: '#9B2C2C', fallbackChar: '贝' },
  { id: 'zeta', name: '泽塔奥特曼', shortName: '泽塔', imageUrl: '/images/ultraman/zeta.png', fallbackColor: '#DD6B20', fallbackChar: '泽' },
  { id: 'father', name: '奥特之父', shortName: '奥特之父', imageUrl: '/images/ultraman/father.png', fallbackColor: '#D69E2E', fallbackChar: '父' },
  { id: 'mother', name: '奥特之母', shortName: '奥特之母', imageUrl: '/images/ultraman/mother.png', fallbackColor: '#38A169', fallbackChar: '母' },
  { id: 'orb', name: '欧布奥特曼', shortName: '欧布', imageUrl: '/images/ultraman/orb.png', fallbackColor: '#C53030', fallbackChar: '欧' },
  { id: 'ginga', name: '银河奥特曼', shortName: '银河', imageUrl: '/images/ultraman/ginga.png', fallbackColor: '#A0AEC0', fallbackChar: '银' },
]

export const ALL_ULTRAMAN_IDS = ULTRAMAN_CHARACTERS.map(c => c.id)

export function getCharacterById(id: string): UltramanCharacter | undefined {
  return ULTRAMAN_CHARACTERS.find(c => c.id === id)
}

export function getCharacterName(id: string): string {
  return getCharacterById(id)?.name ?? id
}
