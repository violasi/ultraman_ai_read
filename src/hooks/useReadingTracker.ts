import { useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { useTTS } from './useTTS'
import type { StorySentence } from '../types/diary'

const PUNCTUATION_RE = /[。，！？：；、""''（）—…～·《》\s]/

export interface ReadingResult {
  newlyLearned: string[]
  forgotten: string[]
}

export function useReadingTracker() {
  const { isKnownChar, addKnownChars, removeKnownChar, addVocabChar } = useApp()
  const { speakChinese } = useTTS()
  const clickedCharsRef = useRef<Set<string>>(new Set())

  const handleCharClick = useCallback((char: string, pinyin: string) => {
    if (!pinyin || PUNCTUATION_RE.test(char)) return
    speakChinese(char)
    clickedCharsRef.current.add(char)
  }, [speakChinese])

  const processReadingResult = useCallback((
    sourceId: string,
    sourceDate: string,
    sentences: StorySentence[]
  ): ReadingResult => {
    const clicked = clickedCharsRef.current
    const allChars = new Set<string>()
    const charPinyinMap: Record<string, string> = {}

    for (const sentence of sentences) {
      for (const w of sentence.words) {
        if (w.pinyin && !PUNCTUATION_RE.test(w.char)) {
          allChars.add(w.char)
          charPinyinMap[w.char] = w.pinyin
        }
      }
    }

    // Unknown chars NOT clicked → learned
    const newlyLearned: string[] = []
    for (const char of allChars) {
      if (!isKnownChar(char) && !clicked.has(char)) {
        newlyLearned.push(char)
      }
    }
    if (newlyLearned.length > 0) {
      addKnownChars(newlyLearned)
    }

    // ALL clicked chars → move to vocab
    // - Known chars that were clicked → "forgotten", remove from known
    // - Unknown chars that were clicked → also need practice, add to vocab
    const forgotten: string[] = []
    for (const char of clicked) {
      if (!allChars.has(char)) continue // skip chars not in this story
      const wasKnown = isKnownChar(char)
      if (wasKnown) {
        forgotten.push(char)
        removeKnownChar(char)
      }
      // Add to vocab regardless (known or unknown, if clicked = needs practice)
      for (const sentence of sentences) {
        if (sentence.words.some(w => w.char === char)) {
          const sentenceText = sentence.words.map(w => w.char).join('')
          addVocabChar(char, charPinyinMap[char] || '', sourceId, sourceDate, sentenceText)
          break
        }
      }
    }

    return { newlyLearned, forgotten }
  }, [isKnownChar, addKnownChars, removeKnownChar, addVocabChar])

  const resetTracker = useCallback(() => {
    clickedCharsRef.current = new Set()
  }, [])

  return { clickedCharsRef, handleCharClick, processReadingResult, resetTracker }
}
