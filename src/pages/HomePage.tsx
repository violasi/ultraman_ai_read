import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { StoryMeta } from '../types/story'

/** Pick the next story respecting level progression:
 *  - Find the lowest level that still has uncompleted stories
 *  - Return the first uncompleted story in that level
 *  - If all done, return undefined
 */
function getNextStory<T extends StoryMeta>(stories: T[], isCompleted: (id: string) => boolean): T | undefined {
  // Collect distinct levels in order
  const levels = [...new Set(stories.map(s => s.level))].sort((a, b) => a - b)
  for (const level of levels) {
    const storiesInLevel = stories.filter(s => s.level === level)
    const next = storiesInLevel.find(s => !isCompleted(s.id))
    if (next) return next
    // All stories in this level are completed → proceed to next level
  }
  // All done
  return undefined
}

export default function HomePage() {
  const navigate = useNavigate()
  const {
    isStoryCompleted, streak,
    getAllChineseStories, getAllPinyinStories, getAllEnglishStories,
  } = useApp()

  const allChineseStories = getAllChineseStories()
  const allPinyinStories = getAllPinyinStories()
  const allEnglishStories = getAllEnglishStories()

  const todayModules = streak.todayModules || []
  const todayAllDone = ['chinese', 'pinyin', 'english'].every(m => todayModules.includes(m))

  const chineseStory = getNextStory(allChineseStories, isStoryCompleted)
  const pinyinStory = getNextStory(allPinyinStories, isStoryCompleted)
  const englishStory = getNextStory(allEnglishStories, isStoryCompleted)

  const allDone = !chineseStory && !pinyinStory && !englishStory

  // Check if workshop reminder needed
  const lastWorkshop = useMemo(() => {
    try { return localStorage.getItem('orange_read_last_workshop') ?? '' } catch { return '' }
  }, [])
  const daysSinceWorkshop = useMemo(() => {
    if (!lastWorkshop) return 999
    const diff = Date.now() - new Date(lastWorkshop).getTime()
    return Math.floor(diff / 86400000)
  }, [lastWorkshop])
  const totalStories = allChineseStories.length + allPinyinStories.length + allEnglishStories.length
  const showWorkshopReminder = daysSinceWorkshop > 7 || totalStories < 12

  const missions = [
    {
      key: 'chinese',
      label: '汉字',
      icon: '📖',
      story: chineseStory,
      sub: chineseStory ? `L${chineseStory.level}: ${chineseStory.title}` : null,
      gradient: 'from-red-500 to-orange-400',
      onClick: () => chineseStory ? navigate(`/chinese/story/${chineseStory.id}`) : navigate('/chinese'),
      browsePath: '/chinese',
    },
    {
      key: 'pinyin',
      label: '拼音',
      icon: '🔤',
      story: pinyinStory,
      sub: pinyinStory ? `L${pinyinStory.level}: ${pinyinStory.title}` : null,
      gradient: 'from-blue-500 to-cyan-400',
      onClick: () => pinyinStory ? navigate(`/pinyin/story/${pinyinStory.id}`) : navigate('/pinyin'),
      browsePath: '/pinyin',
    },
    {
      key: 'english',
      label: '英文',
      icon: '🔠',
      story: englishStory,
      sub: englishStory ? `L${englishStory.level}: ${englishStory.title}` : null,
      gradient: 'from-green-500 to-emerald-400',
      onClick: () => englishStory ? navigate(`/english/story/${englishStory.id}`) : navigate('/english'),
      browsePath: '/english',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Streak display */}
      {streak.currentStreak > 0 && (
        <div className="bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl p-3 text-white text-center shadow-md">
          <span className="text-2xl">🔥</span>
          <span className="font-bold ml-2">连续阅读 {streak.currentStreak} 天！</span>
          {streak.currentStreak >= 3 && <span className="ml-1">太棒了！</span>}
        </div>
      )}

      {/* Today's reading progress */}
      <div className={`rounded-2xl p-3 border shadow-sm ${todayAllDone ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
        <p className="text-xs text-gray-400 text-center mb-2">
          {todayAllDone ? '✅ 今天的阅读任务完成啦！' : '📋 今天每个模块读一篇才算一天哦'}
        </p>
        <div className="flex justify-center gap-4">
          {[
            { key: 'chinese', label: '汉字', icon: '📖' },
            { key: 'pinyin', label: '拼音', icon: '🔤' },
            { key: 'english', label: '英文', icon: '🔠' },
          ].map(m => {
            const done = todayModules.includes(m.key)
            return (
              <div key={m.key} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                <span>{done ? '✅' : m.icon}</span>
                <span>{m.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's reading missions */}
      <div className={`bg-white rounded-3xl p-5 shadow-sm border transition-all ${
        todayAllDone ? 'border-green-300 bg-green-50/50' : 'border-gray-100'
      }`}>
        {allDone ? (
          <div className="text-center py-2">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-xl font-bold text-gray-800">所有故事都读完啦！</h2>
            <p className="text-gray-500 text-sm mt-1">太厉害了！去故事工坊生成新故事吧</p>
          </div>
        ) : (
          <>
            <h3 className="text-base font-bold text-gray-800 text-center mb-4">📚 今天的阅读任务</h3>
            <div className="space-y-2">
              {missions.map(m => {
                const doneToday = todayModules.includes(m.key)
                return (
                  <button
                    key={m.key}
                    onClick={doneToday ? () => navigate(m.browsePath) : m.onClick}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-[0.98] ${
                      doneToday
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-100 hover:shadow-md'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{m.icon}</span>
                    <span className={`text-sm font-bold flex-shrink-0 ${doneToday ? 'text-green-700' : 'text-gray-800'}`}>
                      {m.label}
                    </span>
                    <span className="flex-1 text-right">
                      {doneToday ? (
                        <span className="text-sm font-bold text-green-600">✅ 已完成</span>
                      ) : m.sub ? (
                        <span className="text-xs text-gray-500">{m.sub}</span>
                      ) : (
                        <span className="text-xs text-yellow-600 font-bold">🏆 全部完成</span>
                      )}
                    </span>
                    {!doneToday && m.story && (
                      <span className={`flex-shrink-0 text-xs font-bold text-white px-3 py-1.5 rounded-xl bg-gradient-to-r ${m.gradient}`}>
                        去读→
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-center mt-3 text-gray-400">
              {todayAllDone ? '🎉 今天全部完成！太棒了！' : '读完三个就算一天哦！⭐'}
            </p>
          </>
        )}
      </div>

      {/* Workshop reminder */}
      {showWorkshopReminder && (
        <Link
          to="/workshop"
          className="block bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 text-center hover:shadow-md transition-all"
        >
          <span className="text-2xl block mb-1">🛠️</span>
          <p className="text-sm font-bold text-purple-700">故事快读完了？去故事工坊生成新故事！</p>
          <p className="text-xs text-purple-400 mt-0.5">用AI帮你创作更多奥特曼故事</p>
        </Link>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">或者自己选</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Browse all stories */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/chinese"
          className="bg-red-50 rounded-2xl p-3 text-center hover:bg-red-100 active:scale-95 transition-all">
          <span className="text-2xl block mb-1">📖</span>
          <span className="text-xs font-bold text-gray-700">汉字故事</span>
        </Link>
        <Link to="/pinyin"
          className="bg-blue-50 rounded-2xl p-3 text-center hover:bg-blue-100 active:scale-95 transition-all">
          <span className="text-2xl block mb-1">🔤</span>
          <span className="text-xs font-bold text-gray-700">拼音故事</span>
        </Link>
        <Link to="/english"
          className="bg-green-50 rounded-2xl p-3 text-center hover:bg-green-100 active:scale-95 transition-all">
          <span className="text-2xl block mb-1">🔠</span>
          <span className="text-xs font-bold text-gray-700">英文故事</span>
        </Link>
      </div>

      {/* Extra links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link to="/vocab"
          className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md active:scale-95 transition-all">
          <span className="text-2xl block mb-1">📝</span>
          <span className="text-xs font-semibold text-gray-600">生词本</span>
        </Link>
        <Link to="/known-chars"
          className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md active:scale-95 transition-all">
          <span className="text-2xl block mb-1">🈶</span>
          <span className="text-xs font-semibold text-gray-600">已知汉字</span>
        </Link>
        <Link to="/rewards"
          className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md active:scale-95 transition-all">
          <span className="text-2xl block mb-1">🎴</span>
          <span className="text-xs font-semibold text-gray-600">奥特曼卡片</span>
        </Link>
        <Link to="/workshop"
          className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md active:scale-95 transition-all">
          <span className="text-2xl block mb-1">🛠️</span>
          <span className="text-xs font-semibold text-gray-600">故事工坊</span>
        </Link>
        <Link to="/save"
          className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md active:scale-95 transition-all">
          <span className="text-2xl block mb-1">💾</span>
          <span className="text-xs font-semibold text-gray-600">存档</span>
        </Link>
      </div>
    </div>
  )
}
