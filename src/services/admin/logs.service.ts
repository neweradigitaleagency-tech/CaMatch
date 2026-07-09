import { supabase, isSupabaseReady } from "../supabase"

export interface AdminLogEntry {
  id: string
  admin_id: string
  admin_name: string
  action: string
  target_type: string
  target_id: string
  target_name?: string
  details: string
  ip_address: string
  created_at: string
}

const ACTION_LABELS: Record<string, string> = {
  user_login: "Connexion admin",
  user_logout: "Déconnexion",
  user_view: "Consultation profil",
  user_suspend: "Suspension compte",
  user_reactivate: "Réactivation compte",
  user_ban: "Bannissement",
  user_delete: "Suppression compte",
  pro_verify: "Vérification pro",
  pro_reject: "Rejet vérification",
  mission_view: "Consultation mission",
  mission_cancel: "Annulation mission",
  payment_refund: "Remboursement",
  payout_approve: "Approbation virement",
  support_reply: "Réponse ticket",
  support_close: "Fermeture ticket",
  report_resolve: "Résolution signalement",
  report_dismiss: "Signalement ignoré",
  notification_send: "Envoi notification",
  settings_update: "Modification paramètres",
  admin_create: "Création admin",
  admin_update: "Modification admin",
}

export async function getAdminLogs(params: {
  page?: number
  perPage?: number
  action?: string
  admin_id?: string
  target_type?: string
  search?: string
} = {}): Promise<{ logs: AdminLogEntry[]; total: number }> {
  if (!isSupabaseReady()) return { logs: [], total: 0 }
  try {
    const perPage = Math.min(params.perPage ?? 50, 500)
    const page = params.page ?? 1

    let query = (supabase as any)
      .from("audit_logs")
      .select("*, users:user_id(email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (params.action) query = query.eq("action", params.action)
    if (params.admin_id) query = query.eq("user_id", params.admin_id)
    if (params.target_type) query = query.eq("entity_type", params.target_type)

    const { data, count, error } = await query
    if (error) return { logs: [], total: 0 }

    const raw = (data ?? []) as any[]
    let logs: AdminLogEntry[] = raw.map((row) => ({
      id: row.id,
      admin_id: row.user_id ?? "",
      admin_name: row.users?.email?.split("@")[0] ?? row.user_id?.slice(0, 8) ?? "",
      action: row.action,
      target_type: row.entity_type,
      target_id: row.entity_id ?? "",
      target_name: row.metadata?.target_name as string | undefined,
      details: formatDetails(row),
      ip_address: String(row.ip_address ?? ""),
      created_at: row.created_at ?? new Date().toISOString(),
    }))

    if (params.search) {
      const s = params.search.toLowerCase()
      logs = logs.filter(
        (l) =>
          l.admin_name.toLowerCase().includes(s) ||
          l.details.toLowerCase().includes(s) ||
          l.action.toLowerCase().includes(s) ||
          l.target_type.toLowerCase().includes(s),
      )
    }

    return { logs, total: count ?? logs.length }
  } catch {
    return { logs: [], total: 0 }
  }
}

function formatDetails(row: any): string {
  if (row.metadata?.description) return row.metadata.description
  if (row.new_values) {
    const vals = typeof row.new_values === "object" ? row.new_values : {}
    const entries = Object.entries(vals)
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v}`)
    return entries.length > 0 ? `Modification: ${entries.join(", ")}` : `Action ${row.action}`
  }
  return `Action ${row.action} sur ${row.entity_type} ${row.entity_id ?? ""}`
}

export { ACTION_LABELS as LOG_ACTION_LABELS }
