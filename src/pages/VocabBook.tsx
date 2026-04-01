import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTTS } from '../hooks/useTTS'

export default function VocabBookPage() {
  const navigate = useNavigate()
  const { vocab, removeVocabChar, addKnownChar, markReviewed } = useApp()
  const { speakChinese } = useTTS()
  const [expandedChar, setExpandedChar] = useState<string | null>(null)

  if (vocab.length === 0) {
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
      <p className="text-sm text-gray-400 text-center">共 {vocab.length} 个生字</p>

      <div className="space-y-3">
        {vocab.map(entry => {
          const isExpanded = expandedChar === entry.char

          return (
            <div
              key={entry.char}
              className="bg-[#FFF8F0] rounded-2xl border border-[#E8DED5] shadow-[0_2px_0_#e0d5cc] overflow-hidden"
            >
              {/* Main row */}
              <div className="p-4 flex items-center gap-4">
                <button
                  onClick={() => handleReview(entry.char)}
                  className="flex-shrink-0 w-16 h-16 bg-white rounded-xl border border-[#E8DED5] flex flex-col items-center justify-center hover:bg-[#E8453C]/5 transition-colors active:scale-95"
                >
                  <span className="text-3xl font-black text-gray-800">{entry.char}</span>
                  <span className="text-xs text-gray-400">{entry.pinyin}</span>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">复习 {entry.reviewCount} 次</span>
                    {entry.appearances.length > 0 && (
                      <button
                        onClick={() => setExpandedChar(isExpanded ? null : entry.char)}
                        className="text-xs text-[#E8453C] font-bold hover:underline"
                      >
                        {isExpanded ? '收起' : `${entry.appearances.length}个句子 ▾`}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/vocab/review/${encodeURIComponent(entry.char)}`)}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#E8453C] text-white font-bold hover:bg-[#d63d35] transition-colors active:scale-95"
                  >
                    📖 复习
                  </button>
                  <button
                    onClick={() => handleLearnedChar(entry.char)}
                    className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-bold hover:bg-green-200 transition-colors"
                  >
                    已学会
                  </button>
                </div>
              </div>

              {/* Expanded sentences */}
              {isExpanded && entry.appearances.length > 0 && (
                <div className="border-t border-[#E8DED5] bg-white/50 p-3 space-y-2">
                  {entry.appearances.map((app, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      <span className="text-xs text-gray-400 mr-2">{app.date}</span>
                      {app.sentenceText.split('').map((c, cIdx) => (
                        <span
                          key={cIdx}
                          className={c === entry.char ? 'text-[#E8453C] font-bold text-base' : ''}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
