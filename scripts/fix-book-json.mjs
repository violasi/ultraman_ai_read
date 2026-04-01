import fs from 'fs'
import path from 'path'

const booksDir = '/Users/user/Documents/aigc/orange_read/public/books'
const dirs = fs.readdirSync(booksDir).filter(d => d.startsWith('mobi-'))

for (const dir of dirs) {
  const bookPath = path.join(booksDir, dir, 'book.json')
  if (!fs.existsSync(bookPath)) continue

  let content = fs.readFileSync(bookPath, 'utf8')

  try {
    JSON.parse(content)
    console.log(`OK ${dir}`)
    continue
  } catch(e) {
    console.log(`FIXING ${dir}`)
  }

  // The problem: agents wrote regular ASCII " (0x22) instead of Unicode smart quotes
  // in char values. This creates patterns like {"char": """, "pinyin": ""}
  // which has three " in a row.
  //
  // Fix strategy: find patterns like "char": "" and replace them.
  // Pattern: "char": ""X" where X is , or } → this is a left smart quote that became "
  // Pattern: X"", "pinyin" → right smart quote that became "

  // Step 1: Replace {"char": """, with {"char": "\u201c",  (left double quote)
  // The pattern in the file: "char": """,  → three " then comma
  content = content.replace(/"char": """,\s*"pinyin": ""/g, '"char": "\\u201c", "pinyin": ""')

  // Step 2: Replace {"char": """} or before comma where it's the right quote
  // Pattern: "char": """ at end of word → right double quote
  // This is trickier. Let's look for the context:
  // Left quote appears at start of dialogue: {"char": """, "pinyin": ""},
  // Right quote appears at end: {"char": """, "pinyin": ""}

  // Actually, both left and right quotes produce the same broken pattern.
  // We need context to distinguish. Let's use position in sentence:
  // If it's the first word with this pattern, it's likely \u201c (left)
  // If it's later, it's likely \u201d (right)

  // Better approach: parse line by line and fix
  const lines = content.split('\n')
  let inSentence = false
  let foundLeftQuote = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect sentence boundaries
    if (line.includes('"words"')) {
      inSentence = true
      foundLeftQuote = false
    }

    // Check for the broken pattern: "char": """
    if (line.match(/"char": """/)) {
      if (!foundLeftQuote) {
        // First occurrence in this sentence → left quote \u201c
        lines[i] = line.replace('"char": """', '"char": "\\u201c"')
        foundLeftQuote = true
      } else {
        // Second occurrence → right quote \u201d
        lines[i] = line.replace('"char": """', '"char": "\\u201d"')
        foundLeftQuote = false
      }
    }

    // Also fix ellipsis if written as regular dots
    // And other problematic chars
  }

  content = lines.join('\n')

  try {
    const parsed = JSON.parse(content)
    // Re-serialize properly
    fs.writeFileSync(bookPath, JSON.stringify(parsed, null, 2))
    console.log(`  FIXED (${parsed.pages?.length} pages)`)
  } catch(e2) {
    console.log(`  STILL BROKEN: ${e2.message.substring(0, 100)}`)
    // Show the problematic area
    try {
      const pos = parseInt(e2.message.match(/position (\d+)/)[1])
      const lineNum = content.substring(0, pos).split('\n').length
      const errorLines = content.split('\n')
      console.log(`  Line ${lineNum}: ${errorLines[lineNum-1]}`)
    } catch(x) {}
  }
}
