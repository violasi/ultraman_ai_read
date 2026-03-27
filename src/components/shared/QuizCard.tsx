import { useState } from 'react'

interface QuizCardProps {
  question: string
  options: string[]
  correctIndex: number
  onAnswer: (isCorrect: boolean) => void
}

export default function QuizCard({ question, options, correctIndex, onAnswer }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (index: number) => {
    if (answered) return
    setSelected(index)
    setAnswered(true)
    const isCorrect = index === correctIndex
    // Delay callback so user sees the result
    setTimeout(() => onAnswer(isCorrect), 1200)
  }

  const getOptionStyle = (index: number) => {
    if (!answered) {
      return 'bg-white border-gray-200 hover:border-red-600 hover:bg-red-50 active:scale-[0.97]'
    }
    if (index === correctIndex) {
      return 'bg-green-50 border-green-400 text-green-800'
    }
    if (index === selected && index !== correctIndex) {
      return 'bg-red-50 border-red-400 text-red-800'
    }
    return 'bg-gray-50 border-gray-200 opacity-50'
  }

  return (
    <div className="animate-bounce-in">
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center leading-relaxed">
        {question}
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={answered}
            className={`w-full p-4 rounded-2xl border-2 text-lg font-medium transition-all duration-200 ${getOptionStyle(index)}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
              {answered && index === correctIndex && (
                <span className="ml-auto text-green-500 text-xl">✓</span>
              )}
              {answered && index === selected && index !== correctIndex && (
                <span className="ml-auto text-red-500 text-xl">✗</span>
              )}
            </div>
          </button>
        ))}
      </div>
      {answered && selected === correctIndex && (
        <div className="mt-4 text-center">
          <span className="animate-star-burst inline-block text-4xl">⭐</span>
        </div>
      )}
    </div>
  )
}
