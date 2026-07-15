import AuthCheck from '@/components/AuthCheck'
import NewTradeClient from '@/components/NewTradeClient'

export default function NewTradePage() {
  return (
    <AuthCheck>
      <NewTradeClient />
    </AuthCheck>
  )
}
