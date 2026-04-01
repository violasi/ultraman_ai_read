import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ULTRAMAN_CHARACTERS } from '../data/ultramanCharacters'
import { loadCatalog, recommendBook, computeKnownRatio } from '../lib/books'
import UltramanAvatar from '../components/shared/UltramanAvatar'
import type { PictureBookMeta } from '../types/picturebook'

type Step = 'select-hero' | 'loading' | 'book-ready' | 'no-books'

export default function BookSelectPage() {
  const navigate = useNavigate()
  const { knownChars, bookReadRecords } = useApp()
  const [step, setStep] = useState<Step>('select-hero')
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null)
  const [recommendedBook, setRecommendedBook] = useState<PictureBookMeta | null>(null)
  const [knownRatio, setKnownRatio] = useState(0)
  const [skipIndex, setSkipIndex] = useState(0)
  const [catalogLength, setCatalogLength] = useState(0)

  const handleHeroSelect = (heroId: string) => {
    setSelectedHeroId(heroId)
  }

  const handleFindBook = async () => {
    if (!selectedHeroId) return
    setStep('loading')
    setSkipIndex(0)

    const catalog = await loadCatalog()
    if (catalog.length === 0) {
      setStep('no-books')
      return
    }

    setCatalogLength(catalog.length)
    const book = recommendBook(catalog, knownChars, bookReadRecords, selectedHeroId, 0)
    if (book) {
      setRecommendedBook(book)
      setKnownRatio(computeKnownRatio(book, knownChars))
      setStep('book-ready')
    } else {
      setStep('no-books')
    }
  }

  const handleRefresh = async () => {
    if (!selectedHeroId) return
    setStep('loading')
    const nextIndex = (skipIndex + 1) % (catalogLength || 1)
    setSkipIndex(nextIndex)
    const catalog = await loadCatalog()
    setCatalogLength(catalog.length)
    const book = recommendBook(catalog, knownChars, bookReadRecords, selectedHeroId, nextIndex)
    if (book) {
      setRecommendedBook(book)
      setKnownRatio(computeKnownRatio(book, knownChars))
      setStep('book-ready')
    } else {
      setStep('no-books')
    }
  }

  const startReading = () => {
    if (!recommendedBook || !selectedHeroId) return
    navigate(`/books/read/${recommendedBook.id}`, { state: { heroId: selectedHeroId } })
  }

  // --- Loading ---
  if (step === 'loading') {
    return (
      <div className="text-center py-20 space-y-4">
        <span className="text-5xl block animate-bounce">📚</span>
        <p className="text-gray-500 font-bold">正在寻找合适的绘本...</p>
      </div>
    )
  }

  // --- No books ---
  if (step === 'no-books') {
    return (
      <div className="text-center py-16 space-y-4">
        <span className="text-5xl block">📭</span>
        <h2 className="text-xl font-black text-gray-800">暂时没有可读的绘本</h2>
        <p className="text-gray-400 text-sm">还没有处理好的绘本数据，请稍后再试</p>
        <button
          onClick={() => setStep('select-hero')}
          className="mt-4 px-6 py-3 rounded-2xl border-2 border-[#E8DED5] text-gray-600 font-bold active:scale-[0.97] transition-all"
        >
          ← 返回选择
        </button>
      </div>
    )
  }

  // --- Book ready ---
  if (step === 'book-ready' && recommendedBook && selectedHeroId) {
    const hero = ULTRAMAN_CHARACTERS.find(c => c.id === selectedHeroId)!
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-2">
          <UltramanAvatar character={hero} size="lg" />
          <h2 className="text-xl font-black text-gray-800 mt-2">{hero.shortName}推荐了一本书</h2>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#E8DED5] overflow-hidden shadow-sm">
          <img
            src={recommendedBook.coverImage}
            alt={recommendedBook.title}
            className="w-full max-h-48 object-contain bg-gray-50"
          />
          <div className="p-4 space-y-2">
            <h3 className="text-2xl font-black text-gray-800 text-center">{recommendedBook.title}</h3>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
              <span>{recommendedBook.level}</span>
              <span>·</span>
              <span>{recommendedBook.pageCount}页</span>
              <span>·</span>
              <span className={`font-bold ${knownRatio >= 0.8 ? 'text-green-600' : 'text-orange-500'}`}>
                认识{Math.round(knownRatio * 100)}%的字
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={startReading}
          className="w-full py-4 rounded-2xl font-black text-lg bg-[#E8453C] text-white active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33]"
        >
          开始阅读 📖
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => { setSelectedHeroId(null); setSkipIndex(0); setStep('select-hero') }}
            className="flex-1 py-3 rounded-2xl font-bold text-base border-2 border-[#E8DED5] text-gray-600 hover:bg-[#F0E6DD] active:scale-[0.97] transition-all"
          >
            ← 换奥特曼
          </button>
          <button
            onClick={handleRefresh}
            className="flex-1 py-3 rounded-2xl font-bold text-base border-2 border-[#E8DED5] text-gray-600 hover:bg-[#F0E6DD] active:scale-[0.97] transition-all"
          >
            🔄 换一本
          </button>
        </div>
      </div>
    )
  }

  // --- Select hero ---
  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-gray-800">谁来陪你读绘本？</h2>
        <p className="text-sm text-gray-400">选一个奥特曼陪你读故事吧</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ULTRAMAN_CHARACTERS.map(c => {
          const selected = selectedHeroId === c.id
          return (
            <button
              key={c.id}
              onClick={() => handleHeroSelect(c.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-[0.95] ${
                selected
                  ? 'border-[#E8453C] bg-[#E8453C]/5 shadow-md'
                  : 'border-[#E8DED5] bg-white hover:border-[#E8453C]/30'
              }`}
            >
              <UltramanAvatar character={c} size="md" />
              <span className={`text-sm font-bold ${selected ? 'text-[#E8453C]' : 'text-gray-600'}`}>
                {c.shortName}
              </span>
              {selected && (
                <span className="text-xs text-[#E8453C]">✓ 已选</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleFindBook}
        disabled={!selectedHeroId}
        className="w-full py-4 rounded-2xl font-black text-lg bg-[#E8453C] text-white active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        找绘本 📖
      </button>
    </div>
  )
}
