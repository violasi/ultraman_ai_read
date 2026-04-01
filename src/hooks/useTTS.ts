import { useCallback } from 'react'
import { tts } from '../lib/tts'

export function useTTS() {
  const speakChinese = useCallback((text: string) => tts.speakChinese(text), [])
  const stop = useCallback(() => tts.stop(), [])
  return { speakChinese, stop }
}
