# 奥特曼日记 v2 升级计划

## 用户选择
- 卡片解锁：**混合解锁**（基础形态通过故事，高级形态通过里程碑/成就）
- 故事内容：**可选接入LLM + 手动粘贴prompt方式补充故事**

## 约束
- **必须向后兼容**：不丢失 localStorage 中已有的 progress、cards、known_chars 等数据
- 现有 `orange_read_cards` 中的卡片 ID（如 `taro`, `tiga`）继续有效，作为该奥特曼的"基础形态"

---

## 一、卡片系统升级：奥特曼形态收集

### 1.1 数据模型改造

**现有卡片**（21张）→ 改为每个奥特曼的"基础形态"，新增"高级形态"卡片。

新增 `UltramanCard` 字段：
```ts
interface UltramanCard {
  id: string           // 'taro' (保持不变) 或 'taro-super', 'taro-ultra'
  name: string
  nameEn: string
  series: string       // 用于分组，如 '泰罗'
  rarity: Rarity
  emoji: string
  description: string
  form: string         // 新增: '基础形态' | '超级形态' | '究极形态' 等
  heroId: string       // 新增: 归属的奥特曼 ID，如 'taro'
  unlockType: 'story' | 'milestone'  // 新增: 解锁方式
  milestoneId?: string // 新增: 对应的里程碑 ID（如果 unlockType === 'milestone'）
}
```

以泰罗为例，扩展为：
- `taro` — 泰罗·基础形态 (story解锁，已有)
- `taro-super` — 超级泰罗 (milestone: 连续阅读3天)
- `taro-ultra` — 究极泰罗 (milestone: 汉字模块全部完成)

选 5-8 个热门奥特曼各加 2-3 个形态，总卡片数扩展到 ~40-50 张。

### 1.2 里程碑/成就系统

新增 `src/data/milestones.ts`：
```ts
interface Milestone {
  id: string
  title: string           // '连续阅读3天'
  description: string
  icon: string
  rewardCardId: string    // 解锁哪张形态卡
  check: (state) => boolean  // 判断函数
  category: 'reading' | 'vocab' | 'streak' | 'collection'
}
```

里程碑示例：
- 连续阅读3天 → 超级泰罗
- 认识100个新字 → 迪迦·闪耀形态
- 完成所有汉字L1故事 → 赛罗·强壮形态
- 收集5个生词并复习 → 银河·胜利形态
- 完成10篇故事 → 奥特之王·闪耀形态
- 集齐泰罗全部形态 → 特殊里程碑徽章展示

### 1.3 卡片展示页改造 (`RewardsPage`)

- 按奥特曼分组展示（不再是平铺网格）
- 每个奥特曼一行：左侧名字，右侧横排其所有形态卡片
- 已集齐全部形态的奥特曼显示"✅ 已集齐"徽章
- 顶部增加"成就进度"区域，显示里程碑完成情况
- 保留总进度条

### 1.4 向后兼容策略

- `orange_read_cards` 中已有的 `{ taro: { unlocked: true } }` 继续有效
- 新形态卡片（如 `taro-super`）用新 ID，不影响旧数据
- 新增 `orange_read_milestones` localStorage key 存储里程碑完成状态
- 应用启动时自动检查所有里程碑条件，补发漏发的卡片

---

## 二、故事工坊：AI辅助生成故事

### 2.1 新增页面 `/story-workshop`

**故事工坊**页面，功能：

#### A. Prompt生成器
- 用户选择：模块（汉字/拼音/英语）、难度等级（L1/L2/L3）、主题（可选，默认奥特曼）
- 系统根据当前已知汉字列表、生词本、已有故事数量，自动生成一段 prompt
- prompt 内容包含：
  - 故事的JSON格式要求（匹配现有 ChineseStory/PinyinStory/EnglishStory 的结构）
  - 孩子当前认识的汉字列表（让AI控制用字范围）
  - 难度要求
  - 奥特曼主题要求
  - 3道测验题要求
- 一键复制 prompt 按钮

#### B. 故事导入器
- 一个大文本框，用户粘贴AI返回的JSON
- 前端校验JSON格式是否符合 Story 类型
- 校验通过 → 预览故事内容 → 确认导入
- 导入后存入 `orange_read_custom_stories` localStorage
- 导入的故事自动出现在对应模块的故事列表中

#### C. 可选：直接调用 OpenAI API
- 设置页可填入 OpenAI API Key（存 localStorage）
- 如果有 key，故事工坊页面增加"一键生成"按钮
- 直接调用 API 生成故事，无需手动复制粘贴
- API Key 为空时此按钮隐藏，不影响手动流程

### 2.2 自定义故事存储

新增 localStorage key: `orange_read_custom_stories`
```ts
interface CustomStoryStore {
  chinese: ChineseStory[]
  pinyin: PinyinStory[]
  english: EnglishStory[]
}
```

各模块的故事列表页（ChineseHome等）合并展示内置故事 + 自定义故事，自定义故事标记"自创"标签。

### 2.3 每周提醒

- 首页增加逻辑：如果距上次添加自定义故事 > 7天，且故事总量较少，显示提示卡片
- "故事快读完啦！去故事工坊生成新故事吧 →"

---

## 三、实施步骤

### Step 1: 卡片形态数据扩展
- 修改 `types/rewards.ts` 增加 form/heroId/unlockType 字段
- 修改 `data/ultramanCards.ts` 扩展卡片数据（~40-50张）
- 确保旧卡片 ID 不变

### Step 2: 里程碑系统
- 新增 `types/milestone.ts` 和 `data/milestones.ts`
- 在 `AppContext` 中增加里程碑检查逻辑和状态
- 新增 `orange_read_milestones` localStorage key

### Step 3: 卡片展示页改造
- 重写 `RewardsPage.tsx`：按奥特曼分组、形态横排、集齐徽章
- 增加成就/里程碑展示区域

### Step 4: 故事工坊页面
- 新增 `pages/StoryWorkshop.tsx`
- 实现 prompt 生成器（基于已知字表和故事格式）
- 实现 JSON 导入器（校验+预览+存储）
- 添加路由 `/workshop`

### Step 5: 自定义故事集成
- 修改 `AppContext` 支持加载自定义故事
- 修改各模块 Home 页合并展示
- 首页增加"故事快读完了"提醒

### Step 6: 可选 OpenAI API 集成
- 设置页增加 API Key 输入
- 故事工坊增加"一键生成"按钮
- 调用 OpenAI chat completions API

### Step 7: 验证向后兼容
- 确保现有 localStorage 数据完全保留
- 新功能使用新 key，不覆盖旧 key
