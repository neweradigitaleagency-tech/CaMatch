import { TrendingUp, TrendingDown } from "lucide-react"

interface KPICardProps {
  label: string
  value: string
  trend?: { value: number; positive: boolean }
  icon?: React.ReactNode
  onClick?: () => void
}

export default function KPICard({ label, value, trend, icon, onClick }: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-xl p-4 transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:border-gray-300" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[12px] font-medium text-gray-500">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="text-[26px] font-bold text-gray-900 tracking-tight">{value}</div>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          {trend.positive ? (
            <TrendingUp className="w-3.5 h-3.5 text-[var(--admin-accent)]" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-[var(--admin-danger)]" />
          )}
          <span className={`text-[11px] font-medium ${trend.positive ? "text-[var(--admin-accent)]" : "text-[var(--admin-danger)]"}`}>
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
        </div>
      )}
    </div>
  )
}
