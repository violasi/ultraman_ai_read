#!/usr/bin/env node
/**
 * Picture Book Preprocessing Script
 *
 * Usage:
 *   npx tsx scripts/process-books.ts extract         - Extract page images from all PDFs
 *   npx tsx scripts/process-books.ts extract [bookId] - Extract pages from one book
 *   npx tsx scripts/process-books.ts catalog          - Rebuild catalog.json from all book.json files
 *   npx tsx scripts/process-books.ts list             - List all extracted books
 *
 * Requires: poppler (brew install poppler) for pdftoppm
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LIBRARY_DIR = path.resolve(__dirname, '../library')
const BOOKS_DIR = path.resolve(__dirname, '../public/books')
const HIDDEN_SERIES = new Set<string>([
  '小白家的识字分级绘本',
])

interface BookMeta {
  id: string
  title: string
  series: string
  level: string
  pageCount: number
  uniqueChars: string[]
  coverImage: string
}

function getSeriesSlug(series: string): string {
  if (series === '摩比汉语分级') return 'mobi'
  if (series === '小白家的识字分级绘本') return 'xiaobai'
  if (series === '分享阅读分级绘本' || series === '分享阅读') return 'share'
  if (series === '汉语分级阅读绘本') return 'yiyue'
  if (series === '小羊上山') return 'xiaoyang'
  if (series === '我会自己读') return 'wohui'
  return 'book'
}

function extractFileNumber(filename: string): string {
  return filename.match(/^(\d+)/)?.[1] || '0'
}

function extractTitleFromFilename(filename: string): string {
  const match = filename.match(/\d*\.?(.*?)\.pdf$/i)
  return match ? match[1].trim() : filename.replace(/\.pdf$/i, '')
}

function cleanTitle(series: string, level: string, filename: string): string {
  const raw = extractTitleFromFilename(filename)

  if (series === '我会自己读') {
    return raw.replace(/^第\s*[0-9一二三四五六七八九十]+\s*级\s*/u, '').trim()
  }

  return raw
}

function fallbackTitle(filename: string): string {
  const explicitTitle = extractTitleFromFilename(filename)
  if (explicitTitle) return explicitTitle

  const fileNum = extractFileNumber(filename)
  return `第${fileNum.padStart(2, '0')}册`
}

function slugify(
  series: string,
  level: string,
  filename: string,
  title?: string,
  fileNumber?: string
): string {
  // Generate a clean ID from the series/level/filename
  const seriesSlug = getSeriesSlug(series)
  const levelSlug = level.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
  const name = (title ?? cleanTitle(series, level, filename)).trim()
  const fileNum = fileNumber ?? extractFileNumber(filename)
  const idParts = [seriesSlug, levelSlug, fileNum.padStart(2, '0')]
  if (name) idParts.push(name)
  return idParts.join('-')
}

interface PDFInfo {
  pdfPath: string
  series: string
  level: string
  title: string
  bookId: string
}

function shouldSkipPdf(file: string): boolean {
  return /识字表\.pdf$/i.test(file)
}

function addBooksFromDir(
  books: PDFInfo[],
  dirPath: string,
  series: string,
  level: string
): void {
  const files = fs
    .readdirSync(dirPath)
    .filter(file => /\.pdf$/i.test(file))
    .sort((a, b) =>
      a.localeCompare(b, 'zh-Hans-CN', {
        numeric: true,
        sensitivity: 'base',
      })
    )

  for (const file of files) {
    if (shouldSkipPdf(file)) continue

    const extractedTitle = cleanTitle(series, level, file)
    const title = extractedTitle || fallbackTitle(file)
    const extractedNum = extractFileNumber(file)
    const bookNum = extractedNum !== '0' ? extractedNum : String(books.filter(b => b.series === series && b.level === level).length + 1)
    const bookId = slugify(series, level, file, extractedTitle, bookNum)
    books.push({ pdfPath: path.join(dirPath, file), series, level, title, bookId })
  }
}

function scanLibrary(): PDFInfo[] {
  const books: PDFInfo[] = []

  // Scan 摩比汉语分级
  const mobiDir = path.join(LIBRARY_DIR, '摩比汉语分级')
  if (fs.existsSync(mobiDir)) {
    for (const levelDir of fs.readdirSync(mobiDir)) {
      const levelPath = path.join(mobiDir, levelDir)
      if (!fs.statSync(levelPath).isDirectory()) continue
      const level = levelDir.replace(/\d+\.|PDF版/g, '').trim()
      addBooksFromDir(books, levelPath, '摩比汉语分级', level)
    }
  }

  // Scan 小白家的识字分级绘本
  const xiaobaiDir = path.join(LIBRARY_DIR, '小白家的识字分级绘本')
  if (fs.existsSync(xiaobaiDir)) {
    for (const seasonDir of fs.readdirSync(xiaobaiDir)) {
      const seasonPath = path.join(xiaobaiDir, seasonDir)
      if (!fs.statSync(seasonPath).isDirectory()) continue
      const level = seasonDir.trim()
      addBooksFromDir(books, seasonPath, '小白家的识字分级绘本', level)
    }
  }

  // Scan 分享阅读分级绘本
  const shareDir = path.join(LIBRARY_DIR, '8.分享阅读小中大分级绘本-112本')
  if (fs.existsSync(shareDir)) {
    for (const levelDir of fs.readdirSync(shareDir)) {
      const levelPath = path.join(shareDir, levelDir)
      if (!fs.statSync(levelPath).isDirectory()) continue
      const level = levelDir.trim()
      addBooksFromDir(books, levelPath, '分享阅读分级绘本', level)
    }
  }

  // Scan 一阅而起《汉语分级阅读绘本》
  const yiyueDir = path.join(LIBRARY_DIR, '一阅而起')
  if (fs.existsSync(yiyueDir)) {
    for (const levelDir of fs.readdirSync(yiyueDir)) {
      const levelPath = path.join(yiyueDir, levelDir)
      if (!fs.statSync(levelPath).isDirectory()) continue
      if (!levelDir.includes('汉语分级阅读绘本')) continue

      const levelMatch = levelDir.match(/第[一二三四五六七八九十百零两]+级/)
      const level = levelMatch ? levelMatch[0] : levelDir.trim()
      addBooksFromDir(books, levelPath, '汉语分级阅读绘本', level)
    }
  }

  // Scan 小羊上山
  const xiaoyangDir = path.join(LIBRARY_DIR, '小羊上山')
  if (fs.existsSync(xiaoyangDir)) {
    for (const levelDir of fs.readdirSync(xiaoyangDir)) {
      const levelPath = path.join(xiaoyangDir, levelDir)
      if (!fs.statSync(levelPath).isDirectory()) continue
      if (!/第[一二三四五六七八九十0-9]+辑/u.test(levelDir)) continue

      const levelMatch = levelDir.match(/第[一二三四五六七八九十0-9]+辑/u)
      const level = levelMatch ? levelMatch[0] : levelDir.trim()
      addBooksFromDir(books, levelPath, '小羊上山', level)
    }
  }

  // Scan 我会自己读
  const wohuiDir = path.join(LIBRARY_DIR, '我会自己读')
  if (fs.existsSync(wohuiDir)) {
    for (const levelDir of fs.readdirSync(wohuiDir)) {
      const levelPath = path.join(wohuiDir, levelDir)
      if (!fs.statSync(levelPath).isDirectory()) continue
      const level = levelDir.trim()
      addBooksFromDir(books, levelPath, '我会自己读', level)
    }
  }

  return books
}

function extractPages(info: PDFInfo): void {
  const outDir = path.join(BOOKS_DIR, info.bookId, 'pages')
  fs.mkdirSync(outDir, { recursive: true })

  console.log(`  Extracting: ${info.title} → ${info.bookId}`)

  try {
    // Use pdftoppm to convert PDF pages to JPEG
    execSync(
      `pdftoppm -jpeg -r 150 -scale-to 1200 "${info.pdfPath}" "${path.join(outDir, 'page')}"`,
      { stdio: 'pipe' }
    )

    // Rename pdftoppm output (page-01.jpg, page-02.jpg, etc.)
    const files = fs.readdirSync(outDir).filter(f => f.endsWith('.jpg')).sort()
    const pageCount = files.length

    // Write meta.json
    const meta: BookMeta = {
      id: info.bookId,
      title: info.title,
      series: info.series,
      level: info.level,
      pageCount,
      uniqueChars: [],
      coverImage: `/books/${info.bookId}/pages/${files[0] || 'page-1.jpg'}`,
    }
    fs.writeFileSync(
      path.join(BOOKS_DIR, info.bookId, 'meta.json'),
      JSON.stringify(meta, null, 2)
    )

    console.log(`    → ${pageCount} pages extracted`)
  } catch (e) {
    console.error(`    ✗ Failed: ${(e as Error).message}`)
  }
}

function buildCatalog(): void {
  const catalog: BookMeta[] = []

  for (const dir of fs.readdirSync(BOOKS_DIR)) {
    const bookJsonPath = path.join(BOOKS_DIR, dir, 'book.json')
    const metaPath = path.join(BOOKS_DIR, dir, 'meta.json')

    // Only include books with book.json (text has been processed)
    if (fs.existsSync(bookJsonPath)) {
      try {
        const book = JSON.parse(fs.readFileSync(bookJsonPath, 'utf-8'))
        if (HIDDEN_SERIES.has(book.series)) continue
        catalog.push({
          id: book.id,
          title: book.title,
          series: book.series,
          level: book.level,
          pageCount: book.pageCount || book.pages?.length || 0,
          uniqueChars: book.uniqueChars || [],
          coverImage: book.coverImage || book.pages?.[0]?.imagePath || '',
        })
      } catch (e) {
        console.error(`  ✗ Failed to read ${bookJsonPath}: ${(e as Error).message}`)
      }
    }
  }

  catalog.sort((a, b) => a.id.localeCompare(b.id))

  fs.writeFileSync(
    path.join(BOOKS_DIR, 'catalog.json'),
    JSON.stringify(catalog, null, 2)
  )

  console.log(`\nCatalog rebuilt: ${catalog.length} books`)
  for (const b of catalog) {
    console.log(`  - ${b.id}: ${b.title} (${b.pageCount} pages, ${b.uniqueChars.length} unique chars)`)
  }
}

function listBooks(): void {
  const allBooks = scanLibrary()
  console.log(`\nFound ${allBooks.length} PDFs in library:\n`)
  for (const b of allBooks) {
    const hasPages = fs.existsSync(path.join(BOOKS_DIR, b.bookId, 'pages'))
    const hasBook = fs.existsSync(path.join(BOOKS_DIR, b.bookId, 'book.json'))
    const status = hasBook ? '✅ ready' : hasPages ? '📸 images only' : '⬜ not extracted'
    console.log(`  ${status}  ${b.bookId}  "${b.title}" [${b.series}/${b.level}]`)
  }
}

// --- Main ---
const command = process.argv[2]
const arg = process.argv[3]

switch (command) {
  case 'extract': {
    const allBooks = scanLibrary()
    if (arg) {
      const matchedBooks = allBooks.filter(
        b => b.bookId === arg || b.bookId.includes(arg) || b.title.includes(arg)
      )
      if (matchedBooks.length === 0) {
        console.error(`Book not found: ${arg}`)
        process.exit(1)
      }

      console.log(`Extracting ${matchedBooks.length} matching book(s) for "${arg}"...\n`)
      for (const book of matchedBooks) {
        extractPages(book)
      }
    } else {
      console.log(`Extracting all ${allBooks.length} books...\n`)
      for (const book of allBooks) {
        extractPages(book)
      }
    }
    console.log('\nDone! Next: process text with AI and create book.json files.')
    break
  }
  case 'catalog':
    buildCatalog()
    break
  case 'list':
    listBooks()
    break
  default:
    console.log(`
Usage:
  npx tsx scripts/process-books.ts extract         - Extract page images from all PDFs
  npx tsx scripts/process-books.ts extract [bookId] - Extract pages from one book
  npx tsx scripts/process-books.ts catalog          - Rebuild catalog.json
  npx tsx scripts/process-books.ts list             - List all books and their status
    `)
}
