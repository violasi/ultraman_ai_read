import type { StorySentence } from '../types/diary'

interface StoryGenerationParams {
  selectedUltramans: string[] // character names (not ids)
  happyEvent: string
  knownChars: string[]
  vocabChars: string[]
}

export function generateStoryPrompt(params: StoryGenerationParams): string {
  const { selectedUltramans, happyEvent, knownChars, vocabChars } = params
  const heroNames = selectedUltramans.join('、')
  const knownCharsStr = knownChars.join('')
  const vocabStr = vocabChars.length > 0 ? vocabChars.join('、') : ''

  return `你是一位资深儿童文学作家。请为5-7岁中国孩子创作一篇发生在奥特曼世界的中文小故事。

## 灵感来源
孩子今天最开心的事：${happyEvent}

## 主角
${heroNames}

## 故事要求
1. **纯奥特曼世界观**：故事完全发生在光之国/M78星云/奥特曼世界，主角是${heroNames}
2. **场景转化**：把"${happyEvent}"转化为奥特曼世界里的对应场景，例如：
   - "在幼儿园打水仗" → 在奥特训练基地和同伴们泼水玩耍
   - "吃了草莓蛋糕" → 在光之国庆祝胜利分享星光蛋糕
   - "和小朋友玩捉迷藏" → 和奥特兄弟们在星云里捉迷藏
3. **没有人类角色**：不出现小朋友、孩子、人类，只有奥特曼、怪兽等
4. **句子数量**：6-8句
5. **每句长度**：8-15个字

## 语言质量要求（最重要！）
- **先构思一个通顺、有趣的故事，再考虑用字**。故事流畅度是第一优先级
- 每个句子都必须是日常中文里自然、通顺的表达，大人读出来也觉得通顺
- **禁止生造词**：不要为了使用某个字而拼凑不存在的词语（如"小星"→应该说"星星"或"小星星"）
- **禁止语法错误**：不要省略必要的量词、助词，不要出现搭配不当的词组
- 用词要像真正的绘本故事一样自然：简单但不生硬，有画面感
- 比喻要完整自然，如"像小星星一样闪闪发光"而不是"像小星"

## 用字参考
以下是孩子认识的汉字，**尽量**从中选字，但如果用这些字写不出通顺的句子，**宁可用不认识的字也不要写出别扭的句子**：
${knownCharsStr}
${vocabStr ? `\n以下是正在学的生字，可以适当出现以帮助复习：${vocabStr}` : ''}
- 每句中不认识的新字控制在1-3个即可

## 自检清单（输出前请逐条检查）
- [ ] 每个句子单独读是否通顺？大人读出来是否自然？
- [ ] 有没有生造的词语？每个词语是否在日常中文中真实存在？
- [ ] 比喻是否完整？（"像X"后面是否有具体描述？）
- [ ] 故事是否有起因、经过、结尾，逻辑连贯？
- [ ] 标题是否具体生动？（不要用"XX的故事""XX的一天"）

## 输出格式（严格JSON，不要输出任何其他内容）
\`\`\`json
{
  "title": "故事标题",
  "sentences": [
    { "words": [
      { "char": "迪", "pinyin": "dí" },
      { "char": "迦", "pinyin": "jiā" },
      { "char": "今", "pinyin": "jīn" },
      { "char": "天", "pinyin": "tiān" },
      { "char": "很", "pinyin": "hěn" },
      { "char": "开", "pinyin": "kāi" },
      { "char": "心", "pinyin": "xīn" },
      { "char": "。", "pinyin": "" }
    ]}
  ]
}
\`\`\`

## 格式注意
- 每个字都要有 char 和 pinyin 两个字段
- 拼音使用带声调符号的格式（ā á ǎ à）
- 标点符号的 pinyin 为空字符串 ""
- 每个 sentence 是一个完整句子（以。！？结尾）
- 标点符号（，。！？）也作为单独的 word
- 只输出JSON`
}

interface StoryResponse {
  title: string
  sentences: StorySentence[]
}

export async function callOpenAI(apiKey: string, prompt: string): Promise<StoryResponse> {
  const models = ['gpt-4o-mini', 'gpt-4o']

  for (const model of models) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: '你是一位资深儿童文学作家，专门为5-7岁中国孩子创作奥特曼世界的中文故事。你的作品语言自然流畅，用词简单但绝不生硬，每个句子都像真正出版的绘本一样通顺。故事完全发生在奥特曼世界，不出现人类角色。你只输出严格的JSON格式。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.9,
          max_tokens: 2000,
        }),
      })

      if (!res.ok) {
        if (res.status === 404 && model !== models[models.length - 1]) continue
        const err = await res.text()
        throw new Error(`API错误 (${res.status}): ${err}`)
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content ?? ''
      return parseStoryResponse(content)
    } catch (e) {
      if (model === models[models.length - 1]) throw e
    }
  }

  throw new Error('所有模型都失败了')
}

export function parseStoryResponse(content: string): StoryResponse {
  // Extract JSON from markdown code blocks if present
  let jsonStr = content.trim()
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
  }

  const parsed = JSON.parse(jsonStr)

  if (!parsed.title || typeof parsed.title !== 'string') {
    throw new Error('缺少故事标题')
  }
  if (!Array.isArray(parsed.sentences) || parsed.sentences.length === 0) {
    throw new Error('缺少故事句子')
  }

  for (const sentence of parsed.sentences) {
    if (!Array.isArray(sentence.words)) {
      throw new Error('句子格式错误：缺少words数组')
    }
    for (const word of sentence.words) {
      if (typeof word.char !== 'string' || typeof word.pinyin !== 'string') {
        throw new Error('词语格式错误：需要char和pinyin字段')
      }
    }
  }

  return { title: parsed.title, sentences: parsed.sentences }
}
