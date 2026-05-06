interface RubyTextProps {
  char: string
  pinyin: string
  isKnown: boolean
  highlight?: boolean
  onClick: () => void
}

const PUNCTUATION = /[。，！？：；、""''（）—…～·《》\s]/

export default function RubyText({ char, pinyin, isKnown, highlight, onClick }: RubyTextProps) {
  const highlightClass = highlight ? 'text-[var(--color-primary)] font-black underline decoration-[var(--color-primary)] decoration-2 underline-offset-4' : ''

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
        className={`text-4xl md:text-5xl cursor-pointer select-none text-gray-800 hover:text-[var(--color-primary)] transition-colors active:scale-110 ${highlightClass}`}
        onClick={onClick}
      >
        {char}
      </span>
    )
  }

  return (
    <ruby
      className={`text-4xl md:text-5xl cursor-pointer select-none hover:bg-[var(--color-primary)]/5 rounded px-0.5 transition-colors active:scale-110 ${highlightClass}`}
      onClick={onClick}
    >
      {char}
      <rt className="text-sm text-gray-500 font-normal">{pinyin}</rt>
    </ruby>
  )
}
