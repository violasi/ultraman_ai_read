import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ULTRAMAN_CARDS, getHeroIds, getCardsByHero, getHeroName } from '../data/ultramanCards'
import { MILESTONES } from '../data/milestones'

const rarityLabel = {
  common: { text: '普通', color: 'text-amber-700' },
  rare: { text: '稀有', color: 'text-blue-600' },
  legendary: { text: '传说', color: 'text-yellow-600' },
}

type Tab = 'cards' | 'milestones'

export default function RewardsPage() {
  const { isUnlocked, unlockedCount, milestones } = useApp()
  const [tab, setTab] = useState<Tab>('cards')

  const heroIds = getHeroIds()
  const completedMilestones = Object.values(milestones).filter(m => m.completed).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">奥特曼卡片收集</h2>
        <p className="text-gray-500 text-sm mt-1">
          <span className="font-bold text-red-600">{unlockedCount}</span>
          /{ULTRAMAN_CARDS.length} 已收集
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-orange-400 rounded-full transition-all duration-500"
          style={{ width: `${(unlockedCount / ULTRAMAN_CARDS.length) * 100}%` }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('cards')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === 'cards'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          🎴 卡片 ({unlockedCount}/{ULTRAMAN_CARDS.length})
        </button>
        <button
          onClick={() => setTab('milestones')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === 'milestones'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          🏆 成就 ({completedMilestones}/{MILESTONES.length})
        </button>
      </div>

      {tab === 'cards' ? (
        <CardCollection heroIds={heroIds} isUnlocked={isUnlocked} />
      ) : (
        <MilestoneList milestones={milestones} isUnlocked={isUnlocked} />
      )}
    </div>
  )
}

function CardCollection({ heroIds, isUnlocked }: {
  heroIds: string[]
  isUnlocked: (id: string) => boolean
}) {
  return (
    <div className="space-y-4">
      {heroIds.map(heroId => {
        const heroCards = getCardsByHero(heroId)
        const heroName = getHeroName(heroId)
        const unlockedAll = heroCards.every(c => isUnlocked(c.id))
        const unlockedSome = heroCards.some(c => isUnlocked(c.id))
        const count = heroCards.filter(c => isUnlocked(c.id)).length

        return (
          <div key={heroId} className={`bg-white rounded-2xl p-3 shadow-sm border ${
            unlockedAll ? 'border-yellow-300' : unlockedSome ? 'border-gray-200' : 'border-gray-100'
          }`}>
            {/* Hero header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">{heroName}</span>
                <span className="text-xs text-gray-400">{count}/{heroCards.length}</span>
              </div>
              {unlockedAll && heroCards.length > 1 && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                  ✅ 已集齐
                </span>
              )}
            </div>

            {/* Cards row */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {heroCards.map(card => {
                const unlocked = isUnlocked(card.id)
                const rarityRing = card.rarity === 'legendary' ? 'ring-2 ring-yellow-400 ring-offset-1' :
                  card.rarity === 'rare' ? 'ring-1 ring-blue-300 ring-offset-1' : ''
                return (
                  <div
                    key={card.id}
                    className={`flex-shrink-0 w-20 aspect-[3/4] rounded-xl p-1.5 flex flex-col items-center justify-center text-center transition-all ${
                      unlocked ? `${rarityRing} shadow-md` : 'opacity-40'
                    }`}
                    style={unlocked ? {
                      background: `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})`,
                    } : {
                      background: '#e5e7eb',
                    }}
                  >
                    {unlocked ? (
                      <>
                        <span className="text-2xl mb-0.5 drop-shadow-md">{card.emoji}</span>
                        <p className="text-[10px] font-bold text-white leading-tight line-clamp-2 drop-shadow-sm">{card.form}</p>
                        <p className="text-[8px] mt-0.5 font-medium text-white/80">
                          {rarityLabel[card.rarity].text}
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-lg mb-0.5 opacity-50">🔒</span>
                        <p className="text-[9px] text-gray-500 font-medium">
                          {card.unlockType === 'milestone' ? '成就' : '故事'}
                        </p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MilestoneList({ milestones, isUnlocked }: {
  milestones: Record<string, { completed: boolean; completedAt?: string }>
  isUnlocked: (id: string) => boolean
}) {
  const categories = [
    { key: 'streak', label: '🔥 连续阅读', milestones: MILESTONES.filter(m => m.category === 'streak') },
    { key: 'reading', label: '📚 阅读成就', milestones: MILESTONES.filter(m => m.category === 'reading') },
    { key: 'collection', label: '🎴 收集成就', milestones: MILESTONES.filter(m => m.category === 'collection') },
  ]

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat.key}>
          <h3 className="text-sm font-bold text-gray-700 mb-2">{cat.label}</h3>
          <div className="space-y-2">
            {cat.milestones.map(m => {
              const completed = milestones[m.id]?.completed
              const rewardCard = ULTRAMAN_CARDS.find(c => c.id === m.rewardCardId)
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <span className="text-2xl">{completed ? '✅' : m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${completed ? 'text-green-700' : 'text-gray-700'}`}>
                      {m.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{m.description}</p>
                  </div>
                  {rewardCard && (
                    <div className="flex-shrink-0 text-center">
                      <span className="text-lg">{isUnlocked(rewardCard.id) ? rewardCard.emoji : '🔒'}</span>
                      <p className="text-[9px] text-gray-400">{rewardCard.form}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
