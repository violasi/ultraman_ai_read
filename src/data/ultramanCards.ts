import type { UltramanCard } from '../types/rewards'

export const ULTRAMAN_CARDS: UltramanCard[] = [
  // ===== 初代奥特曼 =====
  { id: 'ultraman', name: '初代奥特曼', nameEn: 'Ultraman', series: '初代奥特曼', rarity: 'common', emoji: '🔴', description: '光之国最早来到地球的战士', form: '基础形态', heroId: 'ultraman', unlockType: 'story', colors: ['#c0392b', '#922b21'] },

  // ===== 赛文奥特曼 =====
  { id: 'seven', name: '赛文奥特曼', nameEn: 'Ultraseven', series: '赛文奥特曼', rarity: 'common', emoji: '🔷', description: '使用头镖的宇宙警备队精英', form: '基础形态', heroId: 'seven', unlockType: 'story', colors: ['#c0392b', '#7b241c'] },

  // ===== 杰克奥特曼 =====
  { id: 'jack', name: '杰克奥特曼', nameEn: 'Ultraman Jack', series: '杰克奥特曼', rarity: 'common', emoji: '🟢', description: '使用奥特手镯战斗', form: '基础形态', heroId: 'jack', unlockType: 'story', colors: ['#c0392b', '#a93226'] },

  // ===== 艾斯奥特曼 =====
  { id: 'ace', name: '艾斯奥特曼', nameEn: 'Ultraman Ace', series: '艾斯奥特曼', rarity: 'common', emoji: '🟡', description: '擅长使用光线技能的超兽杀手', form: '基础形态', heroId: 'ace', unlockType: 'story', colors: ['#c0392b', '#b03a2e'] },

  // ===== 泰罗奥特曼 =====
  { id: 'taro', name: '泰罗奥特曼', nameEn: 'Ultraman Taro', series: '泰罗奥特曼', rarity: 'common', emoji: '🔴', description: '奥特之父和奥特之母的儿子', form: '基础形态', heroId: 'taro', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'taro-super', name: '超级泰罗', nameEn: 'Super Taro', series: '泰罗奥特曼', rarity: 'rare', emoji: '🌟', description: '六兄弟合体后的最强形态', form: '超级泰罗', heroId: 'taro', unlockType: 'milestone', milestoneId: 'streak-3', colors: ['#f39c12', '#e67e22'] },

  // ===== 雷欧奥特曼 =====
  { id: 'leo', name: '雷欧奥特曼', nameEn: 'Ultraman Leo', series: '雷欧奥特曼', rarity: 'common', emoji: '🦁', description: '格斗技最强的奥特曼', form: '基础形态', heroId: 'leo', unlockType: 'story', colors: ['#e74c3c', '#922b21'] },

  // ===== 迪迦奥特曼 =====
  { id: 'tiga', name: '迪迦·复合型', nameEn: 'Tiga Multi Type', series: '迪迦奥特曼', rarity: 'rare', emoji: '💜', description: '三千万年前的光之巨人，均衡型', form: '复合型', heroId: 'tiga', unlockType: 'story', colors: ['#8e44ad', '#6c3483'] },
  { id: 'tiga-power', name: '迪迦·强力型', nameEn: 'Tiga Power Type', series: '迪迦奥特曼', rarity: 'rare', emoji: '❤️', description: '力量增强的红色形态', form: '强力型', heroId: 'tiga', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'tiga-sky', name: '迪迦·空中型', nameEn: 'Tiga Sky Type', series: '迪迦奥特曼', rarity: 'rare', emoji: '💙', description: '速度最快的蓝色形态', form: '空中型', heroId: 'tiga', unlockType: 'story', colors: ['#3498db', '#2471a3'] },
  { id: 'tiga-glitter', name: '闪耀迪迦', nameEn: 'Glitter Tiga', series: '迪迦奥特曼', rarity: 'legendary', emoji: '👑', description: '全人类之光汇聚的究极形态', form: '闪耀形态', heroId: 'tiga', unlockType: 'milestone', milestoneId: 'chars-new-50', colors: ['#f1c40f', '#d4ac0d'] },

  // ===== 戴拿奥特曼 =====
  { id: 'dyna', name: '戴拿·闪亮型', nameEn: 'Dyna Flash Type', series: '戴拿奥特曼', rarity: 'rare', emoji: '💫', description: '迪迦的继承者，速度型', form: '闪亮型', heroId: 'dyna', unlockType: 'story', colors: ['#e74c3c', '#2980b9'] },
  { id: 'dyna-strong', name: '戴拿·强壮型', nameEn: 'Dyna Strong Type', series: '戴拿奥特曼', rarity: 'rare', emoji: '💪', description: '力量爆发的红色形态', form: '强壮型', heroId: 'dyna', unlockType: 'story', colors: ['#e74c3c', '#922b21'] },
  { id: 'dyna-miracle', name: '戴拿·奇迹型', nameEn: 'Dyna Miracle Type', series: '戴拿奥特曼', rarity: 'rare', emoji: '✨', description: '超能力型的蓝色形态', form: '奇迹型', heroId: 'dyna', unlockType: 'story', colors: ['#2980b9', '#1a5276'] },
  { id: 'dyna-shining', name: '闪耀戴拿', nameEn: 'Shining Dyna', series: '戴拿奥特曼', rarity: 'legendary', emoji: '🌟', description: '超越极限的金色闪耀形态', form: '闪耀形态', heroId: 'dyna', unlockType: 'milestone', milestoneId: 'stories-10', colors: ['#f1c40f', '#e67e22'] },

  // ===== 盖亚奥特曼 =====
  { id: 'gaia', name: '盖亚·V1', nameEn: 'Gaia V1', series: '盖亚奥特曼', rarity: 'common', emoji: '🌍', description: '大地之光的战士', form: 'V1', heroId: 'gaia', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'gaia-v2', name: '盖亚·V2', nameEn: 'Gaia V2', series: '盖亚奥特曼', rarity: 'rare', emoji: '🌏', description: '吸收阿古茹之光的强化形态', form: 'V2', heroId: 'gaia', unlockType: 'story', colors: ['#e74c3c', '#e67e22'] },
  { id: 'gaia-supreme', name: '盖亚·至高型', nameEn: 'Gaia Supreme', series: '盖亚奥特曼', rarity: 'legendary', emoji: '🏔️', description: '大地与海洋之光合一的究极形态', form: '至高型', heroId: 'gaia', unlockType: 'milestone', milestoneId: 'all-chinese-l1', colors: ['#e74c3c', '#f39c12'] },

  // ===== 高斯奥特曼 =====
  { id: 'cosmos', name: '高斯·月神型', nameEn: 'Cosmos Luna Mode', series: '高斯奥特曼', rarity: 'common', emoji: '🌙', description: '温柔的净化形态', form: '月神型', heroId: 'cosmos', unlockType: 'story', colors: ['#5b9bd5', '#2e86c1'] },
  { id: 'cosmos-corona', name: '高斯·日冕型', nameEn: 'Cosmos Corona Mode', series: '高斯奥特曼', rarity: 'rare', emoji: '☀️', description: '战斗力提升的太阳形态', form: '日冕型', heroId: 'cosmos', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'cosmos-eclipse', name: '高斯·日蚀型', nameEn: 'Cosmos Eclipse Mode', series: '高斯奥特曼', rarity: 'legendary', emoji: '🌑', description: '月神与日冕融合的最强形态', form: '日蚀型', heroId: 'cosmos', unlockType: 'milestone', milestoneId: 'vocab-20', colors: ['#2c3e50', '#1a252f'] },

  // ===== 奈克瑟斯奥特曼 =====
  { id: 'nexus', name: '奈克瑟斯·幼年形态', nameEn: 'Nexus Anphans', series: '奈克瑟斯奥特曼', rarity: 'common', emoji: '🤍', description: '光传递的起点', form: '幼年形态', heroId: 'nexus', unlockType: 'story', colors: ['#bdc3c7', '#95a5a6'] },
  { id: 'nexus-red', name: '奈克瑟斯·红色青年', nameEn: 'Nexus Junis Red', series: '奈克瑟斯奥特曼', rarity: 'rare', emoji: '🔴', description: '红色青年形态，力量型', form: '红色青年', heroId: 'nexus', unlockType: 'story', colors: ['#e74c3c', '#922b21'] },
  { id: 'nexus-blue', name: '奈克瑟斯·蓝色青年', nameEn: 'Nexus Junis Blue', series: '奈克瑟斯奥特曼', rarity: 'rare', emoji: '🔵', description: '蓝色青年形态，速度型', form: '蓝色青年', heroId: 'nexus', unlockType: 'milestone', milestoneId: 'all-pinyin-l1', colors: ['#2980b9', '#1a5276'] },

  // ===== 麦克斯奥特曼 =====
  { id: 'max', name: '麦克斯奥特曼', nameEn: 'Ultraman Max', series: '麦克斯奥特曼', rarity: 'common', emoji: '⚡', description: '光之国最快最强的战士', form: '基础形态', heroId: 'max', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'max-galaxy', name: '麦克斯·银河装甲', nameEn: 'Max Galaxy', series: '麦克斯奥特曼', rarity: 'rare', emoji: '🌌', description: '装备银河剑的强化形态', form: '银河装甲', heroId: 'max', unlockType: 'story', colors: ['#8e44ad', '#6c3483'] },

  // ===== 梦比优斯奥特曼 =====
  { id: 'mebius', name: '梦比优斯', nameEn: 'Ultraman Mebius', series: '梦比优斯奥特曼', rarity: 'common', emoji: '♾️', description: '奥特兄弟的学生', form: '基础形态', heroId: 'mebius', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'mebius-burning', name: '梦比优斯·燃烧勇者', nameEn: 'Mebius Burning Brave', series: '梦比优斯奥特曼', rarity: 'rare', emoji: '🔥', description: '友情之火燃烧的勇者形态', form: '燃烧勇者', heroId: 'mebius', unlockType: 'milestone', milestoneId: 'streak-7', colors: ['#e67e22', '#d35400'] },
  { id: 'mebius-phoenix', name: '梦比优斯·凤凰勇者', nameEn: 'Mebius Phoenix Brave', series: '梦比优斯奥特曼', rarity: 'legendary', emoji: '🦅', description: '与光之船融合的究极形态', form: '凤凰勇者', heroId: 'mebius', unlockType: 'milestone', milestoneId: 'stories-20', colors: ['#f39c12', '#e74c3c'] },

  // ===== 赛罗奥特曼 =====
  { id: 'zero', name: '赛罗奥特曼', nameEn: 'Ultraman Zero', series: '赛罗奥特曼', rarity: 'rare', emoji: '👊', description: '赛文之子，最强年轻战士', form: '基础形态', heroId: 'zero', unlockType: 'story', colors: ['#2980b9', '#e74c3c'] },
  { id: 'zero-strong', name: '赛罗·强壮日冕', nameEn: 'Zero Strong-Corona', series: '赛罗奥特曼', rarity: 'rare', emoji: '🔴', description: '继承戴拿强壮和高斯日冕之力', form: '强壮日冕', heroId: 'zero', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'zero-luna', name: '赛罗·月神奇迹', nameEn: 'Zero Luna-Miracle', series: '赛罗奥特曼', rarity: 'rare', emoji: '🔵', description: '继承戴拿奇迹和高斯月神之力', form: '月神奇迹', heroId: 'zero', unlockType: 'story', colors: ['#2980b9', '#1a5276'] },
  { id: 'zero-beyond', name: '赛罗·超限形态', nameEn: 'Zero Beyond', series: '赛罗奥特曼', rarity: 'rare', emoji: '💠', description: '融合四位新世代战士之力', form: '超限形态', heroId: 'zero', unlockType: 'story', colors: ['#1abc9c', '#16a085'] },
  { id: 'zero-shining', name: '光辉赛罗', nameEn: 'Shining Zero', series: '赛罗奥特曼', rarity: 'legendary', emoji: '✨', description: '拥有逆转时间能力的光辉形态', form: '光辉形态', heroId: 'zero', unlockType: 'milestone', milestoneId: 'chars-new-50-b', colors: ['#f1c40f', '#f39c12'] },
  { id: 'zero-ultimate', name: '究极赛罗', nameEn: 'Ultimate Zero', series: '赛罗奥特曼', rarity: 'legendary', emoji: '🏆', description: '披上究极铠甲的最强形态', form: '究极形态', heroId: 'zero', unlockType: 'milestone', milestoneId: 'chars-new-100', colors: ['#2c3e50', '#f1c40f'] },

  // ===== 银河奥特曼 =====
  { id: 'ginga', name: '银河奥特曼', nameEn: 'Ultraman Ginga', series: '银河奥特曼', rarity: 'common', emoji: '🌟', description: '来自未来的神秘战士', form: '基础形态', heroId: 'ginga', unlockType: 'story', colors: ['#3498db', '#8e44ad'] },
  { id: 'ginga-strium', name: '银河·斯特利姆', nameEn: 'Ginga Strium', series: '银河奥特曼', rarity: 'rare', emoji: '⭐', description: '与泰罗合体的强化形态', form: '斯特利姆', heroId: 'ginga', unlockType: 'milestone', milestoneId: 'all-english-l1', colors: ['#e74c3c', '#f39c12'] },
  { id: 'ginga-victory', name: '银河维克特利', nameEn: 'Ginga Victory', series: '银河奥特曼', rarity: 'legendary', emoji: '🤝', description: '银河与维克特利合体的究极姿态', form: '银河维克特利', heroId: 'ginga', unlockType: 'milestone', milestoneId: 'collect-hero-ginga', colors: ['#2c3e50', '#e74c3c'] },

  // ===== 维克特利奥特曼 =====
  { id: 'victory', name: '维克特利奥特曼', nameEn: 'Ultraman Victory', series: '维克特利奥特曼', rarity: 'common', emoji: '⚔️', description: '地底文明的守护战士', form: '基础形态', heroId: 'victory', unlockType: 'story', colors: ['#2c3e50', '#c0392b'] },
  { id: 'victory-knight', name: '维克特利·骑士', nameEn: 'Victory Knight', series: '维克特利奥特曼', rarity: 'rare', emoji: '🗡️', description: '骑士剑笛觉醒的强化形态', form: '骑士形态', heroId: 'victory', unlockType: 'story', colors: ['#2c3e50', '#f39c12'] },

  // ===== 艾克斯奥特曼 =====
  { id: 'x', name: '艾克斯奥特曼', nameEn: 'Ultraman X', series: '艾克斯奥特曼', rarity: 'common', emoji: '❌', description: '来自网络空间的电子光战士', form: '基础形态', heroId: 'x', unlockType: 'story', colors: ['#2980b9', '#1abc9c'] },
  { id: 'x-exceed', name: '艾克斯·超越形态', nameEn: 'Exceed X', series: '艾克斯奥特曼', rarity: 'rare', emoji: '💎', description: '突破极限的进化形态', form: '超越形态', heroId: 'x', unlockType: 'story', colors: ['#f1c40f', '#2980b9'] },
  { id: 'x-beta', name: '艾克斯·贝塔火花装甲', nameEn: 'X Beta Spark Armor', series: '艾克斯奥特曼', rarity: 'legendary', emoji: '🛡️', description: '初代与迪迦赐予力量的究极装甲', form: '贝塔火花装甲', heroId: 'x', unlockType: 'milestone', milestoneId: 'collect-hero-x', colors: ['#f1c40f', '#e74c3c'] },

  // ===== 欧布奥特曼 =====
  { id: 'orb', name: '欧布·原生形态', nameEn: 'Orb Origin', series: '欧布奥特曼', rarity: 'common', emoji: '🔮', description: '欧布最初的真正姿态', form: '原生形态', heroId: 'orb', unlockType: 'story', colors: ['#c0392b', '#2c3e50'] },
  { id: 'orb-spacium', name: '欧布·重光形态', nameEn: 'Orb Spacium Zeperion', series: '欧布奥特曼', rarity: 'rare', emoji: '💎', description: '初代+迪迦融合', form: '重光形态', heroId: 'orb', unlockType: 'story', colors: ['#8e44ad', '#2980b9'] },
  { id: 'orb-burnmite', name: '欧布·爆炎形态', nameEn: 'Orb Burnmite', series: '欧布奥特曼', rarity: 'rare', emoji: '🔥', description: '梦比优斯+泰罗融合', form: '爆炎形态', heroId: 'orb', unlockType: 'story', colors: ['#e74c3c', '#e67e22'] },
  { id: 'orb-hurricane', name: '欧布·疾风形态', nameEn: 'Orb Hurricane Slash', series: '欧布奥特曼', rarity: 'rare', emoji: '🌪️', description: '赛罗+杰克融合', form: '疾风形态', heroId: 'orb', unlockType: 'milestone', milestoneId: 'streak-5', colors: ['#27ae60', '#1e8449'] },
  { id: 'orb-trinity', name: '欧布·三重形态', nameEn: 'Orb Trinity', series: '欧布奥特曼', rarity: 'legendary', emoji: '🔱', description: '银河+维克特利+艾克斯三位一体', form: '三重形态', heroId: 'orb', unlockType: 'milestone', milestoneId: 'collect-hero-orb', colors: ['#f1c40f', '#e74c3c'] },

  // ===== 捷德奥特曼 =====
  { id: 'geed', name: '捷德·原始形态', nameEn: 'Geed Primitive', series: '捷德奥特曼', rarity: 'common', emoji: '🧬', description: '贝利亚之子，选择正义的战士', form: '原始形态', heroId: 'geed', unlockType: 'story', colors: ['#c0392b', '#2c3e50'] },
  { id: 'geed-solid', name: '捷德·刚燃形态', nameEn: 'Geed Solid Burning', series: '捷德奥特曼', rarity: 'rare', emoji: '🛡️', description: '赛文+雷欧融合的力量形态', form: '刚燃形态', heroId: 'geed', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'geed-acro', name: '捷德·机敏形态', nameEn: 'Geed Acro Smasher', series: '捷德奥特曼', rarity: 'rare', emoji: '💨', description: '希卡利+高斯融合的速度形态', form: '机敏形态', heroId: 'geed', unlockType: 'story', colors: ['#2980b9', '#1abc9c'] },
  { id: 'geed-royal', name: '捷德·尊皇形态', nameEn: 'Geed Royal Mega-Master', series: '捷德奥特曼', rarity: 'legendary', emoji: '🤴', description: '借助奥特之王之力的究极形态', form: '尊皇形态', heroId: 'geed', unlockType: 'milestone', milestoneId: 'all-chinese', colors: ['#f1c40f', '#c0392b'] },
  { id: 'geed-ultimate', name: '捷德·究极最终', nameEn: 'Geed Ultimate Final', series: '捷德奥特曼', rarity: 'legendary', emoji: '🌠', description: '究极进化的最终形态', form: '究极最终', heroId: 'geed', unlockType: 'milestone', milestoneId: 'collect-hero-geed', colors: ['#2c3e50', '#f1c40f'] },

  // ===== 罗布奥特曼 =====
  { id: 'rosso-flame', name: '罗索·烈火形态', nameEn: 'Rosso Flame', series: '罗布奥特曼', rarity: 'common', emoji: '🔥', description: '使用泰罗水晶变身的火焰形态', form: '烈火形态', heroId: 'rosso', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'rosso-aqua', name: '罗索·跃水形态', nameEn: 'Rosso Aqua', series: '罗布奥特曼', rarity: 'common', emoji: '💧', description: '使用银河水晶变身的水之形态', form: '跃水形态', heroId: 'rosso', unlockType: 'story', colors: ['#2980b9', '#1a5276'] },
  { id: 'blu-aqua', name: '布鲁·跃水形态', nameEn: 'Blu Aqua', series: '罗布奥特曼', rarity: 'common', emoji: '🌊', description: '使用银河水晶变身的水之形态', form: '跃水形态', heroId: 'blu', unlockType: 'story', colors: ['#2980b9', '#3498db'] },
  { id: 'blu-flame', name: '布鲁·烈火形态', nameEn: 'Blu Flame', series: '罗布奥特曼', rarity: 'common', emoji: '🔥', description: '使用泰罗水晶变身的火焰形态', form: '烈火形态', heroId: 'blu', unlockType: 'story', colors: ['#2980b9', '#e74c3c'] },
  { id: 'ruebe', name: '罗布奥特曼', nameEn: 'Ultraman Ruebe', series: '罗布奥特曼', rarity: 'legendary', emoji: '🤝', description: '罗索与布鲁兄弟合体的究极形态', form: '合体形态', heroId: 'ruebe', unlockType: 'milestone', milestoneId: 'collect-hero-rb', colors: ['#e74c3c', '#2980b9'] },

  // ===== 泰迦奥特曼 =====
  { id: 'taiga', name: '泰迦奥特曼', nameEn: 'Ultraman Taiga', series: '泰迦奥特曼', rarity: 'common', emoji: '🔥', description: '泰罗之子，新一代奥特战士', form: '基础形态', heroId: 'taiga', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'taiga-photon', name: '泰迦·光子地球', nameEn: 'Taiga Photon-Earth', series: '泰迦奥特曼', rarity: 'rare', emoji: '🌏', description: '与大地神圣力量结合的金色铠甲', form: '光子地球', heroId: 'taiga', unlockType: 'story', colors: ['#f39c12', '#e67e22'] },
  { id: 'taiga-tri', name: '泰迦·三重斯特利姆', nameEn: 'Taiga Tri-Strium', series: '泰迦奥特曼', rarity: 'legendary', emoji: '🔱', description: '泰迦+泰塔斯+风马三人融合', form: '三重斯特利姆', heroId: 'taiga', unlockType: 'milestone', milestoneId: 'collect-hero-taiga', colors: ['#e74c3c', '#f1c40f'] },
  { id: 'titas', name: '泰塔斯奥特曼', nameEn: 'Ultraman Titas', series: '泰迦奥特曼', rarity: 'common', emoji: '💪', description: 'U40出身的力量型战士', form: '基础形态', heroId: 'titas', unlockType: 'story', colors: ['#2980b9', '#1a5276'] },
  { id: 'fuma', name: '风马奥特曼', nameEn: 'Ultraman Fuma', series: '泰迦奥特曼', rarity: 'common', emoji: '🌬️', description: 'O-50出身的速度型忍者战士', form: '基础形态', heroId: 'fuma', unlockType: 'story', colors: ['#27ae60', '#1e8449'] },

  // ===== 泽塔奥特曼 =====
  { id: 'z', name: '泽塔·阿尔法装甲', nameEn: 'Z Alpha Edge', series: '泽塔奥特曼', rarity: 'common', emoji: '⚡', description: '赛罗的徒弟，速度型', form: '阿尔法装甲', heroId: 'z', unlockType: 'story', colors: ['#8e44ad', '#2980b9'] },
  { id: 'z-original', name: '泽塔·起源形态', nameEn: 'Z Original', series: '泽塔奥特曼', rarity: 'common', emoji: '🌟', description: '泽塔原本的姿态', form: '起源形态', heroId: 'z', unlockType: 'story', colors: ['#e74c3c', '#bdc3c7'] },
  { id: 'z-beta', name: '泽塔·贝塔冲击', nameEn: 'Z Beta Smash', series: '泽塔奥特曼', rarity: 'rare', emoji: '💥', description: '初代+艾斯+泰罗融合，力量型', form: '贝塔冲击', heroId: 'z', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },
  { id: 'z-gamma', name: '泽塔·伽马未来', nameEn: 'Z Gamma Future', series: '泽塔奥特曼', rarity: 'rare', emoji: '🌀', description: '迪迦+戴拿+盖亚融合，超能力型', form: '伽马未来', heroId: 'z', unlockType: 'milestone', milestoneId: 'all-pinyin', colors: ['#8e44ad', '#2980b9'] },
  { id: 'z-delta', name: '泽塔·德尔塔天爪', nameEn: 'Z Delta Rise Claw', series: '泽塔奥特曼', rarity: 'legendary', emoji: '🐉', description: '捷德+赛罗超限+贝利亚融合', form: '德尔塔天爪', heroId: 'z', unlockType: 'milestone', milestoneId: 'collect-hero-z', colors: ['#2c3e50', '#f1c40f'] },
  { id: 'z-sigma', name: '泽塔·西格玛冲锋', nameEn: 'Z Sigma Breaster', series: '泽塔奥特曼', rarity: 'legendary', emoji: '🦸', description: '佐菲+迪迦+梦比优斯融合', form: '西格玛冲锋', heroId: 'z', unlockType: 'milestone', milestoneId: 'stories-30', colors: ['#e74c3c', '#f1c40f'] },

  // ===== 特利迦奥特曼 =====
  { id: 'trigger', name: '特利迦·复合型', nameEn: 'Trigger Multi Type', series: '特利迦奥特曼', rarity: 'common', emoji: '🔺', description: '超古代光之巨人的继承者', form: '复合型', heroId: 'trigger', unlockType: 'story', colors: ['#8e44ad', '#c0392b'] },
  { id: 'trigger-power', name: '特利迦·强力型', nameEn: 'Trigger Power Type', series: '特利迦奥特曼', rarity: 'rare', emoji: '🟥', description: '力量增强的红色形态', form: '强力型', heroId: 'trigger', unlockType: 'story', colors: ['#e74c3c', '#922b21'] },
  { id: 'trigger-sky', name: '特利迦·天空型', nameEn: 'Trigger Sky Type', series: '特利迦奥特曼', rarity: 'rare', emoji: '🟦', description: '速度提升的蓝色形态', form: '天空型', heroId: 'trigger', unlockType: 'milestone', milestoneId: 'all-english', colors: ['#2980b9', '#1a5276'] },
  { id: 'trigger-truth', name: '真理特利迦', nameEn: 'Trigger Truth', series: '特利迦奥特曼', rarity: 'legendary', emoji: '🌈', description: '超古代之光的真正力量', form: '真理形态', heroId: 'trigger', unlockType: 'milestone', milestoneId: 'collect-hero-trigger', colors: ['#f1c40f', '#8e44ad'] },

  // ===== 德凯奥特曼 =====
  { id: 'decker', name: '德凯·闪亮型', nameEn: 'Decker Flash Type', series: '德凯奥特曼', rarity: 'common', emoji: '🛡️', description: '守护地球的新战士', form: '闪亮型', heroId: 'decker', unlockType: 'story', colors: ['#8e44ad', '#2980b9'] },
  { id: 'decker-strong', name: '德凯·强壮型', nameEn: 'Decker Strong Type', series: '德凯奥特曼', rarity: 'rare', emoji: '🔴', description: '力量型的红色形态', form: '强壮型', heroId: 'decker', unlockType: 'story', colors: ['#e74c3c', '#922b21'] },
  { id: 'decker-miracle', name: '德凯·奇迹型', nameEn: 'Decker Miracle Type', series: '德凯奥特曼', rarity: 'rare', emoji: '🔵', description: '超能力型的蓝色形态', form: '奇迹型', heroId: 'decker', unlockType: 'milestone', milestoneId: 'vocab-50', colors: ['#2980b9', '#1a5276'] },
  { id: 'decker-dynamic', name: '德凯·动态型', nameEn: 'Decker Dynamic Type', series: '德凯奥特曼', rarity: 'legendary', emoji: '⚡', description: '三种形态融合的究极形态', form: '动态型', heroId: 'decker', unlockType: 'milestone', milestoneId: 'collect-hero-decker', colors: ['#f1c40f', '#e74c3c'] },

  // ===== 布莱泽奥特曼 =====
  { id: 'blazar', name: '布莱泽奥特曼', nameEn: 'Ultraman Blazar', series: '布莱泽奥特曼', rarity: 'common', emoji: '🔥', description: '野性十足的原始风格奥特曼', form: '基础形态', heroId: 'blazar', unlockType: 'story', colors: ['#e74c3c', '#2c3e50'] },

  // ===== 阿尔法奥特曼 (Arc) =====
  { id: 'arc', name: '阿尔法奥特曼', nameEn: 'Ultraman Arc', series: '阿尔法奥特曼', rarity: 'common', emoji: '🌈', description: '2024年最新登场的光之战士', form: '基础形态', heroId: 'arc', unlockType: 'story', colors: ['#3498db', '#e74c3c'] },

  // ===== 奥美迦奥特曼 (2025最新) =====
  { id: 'omega', name: '奥美迦奥特曼', nameEn: 'Ultraman Omega', series: '奥美迦奥特曼', rarity: 'rare', emoji: 'Ω', description: '2025年最新！从宇宙坠落的神秘战士', form: '基础形态', heroId: 'omega', unlockType: 'story', colors: ['#c0392b', '#bdc3c7'] },
  { id: 'omega-valk', name: '奥美迦·瓦尔基涅斯装甲', nameEn: 'Omega Valkyness Armor', series: '奥美迦奥特曼', rarity: 'rare', emoji: '🔱', description: '流星怪兽共鸣变形的强力装甲', form: '瓦尔基涅斯装甲', heroId: 'omega', unlockType: 'story', colors: ['#c0392b', '#e74c3c'] },
  { id: 'omega-gameton', name: '奥美迦·加美顿装甲', nameEn: 'Omega Gameton Armor', series: '奥美迦奥特曼', rarity: 'legendary', emoji: '🏹', description: '羁绊共鸣唤醒的奇迹装甲', form: '加美顿装甲', heroId: 'omega', unlockType: 'milestone', milestoneId: 'collect-hero-omega', colors: ['#27ae60', '#1e8449'] },

  // ===== 佐菲 =====
  { id: 'zoffy', name: '佐菲奥特曼', nameEn: 'Zoffy', series: '佐菲奥特曼', rarity: 'rare', emoji: '⭐', description: '宇宙警备队队长，奥特兄弟大哥', form: '基础形态', heroId: 'zoffy', unlockType: 'story', colors: ['#c0392b', '#922b21'] },

  // ===== 奥特之父 =====
  { id: 'father', name: '奥特之父', nameEn: 'Father of Ultra', series: '奥特之父', rarity: 'rare', emoji: '👨', description: '宇宙警备队大队长，泰罗的爸爸', form: '基础形态', heroId: 'father', unlockType: 'story', colors: ['#c0392b', '#7b241c'] },

  // ===== 奥特之母 =====
  { id: 'mother', name: '奥特之母', nameEn: 'Mother of Ultra', series: '奥特之母', rarity: 'rare', emoji: '👩', description: '银十字军队长，泰罗的妈妈', form: '基础形态', heroId: 'mother', unlockType: 'story', colors: ['#e91e8c', '#c0167a'] },

  // ===== 爱迪奥特曼 =====
  { id: 'eighty', name: '爱迪奥特曼', nameEn: 'Ultraman 80', series: '爱迪奥特曼', rarity: 'common', emoji: '🎓', description: '白天当老师，晚上打怪兽', form: '基础形态', heroId: 'eighty', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },

  // ===== 阿斯特拉 =====
  { id: 'astra', name: '阿斯特拉', nameEn: 'Astra', series: '阿斯特拉', rarity: 'common', emoji: '🌠', description: '雷欧的弟弟，L77星人', form: '基础形态', heroId: 'astra', unlockType: 'story', colors: ['#e74c3c', '#a93226'] },

  // ===== 尤莉安 =====
  { id: 'yullian', name: '尤莉安', nameEn: 'Yullian', series: '尤莉安', rarity: 'common', emoji: '👸', description: '光之国公主，爱迪的青梅竹马', form: '基础形态', heroId: 'yullian', unlockType: 'story', colors: ['#e91e8c', '#a0136b'] },

  // ===== 阿古茹奥特曼 =====
  { id: 'agul', name: '阿古茹·V1', nameEn: 'Agul V1', series: '阿古茹奥特曼', rarity: 'rare', emoji: '🌊', description: '海之光的战士，盖亚的搭档', form: 'V1', heroId: 'agul', unlockType: 'story', colors: ['#2980b9', '#1a5276'] },
  { id: 'agul-v2', name: '阿古茹·V2', nameEn: 'Agul V2', series: '阿古茹奥特曼', rarity: 'rare', emoji: '🐋', description: '觉醒后的强化形态', form: 'V2', heroId: 'agul', unlockType: 'story', colors: ['#2980b9', '#1e8449'] },

  // ===== 希卡利奥特曼 =====
  { id: 'hikari', name: '希卡利奥特曼', nameEn: 'Ultraman Hikari', series: '希卡利奥特曼', rarity: 'rare', emoji: '🔬', description: '光之国的天才科学家', form: '基础形态', heroId: 'hikari', unlockType: 'story', colors: ['#2980b9', '#1a5276'] },
  { id: 'hikari-knight', name: '希卡利·猎骑士剑', nameEn: 'Hunter Knight Tsurugi', series: '希卡利奥特曼', rarity: 'rare', emoji: '⚔️', description: '身披复仇铠甲的骑士形态', form: '猎骑士剑', heroId: 'hikari', unlockType: 'story', colors: ['#2c3e50', '#2980b9'] },

  // ===== 杰斯提斯奥特曼 =====
  { id: 'justice', name: '杰斯提斯奥特曼', nameEn: 'Ultraman Justice', series: '杰斯提斯奥特曼', rarity: 'rare', emoji: '⚖️', description: '宇宙正义的执行者', form: '标准形态', heroId: 'justice', unlockType: 'story', colors: ['#8e44ad', '#6c3483'] },
  { id: 'justice-crusher', name: '杰斯提斯·粉碎形态', nameEn: 'Justice Crusher Mode', series: '杰斯提斯奥特曼', rarity: 'rare', emoji: '💥', description: '战斗力全开的粉碎形态', form: '粉碎形态', heroId: 'justice', unlockType: 'story', colors: ['#8e44ad', '#e74c3c'] },

  // ===== 贝利亚奥特曼（暗黑） =====
  { id: 'belial', name: '贝利亚奥特曼', nameEn: 'Ultraman Belial', series: '贝利亚奥特曼', rarity: 'rare', emoji: '😈', description: '堕入黑暗的奥特战士，捷德之父', form: '基础形态', heroId: 'belial', unlockType: 'story', colors: ['#2c3e50', '#1a1a2e'] },
  { id: 'belial-kaiser', name: '贝利亚·皇帝形态', nameEn: 'Kaiser Belial', series: '贝利亚奥特曼', rarity: 'legendary', emoji: '👿', description: '百体怪兽军团的统帅', form: '皇帝形态', heroId: 'belial', unlockType: 'story', colors: ['#1a1a2e', '#c0392b'] },
  { id: 'belial-atrocious', name: '贝利亚·极恶形态', nameEn: 'Belial Atrocious', series: '贝利亚奥特曼', rarity: 'legendary', emoji: '🔥', description: '吸收奥特之王力量的究极黑暗形态', form: '极恶形态', heroId: 'belial', unlockType: 'milestone', milestoneId: 'stories-40', colors: ['#2c3e50', '#f1c40f'] },

  // ===== 赛迦奥特曼（融合） =====
  { id: 'saga', name: '赛迦奥特曼', nameEn: 'Ultraman Saga', series: '赛迦奥特曼', rarity: 'legendary', emoji: '🦸', description: '赛罗+戴拿+高斯三体融合的究极战士', form: '融合形态', heroId: 'saga', unlockType: 'milestone', milestoneId: 'stories-50', colors: ['#2c3e50', '#3498db'] },

  // ===== 雷杰多奥特曼（融合） =====
  { id: 'legend', name: '雷杰多奥特曼', nameEn: 'Ultraman Legend', series: '雷杰多奥特曼', rarity: 'legendary', emoji: '🌌', description: '高斯+杰斯提斯融合，神秘四奥之一', form: '融合形态', heroId: 'legend', unlockType: 'milestone', milestoneId: 'stories-60', colors: ['#f1c40f', '#bdc3c7'] },

  // ===== 格丽乔奥特曼 =====
  { id: 'grigio', name: '格丽乔奥特曼', nameEn: 'Ultraman Grigio', series: '格丽乔奥特曼', rarity: 'common', emoji: '💛', description: '罗索和布鲁的妹妹', form: '基础形态', heroId: 'grigio', unlockType: 'story', colors: ['#f1c40f', '#e67e22'] },

  // ===== 雷古洛斯奥特曼 =====
  { id: 'regulos', name: '雷古洛斯奥特曼', nameEn: 'Ultraman Regulos', series: '雷古洛斯奥特曼', rarity: 'rare', emoji: '🐯', description: '宇宙拳法的传承者', form: '基础形态', heroId: 'regulos', unlockType: 'story', colors: ['#e67e22', '#c0392b'] },

  // ===== 托雷基亚（暗黑） =====
  { id: 'tregear', name: '托雷基亚', nameEn: 'Ultraman Tregear', series: '托雷基亚', rarity: 'rare', emoji: '🌑', description: '堕入黑暗的泰罗昔日好友', form: '暗黑形态', heroId: 'tregear', unlockType: 'story', colors: ['#2c3e50', '#8e44ad'] },

  // ===== 利布特奥特曼 =====
  { id: 'ribut', name: '利布特奥特曼', nameEn: 'Ultraman Ribut', series: '利布特奥特曼', rarity: 'common', emoji: '🥊', description: '来自马来西亚的格斗型战士', form: '基础形态', heroId: 'ribut', unlockType: 'story', colors: ['#e74c3c', '#2c3e50'] },

  // ===== 哉阿斯奥特曼 =====
  { id: 'zearth', name: '哉阿斯奥特曼', nameEn: 'Ultraman Zearth', series: '哉阿斯奥特曼', rarity: 'common', emoji: '🧹', description: 'Z95星人，有点胆小但很努力的搞笑奥特曼', form: '基础形态', heroId: 'zearth', unlockType: 'story', colors: ['#e74c3c', '#f39c12'] },

  // ===== 乔尼亚斯奥特曼 =====
  { id: 'joneus', name: '乔尼亚斯奥特曼', nameEn: 'Ultraman Joneus', series: '乔尼亚斯奥特曼', rarity: 'common', emoji: '📺', description: 'U40星最强战士，动画系列主角', form: '基础形态', heroId: 'joneus', unlockType: 'story', colors: ['#e74c3c', '#e67e22'] },

  // ===== 奈欧斯奥特曼 =====
  { id: 'neos', name: '奈欧斯奥特曼', nameEn: 'Ultraman Neos', series: '奈欧斯奥特曼', rarity: 'common', emoji: '🆕', description: '光之国新生代战士', form: '基础形态', heroId: 'neos', unlockType: 'story', colors: ['#e74c3c', '#c0392b'] },

  // ===== 葛雷奥特曼 =====
  { id: 'great', name: '葛雷奥特曼', nameEn: 'Ultraman Great', series: '葛雷奥特曼', rarity: 'common', emoji: '🦘', description: '在澳大利亚战斗的奥特曼', form: '基础形态', heroId: 'great', unlockType: 'story', colors: ['#27ae60', '#c0392b'] },

  // ===== 帕瓦特奥特曼 =====
  { id: 'powered', name: '帕瓦特奥特曼', nameEn: 'Ultraman Powered', series: '帕瓦特奥特曼', rarity: 'common', emoji: '🗽', description: '在美国战斗的力量型奥特曼', form: '基础形态', heroId: 'powered', unlockType: 'story', colors: ['#2980b9', '#c0392b'] },

  // ===== 传说奥特曼 =====
  { id: 'king', name: '奥特之王', nameEn: 'Ultraman King', series: '奥特之王', rarity: 'legendary', emoji: '🏆', description: '最神秘最强大的奥特曼', form: '传说形态', heroId: 'king', unlockType: 'milestone', milestoneId: 'stories-70', colors: ['#f1c40f', '#d4ac0d'] },
  { id: 'noa', name: '诺亚奥特曼', nameEn: 'Ultraman Noa', series: '诺亚奥特曼', rarity: 'legendary', emoji: '🕊️', description: '传说中的究极奥特曼', form: '传说形态', heroId: 'noa', unlockType: 'milestone', milestoneId: 'collect-all', colors: ['#bdc3c7', '#f1c40f'] },
]

// Helper: get all unique hero IDs in display order
export function getHeroIds(): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const card of ULTRAMAN_CARDS) {
    if (!seen.has(card.heroId)) {
      seen.add(card.heroId)
      result.push(card.heroId)
    }
  }
  return result
}

// Helper: get all cards for a specific hero
export function getCardsByHero(heroId: string): UltramanCard[] {
  return ULTRAMAN_CARDS.filter(c => c.heroId === heroId)
}

// Helper: get hero display name from first card
export function getHeroName(heroId: string): string {
  const first = ULTRAMAN_CARDS.find(c => c.heroId === heroId)
  return first?.series ?? heroId
}
