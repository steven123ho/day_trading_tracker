import AuthCheck from '@/components/AuthCheck'
import TradeList from '@/components/TradeList'
import ExportButton from '@/components/ExportButton'

export const metadata = {
  title: 'Trades | Futures Journal',
}

export default function TradesPage() {
  return (
    <AuthCheck>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Trade History</h1>
          <ExportButton />
        </div>
        <TradeList />
      </div>
    </AuthCheck>
  )
}
