import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useTTS } from '../../hooks/useTTS'
import { getTone, splitPinyin } from '../../lib/pinyin'
import ProgressBar from '../../components/shared/ProgressBar'

export default function PinyinStory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateStory, getAllPinyinStories } = useApp()
  const story = getAllPinyinStories().find(s => s.id === (id ?? ''))
  const { speakChinese } = useTTS()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showChars, setShowChars] = useState(false)

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

  const toneColorClass = (tone: number) => {
    const map: Record<number, string> = {
      1: 'text-red-600', 2: 'text-green-600', 3: 'text-purple-600', 4: 'text-blue-700', 0: 'text-gray-400'
    }
    return map[tone] || 'text-gray-400'
  }

  const handlePinyinClick = (word: { pinyin: string; char?: string }) => {
    // Use the character for TTS if available (better pronunciation)
    speakChinese(word.char || word.pinyin)
  }

  const speakSentence = () => {
    const text = currentSentence.words.map(w => w.char || w.pinyin).join('')
    speakChinese(text)
  }

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1)
  }

  const goNext = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      updateStory(story.id, { currentSentence: currentIdx + 1 })
    }
  }

  const goQuiz = () => {
    updateStory(story.id, { currentSentence: total })
    navigate(`/pinyin/quiz/${story.id}`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 text-center">{story.title}</h2>
      <ProgressBar current={currentIdx + 1} total={total} />

      {/* Toggle show characters */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowChars(!showChars)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            showChars ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {showChars ? '隐藏汉字' : '显示汉字'}
        </button>
      </div>

      {/* Previous sentences */}
      <div className="space-y-2 min-h-[40px]">
        {story.sentences.slice(0, currentIdx).map((sentence, sIdx) => (
          <p key={sIdx} className="text-sm text-gray-400 leading-relaxed">
            {sentence.words.map((w, wIdx) => (
              <span key={wIdx}>{w.pinyin} </span>
            ))}
          </p>
        ))}
      </div>

      {/* Current sentence - pinyin display */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[120px] flex flex-col items-center justify-center">
        <div className="flex flex-wrap gap-3 justify-center items-end">
          {currentSentence.words.map((word, wIdx) => {
            const tone = word.tone ?? getTone(word.pinyin)
            const { initial, final: fin } = splitPinyin(word.pinyin)
            return (
              <div
                key={wIdx}
                className="flex flex-col items-center cursor-pointer hover:bg-blue-50 rounded-lg px-2 py-1 transition-colors active:scale-110"
                onClick={() => handlePinyinClick(word)}
              >
                <span className="text-3xl md:text-4xl font-bold tracking-wide">
                  {initial && (
                    <span className="text-blue-700">{initial}</span>
                  )}
                  <span className={toneColorClass(tone)}>{fin || word.pinyin}</span>
                </span>
                {showChars && word.char && (
                  <span className="text-sm text-gray-400 mt-1">{word.char}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Meaning */}
        <p className="text-sm text-gray-400 mt-4 text-center">{currentSentence.meaning}</p>
      </div>

      {/* Speak sentence */}
      <button
        onClick={speakSentence}
        className="w-full py-2 text-center text-blue-700 font-medium text-sm hover:bg-blue-50 rounded-xl transition-colors"
      >
        🔊 听整句
      </button>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2">
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
            className="flex-1 py-3 rounded-2xl font-bold text-base bg-blue-700 text-white hover:bg-blue-700 active:scale-[0.97] transition-all shadow-sm"
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
