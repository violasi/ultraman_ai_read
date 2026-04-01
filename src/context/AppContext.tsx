import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react'
import { KEYS, getItem, setItem } from '../lib/storage'
import { DEFAULT_KNOWN_CHARACTERS } from '../data/defaultKnownChars'
import { ULTRAMAN_CHARACTERS } from '../data/ultramanCharacters'
import type { DiaryEntry, VocabEntry, HeroStat } from '../types/diary'
import type { BookReadRecord } from '../types/picturebook'
import type { RewardCard } from '../types/reward'

interface AppContextType {
  // Diary
  diaryEntries: DiaryEntry[]
  addDiaryEntry: (entry: DiaryEntry) => void
  getDiaryEntry: (id: string) => DiaryEntry | undefined
  getTodayEntry: () => DiaryEntry | undefined

  // Known Characters
  knownChars: Set<string>
  knownCharCount: number
  isKnownChar: (char: string) => boolean
  addKnownChars: (chars: string[]) => void
  removeKnownChar: (char: string) => void
  addKnownChar: (char: string) => void

  // Vocab
  vocab: VocabEntry[]
  addVocabChar: (char: string, pinyin: string, diaryId: string, date: string, sentenceText: string) => void
  removeVocabChar: (char: string) => void
  markReviewed: (char: string) => void

  // Book reading
  bookReadRecords: BookReadRecord[]
  addBookReadRecord: (record: BookReadRecord) => void
  getBookReadCountForHero: (heroId: string) => number

  // Hero stats
  heroStats: HeroStat[]

  // Reward cards
  rewardCards: RewardCard[]
  getRewardCardsForHero: (heroId: string) => RewardCard[]
  pendingReward: RewardCard | null
  dismissReward: () => void

  // Settings
  apiKey: string
  setApiKey: (key: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

function loadKnownChars(): Set<string> {
  const stored = getItem<string[] | null>(KEYS.KNOWN_CHARS, null)
  if (stored) return new Set(stored)
  const defaults = DEFAULT_KNOWN_CHARACTERS
  setItem(KEYS.KNOWN_CHARS, [...defaults])
  return new Set(defaults)
}

function getToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(
    () => getItem<DiaryEntry[]>(KEYS.DIARY_ENTRIES, [])
  )
  const [knownChars, setKnownChars] = useState<Set<string>>(loadKnownChars)
  const [vocab, setVocab] = useState<VocabEntry[]>(
    () => getItem<VocabEntry[]>(KEYS.VOCAB, [])
  )
  const [bookReadRecords, setBookReadRecords] = useState<BookReadRecord[]>(
    () => getItem<BookReadRecord[]>(KEYS.BOOK_READ_RECORDS, [])
  )
  const [rewardCards, setRewardCards] = useState<RewardCard[]>(
    () => getItem<RewardCard[]>(KEYS.REWARD_CARDS, [])
  )
  const [pendingReward, setPendingReward] = useState<RewardCard | null>(null)
  const [apiKey, setApiKeyState] = useState<string>(
    () => getItem<string>(KEYS.OPENAI_KEY, '')
  )

  // --- Reward helpers (must be before diary/book callbacks that use them) ---
  const computeHeroDays = useCallback((heroId: string, entries: DiaryEntry[], records: BookReadRecord[]) => {
    const days = new Set<string>()
    for (const e of entries) {
      if (e.selectedUltramans.includes(heroId)) days.add(e.date)
    }
    for (const r of records) {
      if (r.heroId === heroId) days.add(r.date)
    }
    return days.size
  }, [])

  const checkAndGrantRewards = useCallback((heroId: string, days: number, currentCards: RewardCard[]) => {
    const earnedCount = Math.floor(days / 3)
    const existingCount = currentCards.filter(c => c.heroId === heroId).length
    if (earnedCount > existingCount) {
      const newLevel = existingCount + 1
      const card: RewardCard = {
        heroId,
        level: newLevel,
        imageUrl: `/images/rewards/${heroId}_gift_${newLevel}.png`,
        earnedAt: new Date().toISOString(),
      }
      const next = [...currentCards, card]
      setRewardCards(next)
      setItem(KEYS.REWARD_CARDS, next)
      setPendingReward(card)
      return next
    }
    return currentCards
  }, [])

  // --- Diary ---
  const addDiaryEntry = useCallback((entry: DiaryEntry) => {
    setDiaryEntries(prev => {
      const next = [entry, ...prev]
      setItem(KEYS.DIARY_ENTRIES, next)
      // Check rewards for each hero in this entry
      let cards = getItem<RewardCard[]>(KEYS.REWARD_CARDS, [])
      for (const heroId of entry.selectedUltramans) {
        const days = computeHeroDays(heroId, next, bookReadRecords)
        cards = checkAndGrantRewards(heroId, days, cards)
      }
      return next
    })
  }, [bookReadRecords, computeHeroDays, checkAndGrantRewards])

  const getDiaryEntry = useCallback((id: string) => {
    return diaryEntries.find(e => e.id === id)
  }, [diaryEntries])

  const getTodayEntry = useCallback(() => {
    const today = getToday()
    // Only find AI story entries, not picture book entries
    return diaryEntries.find(e => e.date === today && e.type !== 'picture-book')
  }, [diaryEntries])

  // --- Known Characters ---
  const knownCharCount = knownChars.size

  const isKnownChar = useCallback((char: string) => knownChars.has(char), [knownChars])

  const addKnownChars = useCallback((chars: string[]) => {
    setKnownChars(prev => {
      const next = new Set(prev)
      for (const c of chars) next.add(c)
      setItem(KEYS.KNOWN_CHARS, [...next])
      return next
    })
  }, [])

  const addKnownChar = useCallback((char: string) => {
    addKnownChars([char])
  }, [addKnownChars])

  const removeKnownChar = useCallback((char: string) => {
    setKnownChars(prev => {
      const next = new Set(prev)
      next.delete(char)
      setItem(KEYS.KNOWN_CHARS, [...next])
      return next
    })
  }, [])

  // --- Vocab ---
  const addVocabChar = useCallback((char: string, pinyin: string, diaryId: string, date: string, sentenceText: string) => {
    setVocab(prev => {
      const existing = prev.find(v => v.char === char)
      let next: VocabEntry[]
      if (existing) {
        const hasAppearance = existing.appearances.some(a => a.diaryId === diaryId && a.sentenceText === sentenceText)
        if (hasAppearance) return prev
        next = prev.map(v =>
          v.char === char
            ? { ...v, appearances: [...v.appearances, { diaryId, date, sentenceText }] }
            : v
        )
      } else {
        const appearances: VocabEntry['appearances'] = [{ diaryId, date, sentenceText }]
        // Backfill from past diary entries
        const entries = getItem<DiaryEntry[]>(KEYS.DIARY_ENTRIES, [])
        for (const entry of entries) {
          if (entry.id === diaryId) continue
          for (const sentence of entry.sentences) {
            const text = sentence.words.map(w => w.char).join('')
            if (sentence.words.some(w => w.char === char)) {
              appearances.push({ diaryId: entry.id, date: entry.date, sentenceText: text })
            }
          }
        }
        next = [{ char, pinyin, appearances, addedAt: new Date().toISOString(), reviewCount: 0 }, ...prev]
      }
      setItem(KEYS.VOCAB, next)
      return next
    })
  }, [])

  const removeVocabChar = useCallback((char: string) => {
    setVocab(prev => {
      const next = prev.filter(v => v.char !== char)
      setItem(KEYS.VOCAB, next)
      return next
    })
  }, [])

  const markReviewed = useCallback((char: string) => {
    setVocab(prev => {
      const next = prev.map(v =>
        v.char === char ? { ...v, reviewCount: v.reviewCount + 1 } : v
      )
      setItem(KEYS.VOCAB, next)
      return next
    })
  }, [])

  // --- Book Reading ---
  const addBookReadRecord = useCallback((record: BookReadRecord) => {
    setBookReadRecords(prev => {
      const next = [record, ...prev]
      setItem(KEYS.BOOK_READ_RECORDS, next)
      // Check reward for this hero
      const days = computeHeroDays(record.heroId, diaryEntries, next)
      const cards = getItem<RewardCard[]>(KEYS.REWARD_CARDS, [])
      checkAndGrantRewards(record.heroId, days, cards)
      return next
    })
  }, [diaryEntries, computeHeroDays, checkAndGrantRewards])

  const getBookReadCountForHero = useCallback((heroId: string) => {
    return bookReadRecords.filter(r => r.heroId === heroId).length
  }, [bookReadRecords])

  // --- Reward Cards ---
  const getRewardCardsForHero = useCallback((heroId: string) => {
    return rewardCards.filter(c => c.heroId === heroId).sort((a, b) => a.level - b.level)
  }, [rewardCards])

  const dismissReward = useCallback(() => setPendingReward(null), [])

  // --- Hero Stats ---
  const heroStats = useMemo<HeroStat[]>(() => {
    const daysByHero: Record<string, Set<string>> = {}
    for (const entry of diaryEntries) {
      for (const heroId of entry.selectedUltramans) {
        if (!daysByHero[heroId]) daysByHero[heroId] = new Set()
        daysByHero[heroId].add(entry.date)
      }
    }
    // Also count book reading days
    for (const record of bookReadRecords) {
      if (!daysByHero[record.heroId]) daysByHero[record.heroId] = new Set()
      daysByHero[record.heroId].add(record.date)
    }
    return ULTRAMAN_CHARACTERS
      .map(c => ({
        id: c.id,
        name: c.name,
        imageUrl: c.imageUrl,
        fallbackColor: c.fallbackColor,
        daysAccompanied: daysByHero[c.id]?.size ?? 0,
      }))
      .sort((a, b) => b.daysAccompanied - a.daysAccompanied)
  }, [diaryEntries, bookReadRecords])

  // --- Settings ---
  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key)
    setItem(KEYS.OPENAI_KEY, key)
  }, [])

  const value: AppContextType = {
    diaryEntries, addDiaryEntry, getDiaryEntry, getTodayEntry,
    knownChars, knownCharCount, isKnownChar, addKnownChars, addKnownChar, removeKnownChar,
    vocab, addVocabChar, removeVocabChar, markReviewed,
    bookReadRecords, addBookReadRecord, getBookReadCountForHero,
    heroStats,
    rewardCards, getRewardCardsForHero, pendingReward, dismissReward,
    apiKey, setApiKey,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
