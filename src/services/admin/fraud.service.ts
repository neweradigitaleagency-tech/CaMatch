import { supabase, isSupabaseReady } from "../supabase"

export interface FraudAlert {
  id: string
  type: string
  target_type: string
  target_id: string
  target_name: string
  score: number
  description: string | null
  metadata: Record<string, unknown> | null
  status: string
  reviewed_by: string | null
  reviewer_name: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

const TYPE_LABELS: Record<string, string> = {
  suspicious_login: "Connexion suspecte",
  multiple_accounts: "Comptes multiples",
  fake_documents: "Faux documents",
  payment_fraud: "Fraude paiement",
  review_manipulation: "Manipulation d'avis",
  other: "Autre",
}

const STATUS_MAP: Record<string, string> = {
  pending: "pending",
  approved: "active",
  active: "active",
  completed: "completed",
  rejected: "rejected",
  cancelled: "cancelled",
}

const MOCK_ALERTS: FraudAlert[] = [
  { id: "f1", type: "suspicious_login", target_type: "user", target_id: "u1", target_name: "Kouamé", score: 85, description: "Tentative de connexion depuis une IP inconnue (Nigeria)", metadata: null, status: "pending", reviewed_by: null, reviewer_name: null, resolved_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "f2", type: "multiple_accounts", target_type: "professional", target_id: "p1", target_name: "Koné", score: 92, description: "3 comptes pro détectés avec le même numéro de téléphone", metadata: null, status: "pending", reviewed_by: null, reviewer_name: null, resolved_at: null, created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "f3", type: "fake_documents", target_type: "professional", target_id: "p2", target_name: "Diallo", score: 78, description: "Document d'identité suspect", metadata: null, status: "active", reviewed_by: "admin1", reviewer_name: "Admin", resolved_at: null, created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date(Date.now() - 172800000).toISOString() },
  { id: "f4", type: "payment_fraud", target_type: "transaction", target_id: "t1", target_name: "Transaction a1b2c3d4", score: 95, description: "Paiement annulé après livraison", metadata: null, status: "completed", reviewed_by: "admin1", reviewer_name: "Admin", resolved_at: new Date(Date.now() - 259200000).toISOString(), created_at: new Date(Date.now() - 345600000).toISOString(), updated_at: new Date(Date.now() - 259200000).toISOString() },
  { id: "f5", type: "review_manipulation", target_type: "review", target_id: "r1", target_name: "Avis 5/5", score: 45, description: "Avis suspect avec plusieurs comptes", metadata: null, status: "rejected", reviewed_by: "admin1", reviewer_name: "Admin", resolved_at: new Date(Date.now() - 432000000).toISOString(), created_at: new Date(Date.now() - 518400000).toISOString(), updated_at: new Date(Date.now() - 432000000).toISOString() },
]

function getMockAlerts(params: { status?: string; type?: string; search?: string } = {}): FraudAlert[] {
  let result = [...MOCK_ALERTS]
  if (params.status && params.status !== "all") result = result.filter((a) => a.status === params.status)
  if (params.type && params.type !== "all") result = result.filter((a) => a.type === params.type)
  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter((a) => a.target_name.toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q))
  }
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

async function resolveTargetNames(alerts: any[]): Promise<Map<string, string>> {
  const nameMap = new Map<string, string>()
  const userIds = new Set<string>()
  const proIds = new Set<string>()
  const txnIds = new Set<string>()
  const reviewIds = new Set<string>()

  for (const a of alerts) {
    if (a.target_type === "user") userIds.add(a.target_id)
    else if (a.target_type === "professional") proIds.add(a.target_id)
    else if (a.target_type === "transaction") txnIds.add(a.target_id)
    else if (a.target_type === "review") reviewIds.add(a.target_id)
  }

  if (userIds.size > 0) {
    const { data: users } = await supabase.from("users" as never).select("id, email").in("id", [...userIds]) as any
    if (users) for (const u of users) nameMap.set(u.id, u.email?.split("@")[0] ?? u.email ?? "Utilisateur")
  }

  if (proIds.size > 0) {
    const { data: pros } = await supabase.from("professional_profiles" as never).select("user_id, business_name, first_name, last_name").in("user_id", [...proIds]) as any
    if (pros) for (const p of pros) nameMap.set(p.user_id, p.business_name ?? `${p.first_name} ${p.last_name}`)
  }

  if (txnIds.size > 0) {
    const { data: txns } = await supabase.from("transactions" as never).select("id, job_id, amount").in("id", [...txnIds]) as any
    if (txns) for (const t of txns) nameMap.set(t.id, `Transaction ${t.job_id?.slice(0, 8) ?? t.id.slice(0, 8)}`)
  }

  if (reviewIds.size > 0) {
    const { data: reviews } = await supabase.from("reviews" as never).select("id, rating, comment").in("id", [...reviewIds]) as any
    if (reviews) for (const r of reviews) nameMap.set(r.id, `Avis ${r.rating}/5${r.comment ? ` : ${r.comment.slice(0, 30)}` : ""}`)
  }

  return nameMap
}

export async function getFraudAlerts(params: {
  status?: string
  type?: string
  search?: string
} = {}): Promise<{ alerts: FraudAlert[]; total: number }> {
  if (!isSupabaseReady()) {
    const filtered = getMockAlerts(params)
    return { alerts: filtered, total: filtered.length }
  }

  try {
    const { status, type, search } = params
    let query = supabase
      .from("fraud_alerts" as never)
      .select("*, reviewer:reviewed_by(firstname, lastname)", { count: "exact" }) as never

    let q: any = query
    if (status && status !== "all") {
      const dbStatus = STATUS_MAP[status] ?? status
      q = q.eq("status", dbStatus)
    }
    if (type && type !== "all") q = q.eq("type", type)
    if (search) q = q.or(`description.ilike.%${search}%,id.ilike.%${search}%`)

    const { data, count } = await q.order("created_at", { ascending: false }) as any

    const rawAlerts: any[] = data ?? []
    const nameMap = await resolveTargetNames(rawAlerts)

    return {
      alerts: rawAlerts.map((a: any) => ({
        id: a.id,
        type: a.type,
        target_type: a.target_type,
        target_id: a.target_id,
        target_name: nameMap.get(a.target_id) ?? a.target_id.slice(0, 8),
        score: a.score,
        description: a.description,
        metadata: a.metadata,
        status: a.status,
        reviewed_by: a.reviewed_by,
        reviewer_name: a.reviewer ? `${a.reviewer.firstname} ${a.reviewer.lastname}` : null,
        resolved_at: a.resolved_at,
        created_at: a.created_at,
        updated_at: a.updated_at,
      })) as FraudAlert[],
      total: count ?? 0,
    }
  } catch {
    const filtered = getMockAlerts(params)
    return { alerts: filtered, total: filtered.length }
  }
}

export async function getFraudAlertStats(): Promise<{
  total: number
  open: number
  investigating: number
  resolved: number
  avgScore: number
}> {
  if (!isSupabaseReady()) return computeStats(getMockAlerts())
  try {
    const { data: stats } = await supabase
      .from("fraud_alerts" as never)
      .select("status, score")
      .order("created_at", { ascending: false }) as any
    return computeStats(stats ?? [])
  } catch {
    return computeStats(getMockAlerts())
  }
}

function computeStats(alerts: any[]): { total: number; open: number; investigating: number; resolved: number; avgScore: number } {
  const total = alerts.length
  let open = 0, investigating = 0, resolved = 0, scoreSum = 0
  for (const a of alerts) {
    if (a.status === "pending") open++
    else if (a.status === "active") investigating++
    else if (a.status === "completed" || a.status === "rejected") resolved++
    scoreSum += a.score ?? 0
  }
  return { total, open, investigating, resolved, avgScore: total > 0 ? Math.round(scoreSum / total) : 0 }
}

export async function updateFraudAlertStatus(alertId: string, status: string, reviewedBy: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const update: any = { status, reviewed_by: reviewedBy }
  if (status === "completed" || status === "rejected") update.resolved_at = new Date().toISOString()
  const { error } = await (supabase.from("fraud_alerts" as never) as any).update(update).eq("id", alertId)
  return !error
}

export { TYPE_LABELS as FRAUD_TYPE_LABELS }
