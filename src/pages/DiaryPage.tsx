import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getCharacterById } from '../data/ultramanCharacters'
import UltramanAvatar from '../components/shared/UltramanAvatar'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekday = WEEKDAYS[d.getDay()]
  return `${month}月${day}日 星期${weekday}`
}

export default function DiaryPage() {
  const { diaryEntries } = useApp()

  if (diaryEntries.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <span className="text-5xl block">📖</span>
        <h2 className="text-xl font-black text-gray-800">还没有日记</h2>
        <p className="text-gray-400 text-sm">今天来写一篇奥特曼日记吧！</p>
        <Link
          to="/"
          className="inline-block mt-4 px-6 py-3 rounded-2xl bg-[#E8453C] text-white font-bold shadow-[0_3px_0_#c13a33] active:scale-[0.97] transition-all"
        >
          写日记 ✏️
        </Link>
      </div>
    )
  }

  // Group entries by date
  const grouped = new Map<string, typeof diaryEntries>()
  for (const entry of diaryEntries) {
    const list = grouped.get(entry.date) || []
    list.push(entry)
    grouped.set(entry.date, list)
  }

  // Sort dates descending (newest first)
  const sortedDates = [...grouped.keys()].sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-4 py-2">
      <h2 className="text-xl font-black text-gray-800 text-center">📖 奥特曼日记本</h2>

      <div className="space-y-5">
        {sortedDates.map(date => {
          const entries = grouped.get(date)!
          // Collect all unique heroes for this day
          const dayHeroIds = [...new Set(entries.flatMap(e => e.selectedUltramans))]

          return (
            <div key={date}>
              {/* Date divider line */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-[#E8DED5]" />
                <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
                  {formatDate(date)}
                </span>
                <div className="flex -space-x-2">
                  {dayHeroIds.slice(0, 6).map(heroId => {
                    const c = getCharacterById(heroId)
                    return c ? (
                      <div key={heroId} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-white shadow-sm">
                        <UltramanAvatar character={c} size="sm" />
                      </div>
                    ) : null
                  })}
                </div>
                <div className="h-px flex-1 bg-[#E8DED5]" />
              </div>

              {/* Entries for this day */}
              <div className="space-y-2.5">
                {entries.map(entry => {
                  const firstSentence = entry.sentences[0]?.words.map(w => w.char).join('') || ''
                  const preview = firstSentence.length > 20 ? firstSentence.slice(0, 20) + '...' : firstSentence

                  return (
                    <Link
                      key={entry.id}
                      to={`/diary/${entry.id}`}
                      className="block bg-[#FFF8F0] rounded-2xl p-4 border border-[#E8DED5] shadow-[0_2px_0_#e0d5cc] hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {entry.type === 'picture-book' && (
                              <span className="flex-shrink-0 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">📚 绘本</span>
                            )}
                            <h3 className="text-base font-black text-gray-800 truncate">{entry.storyTitle}</h3>
                          </div>
                          <p className="text-sm text-gray-400 mt-1 truncate">{preview}</p>
                        </div>
                        <div className="flex -space-x-2 flex-shrink-0">
                          {entry.selectedUltramans.slice(0, 3).map(heroId => {
                            const c = getCharacterById(heroId)
                            return c ? <UltramanAvatar key={heroId} character={c} size="sm" /> : null
                          })}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
