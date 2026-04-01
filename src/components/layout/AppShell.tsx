import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import { AppProvider, useApp } from '../../context/AppContext'
import RewardCelebration from '../shared/RewardCelebration'

function AppShellInner() {
  const { pendingReward, dismissReward } = useApp()

  return (
    <div className="min-h-dvh flex flex-col bg-[#FAF3EE] relative">
      <Header />
      <main className="flex-1 px-4 md:px-12 lg:px-24 pt-5 overflow-y-auto">
        <Outlet />
        <div className="h-24 shrink-0" aria-hidden="true" />
      </main>
      <BottomNav />
      {pendingReward && (
        <RewardCelebration card={pendingReward} onDismiss={dismissReward} />
      )}
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
