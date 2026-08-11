import { supabase, isSupabaseReady } from "../supabase"

export interface AnalyticsData {
  users: { total: number; active: number; new: number; growth: number }
  pros: { total: number; verified: number; available: number; growth: number }
  missions: { total: number; completed: number; in_progress: number; avg_value: number }
  revenue: { total: number; platform_fees: number; pending_payouts: number; growth: number }
  charts: {
    users_over_time: { date: string; value: number }[]
    revenue_over_time: { date: string; amount: number }[]
    missions_by_status: { status: string; count: number }[]
    top_categories: { category: string; count: number; revenue: number }[]
    pro_growth: { date: string; clients: number; pros: number }[]
  }
}

const MOCK_ANALYTICS: AnalyticsData = {
  users: { total: 1248, active: 892, new: 128, growth: 12 },
  pros: { total: 342, verified: 198, available: 267, growth: 8 },
  missions: { total: 1567, completed: 1123, in_progress: 89, avg_value: 28500 },
  revenue: { total: 45800000, platform_fees: 4580000, pending_payouts: 1250000, growth: 15 },
  charts: {
    users_over_time: [
      { date: "Jan", value: 520 }, { date: "Fév", value: 580 }, { date: "Mar", value: 650 },
      { date: "Avr", value: 720 }, { date: "Mai", value: 890 }, { date: "Juin", value: 1050 },
      { date: "Juil", value: 1248 },
    ],
    revenue_over_time: [
      { date: "Jan", amount: 2800000 }, { date: "Fév", amount: 3200000 }, { date: "Mar", amount: 3800000 },
      { date: "Avr", amount: 4100000 }, { date: "Mai", amount: 5200000 }, { date: "Juin", amount: 6800000 },
      { date: "Juil", amount: 7200000 },
    ],
    missions_by_status: [
      { status: "Terminées", count: 1123 }, { status: "En cours", count: 89 },
      { status: "En attente", count: 156 }, { status: "Annulées", count: 134 },
      { status: "Litiges", count: 65 },
    ],
    top_categories: [
      { category: "Plombier", count: 423, revenue: 8900000 },
      { category: "Électricien", count: 367, revenue: 7200000 },
      { category: "Climatisation", count: 245, revenue: 5800000 },
      { category: "Nettoyage", count: 198, revenue: 3400000 },
      { category: "Peintre", count: 156, revenue: 2800000 },
      { category: "Jardinage", count: 112, revenue: 1900000 },
    ],
    pro_growth: [
      { date: "S1", clients: 180, pros: 45 }, { date: "S2", clients: 200, pros: 52 },
      { date: "S3", clients: 165, pros: 48 }, { date: "S4", clients: 220, pros: 55 },
    ],
  },
}

export async function getAnalytics(period: string = "30d"): Promise<AnalyticsData> {
  if (!isSupabaseReady()) return MOCK_ANALYTICS
  try {
    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30
    const now = Date.now()
    const dayMs = 86400000
    const periodStart = new Date(now - days * dayMs).toISOString()
    const prevPeriodStart = new Date(now - 2 * days * dayMs).toISOString()

    const [
      totalUsersRes, activeUsersRes,
      totalProsRes, verifiedProsRes, availableProsRes,
      totalMissionsRes, completedMissionsRes, inProgressMissionsRes,
      avgJobValueRes,
      currRevenueRes, prevRevenueRes,
      currFeesRes,
      pendingPayoutsRes,
      revenueChartRes,
      registrationsRes,
      missionsStatusRes,
      categoriesRes,
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("professional_profiles").select("user_id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("professional_profiles").select("user_id", { count: "exact", head: true }).eq("verification_level", "certified").is("deleted_at", null),
      supabase.from("professional_profiles").select("user_id", { count: "exact", head: true }).neq("verification_level", "none").is("deleted_at", null),
      supabase.from("service_requests").select("id", { count: "exact", head: true }),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("service_requests").select("final_price").eq("status", "completed").not("final_price", "is", null),
      supabase.from("transactions").select("amount").eq("status", "captured").gte("created_at", periodStart),
      supabase.from("transactions").select("amount").eq("status", "captured").gte("created_at", prevPeriodStart).lt("created_at", periodStart),
      supabase.from("transactions").select("platform_fee").eq("status", "captured").gte("created_at", periodStart),
      (supabase.from("payouts" as never).select("amount" as never).eq("status" as never, "pending") as any),
      supabase.from("transactions").select("created_at, amount").eq("status", "captured").gte("created_at", periodStart).order("created_at"),
      supabase.from("users").select("created_at, role").gte("created_at", prevPeriodStart).order("created_at"),
      supabase.from("service_requests").select("status"),
      supabase.from("service_requests").select("categories"),
    ])

    const sumAmount = (res: { data: { amount: number }[] | null }) =>
      (res?.data ?? []).reduce((s: number, t: { amount: number }) => s + (t.amount ?? 0), 0)
    const sumFee = (res: { data: { platform_fee: number }[] | null }) =>
      (res?.data ?? []).reduce((s: number, t: { platform_fee: number }) => s + (t.platform_fee ?? 0), 0)

    const currentRevenue = sumAmount(currRevenueRes)
    const prevRevenue = sumAmount(prevRevenueRes)
    const revenueGrowth = prevRevenue > 0
      ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
      : currentRevenue > 0 ? 100 : 0

    const platformFees = sumFee(currFeesRes)
    const pendingPayouts = ((pendingPayoutsRes as any)?.data ?? []).reduce((s: number, p: { amount: number }) => s + (p.amount ?? 0), 0)

    const jobPrices = (avgJobValueRes?.data ?? []) as unknown as { final_price: number }[]
    const avgValue = jobPrices.length > 0
      ? Math.round(jobPrices.reduce((s, j) => s + j.final_price, 0) / jobPrices.length)
      : 0

    const allRegs = (registrationsRes?.data ?? []) as { created_at: string; role: string }[]
    const periodCutoff = new Date(periodStart).getTime()
    let currentUsers = 0, prevUsers = 0, currentPros = 0, prevPros = 0
    for (const r of allRegs) {
      const t = new Date(r.created_at).getTime()
      if (t >= periodCutoff) {
        currentUsers++
        if (r.role === "professional") currentPros++
      } else {
        prevUsers++
        if (r.role === "professional") prevPros++
      }
    }

    const userGrowth = prevUsers > 0
      ? Math.round(((currentUsers - prevUsers) / prevUsers) * 100)
      : currentUsers > 0 ? 100 : 0

    const proGrowthVal = prevPros > 0
      ? Math.round(((currentPros - prevPros) / prevPros) * 100)
      : currentPros > 0 ? 100 : 0

    const currentRegs = allRegs.filter(r => new Date(r.created_at).getTime() >= periodCutoff)
    const formatDay = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })

    const proGrowthData = buildProGrowthChart(currentRegs, days, formatDay)

    const revenueTxns = (revenueChartRes?.data ?? []) as { created_at: string; amount: number }[]
    const revenueChartData = buildRevenueChart(revenueTxns, days, formatDay)

    const missionsRows = (missionsStatusRes?.data ?? []) as { status: string }[]
    const statusLabels: Record<string, string> = {
      draft: "Brouillons", pending: "En attente", approved: "Approuvées",
      active: "En cours", completed: "Terminées", cancelled: "Annulées",
      rejected: "Rejetées", archived: "Archivées", suspended: "Suspendues",
    }
    const statusMap: Record<string, number> = {}
    for (const m of missionsRows) {
      const label = statusLabels[m.status] ?? m.status
      statusMap[label] = (statusMap[label] ?? 0) + 1
    }
    const missionsByStatus = Object.entries(statusMap)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)

    const catRows = (categoriesRes?.data ?? []) as { categories: string[] }[]
    const catMap: Record<string, number> = {}
    for (const c of catRows) {
      for (const cat of c.categories ?? []) {
        if (cat) catMap[cat] = (catMap[cat] ?? 0) + 1
      }
    }
    const topCategories = Object.entries(catMap)
      .map(([category, count]) => ({ category, count, revenue: 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const userOverTime = proGrowthData.map(d => ({
      date: d.date,
      value: d.clients + d.pros,
    }))

    return {
      users: {
        total: totalUsersRes.count ?? 0,
        active: activeUsersRes.count ?? 0,
        new: currentUsers,
        growth: userGrowth,
      },
      pros: {
        total: totalProsRes.count ?? 0,
        verified: verifiedProsRes.count ?? 0,
        available: availableProsRes.count ?? 0,
        growth: proGrowthVal,
      },
      missions: {
        total: totalMissionsRes.count ?? 0,
        completed: completedMissionsRes.count ?? 0,
        in_progress: inProgressMissionsRes.count ?? 0,
        avg_value: avgValue,
      },
      revenue: {
        total: currentRevenue,
        platform_fees: platformFees,
        pending_payouts: pendingPayouts,
        growth: revenueGrowth,
      },
      charts: {
        users_over_time: userOverTime,
        revenue_over_time: revenueChartData,
        missions_by_status: missionsByStatus,
        top_categories: topCategories,
        pro_growth: proGrowthData,
      },
    }
  } catch {
    return MOCK_ANALYTICS
  }
}

function buildProGrowthChart(
  users: { created_at: string; role: string }[],
  days: number,
  formatDay: (d: Date) => string,
): { date: string; clients: number; pros: number }[] {
  const dayMap: Record<string, { clients: number; pros: number }> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    dayMap[formatDay(d)] = { clients: 0, pros: 0 }
  }
  for (const u of users) {
    const key = formatDay(new Date(u.created_at))
    if (dayMap[key]) {
      if (u.role === "professional") dayMap[key].pros++
      else dayMap[key].clients++
    }
  }
  return Object.entries(dayMap).map(([date, counts]) => ({ date, ...counts }))
}

function buildRevenueChart(
  txns: { created_at: string; amount: number }[],
  days: number,
  formatDay: (d: Date) => string,
): { date: string; amount: number }[] {
  const dayMap: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    dayMap[formatDay(d)] = 0
  }
  for (const t of txns) {
    const key = formatDay(new Date(t.created_at))
    if (dayMap[key] !== undefined) dayMap[key] += t.amount
  }
  return Object.entries(dayMap).map(([date, amount]) => ({ date, amount }))
}
