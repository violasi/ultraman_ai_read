import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { exportAllData, parseSaveFile, importAllData, type SaveSummary } from '../lib/storage'

export default function SaveLoadPage() {
  const { unlockedCount, progress, knownCharCount, vocab, streak } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState<{ summary: SaveSummary; exportedAt: string; raw: string } | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loadSuccess, setLoadSuccess] = useState(false)

  const completedStories = Object.values(progress.stories).filter(s => s.completed).length

  const currentSummary: SaveSummary = {
    cards: unlockedCount,
    stars: progress.totalStars,
    knownChars: knownCharCount,
    vocabWords: vocab.length,
    streak: streak.currentStreak,
    stories: completedStories,
  }

  const handleSave = () => {
    const save = exportAllData()
    const json = JSON.stringify(save, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]
    a.href = url
    a.download = `存档_${save.summary.cards}张卡片_${save.summary.stars}星_${date}.json`
    a.click()
    URL.revokeObjectURL(url)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoadError('')
    setPreview(null)
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const result = parseSaveFile(text)
      if (!result.ok) {
        setLoadError(result.error)
        return
      }
      setPreview({
        summary: result.save.summary,
        exportedAt: result.save.exportedAt,
        raw: text,
      })
    }
    reader.readAsText(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  const handleConfirmLoad = () => {
    if (!preview) return
    const result = parseSaveFile(preview.raw)
    if (!result.ok) { setLoadError(result.error); return }
    importAllData(result.save)
    setLoadSuccess(true)
    setTimeout(() => window.location.reload(), 1500)
  }

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    } catch { return iso }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">🎮 游戏存档</h2>
        <p className="text-gray-400 text-sm mt-1">保存或恢复你的冒险进度</p>
      </div>

      {/* Current progress */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-600 mb-3">📊 当前进度</h3>
        <SummaryGrid summary={currentSummary} />
      </div>

      {/* Save */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-gray-600">💾 保存存档</h3>
        <p className="text-xs text-gray-400">将当前进度保存为文件，可以拷贝到其他设备</p>
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
        >
          {saved ? '✅ 存档成功！' : '💾 保存存档'}
        </button>
      </div>

      {/* Load */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-gray-600">📂 读取存档</h3>
        <p className="text-xs text-gray-400">从文件恢复之前保存的进度</p>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!preview && !loadSuccess && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            📂 选择存档文件
          </button>
        )}

        {loadError && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-sm text-red-600">
            ❌ {loadError}
          </div>
        )}

        {/* Preview comparison */}
        {preview && !loadSuccess && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs font-bold text-blue-700 mb-1">
                📦 存档信息 — {formatDate(preview.exportedAt)}
              </p>
              <SummaryGrid summary={preview.summary} />
            </div>

            {/* Comparison */}
            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-xs font-bold text-yellow-700 mb-2">⚠️ 读档将覆盖当前进度</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <CompareItem label="卡片" current={currentSummary.cards} incoming={preview.summary.cards} />
                <CompareItem label="星星" current={currentSummary.stars} incoming={preview.summary.stars} />
                <CompareItem label="汉字" current={currentSummary.knownChars} incoming={preview.summary.knownChars} />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPreview(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm active:scale-95 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleConfirmLoad}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                确认读档
              </button>
            </div>
          </div>
        )}

        {loadSuccess && (
          <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
            <p className="text-lg font-bold text-green-700">🎮 读档成功！</p>
            <p className="text-xs text-green-500 mt-1">正在恢复进度...</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryGrid({ summary }: { summary: SaveSummary }) {
  const items = [
    { icon: '🎴', label: '卡片', value: summary.cards },
    { icon: '⭐', label: '星星', value: summary.stars },
    { icon: '📖', label: '故事', value: summary.stories },
    { icon: '字', label: '汉字', value: summary.knownChars },
    { icon: '📝', label: '生词', value: summary.vocabWords },
    { icon: '🔥', label: '连读', value: `${summary.streak}天` },
  ]
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(item => (
        <div key={item.label} className="text-center p-2 bg-gray-50 rounded-lg">
          <span className="text-lg">{item.icon}</span>
          <p className="text-xs text-gray-400">{item.label}</p>
          <p className="text-sm font-bold text-gray-700">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

function CompareItem({ label, current, incoming }: { label: string; current: number; incoming: number }) {
  const diff = incoming - current
  const color = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'
  return (
    <div className="text-center">
      <p className="text-gray-500">{label}</p>
      <p className="font-bold text-gray-700">{current} → {incoming}</p>
      <p className={`text-[10px] font-bold ${color}`}>
        {diff > 0 ? `+${diff}` : diff === 0 ? '=' : diff}
      </p>
    </div>
  )
}
