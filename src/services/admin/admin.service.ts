import { supabase, isSupabaseReady } from "../supabase"
import type { DashboardStats, AdminUser } from "../../types/admin"

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseReady()) {
    return getMockDashboardStats()
  }
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString()
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

    const [
      clientsRes, prosRes, verifiedRes, missionsTodayRes,
      missionsInProgressRes, missionsCompletedRes,
      revenueTodayRes, platformRevenueRes,
      totalMissionsRes, allMissionsRes,
      registrationsRes,
      categoryRes, citiesRes,
      pendingVerifRes, openTicketsRes, pendingReportsRes,
      avgResponseRes,
      revenueChartRes,
      recentClientsRes, recentProsRes, recentMissionsRes, recentTxnsRes, recentReportsRes,
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "client"),
      supabase.from("professional_profiles").select("user_id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("professional_profiles").select("user_id", { count: "exact", head: true }).neq("verification_level", "none").is("deleted_at", null),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("status", "completed").gte("created_at", todayISO),
      supabase.from("transactions").select("amount").eq("status", "captured").gte("created_at", todayISO),
      supabase.from("transactions").select("amount, platform_fee").eq("status", "captured"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }),
      supabase.from("service_requests").select("status"),
      supabase.from("users").select("created_at, role").gte("created_at", thirtyDaysAgo).order("created_at"),
      supabase.from("service_requests").select("category"),
      (supabase.from("professional_profiles" as never).select("city" as never).not("city" as never, "is", null).is("deleted_at" as never, null) as any),
      supabase.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      (supabase.from("support_tickets" as never).select("id", { count: "exact", head: true }) as any).eq("status", "pending"),
      (supabase.from("reports" as never).select("id", { count: "exact", head: true }) as any).eq("status", "pending"),
      (supabase.from("professional_profiles" as never).select("response_time_avg" as never).not("response_time_avg" as never, "is", null) as any).limit(100),
      supabase.from("transactions").select("created_at, amount").eq("status", "captured").gte("created_at", sevenDaysAgo).order("created_at"),
      supabase.from("users").select("id, email, created_at").eq("role", "client").order("created_at", { ascending: false }).limit(5),
      supabase.from("users").select("id, email, created_at").eq("role", "professional").order("created_at", { ascending: false }).limit(5),
      supabase.from("service_requests").select("id, category, estimated_price_min, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("transactions").select("id, amount, created_at").eq("status", "captured").order("created_at", { ascending: false }).limit(5),
      (supabase.from("reports" as never).select("id, created_at").order("created_at" as never, { ascending: false } as never) as any).limit(5),
    ])

    const revenueToday = revenueTodayRes.data?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) ?? 0
    const platformRevenue = platformRevenueRes.data?.reduce((sum: number, t: { amount: number; platform_fee?: number }) => sum + (t.platform_fee ?? 0), 0) ?? 0
    const allMissions = allMissionsRes.data ?? []
    const totalMissions = totalMissionsRes.count ?? 0
    const completedMissions = allMissions.filter((m: any) => m.status === "completed").length
    const successRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0

    const responseTimes = (avgResponseRes.data ?? []) as { response_time_avg: number }[]
    const avgResponse = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((s: number, r: { response_time_avg: number }) => s + r.response_time_avg, 0) / responseTimes.length)
      : 0

    const registrations = buildDailyRegistrations((registrationsRes.data ?? []) as { created_at: string; role: string }[])
    const catMap: Record<string, number> = {}
    for (const m of (categoryRes.data ?? []) as { category: string }[]) {
      catMap[m.category] = (catMap[m.category] ?? 0) + 1
    }
    const categoryData = Object.entries(catMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    const cityMap: Record<string, number> = {}
    for (const p of (citiesRes.data ?? []) as { city: string }[]) {
      if (p.city) cityMap[p.city] = (cityMap[p.city] ?? 0) + 1
    }
    const cityData = Object.entries(cityMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const formatDay = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })

    const revenueChart = buildRevenueChart(revenueChartRes.data as { created_at: string; amount: number }[] | null, formatDay)

    const trends = computeTrends(registrationsRes.data as { created_at: string; role: string }[] | null, revenueToday)

    const activity = buildActivityFeed(
      recentClientsRes.data as { id: string; email: string; created_at: string }[] | null,
      recentProsRes.data as { id: string; email: string; created_at: string }[] | null,
      recentMissionsRes.data as { id: string; category: string; estimated_price_min: number | null; created_at: string }[] | null,
      recentTxnsRes.data as { id: string; amount: number; created_at: string }[] | null,
      recentReportsRes.data as { id: string; created_at: string }[] | null,
    )

    return {
      today: {
        total_clients: clientsRes.count ?? 0,
        total_pros: prosRes.count ?? 0,
        verified_pros: verifiedRes.count ?? 0,
        missions_today: missionsTodayRes.count ?? 0,
        missions_in_progress: missionsInProgressRes.count ?? 0,
        missions_completed: missionsCompletedRes.count ?? 0,
        revenue_today: revenueToday,
        platform_revenue: platformRevenue,
        success_rate: successRate,
        avg_response_time: avgResponse,
      },
      trends,
      charts: {
        registrations,
        revenue: revenueChart,
        missions_by_category: categoryData,
        cities: cityData,
      },
      activity,
      alerts: [
        { type: "verification", count: pendingVerifRes.count ?? 0, label: "Documents à vérifier", severity: "high", link: "/admin/verifications" },
        { type: "ticket", count: openTicketsRes.count ?? 0, label: "Tickets support ouverts", severity: "medium", link: "/admin/support" },
        { type: "report", count: pendingReportsRes.count ?? 0, label: "Signalements en attente", severity: "high", link: "/admin/reports" },
      ],
    }
  } catch {
    return getMockDashboardStats()
  }
}

function buildDailyRegistrations(users: { created_at: string; role: string }[]): { date: string; clients: number; pros: number }[] {
  const days: Record<string, { clients: number; pros: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
    days[key] = { clients: 0, pros: 0 }
  }
  for (const u of users) {
    const d = new Date(u.created_at)
    const key = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
    if (days[key]) {
      if (u.role === "professional") days[key].pros++
      else days[key].clients++
    }
  }
  return Object.entries(days).map(([date, counts]) => ({ date, ...counts }))
}

function buildRevenueChart(txns: { created_at: string; amount: number }[] | null, formatDay: (d: Date) => string): { date: string; amount: number }[] {
  const dayMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    dayMap[formatDay(d)] = 0
  }
  if (txns) {
    for (const t of txns) {
      const key = formatDay(new Date(t.created_at))
      if (dayMap[key] !== undefined) dayMap[key] += t.amount
    }
  }
  return Object.entries(dayMap).map(([date, amount]) => ({ date, amount }))
}

function computeTrends(users: { created_at: string; role: string }[] | null, revenueToday: number) {
  const now = Date.now()
  const periodMs = 30 * 86400000
  const currentStart = now - periodMs
  const prevStart = now - 2 * periodMs

  let currentClients = 0, prevClients = 0
  let currentPros = 0, prevPros = 0

  if (users) {
    for (const u of users) {
      const t = new Date(u.created_at).getTime()
      if (t >= currentStart) {
        if (u.role === "professional") currentPros++
        else currentClients++
      } else if (t >= prevStart) {
        if (u.role === "professional") prevPros++
        else prevClients++
      }
    }
  }

  const pct = (curr: number, prev: number) => prev > 0 ? Math.round(((curr - prev) / prev) * 100) : curr > 0 ? 100 : 0

  return {
    users: { value: currentClients + currentPros, change: pct(currentClients + currentPros, prevClients + prevPros) },
    pros: { value: currentPros, change: pct(currentPros, prevPros) },
    revenue: { value: revenueToday, change: 0 },
    missions: { value: 0, change: 0 },
  }
}

function buildActivityFeed(
  clients: { id: string; email: string; created_at: string }[] | null,
  pros: { id: string; email: string; created_at: string }[] | null,
  missions: { id: string; category: string; estimated_price_min: number | null; created_at: string }[] | null,
  txns: { id: string; amount: number; created_at: string }[] | null,
  reports: { id: string; created_at: string }[] | null,
): DashboardStats["activity"] {
  const items: DashboardStats["activity"] = []

  if (clients) {
    for (const c of clients) {
      items.push({
        id: `c-${c.id}`,
        time: formatTime(c.created_at),
        type: "new_client",
        description: "a créé un compte client",
        user_name: c.email.split("@")[0] ?? c.email,
      })
    }
  }

  if (pros) {
    for (const p of pros) {
      items.push({
        id: `p-${p.id}`,
        time: formatTime(p.created_at),
        type: "new_pro",
        description: "a rejoint la plateforme",
        user_name: p.email.split("@")[0] ?? p.email,
      })
    }
  }

  if (missions) {
    for (const m of missions) {
      items.push({
        id: `m-${m.id}`,
        time: formatTime(m.created_at),
        type: "new_mission",
        description: `Nouvelle mission${m.category ? ` de ${m.category}` : ""}${m.estimated_price_min ? ` — ${m.estimated_price_min.toLocaleString()} F` : ""}`,
      })
    }
  }

  if (txns) {
    for (const t of txns) {
      items.push({
        id: `t-${t.id}`,
        time: formatTime(t.created_at),
        type: "new_payment",
        description: `Paiement reçu — ${t.amount.toLocaleString()} F`,
      })
    }
  }

  if (reports) {
    for (const r of reports) {
      items.push({
        id: `r-${r.id}`,
        time: formatTime(r.created_at),
        type: "new_report",
        description: `Signalement — Compte suspect`,
      })
    }
  }

  items.sort((a, b) => b.time.localeCompare(a.time))
  return items.slice(0, 20)
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

export async function getAdminProfile(): Promise<AdminUser | null> {
  if (!isSupabaseReady()) return null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: userRoles } = await supabase
      .from("user_roles" as never)
      .select("*, role:role_id(*)")
      .eq("user_id", user.id) as never
    const rows = (userRoles ?? []) as Array<{ role: { name: string; description?: string; permissions: Record<string, boolean>; is_system: boolean; id: string } }>
    const roles = rows.map((r) => r.role)
    const permissions = roles.flatMap((r) => {
      if (r.permissions?.all) return ["all"]
      return Object.entries(r.permissions ?? {})
        .filter(([, v]) => v)
        .map(([k]) => k)
    })
    return {
      id: user.id,
      email: user.email ?? "",
      firstname: user.user_metadata?.first_name ?? "",
      lastname: user.user_metadata?.last_name ?? "",
      avatar_url: user.user_metadata?.avatar_url,
      is_active: true,
      status: "active",
      last_login: user.last_sign_in_at ?? undefined,
      created_at: user.created_at,
      roles,
      permissions: [...new Set(permissions)],
    }
  } catch {
    return null
  }
}

function getMockDashboardStats(): DashboardStats {
  return {
    today: {
      total_clients: 1158,
      total_pros: 342,
      verified_pros: 198,
      missions_today: 34,
      missions_in_progress: 89,
      missions_completed: 22,
      revenue_today: 458000,
      platform_revenue: 68700,
      success_rate: 94,
      avg_response_time: 6,
    },
    trends: {
      users: { value: 1248, change: 12 },
      pros: { value: 342, change: 8 },
      revenue: { value: 458000, change: 15 },
      missions: { value: 89, change: -3 },
    },
    charts: {
      registrations: [
        { date: "8 Juin", clients: 12, pros: 3 },
        { date: "15 Juin", clients: 18, pros: 5 },
        { date: "22 Juin", clients: 15, pros: 4 },
        { date: "29 Juin", clients: 22, pros: 6 },
        { date: "6 Juil", clients: 19, pros: 3 },
      ],
      revenue: [
        { date: "Lun", amount: 120000 },
        { date: "Mar", amount: 95000 },
        { date: "Mer", amount: 140000 },
        { date: "Jeu", amount: 110000 },
        { date: "Ven", amount: 135000 },
        { date: "Sam", amount: 90000 },
        { date: "Dim", amount: 85000 },
      ],
      missions_by_category: [
        { category: "plombier", count: 45 },
        { category: "électricien", count: 38 },
        { category: "climatisation", count: 28 },
        { category: "nettoyage", count: 22 },
        { category: "peintre", count: 15 },
        { category: "jardinage", count: 10 },
      ],
      cities: [
        { city: "Cocody", count: 89 },
        { city: "Plateau", count: 67 },
        { city: "Yopougon", count: 54 },
        { city: "Abobo", count: 42 },
        { city: "Treichville", count: 31 },
        { city: "Marcory", count: 28 },
        { city: "Koumassi", count: 22 },
        { city: "Port-Bouët", count: 18 },
      ],
    },
    activity: [
      { id: "a1", time: "09:12", type: "new_pro", description: "a rejoint la plateforme", user_name: "Koffi Kouamé" },
      { id: "a2", time: "09:16", type: "new_client", description: "a créé un compte client", user_name: "Aminata Diallo" },
      { id: "a3", time: "09:18", type: "new_mission", description: "Nouvelle mission de Plombier — 25 000 F" },
      { id: "a4", time: "09:20", type: "new_payment", description: "Paiement reçu — 35 000 F" },
      { id: "a5", time: "09:25", type: "new_report", description: "Signalement #102 — Compte suspect" },
      { id: "a6", time: "08:45", type: "new_pro", description: "a été vérifié niveau 3", user_name: "Mamadou K." },
      { id: "a7", time: "08:30", type: "new_mission", description: "Nouvelle mission de nettoyage — 20 000 F" },
    ],
    alerts: [
      { type: "verification", count: 8, label: "Documents à vérifier", severity: "high", link: "/admin/verifications" },
      { type: "ticket", count: 5, label: "Tickets support ouverts", severity: "medium", link: "/admin/support" },
      { type: "report", count: 3, label: "Signalements en attente", severity: "high", link: "/admin/reports" },
      { type: "payment", count: 2, label: "Paiements en attente", severity: "low", link: "/admin/payments" },
    ],
  }
}
