export const AI_PROMPT_TEMPLATE = `我有一本中文儿童绘本的照片。请逐页提取所有中文文字，按以下 JSON 格式返回。

规则：
1. 每个汉字/标点是独立的 word 对象
2. 拼音使用声调符号（如 xiǎo），不用数字
3. 标点的 pinyin 为空字符串 ""
4. 没有文字的页面 sentences 为空数组
5. 只返回 JSON，不要其他文字

格式示例：
{
  "pages": [
    {
      "pageIndex": 0,
      "sentences": [
        {
          "words": [
            {"char": "小", "pinyin": "xiǎo"},
            {"char": "猫", "pinyin": "māo"},
            {"char": "喝", "pinyin": "hē"},
            {"char": "水", "pinyin": "shuǐ"},
            {"char": "。", "pinyin": ""}
          ]
        }
      ]
    }
  ]
}

pageIndex 从 0 开始，按照片顺序。请处理所有上传的页面图片。`
