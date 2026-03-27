import { useState, useCallback } from 'react'
import { getItem, setItem, KEYS } from '../lib/storage'
import type { VocabEntry } from '../types/vocab'

export function useVocab() {
  const [vocab, setVocab] = useState<VocabEntry[]>(() =>
    getItem(KEYS.VOCAB, [])
  )

  const addWord = useCallback((entry: Omit<VocabEntry, 'id' | 'addedAt' | 'reviewCount'>) => {
    setVocab(prev => {
      // Deduplicate
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

  return { vocab, addWord, removeWord, markReviewed }
}
