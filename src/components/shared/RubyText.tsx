interface RubyTextProps {
  char: string
  pinyin: string
  isKnown: boolean
  highlight?: boolean
  onClick: () => void
}

const PUNCTUATION = /[。，！？：；、""''（）—…～·《》\s]/

export default function RubyText({ char, pinyin, isKnown, highlight, onClick }: RubyTextProps) {
  const highlightClass = highlight ? 'text-[#E8453C] font-black underline decoration-[#E8453C] decoration-2 underline-offset-4' : ''

  if (!pinyin || PUNCTUATION.test(char)) {
    return (
      <span
        className={`text-4xl md:text-5xl cursor-pointer select-none ${highlightClass}`}
        onClick={onClick}
      >
        {char}
      </span>
    )
  }

  if (isKnown) {
    return (
      <span
        className={`text-4xl md:text-5xl cursor-pointer select-none text-gray-800 hover:text-[#E8453C] transition-colors active:scale-110 ${highlightClass}`}
        onClick={onClick}
      >
        {char}
      </span>
    )
  }

  return (
    <ruby
      className={`text-4xl md:text-5xl cursor-pointer select-none hover:bg-[#E8453C]/5 rounded px-0.5 transition-colors active:scale-110 ${highlightClass}`}
      onClick={onClick}
    >
      {char}
      <rt className="text-sm text-gray-500 font-normal">{pinyin}</rt>
    </ruby>
  )
}
