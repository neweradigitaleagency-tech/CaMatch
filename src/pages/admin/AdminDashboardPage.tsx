import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getDashboardStats } from "../../services/admin/admin.service"
import { usePermissions } from "../../hooks/usePermissions"
import { useAdminRealtime } from "../../hooks/useAdminRealtime"
import KPICard from "../../components/admin/ui/KPICard"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import AdminSkeleton from "../../components/admin/ui/AdminSkeleton"
import ErrorState from "../../components/admin/ui/ErrorState"
import { formatXOF, formatCompactNumber } from "../../utils/admin/formatCurrency"
import {
  AlertTriangle, ShieldCheck, CreditCard, MessageSquare, Flag,
  Users, Briefcase, Coins, CalendarDays, Clock, Target,
  CheckCircle2, TrendingUp, Timer, UserCheck,
} from "lucide-react"
import { getCategoryLabel } from "../../constants/admin/categoryLabels"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts"
import type { DashboardStats } from "../../types/admin"

const ALERT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  verification: ShieldCheck,
  payment: CreditCard,
  ticket: MessageSquare,
  report: Flag,
  suspended: Users,
}

const ACTIVITY_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string; text: string }> = {
  new_pro: { icon: Briefcase, bg: "bg-blue-100", text: "text-blue-600" },
  new_client: { icon: Users, bg: "bg-green-100", text: "text-green-600" },
  new_mission: { icon: Target, bg: "bg-amber-100", text: "text-amber-600" },
  new_payment: { icon: Coins, bg: "bg-emerald-100", text: "text-emerald-600" },
  new_report: { icon: Flag, bg: "bg-red-100", text: "text-red-600" },
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch {
      setError("Impossible de charger les statistiques")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  useAdminRealtime([
    { table: "service_requests", event: "INSERT", callback: fetchStats },
    { table: "transactions", event: "INSERT", callback: fetchStats },
    { table: "verification_requests", event: "INSERT", callback: fetchStats },
    { table: "users", event: "INSERT", callback: fetchStats },
  ])

  if (error) return <ErrorState message={error} onRetry={fetchStats} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Dashboard</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Vue d'ensemble de la plateforme</p>
        </div>
      </div>

      {loading && !stats ? (
        <DashboardSkeleton />
      ) : stats ? (
        <>
          <AlertsSection alerts={stats.alerts} navigate={navigate} />
          <KPIsSection stats={stats} />
          <ChartsSection stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivitySection stats={stats} />
            <CitiesSection cities={stats.charts.cities} />
          </div>
        </>
      ) : null}
    </div>
  )
}

function AlertsSection({ alerts, navigate }: { alerts: DashboardStats["alerts"]; navigate: ReturnType<typeof useNavigate> }) {
  const visible = alerts.filter((a) => a.count > 0)
  if (visible.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        </div>
        <span className="text-[13px] font-bold text-red-800">Urgences — Actions requises</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {visible.map((alert) => {
          const Icon = ALERT_ICONS[alert.type] ?? AlertTriangle
          return (
            <button
              key={alert.type}
              onClick={() => navigate(alert.link)}
              className="flex items-center gap-3 bg-white border border-red-200 rounded-xl p-3 hover:shadow-sm transition-all cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <Icon className="w-[18px] h-[18px] text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[18px] font-bold text-red-700">{alert.count}</p>
                <p className="text-[11px] text-red-600 truncate">{alert.label}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function KPIsSection({ stats }: { stats: DashboardStats }) {
  const kpis = [
    { label: "Total clients", value: formatCompactNumber(stats.today.total_clients), trend: stats.trends.users, icon: <Users className="w-4 h-4" /> },
    { label: "Professionnels", value: formatCompactNumber(stats.today.total_pros), trend: stats.trends.pros, icon: <Briefcase className="w-4 h-4" /> },
    { label: "Pros vérifiés", value: formatCompactNumber(stats.today.verified_pros), icon: <UserCheck className="w-4 h-4" /> },
    { label: "Missions aujourd'hui", value: String(stats.today.missions_today), trend: stats.trends.missions, icon: <CalendarDays className="w-4 h-4" /> },
    { label: "En cours", value: String(stats.today.missions_in_progress), icon: <Target className="w-4 h-4" /> },
    { label: "Terminées", value: String(stats.today.missions_completed), icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: "CA aujourd'hui", value: formatXOF(stats.today.revenue_today), trend: stats.trends.revenue, icon: <Coins className="w-4 h-4" /> },
    { label: "Revenus plateforme", value: formatXOF(stats.today.platform_revenue), icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Taux réussite", value: `${stats.today.success_rate}%`, icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: "Temps réponse", value: `${stats.today.avg_response_time} min`, icon: <Timer className="w-4 h-4" /> },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          trend={kpi.trend ? { value: kpi.trend.change, positive: kpi.trend.change >= 0 } : undefined}
          icon={kpi.icon}
        />
      ))}
    </div>
  )
}

function ChartsSection({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Évolution des inscriptions (30 jours)</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.charts.registrations}>
              <defs>
                <linearGradient id="clientsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prosGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A86B" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Area type="monotone" dataKey="clients" stroke="#3B82F6" strokeWidth={2} fill="url(#clientsGrad)" />
              <Area type="monotone" dataKey="pros" stroke="#00A86B" strokeWidth={2} fill="url(#prosGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Chiffre d'affaires (7 jours)</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.charts.revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [formatXOF(Number(v)), "CA"]} />
              <Line type="monotone" dataKey="amount" stroke="#00A86B" strokeWidth={2} dot={{ r: 3, fill: "#00A86B" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Missions par catégorie</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.charts.missions_by_category} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={130} tickFormatter={(v) => getCategoryLabel(v)} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="count" fill="#00A86B" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Villes les plus actives</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.charts.cities} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="city" type="category" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function ActivitySection({ stats }: { stats: DashboardStats }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-gray-900">Activité récente</h3>
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <Clock className="w-3 h-3" /> Temps réel
        </span>
      </div>
      <div className="divide-y divide-gray-50 max-h-[380px] overflow-y-auto">
        {stats.activity.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-gray-400">
            Aucune activité récente
          </div>
        ) : (
          stats.activity.map((a) => {
            const iconDef = ACTIVITY_ICONS[a.type] ?? { icon: Clock, bg: "bg-gray-100", text: "text-gray-500" }
            const Icon = iconDef.icon
            return (
              <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${iconDef.bg} ${iconDef.text} flex items-center justify-center shrink-0`}>
                  <Icon className="w-[15px] h-[15px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.user_name && (
                      <span className="text-[13px] font-medium text-gray-900">{a.user_name}</span>
                    )}
                    <span className="text-[12px] text-gray-500">{a.description}</span>
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap">{a.time}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function CitiesSection({ cities }: { cities: { city: string; count: number }[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-[13px] font-semibold text-gray-900">Top villes</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {cities.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-gray-400">
            Aucune donnée disponible
          </div>
        ) : (
          cities.map((c, i) => (
            <div key={c.city} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-5 text-[11px] font-medium text-gray-400 text-center">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-gray-700">{c.city}</span>
                  <span className="text-[12px] font-medium text-gray-900">{c.count}</span>
                </div>
                <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (c.count / (cities[0]?.count || 1)) * 100)}%` }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-7 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-[220px] bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
