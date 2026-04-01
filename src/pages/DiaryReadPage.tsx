import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTTS } from '../hooks/useTTS'
import { getCharacterById } from '../data/ultramanCharacters'
import RubyText from '../components/shared/RubyText'
import UltramanAvatar from '../components/shared/UltramanAvatar'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekday = WEEKDAYS[d.getDay()]
  return `${month}月${day}日 星期${weekday}`
}

export default function DiaryReadPage() {
  const { id } = useParams<{ id: string }>()
  const { getDiaryEntry, isKnownChar } = useApp()
  const { speakChinese } = useTTS()
  const entry = getDiaryEntry(id ?? '')

  if (!entry) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">😕</span>
        <p className="text-gray-500">找不到这篇日记</p>
      </div>
    )
  }

  const handleCharClick = (char: string, pinyin: string) => {
    if (!pinyin || /[。，！？：；、""''（）—…～·《》\s]/.test(char)) return
    speakChinese(char)
  }

  const speakSentence = (sentenceIdx: number) => {
    const text = entry.sentences[sentenceIdx].words.map(w => w.char).join('')
    speakChinese(text)
  }

  return (
    <div className="space-y-4 py-2">
      {/* Diary header */}
      <div className="bg-[#FFF8F0] rounded-2xl p-5 border border-[#E8DED5] space-y-3">
        <p className="text-sm text-gray-400 font-bold">{formatDate(entry.date)}</p>
        <h2 className="text-2xl font-black text-gray-800">{entry.storyTitle}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {entry.selectedUltramans.map(heroId => {
            const c = getCharacterById(heroId)
            return c ? (
              <div key={heroId} className="flex items-center gap-1">
                <UltramanAvatar character={c} size="sm" />
                <span className="text-xs text-gray-500 font-bold">{c.shortName}</span>
              </div>
            ) : null
          })}
        </div>
        {entry.happyEvent && (
          <p className="text-sm text-gray-400 italic">
            💛 {entry.happyEvent}
          </p>
        )}
      </div>

      {/* All sentences */}
      <div className="space-y-4">
        {entry.sentences.map((sentence, sIdx) => (
          <div key={sIdx} className="bg-[#FFF8F0] rounded-2xl p-5 border border-[#E8DED5] space-y-2">
            <div className="flex flex-wrap gap-1 items-center">
              {sentence.words.map((word, wIdx) => (
                <RubyText
                  key={`${sIdx}-${wIdx}-${word.char}`}
                  char={word.char}
                  pinyin={word.pinyin}
                  isKnown={isKnownChar(word.char)}
                  onClick={() => handleCharClick(word.char, word.pinyin)}
                />
              ))}
            </div>
            <button
              onClick={() => speakSentence(sIdx)}
              className="text-sm text-[#E8453C] font-bold hover:bg-[#E8453C]/10 px-2 py-1 rounded-lg transition-colors"
            >
              🔊 听整句
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
