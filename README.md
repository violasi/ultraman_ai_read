# 奥特曼日记

专为喜欢奥特曼的小朋友设计的中文阅读应用。选一个奥特曼陪你读绘本、写日记，认识更多汉字！

## 在线体验

直接访问：**https://ultraman-ai-read.edgeone.dev**

无需安装，打开即用。

## 本地开发

**前置条件**：安装 [Node.js](https://nodejs.org/)（建议 v18+，自带 npm），Windows / Mac / Linux 均可。

```bash
# 1. 安装项目依赖（React、Vite、Tailwind 等，只需运行一次）
npm install

# 2. 启动开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:5173`，即可使用。

> 项目本身不包含绘本内容（版权原因），首次打开绘本馆会是空的，需要自行导入，见下方说明。

## 功能一览

| 功能 | 说明 |
|------|------|
| 读绘本 | 选一个奥特曼英雄陪你一起读，自动标注拼音 |
| 写日记 | 输入今天开心的事，AI 帮你写成奥特曼故事 |
| 英雄馆 | 查看每个奥特曼陪伴你的天数，收集奖励卡片 |
| 生字本 | 阅读中不认识的字自动收集，方便复习 |
| 绘本馆 | 浏览所有绘本，按掌握度或系列排序 |

## 如何导入绘本

本项目不包含绘本内容（版权原因）。你可以通过以下方式添加自己的绘本：

### 方式一：在 App 内上传（推荐）

1. 打开 App，点击底部导航栏的**绘本馆**
2. 点击右上角 **+ 添加**（或在空状态页点击"添加绘本"）
3. 按照三步向导操作：

**第 1 步：填写信息 + 上传照片**
- 输入书名（必填）、系列、级别
- 点击 "+" 上传绘本每一页的照片（可多选）

**第 2 步：用 AI 提取文字**
- 点击"复制"按钮复制提示词
- 打开 ChatGPT / Claude / 其他对话 AI
- 上传刚才的页面照片，粘贴提示词，发送
- 复制 AI 返回的 JSON，粘贴到 App 中
- 点击"验证并预览"

**第 3 步：确认保存**
- 检查页数、生字数是否正确
- 点击"保存绘本"，完成！

### 方式二：导入已有的绘本文件

如果你有之前导出的绘本 JSON 文件：

1. 进入 **绘本馆** → **+ 添加** → **绘本管理** 页面
2. 点击"导入"按钮
3. 选择 `.json` 绘本文件，自动导入

## 如何写日记

1. 点击底部导航栏的**写日记**
2. 选择今天故事里的奥特曼角色（可多选）
3. 输入今天开心的事
4. 选择生成方式：
   - **AI 生成**：需要配置 OpenAI API Key（在设置页面），AI 会把你的开心事写成奥特曼故事
   - **手动粘贴**：直接粘贴故事内容
5. 生成后进入阅读模式，不认识的字可以点击听发音

## 如何保存绘本数据（防丢失）

用户上传的绘本存储在浏览器的 IndexedDB 中。**清除浏览器数据会导致绘本丢失**，建议定期导出备份：

### 导出

1. 进入 **绘本馆** → **+ 添加**，进入绘本管理页面
2. 每本书旁边有"导出"按钮，点击即可下载为 `.json` 文件
3. 也可以点击"全部导出"一次性导出所有绘本
4. 将下载的文件保存在安全的地方

### 导入（换设备 / 换浏览器时）

1. 进入绘本管理页面，点击"导入"
2. 选择之前导出的 `.json` 文件
3. 绘本会自动恢复到绘本馆中

### 其他数据备份

阅读进度、生字本、日记等数据可以在 **设置页面**（点击右上角齿轮图标）进行导出/导入。

## 开发者指南

### 技术栈

React 19 + TypeScript + Vite + Tailwind CSS + React Router (Hash) + Capacitor

### 项目结构

```
src/
├── components/       # UI 组件
│   ├── layout/       # AppShell, Header, BottomNav
│   └── shared/       # BookImage, RubyText, UltramanAvatar 等
├── context/          # AppContext 全局状态
├── data/             # 奥特曼角色、默认已知汉字
├── hooks/            # useReadingTracker, useTTS
├── lib/              # 工具库
│   ├── books.ts      # 绘本加载（支持本地 + IndexedDB 双数据源）
│   ├── bookStorage.ts # IndexedDB 绘本存储
│   ├── openai.ts     # AI 故事生成
│   └── storage.ts    # localStorage 数据管理
├── pages/            # 页面组件
└── types/            # TypeScript 类型
```

### 绘本数据源

App 支持两种绘本数据源，自动合并：

1. **预置绘本** — 放在 `public/books/` 目录下（已 gitignore）
2. **用户上传** — 存储在 IndexedDB 中

如果你有预置绘本数据，目录结构如下：

```
public/books/
├── catalog.json              # 所有绘本的索引
└── {bookId}/
    ├── book.json             # 绘本完整数据（含文字和拼音）
    └── pages/
        ├── page-01.jpg       # 页面图片
        ├── page-02.jpg
        └── ...
```

### 处理脚本

如果你有原始 PDF 绘本，可以用脚本批量处理：

```bash
# 从 PDF 提取页面图片
npx tsx scripts/process-books.ts extract

# 生成 catalog.json
npx tsx scripts/process-books.ts catalog

# 查看处理状态
npx tsx scripts/process-books.ts list
```

## 许可

个人项目，免费分享使用。绘本内容请自行准备，注意版权。
