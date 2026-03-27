import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useTTS } from '../../hooks/useTTS'
import ProgressBar from '../../components/shared/ProgressBar'

export default function EnglishStory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateStory, addWord, getAllEnglishStories } = useApp()
  const story = getAllEnglishStories().find(s => s.id === (id ?? ''))
  const { speakEnglish } = useTTS()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedWord, setSelectedWord] = useState<{ word: string; phonics: string; chinese: string } | null>(null)

  if (!story) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">😕</span>
        <p className="text-gray-500">Story not found</p>
      </div>
    )
  }

  const total = story.sentences.length
  const currentSentence = story.sentences[currentIdx]

  const cleanWord = (w: string) => w.replace(/[.,!?;:'"]/g, '')

  const handleWordClick = (word: { word: string; phonics: string; chinese: string }) => {
    speakEnglish(cleanWord(word.word))
    setSelectedWord(word)
  }

  const handleAddVocab = () => {
    if (!selectedWord) return
    addWord({
      module: 'english',
      word: cleanWord(selectedWord.word),
      meaning: selectedWord.chinese,
      fromStoryId: story.id,
    })
    setSelectedWord(null)
  }

  const speakSentence = () => {
    const text = currentSentence.words.map(w => w.word).join(' ')
    speakEnglish(text)
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
    navigate(`/english/quiz/${story.id}`)
  }

  // Color phonics segments
  const phonicsColors = ['#E53E3E', '#38A169', '#2B6CB0', '#805AD5', '#DD6B20']

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 text-center">{story.title}</h2>
      <ProgressBar current={currentIdx + 1} total={total} />

      {/* Previous sentences */}
      <div className="space-y-2 min-h-[40px]">
        {story.sentences.slice(0, currentIdx).map((sentence, sIdx) => (
          <p key={sIdx} className="text-sm text-gray-400 leading-relaxed">
            {sentence.words.map((w, wIdx) => (
              <span key={wIdx}>{w.word} </span>
            ))}
          </p>
        ))}
      </div>

      {/* Current sentence */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[120px] flex flex-col items-center justify-center">
        <div className="flex flex-wrap gap-3 justify-center items-end">
          {currentSentence.words.map((word, wIdx) => {
            const segments = word.phonics.split('-')
            return (
              <div
                key={wIdx}
                className="flex flex-col items-center cursor-pointer hover:bg-green-50 rounded-lg px-2 py-1 transition-colors active:scale-110"
                onClick={() => handleWordClick(word)}
              >
                <span className="text-2xl md:text-3xl font-bold">
                  {word.word}
                </span>
                {/* Phonics breakdown shown below */}
                <div className="flex gap-0.5 mt-1">
                  {segments.map((seg, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-xs font-mono font-bold"
                      style={{ color: phonicsColors[sIdx % phonicsColors.length] }}
                    >
                      {seg}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Chinese translation */}
        <p className="text-sm text-gray-400 mt-4 text-center">
          {currentSentence.chineseTranslation}
        </p>
      </div>

      {/* Speak sentence */}
      <button
        onClick={speakSentence}
        className="w-full py-2 text-center text-green-600 font-medium text-sm hover:bg-green-50 rounded-xl transition-colors"
      >
        🔊 Listen
      </button>

      {/* Selected word - details + add to vocab */}
      {selectedWord && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold mr-2">{cleanWord(selectedWord.word)}</span>
              <span className="text-sm text-gray-500">{selectedWord.chinese}</span>
            </div>
            <button
              onClick={handleAddVocab}
              className="px-4 py-1.5 bg-green-400 text-green-900 rounded-full text-sm font-bold hover:bg-green-500 active:scale-95 transition-all"
            >
              + 生词本
            </button>
          </div>
          {/* Phonics detail */}
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-400">拼读：</span>
            {selectedWord.phonics.split('-').map((seg, i) => (
              <span key={i} className="font-mono font-bold px-1.5 py-0.5 rounded bg-white"
                style={{ color: phonicsColors[i % phonicsColors.length] }}>
                {seg}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="flex-1 py-3 rounded-2xl font-bold text-base border-2 border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all"
        >
          ← Prev
        </button>
        {currentIdx < total - 1 ? (
          <button
            onClick={goNext}
            className="flex-1 py-3 rounded-2xl font-bold text-base bg-green-500 text-white hover:bg-green-600 active:scale-[0.97] transition-all shadow-sm"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={goQuiz}
            className="flex-1 py-3 rounded-2xl font-bold text-base bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 active:scale-[0.97] transition-all shadow-sm"
          >
            Quiz Time ✨
          </button>
        )}
      </div>
    </div>
  )
}
