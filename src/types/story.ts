export type Module = 'chinese' | 'pinyin' | 'english'
export type Level = 1 | 2 | 3

export interface StoryMeta {
  id: string
  title: string
  titlePinyin?: string
  module: Module
  level: Level
  rewardCardId: string
  totalSentences: number
}

export interface ChineseWord {
  char: string
  pinyin: string
}

export interface ChineseSentence {
  words: ChineseWord[]
}

export interface ChineseStory extends StoryMeta {
  module: 'chinese'
  sentences: ChineseSentence[]
  quiz: QuizQuestion[]
}

export interface PinyinWord {
  pinyin: string
  char?: string
  tone: 0 | 1 | 2 | 3 | 4
}

export interface PinyinSentence {
  words: PinyinWord[]
  meaning: string
}

export interface PinyinStory extends StoryMeta {
  module: 'pinyin'
  sentences: PinyinSentence[]
  quiz: QuizQuestion[]
}

export interface EnglishWord {
  word: string
  phonics: string  // "fr-ie-nd" split by units
  chinese: string
}

export interface EnglishSentence {
  words: EnglishWord[]
  chineseTranslation: string
}

export interface EnglishStory extends StoryMeta {
  module: 'english'
  sentences: EnglishSentence[]
  quiz: QuizQuestion[]
}

export type Story = ChineseStory | PinyinStory | EnglishStory

export interface QuizQuestion {
  id: string
  question: string
  questionPinyin?: string
  options: string[]
  correctIndex: number
}
