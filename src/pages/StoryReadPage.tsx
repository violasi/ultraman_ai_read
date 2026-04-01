import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTTS } from '../hooks/useTTS'
import { getCharacterById } from '../data/ultramanCharacters'
import RubyText from '../components/shared/RubyText'
import UltramanAvatar from '../components/shared/UltramanAvatar'

export default function StoryReadPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getDiaryEntry, isKnownChar, addKnownChars, removeKnownChar, addVocabChar } = useApp()
  const { speakChinese } = useTTS()
  const entry = getDiaryEntry(id ?? '')

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedChar, setSelectedChar] = useState<{ char: string; pinyin: string } | null>(null)
  const [readingSummary, setReadingSummary] = useState<{ newlyLearned: string[]; forgotten: string[] } | null>(null)
  const clickedCharsRef = useRef<Set<string>>(new Set())

  const processReadingResult = useCallback(() => {
    if (!entry) return { newlyLearned: [], forgotten: [] }
    const clicked = clickedCharsRef.current
    const allChars = new Set<string>()
    const charPinyinMap: Record<string, string> = {}

    for (const sentence of entry.sentences) {
      for (const w of sentence.words) {
        if (w.pinyin && !/[。，！？：；、""''（）—…～·《》]/.test(w.char)) {
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

    // Clicked chars → add to vocab; if previously known → mark as forgotten
    const forgotten: string[] = []
    for (const char of clicked) {
      if (!allChars.has(char)) continue
      if (isKnownChar(char)) {
        forgotten.push(char)
        removeKnownChar(char)
      }
      // Add ALL clicked chars to vocab, regardless of known status
      for (const sentence of entry.sentences) {
        if (sentence.words.some(w => w.char === char)) {
          const sentenceText = sentence.words.map(w => w.char).join('')
          addVocabChar(char, charPinyinMap[char] || '', entry.id, entry.date, sentenceText)
          break
        }
      }
    }

    return { newlyLearned, forgotten }
  }, [entry, isKnownChar, addKnownChars, removeKnownChar, addVocabChar])

  if (!entry) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">😕</span>
        <p className="text-gray-500">找不到这个故事</p>
      </div>
    )
  }

  const total = entry.sentences.length
  const currentSentence = entry.sentences[currentIdx]

  const handleCharClick = (char: string, pinyin: string) => {
    if (!pinyin || /[。，！？：；、""''（）—…～·《》\s]/.test(char)) return
    speakChinese(char)
    clickedCharsRef.current.add(char)
    setSelectedChar({ char, pinyin })
  }

  const speakSentence = () => {
    const text = currentSentence.words.map(w => w.char).join('')
    speakChinese(text)
  }

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1)
  }

  const goNext = () => {
    if (currentIdx < total - 1) setCurrentIdx(currentIdx + 1)
  }

  const finishReading = () => {
    const result = processReadingResult()
    if (result.newlyLearned.length > 0 || result.forgotten.length > 0) {
      setReadingSummary(result)
    } else {
      navigate('/diary')
    }
  }

  return (
    <div className="space-y-4">
      {/* Title and heroes */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black text-gray-800">{entry.storyTitle}</h2>
        <div className="flex items-center justify-center gap-2">
          {entry.selectedUltramans.map(heroId => {
            const c = getCharacterById(heroId)
            return c ? <UltramanAvatar key={heroId} character={c} size="lg" /> : null
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-[#E8DED5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E8453C] rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 font-bold">{currentIdx + 1}/{total}</span>
      </div>

      {/* Previous sentences */}
      <div className="space-y-2 min-h-[40px]">
        {entry.sentences.slice(0, currentIdx).map((sentence, sIdx) => (
          <p key={sIdx} className="text-lg text-gray-300 leading-relaxed">
            {sentence.words.map((w, wIdx) => (
              <span key={wIdx}>{w.char}</span>
            ))}
          </p>
        ))}
      </div>

      {/* Current sentence */}
      <div className="bg-[#FFF8F0] rounded-2xl p-6 shadow-sm border border-[#E8DED5] min-h-[140px] flex items-center justify-center flex-wrap gap-1">
        {currentSentence.words.map((word, wIdx) => (
          <RubyText
            key={`${wIdx}-${word.char}`}
            char={word.char}
            pinyin={word.pinyin}
            isKnown={isKnownChar(word.char)}
            onClick={() => handleCharClick(word.char, word.pinyin)}
          />
        ))}
      </div>

      {/* Speak sentence */}
      <button
        onClick={speakSentence}
        className="w-full py-2 text-center text-[#E8453C] font-bold text-sm hover:bg-[#E8453C]/10 rounded-xl transition-colors"
      >
        🔊 听整句
      </button>

      {/* Selected char info */}
      {selectedChar && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{selectedChar.char}</span>
              <span className="text-sm text-gray-500">{selectedChar.pinyin}</span>
            </div>
            <span className="text-xs text-gray-400">
              {isKnownChar(selectedChar.char) ? '📌 已标记需复习' : '🔊 点击听发音'}
            </span>
          </div>
        </div>
      )}

      {/* Reading summary */}
      {readingSummary && (
        <div className="bg-white border-2 border-yellow-300 rounded-2xl p-4 space-y-3">
          <h3 className="text-base font-bold text-gray-800 text-center">📊 阅读小结</h3>
          {readingSummary.newlyLearned.length > 0 && (
            <div className="bg-[#E8453C]/10 rounded-xl p-3">
              <p className="text-sm font-bold text-[#E8453C] mb-1">
                🎉 新学会 {readingSummary.newlyLearned.length} 个字！
              </p>
              <p className="text-xl tracking-wider text-[#E8453C]">
                {readingSummary.newlyLearned.join(' ')}
              </p>
              <p className="text-xs text-[#E8453C]/60 mt-1">（整篇没有点击发音 = 你已经认识了）</p>
            </div>
          )}
          {readingSummary.forgotten.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-sm font-bold text-orange-700 mb-1">
                📝 需要复习 {readingSummary.forgotten.length} 个字
              </p>
              <p className="text-xl tracking-wider text-orange-800">
                {readingSummary.forgotten.join(' ')}
              </p>
              <p className="text-xs text-orange-600 mt-1">（点了发音 = 还不太熟，移入生字本）</p>
            </div>
          )}
          <button
            onClick={() => navigate('/diary')}
            className="w-full py-3 rounded-2xl font-black text-base bg-[#FFD93D] text-gray-800 active:scale-[0.97] transition-all shadow-[0_3px_0_#c9a820]"
          >
            完成阅读 ✨
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className={`flex items-center gap-3 pt-2 ${readingSummary ? 'hidden' : ''}`}>
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="flex-1 py-3 rounded-2xl font-bold text-base border-2 border-[#E8DED5] text-gray-600 hover:bg-[#F0E6DD] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all"
        >
          ← 上一句
        </button>
        {currentIdx < total - 1 ? (
          <button
            onClick={goNext}
            className="flex-1 py-3 rounded-2xl font-black text-base bg-[#E8453C] text-white active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33]"
          >
            下一句 →
          </button>
        ) : (
          <button
            onClick={finishReading}
            className="flex-1 py-3 rounded-2xl font-black text-base bg-[#FFD93D] text-gray-800 active:scale-[0.97] transition-all shadow-[0_3px_0_#c9a820]"
          >
            读完了 ✨
          </button>
        )}
      </div>
    </div>
  )
}
