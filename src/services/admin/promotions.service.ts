import { supabase, isSupabaseReady } from "../supabase"

export interface PromotionRow {
  id: string
  code: string
  type: string
  value: number
  min_order_amount: number | null
  max_discount: number | null
  max_uses: number | null
  current_uses: number
  target: string
  is_active: boolean
  description: string | null
  starts_at: string
  expires_at: string | null
  created_at: string
  created_by: string | null
}

export async function getPromotions(): Promise<PromotionRow[]> {
  if (!isSupabaseReady()) return []
  try {
    const { data } = await (supabase as any)
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false })

    return ((data as any[]) ?? []).map((p: any) => ({
      id: p.id,
      code: p.code,
      type: p.type,
      value: p.value,
      min_order_amount: p.min_order_amount ?? null,
      max_discount: p.max_discount ?? null,
      max_uses: p.max_uses ?? null,
      current_uses: p.current_uses ?? 0,
      target: p.target ?? "all",
      is_active: p.is_active ?? true,
      description: p.description ?? null,
      starts_at: p.starts_at ?? "",
      expires_at: p.expires_at ?? null,
      created_at: p.created_at ?? "",
      created_by: p.created_by ?? null,
    }))
  } catch {
    return []
  }
}

export async function createPromotion(data: {
  code: string
  type: string
  value: number
  min_order_amount?: number
  max_discount?: number
  max_uses?: number
  target?: string
  description?: string
  starts_at: string
  expires_at?: string
}): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase as any).from("promotions").insert({
    code: data.code,
    type: data.type,
    value: data.value,
    min_order_amount: data.min_order_amount ?? 0,
    max_discount: data.max_discount ?? null,
    max_uses: data.max_uses ?? null,
    current_uses: 0,
    target: data.target ?? "all",
    description: data.description ?? null,
    is_active: true,
    starts_at: data.starts_at,
    expires_at: data.expires_at ?? null,
  })
  return !error
}

export async function updatePromotion(
  id: string,
  data: { code?: string; is_active?: boolean },
): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase as any).from("promotions").update(data).eq("id", id)
  return !error
}

export async function deletePromotion(id: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase as any).from("promotions").delete().eq("id", id)
  return !error
}
