import { useState } from 'react'
import { theme } from '../../config/theme'
import { generateDeviceId } from '../../lib/deviceId'
import { KEYS, setItem } from '../../lib/storage'
import { activateLicense, isLicenseMode, type LicenseStatus } from '../../lib/license'

interface Props {
  onUnlock: () => void
  licenseStatus?: LicenseStatus
}

export default function LockScreen({ onUnlock, licenseStatus }: Props) {
  if (isLicenseMode()) {
    return <LicenseLockScreen onUnlock={onUnlock} licenseStatus={licenseStatus} />
  }
  return <PasswordLockScreen onUnlock={onUnlock} />
}

// --- Password mode (existing behavior) ---

function PasswordLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const correctPassword = import.meta.env.VITE_APP_PASSWORD

    if (password === correctPassword) {
      const deviceId = generateDeviceId()
      setItem(KEYS.DEVICE_ID, deviceId)
      setItem(KEYS.UNLOCKED, true)
      onUnlock()
    } else {
      setError('密码错误，请重试')
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  return (
    <LockShell shaking={shaking}>
      <p className="text-sm text-gray-400">请输入密码解锁应用</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError('') }}
          placeholder="请输入密码"
          autoFocus
          className="w-full p-4 rounded-2xl border-2 border-[var(--color-border)] bg-white text-lg text-center text-gray-800 placeholder:text-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
        />
        {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
        <SubmitButton disabled={!password.trim()} label="解锁" />
      </form>
    </LockShell>
  )
}

// --- License mode ---

function LicenseLockScreen({ onUnlock, licenseStatus }: { onUnlock: () => void; licenseStatus?: LicenseStatus }) {
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shaking, setShaking] = useState(false)

  const statusMessage = licenseStatus === 'expired'
    ? '会员已过期，请联系续费获取新的会员码'
    : licenseStatus === 'tampered'
    ? '检测到系统时间异常，请恢复正确时间后重试'
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!licenseKey.trim() || loading) return

    setLoading(true)
    setError('')

    try {
      const result = await activateLicense(licenseKey)
      if (result.ok) {
        onUnlock()
      } else {
        setError(result.error || '激活失败')
        setShaking(true)
        setTimeout(() => setShaking(false), 500)
      }
    } catch {
      setError('激活失败，请重试')
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LockShell shaking={shaking}>
      {statusMessage ? (
        <p className="text-sm text-red-500 font-bold">{statusMessage}</p>
      ) : (
        <p className="text-sm text-gray-400">请粘贴会员码激活应用</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={licenseKey}
          onChange={e => { setLicenseKey(e.target.value); setError('') }}
          placeholder="请粘贴会员码"
          autoFocus
          rows={4}
          className="w-full p-4 rounded-2xl border-2 border-[var(--color-border)] bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none font-mono"
        />
        {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
        <SubmitButton disabled={!licenseKey.trim() || loading} label={loading ? '验证中...' : '激活'} />
      </form>
    </LockShell>
  )
}

// --- Shared UI ---

function LockShell({ children, shaking }: { children: React.ReactNode; shaking: boolean }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6" style={{ background: 'var(--color-bg-page)' }}>
      <div className={`w-full max-w-sm space-y-6 ${shaking ? 'animate-shake' : ''}`}>
        <div className="text-center space-y-2">
          <span className="text-5xl block">{theme.labels.heroHallIcon}</span>
          <h1 className="text-2xl font-black text-gray-800">{theme.appName}</h1>
        </div>
        <div className="space-y-4 text-center">
          {children}
        </div>
      </div>
    </div>
  )
}

function SubmitButton({ disabled, label }: { disabled: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-4 rounded-2xl font-black text-lg text-white active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: 'var(--color-primary)',
        boxShadow: '0 3px 0 var(--color-primary-dark)',
      }}
    >
      {label}
    </button>
  )
}
