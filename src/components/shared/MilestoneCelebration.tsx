import { useApp } from '../../context/AppContext'
import { ULTRAMAN_CARDS } from '../../data/ultramanCards'

export default function MilestoneCelebration() {
  const { pendingMilestones, dismissMilestone } = useApp()

  if (pendingMilestones.length === 0) return null

  const milestone = pendingMilestones[0]
  const rewardCard = ULTRAMAN_CARDS.find(c => c.id === milestone.rewardCardId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl animate-bounce-in">
        <div className="text-6xl mb-4">{milestone.icon}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">成就达成！</h2>
        <p className="text-lg font-bold text-orange-600 mb-1">{milestone.title}</p>
        <p className="text-sm text-gray-500 mb-4">{milestone.description}</p>

        {rewardCard && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">获得奥特曼卡片</p>
            <div
              className="inline-block px-6 py-3 rounded-2xl text-white font-bold shadow-lg"
              style={{ background: `linear-gradient(135deg, ${rewardCard.colors[0]}, ${rewardCard.colors[1]})` }}
            >
              <span className="text-2xl block mb-1">{rewardCard.emoji}</span>
              <span className="text-sm">{rewardCard.name}</span>
            </div>
          </div>
        )}

        <button
          onClick={dismissMilestone}
          className="w-full py-3 rounded-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md active:scale-95 transition-all"
        >
          太棒了！
        </button>

        {pendingMilestones.length > 1 && (
          <p className="text-xs text-gray-400 mt-2">
            还有 {pendingMilestones.length - 1} 个成就等着你
          </p>
        )}
      </div>
    </div>
  )
}
