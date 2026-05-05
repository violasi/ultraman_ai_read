import { NavLink } from 'react-router-dom'
import { theme } from '../../config/theme'

const tabs = [
  { to: '/books', label: '读绘本', icon: '📖', end: true },
  { to: '/books/library', label: '绘本馆', icon: '📚', end: false },
  { to: '/heroes', label: theme.labels.heroHall, icon: theme.labels.heroHallIcon, end: false },
  { to: '/vocab', label: '生字本', icon: '📝', end: false },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--color-bg-warm)] border-t border-[var(--color-border)] shadow-[0_-2px_8px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[var(--color-primary)] scale-105'
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-bold">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
