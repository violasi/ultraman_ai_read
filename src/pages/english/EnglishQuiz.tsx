import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import QuizCard from '../../components/shared/QuizCard'
import RewardModal from '../../components/shared/RewardModal'
import { ULTRAMAN_CARDS } from '../../data/ultramanCards'

export default function EnglishQuiz() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateStory, unlockCard, isUnlocked, recordModuleCompletion, getAllEnglishStories } = useApp()
  const story = getAllEnglishStories().find(s => s.id === (id ?? ''))
  const [currentQ, setCurrentQ] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [showExistingCard, setShowExistingCard] = useState(false)

  if (!story) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">😕</span>
        <p className="text-gray-500">Story not found</p>
      </div>
    )
  }

  const questions = story.quiz
  const totalQ = questions.length

  const handleAnswer = (isCorrect: boolean) => {
    const newCount = isCorrect ? correctCount + 1 : correctCount
    if (currentQ < totalQ - 1) {
      setCorrectCount(newCount)
      setCurrentQ(prev => prev + 1)
    } else {
      setCorrectCount(newCount)
      const stars = newCount >= 3 ? 3 : newCount >= 2 ? 2 : newCount >= 1 ? 1 : 0
      const passed = stars >= 2
      updateStory(story.id, { completed: true, quizScore: stars, quizPassed: passed })
      recordModuleCompletion('english')
      if (passed && !isUnlocked(story.rewardCardId)) {
        unlockCard(story.rewardCardId)
        setShowReward(true)
      } else if (passed && isUnlocked(story.rewardCardId)) {
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
          <div className="text-5xl mb-4">{stars >= 2 ? '🎉' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
          <p className="text-gray-500 mb-6">You got {correctCount}/{totalQ} correct</p>
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map(i => (
              <span key={i} className={`text-4xl transition-all duration-300 ${i < stars ? 'animate-bounce-in' : 'grayscale opacity-30'}`}
                style={{ animationDelay: `${i * 0.15}s` }}>⭐</span>
            ))}
          </div>

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

          {stars < 2 && <p className="text-sm text-gray-400 mb-6">Get 2+ correct to unlock an Ultraman card!</p>}
          <div className="space-y-3">
            <button onClick={() => navigate(`/english/story/${story.id}`)}
              className="w-full py-3 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-[0.97] transition-all">
              Read Again
            </button>
            <button onClick={() => navigate('/english')}
              className="w-full py-3 rounded-2xl font-bold bg-green-500 text-white hover:bg-green-600 active:scale-[0.97] transition-all">
              Back to Stories
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 text-center">{story.title} - Quiz</h2>
      <div className="flex justify-center gap-2">
        {questions.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${
            i < currentQ ? 'bg-green-400' : i === currentQ ? 'bg-green-500 scale-125' : 'bg-gray-200'
          }`} />
        ))}
      </div>
      <p className="text-center text-sm text-gray-400">Question {currentQ + 1}/{totalQ}</p>
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
