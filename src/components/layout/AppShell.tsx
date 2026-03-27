import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import MilestoneCelebration from '../shared/MilestoneCelebration'
import { AppProvider, useApp } from '../../context/AppContext'

function AppShellInner() {
  const { progress } = useApp()

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50 relative">
      <Header totalStars={progress.totalStars} />
      <main className="flex-1 px-4 md:px-12 lg:px-24 py-4 pb-24 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <MilestoneCelebration />
    </div>
  )
}

export default function AppShell() {
  return (
    <AppProvider>
      <AppShellInner />
    </AppProvider>
  )
}
