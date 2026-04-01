import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ULTRAMAN_CHARACTERS, getCharacterName } from '../data/ultramanCharacters'
import { generateStoryPrompt, callOpenAI, parseStoryResponse } from '../lib/openai'
import UltramanAvatar from '../components/shared/UltramanAvatar'
import LoadingStory from '../components/shared/LoadingStory'
import type { DiaryEntry } from '../types/diary'

type Step = 'select-heroes' | 'happy-event' | 'prompt-copy' | 'paste-result' | 'generating'

export default function HomePage() {
  const navigate = useNavigate()
  const { apiKey, addDiaryEntry, knownChars, vocab } = useApp()
  const [step, setStep] = useState<Step>('select-heroes')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [happyEvent, setHappyEvent] = useState('')
  const [error, setError] = useState('')
  const [prompt, setPrompt] = useState('')
  const [pastedResult, setPastedResult] = useState('')
  const [copied, setCopied] = useState(false)

  const toggleHero = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const buildPrompt = () => {
    return generateStoryPrompt({
      selectedUltramans: selectedIds.map(id => getCharacterName(id)),
      happyEvent,
      knownChars: [...knownChars],
      vocabChars: vocab.map(v => v.char),
    })
  }

  const createEntry = (result: { title: string; sentences: DiaryEntry['sentences'] }) => {
    const now = new Date()
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const entry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      date,
      storyTitle: result.title,
      selectedUltramans: selectedIds,
      happyEvent,
      sentences: result.sentences,
      createdAt: now.toISOString(),
    }
    addDiaryEntry(entry)
    navigate(`/read/${entry.id}`)
  }

  // Auto generate with API key
  const handleAutoGenerate = async () => {
    setStep('generating')
    setError('')
    try {
      const p = buildPrompt()
      const result = await callOpenAI(apiKey, p)
      createEntry(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成故事失败，请重试')
      setStep('happy-event')
    }
  }

  // Manual: go to prompt copy step
  const handleManualGenerate = () => {
    const p = buildPrompt()
    setPrompt(p)
    setStep('prompt-copy')
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select textarea content
      const el = document.querySelector<HTMLTextAreaElement>('#prompt-textarea')
      if (el) { el.select(); document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    }
  }

  const handleImportResult = () => {
    setError('')
    try {
      const result = parseStoryResponse(pastedResult)
      createEntry(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON格式错误，请检查后重试')
    }
  }

  // --- Step: generating ---
  if (step === 'generating') {
    return (
      <div>
        <LoadingStory />
        {error && (
          <div className="text-center space-y-3 px-4">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={handleAutoGenerate}
              className="px-6 py-3 rounded-2xl bg-[#E8453C] text-white font-bold shadow-[0_3px_0_#c13a33] active:scale-[0.97] transition-all"
            >
              重试
            </button>
          </div>
        )}
      </div>
    )
  }

  // --- Step: paste-result (manual mode) ---
  if (step === 'paste-result') {
    return (
      <div className="space-y-5 py-4">
        <div className="text-center space-y-2">
          <span className="text-4xl block">📋</span>
          <h2 className="text-xl font-black text-gray-800">粘贴AI生成的结果</h2>
          <p className="text-sm text-gray-400">把AI回复的JSON内容粘贴到下面</p>
        </div>

        <textarea
          value={pastedResult}
          onChange={e => setPastedResult(e.target.value)}
          placeholder={'把AI回复的内容粘贴到这里...\n\n支持直接粘贴JSON或包含```json代码块的回复'}
          className="w-full p-4 rounded-2xl border-2 border-[#E8DED5] bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:border-[#E8453C] focus:outline-none resize-none h-48 font-mono transition-colors"
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => { setStep('prompt-copy'); setError('') }}
            className="flex-1 py-3 rounded-2xl font-bold text-base border-2 border-[#E8DED5] text-gray-600 hover:bg-[#F0E6DD] active:scale-[0.97] transition-all"
          >
            ← 返回
          </button>
          <button
            onClick={handleImportResult}
            disabled={!pastedResult.trim()}
            className="flex-1 py-3 rounded-2xl font-black text-base bg-[#E8453C] text-white active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            导入故事 ✨
          </button>
        </div>
      </div>
    )
  }

  // --- Step: prompt-copy (manual mode) ---
  if (step === 'prompt-copy') {
    return (
      <div className="space-y-5 py-4">
        <div className="text-center space-y-2">
          <span className="text-4xl block">📝</span>
          <h2 className="text-xl font-black text-gray-800">复制Prompt</h2>
          <p className="text-sm text-gray-400">复制下面的内容，发送给任意AI对话框（ChatGPT、Claude、豆包等）</p>
        </div>

        <textarea
          id="prompt-textarea"
          readOnly
          value={prompt}
          className="w-full p-4 rounded-2xl border-2 border-[#E8DED5] bg-white text-xs text-gray-600 resize-none h-48 font-mono"
        />

        <button
          onClick={handleCopyPrompt}
          className={`w-full py-3 rounded-2xl font-black text-base active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33] ${
            copied
              ? 'bg-green-500 text-white shadow-[0_3px_0_#38a169]'
              : 'bg-[#E8453C] text-white'
          }`}
        >
          {copied ? '✓ 已复制！' : '📋 复制Prompt'}
        </button>

        <div className="bg-[#FFF8F0] rounded-2xl p-4 border border-[#E8DED5] space-y-2">
          <p className="text-sm font-bold text-gray-700">操作步骤：</p>
          <ol className="text-sm text-gray-500 space-y-1 list-decimal list-inside">
            <li>点击上方按钮复制Prompt</li>
            <li>打开任意AI对话工具（ChatGPT、Claude、豆包...）</li>
            <li>粘贴发送，等待AI回复</li>
            <li>复制AI回复的全部内容</li>
            <li>点击下方"粘贴结果"按钮</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep('happy-event')}
            className="flex-1 py-3 rounded-2xl font-bold text-base border-2 border-[#E8DED5] text-gray-600 hover:bg-[#F0E6DD] active:scale-[0.97] transition-all"
          >
            ← 返回修改
          </button>
          <button
            onClick={() => { setPastedResult(''); setStep('paste-result') }}
            className="flex-1 py-3 rounded-2xl font-black text-base bg-[#FFD93D] text-gray-800 active:scale-[0.97] transition-all shadow-[0_3px_0_#c9a820]"
          >
            粘贴结果 →
          </button>
        </div>
      </div>
    )
  }

  // --- Step: happy-event ---
  if (step === 'happy-event') {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-800">今天最开心的事是什么？</h2>
          <p className="text-sm text-gray-400">奥特曼们会和你一起体验这件开心事哦</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {selectedIds.map(id => {
            const c = ULTRAMAN_CHARACTERS.find(x => x.id === id)!
            return (
              <span key={id} className="text-sm bg-[#E8453C]/10 text-[#E8453C] px-3 py-1 rounded-full font-bold">
                {c.name}
              </span>
            )
          })}
        </div>

        <textarea
          value={happyEvent}
          onChange={e => setHappyEvent(e.target.value)}
          placeholder="比如：和妈妈去公园了、学会骑自行车了..."
          className="w-full p-4 rounded-2xl border-2 border-[#E8DED5] bg-white text-xl text-gray-800 placeholder:text-gray-300 focus:border-[#E8453C] focus:outline-none resize-none h-32 transition-colors"
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => setStep('select-heroes')}
            className="flex-1 py-3 rounded-2xl font-bold text-base border-2 border-[#E8DED5] text-gray-600 hover:bg-[#F0E6DD] active:scale-[0.97] transition-all"
          >
            ← 重选角色
          </button>
          {apiKey ? (
            <button
              onClick={handleAutoGenerate}
              disabled={!happyEvent.trim()}
              className="flex-1 py-3 rounded-2xl font-black text-base bg-[#E8453C] text-white active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              一键生成 ✨
            </button>
          ) : (
            <button
              onClick={handleManualGenerate}
              disabled={!happyEvent.trim()}
              className="flex-1 py-3 rounded-2xl font-black text-base bg-[#E8453C] text-white active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              复制给AI写故事 →
            </button>
          )}
        </div>

        {/* No API key: explain manual flow */}
        {!apiKey && (
          <div className="bg-blue-50 rounded-2xl p-3 border border-blue-200">
            <p className="text-xs text-blue-600 text-center">
              💡 点击上方按钮生成Prompt，复制给任意AI（ChatGPT、Claude、豆包、Kimi等），再把AI的回复粘贴回来
            </p>
          </div>
        )}

        {/* Has API key: also offer manual option */}
        {apiKey && (
          <button
            onClick={handleManualGenerate}
            disabled={!happyEvent.trim()}
            className="w-full py-2 text-sm text-gray-400 font-bold hover:text-[#E8453C] transition-colors disabled:opacity-30"
          >
            或者：复制Prompt手动请AI写故事 →
          </button>
        )}
      </div>
    )
  }

  // --- Step: select-heroes ---
  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-gray-800">今天谁出场？</h2>
        <p className="text-sm text-gray-400">选择今天故事里的奥特曼角色（可多选）</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ULTRAMAN_CHARACTERS.map(c => {
          const selected = selectedIds.includes(c.id)
          return (
            <button
              key={c.id}
              onClick={() => toggleHero(c.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-[0.95] ${
                selected
                  ? 'border-[#E8453C] bg-[#E8453C]/5 shadow-md'
                  : 'border-[#E8DED5] bg-white hover:border-[#E8453C]/30'
              }`}
            >
              <UltramanAvatar character={c} size="md" />
              <span className={`text-sm font-bold ${selected ? 'text-[#E8453C]' : 'text-gray-600'}`}>
                {c.shortName}
              </span>
              {selected && (
                <span className="text-xs text-[#E8453C]">✓ 已选</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => setStep('happy-event')}
        disabled={selectedIds.length === 0}
        className="w-full py-4 rounded-2xl font-black text-lg bg-[#E8453C] text-white active:scale-[0.97] transition-all shadow-[0_3px_0_#c13a33] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        下一步 →
      </button>
    </div>
  )
}
