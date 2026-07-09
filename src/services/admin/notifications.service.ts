import { supabase, isSupabaseReady } from "../supabase"

export interface AdminNotification {
  id: string
  type: "info" | "warning" | "promotion" | "system"
  channel: "push" | "email" | "sms"
  title: string
  content: string
  target: "all" | "clients" | "professionals" | "specific"
  target_users?: number
  sent_count: number
  failed_count: number
  status: "sent" | "pending" | "failed" | "scheduled"
  scheduled_at?: string
  sent_at?: string
  created_at: string
  created_by?: string
}

const TYPE_LABELS: Record<string, string> = {
  info: "Information",
  warning: "Alerte",
  promotion: "Promotion",
  system: "Système",
}

const CHANNEL_LABELS: Record<string, string> = {
  push: "Push",
  email: "Email",
  sms: "SMS",
}

const STATUS_LABELS: Record<string, string> = {
  sent: "Envoyée",
  pending: "En attente",
  failed: "Échouée",
  scheduled: "Planifiée",
}

export async function getAdminNotifications(params: {
  page?: number
  perPage?: number
  type?: string
  channel?: string
  status?: string
  search?: string
} = {}): Promise<{ notifications: AdminNotification[]; total: number }> {
  if (!isSupabaseReady()) return { notifications: [], total: 0 }

  const { page = 1, perPage = 20, type, status, search } = params

  let allQuery = supabase
    .from("notifications" as never)
    .select("type, title, body, channel, metadata, created_at, delivered_at, failed_at")
    .order("created_at", { ascending: false })
    .limit(500) as any

  if (type && type !== "all") allQuery = allQuery.eq("type", type)
  if (status === "sent") allQuery = allQuery.not("delivered_at", "is", null)
  if (status === "failed") allQuery = allQuery.not("failed_at", "is", null)
  if (status === "pending") allQuery = allQuery.and("delivered_at.is.null,failed_at.is.null")
  if (search) allQuery = allQuery.or(`title.ilike.%${search}%,body.ilike.%${search}%`)

  const { data } = await allQuery as any
  const rows: any[] = data ?? []

  const groups = new Map<string, { type: string; title: string; body: string; channel: string; metadata: any; rows: any[] }>()

  for (const row of rows) {
    const meta = row.metadata ?? {}
    const batchKey = meta.batch_id ?? `${row.type}-${row.title}-${row.body}`
    if (!groups.has(batchKey)) {
      groups.set(batchKey, { type: row.type, title: row.title, body: row.body, channel: row.channel, metadata: meta, rows: [] })
    }
    groups.get(batchKey)!.rows.push(row)
  }

  const grouped = Array.from(groups.entries())

  const notifications: AdminNotification[] = grouped.map(([batchKey, g], i) => {
    const allRows = g.rows
    const sentCount = allRows.filter((r: any) => r.delivered_at).length
    const failedCount = allRows.filter((r: any) => r.failed_at).length
    const pendingCount = allRows.length - sentCount - failedCount
    const firstCreated = allRows.reduce((earliest: string, r: any) => r.created_at < earliest ? r.created_at : earliest, allRows[0]?.created_at ?? "")

    let status: "sent" | "pending" | "failed" | "scheduled" = "pending"
    if (allRows.length > 0 && sentCount === allRows.length) status = "sent"
    else if (failedCount > 0 && sentCount === 0 && pendingCount === 0) status = "failed"
    else if (sentCount > 0 || failedCount > 0) status = pendingCount > 0 ? "pending" : "sent"

    const meta = g.metadata
    return {
      id: `batch-${i}-${batchKey.slice(0, 8)}`,
      type: g.type as AdminNotification["type"],
      channel: g.channel as AdminNotification["channel"],
      title: g.title,
      content: g.body,
      target: meta.target ?? "all",
      target_users: allRows.length,
      sent_count: sentCount,
      failed_count: failedCount,
      status,
      scheduled_at: meta.scheduled_at,
      sent_at: sentCount > 0 ? firstCreated : undefined,
      created_at: firstCreated,
      created_by: meta.created_by,
    }
  })

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const paginated = notifications.slice(from, to + 1)

  return { notifications: paginated, total: notifications.length }
}

export async function createAdminNotification(params: {
  type: string
  channel: string
  title: string
  content: string
  target: string
  target_user_ids?: string[]
  image_url?: string
  link_url?: string
  scheduled_at?: string
  created_by?: string
}): Promise<boolean> {
  if (!isSupabaseReady()) return false

  const batchId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

  let userQuery = supabase.from("users" as never).select("id") as any
  if (params.target === "clients") userQuery = userQuery.eq("role", "client")
  else if (params.target === "professionals") userQuery = userQuery.in("role", ["professional", "business_admin", "enterprise_admin"])
  else if (params.target === "specific" && params.target_user_ids && params.target_user_ids.length > 0) userQuery = userQuery.in("id", params.target_user_ids)

  const { data: users } = await userQuery as any
  if (!users || users.length === 0) return false

  const now = new Date().toISOString()
  const metadata = {
    batch_id: batchId,
    target: params.target,
    image_url: params.image_url,
    link_url: params.link_url,
    scheduled_at: params.scheduled_at,
    created_by: params.created_by,
  }

  const inserts = users.map((u: any) => ({
    user_id: u.id,
    type: params.type,
    title: params.title,
    body: params.content,
    channel: params.channel,
    metadata,
    created_at: now,
  }))

  const { error } = await (supabase.from("notifications" as never) as any)
    .insert(inserts)

  return !error
}

export { TYPE_LABELS as NOTIF_TYPE_LABELS, CHANNEL_LABELS as NOTIF_CHANNEL_LABELS, STATUS_LABELS as NOTIF_STATUS_LABELS }
