# 添加新主题版本

当需要为项目新增一个 IP 主题版本（如汪汪队、奥特曼、艾莎等）时，按照以下清单逐步完成。

## 前置准备

- 确定主题 ID（英文小写，如 `pawpatrol`、`ultraman`、`elsa`）
- 确定中文名称（如「汪汪队日记」）
- 准备好角色列表（ID、中文名、简称、代表色）
- 准备好角色头像 PNG 图片（透明背景，建议 256×256）

## 步骤清单

### 1. 类型定义 — `src/vite-env.d.ts`

在 `VITE_THEME` 联合类型中追加新主题名：

```typescript
readonly VITE_THEME?: 'elsa' | 'ultraman' | 'pawpatrol' | '新主题ID'
```

> 不加这一步会导致 TypeScript 编译报错：类型无重叠。

### 2. 角色数据 — `src/data/{主题}Characters.ts`

新建角色数据文件，导出角色数组。每个角色包含以下字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| `id` | 英文标识，也用于奖励图片命名 | `chase` |
| `name` | 中文全名 | `阿奇` |
| `shortName` | 简称，用于 UI 紧凑展示 | `阿奇` |
| `imageUrl` | 头像路径 `./images/{主题}/{id}.png` | `./images/pawpatrol/chase.png` |
| `fallbackColor` | 头像加载失败时的背景色 | `#1E3A8A` |
| `fallbackChar` | 头像加载失败时显示的单字 | `奇` |

参考现有文件：
- `src/data/elsaCharacters.ts`
- `src/data/ultramanCharacters.ts`
- `src/data/pawPatrolCharacters.ts`

### 3. 主题配置 — `src/config/theme.ts`

这是改动最多的核心文件，需要新增以下内容：

#### 3.1 导入角色数据

```typescript
import { 新主题Characters } from '../data/新主题Characters'
```

#### 3.2 角色选择逻辑

在 `characters` 变量的条件分支中追加新主题判断。

#### 3.3 主题元数据（`theme` 对象）

| 字段 | 说明 |
|------|------|
| `theme.id` | 主题 ID |
| `theme.appName` | 应用中文名，如「汪汪队日记」 |
| `theme.storagePrefix` | 本地存储前缀，**必须唯一**以隔离各版本数据 |
| `theme.exportFilePrefix` | 备份文件名前缀 |

#### 3.4 UI 标签（`theme.labels`）

需要定制的标签较多，控制全站文案风格：

- `heroHall` / `heroHallFull` — 角色大厅名称
- `heroHallIcon` — 底部导航图标 emoji
- `characterNoun` — 角色的统称（如「狗狗」「奥特曼」「公主」）
- `selectHeroPrompt` / `heroCompanionPrompt` — 选角色提示语
- `changeHero` / `selectHeroForBook` — 更换角色
- `emptyDiaryPrompt` — 空日记提示
- `diaryBookTitle` — 日记本标题
- `notFoundHero` / `backToHall` — 404 相关文案
- `description` — 应用描述

#### 3.5 Loading 文案

主题化的加载等待文案数组，在生成故事时滚动展示。

#### 3.6 AI 配置

| 字段 | 说明 |
|------|------|
| `systemRole` | Claude API 系统提示词，定义角色世界观和叙事风格 |
| `worldDescription` | 故事世界背景描述 |
| `sceneExamples` | 示例场景转换，供 AI 参考 |
| `noHumanRule` | 角色出场规则 |

> 这部分直接决定了生成故事的质量和主题契合度，需要仔细编写。

#### 3.7 颜色方案

10 个 CSS 变量色值，运行时通过 `applyThemeColors()` 注入 `:root`：

```
primary / primaryDark — 主色
secondary / secondaryDark — 辅助色
bgWarm / bgPage / bgHover — 背景色
border / shadow / gradientEnd — 装饰色
```

#### 3.8 Capacitor 配置

- `appId`：App 包名（如 `com.pawpatrol.diary`）
- `appName`：移动端显示名

### 4. 角色头像图片 — `public/images/{主题}/`

将每个角色的 PNG 头像放入此目录，文件名与角色 `id` 一致：

```
public/images/pawpatrol/
├── chase.png
├── marshall.png
├── skye.png
└── ...
```

### 5. 奖励图片（可选）— `public/images/rewards/`

命名格式：`{角色ID}_gift_{等级}.png`

- 等级 1 在累计陪读 3 天后解锁
- 等级 2 在 6 天后解锁，以此类推

示例：`chase_gift_1.png`、`marshall_gift_2.png`

> 奖励图片不是必须的，没有图片时前端会优雅降级。

### 6. 构建脚本 — `package.json`

添加四条 npm scripts：

```json
"dev:{主题}": "VITE_THEME={主题} vite",
"build:{主题}": "VITE_THEME={主题} npx tsc -b && VITE_THEME={主题} vite build",
"dev:{主题}:license": "VITE_THEME={主题} VITE_LICENSE_MODE=true vite",
"build:{主题}:license": "VITE_THEME={主题} VITE_LICENSE_MODE=true npx tsc -b && VITE_THEME={主题} VITE_LICENSE_MODE=true vite build"
```

### 7. 主题 CSS（可选）— `src/themes/{主题}.css`

如果颜色方案通过 `theme.ts` 的 `applyThemeColors()` 已经够用，可以不新建 CSS 文件。
只有需要额外覆盖样式时才新建。

### 8. 构建与输出

```bash
npm run build:{主题}
```

构建产物输出到项目根目录的 `{主题}/` 或 `{主题}-diary/` 文件夹，包含：

```
{输出目录}/
├── index.html          ← 自动填入主题标题和颜色
├── manifest.json       ← 自动生成，含主题名称和描述
├── favicon.svg
├── icons.svg
├── assets/
│   └── index-{hash}.js
└── images/
    ├── {主题}/         ← 角色头像
    └── rewards/        ← 奖励图片
```

> `index.html` 中的 `__APP_TITLE__` 和 `__THEME_COLOR__` 占位符由 vite 插件在构建时自动替换。
> `manifest.json` 由 `vite.config.ts` 中的 `manifestPlugin` 动态生成。

### 9. 使用说明 PDF

修改 `使用说明.md`，把标题、角色 ID 列表、示例文件名替换为新主题内容，然后用 reportlab 生成 PDF 放入输出目录。

重点替换：
- 标题：`# {主题名}日记 使用说明`
- 奖励图片示例文件名
- 角色 ID 对照表

## 数据隔离说明

每个主题通过 `theme.storagePrefix` 使用独立的 localStorage 前缀，互不干扰。
以下 key 均会自动加上前缀：

- `DIARY_ENTRIES` — 日记条目
- `VOCAB` — 识字记录
- `KNOWN_CHARS` — 已会汉字
- `BOOK_READ_RECORDS` — 阅读记录
- `REWARD_CARDS` — 奖励卡片

## 验证检查清单

- [ ] `npm run dev:{主题}` 能正常启动，无 TS 编译错误
- [ ] 首页标题显示正确的应用名
- [ ] 底部导航的角色大厅名称和图标正确
- [ ] 角色大厅能看到所有角色，头像正常加载
- [ ] 选择角色后能正常生成主题故事
- [ ] 奖励系统正常工作（如有奖励图片）
- [ ] `npm run build:{主题}` 构建成功
- [ ] 构建产物可以通过双击 `index.html` 正常打开
- [ ] 使用说明 PDF 内容准确
