import { useState, useEffect, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { getAnalytics } from "../../services/admin/analytics.service"
import { usePermissions } from "../../hooks/usePermissions"
import ErrorState from "../../components/admin/ui/ErrorState"
import { formatCompactNumber, formatXOF, formatPercent } from "../../utils/admin/formatCurrency"
import { getCategoryLabel } from "../../constants/admin/categoryLabels"
import type { AnalyticsData } from "../../services/admin/analytics.service"

const PERIODS = [
  { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" },
  { key: "90d", label: "90 jours" },
  { key: "1y", label: "1 an" },
]

const CHART_COLORS = ["#00A86B", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899"]

export default function AdminAnalyticsPage() {
  const { hasPermission } = usePermissions()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("30d")
  const canExport = hasPermission("analytics.export")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAnalytics(period)
      setData(result)
    } catch {
      setError("Impossible de charger les analytics.")
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  if (error) return <ErrorState message={error} onRetry={fetchData} />
  if (!data) return null

  const gradientId = "revenueGradient"

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Analytics</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Performance de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-colors ${period === p.key ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {p.label}
            </button>
          ))}
          {canExport && (
            <button className="ml-2 px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              Exporter
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Utilisateurs</p>
          <p className="text-[22px] font-bold text-gray-900 mt-1">{formatCompactNumber(data.users.total)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            <span className="text-[var(--admin-accent)]">+{data.users.new}</span> nouveaux
            <span className="inline-block w-1 h-1 rounded-full bg-gray-300 mx-1.5 align-middle" />
            <span className={data.users.growth >= 0 ? "text-[var(--admin-accent)]" : "text-red-500"}>{formatPercent(data.users.growth)}</span>
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Professionnels</p>
          <p className="text-[22px] font-bold text-gray-900 mt-1">{formatCompactNumber(data.pros.total)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            <span className="text-blue-600">{data.pros.verified} vérifiés</span>
            <span className="inline-block w-1 h-1 rounded-full bg-gray-300 mx-1.5 align-middle" />
            <span className="text-gray-400">{Math.round(data.pros.available / data.pros.total * 100)}% dispo</span>
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Missions</p>
          <p className="text-[22px] font-bold text-gray-900 mt-1">{formatCompactNumber(data.missions.total)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Moy. {formatXOF(data.missions.avg_value)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Revenu</p>
          <p className="text-[22px] font-bold text-[var(--admin-accent)] mt-1">{formatCompactNumber(data.revenue.total)} F</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            <span className={data.revenue.growth >= 0 ? "text-[var(--admin-accent)]" : "text-red-500"}>{formatPercent(data.revenue.growth)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Revenus</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.revenue_over_time}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A86B" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000000}M`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} formatter={(v: unknown) => typeof v === "number" ? formatXOF(v) : String(v)} />
                <Line type="monotone" dataKey="amount" stroke="#00A86B" strokeWidth={2} dot={{ r: 3, fill: "#00A86B" }} activeDot={{ r: 5 }} fill={`url(#${gradientId})`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Croissance</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.pro_growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="clients" name="Clients" fill="#00A86B" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="pros" name="Pros" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Missions par statut</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.charts.missions_by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                  {data.charts.missions_by_status.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Top catégories</h3>
          <div className="space-y-3">
            {data.charts.top_categories.map((cat, i) => {
              const max = Math.max(...data.charts.top_categories.map((c) => c.count))
              const pct = (cat.count / max) * 100
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-gray-700">{getCategoryLabel(cat.category)}</span>
                    <span className="text-[11px] text-gray-400">{cat.count} missions</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
