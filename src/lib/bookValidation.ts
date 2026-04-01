import type { PictureBookPage } from '../types/picturebook'

interface ValidationOk {
  ok: true
  pages: PictureBookPage[]
  uniqueChars: string[]
}

interface ValidationError {
  ok: false
  error: string
}

export type ValidationResult = ValidationOk | ValidationError

const PUNCTUATION = new Set([
  ',', '.', '!', '?', ';', ':', '"', "'", '(', ')', '<', '>',
  '\u3001', '\u3002', '\uFF01', '\uFF1F', '\uFF0C', '\uFF1B', '\uFF1A',
  '\u201C', '\u201D', '\u2018', '\u2019', '\uFF08', '\uFF09',
  '\u300A', '\u300B', '\u2026', '\u2014', '\u00B7',
])

export function validateBookJson(
  jsonStr: string,
  expectedPageCount: number,
  bookId: string,
  imagePathFn: (pageIndex: number) => string,
): ValidationResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    return { ok: false, error: 'JSON 格式错误，请检查是否正确复制了 AI 返回的内容' }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'JSON 格式错误：应为对象' }
  }

  const obj = parsed as Record<string, unknown>
  const pagesRaw = obj.pages
  if (!Array.isArray(pagesRaw)) {
    return { ok: false, error: '缺少 "pages" 数组' }
  }

  const uniqueCharsSet = new Set<string>()
  const pages: PictureBookPage[] = []

  for (let i = 0; i < pagesRaw.length; i++) {
    const p = pagesRaw[i]
    if (!p || typeof p !== 'object') {
      return { ok: false, error: `第 ${i + 1} 页格式错误` }
    }

    const page = p as Record<string, unknown>
    const pageIndex = typeof page.pageIndex === 'number' ? page.pageIndex : i

    if (!Array.isArray(page.sentences)) {
      return { ok: false, error: `第 ${i + 1} 页缺少 "sentences" 数组` }
    }

    const sentences = []
    for (let sIdx = 0; sIdx < (page.sentences as unknown[]).length; sIdx++) {
      const s = (page.sentences as Record<string, unknown>[])[sIdx]
      if (!Array.isArray(s?.words)) {
        return { ok: false, error: `第 ${i + 1} 页第 ${sIdx + 1} 句缺少 "words" 数组` }
      }

      const words = []
      for (const w of s.words as Record<string, unknown>[]) {
        if (typeof w?.char !== 'string') {
          return { ok: false, error: `第 ${i + 1} 页第 ${sIdx + 1} 句有 word 缺少 "char"` }
        }
        if (typeof w?.pinyin !== 'string') {
          return { ok: false, error: `第 ${i + 1} 页第 ${sIdx + 1} 句有 word 缺少 "pinyin"` }
        }

        const char = w.char as string
        if (char.length >= 1 && !PUNCTUATION.has(char) && !/\s/.test(char)) {
          uniqueCharsSet.add(char)
        }

        words.push({ char, pinyin: w.pinyin as string })
      }

      sentences.push({ words })
    }

    pages.push({
      pageIndex,
      imagePath: imagePathFn(pageIndex),
      sentences,
    })
  }

  if (pagesRaw.length !== expectedPageCount) {
    // Warn but don't block - AI might skip blank pages
    console.warn(
      `页数不匹配：JSON 有 ${pagesRaw.length} 页，上传了 ${expectedPageCount} 张图片`,
    )
  }

  return {
    ok: true,
    pages,
    uniqueChars: [...uniqueCharsSet],
  }
}
