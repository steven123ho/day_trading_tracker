import AuthCheck from '@/components/AuthCheck'
import Calendar from '@/components/Calendar'

export const metadata = {
  title: 'Calendar | Futures Journal',
}

export default function CalendarPage() {
  return (
    <AuthCheck>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Trade Calendar</h1>
        <Calendar />
      </div>
    </AuthCheck>
  )
}
