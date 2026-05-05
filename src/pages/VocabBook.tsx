import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTTS } from '../hooks/useTTS'

export default function VocabBookPage() {
  const navigate = useNavigate()
  const { vocab, removeVocabChar, addKnownChar, markReviewed, isKnownChar } = useApp()
  const { speakChinese } = useTTS()
  const [expandedChar, setExpandedChar] = useState<string | null>(null)

  // Filter out chars already in known chars (e.g. graduated via reading)
  const activeVocab = vocab.filter(v => !isKnownChar(v.char))

  if (activeVocab.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <span className="text-5xl block">📝</span>
        <h2 className="text-xl font-black text-gray-800">生字本是空的</h2>
        <p className="text-gray-400 text-sm">读故事时点击过的已会汉字会到这里来哦</p>
      </div>
    )
  }

  const handleLearnedChar = (char: string) => {
    addKnownChar(char)
    removeVocabChar(char)
  }

  const handleReview = (char: string) => {
    speakChinese(char)
    markReviewed(char)
  }

  return (
    <div className="space-y-4 py-2">
      <h2 className="text-xl font-black text-gray-800 text-center">📝 生字本</h2>
      <p className="text-sm text-gray-400 text-center">共 {activeVocab.length} 个生字　点击听发音</p>

      {/* Render rows of 5, with inline detail panel after each row */}
      {Array.from({ length: Math.ceil(activeVocab.length / 5) }, (_, rowIdx) => {
        const rowItems = activeVocab.slice(rowIdx * 5, rowIdx * 5 + 5)
        const expandedEntry = rowItems.find(v => v.char === expandedChar)
        return (
          <div key={rowIdx} className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              {rowItems.map(entry => (
                <div key={entry.char} className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => {
                      handleReview(entry.char)
                      setExpandedChar(expandedChar === entry.char ? null : entry.char)
                    }}
                    className={`w-full aspect-square rounded-2xl border shadow-[0_2px_0_var(--color-shadow)] flex flex-col items-center justify-center active:scale-95 transition-all ${
                      expandedChar === entry.char
                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]'
                        : 'bg-[var(--color-bg-warm)] border-[var(--color-border)]'
                    }`}
                  >
                    <span className="text-6xl font-black text-gray-800">{entry.char}</span>
                    <span className="text-xs text-gray-400 mt-1">{entry.pinyin}</span>
                  </button>
                </div>
              ))}
            </div>
            {expandedEntry && (
              <div className="bg-[var(--color-bg-warm)] rounded-2xl border border-[var(--color-primary)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-gray-800">{expandedEntry.char}</span>
                    <span className="text-sm text-gray-400">{expandedEntry.pinyin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/vocab/review/${encodeURIComponent(expandedEntry.char)}`)}
                      className="text-sm px-4 py-2 rounded-full bg-[var(--color-primary)] text-white font-bold active:scale-95 transition-colors"
                    >
                      📖 复习
                    </button>
                    <button
                      onClick={() => handleLearnedChar(expandedEntry.char)}
                      className="text-sm px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold active:scale-95 transition-colors"
                    >
                      已学会
                    </button>
                    <button
                      onClick={() => setExpandedChar(null)}
                      className="text-sm px-2 py-2 text-gray-400"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {expandedEntry.appearances.length > 0 && (
                  <div className="space-y-2">
                    {expandedEntry.appearances.map((app, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        <span className="text-xs text-gray-400 mr-2">{app.date}</span>
                        {app.sentenceText.split('').map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className={c === expandedEntry.char ? 'text-[var(--color-primary)] font-bold text-base' : ''}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
