import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useReadingTracker, type ReadingResult } from '../hooks/useReadingTracker'
import { loadBook } from '../lib/books'
import { getCharacterById } from '../data/ultramanCharacters'
import { useTTS } from '../hooks/useTTS'
import RubyText from '../components/shared/RubyText'
import UltramanAvatar from '../components/shared/UltramanAvatar'
import BookImage from '../components/shared/BookImage'
import type { PictureBook } from '../types/picturebook'
import type { DiaryEntry, StorySentence } from '../types/diary'

export default function BookReadPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const heroId = (location.state as { heroId?: string })?.heroId ?? ''
  const hero = getCharacterById(heroId)

  const { isKnownChar, addDiaryEntry, addBookReadRecord, getBookReadCountForHero } = useApp()
  const { handleCharClick, processReadingResult } = useReadingTracker()
  const { speakChinese } = useTTS()

  const [book, setBook] = useState<PictureBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedChar, setSelectedChar] = useState<{ char: string; pinyin: string } | null>(null)
  const [readingSummary, setReadingSummary] = useState<ReadingResult | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!bookId) return
    loadBook(bookId).then(b => {
      setBook(b)
      setLoading(false)
    })
  }, [bookId])

  if (loading) {
    return (
      <div className="text-center py-20 space-y-4">
        <span className="text-5xl block animate-bounce">📖</span>
        <p className="text-gray-500 font-bold">正在加载绘本...</p>
      </div>
    )
  }

  if (!book || !hero) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">😕</span>
        <p className="text-gray-500">找不到这本绘本</p>
        <button onClick={() => navigate('/books')} className="mt-4 text-[#E8453C] font-bold">
          返回绘本列表
        </button>
      </div>
    )
  }

  const page = book.pages[currentPage]
  const totalPages = book.pages.length

  const onCharClick = (char: string, pinyin: string) => {
    handleCharClick(char, pinyin)
    setSelectedChar({ char, pinyin })
  }

  const speakPage = () => {
    const text = page.sentences.flatMap(s => s.words.map(w => w.char)).join('')
    speakChinese(text)
  }

  const goPrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      setSelectedChar(null)
    }
  }

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
      setSelectedChar(null)
    }
  }

  const finishReading = () => {
    // Collect all sentences from all pages
    const allSentences: StorySentence[] = book.pages.flatMap(p => p.sentences)

    const now = new Date()
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const result = processReadingResult(`book-${book.id}`, date, allSentences)
    setReadingSummary(result)

    // Save book read record
    addBookReadRecord({
      bookId: book.id,
      bookTitle: book.title,
      heroId,
      date,
      readAt: now.toISOString(),
    })

    // Also save as diary entry
    const entry: DiaryEntry = {
      id: `book-${Date.now()}`,
      date,
      storyTitle: book.title,
      selectedUltramans: [heroId],
      happyEvent: `和${hero.shortName}一起读绘本`,
      sentences: allSentences,
      createdAt: now.toISOString(),
      type: 'picture-book',
      bookId: book.id,
      bookTitle: book.title,
    }
    addDiaryEntry(entry)

    setFinished(true)
  }

  // --- Completion screen ---
  if (finished) {
    const readCount = getBookReadCountForHero(heroId)
    return (
      <div className="space-y-6 py-8">
        <div className="text-center space-y-4">
          <UltramanAvatar character={hero} size="lg" />
          <div className="bg-[#FFF8F0] rounded-2xl p-5 border border-[#E8DED5] space-y-3">
            <p className="text-xl font-black text-gray-800">
              这是你给{hero.shortName}读的第{readCount}个故事
            </p>
            <p className="text-lg text-[#E8453C] font-bold">
              {hero.shortName}说：很喜欢这个故事！
            </p>
            <p className="text-sm text-gray-400">《{book.title}》</p>
          </div>
        </div>

        {readingSummary && (readingSummary.newlyLearned.length > 0 || readingSummary.forgotten.length > 0) && (
          <div className="bg-white border-2 border-yellow-300 rounded-2xl p-4 space-y-3">
            <h3 className="text-base font-bold text-gray-800 text-center">📊 阅读小结</h3>
            {readingSummary.newlyLearned.length > 0 && (
              <div className="bg-[#E8453C]/10 rounded-xl p-3">
                <p className="text-sm font-bold text-[#E8453C] mb-1">
                  🎉 新学会 {readingSummary.newlyLearned.length} 个字！
                </p>
                <p className="text-xl tracking-wider text-[#E8453C]">
                  {readingSummary.newlyLearned.join(' ')}
                </p>
                <p className="text-xs text-[#E8453C]/60 mt-1">（整篇没有点击发音 = 你已经认识了）</p>
              </div>
            )}
            {readingSummary.forgotten.length > 0 && (
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-sm font-bold text-orange-700 mb-1">
                  📝 需要复习 {readingSummary.forgotten.length} 个字
                </p>
                <p className="text-xl tracking-wider text-orange-800">
                  {readingSummary.forgotten.join(' ')}
                </p>
                <p className="text-xs text-orange-600 mt-1">（点了发音 = 还不太熟，移入生字本）</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => navigate('/books')}
          className="w-full py-4 rounded-2xl font-black text-lg bg-[#FFD93D] text-gray-800 active:scale-[0.97] transition-all shadow-[0_3px_0_#c9a820]"
        >
          完成阅读 ✨
        </button>
      </div>
    )
  }

  // --- Reading screen ---
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-black text-gray-800 truncate flex-1">{book.title}</h2>
        <span className="text-xs text-gray-400 font-bold ml-2">{currentPage + 1}/{totalPages}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#E8DED5] rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-[#E8453C] rounded-full transition-all duration-300"
          style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
        />
      </div>

      {/* Main content: image left 2/3, text right 1/3 */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Left: page image - 2/3 width */}
        <div className="w-2/3 flex-shrink-0 rounded-2xl overflow-hidden border border-[#E8DED5] bg-white flex items-center">
          <BookImage
            src={page.imagePath}
            alt={`第${currentPage + 1}页`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right: Ultraman avatar + text - 1/3 width, vertically centered */}
        <div className="w-1/3 flex flex-col gap-2 min-h-0 justify-center">
          {/* Ultraman avatar - prominent */}
          <div className="flex-shrink-0 flex justify-center py-2">
            <div className="bg-white rounded-full p-1.5 shadow-lg border-2 border-[#E8DED5]">
              <UltramanAvatar character={hero} size="lg" />
            </div>
          </div>

          {/* Text area */}
          {page.sentences.length > 0 && (
            <div className="bg-[#FFF8F0] rounded-2xl p-3 border border-[#E8DED5] space-y-2 max-h-[60%] overflow-y-auto">
              {page.sentences.map((sentence, sIdx) => (
                <div key={sIdx} className="flex flex-wrap gap-0.5 justify-center">
                  {sentence.words.map((word, wIdx) => (
                    <RubyText
                      key={`${sIdx}-${wIdx}-${word.char}`}
                      char={word.char}
                      pinyin={word.pinyin}
                      isKnown={isKnownChar(word.char)}
                      onClick={() => onCharClick(word.char, word.pinyin)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Speak button */}
          {page.sentences.length > 0 && (
            <button
              onClick={speakPage}
              className="flex-shrink-0 py-1.5 text-center text-[#E8453C] font-bold text-sm hover:bg-[#E8453C]/10 rounded-xl transition-colors"
            >
              🔊 听整页
            </button>
          )}

          {/* Selected char info */}
          {selectedChar && (
            <div className="flex-shrink-0 bg-yellow-50 border border-yellow-200 rounded-xl p-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{selectedChar.char}</span>
                <span className="text-sm text-gray-500">{selectedChar.pinyin}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2 flex-shrink-0">
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          className="flex-1 py-3 rounded-2xl font-bold text-base border-2 border-[#E8DED5] text-gray-600 hover:bg-[#F0E6DD] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all"
        >
          ← 上一页
        </button>
        {currentPage < totalPages - 1 ? (
          <button
            onClick={goNext}
            className="flex-1 py-3 rounded-2xl font-black text-base bg-[#E8453C] text-white active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33]"
          >
            下一页 →
          </button>
        ) : (
          <button
            onClick={finishReading}
            className="flex-1 py-3 rounded-2xl font-black text-base bg-[#FFD93D] text-gray-800 active:scale-[0.97] transition-all shadow-[0_3px_0_#c9a820]"
          >
            读完了 ✨
          </button>
        )}
      </div>
    </div>
  )
}
