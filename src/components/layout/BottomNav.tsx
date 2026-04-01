import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '写日记', icon: '✏️', end: true },
  { to: '/books', label: '读绘本', icon: '📖', end: true },
  { to: '/books/library', label: '绘本馆', icon: '📚', end: false },
  { to: '/diary', label: '日记本', icon: '📖', end: false },
  { to: '/heroes', label: '英雄馆', icon: '⭐', end: false },
  { to: '/vocab', label: '生字本', icon: '📝', end: false },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFF8F0] border-t border-[#E8DED5] shadow-[0_-2px_8px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[#E8453C] scale-105'
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
