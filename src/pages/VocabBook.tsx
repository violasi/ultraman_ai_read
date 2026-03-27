import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTTS } from '../hooks/useTTS'
import type { VocabEntry } from '../types/vocab'

type Tab = 'chinese' | 'pinyin' | 'english'

const tabs: { key: Tab; label: string }[] = [
  { key: 'chinese', label: '汉语' },
  { key: 'pinyin', label: '拼音' },
  { key: 'english', label: '英语' },
]

function VocabItem({ entry, onSpeak, onDelete }: {
  entry: VocabEntry
  onSpeak: () => void
  onDelete: () => void
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <button
        onClick={onSpeak}
        className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 hover:bg-blue-100 active:scale-90 transition-all"
      >
        🔊
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-800">{entry.word}</span>
          {entry.pinyin && (
            <span className="text-sm text-gray-400">{entry.pinyin}</span>
          )}
        </div>
        {entry.meaning && (
          <p className="text-sm text-gray-500 truncate">{entry.meaning}</p>
        )}
        <p className="text-xs text-gray-300 mt-0.5">
          复习 {entry.reviewCount} 次
        </p>
      </div>
      <button
        onClick={onDelete}
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
      >
        ✕
      </button>
    </div>
  )
}

export default function VocabBook() {
  const [activeTab, setActiveTab] = useState<Tab>('chinese')
  const { vocab, removeWord } = useApp()
  const { speakChinese, speakEnglish } = useTTS()

  const filtered = vocab.filter(v => v.module === activeTab)

  const handleSpeak = (entry: VocabEntry) => {
    if (entry.module === 'english') {
      speakEnglish(entry.word)
    } else {
      speakChinese(entry.word)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">生词本</h2>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Word list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">📝</span>
            <p>还没有生词</p>
            <p className="text-xs mt-1">阅读故事时点击生字可以添加</p>
          </div>
        ) : (
          filtered.map(entry => (
            <VocabItem
              key={entry.id}
              entry={entry}
              onSpeak={() => handleSpeak(entry)}
              onDelete={() => removeWord(entry.id)}
            />
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-sm text-gray-400">
          共 {filtered.length} 个生词
        </p>
      )}
    </div>
  )
}
