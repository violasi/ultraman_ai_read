import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTTS } from '../hooks/useTTS'
import { loadCatalog, loadBook } from '../lib/books'
import RubyText from '../components/shared/RubyText'
import type { StorySentence } from '../types/diary'

/** A single review item: either a picture book page or a diary sentence group */
interface ReviewItem {
  type: 'book-page' | 'diary'
  title: string
  imagePath?: string
  sentences: StorySentence[]
  sourceId: string
}

const REVIEW_COUNT = 3

export default function VocabReviewPage() {
  const { char } = useParams<{ char: string }>()
  const navigate = useNavigate()
  const { vocab, diaryEntries, isKnownChar, markReviewed, bookReadRecords } = useApp()
  const { speakChinese } = useTTS()

  const [items, setItems] = useState<ReviewItem[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedChar, setSelectedChar] = useState<{ char: string; pinyin: string } | null>(null)

  const entry = useMemo(() => vocab.find(v => v.char === char), [vocab, char])

  // Set of book IDs that have been read before
  const readBookIds = useMemo(() => new Set(bookReadRecords.map(r => r.bookId)), [bookReadRecords])

  // Build review items from diary entries and book pages
  useEffect(() => {
    if (!char) return
    let cancelled = false

    async function buildItems() {
      // Diary items are always "read" (user created them)
      const readItems: ReviewItem[] = []
      const unreadItems: ReviewItem[] = []

      // 1. Gather diary sentence items → only AI stories, skip picture-book entries
      for (const diary of diaryEntries) {
        if (diary.type === 'picture-book') continue
        for (const sentence of diary.sentences) {
          if (sentence.words.some(w => w.char === char)) {
            readItems.push({
              type: 'diary',
              title: diary.storyTitle,
              sentences: [sentence],
              sourceId: diary.id,
            })
          }
        }
      }

      // 2. Gather picture book page items, split by read/unread
      try {
        const catalog = await loadCatalog()
        const booksWithChar = catalog.filter(m => m.uniqueChars.includes(char))

        // Prioritize read books first in iteration order
        const sortedBooks = [
          ...booksWithChar.filter(m => readBookIds.has(m.id)),
          ...booksWithChar.filter(m => !readBookIds.has(m.id)),
        ]

        // Load up to 12 books to find pages
        for (const meta of sortedBooks.slice(0, 12)) {
          const book = await loadBook(meta.id)
          if (!book) continue
          const isRead = readBookIds.has(meta.id)
          for (const page of book.pages) {
            const hasChar = page.sentences.some(s => s.words.some(w => w.char === char))
            if (hasChar && page.imagePath) {
              const item: ReviewItem = {
                type: 'book-page',
                title: book.title,
                imagePath: page.imagePath,
                sentences: page.sentences,
                sourceId: book.id,
              }
              if (isRead) {
                readItems.push(item)
              } else {
                unreadItems.push(item)
              }
            }
          }
        }
      } catch {
        // catalog may not exist yet
      }

      if (cancelled) return

      // Shuffle within each priority group
      const shuffleArray = <T,>(arr: T[]) => arr.sort(() => Math.random() - 0.5)
      shuffleArray(readItems)
      shuffleArray(unreadItems)

      // Pick from read items first, then fill from unread
      const picked: ReviewItem[] = []
      for (const item of readItems) {
        if (picked.length >= REVIEW_COUNT) break
        picked.push(item)
      }
      for (const item of unreadItems) {
        if (picked.length >= REVIEW_COUNT) break
        picked.push(item)
      }

      setItems(picked)
      setLoading(false)
    }

    buildItems()
    return () => { cancelled = true }
  }, [char, diaryEntries, readBookIds])

  // Track whether we've already marked this review as done
  // (must be before any early returns to satisfy React hooks rules)
  const markedRef = useRef(false)
  const isDone = !loading && currentIdx >= items.length

  useEffect(() => {
    if (isDone && char && !markedRef.current) {
      markedRef.current = true
      markReviewed(char)
    }
  }, [isDone, char, markReviewed])

  useEffect(() => {
    if (currentIdx === 0) {
      markedRef.current = false
    }
  }, [currentIdx])

  if (!char || !entry) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">找不到这个生字</p>
        <button onClick={() => navigate('/vocab')} className="mt-4 text-[#E8453C] font-bold">返回生字本</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-20 space-y-4">
        <span className="text-5xl block animate-bounce">🔍</span>
        <p className="text-gray-500 font-bold">正在寻找含「{char}」的页面...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <span className="text-5xl block">😢</span>
        <p className="text-gray-500 font-bold">没有找到含「{char}」的绘本页面或日记</p>
        <button onClick={() => navigate('/vocab')} className="mt-4 text-[#E8453C] font-bold">返回生字本</button>
      </div>
    )
  }

  // All done
  if (isDone) {
    return (
      <div className="text-center py-12 space-y-6">
        <span className="text-6xl block">🎉</span>
        <div className="space-y-2">
          <p className="text-2xl font-black text-gray-800">
            复习完成！
          </p>
          <div className="inline-flex items-center gap-3 bg-[#FFF8F0] rounded-2xl px-6 py-4 border border-[#E8DED5]">
            <span className="text-5xl font-black text-[#E8453C]">{char}</span>
            <span className="text-lg text-gray-500">{entry.pinyin}</span>
          </div>
          <p className="text-sm text-gray-400">
            已复习 {entry.reviewCount + 1} 次
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/vocab')}
            className="px-6 py-3 rounded-2xl font-bold border-2 border-[#E8DED5] text-gray-600 hover:bg-gray-50 active:scale-[0.97] transition-all"
          >
            返回生字本
          </button>
          <button
            onClick={() => { setCurrentIdx(0); setLoading(true); setTimeout(() => setLoading(false), 100) }}
            className="px-6 py-3 rounded-2xl font-black bg-[#E8453C] text-white active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33]"
          >
            再复习一次
          </button>
        </div>
      </div>
    )
  }

  const item = items[currentIdx]

  const onCharClick = (c: string, pinyin: string) => {
    speakChinese(c)
    setSelectedChar({ char: c, pinyin })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => navigate('/vocab')} className="text-sm text-gray-400 font-bold">
          ← 返回
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#E8453C]">{char}</span>
          <span className="text-sm text-gray-400">{entry.pinyin}</span>
        </div>
        <span className="text-xs text-gray-400 font-bold">{currentIdx + 1}/{items.length}</span>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-3">
        {items.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < currentIdx ? 'bg-[#E8453C]' : i === currentIdx ? 'bg-[#E8453C] scale-125' : 'bg-[#E8DED5]'
            }`}
          />
        ))}
      </div>

      {/* Source title */}
      <div className="text-center mb-2">
        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
          {item.type === 'book-page' ? '📚 ' : '📖 '}{item.title}
        </span>
      </div>

      {/* Main content */}
      {item.imagePath ? (
        /* Book page: same layout as BookReadPage — image 2/3 left, text 1/3 right */
        <div className="flex gap-3 flex-1 min-h-0">
          {/* Left: page image - 2/3 width */}
          <div className="w-2/3 flex-shrink-0 rounded-2xl overflow-hidden border border-[#E8DED5] bg-white flex items-center">
            <img
              src={item.imagePath}
              alt="绘本页"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right: text - 1/3 width, vertically centered */}
          <div className="w-1/3 flex flex-col gap-2 min-h-0 justify-center">
            {/* Text area */}
            <div className="bg-[#FFF8F0] rounded-2xl p-3 border border-[#E8DED5] space-y-2 max-h-[60%] overflow-y-auto">
              {item.sentences.map((sentence, sIdx) => (
                <div key={sIdx} className="flex flex-wrap gap-0.5 justify-center">
                  {sentence.words.map((word, wIdx) => (
                    <RubyText
                      key={`${sIdx}-${wIdx}-${word.char}`}
                      char={word.char}
                      pinyin={word.pinyin}
                      isKnown={isKnownChar(word.char)}
                      highlight={word.char === char}
                      onClick={() => onCharClick(word.char, word.pinyin)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Selected char info */}
            {selectedChar && (
              <div className="flex-shrink-0 bg-yellow-50 border border-yellow-200 rounded-xl p-2">
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-2xl font-bold">{selectedChar.char}</span>
                  <span className="text-sm text-gray-500">{selectedChar.pinyin}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Diary item: text only, centered */
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="bg-[#FFF8F0] rounded-2xl p-4 border border-[#E8DED5] space-y-2 flex-1 flex flex-col justify-center">
            {item.sentences.map((sentence, sIdx) => (
              <div key={sIdx} className="flex flex-wrap gap-0.5 justify-center">
                {sentence.words.map((word, wIdx) => (
                  <RubyText
                    key={`${sIdx}-${wIdx}-${word.char}`}
                    char={word.char}
                    pinyin={word.pinyin}
                    isKnown={isKnownChar(word.char)}
                    highlight={word.char === char}
                    onClick={() => onCharClick(word.char, word.pinyin)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Selected char info */}
          {selectedChar && (
            <div className="flex-shrink-0 bg-yellow-50 border border-yellow-200 rounded-xl p-2">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-2xl font-bold">{selectedChar.char}</span>
                <span className="text-sm text-gray-500">{selectedChar.pinyin}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next button */}
      <button
        onClick={() => { setCurrentIdx(currentIdx + 1); setSelectedChar(null) }}
        className="flex-shrink-0 mt-2 w-full py-3 rounded-2xl font-black text-base bg-[#E8453C] text-white active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33]"
      >
        {currentIdx < items.length - 1 ? '下一个 →' : '完成复习 ✨'}
      </button>
    </div>
  )
}
