import { useState, useCallback } from 'react'
import { getItem, setItem, KEYS } from '../lib/storage'
import type { UserProgress, StoryProgress } from '../types/progress'

const DEFAULT_PROGRESS: UserProgress = {
  stories: {},
  totalStars: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
}

export function useProgress() {
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
      // Recalculate total stars
      newProgress.totalStars = Object.values(newProgress.stories)
        .reduce((sum, s) => sum + s.quizScore, 0)
      setItem(KEYS.PROGRESS, newProgress)
      return newProgress
    })
  }, [])

  const getStoryProgress = useCallback((storyId: string): StoryProgress | undefined => {
    return progress.stories[storyId]
  }, [progress])

  const isStoryCompleted = useCallback((storyId: string): boolean => {
    return progress.stories[storyId]?.completed ?? false
  }, [progress])

  return { progress, updateStory, getStoryProgress, isStoryCompleted }
}
