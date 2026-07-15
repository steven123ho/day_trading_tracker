import AuthCheck from '@/components/AuthCheck'
import StrategyManager from '@/components/StrategyManager'

export default function StrategiesPage() {
  return (
    <AuthCheck>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Strategies & Rules</h1>
        <p className="text-muted mb-6">
          Build a playbook for each strategy. Add rules with checkboxes to track the setup criteria you want to follow.
        </p>
        <StrategyManager />
      </div>
    </AuthCheck>
  )
}
