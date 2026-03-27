import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { ULTRAMAN_CARDS, getHeroIds, getHeroName } from '../data/ultramanCards'
import type { Story, Module, Level } from '../types/story'

// Build hero options for selector
function getHeroOptions(): { id: string; label: string }[] {
  return getHeroIds().map(id => ({ id, label: getHeroName(id) }))
}

type Step = 'generate' | 'import' | 'settings'

const OPENAI_KEY_STORAGE = 'orange_read_openai_key'
const LAST_WORKSHOP_DATE = 'orange_read_last_workshop'

function getOpenAIKey(): string {
  try { return localStorage.getItem(OPENAI_KEY_STORAGE) ?? '' } catch { return '' }
}

function generateStoryId(module: Module, level: Level): string {
  return `custom-${module}-${level}-${Date.now()}`
}

// Find an unlocked card to reward — prioritize not-yet-unlocked ones
function pickRewardCard(): string {
  const storyCards = ULTRAMAN_CARDS.filter(c => c.unlockType === 'story')
  try {
    const cardsData: Record<string, { unlocked: boolean }> = JSON.parse(localStorage.getItem('orange_read_cards') || '{}')
    const unlockedIds = new Set(Object.entries(cardsData).filter(([, v]) => v.unlocked).map(([k]) => k))
    // Prefer cards not yet unlocked
    const locked = storyCards.filter(c => !unlockedIds.has(c.id))
    if (locked.length > 0) {
      return locked[Math.floor(Math.random() * locked.length)].id
    }
  } catch { /* fall through */ }
  // Fallback: random
  return storyCards[Math.floor(Math.random() * storyCards.length)]?.id ?? 'taro'
}

export default function StoryWorkshop() {
  const { knownChars, vocab, getAllChineseStories, getAllPinyinStories, getAllEnglishStories, addCustomStory } = useApp()
  const [step, setStep] = useState<Step>('generate')
  const [module, setModule] = useState<Module>('chinese')
  const [level, setLevel] = useState<Level>(1)
  const [hero, setHero] = useState<string>('') // '' = any ultraman
  const [copied, setCopied] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const [apiKey, setApiKey] = useState(getOpenAIKey)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  const knownCharsList = useMemo(() => [...knownChars].join(''), [knownChars])
  const vocabWords = useMemo(() => vocab.map(v => v.word).slice(0, 50).join('、'), [vocab])

  const storyCount = useMemo(() => ({
    chinese: getAllChineseStories().length,
    pinyin: getAllPinyinStories().length,
    english: getAllEnglishStories().length,
  }), [getAllChineseStories, getAllPinyinStories, getAllEnglishStories])

  const heroName = hero ? getHeroOptions().find(h => h.id === hero)?.label || '' : ''

  // Collect existing story titles for the current module to avoid duplicates
  const existingTitles = useMemo(() => {
    const stories = module === 'chinese' ? getAllChineseStories()
      : module === 'pinyin' ? getAllPinyinStories()
      : getAllEnglishStories()
    return stories.map(s => s.title)
  }, [module, getAllChineseStories, getAllPinyinStories, getAllEnglishStories])

  const prompt = useMemo(() => {
    if (module === 'chinese') return generateChinesePrompt(level, knownCharsList, vocabWords, heroName, existingTitles)
    if (module === 'pinyin') return generatePinyinPrompt(level, vocabWords, heroName, existingTitles)
    return generateEnglishPrompt(level, heroName, existingTitles)
  }, [module, level, knownCharsList, vocabWords, heroName, existingTitles])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImport = () => {
    setImportError('')
    setImportSuccess('')
    try {
      let data = jsonInput.trim()
      // Try to extract JSON from markdown code blocks
      const codeBlockMatch = data.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
      if (codeBlockMatch) data = codeBlockMatch[1].trim()

      const parsed = JSON.parse(data)

      // Validate required fields
      if (!parsed.sentences || !Array.isArray(parsed.sentences) || parsed.sentences.length === 0) {
        throw new Error('缺少 sentences 数组')
      }
      if (!parsed.quiz || !Array.isArray(parsed.quiz) || parsed.quiz.length === 0) {
        throw new Error('缺少 quiz 数组')
      }

      // Build full story object
      const story: Story = {
        id: generateStoryId(module, level),
        title: parsed.title || `自创故事 ${Date.now()}`,
        titlePinyin: parsed.titlePinyin,
        module,
        level,
        rewardCardId: parsed.rewardCardId || pickRewardCard(),
        totalSentences: parsed.sentences.length,
        sentences: parsed.sentences,
        quiz: parsed.quiz.map((q: Record<string, unknown>, i: number) => ({
          ...q,
          id: q.id || `custom-q-${Date.now()}-${i}`,
        })),
      } as Story

      const added = addCustomStory(story)
      if (added) {
        localStorage.setItem(LAST_WORKSHOP_DATE, new Date().toISOString().split('T')[0])
        setImportSuccess(`导入成功！"${story.title}" 已添加到${module === 'chinese' ? '汉字' : module === 'pinyin' ? '拼音' : '英语'}故事列表`)
        setJsonInput('')
      } else {
        setImportError('故事ID重复，请重新生成')
      }
    } catch (e) {
      setImportError(`JSON格式错误: ${e instanceof Error ? e.message : '无法解析'}`)
    }
  }

  const callOpenAI = async (model: string) => {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '你是一个儿童故事创作助手，请严格按照用户要求的JSON格式输出故事。只输出JSON，不要其他内容。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '')
      let msg = `API错误 ${resp.status}`
      try {
        const errJson = JSON.parse(errText)
        msg = errJson?.error?.message || msg
      } catch { msg += `: ${errText.slice(0, 200)}` }
      if (resp.status === 401) msg = 'API Key 无效或已过期，请检查设置'
      if (resp.status === 429) msg = 'API 调用频率超限，请稍后再试'
      throw new Error(msg)
    }

    const result = await resp.json() as { choices: Array<{ message: { content: string } }> }
    return result.choices[0]?.message?.content ?? ''
  }

  const handleGenerate = async () => {
    if (!apiKey) return
    setGenerating(true)
    setGenError('')
    try {
      let content = ''
      // Try models in order of preference
      const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
      let lastError: Error | null = null
      for (const model of models) {
        try {
          content = await callOpenAI(model)
          break
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e))
          // Only retry on model-not-found (404), otherwise stop
          if (!lastError.message.includes('404')) throw lastError
        }
      }
      if (!content && lastError) throw lastError

      setJsonInput(content)
      setStep('import')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成失败'
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setGenError('网络连接失败，请检查网络后重试')
      } else {
        setGenError(msg)
      }
    } finally {
      setGenerating(false)
    }
  }

  const saveApiKey = (key: string) => {
    setApiKey(key)
    if (key) localStorage.setItem(OPENAI_KEY_STORAGE, key)
    else localStorage.removeItem(OPENAI_KEY_STORAGE)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">🛠️ 故事工坊</h2>
        <p className="text-gray-500 text-sm mt-1">
          已有故事：汉字{storyCount.chinese}篇 · 拼音{storyCount.pinyin}篇 · 英语{storyCount.english}篇
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'generate' as Step, label: '📋 生成Prompt' },
          { key: 'import' as Step, label: '📥 导入故事' },
          { key: 'settings' as Step, label: '⚙️ 设置' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setStep(t.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              step === t.key
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {step === 'generate' && (
        <div className="space-y-3">
          {/* Module & Level selector */}
          <div className="flex gap-2">
            {([
              { m: 'chinese' as Module, label: '汉字', color: 'bg-red-500' },
              { m: 'pinyin' as Module, label: '拼音', color: 'bg-blue-500' },
              { m: 'english' as Module, label: '英语', color: 'bg-green-500' },
            ]).map(opt => (
              <button
                key={opt.m}
                onClick={() => setModule(opt.m)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  module === opt.m ? `${opt.color} text-white` : 'bg-gray-100 text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {([1, 2, 3] as Level[]).map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  level === l ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                Level {l}
              </button>
            ))}
          </div>

          {/* Hero selector */}
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <label className="text-xs font-bold text-gray-500 block mb-2">🦸 故事主角</label>
            <select
              value={hero}
              onChange={e => setHero(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">✨ 任意奥特曼（随机）</option>
              {getHeroOptions().map(h => (
                <option key={h.id} value={h.id}>{h.label}</option>
              ))}
            </select>
          </div>

          {/* Generated prompt */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500">生成的 Prompt</span>
              <button
                onClick={handleCopy}
                className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-600 active:scale-95 transition-all"
              >
                {copied ? '✅ 已复制' : '📋 一键复制'}
              </button>
            </div>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
              {prompt}
            </pre>
          </div>

          {/* API generate button */}
          {apiKey && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {generating ? '⏳ AI正在创作...' : '🤖 一键AI生成'}
            </button>
          )}
          {genError && <p className="text-red-500 text-xs text-center">{genError}</p>}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-700 font-bold mb-1">使用步骤：</p>
            <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
              <li>点击"一键复制"复制上面的 Prompt</li>
              <li>打开任意AI对话（Claude、ChatGPT等），粘贴发送</li>
              <li>复制AI返回的JSON内容</li>
              <li>切换到"导入故事"标签，粘贴并导入</li>
            </ol>
          </div>
        </div>
      )}

      {step === 'import' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {([
              { m: 'chinese' as Module, label: '汉字' },
              { m: 'pinyin' as Module, label: '拼音' },
              { m: 'english' as Module, label: '英语' },
            ]).map(opt => (
              <button
                key={opt.m}
                onClick={() => setModule(opt.m)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  module === opt.m ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {([1, 2, 3] as Level[]).map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  level === l ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                L{l}
              </button>
            ))}
          </div>

          <textarea
            value={jsonInput}
            onChange={e => { setJsonInput(e.target.value); setImportError(''); setImportSuccess('') }}
            placeholder="在这里粘贴AI生成的JSON故事内容..."
            className="w-full h-48 p-3 rounded-xl border border-gray-200 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          {importError && (
            <p className="text-red-500 text-xs bg-red-50 p-2 rounded-lg">❌ {importError}</p>
          )}
          {importSuccess && (
            <p className="text-green-600 text-xs bg-green-50 p-2 rounded-lg">✅ {importSuccess}</p>
          )}

          <button
            onClick={handleImport}
            disabled={!jsonInput.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            📥 验证并导入
          </button>
        </div>
      )}

      {step === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
            <h3 className="text-sm font-bold text-gray-700">🔑 OpenAI API Key（可选）</h3>
            <p className="text-xs text-gray-400">
              填入后可在"生成Prompt"页面直接一键AI生成故事，无需手动复制粘贴。不填也不影响使用。
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={e => saveApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {apiKey && (
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xs">✅ 已配置</span>
                <button
                  onClick={() => saveApiKey('')}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  清除
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
            <h3 className="text-sm font-bold text-gray-700">📊 当前数据</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <p>已知汉字: <span className="font-bold text-gray-700">{knownChars.size}</span></p>
              <p>生词本: <span className="font-bold text-gray-700">{vocab.length} 个</span></p>
              <p>汉字故事: <span className="font-bold text-gray-700">{storyCount.chinese} 篇</span></p>
              <p>拼音故事: <span className="font-bold text-gray-700">{storyCount.pinyin} 篇</span></p>
              <p>英语故事: <span className="font-bold text-gray-700">{storyCount.english} 篇</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Prompt Generators =====

function generateChinesePrompt(level: Level, knownChars: string, vocabWords: string, heroName: string, existingTitles: string[]): string {
  const sentenceCount = level === 1 ? 6 : level === 2 ? 8 : 10
  const charPerSentence = level === 1 ? '5-10' : level === 2 ? '8-15' : '10-20'
  const heroLine = heroName
    ? `- 故事主角是【${heroName}】，请围绕这个奥特曼的特点和背景创作`
    : '- 故事主角是奥特曼（可以是迪迦、赛罗、泽塔等任意奥特曼角色）'
  const existingLine = existingTitles.length > 0
    ? `- 已有故事标题（请避免重复，取一个不一样的新标题）: ${existingTitles.join('、')}`
    : ''

  return `请为一个正在学习汉字阅读的孩子（5-7岁）创作一篇奥特曼主题的中文小故事。

## 要求
${heroLine}
- 难度等级: Level ${level}
- 句子数量: ${sentenceCount}句
- 每句字数: ${charPerSentence}个字
- 故事标题要有创意，能体现具体情节（如"泽塔学飞""赛罗找朋友"），不要用"XX的冒险""XX的故事"这种笼统标题
${existingLine}
- 孩子目前认识以下汉字，请尽量使用这些字:
${knownChars}
- 不认识的字也可以少量使用（会标注拼音），但应控制在每句1-3个生字
${vocabWords ? `- 最近学过的生词（可以有意在故事中出现）: ${vocabWords}` : ''}
- 最后附3道理解题（选择题，4个选项）

## 输出格式（严格JSON）
\`\`\`json
{
  "title": "故事标题",
  "sentences": [
    { "words": [
      { "char": "迪", "pinyin": "dí" },
      { "char": "迦", "pinyin": "jiā" },
      { "char": "是", "pinyin": "shì" },
      { "char": "个", "pinyin": "gè" },
      { "char": "超", "pinyin": "chāo" },
      { "char": "级", "pinyin": "jí" },
      { "char": "英", "pinyin": "yīng" },
      { "char": "雄", "pinyin": "xióng" },
      { "char": "，", "pinyin": "" },
      { "char": "他", "pinyin": "tā" },
      { "char": "能", "pinyin": "néng" },
      { "char": "飞", "pinyin": "fēi" },
      { "char": "得", "pinyin": "de" },
      { "char": "很", "pinyin": "hěn" },
      { "char": "快", "pinyin": "kuài" },
      { "char": "。", "pinyin": "" }
    ]}
  ],
  "quiz": [
    {
      "question": "迪迦今天做了什么？",
      "options": ["训练", "睡觉", "吃饭", "唱歌"],
      "correctIndex": 0
    }
  ]
}
\`\`\`

注意：
- 每个字都要有 char 和 pinyin 两个字段
- 标点符号的 pinyin 为空字符串 ""
- quiz 的 correctIndex 是正确选项的索引（从0开始）
- 重要：每个 sentence 必须是一个完整的句子（以句号、感叹号、问号结尾），不要把一句话拆成多个 sentence
- 标点符号（，。！？）也要作为单独的 word 放在 words 数组中，char 为标点，pinyin 为 ""
- 只输出JSON，不要其他内容`
}

function generatePinyinPrompt(level: Level, vocabWords: string, heroName: string, existingTitles: string[]): string {
  const sentenceCount = level === 1 ? 5 : level === 2 ? 7 : 9
  const heroLine = heroName
    ? `- 故事主角是【${heroName}】，请围绕这个奥特曼的特点和背景创作`
    : '- 故事主角是奥特曼角色'
  const existingLine = existingTitles.length > 0
    ? `- 已有故事标题（请避免重复，取一个不一样的新标题）: ${existingTitles.join('、')}`
    : ''

  return `请为一个正在学习拼音的孩子（5-7岁）创作一篇奥特曼主题的拼音故事。

## 要求
${heroLine}
- 难度等级: Level ${level}
- 句子数量: ${sentenceCount}句
- 故事标题要有创意，能体现具体情节（如"泽塔学飞""赛罗找朋友"），不要用"XX的冒险""XX的故事"这种笼统标题
${existingLine}
${level === 1 ? '- L1: 主要使用简单声母韵母组合，少用整体认读音节' : level === 2 ? '- L2: 可以使用复韵母、前后鼻音' : '- L3: 可以使用所有拼音组合'}
${vocabWords ? `- 可以包含这些词: ${vocabWords}` : ''}
- 每句话都要有对应的中文含义
- 最后附3道理解题

## 输出格式（严格JSON）
\`\`\`json
{
  "title": "故事标题",
  "titlePinyin": "gù shì biāo tí",
  "sentences": [
    {
      "words": [
        { "pinyin": "dí", "char": "迪", "tone": 2 },
        { "pinyin": "jiā", "char": "迦", "tone": 1 },
        { "pinyin": "lái", "char": "来", "tone": 2 },
        { "pinyin": "le", "char": "了", "tone": 0 }
      ],
      "meaning": "迪迦来了"
    }
  ],
  "quiz": [
    {
      "question": "故事里谁来了？",
      "questionPinyin": "gù shì lǐ shuí lái le?",
      "options": ["迪迦", "赛罗", "泰罗", "盖亚"],
      "correctIndex": 0
    }
  ]
}
\`\`\`

注意：
- tone 值: 0=轻声, 1=一声, 2=二声, 3=三声, 4=四声
- char 是对应的汉字（可选，但建议提供）
- 只输出JSON，不要其他内容`
}

function generateEnglishPrompt(level: Level, heroName: string, existingTitles: string[]): string {
  const sentenceCount = level === 1 ? 5 : level === 2 ? 7 : 9
  const heroLine = heroName
    ? `- Main character: 【${heroName}】 - create a story featuring this specific Ultraman and their unique traits`
    : '- Main character: any Ultraman hero'
  const existingLine = existingTitles.length > 0
    ? `- Existing story titles (avoid duplicates, pick a unique new title): ${existingTitles.join(', ')}`
    : ''

  return `Please create an Ultraman-themed English reading story for a Chinese child (age 5-7) learning English through phonics.

## Requirements
${heroLine}
- Difficulty: Level ${level}
- Sentences: ${sentenceCount}
- Title should be creative and reflect the specific plot (e.g., "Tiga Saves the Cat", "Zero Learns to Swim"), NOT generic titles like "XX's Adventure"
${existingLine}
${level === 1 ? '- L1: Use only CVC words (cat, big, run) and simple sight words (the, is, a, he)' : level === 2 ? '- L2: Add CVCE words (make, like, home), blends (stop, from), common digraphs (sh, ch, th)' : '- L3: More complex words, r-controlled vowels, vowel teams (rain, beat, book)'}
- Each word needs phonics breakdown and Chinese translation
- Include 3 comprehension quiz questions

## Output format (strict JSON)
\`\`\`json
{
  "title": "Story Title",
  "sentences": [
    {
      "words": [
        { "word": "Tiga", "phonics": "Ti-ga", "chinese": "迪迦" },
        { "word": "is", "phonics": "i-s", "chinese": "是" },
        { "word": "big.", "phonics": "b-i-g", "chinese": "大的" }
      ],
      "chineseTranslation": "迪迦很大。"
    }
  ],
  "quiz": [
    {
      "question": "What is Tiga?",
      "options": ["big", "small", "sad", "slow"],
      "correctIndex": 0
    }
  ]
}
\`\`\`

Notes:
- phonics: split by phoneme units with hyphens (e.g., "sh-i-p", "r-u-n")
- chinese: Chinese translation of each word
- Output JSON only, no other text`
}
