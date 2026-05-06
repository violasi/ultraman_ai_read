import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import { AppProvider, useApp } from '../../context/AppContext'
import RewardCelebration from '../shared/RewardCelebration'
import LockScreen from '../shared/LockScreen'
import { KEYS, getItem } from '../../lib/storage'
import { generateDeviceId } from '../../lib/deviceId'
import { isLicenseMode, checkLicense, type LicenseStatus } from '../../lib/license'

function getUnlockState(): { unlocked: boolean; licenseStatus?: LicenseStatus } {
  // License mode
  if (isLicenseMode()) {
    const status = checkLicense()
    return { unlocked: status === 'valid', licenseStatus: status }
  }

  // Password mode (existing behavior)
  const password = import.meta.env.VITE_APP_PASSWORD
  if (!password) return { unlocked: true }

  const unlocked = getItem<boolean>(KEYS.UNLOCKED, false)
  if (!unlocked) return { unlocked: false }

  const storedDeviceId = getItem<string>(KEYS.DEVICE_ID, '')
  const currentDeviceId = generateDeviceId()
  return { unlocked: storedDeviceId === currentDeviceId }
}

function AppShellInner() {
  const { pendingReward, dismissReward } = useApp()

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg-page)] relative">
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
  const [state, setState] = useState(getUnlockState)

  if (!state.unlocked) {
    return (
      <LockScreen
        onUnlock={() => setState({ unlocked: true })}
        licenseStatus={state.licenseStatus}
      />
    )
  }

  return (
    <AppProvider>
      <AppShellInner />
    </AppProvider>
  )
}
