# Process Book PDF

把绘本 PDF 处理成项目可用的 `book.json`，并在必要时补齐页面抽图、目录刷新与格式校验。

## 目标

- 只保留故事情节本身的页面。
- 生成结构稳定、前端可直接消费的 `public/books/<book-id>/book.json`。
- 每完成一批后刷新 `public/books/catalog.json`，确保前端能看到新书。

## 目录约定

- PDF 来源通常在 `library/<系列目录>/...`
- 页面图片输出到 `public/books/<book-id>/pages/`
- 成品 JSON 在 `public/books/<book-id>/book.json`
- 总目录在 `public/books/catalog.json`

## 推荐流程

1. 先扫描全库，确认哪些书还缺 `book.json`
2. 如有需要，先批量把 PDF 抽成图片
3. 逐本阅读图片，只记录正文故事页
4. 写入 `book.json`
5. 立即做 JSON 解析校验
6. 每完成一季或一轮后重建 `catalog.json`

## 扫描与抽图

优先使用项目脚本：

```bash
node scripts/process-books.ts list
node scripts/process-books.ts extract '<book-id 或关键字>'
```

补充经验：

- `scripts/process-books.ts` 现在已经支持 `library/一阅而起/汉语分级阅读绘本*`
- `bookId` 前缀约定：
  - `摩比汉语分级` -> `mobi`
  - `汉语分级阅读绘本` -> `yiyue`
- `一阅而起` 里有些 PDF 文件名只是 `1.pdf`、`2.pdf`，脚本会生成稳定 ID，如 `yiyue-第一级-01`
- `识字表` 这类非故事 PDF 应在扫描阶段直接跳过
- 排序要按数字顺序，不要出现 `1,10,2`

## 页面筛选原则

只保留和故事推进直接相关的页面。

以下内容通常不要：

- 封面后的导读页
- “这本书里藏着……”之类生词预告页
- 写给家长的话
- 游戏页
- 识字页
- 学习字/超纲字总结页
- 完成阅读页
- 版权页
- CIP 页
- 封底

如果某页虽然字很少，但仍然属于故事情节的一部分，要保留。

## `小白家的识字分级绘本` 经验

- 页码文件名不统一，有的目录是 `page-1.jpg`，有的是 `page-01.jpg`
- 读取页面前先实际检查文件名，不要假定一定补零
- 这一套页面右上角常有单个或多个“字卡”用于识字提示，例如 `米`、`瓜`、`鱼`
- 这些字卡不是故事正文的一部分，不要写进 `sentences`
- 有些册子最后会出现“完成界面”或半页结算信息
- 如果同一张图上半部分仍是故事、下半部分是结算区，只保留故事内容，不把结算信息写入 `sentences`
- 同一页如果同时存在：
  - 小喇叭编号对白
  - 底部叙述条
  - 右上角字卡
  处理顺序应是：只提取对白和叙述条；字卡一律忽略
- 同页多段文本的顺序要按真实阅读顺序整理：
  - 先按分镜从上到下
  - 同一分镜里按小喇叭编号 `1 -> 2 -> 3`
  - 不要把后面的气泡句排到前面的叙述句前面
- 批量处理前最好先做一次全量 JSON 体检，再重建目录
- `fix-book-json.mjs` 目前只会扫 `mobi-*`，不要误以为它会修其他系列

## 一阅而起《汉语分级阅读绘本》经验

- `第一级` 目前观察到的稳定结构通常是：
  - `page-01` 封面
  - `page-02` 导读或“这本书里藏着……”
  - `page-03` 标题页
  - `page-04` 开始正文
  - `page-23` 之后多为游戏页、学习字页、完成页、版权页、封底
- 正文页有时会把名词画成小图标嵌进句子里，例如 `老师`、`画笔`
- 这类图标词要按正文补全到句子中，不能漏掉
- 某些故事末页会是纯画面收尾，没有文字但仍属于故事情节
- 这种页要保留在 `pages` 中，并写成 `"sentences": []`

## `小羊上山/PDF版本-第一辑` 经验

- 这一套当前项目脚本 `scripts/process-books.ts` 还没有内建支持，开始批处理前需要先补扫描规则
- 目录里的 PDF 文件名是 `1.书名.pdf` 这种形式，排序必须按前缀数字顺序处理
- 版式和前面几套不同：这是横版跨页绘本，每个 PDF 页面本身就是一个完整跨页，不需要再拆成左右两页
- 样书《小小的，大大的》目前观察到的稳定结构通常是：
  - `PDF 第 1 页` 封面
  - `PDF 第 2 页` 标题页
  - `PDF 第 3 页` 开始正文
  - 正文通常持续到接近尾部的 1-2 页
  - 结尾常见附加页包括：`科普小知识`、`读后小游戏`、`总字表`、`本册字卡`
- 因此这套书不要只按“有没有游戏页”判断结束，遇到 `科普小知识`、`总字表`、`字卡` 也都要停止正文采集
- 这套书正文里经常出现跨页大画面配短句，单页文本可能很少，但只要仍属于故事推进就要保留
- 正文中也会出现图标嵌字，例如 `树`、`帽子`、`笑脸`、`河` 这类名词，要按正常文字补全到句子里
- 末尾如果还有纯故事收束画面但无文字，可以保留为 `"sentences": []`
- `第一辑` 目前观察到的高频规律是：
  - 大多数册子正文是 `page-03` 到 `page-10`
  - 个别更短的册子会在 `page-09` 结束正文，例如《我爱问妈妈》
  - `page-11` 往后通常已经进入 `读后小游戏 / 科普小知识 / 总字表 / 字卡 / 荣誉证书`
- 如果本机没有拼音库，可以用 macOS 自带的 `osascript -l JavaScript` 加 `CFStringTransform` 做基础汉字转拼音
- 想保留声调时，不要再做 `StripDiacritics`
- 转拼音时优先按整句转写，再把结果按字符顺序回填到 `words`
- 这样比逐字转写更稳，像 `的 / 地 / 得 / 了 / 一` 这类字更容易拿到接近语境的读音

## `我会自己读/第1级` 经验

- 这一套当前项目脚本 `scripts/process-books.ts` 也还没有内建支持，需要先补扫描规则
- 文件名通常是 `第1级 书名.pdf`，写入标题和生成 `bookId` 时要去掉前缀里的 `第1级`
- 版式和 `小羊上山` 不同：这是单页竖版绘本，不是横向跨页
- 样书《春天花儿开》目前观察到的稳定结构通常是：
  - `PDF 第 1 页` 封面
  - `PDF 第 2 页` 扉页/标题页
  - `PDF 第 3 页` 常是写给家长的话或阅读理念说明，需要跳过
  - 之后进入正文
  - 尾部常见 `第1级总字表`，这类页不要进正文
- `我会自己读` 这一套有时会在正文里夹一个“故事标题页/分篇标题页”，如果把这种页误算进 `pages`，后面整段都会出现“图片和句子错一页”的连锁问题；落 `book.json` 前要先确认正文第一页是不是已经有故事句子
- 这套书正文中会夹杂纯插图页；如果仍然属于故事情节推进，要保留为 `"sentences": []`
- 正文里也会出现图标嵌字，例如 `黛西`、`帽子`、`笑脸` 等，要按实际词语补全，不要漏字
- 迪士尼角色册里图标嵌字更常见，主角名和物名经常直接画成头像或小图标，例如 `米妮`、`苏菲亚`、`安娜`、`雪宝`、`维尼`、`彩蛋`、`蜂蜜`
- 这类页不要只抄可见汉字，要把图标代表的词一并补回完整句子，否则前端朗读会缺词
- `我会自己读` 的某些册子是两段连续故事，中间会夹一个新的分篇标题页；目前实际样本里常见于 `page-23`
- 小熊维尼这套样式里，第二段故事通常从 `page-24` 开始；末页有时会停在 `page-42`，不要预设一定存在 `page-43`
- 因此这套书的筛页重点是：
  - 跳过前置的家长说明/阅读理念页
  - 跳过正文中的标题页/分篇标题页，避免后续图片与句子整体错位
  - 跳过末尾总字表
  - 保留正文中的纯插图叙事页

## `book.json` 结构

参考字段：

```json
{
  "id": "yiyue-第一级-01",
  "title": "球在哪里？",
  "series": "汉语分级阅读绘本",
  "level": "第一级",
  "pageCount": 19,
  "uniqueChars": ["球", "在", "哪", "里"],
  "coverImage": "/books/yiyue-第一级-01/pages/page-01.jpg",
  "pages": [
    {
      "pageIndex": 0,
      "imagePath": "/books/yiyue-第一级-01/pages/page-04.jpg",
      "sentences": [
        {
          "words": [
            {"char": "球", "pinyin": "qiú"},
            {"char": "在", "pinyin": "zài"},
            {"char": "哪", "pinyin": "nǎ"},
            {"char": "里", "pinyin": "lǐ"},
            {"char": "？", "pinyin": ""}
          ]
        }
      ]
    }
  ]
}
```

补充说明：

- `coverImage` 通常使用封面 `page-01`
- `pages` 里只放正文页
- `pageIndex` 从 `0` 开始连续递增
- 标点也要进 `words`
- 没有文字但属于故事的页，可以保留为 `"sentences": []`
- `uniqueChars` 目前项目里并不是严格去重后的集合，保持与现有数据风格一致即可

## 校验

写完后至少做一次 JSON 解析校验：

```bash
node -e "JSON.parse(require('fs').readFileSync('public/books/<book-id>/book.json','utf8')); console.log('ok')"
```

如果要批量检查，可先扫描所有 `book.json` 再逐个 parse。

## 目录重建

如果项目原有脚本可用，优先使用原脚本。

如果原脚本失效，可用这个兜底命令重建：

```bash
node -e "const fs=require('fs'); const path=require('path'); const BOOKS_DIR='public/books'; const catalog=[]; for (const dir of fs.readdirSync(BOOKS_DIR)) { const p=path.join(BOOKS_DIR,dir,'book.json'); if (fs.existsSync(p)) { const book=JSON.parse(fs.readFileSync(p,'utf8')); catalog.push({ id: book.id, title: book.title, series: book.series, level: book.level, pageCount: book.pageCount || (book.pages?.length ?? 0), uniqueChars: book.uniqueChars || [], coverImage: book.coverImage || book.pages?.[0]?.imagePath || '' }); } } catalog.sort((a,b)=>a.id.localeCompare(b.id)); fs.writeFileSync(path.join(BOOKS_DIR,'catalog.json'), JSON.stringify(catalog,null,2)); console.log('rebuilt', catalog.length);"
```

## 处理习惯

- 每完成一季就刷新一次 `catalog`
- 如果用户要求前端立即可见，单本完成后也可以刷新
- 不要把坏 JSON 留在库里，否则会卡住目录重建
- 发现坏 JSON 时，先修复再继续批处理
