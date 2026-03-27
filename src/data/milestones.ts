import type { Milestone } from '../types/milestone'

export const MILESTONES: Milestone[] = [
  // === Streak milestones ===
  { id: 'streak-3', title: '连续阅读3天', description: '坚持就是胜利！', icon: '🔥', rewardCardId: 'taro-super', category: 'streak' },
  { id: 'streak-5', title: '连续阅读5天', description: '5天不间断，你真棒！', icon: '🔥', rewardCardId: 'orb-hurricane', category: 'streak' },
  { id: 'streak-7', title: '连续阅读7天', description: '一周全勤！了不起！', icon: '🔥', rewardCardId: 'mebius-burning', category: 'streak' },

  // === Reading milestones ===
  { id: 'stories-10', title: '完成10篇故事', description: '已经读了10篇故事了！', icon: '📚', rewardCardId: 'dyna-shining', category: 'reading' },
  { id: 'stories-20', title: '完成20篇故事', description: '20篇！你是阅读小达人！', icon: '📚', rewardCardId: 'mebius-phoenix', category: 'reading' },
  { id: 'stories-30', title: '完成30篇故事', description: '30篇故事！传说级阅读者！', icon: '📚', rewardCardId: 'z-sigma', category: 'reading' },
  { id: 'stories-40', title: '完成40篇故事', description: '40篇！阅读之王！', icon: '📚', rewardCardId: 'belial-atrocious', category: 'reading' },
  { id: 'stories-50', title: '完成50篇故事', description: '50篇！超越极限！', icon: '📚', rewardCardId: 'saga', category: 'reading' },
  { id: 'stories-60', title: '完成60篇故事', description: '60篇！传说级阅读大师！', icon: '📚', rewardCardId: 'legend', category: 'reading' },
  { id: 'stories-70', title: '完成70篇故事', description: '70篇！你就是光！', icon: '📚', rewardCardId: 'king', category: 'reading' },

  // === Collection milestones (collect all forms of a hero) ===
  { id: 'collect-hero-z', title: '集齐泽塔全部形态', description: '集齐泽塔的所有基础形态', icon: '⚡', rewardCardId: 'z-delta', category: 'collection' },
  { id: 'collect-hero-trigger', title: '集齐特利迦全部形态', description: '集齐特利迦的复合、强力、天空形态', icon: '🔺', rewardCardId: 'trigger-truth', category: 'collection' },
  { id: 'collect-hero-decker', title: '集齐德凯全部形态', description: '集齐德凯的闪亮、强壮、奇迹形态', icon: '🛡️', rewardCardId: 'decker-dynamic', category: 'collection' },
  { id: 'collect-hero-ginga', title: '集齐银河全部形态', description: '集齐银河的基础和斯特利姆形态', icon: '🌟', rewardCardId: 'ginga-victory', category: 'collection' },
  { id: 'collect-hero-orb', title: '集齐欧布全部形态', description: '集齐欧布的所有融合形态', icon: '🔮', rewardCardId: 'orb-trinity', category: 'collection' },
  { id: 'collect-hero-geed', title: '集齐捷德全部形态', description: '集齐捷德的所有融合形态', icon: '🧬', rewardCardId: 'geed-ultimate', category: 'collection' },
  { id: 'collect-hero-x', title: '集齐艾克斯全部形态', description: '集齐艾克斯的基础和超越形态', icon: '❌', rewardCardId: 'x-beta', category: 'collection' },
  { id: 'collect-hero-taiga', title: '集齐泰迦全部形态', description: '集齐泰迦的基础和光子地球形态', icon: '🔥', rewardCardId: 'taiga-tri', category: 'collection' },
  { id: 'collect-hero-rb', title: '集齐罗布兄弟', description: '集齐罗索和布鲁的所有形态', icon: '🤝', rewardCardId: 'ruebe', category: 'collection' },
  { id: 'collect-hero-omega', title: '集齐奥美迦全部形态', description: '集齐奥美迦的基础和瓦尔基涅斯形态', icon: 'Ω', rewardCardId: 'omega-gameton', category: 'collection' },

  // === Ultimate milestone ===
  { id: 'collect-all', title: '收集全部卡片', description: '除诺亚外的全部卡片已收集！', icon: '🕊️', rewardCardId: 'noa', category: 'collection' },
]
