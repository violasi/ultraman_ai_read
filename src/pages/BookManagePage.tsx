import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  saveUserBook,
  listUserBooks,
  deleteUserBook,
  getAllBookImages,
  getUserBook,
  makeIdbPath,
} from '../lib/bookStorage'
import { clearCatalogCache } from '../lib/books'
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
      const books = await listUserBooks()
      setUserBooks(books)
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

  const handleExport = async (meta: PictureBookMeta) => {
    const book = await getUserBook(meta.id)
    if (!book) return

    const bookImages = await getAllBookImages(meta.id)
    const imagesBase64: Record<number, string> = {}
    for (const img of bookImages) {
      const reader = new FileReader()
      const b64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(img.blob)
      })
      imagesBase64[img.pageIndex] = b64
    }

    const exportData = { version: 1, book, images: imagesBase64 }
    const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `绘本-${meta.title}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Export all ---

  const handleExportAll = async () => {
    for (const book of userBooks) {
      await handleExport(book)
    }
  }

  // --- Import ---

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (!data.book || !data.images) {
          setImportMsg('文件格式不正确')
          return
        }

        const book: PictureBook = data.book
        const imagesMap: Record<string, string> = data.images

        // Convert base64 back to blobs
        const imageBlobs = await Promise.all(
          Object.entries(imagesMap).map(async ([pageIdx, b64]) => {
            const res = await fetch(b64 as string)
            const blob = await res.blob()
            return { pageIndex: parseInt(pageIdx), blob }
          }),
        )

        await saveUserBook(book, imageBlobs)
        clearCatalogCache()
        setImportMsg(`导入成功：《${book.title}》`)
        refreshBooks()
      } catch {
        setImportMsg('导入失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
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
            className="flex-1 py-3 rounded-2xl bg-[#E8453C] text-white font-black text-base active:scale-[0.97] transition-all"
          >
            + 添加绘本
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="px-4 py-3 rounded-2xl border-2 border-[#E8DED5] text-gray-600 font-bold text-sm active:scale-[0.97] transition-all"
          >
            导入
          </button>
          <input
            ref={importRef}
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
                className="text-xs text-[#E8453C] font-bold"
              >
                全部导出
              </button>
            </div>
            <div className="space-y-2">
              {userBooks.map(book => (
                <div
                  key={book.id}
                  className="bg-[#FFF8F0] rounded-2xl p-3 border border-[#E8DED5] flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{book.title}</p>
                    <p className="text-xs text-gray-400">{book.series} · {book.pageCount}页 · {book.uniqueChars.length}字</p>
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
              className="w-full p-3 rounded-xl border border-[#E8DED5] bg-white text-sm focus:border-[#E8453C] focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-600 block mb-1">系列</label>
              <input
                value={series}
                onChange={e => setSeries(e.target.value)}
                placeholder="例：摩比汉语分级"
                className="w-full p-3 rounded-xl border border-[#E8DED5] bg-white text-sm focus:border-[#E8453C] focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-600 block mb-1">级别</label>
              <input
                value={level}
                onChange={e => setLevel(e.target.value)}
                placeholder="例：萌芽"
                className="w-full p-3 rounded-xl border border-[#E8DED5] bg-white text-sm focus:border-[#E8453C] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="text-sm font-bold text-gray-600 block mb-2">页面照片 *</label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-24 rounded-xl overflow-hidden border border-[#E8DED5]">
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
              className="w-20 h-24 rounded-xl border-2 border-dashed border-[#E8DED5] flex flex-col items-center justify-center text-gray-400 hover:border-[#E8453C] hover:text-[#E8453C] transition-colors"
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
          className="w-full py-3 rounded-2xl font-black text-base bg-[#E8453C] text-white active:scale-[0.97] transition-all disabled:opacity-40"
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
              className="text-xs font-bold text-[#E8453C]"
            >
              {copied ? '已复制 ✓' : '复制'}
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-[#E8DED5] max-h-32 overflow-y-auto">
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
            className="w-full p-3 rounded-xl border border-[#E8DED5] bg-white text-xs font-mono focus:border-[#E8453C] focus:outline-none resize-none"
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
            className="flex-1 py-3 rounded-2xl border-2 border-[#E8DED5] text-gray-600 font-bold active:scale-[0.97] transition-all"
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
            className="flex-1 py-3 rounded-2xl bg-[#E8453C] text-white font-black active:scale-[0.97] transition-all disabled:opacity-40"
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
          <div className="bg-[#FFF8F0] rounded-2xl p-5 border border-[#E8DED5] space-y-4">
            {/* Cover preview */}
            {images[0] && (
              <div className="w-32 h-40 mx-auto rounded-xl overflow-hidden border border-[#E8DED5]">
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
                <span className="text-2xl font-black text-[#E8453C]">{validatedBook.pageCount}</span>
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
            className="flex-1 py-3 rounded-2xl border-2 border-[#E8DED5] text-gray-600 font-bold active:scale-[0.97] transition-all"
          >
            ← 返回修改
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-[#FFD93D] text-gray-800 font-black active:scale-[0.97] transition-all shadow-[0_3px_0_#c9a820]"
          >
            保存绘本 ✨
          </button>
        </div>
      </div>
    )
  }

  return null
}
