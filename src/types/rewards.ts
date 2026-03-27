export type Rarity = 'common' | 'rare' | 'legendary'

export interface UltramanCard {
  id: string
  name: string
  nameEn: string
  series: string
  rarity: Rarity
  emoji: string
  description: string
  form: string         // e.g. '基础形态', '强力型', '闪耀形态'
  heroId: string       // parent ultraman id, e.g. 'tiga'
  unlockType: 'story' | 'milestone'
  milestoneId?: string // milestone that unlocks this card
  colors: [string, string] // gradient colors for card bg, e.g. ['#c00', '#900']
}

export interface CardState {
  unlocked: boolean
  unlockedAt?: string
}
