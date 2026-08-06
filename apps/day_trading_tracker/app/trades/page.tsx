import AuthCheck from '@/components/AuthCheck'
import TradeList from '@/components/TradeList'

export const metadata = {
  title: 'Trades | Futures Journal',
}

export default function TradesPage() {
  return (
    <AuthCheck>
      <TradeList />
    </AuthCheck>
  )
}
