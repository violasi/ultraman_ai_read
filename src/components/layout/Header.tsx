import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { knownCharCount } = useApp()
  const isHome = location.pathname === '/'

  return (
    <header className="sticky top-0 z-30 bg-[#FFF8F0] border-b border-[#E8DED5] px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="text-lg text-gray-500 hover:text-gray-800 transition-colors pr-1"
          >
            ←
          </button>
        )}
        <h1 className="text-xl font-black text-gray-800 tracking-wide">
          奥特曼日记
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-[#E8453C] bg-[#E8453C]/10 px-2 py-1 rounded-full">
          字 {knownCharCount}
        </span>
        <button
          onClick={() => navigate('/settings')}
          className="text-lg text-gray-400 hover:text-gray-600 transition-colors"
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}
