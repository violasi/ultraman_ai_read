interface RubyTextProps {
  char: string
  pinyin: string
  isKnown: boolean
  onClick: () => void
}

export default function RubyText({ char, pinyin, isKnown, onClick }: RubyTextProps) {
  if (!pinyin || /[。，！？：；、""''（）]/.test(char)) {
    return (
      <span
        className="text-3xl md:text-4xl cursor-pointer select-none"
        onClick={onClick}
      >
        {char}
      </span>
    )
  }

  if (isKnown) {
    return (
      <span
        className="text-3xl md:text-4xl cursor-pointer select-none text-gray-800 hover:text-red-600 transition-colors active:scale-110"
        onClick={onClick}
      >
        {char}
      </span>
    )
  }

  return (
    <ruby
      className="text-3xl md:text-4xl cursor-pointer select-none hover:bg-red-50 rounded px-0.5 transition-colors active:scale-110"
      onClick={onClick}
    >
      {char}
      <rt className="text-sm text-gray-500 font-normal">{pinyin}</rt>
    </ruby>
  )
}
