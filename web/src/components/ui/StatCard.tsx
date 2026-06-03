import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  icon: LucideIcon
  color: string
  bgColor: string
  trend?: { value: number; positive: boolean }
}

export default function StatCard({ label, value, unit, icon: Icon, color, bgColor, trend }: StatCardProps) {
  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="stat-value text-slate-900">{value}</span>
          {unit && <span className="text-sm text-slate-400">{unit}</span>}
        </div>
        {trend && (
          <p className={`text-xs mt-1 ${trend.positive ? 'text-success' : 'text-danger'}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </p>
        )}
      </div>
    </div>
  )
}
