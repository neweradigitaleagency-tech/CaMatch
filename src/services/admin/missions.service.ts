import { supabase, isSupabaseReady } from "../supabase"

export interface Mission {
  id: string
  client_id: string
  professional_id?: string
  category: string
  sub_category?: string
  description?: string
  address: string
  status: "draft" | "pending" | "quoted" | "accepted" | "in_progress" | "completed" | "cancelled" | "disputed"
  urgency: string
  estimated_price_min?: number
  estimated_price_max?: number
  final_price?: number
  platform_fee?: number
  scheduled_at?: string
  created_at: string
  client_name?: string
  client_phone?: string
  client_email?: string
  pro_name?: string
  pro_phone?: string
  pro_email?: string
  notes?: string
  payment_status?: string
  payment_method?: string
}

export interface MissionDetail extends Mission {
  job_id?: string
  before_photos?: string[]
  after_photos?: string[]
  client_notes?: string
  pro_notes?: string
  duration_mins?: number
  job_created_at?: string
  net_amount?: number
  transaction_id?: string
}

export interface MissionTimelineEvent {
  id: string
  mission_id: string
  event: string
  description?: string
  old_status?: string
  new_status?: string
  created_by?: string
  created_by_name?: string
  created_at: string
}

export interface MissionMessage {
  id: string
  conversation_id: string
  sender_id?: string
  sender_name?: string
  sender_role?: string
  content?: string
  media_url?: string
  type: string
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  pending: "En attente",
  quoted: "Devisé",
  accepted: "Acceptée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
  disputed: "Litige",
}

export async function getMissions(params: {
  page?: number
  perPage?: number
  status?: string
  category?: string
  urgency?: string
  search?: string
} = {}): Promise<{ missions: Mission[]; total: number }> {
  if (!isSupabaseReady()) {
    return { missions: [], total: 0 }
  }
  const { page = 1, perPage = 20, status, category, urgency, search } = params
  let query = supabase
    .from("service_requests" as never)
    .select("*, client:client_id(email, phone_number), pro:professional_id(email, phone_number)", { count: "exact" }) as never

  let q: any = query
  if (status && status !== "all") q = q.eq("status", status)
  if (category) q = q.eq("category", category)
  if (urgency) q = q.eq("urgency", urgency)
  if (search) {
    q = q.or(`address.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, count, error } = await q.order("created_at", { ascending: false }).range(from, to) as any
  if (error) throw error
  return {
    missions: (data ?? []).map((m: any) => {
      const client = m.client
      const pro = m.pro
      return {
        ...m,
        client_name: client?.email?.split("@")[0] ?? "",
        client_phone: client?.phone_number ?? "",
        client_email: client?.email ?? "",
        pro_name: pro?.email?.split("@")[0] ?? "",
        pro_phone: pro?.phone_number ?? "",
        pro_email: pro?.email ?? "",
      }
    }) as Mission[],
    total: count ?? 0,
  }
}

export async function getMissionById(id: string): Promise<MissionDetail | null> {
  if (!isSupabaseReady()) return null

  const { data: sr, error } = await supabase
    .from("service_requests" as never)
    .select("*, client:client_id(email, phone_number), pro:professional_id(email, phone_number)")
    .eq("id", id)
    .single() as any

  if (error) return null
  if (!sr) return null

  const client = sr.client
  const pro = sr.pro

  const mission: MissionDetail = {
    ...sr,
    client_name: client?.email?.split("@")[0] ?? "",
    client_phone: client?.phone_number ?? "",
    client_email: client?.email ?? "",
    pro_name: pro?.email?.split("@")[0] ?? "",
    pro_phone: pro?.phone_number ?? "",
    pro_email: pro?.email ?? "",
  }

  const { data: jobs } = await supabase
    .from("jobs" as never)
    .select("*")
    .eq("request_id", id)
    .maybeSingle() as any

  if (jobs) {
    mission.job_id = jobs.id
    mission.before_photos = jobs.before_photos ?? []
    mission.after_photos = jobs.after_photos ?? []
    mission.client_notes = jobs.client_notes
    mission.pro_notes = jobs.pro_notes
    mission.duration_mins = jobs.duration_mins
    mission.job_created_at = jobs.created_at

    const { data: txn } = await supabase
      .from("transactions" as never)
      .select("*")
      .eq("job_id", jobs.id)
      .maybeSingle() as any

    if (txn) {
      mission.payment_status = txn.status
      mission.payment_method = txn.payment_method
      mission.platform_fee = txn.platform_fee
      mission.net_amount = txn.net_amount
      mission.transaction_id = txn.id
    }

    if (!mission.payment_method) {
      const { data: pi } = await supabase
        .from("payment_intents" as never)
        .select("method, status")
        .eq("job_id", jobs.id)
        .maybeSingle() as any
      if (pi) {
        mission.payment_method = pi.method
        mission.payment_status ??= pi.status
      }
    }
  }

  return mission
}

export async function getMissionTimeline(jobId: string): Promise<MissionTimelineEvent[]> {
  if (!isSupabaseReady()) return []

  const { data, error } = await supabase
    .from("mission_timeline" as never)
    .select("*")
    .eq("mission_id", jobId)
    .order("created_at", { ascending: true }) as any

  if (error) return []
  return (data ?? []).map((e: any) => ({
    id: e.id,
    mission_id: e.mission_id,
    event: e.event,
    description: e.description,
    old_status: e.old_status,
    new_status: e.new_status,
    created_by: e.created_by,
    created_at: e.created_at,
  }))
}

export async function getMissionConversation(jobId: string): Promise<MissionMessage[]> {
  if (!isSupabaseReady()) return []

  const { data: convs, error: convErr } = await supabase
    .from("conversations" as never)
    .select("id, participant_1, participant_2")
    .eq("job_id", jobId)
    .maybeSingle() as any

  if (convErr || !convs) return []

  const { data: msgs, error: msgErr } = await supabase
    .from("messages" as never)
    .select("*, sender:sender_id(email)")
    .eq("conversation_id", convs.id)
    .order("created_at", { ascending: true })
    .limit(200) as any

  if (msgErr) return []

  const participantIds = [convs.participant_1, convs.participant_2]

  return (msgs ?? []).map((msg: any) => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    sender_name: msg.sender?.email?.split("@")[0] ?? "",
    content: msg.content,
    media_url: msg.media_url,
    type: msg.type ?? "text",
    sender_role: msg.sender_id === convs.participant_1 ? "client" : "pro",
    created_at: msg.created_at,
  }))
}

export { STATUS_LABELS as MISSION_STATUS_LABELS }
