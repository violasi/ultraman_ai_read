import type { EnglishStory, Level } from '../../../types/story'

export const allEnglishStories: EnglishStory[] = [
  // ===== Level 1: CVC words, very simple =====
  {
    id: 'en-1-1',
    title: 'Tiga Is Big',
    module: 'english',
    level: 1,
    rewardCardId: 'tiga',
    totalSentences: 5,
    sentences: [
      {
        words: [
          { word: 'Tiga', phonics: 'Ti-ga', chinese: '迪迦' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'big.', phonics: 'b-i-g', chinese: '大的' },
        ],
        chineseTranslation: '迪迦很大。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'red.', phonics: 'r-e-d', chinese: '红色的' },
        ],
        chineseTranslation: '他是红色的。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'hit', phonics: 'h-i-t', chinese: '打' },
          { word: 'bad', phonics: 'b-a-d', chinese: '坏的' },
          { word: 'men.', phonics: 'm-e-n', chinese: '人' },
        ],
        chineseTranslation: '他能打坏人。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'hot.', phonics: 'h-o-t', chinese: '热的' },
        ],
        chineseTranslation: '他很热（充满能量）。',
      },
      {
        words: [
          { word: 'Run,', phonics: 'r-u-n', chinese: '跑' },
          { word: 'Tiga,', phonics: 'Ti-ga', chinese: '迪迦' },
          { word: 'run!', phonics: 'r-u-n', chinese: '跑' },
        ],
        chineseTranslation: '跑吧，迪迦，跑！',
      },
    ],
    quiz: [
      { id: 'en-1-1-q1', question: 'Is Tiga big or small?', options: ['Small', 'Big', 'Thin', 'Short'], correctIndex: 1 },
      { id: 'en-1-1-q2', question: 'What color is Tiga?', options: ['Blue', 'Green', 'Red', 'Yellow'], correctIndex: 2 },
      { id: 'en-1-1-q3', question: 'Who can Tiga hit?', options: ['Good men', 'Bad men', 'Dogs', 'Cats'], correctIndex: 1 },
    ],
  },
  {
    id: 'en-1-2',
    title: 'Zero Can Run',
    module: 'english',
    level: 1,
    rewardCardId: 'seven',
    totalSentences: 5,
    sentences: [
      {
        words: [
          { word: 'Zero', phonics: 'Ze-ro', chinese: '赛罗' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'run.', phonics: 'r-u-n', chinese: '跑' },
        ],
        chineseTranslation: '赛罗能跑。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'fast.', phonics: 'f-a-st', chinese: '快的' },
        ],
        chineseTranslation: '他很快。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'jump.', phonics: 'j-u-mp', chinese: '跳' },
        ],
        chineseTranslation: '他能跳。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'kick.', phonics: 'k-i-ck', chinese: '踢' },
        ],
        chineseTranslation: '他能踢。',
      },
      {
        words: [
          { word: 'Go,', phonics: 'g-o', chinese: '加油' },
          { word: 'Zero,', phonics: 'Ze-ro', chinese: '赛罗' },
          { word: 'go!', phonics: 'g-o', chinese: '加油' },
        ],
        chineseTranslation: '加油，赛罗，加油！',
      },
    ],
    quiz: [
      { id: 'en-1-2-q1', question: 'Can Zero run?', options: ['No', 'Yes', 'Maybe', 'Sometimes'], correctIndex: 1 },
      { id: 'en-1-2-q2', question: 'Is Zero fast or slow?', options: ['Slow', 'Fast', 'Tired', 'Sad'], correctIndex: 1 },
      { id: 'en-1-2-q3', question: 'What can Zero do?', options: ['Sing', 'Cook', 'Jump and kick', 'Sleep'], correctIndex: 2 },
    ],
  },
  {
    id: 'en-1-3',
    title: 'Tiga Has a Pet',
    module: 'english',
    level: 1,
    rewardCardId: 'ginga',
    totalSentences: 5,
    sentences: [
      {
        words: [
          { word: 'Tiga', phonics: 'Ti-ga', chinese: '迪迦' },
          { word: 'has', phonics: 'h-a-s', chinese: '有' },
          { word: 'a', phonics: 'a', chinese: '一只' },
          { word: 'pet.', phonics: 'p-e-t', chinese: '宠物' },
        ],
        chineseTranslation: '迪迦有一只宠物。',
      },
      {
        words: [
          { word: 'It', phonics: 'i-t', chinese: '它' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'a', phonics: 'a', chinese: '一只' },
          { word: 'cat.', phonics: 'c-a-t', chinese: '猫' },
        ],
        chineseTranslation: '它是一只猫。',
      },
      {
        words: [
          { word: 'The', phonics: 'th-e', chinese: '这只' },
          { word: 'cat', phonics: 'c-a-t', chinese: '猫' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'red.', phonics: 'r-e-d', chinese: '红色的' },
        ],
        chineseTranslation: '这只猫是红色的。',
      },
      {
        words: [
          { word: 'The', phonics: 'th-e', chinese: '这只' },
          { word: 'cat', phonics: 'c-a-t', chinese: '猫' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'sit.', phonics: 's-i-t', chinese: '坐' },
        ],
        chineseTranslation: '这只猫能坐。',
      },
      {
        words: [
          { word: 'Tiga', phonics: 'Ti-ga', chinese: '迪迦' },
          { word: 'and', phonics: 'a-n-d', chinese: '和' },
          { word: 'the', phonics: 'th-e', chinese: '这只' },
          { word: 'cat', phonics: 'c-a-t', chinese: '猫' },
          { word: 'nap.', phonics: 'n-a-p', chinese: '小睡' },
        ],
        chineseTranslation: '迪迦和这只猫一起小睡。',
      },
    ],
    quiz: [
      { id: 'en-1-3-q1', question: 'What pet does Tiga have?', options: ['A dog', 'A cat', 'A pig', 'A hen'], correctIndex: 1 },
      { id: 'en-1-3-q2', question: 'What color is the cat?', options: ['Big', 'Hot', 'Red', 'Sad'], correctIndex: 2 },
      { id: 'en-1-3-q3', question: 'What can the cat do?', options: ['Run', 'Sit', 'Hit', 'Dig'], correctIndex: 1 },
    ],
  },
  {
    id: 'en-1-4',
    title: 'Zero Is Sad',
    module: 'english',
    level: 1,
    rewardCardId: 'victory',
    totalSentences: 5,
    sentences: [
      {
        words: [
          { word: 'Zero', phonics: 'Ze-ro', chinese: '赛罗' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'sad.', phonics: 's-a-d', chinese: '伤心的' },
        ],
        chineseTranslation: '赛罗很伤心。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'sat', phonics: 's-a-t', chinese: '坐' },
          { word: 'in', phonics: 'i-n', chinese: '在' },
          { word: 'the', phonics: 'th-e', chinese: '这个' },
          { word: 'mud.', phonics: 'm-u-d', chinese: '泥' },
        ],
        chineseTranslation: '他坐在泥里。',
      },
      {
        words: [
          { word: 'A', phonics: 'a', chinese: '一个' },
          { word: 'pal', phonics: 'p-a-l', chinese: '伙伴' },
          { word: 'ran', phonics: 'r-a-n', chinese: '跑' },
          { word: 'to', phonics: 'to', chinese: '向' },
          { word: 'him.', phonics: 'h-i-m', chinese: '他' },
        ],
        chineseTranslation: '一个伙伴跑向他。',
      },
      {
        words: [
          { word: 'The', phonics: 'th-e', chinese: '这个' },
          { word: 'pal', phonics: 'p-a-l', chinese: '伙伴' },
          { word: 'gave', phonics: 'g-a-ve', chinese: '给' },
          { word: 'a', phonics: 'a', chinese: '一个' },
          { word: 'hug.', phonics: 'h-u-g', chinese: '拥抱' },
        ],
        chineseTranslation: '伙伴给了一个拥抱。',
      },
      {
        words: [
          { word: 'Zero', phonics: 'Ze-ro', chinese: '赛罗' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'not', phonics: 'n-o-t', chinese: '不' },
          { word: 'sad!', phonics: 's-a-d', chinese: '伤心的' },
        ],
        chineseTranslation: '赛罗不伤心了！',
      },
    ],
    quiz: [
      { id: 'en-1-4-q1', question: 'How does Zero feel at first?', options: ['Big', 'Sad', 'Hot', 'Red'], correctIndex: 1 },
      { id: 'en-1-4-q2', question: 'Who ran to Zero?', options: ['A cat', 'A pal', 'A bug', 'A hen'], correctIndex: 1 },
      { id: 'en-1-4-q3', question: 'What did the pal give?', options: ['A hit', 'A hug', 'A hat', 'A cup'], correctIndex: 1 },
    ],
  },
  {
    id: 'en-1-5',
    title: 'The Big Sun',
    module: 'english',
    level: 1,
    rewardCardId: 'rosso-flame',
    totalSentences: 5,
    sentences: [
      {
        words: [
          { word: 'The', phonics: 'th-e', chinese: '这个' },
          { word: 'sun', phonics: 's-u-n', chinese: '太阳' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'big.', phonics: 'b-i-g', chinese: '大的' },
        ],
        chineseTranslation: '太阳是大的。',
      },
      {
        words: [
          { word: 'The', phonics: 'th-e', chinese: '这个' },
          { word: 'sun', phonics: 's-u-n', chinese: '太阳' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'hot.', phonics: 'h-o-t', chinese: '热的' },
        ],
        chineseTranslation: '太阳是热的。',
      },
      {
        words: [
          { word: 'Tiga', phonics: 'Ti-ga', chinese: '迪迦' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'go', phonics: 'g-o', chinese: '去' },
          { word: 'up.', phonics: 'u-p', chinese: '上' },
        ],
        chineseTranslation: '迪迦能上去。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'got', phonics: 'g-o-t', chinese: '到达' },
          { word: 'to', phonics: 'to', chinese: '到' },
          { word: 'the', phonics: 'th-e', chinese: '这个' },
          { word: 'sun.', phonics: 's-u-n', chinese: '太阳' },
        ],
        chineseTranslation: '他到达了太阳。',
      },
      {
        words: [
          { word: 'It', phonics: 'i-t', chinese: '它' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'so', phonics: 's-o', chinese: '如此' },
          { word: 'hot!', phonics: 'h-o-t', chinese: '热的' },
        ],
        chineseTranslation: '它是如此热！',
      },
    ],
    quiz: [
      { id: 'en-1-5-q1', question: 'Is the sun big or small?', options: ['Small', 'Big', 'Sad', 'Red'], correctIndex: 1 },
      { id: 'en-1-5-q2', question: 'Is the sun hot or not?', options: ['Not hot', 'Hot', 'Cold', 'Wet'], correctIndex: 1 },
      { id: 'en-1-5-q3', question: 'Who got to the sun?', options: ['Zero', 'Tiga', 'A cat', 'A dog'], correctIndex: 1 },
    ],
  },
  {
    id: 'en-1-6',
    title: 'A Red Egg',
    module: 'english',
    level: 1,
    rewardCardId: 'blu-aqua',
    totalSentences: 5,
    sentences: [
      {
        words: [
          { word: 'I', phonics: 'I', chinese: '我' },
          { word: 'see', phonics: 's-ee', chinese: '看见' },
          { word: 'an', phonics: 'a-n', chinese: '一个' },
          { word: 'egg.', phonics: 'e-g-g', chinese: '蛋' },
        ],
        chineseTranslation: '我看见一个蛋。',
      },
      {
        words: [
          { word: 'The', phonics: 'th-e', chinese: '这个' },
          { word: 'egg', phonics: 'e-g-g', chinese: '蛋' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'red.', phonics: 'r-e-d', chinese: '红色的' },
        ],
        chineseTranslation: '这个蛋是红色的。',
      },
      {
        words: [
          { word: 'It', phonics: 'i-t', chinese: '它' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'big.', phonics: 'b-i-g', chinese: '大的' },
        ],
        chineseTranslation: '它是大的。',
      },
      {
        words: [
          { word: 'The', phonics: 'th-e', chinese: '这个' },
          { word: 'egg', phonics: 'e-g-g', chinese: '蛋' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'hot.', phonics: 'h-o-t', chinese: '热的' },
        ],
        chineseTranslation: '这个蛋是热的。',
      },
      {
        words: [
          { word: 'A', phonics: 'a', chinese: '一个' },
          { word: 'pet', phonics: 'p-e-t', chinese: '宠物' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'in', phonics: 'i-n', chinese: '在' },
          { word: 'it!', phonics: 'i-t', chinese: '里面' },
        ],
        chineseTranslation: '一个宠物在里面！',
      },
    ],
    quiz: [
      { id: 'en-1-6-q1', question: 'What color is the egg?', options: ['Big', 'Hot', 'Red', 'Sad'], correctIndex: 2 },
      { id: 'en-1-6-q2', question: 'Is the egg big or small?', options: ['Small', 'Big', 'Bad', 'Wet'], correctIndex: 1 },
      { id: 'en-1-6-q3', question: 'What is in the egg?', options: ['A bug', 'A pet', 'A man', 'A nut'], correctIndex: 1 },
    ],
  },
  {
    id: 'en-1-7',
    title: 'Run and Jump',
    module: 'english',
    level: 1,
    rewardCardId: 'taiga',
    totalSentences: 5,
    sentences: [
      {
        words: [
          { word: 'Tiga', phonics: 'Ti-ga', chinese: '迪迦' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'run.', phonics: 'r-u-n', chinese: '跑' },
        ],
        chineseTranslation: '迪迦能跑。',
      },
      {
        words: [
          { word: 'Zero', phonics: 'Ze-ro', chinese: '赛罗' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'jump.', phonics: 'j-u-mp', chinese: '跳' },
        ],
        chineseTranslation: '赛罗能跳。',
      },
      {
        words: [
          { word: 'Run', phonics: 'r-u-n', chinese: '跑' },
          { word: 'and', phonics: 'a-n-d', chinese: '和' },
          { word: 'jump!', phonics: 'j-u-mp', chinese: '跳' },
        ],
        chineseTranslation: '跑和跳！',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'hit', phonics: 'h-i-t', chinese: '打' },
          { word: 'a', phonics: 'a', chinese: '一个' },
          { word: 'bad', phonics: 'b-a-d', chinese: '坏的' },
          { word: 'bug.', phonics: 'b-u-g', chinese: '虫子' },
        ],
        chineseTranslation: '他能打一个坏虫子。',
      },
      {
        words: [
          { word: 'Yes,', phonics: 'y-e-s', chinese: '是的' },
          { word: 'we', phonics: 'we', chinese: '我们' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'go!', phonics: 'g-o', chinese: '加油' },
        ],
        chineseTranslation: '是的，我们能行！',
      },
    ],
    quiz: [
      { id: 'en-1-7-q1', question: 'What can Tiga do?', options: ['Sit', 'Run', 'Nap', 'Dig'], correctIndex: 1 },
      { id: 'en-1-7-q2', question: 'What can Zero do?', options: ['Jump', 'Sit', 'Nap', 'Hug'], correctIndex: 0 },
      { id: 'en-1-7-q3', question: 'What did he hit?', options: ['A cat', 'A pal', 'A bad bug', 'A red egg'], correctIndex: 2 },
    ],
  },

  // ===== Level 2: Silent-e, digraphs =====
  {
    id: 'en-2-1',
    title: 'The Brave Light',
    module: 'english',
    level: 2,
    rewardCardId: 'nexus-red',
    totalSentences: 6,
    sentences: [
      {
        words: [
          { word: 'Tiga', phonics: 'Ti-ga', chinese: '迪迦' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'brave.', phonics: 'br-a-ve', chinese: '勇敢的' },
        ],
        chineseTranslation: '迪迦是勇敢的。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'make', phonics: 'm-a-ke', chinese: '制造' },
          { word: 'light.', phonics: 'l-igh-t', chinese: '光' },
        ],
        chineseTranslation: '他能制造光。',
      },
      {
        words: [
          { word: 'The', phonics: 'th-e', chinese: '这个' },
          { word: 'light', phonics: 'l-igh-t', chinese: '光' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'shine.', phonics: 'sh-i-ne', chinese: '发光' },
        ],
        chineseTranslation: '光能照耀。',
      },
      {
        words: [
          { word: 'It', phonics: 'i-t', chinese: '它' },
          { word: 'keeps', phonics: 'k-ee-ps', chinese: '保持' },
          { word: 'us', phonics: 'u-s', chinese: '我们' },
          { word: 'safe.', phonics: 's-a-fe', chinese: '安全的' },
        ],
        chineseTranslation: '它让我们安全。',
      },
      {
        words: [
          { word: 'The', phonics: 'th-e', chinese: '这个' },
          { word: 'brave', phonics: 'br-a-ve', chinese: '勇敢的' },
          { word: 'light', phonics: 'l-igh-t', chinese: '光' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'hope.', phonics: 'h-o-pe', chinese: '希望' },
        ],
        chineseTranslation: '勇敢的光就是希望。',
      },
      {
        words: [
          { word: 'Thank', phonics: 'th-a-nk', chinese: '谢谢' },
          { word: 'you,', phonics: 'y-ou', chinese: '你' },
          { word: 'Tiga!', phonics: 'Ti-ga', chinese: '迪迦' },
        ],
        chineseTranslation: '谢谢你，迪迦！',
      },
    ],
    quiz: [
      { id: 'en-2-1-q1', question: 'What can Tiga make?', options: ['Fire', 'Light', 'Water', 'Wind'], correctIndex: 1 },
      { id: 'en-2-1-q2', question: 'What does the light do?', options: ['Burns things', 'Keeps us safe', 'Makes noise', 'Breaks walls'], correctIndex: 1 },
      { id: 'en-2-1-q3', question: 'The brave light is what?', options: ['Fear', 'Anger', 'Hope', 'Sadness'], correctIndex: 2 },
    ],
  },
  {
    id: 'en-2-2',
    title: 'Zero Flies High',
    module: 'english',
    level: 2,
    rewardCardId: 'zero-strong',
    totalSentences: 6,
    sentences: [
      {
        words: [
          { word: 'Zero', phonics: 'Ze-ro', chinese: '赛罗' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'fly.', phonics: 'fl-y', chinese: '飞' },
        ],
        chineseTranslation: '赛罗能飞。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'flies', phonics: 'fl-ie-s', chinese: '飞' },
          { word: 'up', phonics: 'u-p', chinese: '向上' },
          { word: 'high.', phonics: 'h-igh', chinese: '高' },
        ],
        chineseTranslation: '他飞得很高。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'in', phonics: 'i-n', chinese: '在' },
          { word: 'the', phonics: 'th-e', chinese: '这个' },
          { word: 'sky.', phonics: 'sk-y', chinese: '天空' },
        ],
        chineseTranslation: '他在天空中。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'see', phonics: 's-ee', chinese: '看见' },
          { word: 'a', phonics: 'a', chinese: '一棵' },
          { word: 'tree.', phonics: 'tr-ee', chinese: '树' },
        ],
        chineseTranslation: '他能看见一棵树。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'see', phonics: 's-ee', chinese: '看见' },
          { word: 'the', phonics: 'th-e', chinese: '这个' },
          { word: 'sea.', phonics: 's-ea', chinese: '大海' },
        ],
        chineseTranslation: '他能看见大海。',
      },
      {
        words: [
          { word: 'Fly', phonics: 'fl-y', chinese: '飞' },
          { word: 'high,', phonics: 'h-igh', chinese: '高' },
          { word: 'Zero!', phonics: 'Ze-ro', chinese: '赛罗' },
        ],
        chineseTranslation: '飞高点，赛罗！',
      },
    ],
    quiz: [
      { id: 'en-2-2-q1', question: 'What can Zero do?', options: ['Swim', 'Fly', 'Dig', 'Cook'], correctIndex: 1 },
      { id: 'en-2-2-q2', question: 'What can Zero see from the sky?', options: ['A tree and the sea', 'A car and a house', 'A dog and a cat', 'A book and a pen'], correctIndex: 0 },
      { id: 'en-2-2-q3', question: 'Where is Zero?', options: ['Under water', 'In the sky', 'On the ground', 'In a cave'], correctIndex: 1 },
    ],
  },

  // ===== Level 3: Longer words, mixed patterns =====
  {
    id: 'en-3-1',
    title: 'The Secret Power',
    module: 'english',
    level: 3,
    rewardCardId: 'dyna-strong',
    totalSentences: 7,
    sentences: [
      {
        words: [
          { word: 'Every', phonics: 'e-ve-ry', chinese: '每个' },
          { word: 'Ultraman', phonics: 'Ul-tra-man', chinese: '奥特曼' },
          { word: 'has', phonics: 'h-a-s', chinese: '有' },
          { word: 'a', phonics: 'a', chinese: '一个' },
          { word: 'power.', phonics: 'pow-er', chinese: '力量' },
        ],
        chineseTranslation: '每个奥特曼都有一种力量。',
      },
      {
        words: [
          { word: 'Tiga', phonics: 'Ti-ga', chinese: '迪迦' },
          { word: 'has', phonics: 'h-a-s', chinese: '有' },
          { word: 'a', phonics: 'a', chinese: '一个' },
          { word: 'secret', phonics: 'se-cret', chinese: '秘密的' },
          { word: 'power.', phonics: 'pow-er', chinese: '力量' },
        ],
        chineseTranslation: '迪迦有一种秘密力量。',
      },
      {
        words: [
          { word: 'He', phonics: 'he', chinese: '他' },
          { word: 'can', phonics: 'c-a-n', chinese: '能' },
          { word: 'change', phonics: 'ch-a-nge', chinese: '改变' },
          { word: 'his', phonics: 'h-i-s', chinese: '他的' },
          { word: 'color.', phonics: 'c-o-l-or', chinese: '颜色' },
        ],
        chineseTranslation: '他能改变他的颜色。',
      },
      {
        words: [
          { word: 'Red', phonics: 'r-e-d', chinese: '红色' },
          { word: 'means', phonics: 'm-ea-ns', chinese: '意味着' },
          { word: 'strong.', phonics: 'str-o-ng', chinese: '强壮的' },
        ],
        chineseTranslation: '红色意味着强壮。',
      },
      {
        words: [
          { word: 'Blue', phonics: 'bl-ue', chinese: '蓝色' },
          { word: 'means', phonics: 'm-ea-ns', chinese: '意味着' },
          { word: 'speedy.', phonics: 'sp-ee-dy', chinese: '快速的' },
        ],
        chineseTranslation: '蓝色意味着快速。',
      },
      {
        words: [
          { word: 'Purple', phonics: 'pur-ple', chinese: '紫色' },
          { word: 'means', phonics: 'm-ea-ns', chinese: '意味着' },
          { word: 'balance.', phonics: 'ba-l-ance', chinese: '平衡' },
        ],
        chineseTranslation: '紫色意味着平衡。',
      },
      {
        words: [
          { word: 'Tiga', phonics: 'Ti-ga', chinese: '迪迦' },
          { word: 'is', phonics: 'i-s', chinese: '是' },
          { word: 'amazing!', phonics: 'a-ma-zing', chinese: '了不起的' },
        ],
        chineseTranslation: '迪迦太了不起了！',
      },
    ],
    quiz: [
      { id: 'en-3-1-q1', question: 'What is Tiga\'s secret power?', options: ['Flying fast', 'Changing color', 'Growing big', 'Turning invisible'], correctIndex: 1 },
      { id: 'en-3-1-q2', question: 'What does red mean?', options: ['Fast', 'Smart', 'Strong', 'Kind'], correctIndex: 2 },
      { id: 'en-3-1-q3', question: 'What does blue mean?', options: ['Strong', 'Speedy', 'Balance', 'Brave'], correctIndex: 1 },
    ],
  },
  {
    id: 'en-3-2',
    title: 'Ultraman and Earth',
    module: 'english',
    level: 3,
    rewardCardId: 'geed-solid',
    totalSentences: 7,
    sentences: [
      {
        words: [
          { word: 'Ultraman', phonics: 'Ul-tra-man', chinese: '奥特曼' },
          { word: 'loves', phonics: 'l-o-ve-s', chinese: '爱' },
          { word: 'the', phonics: 'th-e', chinese: '这个' },
          { word: 'Earth.', phonics: 'Ear-th', chinese: '地球' },
        ],
        chineseTranslation: '奥特曼爱地球。',
      },
      {
        words: [
          { word: 'The', phonics: 'th-e', chinese: '这个' },
          { word: 'Earth', phonics: 'Ear-th', chinese: '地球' },
          { word: 'has', phonics: 'h-a-s', chinese: '有' },
          { word: 'green', phonics: 'gr-ee-n', chinese: '绿色的' },
          { word: 'trees.', phonics: 'tr-ee-s', chinese: '树' },
        ],
        chineseTranslation: '地球有绿色的树。',
      },
      {
        words: [
          { word: 'It', phonics: 'i-t', chinese: '它' },
          { word: 'has', phonics: 'h-a-s', chinese: '有' },
          { word: 'blue', phonics: 'bl-ue', chinese: '蓝色的' },
          { word: 'water.', phonics: 'wa-ter', chinese: '水' },
        ],
        chineseTranslation: '它有蓝色的水。',
      },
      {
        words: [
          { word: 'Children', phonics: 'chil-dren', chinese: '孩子们' },
          { word: 'play', phonics: 'pl-ay', chinese: '玩' },
          { word: 'and', phonics: 'a-nd', chinese: '和' },
          { word: 'smile.', phonics: 'sm-i-le', chinese: '微笑' },
        ],
        chineseTranslation: '孩子们玩耍和微笑。',
      },
      {
        words: [
          { word: 'Ultraman', phonics: 'Ul-tra-man', chinese: '奥特曼' },
          { word: 'keeps', phonics: 'k-ee-ps', chinese: '保护' },
          { word: 'them', phonics: 'th-e-m', chinese: '他们' },
          { word: 'safe.', phonics: 's-a-fe', chinese: '安全的' },
        ],
        chineseTranslation: '奥特曼保护他们的安全。',
      },
      {
        words: [
          { word: 'We', phonics: 'we', chinese: '我们' },
          { word: 'should', phonics: 'sh-ould', chinese: '应该' },
          { word: 'protect', phonics: 'pro-tect', chinese: '保护' },
          { word: 'Earth', phonics: 'Ear-th', chinese: '地球' },
          { word: 'too.', phonics: 't-oo', chinese: '也' },
        ],
        chineseTranslation: '我们也应该保护地球。',
      },
      {
        words: [
          { word: 'Together,', phonics: 'to-ge-ther', chinese: '一起' },
          { word: 'we', phonics: 'we', chinese: '我们' },
          { word: 'are', phonics: 'are', chinese: '是' },
          { word: 'strong!', phonics: 'str-o-ng', chinese: '强大的' },
        ],
        chineseTranslation: '在一起，我们就是强大的！',
      },
    ],
    quiz: [
      { id: 'en-3-2-q1', question: 'What does Ultraman love?', options: ['The moon', 'The Earth', 'The sun', 'The stars'], correctIndex: 1 },
      { id: 'en-3-2-q2', question: 'What color is the water?', options: ['Green', 'Red', 'Blue', 'White'], correctIndex: 2 },
      { id: 'en-3-2-q3', question: 'What should we do?', options: ['Sleep more', 'Protect Earth', 'Fly away', 'Hide'], correctIndex: 1 },
    ],
  },
]

export function getEnglishStoriesByLevel(level: Level): EnglishStory[] {
  return allEnglishStories.filter(s => s.level === level)
}

export function getEnglishStoryById(id: string): EnglishStory | undefined {
  return allEnglishStories.find(s => s.id === id)
}
