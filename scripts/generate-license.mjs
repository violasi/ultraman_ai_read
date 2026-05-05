#!/usr/bin/env node
/**
 * License key generator for Orange Read commercial distribution.
 *
 * Usage:
 *   node scripts/generate-license.mjs --customer "张三" --days 30
 *   node scripts/generate-license.mjs -c "李四" -d 7
 *
 * Token format: base64( payloadJSON + "\n" + hmac_hex )
 * This avoids JSON re-serialization issues between Node and browser.
 */

import { createHmac } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LEDGER_PATH = join(__dirname, '..', 'licenses.json')

// Must match the secret in src/lib/license.ts
const SECRET = 'or4ng3R34d_k3y_2026!'

function hmacSign(message) {
  return createHmac('sha256', SECRET).update(message, 'utf8').digest('hex')
}

function loadLedger() {
  if (!existsSync(LEDGER_PATH)) return []
  try { return JSON.parse(readFileSync(LEDGER_PATH, 'utf8')) } catch { return [] }
}

function saveLedger(records) {
  writeFileSync(LEDGER_PATH, JSON.stringify(records, null, 2), 'utf8')
}

function parseArgs(argv) {
  const args = { customer: '', days: 0 }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--customer' || argv[i] === '-c') args.customer = argv[++i]
    if (argv[i] === '--days' || argv[i] === '-d') args.days = parseInt(argv[++i], 10)
  }
  return args
}

const { customer, days } = parseArgs(process.argv)

if (!customer || !days || days <= 0) {
  console.error('Usage: node scripts/generate-license.mjs --customer "名字" --days 30')
  process.exit(1)
}

const now = Date.now()
const expiresAt = now + days * 24 * 60 * 60 * 1000

const payload = { customer, expiresAt, issuedAt: now, days }
const payloadStr = JSON.stringify(payload)
const sig = hmacSign(payloadStr)

// Token = base64( payloadJSON + "\n" + hmac_hex )
const token = payloadStr + '\n' + sig
const licenseKey = Buffer.from(token, 'utf8').toString('base64')

// Save to ledger
const ledger = loadLedger()
ledger.push({
  customer,
  days,
  issuedAt: new Date(now).toISOString(),
  expiresAt: new Date(expiresAt).toISOString(),
})
saveLedger(ledger)

console.log('\n========== 会员码 ==========')
console.log(licenseKey)
console.log('============================\n')
console.log(`客户: ${customer}`)
console.log(`有效天数: ${days}`)
console.log(`到期时间: ${new Date(expiresAt).toLocaleString('zh-CN')}`)
console.log(`签发时间: ${new Date(now).toLocaleString('zh-CN')}`)
console.log(`\n（已记录到 licenses.json，共 ${ledger.length} 条记录）`)
