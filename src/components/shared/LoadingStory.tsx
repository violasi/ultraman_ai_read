import { useState, useEffect } from 'react'

const messages = [
  '奥特曼们正在准备故事...',
  '故事快要写好了...',
  '今天的冒险即将开始...',
  '英雄们在想怎么讲这个故事...',
  '马上就好...',
]

export default function LoadingStory() {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % messages.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8453C] to-[#FFD93D] animate-pulse flex items-center justify-center">
          <span className="text-4xl animate-bounce">⭐</span>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FFD93D] animate-ping" />
      </div>
      <p className="text-lg font-bold text-gray-600 animate-pulse text-center">
        {messages[msgIdx]}
      </p>
    </div>
  )
}
