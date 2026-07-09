import { supabase, isSupabaseReady } from "../supabase"
import { subDays } from "date-fns"

export interface SupportTicket {
  id: string
  subject: string
  description: string
  status: string
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  client_id: string
  client_name?: string
  client_phone?: string
  client_email?: string
  admin_id?: string
  admin_name?: string
  message_count: number
  last_reply_at?: string
  created_at: string
  updated_at: string
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  sender_name: string
  content: string
  file_urls?: string[]
  is_internal_note: boolean
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Ouvert",
  active: "En cours",
  completed: "Résolu",
  cancelled: "Fermé",
}

const PRIORITY_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
}

const CATEGORY_LABELS: Record<string, string> = {
  account: "Compte",
  payment: "Paiement",
  mission: "Mission",
  dispute: "Litige",
  technical: "Technique",
  verification: "Vérification",
  other: "Autre",
  bug: "Bug",
  premium: "Premium",
}

const UI_STATUS_MAP: Record<string, string> = {
  open: "pending",
  in_progress: "active",
  resolved: "completed",
  closed: "cancelled",
}

const MOCK_TICKETS: SupportTicket[] = [
  { id: "TKT-001", subject: "Problème de paiement Wave", description: "J'ai effectué un paiement Wave mais la transaction n'apparaît pas sur mon compte.", status: "pending", priority: "high", category: "payment", client_id: "user_1", client_name: "Aminata Diallo", client_phone: "+225 07 1234 567", client_email: "aminata@email.com", message_count: 2, created_at: subDays(new Date(), 0).toISOString(), updated_at: subDays(new Date(), 0).toISOString() },
  { id: "TKT-002", subject: "Demande de remboursement", description: "Je souhaite être remboursé pour une mission annulée.", status: "active", priority: "medium", category: "dispute", client_id: "user_2", client_name: "Koffi Kouamé", client_phone: "+225 07 2345 678", client_email: "koffi@email.com", message_count: 4, admin_id: "admin_1", admin_name: "Admin", created_at: subDays(new Date(), 1).toISOString(), updated_at: subDays(new Date(), 0).toISOString() },
  { id: "TKT-003", subject: "Vérification de profil bloquée", description: "Ma pièce d'identité a été rejetée sans explication.", status: "pending", priority: "urgent", category: "verification", client_id: "user_3", client_name: "Fatou Ndiaye", client_phone: "+225 07 3456 789", client_email: "fatou@email.com", message_count: 1, created_at: subDays(new Date(), 2).toISOString(), updated_at: subDays(new Date(), 2).toISOString() },
  { id: "TKT-004", subject: "Bug application mobile", description: "L'application crash quand j'essaie de télécharger une photo.", status: "completed", priority: "low", category: "bug", client_id: "user_4", client_name: "Mamadou Touré", client_phone: "+225 07 4567 890", client_email: "mamadou@email.com", message_count: 5, admin_id: "admin_1", admin_name: "Admin", created_at: subDays(new Date(), 5).toISOString(), updated_at: subDays(new Date(), 3).toISOString(), last_reply_at: subDays(new Date(), 3).toISOString() },
  { id: "TKT-005", subject: "Question sur abonnement Premium", description: "Quels sont les avantages de l'abonnement Premium par rapport au plan Plus ?", status: "cancelled", priority: "low", category: "premium", client_id: "user_5", client_name: "Adjoua Konan", client_phone: "+225 07 5678 901", client_email: "adjoua@email.com", message_count: 3, admin_id: "admin_1", admin_name: "Admin", created_at: subDays(new Date(), 10).toISOString(), updated_at: subDays(new Date(), 8).toISOString(), last_reply_at: subDays(new Date(), 8).toISOString() },
  { id: "TKT-006", subject: "Changement de formule", description: "Je veux passer de Free à Plus mais la page de paiement ne charge pas.", status: "active", priority: "high", category: "technical", client_id: "user_6", client_name: "Ousmane Sarr", client_phone: "+225 07 6789 012", client_email: "ousmane@email.com", message_count: 3, admin_id: "admin_1", admin_name: "Admin", created_at: subDays(new Date(), 1).toISOString(), updated_at: subDays(new Date(), 1).toISOString() },
]

function getMockTickets(params: { status?: string; priority?: string; category?: string; search?: string } = {}): SupportTicket[] {
  let result = [...MOCK_TICKETS]
  if (params.status && params.status !== "all") {
    const dbStatus = UI_STATUS_MAP[params.status] ?? params.status
    result = result.filter((t) => t.status === dbStatus)
  }
  if (params.priority) result = result.filter((t) => t.priority === params.priority)
  if (params.category) result = result.filter((t) => t.category === params.category)
  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter((t) => t.subject.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.client_name?.toLowerCase().includes(q))
  }
  return result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
}

export async function getSupportTickets(params: {
  page?: number
  perPage?: number
  status?: string
  priority?: string
  category?: string
  search?: string
} = {}): Promise<{ tickets: SupportTicket[]; total: number }> {
  if (!isSupabaseReady()) {
    const filtered = getMockTickets({ status: params.status, priority: params.priority, category: params.category, search: params.search })
    return { tickets: filtered, total: filtered.length }
  }
  const { page = 1, perPage = 20, status, priority, category, search } = params
  let query = supabase
    .from("support_tickets" as never)
    .select("*, client:client_id(email, phone_number), admin:assigned_to(firstname, lastname)", { count: "exact" }) as never

  let q: any = query
  if (status && status !== "all") q = q.eq("status", UI_STATUS_MAP[status] ?? status)
  if (priority) q = q.eq("priority", priority)
  if (category) q = q.eq("category", category)
  if (search) {
    q = q.or(`subject.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, count, error } = await q.order("updated_at", { ascending: false }).range(from, to) as any
  if (error) {
    const filtered = getMockTickets({ status: params.status, priority: params.priority, category: params.category, search: params.search })
    return { tickets: filtered, total: filtered.length }
  }

  const { data: msgCounts } = await supabase
    .from("ticket_messages" as never)
    .select("ticket_id") as any

  const countMap: Record<string, number> = {}
  if (msgCounts) {
    for (const m of msgCounts) {
      countMap[m.ticket_id] = (countMap[m.ticket_id] ?? 0) + 1
    }
  }

  return {
    tickets: (data ?? []).map((t: any) => ({
      id: t.id,
      subject: t.subject,
      description: t.description,
      status: t.status,
      priority: t.priority,
      category: t.category,
      client_id: t.client_id,
      client_name: t.client?.email?.split("@")[0] ?? "",
      client_phone: t.client?.phone_number ?? "",
      client_email: t.client?.email ?? "",
      admin_id: t.assigned_to,
      admin_name: t.admin ? `${t.admin.firstname} ${t.admin.lastname}` : undefined,
      message_count: countMap[t.id] ?? 0,
      last_reply_at: t.first_response_at ?? undefined,
      created_at: t.created_at,
      updated_at: t.updated_at,
    })) as SupportTicket[],
    total: count ?? 0,
  }
}

export async function getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
  if (!isSupabaseReady()) return []

  const { data, error } = await supabase
    .from("ticket_messages" as never)
    .select("*, sender:sender_id(email)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true }) as any

  if (error) return []
  return (data ?? []).map((m: any) => ({
    id: m.id,
    ticket_id: m.ticket_id,
    sender_id: m.sender_id,
    sender_name: m.sender?.email?.split("@")[0] ?? "",
    content: m.content,
    file_urls: m.file_urls ?? [],
    is_internal_note: m.is_internal_note ?? false,
    created_at: m.created_at,
  }))
}

export async function addTicketMessage(
  ticketId: string,
  senderId: string,
  content: string,
  isInternalNote: boolean = false
): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase.from("ticket_messages" as never) as any)
    .insert({
      ticket_id: ticketId,
      sender_id: senderId,
      content,
      is_internal_note: isInternalNote,
      file_urls: [],
    })
  return !error
}

export async function updateTicketStatus(ticketId: string, status: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const dbStatus = UI_STATUS_MAP[status] ?? status
  const payload: any = { status: dbStatus }
  if (dbStatus === "completed") payload.resolved_at = new Date().toISOString()

  const { error } = await (supabase.from("support_tickets" as never) as any)
    .update(payload)
    .eq("id", ticketId)
  return !error
}

export async function assignTicket(ticketId: string, adminId: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase.from("support_tickets" as never) as any)
    .update({ assigned_to: adminId })
    .eq("id", ticketId)
  return !error
}

export { STATUS_LABELS as SUPPORT_STATUS_LABELS, PRIORITY_LABELS as SUPPORT_PRIORITY_LABELS, CATEGORY_LABELS as SUPPORT_CATEGORY_LABELS }
