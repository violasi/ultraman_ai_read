import type { PictureBookMeta, PictureBook, BookReadRecord } from '../types/picturebook'
import { listUserBooks, getUserBook, deleteUserBook } from './bookStorage'

let catalogCache: PictureBookMeta[] | null = null

export async function loadCatalog(): Promise<PictureBookMeta[]> {
  if (catalogCache) return catalogCache

  // 1. Try fetching pre-bundled catalog
  let bundled: PictureBookMeta[] = []
  try {
    const res = await fetch('/books/catalog.json')
    if (res.ok) bundled = await res.json()
  } catch { /* no bundled books */ }

  // 2. Load user-uploaded books from IndexedDB
  let userBooks: PictureBookMeta[] = []
  try {
    userBooks = await listUserBooks()
  } catch { /* IndexedDB unavailable */ }

  // 3. Merge — user books override bundled if same id
  const merged = new Map<string, PictureBookMeta>()
  for (const b of bundled) merged.set(b.id, b)
  for (const b of userBooks) merged.set(b.id, b)

  catalogCache = [...merged.values()]
  return catalogCache
}

export async function loadBook(bookId: string): Promise<PictureBook | null> {
  // Try user-uploaded (IndexedDB) first
  try {
    const userBook = await getUserBook(bookId)
    if (userBook) return userBook
  } catch { /* IndexedDB unavailable */ }

  // Fall back to pre-bundled
  try {
    const res = await fetch(`/books/${bookId}/book.json`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function deleteBook(bookId: string): Promise<void> {
  await deleteUserBook(bookId)
  clearCatalogCache()
}

export function computeKnownRatio(meta: PictureBookMeta, knownChars: Set<string>): number {
  if (meta.uniqueChars.length === 0) return 1
  const known = meta.uniqueChars.filter(c => knownChars.has(c)).length
  return known / meta.uniqueChars.length
}

export function recommendBook(
  catalog: PictureBookMeta[],
  knownChars: Set<string>,
  readRecords: BookReadRecord[],
  heroId: string,
  skipIndex: number = 0,
): PictureBookMeta | null {
  if (catalog.length === 0) return null

  const readBookIds = new Set(
    readRecords.filter(r => r.heroId === heroId).map(r => r.bookId)
  )

  const TARGET = 0.8
  const sortByCloseness = (list: PictureBookMeta[]) =>
    [...list].sort((a, b) =>
      Math.abs(computeKnownRatio(a, knownChars) - TARGET) -
      Math.abs(computeKnownRatio(b, knownChars) - TARGET)
    )

  // New (unread) books first, sorted by closeness to 80%
  // then old (read) books, also sorted by closeness to 80%
  const unread = sortByCloseness(catalog.filter(b => !readBookIds.has(b.id)))
  const read = sortByCloseness(catalog.filter(b => readBookIds.has(b.id)))
  const ordered = [...unread, ...read]

  if (ordered.length === 0) return null

  return ordered[skipIndex % ordered.length]
}

export function clearCatalogCache() {
  catalogCache = null
}
