import type { PictureBook, PictureBookMeta } from '../types/picturebook'

const DB_NAME = 'orange_read_books'
const DB_VERSION = 1
const STORE_BOOKS = 'books'
const STORE_IMAGES = 'bookImages'

let dbInstance: IDBDatabase | null = null

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        const imgStore = db.createObjectStore(STORE_IMAGES, { autoIncrement: true })
        imgStore.createIndex('bookPage', ['bookId', 'pageIndex'], { unique: true })
      }
    }
    req.onsuccess = () => {
      dbInstance = req.result
      resolve(dbInstance)
    }
    req.onerror = () => reject(req.error)
  })
}

export interface BookImage {
  bookId: string
  pageIndex: number
  blob: Blob
}

export async function saveUserBook(
  book: PictureBook,
  images: { pageIndex: number; blob: Blob }[],
): Promise<void> {
  const db = await getDB()
  const tx = db.transaction([STORE_BOOKS, STORE_IMAGES], 'readwrite')

  // Save book JSON
  tx.objectStore(STORE_BOOKS).put(book)

  // Save images
  const imgStore = tx.objectStore(STORE_IMAGES)
  for (const img of images) {
    // Delete existing image for this page if any
    const idx = imgStore.index('bookPage')
    const cursor = idx.openCursor(IDBKeyRange.only([book.id, img.pageIndex]))
    await new Promise<void>((resolve) => {
      cursor.onsuccess = () => {
        if (cursor.result) {
          cursor.result.delete()
          cursor.result.continue()
        } else {
          resolve()
        }
      }
    })
    imgStore.put({ bookId: book.id, pageIndex: img.pageIndex, blob: img.blob })
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getUserBook(bookId: string): Promise<PictureBook | null> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKS, 'readonly')
    const req = tx.objectStore(STORE_BOOKS).get(bookId)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function deleteUserBook(bookId: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction([STORE_BOOKS, STORE_IMAGES], 'readwrite')

  // Delete book
  tx.objectStore(STORE_BOOKS).delete(bookId)

  // Delete all images for this book
  const imgStore = tx.objectStore(STORE_IMAGES)
  const idx = imgStore.index('bookPage')
  const range = IDBKeyRange.bound([bookId, 0], [bookId, 99999])
  const cursor = idx.openCursor(range)
  await new Promise<void>((resolve) => {
    cursor.onsuccess = () => {
      if (cursor.result) {
        cursor.result.delete()
        cursor.result.continue()
      } else {
        resolve()
      }
    }
  })

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function listUserBooks(): Promise<PictureBookMeta[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKS, 'readonly')
    const req = tx.objectStore(STORE_BOOKS).getAll()
    req.onsuccess = () => {
      const books: PictureBook[] = req.result
      // Strip pages to return only meta
      resolve(
        books.map(({ pages: _pages, ...meta }) => meta),
      )
    }
    req.onerror = () => reject(req.error)
  })
}

export async function getPageImageBlob(
  bookId: string,
  pageIndex: number,
): Promise<Blob | null> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_IMAGES, 'readonly')
    const idx = tx.objectStore(STORE_IMAGES).index('bookPage')
    const req = idx.get(IDBKeyRange.only([bookId, pageIndex]))
    req.onsuccess = () => {
      const record = req.result as BookImage | undefined
      resolve(record?.blob ?? null)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function getAllBookImages(bookId: string): Promise<BookImage[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_IMAGES, 'readonly')
    const idx = tx.objectStore(STORE_IMAGES).index('bookPage')
    const range = IDBKeyRange.bound([bookId, 0], [bookId, 99999])
    const req = idx.getAll(range)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Parse idb:// paths → { bookId, pageIndex }
export function parseIdbPath(path: string): { bookId: string; pageIndex: number } | null {
  const match = path.match(/^idb:\/\/(.+)\/page-(\d+)$/)
  if (!match) return null
  return { bookId: match[1], pageIndex: parseInt(match[2], 10) }
}

export function makeIdbPath(bookId: string, pageIndex: number): string {
  return `idb://${bookId}/page-${String(pageIndex).padStart(2, '0')}`
}
