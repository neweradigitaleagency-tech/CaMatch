import { supabase, isSupabaseReady } from "../supabase"

export interface TrustScore {
  overall: number
  kyc: number
  activity: number
  payment_reliability: number
  fraud_flags: number
  fraud_score: number
  last_assessed: string
}

export interface ProProfile {
  user_id: string
  business_name?: string
  first_name: string
  last_name: string
  categories: string[]
  sub_categories?: string[]
  bio?: string
  city?: string
  commune?: string
  hourly_rate?: number
  wallet_balance?: number
  acceptance_rate?: number
  response_time_avg?: number
  cancellation_rate?: number
  verification_level: string
  rating: number
  total_jobs: number
  total_earned: number
  is_verified: boolean
  is_available: boolean
  is_online: boolean
  created_at: string
  email?: string
  phone_number?: string
  trust_score?: TrustScore
}

export async function getPros(params: {
  page?: number
  perPage?: number
  search?: string
  category?: string
  verificationLevel?: string
  sortBy?: string
} = {}): Promise<{ pros: ProProfile[]; total: number }> {
  if (!isSupabaseReady()) {
    return { pros: [], total: 0 }
  }
  const { page = 1, perPage = 20, search, category, verificationLevel } = params
  let query = supabase
    .from("professional_profiles" as never)
    .select("*, user:user_id(email, phone_number)", { count: "exact" }) as never

  let q: any = query
  if (category) q = q.contains("categories", [category])
  if (verificationLevel) q = q.eq("verification_level", verificationLevel)
  if (search) {
    q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,business_name.ilike.%${search}%`)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, count, error } = await q.order("created_at", { ascending: false }).range(from, to) as any
  if (error) throw error
  return {
    pros: (data ?? []).map((p: any) => ({
      ...p,
      email: p.user?.email ?? "",
      phone_number: p.user?.phone_number ?? "",
    })) as ProProfile[],
    total: count ?? 0,
  }
}

export async function getProById(id: string): Promise<ProProfile | null> {
  if (!isSupabaseReady()) return null
  const { data } = await supabase
    .from("professional_profiles" as never)
    .select("*, user:user_id(email, phone_number)")
    .eq("user_id", id)
    .single() as any
  if (!data) return null
  return { ...data, email: data.user?.email ?? "", phone_number: data.user?.phone_number ?? "" } as ProProfile
}

export async function verifyPro(proId: string, verified: boolean): Promise<void> {
  if (!isSupabaseReady()) return
  const { error } = await supabase
    .from("professional_profiles" as never)
    .update({ is_verified: verified, verified_at: verified ? new Date().toISOString() : null } as never)
    .eq("user_id", proId) as any
  if (error) throw error
}
