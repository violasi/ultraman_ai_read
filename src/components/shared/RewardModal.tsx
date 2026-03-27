import type { UltramanCard } from '../../types/rewards'

interface RewardModalProps {
  card: UltramanCard
  onClose: () => void
}

const rarityLabel = {
  common: '普通',
  rare: '稀有',
  legendary: '传说',
}

export default function RewardModal({ card, onClose }: RewardModalProps) {
  const isLegendary = card.rarity === 'legendary'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`animate-bounce-in rounded-3xl p-8 max-w-sm w-full shadow-2xl ${
          isLegendary ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-7xl mb-4 drop-shadow-lg">{card.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{card.name}</h2>
          <p className="text-sm text-white/70 mb-2">{card.nameEn}</p>
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-white/20 text-white font-medium mb-4">
            {rarityLabel[card.rarity]}
          </span>
          <p className="text-white/90 text-sm mb-6 leading-relaxed">{card.description}</p>
          <div className="text-3xl font-bold text-white mb-6 drop-shadow-md">
            {isLegendary ? '传说卡片！！🎉' : '太棒了！🎉'}
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-gray-800 rounded-2xl font-bold text-lg hover:bg-gray-100 active:scale-[0.97] transition-all shadow-lg"
          >
            收下卡片
          </button>
        </div>
      </div>
    </div>
  )
}
