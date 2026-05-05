import { ULTRAMAN_CHARACTERS, getCharacterById as getUltramanById, getCharacterName as getUltramanName } from '../data/ultramanCharacters'
import { ELSA_CHARACTERS, getCharacterById as getElsaById, getCharacterName as getElsaName } from '../data/elsaCharacters'
import { PAW_PATROL_CHARACTERS, getCharacterById as getPawPatrolById, getCharacterName as getPawPatrolName } from '../data/pawPatrolCharacters'
import type { UltramanCharacter } from '../data/ultramanCharacters'

const isPawPatrol = import.meta.env.VITE_THEME === 'pawpatrol'
const isElsa = import.meta.env.VITE_THEME === 'elsa'

export type ThemeCharacter = UltramanCharacter

export const CHARACTERS: ThemeCharacter[] = isPawPatrol ? PAW_PATROL_CHARACTERS : isElsa ? ELSA_CHARACTERS : ULTRAMAN_CHARACTERS
export const ALL_CHARACTER_IDS = CHARACTERS.map(c => c.id)

export function getCharacterById(id: string): ThemeCharacter | undefined {
  return isPawPatrol ? getPawPatrolById(id) : isElsa ? getElsaById(id) : getUltramanById(id)
}

export function getCharacterName(id: string): string {
  return isPawPatrol ? getPawPatrolName(id) : isElsa ? getElsaName(id) : getUltramanName(id)
}

export const theme = {
  id: isPawPatrol ? 'pawpatrol' : isElsa ? 'elsa' : 'ultraman',
  appName: isPawPatrol ? '汪汪队日记' : isElsa ? '艾莎日记' : '奥特曼日记',
  storagePrefix: isPawPatrol ? 'pawpatrol_diary_' : isElsa ? 'elsa_diary_' : 'ultraman_diary_',
  exportFilePrefix: isPawPatrol ? 'pawpatrol-diary' : isElsa ? 'elsa-diary' : 'ultraman-diary',

  labels: {
    heroHall: isPawPatrol ? '狗狗馆' : isElsa ? '艾莎馆' : '英雄馆',
    heroHallFull: isPawPatrol ? '🐾 汪汪队总部' : isElsa ? '👸 艾莎公主馆' : '⭐ 奥特英雄馆',
    heroHallIcon: isPawPatrol ? '🐾' : isElsa ? '👸' : '⭐',
    characterNoun: isPawPatrol ? '狗狗' : isElsa ? '公主' : '奥特曼',
    selectHeroPrompt: isPawPatrol ? '选择今天故事里的狗狗角色（可多选）' : isElsa ? '选择今天故事里的公主角色（可多选）' : '选择今天故事里的奥特曼角色（可多选）',
    heroCompanionPrompt: isPawPatrol ? '狗狗们会和你一起体验这件开心事哦' : isElsa ? '公主们会和你一起体验这件开心事哦' : '奥特曼们会和你一起体验这件开心事哦',
    changeHero: isPawPatrol ? '← 换狗狗' : isElsa ? '← 换公主' : '← 换奥特曼',
    selectHeroForBook: isPawPatrol ? '选一个狗狗陪你读故事吧' : isElsa ? '选一个公主陪你读故事吧' : '选一个奥特曼陪你读故事吧',
    emptyDiaryPrompt: isPawPatrol ? '今天来写一篇汪汪队日记吧！' : isElsa ? '今天来写一篇艾莎日记吧！' : '今天来写一篇奥特曼日记吧！',
    diaryBookTitle: isPawPatrol ? '🐾 汪汪队日记本' : isElsa ? '👸 艾莎日记本' : '📖 奥特曼日记本',
    notFoundHero: isPawPatrol ? '找不到这个角色' : isElsa ? '找不到这个角色' : '找不到这个英雄',
    backToHall: isPawPatrol ? '← 狗狗馆' : isElsa ? '← 艾莎馆' : '← 英雄馆',
    description: isPawPatrol ? '帮助孩子通过汪汪队故事提高阅读能力' : isElsa ? '帮助孩子通过冰雪公主故事提高阅读能力' : '帮助孩子通过奥特曼故事提高阅读能力',
  },

  loadingMessages: isPawPatrol
    ? [
        '狗狗们正在准备故事...',
        '故事快要写好了...',
        '今天的冒险即将开始...',
        '汪汪队在想怎么讲这个故事...',
        '马上就好...',
      ]
    : isElsa
      ? [
          '公主们正在准备故事...',
          '故事快要写好了...',
          '今天的冰雪冒险即将开始...',
          '艾莎在想怎么讲这个故事...',
          '马上就好...',
        ]
      : [
          '奥特曼们正在准备故事...',
          '故事快要写好了...',
          '今天的冒险即将开始...',
          '英雄们在想怎么讲这个故事...',
          '马上就好...',
        ],

  ai: {
    systemRole: isPawPatrol
      ? '你是一位资深儿童文学作家，专门为5-7岁中国孩子创作汪汪队世界的中文故事。你的作品语言自然流畅，用词简单但绝不生硬，每个句子都像真正出版的绘本一样通顺。故事完全发生在冒险湾/汪汪队基地，不出现现实世界人物。你只输出严格的JSON格式。'
      : isElsa
        ? '你是一位资深儿童文学作家，专门为5-7岁中国孩子创作冰雪奇缘世界的中文故事。你的作品语言自然流畅，用词简单但绝不生硬，每个句子都像真正出版的绘本一样通顺。故事完全发生在阿伦黛尔/冰雪世界，不出现现实世界人物。你只输出严格的JSON格式。'
        : '你是一位资深儿童文学作家，专门为5-7岁中国孩子创作奥特曼世界的中文故事。你的作品语言自然流畅，用词简单但绝不生硬，每个句子都像真正出版的绘本一样通顺。故事完全发生在奥特曼世界，不出现人类角色。你只输出严格的JSON格式。',
    worldDescription: isPawPatrol
      ? '**汪汪队世界观**：故事完全发生在冒险湾/汪汪队瞭望塔/冒险湾小镇'
      : isElsa
        ? '**冰雪奇缘世界观**：故事完全发生在阿伦黛尔/冰雪森林/魔法北境'
        : '**纯奥特曼世界观**：故事完全发生在光之国/M78星云/奥特曼世界',
    sceneExamples: isPawPatrol
      ? `   - "在幼儿园打水仗" → 在冒险湾海滩和路马一起玩水
   - "吃了草莓蛋糕" → 在汪汪队瞭望塔庆祝任务成功分享蛋糕
   - "和小朋友玩捉迷藏" → 和阿奇、毛毛在冒险湾小镇捉迷藏`
      : isElsa
        ? `   - "在幼儿园打水仗" → 在阿伦黛尔城堡花园和雪宝打雪仗
   - "吃了草莓蛋糕" → 在阿伦黛尔城堡庆祝派对分享魔法蛋糕
   - "和小朋友玩捉迷藏" → 和安娜、雪宝在冰雪宫殿里捉迷藏`
        : `   - "在幼儿园打水仗" → 在奥特训练基地和同伴们泼水玩耍
   - "吃了草莓蛋糕" → 在光之国庆祝胜利分享星光蛋糕
   - "和小朋友玩捉迷藏" → 和奥特兄弟们在星云里捉迷藏`,
    noHumanRule: isPawPatrol
      ? '**没有现实角色**：不出现现实世界的小朋友、孩子、人类，只有阿奇、毛毛、天天等汪汪队角色和莱德'
      : isElsa
        ? '**没有现实角色**：不出现现实世界的小朋友、孩子、人类，只有艾莎、安娜、雪宝等冰雪奇缘角色'
        : '**没有人类角色**：不出现小朋友、孩子、人类，只有奥特曼、怪兽等',
  },

  capacitor: {
    appId: isPawPatrol ? 'com.pawpatrol.diary' : isElsa ? 'com.elsa.diary' : 'com.ultraman.diary',
  },

  themeColor: isPawPatrol ? '#2563EB' : isElsa ? '#5B9BD5' : '#c0392b',

  colors: isPawPatrol
    ? {
        primary: '#2563EB',
        primaryDark: '#1D4ED8',
        secondary: '#F59E0B',
        secondaryDark: '#D97706',
        bgWarm: '#F0F5FF',
        bgPage: '#EDF2FA',
        bgHover: '#DBEAFE',
        border: '#BFDBFE',
        shadow: '#93C5FD',
        gradientEnd: '#DBEAFE',
      }
    : isElsa
      ? {
          primary: '#5B9BD5',
          primaryDark: '#4178A4',
          secondary: '#B19CD9',
          secondaryDark: '#8B6FB0',
          bgWarm: '#F0F4FF',
          bgPage: '#EEF2FA',
          bgHover: '#D8E2F0',
          border: '#C8D6E5',
          shadow: '#b8c8dc',
          gradientEnd: '#D8E2F0',
        }
      : {
          primary: '#E8453C',
          primaryDark: '#c13a33',
          secondary: '#FFD93D',
          secondaryDark: '#c9a820',
          bgWarm: '#FFF8F0',
          bgPage: '#FAF3EE',
          bgHover: '#F0E6DD',
          border: '#E8DED5',
          shadow: '#e0d5cc',
          gradientEnd: '#FFE8D0',
        },
} as const

/** Apply theme CSS variables to :root at runtime */
export function applyThemeColors() {
  const s = document.documentElement.style
  const c = theme.colors
  s.setProperty('--color-primary', c.primary)
  s.setProperty('--color-primary-dark', c.primaryDark)
  s.setProperty('--color-secondary', c.secondary)
  s.setProperty('--color-secondary-dark', c.secondaryDark)
  s.setProperty('--color-bg-warm', c.bgWarm)
  s.setProperty('--color-bg-page', c.bgPage)
  s.setProperty('--color-bg-hover', c.bgHover)
  s.setProperty('--color-border', c.border)
  s.setProperty('--color-shadow', c.shadow)
  s.setProperty('--color-gradient-end', c.gradientEnd)
}
