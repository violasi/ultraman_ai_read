import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getCharacterById } from '../data/ultramanCharacters'
import UltramanAvatar from '../components/shared/UltramanAvatar'

export default function HeroHallPage() {
  const { heroStats, rewardCards } = useApp()
  const navigate = useNavigate()

  const getCardCount = (heroId: string) =>
    rewardCards.filter(c => c.heroId === heroId).length

  return (
    <div className="space-y-4 py-2">
      <h2 className="text-xl font-black text-gray-800 text-center">⭐ 奥特英雄馆</h2>
      <p className="text-sm text-gray-400 text-center">和你一起度过的时光</p>

      <div className="grid grid-cols-3 gap-3 pb-4">
        {heroStats.map(hero => {
          const character = getCharacterById(hero.id)
          if (!character) return null
          const dimmed = hero.daysAccompanied === 0
          const cardCount = getCardCount(hero.id)

          return (
            <div
              key={hero.id}
              className={`bg-[#FFF8F0] rounded-2xl p-4 border border-[#E8DED5] shadow-[0_2px_0_#e0d5cc] flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                dimmed ? 'opacity-50' : ''
              }`}
              onClick={() => navigate(`/heroes/${hero.id}`)}
            >
              <div className="relative">
                <UltramanAvatar character={character} size="lg" dimmed={dimmed} />
                {cardCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E8453C] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {cardCount}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-gray-800 text-center leading-tight">{character.shortName}</h3>
              <div className={`text-xs font-bold px-2 py-1 rounded-full text-center whitespace-nowrap ${
                hero.daysAccompanied > 0
                  ? 'bg-[#E8453C]/10 text-[#E8453C]'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {hero.daysAccompanied > 0
                  ? `陪伴了 ${hero.daysAccompanied} 天`
                  : '还没一起玩过'
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
