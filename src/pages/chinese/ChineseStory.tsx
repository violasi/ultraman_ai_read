import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useTTS } from '../../hooks/useTTS'
import RubyText from '../../components/shared/RubyText'
import ProgressBar from '../../components/shared/ProgressBar'

export default function ChineseStory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateStory, addWord, removeKnownChar, isKnownChar, addKnownChars, getAllChineseStories } = useApp()
  const story = getAllChineseStories().find(s => s.id === (id ?? ''))
  const { speakChinese } = useTTS()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedChar, setSelectedChar] = useState<{ char: string; pinyin: string } | null>(null)
  // Track all chars clicked for pronunciation during this reading session
  const clickedCharsRef = useRef<Set<string>>(new Set())

  if (!story) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">😕</span>
        <p className="text-gray-500">找不到这个故事</p>
      </div>
    )
  }

  const total = story.sentences.length
  const currentSentence = story.sentences[currentIdx]

  const handleCharClick = (char: string, pinyin: string) => {
    if (!pinyin || /[。，！？：；、""''（）]/.test(char)) return
    speakChinese(char)
    clickedCharsRef.current.add(char)
    setSelectedChar({ char, pinyin })
  }

  // Process reading data when story is finished:
  // - Unknown chars NOT clicked → learned (add to known)
  // - Known chars that WERE clicked → forgot (move to vocab)
  const processReadingResult = useCallback(() => {
    const clicked = clickedCharsRef.current
    const allChars = new Set<string>()
    const charPinyinMap: Record<string, string> = {}

    for (const sentence of story.sentences) {
      for (const w of sentence.words) {
        if (w.pinyin && !/[。，！？：；、""''（）]/.test(w.char)) {
          allChars.add(w.char)
          charPinyinMap[w.char] = w.pinyin
        }
      }
    }

    // Unknown chars that were NOT clicked → the child could read them → mark as known
    const newlyLearned: string[] = []
    for (const char of allChars) {
      if (!isKnownChar(char) && !clicked.has(char)) {
        newlyLearned.push(char)
      }
    }
    if (newlyLearned.length > 0) {
      addKnownChars(newlyLearned)
    }

    // Known chars that WERE clicked → the child needed help → move to vocab
    const forgotten: string[] = []
    for (const char of clicked) {
      if (isKnownChar(char)) {
        forgotten.push(char)
        removeKnownChar(char)
        addWord({
          module: 'chinese',
          word: char,
          pinyin: charPinyinMap[char] || '',
          meaning: '',
          fromStoryId: story.id,
        })
      }
    }

    return { newlyLearned, forgotten }
  }, [story, isKnownChar, addKnownChars, removeKnownChar, addWord])

  const goPrev = () => {
    if (currentIdx > 0) { setCurrentIdx(currentIdx - 1) }
  }

  const goNext = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      updateStory(story.id, { currentSentence: currentIdx + 1 })
    }
  }

  const [readingSummary, setReadingSummary] = useState<{ newlyLearned: string[]; forgotten: string[] } | null>(null)

  const goQuiz = () => {
    updateStory(story.id, { currentSentence: total })
    const result = processReadingResult()
    if (result.newlyLearned.length > 0 || result.forgotten.length > 0) {
      setReadingSummary(result)
    } else {
      navigate(`/chinese/quiz/${story.id}`)
    }
  }

  const speakSentence = () => {
    const text = currentSentence.words.map(w => w.char).join('')
    speakChinese(text)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 text-center">{story.title}</h2>
      <ProgressBar current={currentIdx + 1} total={total} />

      {/* Previous sentences (dimmed) */}
      <div className="space-y-2 min-h-[60px]">
        {story.sentences.slice(0, currentIdx).map((sentence, sIdx) => (
          <p key={sIdx} className="text-base text-gray-400 leading-relaxed">
            {sentence.words.map((w, wIdx) => (
              <span key={wIdx}>{w.char}</span>
            ))}
          </p>
        ))}
      </div>

      {/* Current sentence */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[120px] flex items-center justify-center flex-wrap gap-1">
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

      {/* Speak sentence button */}
      <button
        onClick={speakSentence}
        className="w-full py-2 text-center text-blue-700 font-medium text-sm hover:bg-blue-50 rounded-xl transition-colors"
      >
        🔊 听整句
      </button>

      {/* Selected char - show info */}
      {selectedChar && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{selectedChar.char}</span>
              <span className="text-sm text-gray-500">{selectedChar.pinyin}</span>
            </div>
            <span className="text-xs text-gray-400">
              {isKnownChar(selectedChar.char) ? '📌 已标记需复习' : '🔊 点击听发音'}
            </span>
          </div>
        </div>
      )}

      {/* Reading summary before quiz */}
      {readingSummary && (
        <div className="bg-white border-2 border-yellow-300 rounded-2xl p-4 space-y-3 animate-bounce-in">
          <h3 className="text-base font-bold text-gray-800 text-center">📊 阅读小结</h3>
          {readingSummary.newlyLearned.length > 0 && (
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-sm font-bold text-green-700 mb-1">
                🎉 新学会 {readingSummary.newlyLearned.length} 个字！
              </p>
              <p className="text-lg tracking-wider text-green-800">
                {readingSummary.newlyLearned.join(' ')}
              </p>
              <p className="text-xs text-green-600 mt-1">（整篇没有点击发音 = 你已经认识了）</p>
            </div>
          )}
          {readingSummary.forgotten.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-sm font-bold text-orange-700 mb-1">
                📝 需要复习 {readingSummary.forgotten.length} 个字
              </p>
              <p className="text-lg tracking-wider text-orange-800">
                {readingSummary.forgotten.join(' ')}
              </p>
              <p className="text-xs text-orange-600 mt-1">（点了发音 = 还不太熟，移入生词本）</p>
            </div>
          )}
          <button
            onClick={() => navigate(`/chinese/quiz/${story.id}`)}
            className="w-full py-3 rounded-2xl font-bold text-base bg-gradient-to-r from-yellow-400 to-orange-400 text-white active:scale-[0.97] transition-all shadow-sm"
          >
            知道了，开始答题 ✨
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className={`flex items-center gap-3 pt-2 ${readingSummary ? 'hidden' : ''}`}>
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="flex-1 py-3 rounded-2xl font-bold text-base border-2 border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all"
        >
          ← 上一句
        </button>
        {currentIdx < total - 1 ? (
          <button
            onClick={goNext}
            className="flex-1 py-3 rounded-2xl font-bold text-base bg-red-600 text-white hover:bg-red-600 active:scale-[0.97] transition-all shadow-sm"
          >
            下一句 →
          </button>
        ) : (
          <button
            onClick={goQuiz}
            className="flex-1 py-3 rounded-2xl font-bold text-base bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 active:scale-[0.97] transition-all shadow-sm"
          >
            开始答题 ✨
          </button>
        )}
      </div>
    </div>
  )
}
