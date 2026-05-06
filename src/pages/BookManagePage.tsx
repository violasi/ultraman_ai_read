import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  saveUserBook,
  deleteUserBook,
  getAllBookImages,
  makeIdbPath,
} from '../lib/bookStorage'
import { loadCatalog, loadBook, clearCatalogCache } from '../lib/books'
import { AI_PROMPT_TEMPLATE } from '../lib/aiPromptTemplate'
import { validateBookJson } from '../lib/bookValidation'
import type { PictureBookMeta, PictureBook } from '../types/picturebook'

type Step = 'list' | 'info' | 'ai' | 'preview'

export default function BookManagePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('list')
  const [userBooks, setUserBooks] = useState<PictureBookMeta[]>([])
  const [loading, setLoading] = useState(true)

  // Step 1 state
  const [title, setTitle] = useState('')
  const [series, setSeries] = useState('')
  const [level, setLevel] = useState('')
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 2 state
  const [jsonInput, setJsonInput] = useState('')
  const [validationMsg, setValidationMsg] = useState<{ ok: boolean; msg: string } | null>(null)
  const [validatedBook, setValidatedBook] = useState<PictureBook | null>(null)
  const [copied, setCopied] = useState(false)

  // Import
  const importRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState('')

  const refreshBooks = useCallback(async () => {
    try {
      clearCatalogCache()
      const all = await loadCatalog()
      setUserBooks(all)
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { refreshBooks() }, [refreshBooks])

  // --- Image handling ---

  const compressImage = (file: File, maxWidth = 1200): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          blob => resolve(blob || file),
          'image/jpeg',
          0.85,
        )
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages(prev => [...prev, ...newImages])
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  // --- Validation ---

  const bookId = `user-${Date.now()}`

  // --- Save ---

  const handleSave = async () => {
    if (!validatedBook) return
    const compressedImages = await Promise.all(
      images.map(async (img, i) => ({
        pageIndex: i,
        blob: await compressImage(img.file),
      })),
    )
    await saveUserBook(validatedBook, compressedImages)
    clearCatalogCache()

    // Cleanup previews
    images.forEach(img => URL.revokeObjectURL(img.preview))

    navigate('/books/library')
  }

  // --- Delete ---

  const handleDelete = async (id: string) => {
    await deleteUserBook(id)
    clearCatalogCache()
    refreshBooks()
  }

  // --- Export single book ---

  const exportBookData = async (meta: PictureBookMeta): Promise<{ book: PictureBook; images: Record<number, string> } | null> => {
    const book = await loadBook(meta.id)
    if (!book) return null

    const imagesBase64: Record<number, string> = {}

    // Try IndexedDB images first
    const idbImages = await getAllBookImages(meta.id)
    if (idbImages.length > 0) {
      for (const img of idbImages) {
        const reader = new FileReader()
        const b64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(img.blob)
        })
        imagesBase64[img.pageIndex] = b64
      }
    } else {
      // Fetch static images from /books/{id}/pages/
      for (let i = 0; i < meta.pageCount; i++) {
        try {
          const pageNum = String(i + 1).padStart(2, '0')
          const res = await fetch(`/books/${meta.id}/pages/page-${pageNum}.jpg`)
          if (!res.ok) continue
          const blob = await res.blob()
          const reader = new FileReader()
          const b64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          imagesBase64[i] = b64
        } catch { /* skip */ }
      }
    }

    return { book, images: imagesBase64 }
  }

  const handleExport = async (meta: PictureBookMeta) => {
    const data = await exportBookData(meta)
    if (!data) return

    const exportData = { version: 1, ...data }
    const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `绘本-${meta.title}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Export series ---

  const getSeriesList = () => {
    const seriesMap = new Map<string, PictureBookMeta[]>()
    for (const book of userBooks) {
      const s = book.series || '未分类'
      const list = seriesMap.get(s) || []
      list.push(book)
      seriesMap.set(s, list)
    }
    return seriesMap
  }

  const handleExportSeries = async (seriesName: string, books: PictureBookMeta[]) => {
    const allBooks = []
    for (const meta of books) {
      const data = await exportBookData(meta)
      if (data) allBooks.push(data)
    }

    const exportData = { version: 2, type: 'series', series: seriesName, books: allBooks }
    const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `绘本系列-${seriesName}-${books.length}本.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportAll = async () => {
    const seriesMap = getSeriesList()
    for (const [seriesName, books] of seriesMap) {
      await handleExportSeries(seriesName, books)
    }
  }

  // --- Import ---

  const importOneBook = async (bookData: { book: PictureBook; images: Record<string, string> }) => {
    const imageBlobs = await Promise.all(
      Object.entries(bookData.images).map(async ([pageIdx, b64]) => {
        const res = await fetch(b64 as string)
        const blob = await res.blob()
        return { pageIndex: parseInt(pageIdx), blob }
      }),
    )

    // Rewrite image paths to idb:// so BookImage can resolve them from IndexedDB
    // The export stores images keyed by 0-based index (matching page-01.jpg, page-02.jpg, etc.)
    // But book pages may reference non-sequential images (e.g., pageIndex 0 → page-04.jpg)
    // So we must extract the original image number from imagePath to find the correct idb key
    const book = { ...bookData.book }
    const extractImageIndex = (imagePath: string): number => {
      const m = imagePath.match(/page-(\d+)\./)
      return m ? parseInt(m[1], 10) - 1 : 0  // page-01.jpg → index 0
    }
    book.pages = book.pages.map(p => ({
      ...p,
      imagePath: makeIdbPath(book.id, extractImageIndex(p.imagePath)),
    }))
    book.coverImage = book.pages[0]?.imagePath || makeIdbPath(book.id, 0)

    await saveUserBook(book, imageBlobs)
  }

  const importOneFile = async (file: File): Promise<string> => {
    const text = await file.text()
    const data = JSON.parse(text)

    // v2: series bundle (multiple books)
    if (data.version === 2 && data.type === 'series' && Array.isArray(data.books)) {
      let count = 0
      for (const bookData of data.books) {
        if (bookData.book && bookData.images) {
          await importOneBook(bookData)
          count++
        }
      }
      return `${data.series}（${count}本）`
    }

    // v1: single book
    if (!data.book || !data.images) throw new Error('格式错误')
    await importOneBook(data)
    return `《${data.book.title}》`
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const results: string[] = []
    const errors: string[] = []

    for (const file of Array.from(files)) {
      try {
        const msg = await importOneFile(file)
        results.push(msg)
      } catch {
        errors.push(file.name)
      }
    }

    clearCatalogCache()
    refreshBooks()

    const parts = []
    if (results.length) parts.push(`导入成功：${results.join('、')}`)
    if (errors.length) parts.push(`导入失败：${errors.join('、')}`)
    setImportMsg(parts.join('；'))

    e.target.value = ''
  }

  // --- Copy prompt ---

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(AI_PROMPT_TEMPLATE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- Reset wizard ---

  const resetWizard = () => {
    setStep('list')
    setTitle('')
    setSeries('')
    setLevel('')
    images.forEach(img => URL.revokeObjectURL(img.preview))
    setImages([])
    setJsonInput('')
    setValidationMsg(null)
    setValidatedBook(null)
  }

  // ======================== RENDER ========================

  // --- My Books List ---
  if (step === 'list') {
    return (
      <div className="space-y-4 py-2 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800">绘本管理</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 font-bold"
          >
            返回
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setStep('info')}
            className="flex-1 py-3 rounded-2xl bg-[var(--color-primary)] text-white font-black text-base active:scale-[0.97] transition-all"
          >
            + 添加绘本
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] text-gray-600 font-bold text-sm active:scale-[0.97] transition-all"
          >
            导入
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            multiple
            className="hidden"
            onChange={handleImport}
          />
        </div>

        {importMsg && (
          <p className={`text-sm text-center ${importMsg.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>
            {importMsg}
          </p>
        )}

        {/* Book list */}
        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : userBooks.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <span className="text-5xl block">📚</span>
            <p className="text-gray-500 font-bold">还没有上传的绘本</p>
            <p className="text-gray-400 text-sm">点击上方"添加绘本"开始上传</p>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={handleExportAll}
                className="text-xs text-[var(--color-primary)] font-bold px-3 py-2"
              >
                全部导出（按系列）
              </button>
            </div>
            <div className="space-y-4">
              {[...getSeriesList()].map(([seriesName, books]) => (
                <div key={seriesName}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black text-gray-700">{seriesName}（{books.length}本）</h3>
                    <button
                      onClick={() => handleExportSeries(seriesName, books)}
                      className="text-xs text-[var(--color-primary)] font-bold"
                    >
                      导出此系列
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {books.map(book => (
                      <div
                        key={book.id}
                        className="bg-[var(--color-bg-warm)] rounded-2xl p-3 border border-[var(--color-border)] flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{book.title}</p>
                          <p className="text-xs text-gray-400">{book.pageCount}页 · {book.uniqueChars.length}字</p>
                        </div>
                        <button
                          onClick={() => handleExport(book)}
                          className="text-xs text-blue-500 font-bold px-2 py-1"
                        >
                          导出
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-xs text-red-400 font-bold px-2 py-1"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // --- Step 1: Book Info ---
  if (step === 'info') {
    return (
      <div className="space-y-4 py-2 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-800">1/3 绘本信息</h2>
          <button onClick={resetWizard} className="text-sm text-gray-500 font-bold">取消</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-1">书名 *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例：小猫喝水"
              className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-600 block mb-1">系列</label>
              <input
                value={series}
                onChange={e => setSeries(e.target.value)}
                placeholder="例：摩比汉语分级"
                className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-600 block mb-1">级别</label>
              <input
                value={level}
                onChange={e => setLevel(e.target.value)}
                placeholder="例：萌芽"
                className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="text-sm font-bold text-gray-600 block mb-2">页面照片 *</label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-24 rounded-xl overflow-hidden border border-[var(--color-border)]">
                <img src={img.preview} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-bl-lg"
                >
                  x
                </button>
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center">
                  {i + 1}
                </span>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-24 rounded-xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <span className="text-2xl">+</span>
              <span className="text-[10px]">添加</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAddImages}
          />
        </div>

        <button
          onClick={() => setStep('ai')}
          disabled={!title.trim() || images.length === 0}
          className="w-full py-3 rounded-2xl font-black text-base bg-[var(--color-primary)] text-white active:scale-[0.97] transition-all disabled:opacity-40"
        >
          下一步 →
        </button>
      </div>
    )
  }

  // --- Step 2: AI Text Extraction ---
  if (step === 'ai') {
    return (
      <div className="space-y-4 py-2 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-800">2/3 文字提取</h2>
          <button onClick={resetWizard} className="text-sm text-gray-500 font-bold">取消</button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 space-y-2">
          <p className="text-sm font-bold text-blue-800">使用 AI 提取绘本文字</p>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>复制下方的提示词</li>
            <li>打开 ChatGPT 或 Claude</li>
            <li>上传刚才选择的 {images.length} 张页面照片</li>
            <li>粘贴提示词，发送</li>
            <li>复制 AI 返回的 JSON，粘贴到下方</li>
          </ol>
        </div>

        {/* Prompt */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-bold text-gray-600">提示词</label>
            <button
              onClick={handleCopyPrompt}
              className="text-xs font-bold text-[var(--color-primary)]"
            >
              {copied ? '已复制 ✓' : '复制'}
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-[var(--color-border)] max-h-32 overflow-y-auto">
            <pre className="text-[11px] text-gray-600 whitespace-pre-wrap">{AI_PROMPT_TEMPLATE}</pre>
          </div>
        </div>

        {/* JSON paste */}
        <div>
          <label className="text-sm font-bold text-gray-600 block mb-1">粘贴 AI 返回的 JSON</label>
          <textarea
            value={jsonInput}
            onChange={e => { setJsonInput(e.target.value); setValidationMsg(null) }}
            placeholder='{"pages": [...]}'
            rows={8}
            className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-white text-xs font-mono focus:border-[var(--color-primary)] focus:outline-none resize-none"
          />
        </div>

        {validationMsg && (
          <p className={`text-sm font-bold ${validationMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
            {validationMsg.ok ? '✓ ' : '✗ '}{validationMsg.msg}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setStep('info')}
            className="flex-1 py-3 rounded-2xl border-2 border-[var(--color-border)] text-gray-600 font-bold active:scale-[0.97] transition-all"
          >
            ← 上一步
          </button>
          <button
            onClick={() => {
              const result = validateBookJson(
                jsonInput,
                images.length,
                bookId,
                (pageIndex) => makeIdbPath(bookId, pageIndex),
              )
              if (result.ok) {
                const book: PictureBook = {
                  id: bookId,
                  title: title.trim(),
                  series: series.trim() || '用户上传',
                  level: level.trim() || '',
                  pageCount: images.length,
                  uniqueChars: result.uniqueChars,
                  coverImage: makeIdbPath(bookId, 0),
                  pages: result.pages,
                }
                setValidatedBook(book)
                setValidationMsg({ ok: true, msg: `验证通过！${result.pages.length} 页，${result.uniqueChars.length} 个生字` })
                setStep('preview')
              } else {
                setValidationMsg({ ok: false, msg: result.error })
                setValidatedBook(null)
              }
            }}
            disabled={!jsonInput.trim()}
            className="flex-1 py-3 rounded-2xl bg-[var(--color-primary)] text-white font-black active:scale-[0.97] transition-all disabled:opacity-40"
          >
            验证并预览
          </button>
        </div>
      </div>
    )
  }

  // --- Step 3: Preview & Save ---
  if (step === 'preview') {
    return (
      <div className="space-y-4 py-2 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-800">3/3 确认保存</h2>
          <button onClick={resetWizard} className="text-sm text-gray-500 font-bold">取消</button>
        </div>

        {validatedBook && (
          <div className="bg-[var(--color-bg-warm)] rounded-2xl p-5 border border-[var(--color-border)] space-y-4">
            {/* Cover preview */}
            {images[0] && (
              <div className="w-32 h-40 mx-auto rounded-xl overflow-hidden border border-[var(--color-border)]">
                <img src={images[0].preview} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-gray-800">{validatedBook.title}</h3>
              <p className="text-sm text-gray-500">
                {validatedBook.series}{validatedBook.level ? ` · ${validatedBook.level}` : ''}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <span className="text-2xl font-black text-[var(--color-primary)]">{validatedBook.pageCount}</span>
                <p className="text-xs text-gray-400">页</p>
              </div>
              <div className="text-center">
                <span className="text-2xl font-black text-orange-500">{validatedBook.uniqueChars.length}</span>
                <p className="text-xs text-gray-400">不同汉字</p>
              </div>
              <div className="text-center">
                <span className="text-2xl font-black text-blue-500">
                  {validatedBook.pages.reduce((sum, p) => sum + p.sentences.length, 0)}
                </span>
                <p className="text-xs text-gray-400">句</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setStep('ai')}
            className="flex-1 py-3 rounded-2xl border-2 border-[var(--color-border)] text-gray-600 font-bold active:scale-[0.97] transition-all"
          >
            ← 返回修改
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-[var(--color-secondary)] text-gray-800 font-black active:scale-[0.97] transition-all shadow-[0_3px_0_var(--color-secondary-dark)]"
          >
            保存绘本 ✨
          </button>
        </div>
      </div>
    )
  }

  return null
}
