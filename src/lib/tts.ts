import { TextToSpeech } from '@capacitor-community/text-to-speech'

// Detect if running in Capacitor native environment
function isNative(): boolean {
  return 'Capacitor' in window
}

class TTSEngine {
  speak(text: string, lang: 'zh-CN' | 'en-US', rate = 0.8) {
    if (isNative()) {
      TextToSpeech.speak({ text, lang, rate, volume: 1.0 }).catch(() => {})
    } else {
      try {
        const synth = window.speechSynthesis
        synth.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        utterance.rate = rate
        const voices = synth.getVoices()
        const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]))
        if (voice) utterance.voice = voice
        synth.speak(utterance)
      } catch { /* silently fail */ }
    }
  }

  speakChinese(text: string) { this.speak(text, 'zh-CN', 0.8) }
  speakEnglish(text: string) { this.speak(text, 'en-US', 0.75) }

  stop() {
    if (isNative()) {
      TextToSpeech.stop().catch(() => {})
    } else {
      try { window.speechSynthesis.cancel() } catch { /* */ }
    }
  }
}

export const tts = new TTSEngine()
