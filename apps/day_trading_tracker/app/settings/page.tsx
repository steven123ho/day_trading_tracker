import AuthCheck from '@/components/AuthCheck'
import AccountStrategyManager from '@/components/AccountStrategyManager'
import ThemeSettings from '@/components/ThemeSettings'

export const metadata = {
  title: 'Settings | Futures Journal',
}

export default function SettingsPage() {
  return (
    <AuthCheck>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <ThemeSettings />
        <AccountStrategyManager />
      </div>
    </AuthCheck>
  )
}
