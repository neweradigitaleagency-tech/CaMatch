import { useState, useEffect, useCallback } from "react"
import { format, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts"
import { TrendingUp, Coins, Activity, Users } from "lucide-react"
import KPICard from "../../components/admin/ui/KPICard"
import AdminSkeleton from "../../components/admin/ui/AdminSkeleton"
import ErrorState from "../../components/admin/ui/ErrorState"
import { formatXOF } from "../../utils/admin/formatCurrency"

interface MonthlyRevenue {
  month: string
  mrr: number
  revenue: number
  churn: number
  activeSubs: number
  newSubs: number
  cancelledSubs: number
  clientRevenue: number
  proRevenue: number
}

function generateMockRevenueData(): MonthlyRevenue[] {
  return Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 11 - i)
    const monthLabel = format(date, "MMM yy", { locale: fr })
    const baseSubs = 150 + i * 12 + Math.floor(Math.random() * 20)
    const churn = 2 + Math.random() * 4
    const mrr = baseSubs * 4900 + Math.floor(baseSubs * 0.3) * 9900
    return {
      month: monthLabel,
      mrr,
      revenue: mrr + Math.floor(Math.random() * 200000),
      churn: Math.round(churn * 10) / 10,
      activeSubs: baseSubs,
      newSubs: 10 + Math.floor(Math.random() * 20),
      cancelledSubs: Math.max(1, Math.floor(baseSubs * (churn / 100))),
      clientRevenue: Math.round(mrr * 0.55),
      proRevenue: Math.round(mrr * 0.45),
    }
  })
}

const MOCK_REVENUE_DATA = generateMockRevenueData()

export default function AdminRevenueAnalyticsPage() {
  const [data, setData] = useState<MonthlyRevenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 500))
      setData(MOCK_REVENUE_DATA)
    } catch {
      setData(MOCK_REVENUE_DATA)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (error) return <ErrorState message={error} onRetry={fetchData} />

  const latest = data[data.length - 1]
  const mrr = latest?.mrr ?? 0
  const arr = mrr * 12
  const avgChurn = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.churn, 0) / data.length * 10) / 10 : 0
  const totalSubs = data.reduce((s, d) => s + d.activeSubs, 0)
  const avgRevenuePerUser = totalSubs > 0 ? Math.round(data.reduce((s, d) => s + d.revenue, 0) / totalSubs) : 0

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Analytiques revenus</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Suivi des revenus et métriques d'abonnement</p>
        </div>
      </div>

      {loading && data.length === 0 ? (
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminSkeleton key={i} type="card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          <KPICard label="MRR (Revenu mensuel récurrent)" value={formatXOF(mrr)} icon={<TrendingUp className="w-4 h-4" />} />
          <KPICard label="ARR (Revenu annuel)" value={formatXOF(arr)} icon={<Coins className="w-4 h-4" />} />
          <KPICard label="Taux d'attrition moyen" value={`${avgChurn}%`} icon={<Activity className="w-4 h-4" />} trend={{ value: Math.round(avgChurn), positive: avgChurn < 5 }} />
          <KPICard label="LTV (Valeur moyenne/client)" value={formatXOF(avgRevenuePerUser)} icon={<Users className="w-4 h-4" />} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Abonnements actifs</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="subsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Area type="monotone" dataKey="activeSubs" stroke="#3B82F6" strokeWidth={2} fill="url(#subsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Revenus par type de plan</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v: unknown) => [formatXOF(Number(v)), ""]} />
                <Bar dataKey="clientRevenue" name="Client" fill="#00A86B" radius={[4, 4, 0, 0]} barSize={12} stackId="a" />
                <Bar dataKey="proRevenue" name="Pro" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={12} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Revenus vs Attrition</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 15]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#00A86B" strokeWidth={2} dot={{ r: 3, fill: "#00A86B" }} name="Revenus" />
                <Line yAxisId="right" type="monotone" dataKey="churn" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: "#EF4444" }} name="Attrition %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">MRR (Monthly Recurring Revenue)</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A86B" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v: unknown) => [formatXOF(Number(v)), "MRR"]} />
                <Area type="monotone" dataKey="mrr" stroke="#00A86B" strokeWidth={2} fill="url(#mrrGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[13px] font-semibold text-gray-900">Détail mensuel</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3">Mois</th>
                <th className="px-5 py-3 text-right">MRR</th>
                <th className="px-5 py-3 text-right">Revenus</th>
                <th className="px-5 py-3 text-right">Abonnés</th>
                <th className="px-5 py-3 text-right">Nouveaux</th>
                <th className="px-5 py-3 text-right">Annulations</th>
                <th className="px-5 py-3 text-right">Attrition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((row) => (
                <tr key={row.month} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900 font-medium">{row.month}</td>
                  <td className="px-5 py-3 text-right text-gray-900">{formatXOF(row.mrr)}</td>
                  <td className="px-5 py-3 text-right text-gray-900">{formatXOF(row.revenue)}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{row.activeSubs}</td>
                  <td className="px-5 py-3 text-right text-[var(--admin-accent)]">+{row.newSubs}</td>
                  <td className="px-5 py-3 text-right text-red-500">-{row.cancelledSubs}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{row.churn}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
