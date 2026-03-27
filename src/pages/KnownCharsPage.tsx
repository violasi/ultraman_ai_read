import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'

export default function KnownCharsPage() {
  const { knownChars, knownCharCount, addKnownChar, removeKnownChar } = useApp()
  const [search, setSearch] = useState('')
  const [newChar, setNewChar] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const allChars = useMemo(() => Array.from(knownChars), [knownChars])

  const filtered = useMemo(() => {
    if (!search.trim()) return allChars
    return allChars.filter(ch => ch.includes(search.trim()))
  }, [allChars, search])

  const handleAdd = () => {
    const char = newChar.trim()
    if (!char) return
    // Add each character individually (support pasting multiple chars)
    const chars = [...char]
    for (const c of chars) {
      if (c.trim() && /[\u4e00-\u9fff]/.test(c)) {
        addKnownChar(c)
      }
    }
    setJustAdded(chars.length === 1 ? chars[0] : `${chars.length}个字`)
    setNewChar('')
    setTimeout(() => setJustAdded(null), 2000)
  }

  const handleRemove = (char: string) => {
    removeKnownChar(char)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">已知汉字</h2>
        <p className="text-gray-500 text-sm mt-1">
          共 <span className="font-bold text-red-600">{knownCharCount}</span> 个汉字
        </p>
      </div>

      {/* Add new character */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newChar}
          onChange={e => setNewChar(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="输入新认识的字..."
          className="flex-1 px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 text-base"
        />
        <button
          onClick={handleAdd}
          disabled={!newChar.trim()}
          className="px-5 py-3 bg-green-500 text-white rounded-2xl font-bold text-sm hover:bg-green-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          添加
        </button>
      </div>

      {justAdded && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-2 text-center text-green-700 text-sm font-medium animate-bounce-in">
          已添加「{justAdded}」
        </div>
      )}

      {/* Search + Edit toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索汉字..."
            className="w-full px-4 py-3 pl-10 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-base"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
            editMode ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {editMode ? '完成' : '编辑'}
        </button>
      </div>

      {/* Character grid */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8">没有找到匹配的汉字</p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {filtered.map(char => (
              <div
                key={char}
                className={`aspect-square flex items-center justify-center rounded-xl text-xl font-medium select-none relative ${
                  editMode
                    ? 'bg-red-50 text-gray-800 cursor-pointer hover:bg-red-100'
                    : 'bg-red-50 text-gray-800 hover:bg-red-600 hover:text-white transition-colors cursor-default'
                }`}
                onClick={() => editMode && handleRemove(char)}
              >
                {char}
                {editMode && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center leading-none">
                    ✕
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {search && (
        <p className="text-center text-sm text-gray-400">
          找到 {filtered.length} 个汉字
        </p>
      )}
    </div>
  )
}
