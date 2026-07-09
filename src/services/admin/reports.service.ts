import { supabase, isSupabaseReady } from "../supabase"
import { subDays } from "date-fns"

export interface Report {
  id: string
  reporter_id: string
  reporter_name?: string
  reported_user_id: string
  reported_user_name?: string
  reported_user_type: "client" | "professional"
  reason: string
  description: string
  status: string
  severity: "low" | "medium" | "high" | "critical"
  created_at: string
  resolved_at?: string
  admin_id?: string
  admin_name?: string
  resolution_note?: string
  evidence_urls?: string[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  active: "En cours",
  completed: "Résolu",
  rejected: "Ignoré",
}

const SEVERITY_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  critical: "Critique",
}

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  fake: "Faux profil",
  scam: "Fraude / Arnaque",
  harassment: "Harcèlement",
  inappropriate: "Contenu inapproprié",
  bad_service: "Service non conforme",
  other: "Autre",
}

const SEVERITY_MAP: Record<string, string> = {
  spam: "low",
  fake: "medium",
  scam: "critical",
  harassment: "high",
  inappropriate: "medium",
  bad_service: "low",
  other: "medium",
}

const UI_STATUS_MAP: Record<string, string> = {
  pending: "pending",
  in_review: "active",
  resolved: "completed",
  dismissed: "rejected",
}

const MOCK_REPORTS: Report[] = [
  { id: "rep_1", reporter_id: "user_1", reporter_name: "Aminata", reported_user_id: "pro_1", reported_user_name: "Mamadou Sylla", reported_user_type: "professional", reason: "scam", description: "Ce professionnel m'a demandé un paiement en avance et n'est jamais venu.", status: "pending", severity: "critical", created_at: subDays(new Date(), 0).toISOString(), evidence_urls: [] },
  { id: "rep_2", reporter_id: "user_2", reporter_name: "Koffi", reported_user_id: "pro_2", reported_user_name: "Fatou Sissoko", reported_user_type: "professional", reason: "bad_service", description: "Travail non conforme à la description. La peinture est mal faite.", status: "active", severity: "medium", created_at: subDays(new Date(), 2).toISOString(), admin_id: "admin_1", admin_name: "Admin", resolution_note: "En cours d'investigation", evidence_urls: [] },
  { id: "rep_3", reporter_id: "pro_3", reporter_name: "Drissa", reported_user_id: "user_3", reported_user_name: "Mariam Bamba", reported_user_type: "client", reason: "harassment", description: "La cliente m'a insulté après la prestation.", status: "completed", severity: "high", created_at: subDays(new Date(), 7).toISOString(), resolved_at: subDays(new Date(), 5).toISOString(), admin_id: "admin_1", admin_name: "Admin", resolution_note: "Avertissement envoyé à la cliente", evidence_urls: [] },
  { id: "rep_4", reporter_id: "user_4", reporter_name: "Ousmane", reported_user_id: "pro_4", reported_user_name: "Kadiatou Doumbia", reported_user_type: "professional", reason: "spam", description: "Cette utilisatrice envoie des messages non sollicités.", status: "rejected", severity: "low", created_at: subDays(new Date(), 14).toISOString(), resolved_at: subDays(new Date(), 12).toISOString(), admin_id: "admin_1", admin_name: "Admin", resolution_note: "Fausse alerte", evidence_urls: [] },
  { id: "rep_5", reporter_id: "user_5", reporter_name: "Adjoua", reported_user_id: "pro_5", reported_user_name: "Yao Cissé", reported_user_type: "professional", reason: "fake", description: "Ce profil utilise des photos qui ne lui appartiennent pas.", status: "pending", severity: "medium", created_at: subDays(new Date(), 1).toISOString(), evidence_urls: ["https://example.com/evidence1.jpg"] },
]

function getMockReports(params: { status?: string; reason?: string; search?: string } = {}): Report[] {
  let result = [...MOCK_REPORTS]
  if (params.status && params.status !== "all") {
    const dbStatus = UI_STATUS_MAP[params.status] ?? params.status
    result = result.filter((r) => r.status === dbStatus)
  }
  if (params.reason) result = result.filter((r) => r.reason === params.reason)
  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter((r) => r.reporter_name?.toLowerCase().includes(q) || r.reported_user_name?.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
  }
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getReports(params: {
  page?: number
  perPage?: number
  status?: string
  severity?: string
  reason?: string
  search?: string
} = {}): Promise<{ reports: Report[]; total: number }> {
  if (!isSupabaseReady()) {
    const filtered = getMockReports({ status: params.status, reason: params.reason, search: params.search })
    return { reports: filtered, total: filtered.length }
  }

  const { page = 1, perPage = 20, status, reason, search } = params
  let query = supabase
    .from("reports" as never)
    .select("*, reporter:reporter_id(email, role), reported:reported_id(email, role), reviewer:reviewed_by(firstname, lastname)", { count: "exact" }) as never

  let q: any = query
  if (status && status !== "all") q = q.eq("status", UI_STATUS_MAP[status] ?? status)
  if (reason) q = q.eq("reason", reason)
  if (search) {
    q = q.or(`description.ilike.%${search}%,reporter.email.ilike.%${search}%,reported.email.ilike.%${search}%`)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, count, error } = await q.order("created_at", { ascending: false }).range(from, to) as any
  if (error) {
    const filtered = getMockReports({ status: params.status, reason: params.reason, search: params.search })
    return { reports: filtered, total: filtered.length }
  }

  return {
    reports: (data ?? []).map((r: any) => {
      const reporterRole: string = r.reporter?.role ?? "client"
      const reportedRole: string = r.reported?.role ?? "client"
      return {
        id: r.id,
        reporter_id: r.reporter_id,
        reporter_name: r.reporter?.email?.split("@")[0] ?? "",
        reported_user_id: r.reported_id,
        reported_user_name: r.reported?.email?.split("@")[0] ?? "",
        reported_user_type: (reportedRole === "client" ? "client" : "professional") as "client" | "professional",
        reason: r.reason,
        description: r.description ?? "",
        status: r.status,
        severity: SEVERITY_MAP[r.reason] ?? "medium",
        created_at: r.created_at,
        resolved_at: r.resolved_at,
        admin_id: r.reviewed_by,
        admin_name: r.reviewer ? `${r.reviewer.firstname} ${r.reviewer.lastname}` : undefined,
        resolution_note: r.resolution,
        evidence_urls: r.evidence_urls ?? [],
      } as Report
    }),
    total: count ?? 0,
  }
}

export async function resolveReport(reportId: string, resolution: string = ""): Promise<boolean> {
  if (!isSupabaseReady()) return true
  const { error } = await (supabase.from("reports" as never) as any)
    .update({
      status: "completed",
      resolution,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId)
  return !error
}

export async function dismissReport(reportId: string, resolution: string = ""): Promise<boolean> {
  if (!isSupabaseReady()) return true
  const { error } = await (supabase.from("reports" as never) as any)
    .update({
      status: "rejected",
      resolution,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId)
  return !error
}

export { STATUS_LABELS as REPORT_STATUS_LABELS, SEVERITY_LABELS as REPORT_SEVERITY_LABELS, REASON_LABELS as REPORT_REASON_LABELS }
