import { useEffect, useState } from 'react'
import { getCharacterById } from '../../data/ultramanCharacters'
import UltramanAvatar from './UltramanAvatar'
import type { RewardCard } from '../../types/reward'

interface Props {
  card: RewardCard
  onDismiss: () => void
}

export default function RewardCelebration({ card, onDismiss }: Props) {
  const character = getCharacterById(card.heroId)
  const [imgError, setImgError] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
  }, [])

  const handleDismiss = () => {
    setShow(false)
    setTimeout(onDismiss, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        show ? 'bg-black/60' : 'bg-black/0'
      }`}
      onClick={handleDismiss}
    >
      <div
        className={`relative max-w-[280px] w-full mx-6 transition-all duration-300 ${
          show ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Stars decoration */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl animate-bounce">
          🎉
        </div>

        <div className="bg-gradient-to-b from-[#FFF8F0] to-[#FFE8D0] rounded-3xl border-2 border-[#E8453C]/30 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#E8453C] text-white text-center py-3 px-4">
            <p className="text-lg font-black">恭喜获得新卡片！</p>
          </div>

          {/* Card content */}
          <div className="p-6 flex flex-col items-center gap-4">
            {/* Hero avatar */}
            {character && (
              <UltramanAvatar character={character} size="lg" />
            )}

            <p className="text-sm font-bold text-gray-600">
              {character?.shortName ?? card.heroId} 陪伴奖励 · 第{card.level}张
            </p>

            {/* Reward card image */}
            <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#E8DED5] bg-white flex items-center justify-center">
              {!imgError ? (
                <img
                  src={card.imageUrl}
                  alt={`${character?.shortName ?? card.heroId} 奖励卡片 ${card.level}`}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <span className="text-5xl">🃏</span>
                  <span className="text-xs">卡片待解锁</span>
                </div>
              )}
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="w-full bg-[#E8453C] text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
            >
              太棒了！收下卡片
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
