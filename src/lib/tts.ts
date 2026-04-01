import { TextToSpeech } from '@capacitor-community/text-to-speech'

function isNative(): boolean {
  return 'Capacitor' in window
}

class TTSEngine {
  speak(text: string, rate = 0.8) {
    if (isNative()) {
      TextToSpeech.speak({ text, lang: 'zh-CN', rate, volume: 1.0 }).catch(() => {})
    } else {
      try {
        const synth = window.speechSynthesis
        synth.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'zh-CN'
        utterance.rate = rate
        const voices = synth.getVoices()
        const voice = voices.find(v => v.lang.startsWith('zh'))
        if (voice) utterance.voice = voice
        synth.speak(utterance)
      } catch { /* silently fail */ }
    }
  }

  speakChinese(text: string) { this.speak(text, 0.8) }

  stop() {
    if (isNative()) {
      TextToSpeech.stop().catch(() => {})
    } else {
      try { window.speechSynthesis.cancel() } catch { /* */ }
    }
  }
}

export const tts = new TTSEngine()
