import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { theme } from '../../config/theme'
import { isLicenseMode, getLicenseInfo } from '../../lib/license'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { knownCharCount } = useApp()
  const isHome = location.pathname === '/'

  const licenseInfo = isLicenseMode() ? getLicenseInfo() : null

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-bg-warm)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between shadow-sm">
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
          {theme.appName}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {licenseInfo && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            licenseInfo.daysLeft <= 3
              ? 'text-red-600 bg-red-100'
              : 'text-gray-500 bg-gray-100'
          }`}>
            剩余 {licenseInfo.daysLeft} 天
          </span>
        )}
        <span className="text-sm font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded-full">
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
