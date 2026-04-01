import type { StorySentence } from './diary'

export interface PictureBookPage {
  pageIndex: number
  imagePath: string           // "/books/{bookId}/pages/page-01.jpg"
  sentences: StorySentence[]  // Reuses existing ChineseWord[] structure
}

export interface PictureBookMeta {
  id: string                  // e.g. "mobi-1-01-nihao-xiaotu"
  title: string
  series: string              // "摩比汉语分级" | "分享阅读分级绘本"
  level: string               // "萌芽" | "探索" | "小班上" etc.
  pageCount: number
  uniqueChars: string[]       // All unique non-punctuation chars in book
  coverImage: string          // First page image path
}

export interface PictureBook extends PictureBookMeta {
  pages: PictureBookPage[]
}

export interface BookReadRecord {
  bookId: string
  bookTitle: string
  heroId: string
  date: string                // YYYY-MM-DD
  readAt: string              // ISO timestamp
}
