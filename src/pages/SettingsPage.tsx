import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { exportAllData, parseSaveFile, importAllData } from '../lib/storage'

export default function SettingsPage() {
  const { apiKey, setApiKey, knownCharCount, vocab, diaryEntries, knownChars, addKnownChars, removeKnownChar } = useApp()
  const [keyInput, setKeyInput] = useState(apiKey)
  const [keySaved, setKeySaved] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [showChars, setShowChars] = useState(false)
  const [addCharsInput, setAddCharsInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSaveKey = () => {
    setApiKey(keyInput.trim())
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ultraman-diary-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = parseSaveFile(reader.result as string)
      if (result.ok) {
        importAllData(result.save)
        setImportMsg('导入成功！刷新页面生效')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setImportMsg(result.error)
      }
    }
    reader.readAsText(file)
  }

  const handleAddChars = () => {
    const chars = addCharsInput.trim().split('').filter(c => c.trim() && !/\s/.test(c))
    if (chars.length > 0) {
      addKnownChars(chars)
      setAddCharsInput('')
    }
  }

  return (
    <div className="space-y-6 py-2">
      <h2 className="text-xl font-black text-gray-800 text-center">⚙️ 设置</h2>

      {/* API Key */}
      <section className="bg-[#FFF8F0] rounded-2xl p-4 border border-[#E8DED5] space-y-3">
        <h3 className="text-base font-bold text-gray-800">🔑 OpenAI API Key</h3>
        <input
          type="password"
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          placeholder="sk-..."
          className="w-full p-3 rounded-xl border border-[#E8DED5] bg-white text-sm focus:border-[#E8453C] focus:outline-none transition-colors"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSaveKey}
            className="px-4 py-2 rounded-xl bg-[#E8453C] text-white text-sm font-bold active:scale-[0.97] transition-all"
          >
            {keySaved ? '✓ 已保存' : '保存'}
          </button>
          {apiKey && (
            <button
              onClick={() => { setApiKey(''); setKeyInput('') }}
              className="px-4 py-2 rounded-xl border border-[#E8DED5] text-gray-500 text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              清除
            </button>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#FFF8F0] rounded-2xl p-4 border border-[#E8DED5] space-y-3">
        <h3 className="text-base font-bold text-gray-800">📊 数据统计</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <span className="text-2xl font-black text-[#E8453C]">{knownCharCount}</span>
            <p className="text-xs text-gray-400">已会汉字</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-orange-500">{vocab.length}</span>
            <p className="text-xs text-gray-400">生字</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-blue-500">{diaryEntries.length}</span>
            <p className="text-xs text-gray-400">篇日记</p>
          </div>
        </div>
      </section>

      {/* Known Chars Management */}
      <section className="bg-[#FFF8F0] rounded-2xl p-4 border border-[#E8DED5] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">📚 已会汉字管理</h3>
          <button
            onClick={() => setShowChars(!showChars)}
            className="text-xs text-[#E8453C] font-bold"
          >
            {showChars ? '收起' : '展开查看'}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={addCharsInput}
            onChange={e => setAddCharsInput(e.target.value)}
            placeholder="输入或粘贴汉字..."
            className="flex-1 p-2 rounded-xl border border-[#E8DED5] bg-white text-sm focus:border-[#E8453C] focus:outline-none"
          />
          <button
            onClick={handleAddChars}
            disabled={!addCharsInput.trim()}
            className="px-4 py-2 rounded-xl bg-[#E8453C] text-white text-sm font-bold active:scale-[0.97] transition-all disabled:opacity-40"
          >
            添加
          </button>
        </div>

        {showChars && (
          <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto">
            {[...knownChars].map(char => (
              <button
                key={char}
                onClick={() => removeKnownChar(char)}
                className="w-9 h-9 rounded-lg bg-white border border-[#E8DED5] text-sm font-bold text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                title={`点击删除：${char}`}
              >
                {char}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Export / Import */}
      <section className="bg-[#FFF8F0] rounded-2xl p-4 border border-[#E8DED5] space-y-3">
        <h3 className="text-base font-bold text-gray-800">💾 数据管理</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 py-2 rounded-xl border-2 border-[#E8DED5] text-gray-600 text-sm font-bold hover:bg-[#F0E6DD] transition-colors"
          >
            📤 导出存档
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 py-2 rounded-xl border-2 border-[#E8DED5] text-gray-600 text-sm font-bold hover:bg-[#F0E6DD] transition-colors"
          >
            📥 导入存档
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {importMsg && (
          <p className={`text-sm text-center ${importMsg.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>
            {importMsg}
          </p>
        )}
      </section>
    </div>
  )
}
