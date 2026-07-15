import AuthCheck from '@/components/AuthCheck'
import DashboardClient from '@/components/DashboardClient'

export const metadata = {
  title: 'Dashboard | Futures Journal',
}

export default function DashboardPage() {
  return (
    <AuthCheck>
      <DashboardClient />
    </AuthCheck>
  )
}
