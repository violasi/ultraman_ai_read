import { useCallback } from 'react'
import { tts } from '../lib/tts'

export function useTTS() {
  const speakChinese = useCallback((text: string) => tts.speakChinese(text), [])
  const speakEnglish = useCallback((text: string) => tts.speakEnglish(text), [])
  const stop = useCallback(() => tts.stop(), [])
  return { speakChinese, speakEnglish, stop }
}
