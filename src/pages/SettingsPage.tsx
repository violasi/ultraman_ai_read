import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { exportAllData, parseSaveFile, importAllData, getAutoBackups, restoreAutoBackup, type AutoBackup } from '../lib/storage'
import { saveBackupToFile } from '../lib/fileBackup'
import { theme } from '../config/theme'

export default function SettingsPage() {
  const { knownCharCount, vocab, diaryEntries, knownChars, addKnownChars, removeKnownChar } = useApp()
  const [importMsg, setImportMsg] = useState('')
  const [showChars, setShowChars] = useState(false)
  const [addCharsInput, setAddCharsInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [exportMsg, setExportMsg] = useState('')

  const handleExport = () => {
    const data = exportAllData()
    // 1. Browser download
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${theme.exportFilePrefix}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    // 2. Also save to device filesystem (native only, web skips)
    saveBackupToFile(data)
      .then(path => { if (path) setExportMsg(`已同时保存到设备: ${path}`) })
      .catch(() => {})
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = parseSaveFile(reader.result as string)
      if (result.ok) {
        importAllData(result.save)
        setImportMsg('导入成功！刷新页面生效')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setImportMsg(result.error)
      }
    }
    reader.readAsText(file)
  }

  const handleAddChars = () => {
    const chars = addCharsInput.trim().split('').filter(c => c.trim() && !/\s/.test(c))
    if (chars.length > 0) {
      addKnownChars(chars)
      setAddCharsInput('')
    }
  }

  return (
    <div className="space-y-6 py-2">
      <h2 className="text-xl font-black text-gray-800 text-center">⚙️ 设置</h2>

      {/* Stats */}
      <section className="bg-[var(--color-bg-warm)] rounded-2xl p-4 border border-[var(--color-border)] space-y-3">
        <h3 className="text-base font-bold text-gray-800">📊 数据统计</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <span className="text-2xl font-black text-[var(--color-primary)]">{knownCharCount}</span>
            <p className="text-xs text-gray-400">已会汉字</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-orange-500">{vocab.length}</span>
            <p className="text-xs text-gray-400">生字</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-blue-500">{diaryEntries.length}</span>
            <p className="text-xs text-gray-400">篇阅读</p>
          </div>
        </div>
      </section>

      {/* Known Chars Management */}
      <section className="bg-[var(--color-bg-warm)] rounded-2xl p-4 border border-[var(--color-border)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">📚 已会汉字管理</h3>
          <button
            onClick={() => setShowChars(!showChars)}
            className="text-xs text-[var(--color-primary)] font-bold"
          >
            {showChars ? '收起' : '展开查看'}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={addCharsInput}
            onChange={e => setAddCharsInput(e.target.value)}
            placeholder="输入或粘贴汉字..."
            className="flex-1 p-2 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
          <button
            onClick={handleAddChars}
            disabled={!addCharsInput.trim()}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold active:scale-[0.97] transition-all disabled:opacity-40"
          >
            添加
          </button>
        </div>

        {showChars && (
          <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto">
            {[...knownChars].map(char => (
              <button
                key={char}
                onClick={() => removeKnownChar(char)}
                className="w-9 h-9 rounded-lg bg-white border border-[var(--color-border)] text-sm font-bold text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                title={`点击删除：${char}`}
              >
                {char}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Auto Backup Restore */}
      <AutoBackupSection />

      {/* Export / Import */}
      <section className="bg-[var(--color-bg-warm)] rounded-2xl p-4 border border-[var(--color-border)] space-y-3">
        <h3 className="text-base font-bold text-gray-800">💾 数据管理</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 py-2 rounded-xl border-2 border-[var(--color-border)] text-gray-600 text-sm font-bold hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            📤 导出存档
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 py-2 rounded-xl border-2 border-[var(--color-border)] text-gray-600 text-sm font-bold hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            📥 导入存档
          </button>
          <input
            ref={fileRef}
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
        {exportMsg && (
          <p className="text-sm text-center text-green-600">{exportMsg}</p>
        )}
      </section>
    </div>
  )
}

function AutoBackupSection() {
  const [backups] = useState(() => getAutoBackups())
  const [restoreMsg, setRestoreMsg] = useState('')

  const handleRestore = (backup: AutoBackup) => {
    if (!confirm(`确定恢复到 ${formatBackupTime(backup.timestamp)} 的备份吗？当前数据会被覆盖。`)) return
    restoreAutoBackup(backup)
    setRestoreMsg('恢复成功！刷新页面生效')
    setTimeout(() => window.location.reload(), 1500)
  }

  if (backups.length === 0) return null

  return (
    <section className="bg-[var(--color-bg-warm)] rounded-2xl p-4 border border-[var(--color-border)] space-y-3">
      <h3 className="text-base font-bold text-gray-800">🔄 自动备份</h3>
      <p className="text-xs text-gray-400">每次读绘本后自动备份，保留最近 3 份</p>
      <div className="space-y-2">
        {backups.map((b, i) => (
          <div key={i} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-[var(--color-border)]">
            <div>
              <p className="text-sm font-bold text-gray-700">{formatBackupTime(b.timestamp)}</p>
              <p className="text-xs text-gray-400">
                {b.summary.diaryEntries}篇日记 · {b.summary.knownChars}字 · {b.summary.vocabWords}生字
              </p>
            </div>
            <button
              onClick={() => handleRestore(b)}
              className="px-3 py-1 rounded-lg text-xs font-bold text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              恢复
            </button>
          </div>
        ))}
      </div>
      {restoreMsg && (
        <p className="text-sm text-center text-green-600 font-bold">{restoreMsg}</p>
      )}
    </section>
  )
}

function formatBackupTime(iso: string): string {
  const d = new Date(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${h}:${m}`
}
