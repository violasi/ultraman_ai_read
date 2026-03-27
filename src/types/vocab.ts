export interface VocabEntry {
  id: string
  module: 'chinese' | 'pinyin' | 'english'
  word: string
  pinyin?: string
  meaning: string
  addedAt: string
  reviewCount: number
  fromStoryId: string
}
