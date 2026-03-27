import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import QuizCard from '../../components/shared/QuizCard'
import RewardModal from '../../components/shared/RewardModal'
import { ULTRAMAN_CARDS } from '../../data/ultramanCards'

export default function ChineseQuiz() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateStory, unlockCard, isUnlocked, isKnownChar, recordCharCorrect, recordModuleCompletion, getAllChineseStories } = useApp()
  const story = getAllChineseStories().find(s => s.id === (id ?? ''))
  const [currentQ, setCurrentQ] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [showExistingCard, setShowExistingCard] = useState(false)
  const [promotedChars, setPromotedChars] = useState<string[]>([])

  if (!story) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">😕</span>
        <p className="text-gray-500">找不到这个故事</p>
      </div>
    )
  }

  const questions = story.quiz
  const totalQ = questions.length

  // Collect unknown chars from the story for encounter tracking
  const storyUnknownChars = story.sentences
    .flatMap(s => s.words)
    .filter(w => w.pinyin && !isKnownChar(w.char) && !/[。，！？：；、""''（）]/.test(w.char))
    .map(w => w.char)
  const uniqueUnknownChars = [...new Set(storyUnknownChars)]

  const handleAnswer = (isCorrect: boolean) => {
    const newCount = isCorrect ? correctCount + 1 : correctCount

    // Track character encounters on correct answers
    if (isCorrect && uniqueUnknownChars.length > 0) {
      const promoted = recordCharCorrect(uniqueUnknownChars)
      if (promoted.length > 0) {
        setPromotedChars(prev => [...prev, ...promoted.filter(c => !prev.includes(c))])
      }
    }

    if (currentQ < totalQ - 1) {
      setCorrectCount(newCount)
      setCurrentQ(prev => prev + 1)
    } else {
      setCorrectCount(newCount)
      const stars = newCount >= 3 ? 3 : newCount >= 2 ? 2 : newCount >= 1 ? 1 : 0
      const passed = stars >= 2
      updateStory(story.id, {
        completed: true,
        quizScore: stars,
        quizPassed: passed,
      })
      // Record module completion for daily streak
      recordModuleCompletion('chinese')
      if (passed && !isUnlocked(story.rewardCardId)) {
        unlockCard(story.rewardCardId)
        setShowReward(true)
      } else if (passed && isUnlocked(story.rewardCardId)) {
        // Re-read: show the existing card
        setShowExistingCard(true)
      }
      setFinished(true)
    }
  }

  const stars = correctCount >= 3 ? 3 : correctCount >= 2 ? 2 : correctCount >= 1 ? 1 : 0
  const rewardCard = ULTRAMAN_CARDS.find(c => c.id === story.rewardCardId)

  if (finished) {
    return (
      <div className="space-y-6">
        {showReward && rewardCard && (
          <RewardModal card={rewardCard} onClose={() => setShowReward(false)} />
        )}

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-4">
            {stars >= 2 ? '🎉' : '💪'}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">答题完成！</h2>
          <p className="text-gray-500 mb-6">
            你答对了 {correctCount}/{totalQ} 题
          </p>

          {/* Show existing card for re-reads */}
          {showExistingCard && rewardCard && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
              <p className="text-yellow-700 font-bold text-sm mb-2">🎴 这张卡片你已经获得过了</p>
              <div className="inline-block px-4 py-2 rounded-xl text-white font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${rewardCard.colors[0]}, ${rewardCard.colors[1]})` }}>
                {rewardCard.emoji} {rewardCard.name}
              </div>
            </div>
          )}

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className={`text-4xl transition-all duration-300 ${
                  i < stars ? 'animate-bounce-in' : 'grayscale opacity-30'
                }`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Promoted characters notification */}
          {promotedChars.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-4 animate-bounce-in">
              <p className="text-green-700 font-bold text-sm">
                🎓 你已经认识这些字了：
              </p>
              <div className="flex justify-center gap-2 mt-2">
                {promotedChars.map(c => (
                  <span key={c} className="text-2xl bg-green-100 rounded-lg px-2 py-1">{c}</span>
                ))}
              </div>
            </div>
          )}

          {stars < 2 && (
            <p className="text-sm text-gray-400 mb-6">答对2题以上可以获得奥特曼卡片哦！</p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/chinese/story/${story.id}`)}
              className="w-full py-3 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-[0.97] transition-all"
            >
              再读一遍
            </button>
            <button
              onClick={() => navigate('/chinese')}
              className="w-full py-3 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-600 active:scale-[0.97] transition-all"
            >
              返回故事列表
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 text-center">{story.title} - 答题</h2>

      <div className="flex justify-center gap-2">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < currentQ
                ? 'bg-green-400'
                : i === currentQ
                ? 'bg-red-600 scale-125'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <p className="text-center text-sm text-gray-400">
        第 {currentQ + 1}/{totalQ} 题
      </p>

      <QuizCard
        key={currentQ}
        question={questions[currentQ].question}
        options={questions[currentQ].options}
        correctIndex={questions[currentQ].correctIndex}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
