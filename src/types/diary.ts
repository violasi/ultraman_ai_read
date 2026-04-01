export interface ChineseWord {
  char: string
  pinyin: string
}

export interface StorySentence {
  words: ChineseWord[]
}

export interface DiaryEntry {
  id: string
  date: string // YYYY-MM-DD
  storyTitle: string
  selectedUltramans: string[] // character ids
  happyEvent: string
  sentences: StorySentence[]
  createdAt: string // ISO timestamp
  type?: 'ai-story' | 'picture-book' // undefined = 'ai-story'
  bookId?: string                      // for picture-book type
  bookTitle?: string                   // for picture-book type
}

export interface VocabAppearance {
  diaryId: string
  date: string
  sentenceText: string
}

export interface VocabEntry {
  char: string
  pinyin: string
  appearances: VocabAppearance[]
  addedAt: string
  reviewCount: number
}

// Computed at runtime, not stored
export interface HeroStat {
  id: string
  name: string
  imageUrl: string
  fallbackColor: string
  daysAccompanied: number
}
