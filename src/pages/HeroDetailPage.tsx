import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getCharacterById } from '../data/ultramanCharacters'
import UltramanAvatar from '../components/shared/UltramanAvatar'

export default function HeroDetailPage() {
  const { heroId } = useParams<{ heroId: string }>()
  const navigate = useNavigate()
  const { heroStats, getRewardCardsForHero } = useApp()
  const [viewingCard, setViewingCard] = useState<string | null>(null)

  const character = heroId ? getCharacterById(heroId) : undefined
  const stat = heroStats.find(h => h.id === heroId)
  const cards = heroId ? getRewardCardsForHero(heroId) : []

  if (!character || !heroId) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p>找不到这个英雄</p>
        <button onClick={() => navigate('/heroes')} className="mt-4 text-[#E8453C] font-bold">
          返回英雄馆
        </button>
      </div>
    )
  }

  const nextCardAt = (cards.length + 1) * 3
  const daysToNext = nextCardAt - (stat?.daysAccompanied ?? 0)

  return (
    <div className="space-y-6 py-2 pb-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/heroes')}
        className="text-sm text-gray-500 font-bold flex items-center gap-1"
      >
        ← 英雄馆
      </button>

      {/* Hero info */}
      <div className="flex flex-col items-center gap-3">
        <UltramanAvatar character={character} size="lg" />
        <h2 className="text-xl font-black text-gray-800">{character.name}</h2>
        <div className="bg-[#E8453C]/10 text-[#E8453C] text-sm font-bold px-4 py-1.5 rounded-full">
          陪伴了 {stat?.daysAccompanied ?? 0} 天
        </div>
      </div>

      {/* Next card progress */}
      {daysToNext > 0 && (
        <div className="bg-[#FFF8F0] rounded-2xl p-4 border border-[#E8DED5]">
          <p className="text-sm text-gray-600 text-center">
            再陪伴 <span className="text-[#E8453C] font-black">{daysToNext}</span> 天就能获得下一张卡片！
          </p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E8453C] rounded-full transition-all"
              style={{ width: `${Math.min(100, ((stat?.daysAccompanied ?? 0) % 3) / 3 * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Reward cards */}
      <div>
        <h3 className="text-base font-black text-gray-800 mb-3">
          🃏 奖励卡片 ({cards.length})
        </h3>

        {cards.length === 0 ? (
          <div className="bg-[#FFF8F0] rounded-2xl p-8 border border-[#E8DED5] text-center">
            <span className="text-4xl">🎴</span>
            <p className="text-sm text-gray-400 mt-2">还没有获得卡片，继续加油！</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {cards.map(card => (
              <CardThumbnail
                key={card.level}
                imageUrl={card.imageUrl}
                level={card.level}
                heroName={character.shortName}
                onView={() => setViewingCard(card.imageUrl)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full-screen card viewer */}
      {viewingCard && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setViewingCard(null)}
        >
          <CardImage
            src={viewingCard}
            alt="奖励卡片"
            className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  )
}

function CardThumbnail({ imageUrl, level, heroName, onView }: {
  imageUrl: string
  level: number
  heroName: string
  onView: () => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="bg-white rounded-2xl border border-[#E8DED5] shadow-sm overflow-hidden cursor-pointer active:scale-95 transition-transform"
      onClick={onView}
    >
      <div className="aspect-square flex items-center justify-center bg-[#FFF8F0]">
        {!imgError ? (
          <img
            src={imageUrl}
            alt={`${heroName} 卡片 ${level}`}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-300">
            <span className="text-4xl">🃏</span>
            <span className="text-[10px]">卡片待解锁</span>
          </div>
        )}
      </div>
      <div className="px-3 py-2 text-center">
        <p className="text-xs font-bold text-gray-600">第{level}张卡片</p>
      </div>
    </div>
  )
}

function CardImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <div className={`bg-[#FFF8F0] rounded-2xl p-12 flex flex-col items-center gap-3 text-gray-400 ${className}`}>
        <span className="text-6xl">🃏</span>
        <span className="text-sm">卡片图片待补充</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  )
}
