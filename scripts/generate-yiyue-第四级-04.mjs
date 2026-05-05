#!/usr/bin/env node

import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const BOOK_ID = 'yiyue-第四级-04'
const BOOK_DIR = path.join(ROOT, 'public/books', BOOK_ID)
const BOOK_JSON_PATH = path.join(BOOK_DIR, 'book.json')
const META_JSON_PATH = path.join(BOOK_DIR, 'meta.json')
const CATALOG_PATH = path.join(ROOT, 'public/books/catalog.json')

const TITLE = '中秋节的月亮'
const SERIES = '汉语分级阅读绘本'
const LEVEL = '第四级'
const PDF_PATH = path.join(ROOT, 'library/一阅而起/汉语分级阅读绘本  第四级/4.pdf')

const pageTexts = [
  '中秋节的时候，天气很好，闪闪发光的圆月挂在天上。从南到北，从西到东，家人们欢欢喜喜地一起过节。',
  '“中秋月，高高挂，圆圆的‘镜子’照我家。”我们看着月亮，月亮也在看着我们。',
  '月亮躺在夜空里看人间：“人们都在忙什么呢？”',
  '一年有春夏秋冬，农历八月十五正是秋的中间。',
  '在很多地方，这一天天气晴好，瓜果飘香。人们在院子里、阳台上放着小桌“拜月”。桌子上有柚子、葡萄、橘子等各种水果，当然还有月饼。',
  '很久很久以前，人们就在中秋节吃甜甜圆圆的月饼了。你看，月饼像不像中秋的月亮呢？',
  '家人团圆，月亮圆圆，人月两团圆。人们一边吃着美食，一边看着月亮，有说有笑。',
  '月亮看见人们都看着自己，有点儿不好意思了。',
  '月亮听到大人在给孩子讲中秋节的故事。',
  '在一个中秋夜，嫦娥因为吃了后羿从西王母那里要来的“长生不老药”飞了起来。她一直飞个不停，飞到了月亮上。',
  '月亮上有个月宫，嫦娥在月宫里住着，只有玉兔和她在一起。',
  '月宫外，吴刚一直在砍树，砍的是一棵桂花树。那桂花树砍了又长，长了又砍。',
  '月亮忽然闻到了一阵桂花的清香。原来人间的桂花已经开放，这香气是人们品着的桂花茶的清香。',
  '月亮又看到，很多地方挂着星星点点的灯。孩子们也跟父母一起做灯。有圆的、有方的、有兔子灯、有杨桃灯……孩子们提着灯在月色里跑来跑去。',
  '月亮往东看，海边的人们在玩一种“夺状元饼”的游戏。人们分成几个小组，进行比赛，分发不同的月饼。',
  '月亮往南看，广东一带的人们舞动着火龙。',
  '月亮往西看，云南的孩子们正跟着父母，在美丽的山水间“走月亮”。',
  '月亮往北看，北京拜月的供桌上有水果和月饼，还有兔儿爷呢！兔儿爷看着水果和月饼，看着我和你。温和明亮的月亮低着头，甜甜地看着人间。',
  '中秋节，有圆圆的月亮，有甜甜的月饼，有欢欢喜喜、团团圆圆的家人。月亮，你听：中秋夜，闪闪亮，家家团圆看月亮。瓜果甜，月饼香，欢欢喜喜拜月亮。苹果红，柚子黄，看完月亮梦里香。清风吹，入明月，梦到嫦娥和玉兔。',
]

function runJxa(lines) {
  return execFileSync(
    'osascript',
    ['-l', 'JavaScript', ...lines.flatMap(line => ['-e', line])],
    {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }
  ).trim()
}

function toPinyinTokens(text) {
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')

  const raw = runJxa([
    "ObjC.import('Foundation')",
    `const s = $.NSMutableString.alloc.initWithString('${escaped}')`,
    '$.CFStringTransform(s, null, $.kCFStringTransformMandarinLatin, false)',
    'console.log(ObjC.unwrap(s))',
  ])

  return raw.match(/[A-Za-z\u0100-\u024F\u01CD-\u01DCüÜ]+/g) ?? []
}

function sentenceToWords(text) {
  const tokens = toPinyinTokens(text)
  let tokenIndex = 0

  return [...text].map(char => {
    const isHan = /\p{Script=Han}/u.test(char)
    if (!isHan) return { char, pinyin: '' }
    const pinyin = tokens[tokenIndex] ?? ''
    tokenIndex += 1
    return { char, pinyin: pinyin.toLowerCase() }
  })
}

function splitSentences(text) {
  return text.match(/[^。！？!?]+[。！？!?]?/g)?.map(s => s.trim()).filter(Boolean) ?? []
}

function buildBook() {
  const pages = pageTexts.map((text, pageIndex) => ({
    pageIndex,
    imagePath: `/books/${BOOK_ID}/pages/page-${String(pageIndex + 4).padStart(2, '0')}.jpg`,
    sentences: splitSentences(text).map(sentence => ({
      words: sentenceToWords(sentence),
    })),
  }))

  const uniqueChars = []
  const seen = new Set()
  for (const text of pageTexts.join('')) {
    if (!/\p{Script=Han}/u.test(text)) continue
    if (seen.has(text)) continue
    seen.add(text)
    uniqueChars.push(text)
  }

  return {
    id: BOOK_ID,
    title: TITLE,
    series: SERIES,
    level: LEVEL,
    pageCount: pages.length,
    uniqueChars,
    coverImage: `/books/${BOOK_ID}/pages/page-01.jpg`,
    pages,
  }
}

function ensurePages() {
  const pagesDir = path.join(BOOK_DIR, 'pages')
  fs.mkdirSync(pagesDir, { recursive: true })
  const hasPages = fs.existsSync(path.join(pagesDir, 'page-01.jpg'))
  if (hasPages) return

  execFileSync(
    'pdftoppm',
    ['-jpeg', '-r', '150', '-scale-to', '1200', PDF_PATH, path.join(pagesDir, 'page')],
    { stdio: 'inherit' }
  )
}

function writeMeta() {
  const pageFiles = fs
    .readdirSync(path.join(BOOK_DIR, 'pages'))
    .filter(name => name.endsWith('.jpg'))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', { numeric: true }))

  const meta = {
    id: BOOK_ID,
    title: TITLE,
    series: SERIES,
    level: LEVEL,
    pageCount: pageFiles.length,
    uniqueChars: [],
    coverImage: `/books/${BOOK_ID}/pages/${pageFiles[0] ?? 'page-01.jpg'}`,
  }

  fs.writeFileSync(META_JSON_PATH, `${JSON.stringify(meta, null, 2)}\n`)
}

function updateCatalog(book) {
  const catalog = fs.existsSync(CATALOG_PATH)
    ? JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'))
    : []

  const next = catalog.filter(entry => entry.id !== BOOK_ID)
  next.push({
    id: book.id,
    title: book.title,
    series: book.series,
    level: book.level,
    pageCount: book.pageCount,
    uniqueChars: book.uniqueChars,
    coverImage: book.coverImage,
  })
  next.sort((a, b) => a.id.localeCompare(b.id, 'zh-Hans-CN', { numeric: true }))

  fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(next, null, 2)}\n`)
}

ensurePages()
const book = buildBook()
fs.writeFileSync(BOOK_JSON_PATH, `${JSON.stringify(book, null, 2)}\n`)
writeMeta()
updateCatalog(book)

console.log(`Generated ${BOOK_JSON_PATH}`)
