import { supabase, isSupabaseReady } from "./supabase"
import type { Coupon } from "../types/subscription"
import { validateCoupon } from "./subscriptionService"

export { validateCoupon } from "./subscriptionService"

export async function fetchCoupons(): Promise<Coupon[]> {
  if (!isSupabaseReady()) {
    return [
      { id: "c1", code: "WELCOME20", type: "percentage", value: 20, max_usage: 100, current_usage: 5, min_plan_type: null, expires_at: null, is_active: true, created_at: new Date().toISOString() },
      { id: "c2", code: "FREE100", type: "fixed", value: 10000, max_usage: 50, current_usage: 10, min_plan_type: null, expires_at: null, is_active: true, created_at: new Date().toISOString() },
      { id: "c3", code: "PROTRIAL", type: "free_month", value: 1, max_usage: 200, current_usage: 25, min_plan_type: "PRO", expires_at: null, is_active: true, created_at: new Date().toISOString() },
    ]
  }
  const { data, error } = await supabase!.from("coupons" as never).select("*").order("created_at" as never, { ascending: false }) as any
  if (error) throw error
  return (data ?? []) as Coupon[]
}

export async function createCoupon(input: Omit<Coupon, "id" | "current_usage" | "created_at">): Promise<Coupon> {
  if (!isSupabaseReady()) {
    return { ...input, id: `c_${Date.now()}`, current_usage: 0, created_at: new Date().toISOString() } as Coupon
  }
  const { data, error } = await supabase!
    .from("coupons" as never)
    .insert({
      code: input.code.toUpperCase(),
      type: input.type,
      value: input.value,
      max_usage: input.max_usage,
      min_plan_type: input.min_plan_type,
      expires_at: input.expires_at,
      is_active: input.is_active,
    } as never)
    .select()
    .single() as any
  if (error) throw error
  return data as Coupon
}

export async function deleteCoupon(id: string): Promise<void> {
  if (!isSupabaseReady()) return
  const { error } = await supabase!.from("coupons" as never).delete().eq("id" as never, id) as any
  if (error) throw error
}

export async function toggleCoupon(id: string, isActive: boolean): Promise<void> {
  if (!isSupabaseReady()) return
  const { error } = await supabase!.from("coupons" as never).update({ is_active: isActive } as never).eq("id" as never, id) as any
  if (error) throw error
}
