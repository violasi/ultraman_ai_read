import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { getItem, setItem, KEYS } from '../lib/storage'
import { DEFAULT_KNOWN_CHARACTERS } from '../data/characters'
import { MILESTONES } from '../data/milestones'
import { ULTRAMAN_CARDS, getCardsByHero } from '../data/ultramanCards'
import { allChineseStories } from '../data/stories/chinese'
import { allPinyinStories } from '../data/stories/pinyin'
import { allEnglishStories } from '../data/stories/english'
import type { UserProgress, StoryProgress } from '../types/progress'
import type { VocabEntry } from '../types/vocab'
import type { CardState } from '../types/rewards'
import type { Milestone, MilestoneState } from '../types/milestone'
import type { Story, ChineseStory, PinyinStory, EnglishStory } from '../types/story'

const DEFAULT_PROGRESS: UserProgress = {
  stories: {},
  totalStars: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
}

type CharEncounters = Record<string, { correct: number; total: number }>

// Custom stories stored separately
interface CustomStoryStore {
  chinese: ChineseStory[]
  pinyin: PinyinStory[]
  english: EnglishStory[]
}

const CUSTOM_STORIES_KEY = 'orange_read_custom_stories'
const MILESTONES_KEY = 'orange_read_milestones'
const STREAK_KEY = 'orange_read_streak'
const CHAR_ENCOUNTERS_KEY = 'orange_read_char_encounters'
const INITIAL_CHARS_COUNT_KEY = 'orange_read_initial_chars_count'
const AUTO_PROMOTE_THRESHOLD = 3

interface StreakData {
  currentStreak: number
  lastReadDate: string // YYYY-MM-DD — the date when all 3 modules were completed
  longestStreak: number
  activeDates: string[] // last 30 days of fully completed dates
  todayModules: string[] // modules completed today, e.g. ['chinese', 'pinyin']
  todayDate: string // YYYY-MM-DD — to know when to reset todayModules
}

interface AppContextType {
  // Progress
  progress: UserProgress
  updateStory: (storyId: string, update: Partial<StoryProgress>) => void
  getStoryProgress: (storyId: string) => StoryProgress | undefined
  isStoryCompleted: (storyId: string) => boolean
  // Vocab
  vocab: VocabEntry[]
  addWord: (entry: Omit<VocabEntry, 'id' | 'addedAt' | 'reviewCount'>) => void
  removeWord: (id: string) => void
  markReviewed: (id: string) => void
  // Rewards
  cards: Record<string, CardState>
  unlockCard: (cardId: string) => void
  lockCard: (cardId: string) => void
  isUnlocked: (cardId: string) => boolean
  unlockedCount: number
  // Known Characters
  knownChars: Set<string>
  knownCharCount: number
  isKnownChar: (char: string) => boolean
  addKnownChar: (char: string) => void
  removeKnownChar: (char: string) => void
  addKnownChars: (chars: string[]) => void
  // Character encounter tracking (for auto-promotion)
  charEncounters: CharEncounters
  recordCharCorrect: (chars: string[]) => string[]
  // Milestones
  milestones: Record<string, MilestoneState>
  checkMilestones: () => string[] // returns newly completed milestone IDs
  // Streak
  streak: StreakData
  recordModuleCompletion: (module: 'chinese' | 'pinyin' | 'english') => void
  // Milestone celebrations
  pendingMilestones: Milestone[]
  dismissMilestone: () => void
  // Custom stories
  customStories: CustomStoryStore
  addCustomStory: (story: Story) => boolean
  removeCustomStory: (module: string, storyId: string) => void
  getAllChineseStories: () => ChineseStory[]
  getAllPinyinStories: () => PinyinStory[]
  getAllEnglishStories: () => EnglishStory[]
}

const AppContext = createContext<AppContextType | null>(null)

function loadKnownChars(): Set<string> {
  const saved = getItem<string[] | null>(KEYS.KNOWN_CHARS, null)
  if (saved) return new Set(saved)
  return new Set(DEFAULT_KNOWN_CHARACTERS)
}

function saveKnownChars(chars: Set<string>) {
  setItem(KEYS.KNOWN_CHARS, [...chars])
}

function getDefaultStreak(): StreakData {
  return { currentStreak: 0, lastReadDate: '', longestStreak: 0, activeDates: [], todayModules: [], todayDate: '' }
}

function calcStreak(data: StreakData): StreakData {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Reset todayModules if it's a new day
  const todayModules = data.todayDate === today ? (data.todayModules || []) : []
  const todayDate = today

  // Check if streak is still valid
  if (data.lastReadDate === today) return { ...data, todayModules, todayDate }
  if (data.lastReadDate === yesterday) return { ...data, todayModules, todayDate }
  if (data.lastReadDate && data.lastReadDate < yesterday) {
    return { ...data, currentStreak: 0, todayModules, todayDate }
  }
  return { ...data, todayModules, todayDate }
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Progress state
  const [progress, setProgress] = useState<UserProgress>(() =>
    getItem(KEYS.PROGRESS, DEFAULT_PROGRESS)
  )

  const updateStory = useCallback((storyId: string, update: Partial<StoryProgress>) => {
    setProgress(prev => {
      const existing = prev.stories[storyId] || {
        storyId, completed: false, currentSentence: 0, quizScore: 0, quizPassed: false
      }
      const updated = { ...existing, ...update }
      const newProgress = {
        ...prev,
        stories: { ...prev.stories, [storyId]: updated },
        lastActiveDate: new Date().toISOString().split('T')[0],
      }
      newProgress.totalStars = Object.values(newProgress.stories)
        .reduce((sum, s) => sum + s.quizScore, 0)
      setItem(KEYS.PROGRESS, newProgress)
      return newProgress
    })
  }, [])

  const getStoryProgress = useCallback((storyId: string) => {
    return progress.stories[storyId]
  }, [progress])

  const isStoryCompleted = useCallback((storyId: string) => {
    return progress.stories[storyId]?.completed ?? false
  }, [progress])

  // Vocab state
  const [vocab, setVocab] = useState<VocabEntry[]>(() => getItem(KEYS.VOCAB, []))

  const addWord = useCallback((entry: Omit<VocabEntry, 'id' | 'addedAt' | 'reviewCount'>) => {
    setVocab(prev => {
      if (prev.some(v => v.word === entry.word && v.module === entry.module)) return prev
      const newEntry: VocabEntry = {
        ...entry,
        id: `${entry.module}-${entry.word}-${Date.now()}`,
        addedAt: new Date().toISOString(),
        reviewCount: 0,
      }
      const updated = [newEntry, ...prev]
      setItem(KEYS.VOCAB, updated)
      return updated
    })
  }, [])

  const removeWord = useCallback((id: string) => {
    setVocab(prev => {
      const updated = prev.filter(v => v.id !== id)
      setItem(KEYS.VOCAB, updated)
      return updated
    })
  }, [])

  const markReviewed = useCallback((id: string) => {
    setVocab(prev => {
      const updated = prev.map(v =>
        v.id === id ? { ...v, reviewCount: v.reviewCount + 1 } : v
      )
      setItem(KEYS.VOCAB, updated)
      return updated
    })
  }, [])

  // Rewards state
  const [cards, setCards] = useState<Record<string, CardState>>(() => getItem(KEYS.CARDS, {}))

  const unlockCard = useCallback((cardId: string) => {
    setCards(prev => {
      if (prev[cardId]?.unlocked) return prev
      const updated = {
        ...prev,
        [cardId]: { unlocked: true, unlockedAt: new Date().toISOString() }
      }
      setItem(KEYS.CARDS, updated)
      return updated
    })
  }, [])

  const lockCard = useCallback((cardId: string) => {
    setCards(prev => {
      if (!prev[cardId]?.unlocked) return prev
      const { [cardId]: _, ...rest } = prev
      setItem(KEYS.CARDS, rest)
      return rest
    })
  }, [])

  const isUnlocked = useCallback((cardId: string) => {
    return cards[cardId]?.unlocked ?? false
  }, [cards])

  const unlockedCount = Object.values(cards).filter(c => c.unlocked).length

  // Known Characters state
  const [knownChars, setKnownChars] = useState<Set<string>>(loadKnownChars)

  const isKnownChar = useCallback((char: string) => {
    return knownChars.has(char)
  }, [knownChars])

  const addKnownChar = useCallback((char: string) => {
    setKnownChars(prev => {
      if (prev.has(char)) return prev
      const updated = new Set(prev)
      updated.add(char)
      saveKnownChars(updated)
      return updated
    })
  }, [])

  const addKnownChars = useCallback((chars: string[]) => {
    setKnownChars(prev => {
      const updated = new Set(prev)
      let changed = false
      for (const c of chars) {
        if (!updated.has(c)) { updated.add(c); changed = true }
      }
      if (!changed) return prev
      saveKnownChars(updated)
      return updated
    })
  }, [])

  const removeKnownChar = useCallback((char: string) => {
    setKnownChars(prev => {
      if (!prev.has(char)) return prev
      const updated = new Set(prev)
      updated.delete(char)
      saveKnownChars(updated)
      return updated
    })
  }, [])

  const knownCharCount = knownChars.size

  // Track initial char count (set once on first use, never changes)
  const initialCharCount = useMemo(() => {
    const saved = getItem<number | null>(INITIAL_CHARS_COUNT_KEY, null)
    if (saved !== null) return saved
    // First time: record current count as baseline
    const count = knownChars.size
    setItem(INITIAL_CHARS_COUNT_KEY, count)
    return count
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Character encounter tracking for auto-promotion
  const [charEncounters, setCharEncounters] = useState<CharEncounters>(() =>
    getItem(CHAR_ENCOUNTERS_KEY, {})
  )

  const recordCharCorrect = useCallback((chars: string[]): string[] => {
    const promoted: string[] = []
    setCharEncounters(prev => {
      const updated = { ...prev }
      for (const c of chars) {
        const existing = updated[c] || { correct: 0, total: 0 }
        updated[c] = { correct: existing.correct + 1, total: existing.total + 1 }
        if (updated[c].correct >= AUTO_PROMOTE_THRESHOLD) {
          promoted.push(c)
        }
      }
      setItem(CHAR_ENCOUNTERS_KEY, updated)
      return updated
    })
    if (promoted.length > 0) {
      setKnownChars(prev => {
        const updated = new Set(prev)
        const newlyPromoted: string[] = []
        for (const c of promoted) {
          if (!updated.has(c)) { updated.add(c); newlyPromoted.push(c) }
        }
        if (newlyPromoted.length > 0) saveKnownChars(updated)
        return updated
      })
    }
    return promoted
  }, [])

  // Streak tracking
  const [streak, setStreak] = useState<StreakData>(() =>
    calcStreak(getItem(STREAK_KEY, getDefaultStreak()))
  )

  const recordModuleCompletion = useCallback((module: 'chinese' | 'pinyin' | 'english') => {
    setStreak(prev => {
      const today = new Date().toISOString().split('T')[0]

      // Reset todayModules if new day
      const currentModules = prev.todayDate === today ? (prev.todayModules || []) : []

      // Add module if not already recorded today
      if (currentModules.includes(module)) {
        return { ...prev, todayModules: currentModules, todayDate: today }
      }
      const newModules = [...currentModules, module]

      // Check if all 3 modules are done
      const allDone = ['chinese', 'pinyin', 'english'].every(m => newModules.includes(m))

      if (allDone && prev.lastReadDate !== today) {
        // All 3 modules completed! Increment streak
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const newStreak = prev.lastReadDate === yesterday || prev.lastReadDate === ''
          ? prev.currentStreak + 1
          : 1

        const activeDates = [...prev.activeDates.filter(d => {
          const diff = Date.now() - new Date(d).getTime()
          return diff < 30 * 86400000
        }), today]

        const updated: StreakData = {
          currentStreak: newStreak,
          lastReadDate: today,
          longestStreak: Math.max(prev.longestStreak, newStreak),
          activeDates,
          todayModules: newModules,
          todayDate: today,
        }
        setItem(STREAK_KEY, updated)
        return updated
      }

      // Not all 3 yet, just save modules progress
      const updated: StreakData = {
        ...prev,
        todayModules: newModules,
        todayDate: today,
      }
      setItem(STREAK_KEY, updated)
      return updated
    })
  }, [])

  // Milestones
  const [milestones, setMilestones] = useState<Record<string, MilestoneState>>(() =>
    getItem(MILESTONES_KEY, {})
  )

  const checkMilestones = useCallback((): string[] => {
    const newlyCompleted: string[] = []
    const completedStoryIds = Object.entries(progress.stories)
      .filter(([, s]) => s.completed)
      .map(([id]) => id)
    const completedCount = completedStoryIds.length

    for (const m of MILESTONES) {
      if (milestones[m.id]?.completed) continue

      let met = false
      // Helper: check if all story-unlock cards of a hero are unlocked
      const heroStoryCardsUnlocked = (hId: string) =>
        getCardsByHero(hId).filter(c => c.unlockType === 'story').every(c => cards[c.id]?.unlocked)

      switch (m.id) {
        case 'streak-3': met = streak.currentStreak >= 3; break
        case 'streak-5': met = streak.currentStreak >= 5; break
        case 'streak-7': met = streak.currentStreak >= 7; break
        case 'stories-10': met = completedCount >= 10; break
        case 'stories-20': met = completedCount >= 20; break
        case 'stories-30': met = completedCount >= 30; break
        case 'stories-40': met = completedCount >= 40; break
        case 'stories-50': met = completedCount >= 50; break
        case 'stories-60': met = completedCount >= 60; break
        case 'stories-70': met = completedCount >= 70; break
        case 'collect-hero-z': met = heroStoryCardsUnlocked('z'); break
        case 'collect-hero-trigger': met = heroStoryCardsUnlocked('trigger'); break
        case 'collect-hero-decker': met = heroStoryCardsUnlocked('decker'); break
        case 'collect-hero-ginga': met = heroStoryCardsUnlocked('ginga'); break
        case 'collect-hero-orb': met = heroStoryCardsUnlocked('orb'); break
        case 'collect-hero-geed': met = heroStoryCardsUnlocked('geed'); break
        case 'collect-hero-x': met = heroStoryCardsUnlocked('x'); break
        case 'collect-hero-taiga': met = heroStoryCardsUnlocked('taiga'); break
        case 'collect-hero-rb': met = heroStoryCardsUnlocked('rosso') && heroStoryCardsUnlocked('blu'); break
        case 'collect-hero-omega': met = heroStoryCardsUnlocked('omega'); break
        case 'collect-all': {
          const allOthers = ULTRAMAN_CARDS.filter(c => c.id !== 'noa')
          met = allOthers.every(c => cards[c.id]?.unlocked)
          break
        }
      }

      if (met) {
        newlyCompleted.push(m.id)
      }
    }

    if (newlyCompleted.length > 0) {
      setMilestones(prev => {
        const updated = { ...prev }
        for (const id of newlyCompleted) {
          updated[id] = { completed: true, completedAt: new Date().toISOString() }
        }
        setItem(MILESTONES_KEY, updated)
        return updated
      })
      // Unlock corresponding cards
      setCards(prev => {
        const updated = { ...prev }
        let changed = false
        for (const id of newlyCompleted) {
          const milestone = MILESTONES.find(m => m.id === id)
          if (milestone && !updated[milestone.rewardCardId]?.unlocked) {
            updated[milestone.rewardCardId] = { unlocked: true, unlockedAt: new Date().toISOString() }
            changed = true
          }
        }
        if (changed) setItem(KEYS.CARDS, updated)
        return changed ? updated : prev
      })
    }

    return newlyCompleted
  }, [progress, streak, knownChars, vocab, cards, milestones])

  // Custom stories
  const [customStories, setCustomStories] = useState<CustomStoryStore>(() =>
    getItem(CUSTOM_STORIES_KEY, { chinese: [], pinyin: [], english: [] })
  )

  const addCustomStory = useCallback((story: Story): boolean => {
    let added = false
    setCustomStories(prev => {
      const module = story.module
      const list = prev[module] as Story[]
      if (list.some(s => s.id === story.id)) return prev
      const updated = { ...prev, [module]: [...list, story] }
      setItem(CUSTOM_STORIES_KEY, updated)
      added = true
      return updated as CustomStoryStore
    })
    return added
  }, [])

  const removeCustomStory = useCallback((module: string, storyId: string) => {
    setCustomStories(prev => {
      const list = prev[module as keyof CustomStoryStore] as Story[]
      const updated = { ...prev, [module]: list.filter(s => s.id !== storyId) }
      setItem(CUSTOM_STORIES_KEY, updated)
      return updated as CustomStoryStore
    })
  }, [])

  const getAllChineseStories = useCallback(() =>
    [...allChineseStories, ...customStories.chinese], [customStories])
  const getAllPinyinStories = useCallback(() =>
    [...allPinyinStories, ...customStories.pinyin], [customStories])
  const getAllEnglishStories = useCallback(() =>
    [...allEnglishStories, ...customStories.english], [customStories])

  // Pending milestone celebrations queue
  const [pendingMilestones, setPendingMilestones] = useState<Milestone[]>([])

  const dismissMilestone = useCallback(() => {
    setPendingMilestones(prev => prev.slice(1))
  }, [])

  // Auto-check milestones on state changes
  useEffect(() => {
    const newlyCompleted = checkMilestones()
    if (newlyCompleted.length > 0) {
      const newMilestones = newlyCompleted
        .map(id => MILESTONES.find(m => m.id === id))
        .filter((m): m is Milestone => !!m)
      setPendingMilestones(prev => [...prev, ...newMilestones])
    }
  }, [progress, streak, knownChars.size, vocab.length, cards])

  return (
    <AppContext.Provider value={{
      progress, updateStory, getStoryProgress, isStoryCompleted,
      vocab, addWord, removeWord, markReviewed,
      cards, unlockCard, lockCard, isUnlocked, unlockedCount,
      knownChars, knownCharCount, isKnownChar, addKnownChar, removeKnownChar, addKnownChars,
      charEncounters, recordCharCorrect,
      milestones, checkMilestones,
      streak, recordModuleCompletion,
      pendingMilestones, dismissMilestone,
      customStories, addCustomStory, removeCustomStory,
      getAllChineseStories, getAllPinyinStories, getAllEnglishStories,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
