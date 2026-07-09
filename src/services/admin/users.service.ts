import { supabase, isSupabaseReady } from "../supabase"
import type { UserProfile } from "../../types/admin"

export async function getUsers(params: {
  page?: number
  perPage?: number
  search?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
} = {}): Promise<{ users: UserProfile[]; total: number }> {
  if (!isSupabaseReady()) {
    return { users: [], total: 0 }
  }
  const { page = 1, perPage = 20, search, role, status } = params
  let query = supabase
    .from("users" as never)
    .select("*, client_profile:client_profiles(*), professional_profile:professional_profiles(*)", { count: "exact" }) as never

  let q: any = query
  if (role) q = q.eq("role", role)
  if (status === "active") q = q.eq("is_active", true)
  if (status === "inactive") q = q.eq("is_active", false)
  if (search) {
    q = q.or(`email.ilike.%${search}%,phone_number.ilike.%${search}%`)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, count, error } = await q.order("created_at", { ascending: false }).range(from, to) as any
  if (error) throw error
  return { users: (data ?? []) as UserProfile[], total: count ?? 0 }
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  if (!isSupabaseReady()) return null
  const { data } = await supabase
    .from("users" as never)
    .select("*, client_profile:client_profiles(*), professional_profile:professional_profiles(*)")
    .eq("id", id)
    .single() as any
  return data as UserProfile | null
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<void> {
  if (!isSupabaseReady()) return
  const { error } = await supabase
    .from("users" as never)
    .update({ is_active: isActive } as never)
    .eq("id", userId) as any
  if (error) throw error
}
