import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { loadCatalog, computeKnownRatio } from '../lib/books'
import { ULTRAMAN_CHARACTERS } from '../data/ultramanCharacters'
import UltramanAvatar from '../components/shared/UltramanAvatar'
import BookImage from '../components/shared/BookImage'
import type { PictureBookMeta } from '../types/picturebook'

type SortMode = 'ratio' | 'series'

export default function BookLibraryPage() {
  const navigate = useNavigate()
  const { knownChars, bookReadRecords } = useApp()
  const [catalog, setCatalog] = useState<PictureBookMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<PictureBookMeta | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>('ratio')

  useEffect(() => {
    loadCatalog().then(c => {
      setCatalog(c)
      setLoading(false)
    })
  }, [])

  // Build a map: bookId → list of hero IDs that read this book
  const bookHeroMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const r of bookReadRecords) {
      const heroes = map.get(r.bookId) || []
      if (!heroes.includes(r.heroId)) heroes.push(r.heroId)
      map.set(r.bookId, heroes)
    }
    return map
  }, [bookReadRecords])

  const handleHeroSelect = (heroId: string) => {
    if (!selectedBook) return
    navigate(`/books/read/${selectedBook.id}`, { state: { heroId } })
    setSelectedBook(null)
  }

  const sortedCatalog = [...catalog].sort((a, b) => {
    if (sortMode === 'ratio') {
      return computeKnownRatio(b, knownChars) - computeKnownRatio(a, knownChars)
    }
    const s = a.series.localeCompare(b.series)
    if (s !== 0) return s
    return a.id.localeCompare(b.id)
  })

  if (loading) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl block animate-bounce">📚</span>
        <p className="text-gray-500 font-bold mt-4">加载绘本馆...</p>
      </div>
    )
  }

  if (catalog.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <span className="text-5xl block">📭</span>
        <p className="text-xl font-black text-gray-800">绘本馆还是空的</p>
        <p className="text-gray-400 text-sm">上传你自己的绘本开始阅读吧</p>
        <button
          onClick={() => navigate('/books/manage')}
          className="mt-2 px-6 py-2 rounded-xl bg-[#E8453C] text-white font-bold text-sm active:scale-[0.97] transition-all"
        >
          + 添加绘本
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 py-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-800">绘本馆</h2>
            <p className="text-xs text-gray-400 mt-0.5">{catalog.length}本绘本</p>
          </div>
          <button
            onClick={() => navigate('/books/manage')}
            className="px-3 py-1.5 rounded-xl bg-[#E8453C] text-white text-xs font-bold active:scale-[0.97] transition-all"
          >
            + 添加
          </button>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2">
          {([['ratio', '按掌握度'], ['series', '按系列']] as [SortMode, string][]).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                sortMode === mode
                  ? 'bg-[#E8453C] text-white'
                  : 'bg-[#E8DED5] text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Book grid - 5 per row */}
        <div className="grid grid-cols-5 gap-2">
          {sortedCatalog.map(book => {
            const ratio = computeKnownRatio(book, knownChars)
            const pct = Math.round(ratio * 100)
            const heroIds = bookHeroMap.get(book.id) || []
            const barColor = ratio >= 0.85 ? 'bg-green-500' : ratio >= 0.65 ? 'bg-orange-400' : 'bg-red-400'

            return (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className="text-left bg-white rounded-xl border border-[#E8DED5] overflow-hidden active:scale-[0.95] transition-all"
              >
                {/* Cover with hero avatar overlay */}
                <div className="relative aspect-[3/4] bg-white overflow-hidden">
                  <BookImage
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-contain"
                  />
                  {/* Hero avatars */}
                  {heroIds.length > 0 && (
                    <div className="absolute bottom-0 right-0 flex -space-x-1.5 p-0.5">
                      {heroIds.slice(0, 3).map(hid => {
                        const hero = ULTRAMAN_CHARACTERS.find(c => c.id === hid)
                        if (!hero) return null
                        return (
                          <img
                            key={hid}
                            src={hero.imageUrl}
                            alt={hero.shortName}
                            className="w-5 h-5 rounded-full border border-white object-cover"
                          />
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Compact info */}
                <div className="p-1 space-y-0.5">
                  <p className="text-[10px] font-bold text-gray-800 leading-tight line-clamp-1">{book.title}</p>
                  {/* Ratio bar */}
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 shrink-0">{pct}%</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Hero selection bottom sheet */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={() => setSelectedBook(null)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-lg mx-auto bg-[#FFF8F0] rounded-t-3xl p-6 space-y-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E8DED5] rounded-full mx-auto" />

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-gray-800">谁来陪你读？</h3>
              <p className="text-sm text-gray-500">《{selectedBook.title}》</p>
              <p className="text-xs text-gray-400">
                已掌握 {Math.round(computeKnownRatio(selectedBook, knownChars) * 100)}% 的字
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {ULTRAMAN_CHARACTERS.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleHeroSelect(c.id)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 border-[#E8DED5] bg-white hover:border-[#E8453C]/40 active:scale-[0.95] transition-all"
                >
                  <UltramanAvatar character={c} size="sm" />
                  <span className="text-xs font-bold text-gray-600">{c.shortName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
