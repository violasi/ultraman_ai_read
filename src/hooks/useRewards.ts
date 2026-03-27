import { useState, useCallback } from 'react'
import { getItem, setItem, KEYS } from '../lib/storage'
import type { CardState } from '../types/rewards'

export function useRewards() {
  const [cards, setCards] = useState<Record<string, CardState>>(() =>
    getItem(KEYS.CARDS, {})
  )

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

  const isUnlocked = useCallback((cardId: string): boolean => {
    return cards[cardId]?.unlocked ?? false
  }, [cards])

  const unlockedCount = Object.values(cards).filter(c => c.unlocked).length

  return { cards, unlockCard, isUnlocked, unlockedCount }
}
