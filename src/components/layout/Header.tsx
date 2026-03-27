import { useNavigate, useLocation } from 'react-router-dom'

interface HeaderProps {
  totalStars: number
}

export default function Header({ totalStars }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Back button */}
        <div className="w-10">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-90 transition-all"
              aria-label="返回"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Title */}
        <h1 className="text-lg font-bold tracking-wide">
          📔 奥特曼日记
        </h1>

        {/* Star count */}
        <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
          <span className="text-sm">⭐</span>
          <span className="text-sm font-bold">{totalStars}</span>
        </div>
      </div>
    </header>
  )
}
