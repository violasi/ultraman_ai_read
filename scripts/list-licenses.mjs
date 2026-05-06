#!/usr/bin/env node
/**
 * List all issued licenses.
 *
 * Usage:
 *   node scripts/list-licenses.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LEDGER_PATH = join(__dirname, '..', 'licenses.json')

if (!existsSync(LEDGER_PATH)) {
  console.log('还没有签发过会员码。')
  process.exit(0)
}

const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'))
const now = Date.now()

console.log(`\n共签发 ${ledger.length} 个会员码：\n`)
console.log('  客户          天数   状态     签发日期             到期日期')
console.log('  ' + '-'.repeat(72))

for (const r of ledger) {
  const expired = new Date(r.expiresAt).getTime() < now
  const status = expired ? '已过期' : '有效  '
  const issued = new Date(r.issuedAt).toLocaleString('zh-CN')
  const expires = new Date(r.expiresAt).toLocaleString('zh-CN')
  console.log(`  ${r.customer.padEnd(12)}  ${String(r.days).padStart(4)}天  ${status}   ${issued}  ${expires}`)
}

const active = ledger.filter(r => new Date(r.expiresAt).getTime() >= now).length
console.log(`\n  有效: ${active}  |  已过期: ${ledger.length - active}\n`)
