import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/chinese', label: '汉字', icon: '📖' },
  { to: '/pinyin', label: '拼音', icon: '🔤' },
  { to: '/english', label: '英文', icon: '🔠' },
  { to: '/rewards', label: '卡片', icon: '🎴' },
  { to: '/workshop', label: '工坊', icon: '🛠️' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-stretch">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-red-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
