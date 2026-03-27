import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { StoryMeta } from '../../types/story'
import type { StoryProgress } from '../../types/progress'

interface StoryCardProps {
  story: StoryMeta
  progress?: StoryProgress
  basePath: string
  isCustom?: boolean
  onDelete?: () => void
}

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map(i => (
        <span key={i} className={`text-sm ${i < count ? 'opacity-100' : 'opacity-30'}`}>
          {i < count ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  )
}

export default function StoryCard({ story, progress, basePath, isCustom, onDelete }: StoryCardProps) {
  const isCompleted = progress?.completed ?? false
  const stars = progress?.quizScore ?? 0
  const [confirmDelete, setConfirmDelete] = useState(false)

  const canDelete = isCustom && !isCompleted && onDelete

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirmDelete) {
      onDelete?.()
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
    }
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmDelete(false)
  }

  return (
    <Link
      to={`${basePath}/story/${story.id}`}
      className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isCompleted && (
              <span className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                <span className="text-green-600 text-xs">✓</span>
              </span>
            )}
            <h3 className="text-base font-semibold text-gray-800 truncate">
              {story.title}
            </h3>
            {isCustom && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 font-bold">自创</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Level {story.level}
            </span>
            <span className="text-xs text-gray-400">
              {story.totalSentences}句
            </span>
          </div>
        </div>
        <div className="ml-3 flex flex-col items-end gap-1">
          <StarDisplay count={stars} />
          {canDelete && !confirmDelete && (
            <button
              onClick={handleDelete}
              className="text-[10px] text-gray-300 hover:text-red-400 transition-colors px-1"
              title="删除故事"
            >
              删除
            </button>
          )}
          {confirmDelete && (
            <div className="flex gap-1">
              <button
                onClick={handleDelete}
                className="text-[10px] px-2 py-0.5 rounded bg-red-500 text-white font-bold"
              >
                确认
              </button>
              <button
                onClick={handleCancelDelete}
                className="text-[10px] px-2 py-0.5 rounded bg-gray-200 text-gray-600"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
