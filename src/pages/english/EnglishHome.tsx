import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import StoryCard from '../../components/shared/StoryCard'
import type { Level } from '../../types/story'

const levels: Level[] = [1, 2, 3]

export default function EnglishHome() {
  const [activeLevel, setActiveLevel] = useState<Level>(1)
  const { getStoryProgress, getAllEnglishStories, removeCustomStory, lockCard } = useApp()
  const allStories = getAllEnglishStories()
  const stories = useMemo(() => allStories.filter(s => s.level === activeLevel), [allStories, activeLevel])

  const handleDelete = (storyId: string, rewardCardId: string) => {
    removeCustomStory('english', storyId)
    if (rewardCardId) lockCard(rewardCardId)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">English Reading</h2>

      <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
        {levels.map(level => (
          <button
            key={level}
            onClick={() => setActiveLevel(level)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeLevel === level
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Level {level}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {stories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">🔠</span>
            <p>No stories at this level yet</p>
          </div>
        ) : (
          stories.map(story => {
            const isCustom = story.id.startsWith('custom-')
            return (
              <StoryCard
                key={story.id}
                story={story}
                progress={getStoryProgress(story.id)}
                basePath="/english"
                isCustom={isCustom}
                onDelete={isCustom ? () => handleDelete(story.id, story.rewardCardId) : undefined}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
