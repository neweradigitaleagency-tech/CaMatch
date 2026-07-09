import { supabase, isSupabaseReady } from "./supabase"
import type { Boost, BoostType } from "../types/subscription"
import { addDays } from "date-fns"

const BOOST_PRICES: Record<BoostType, { daily: number; weekly: number; monthly: number }> = {
  search_top: { daily: 1500, weekly: 7000, monthly: 20000 },
  category_top: { daily: 1000, weekly: 5000, monthly: 15000 },
  featured: { daily: 2500, weekly: 12000, monthly: 35000 },
}

export function getBoostPrices() {
  return BOOST_PRICES
}

export function calculateBoostPrice(type: BoostType, durationDays: number): number {
  const prices = BOOST_PRICES[type]
  if (durationDays >= 30) return prices.monthly * Math.ceil(durationDays / 30)
  if (durationDays >= 7) return prices.weekly * Math.ceil(durationDays / 7)
  return prices.daily * durationDays
}

export async function createBoost(input: {
  user_id: string
  boost_type: BoostType
  duration_days: number
}): Promise<Boost> {
  const amount = calculateBoostPrice(input.boost_type, input.duration_days)
  const now = new Date()
  if (!isSupabaseReady()) {
    return {
      id: `boost_${Date.now()}`,
      user_id: input.user_id,
      boost_type: input.boost_type,
      duration_days: input.duration_days,
      amount_paid: amount,
      starts_at: now.toISOString(),
      ends_at: addDays(now, input.duration_days).toISOString(),
      is_active: true,
      payment_id: null,
      created_at: now.toISOString(),
    }
  }
  const { data, error } = await supabase!
    .from("boosts" as never)
    .insert({
      user_id: input.user_id,
      boost_type: input.boost_type,
      duration_days: input.duration_days,
      amount_paid: amount,
      starts_at: now.toISOString(),
      ends_at: addDays(now, input.duration_days).toISOString(),
    } as never)
    .select()
    .single() as any
  if (error) throw error
  return data as Boost
}

export async function fetchActiveBoosts(userId: string): Promise<Boost[]> {
  if (!isSupabaseReady()) {
    return [
      { id: "boost_1", user_id: userId, boost_type: "search_top", duration_days: 7, amount_paid: 7000, starts_at: new Date().toISOString(), ends_at: addDays(new Date(), 7).toISOString(), is_active: true, payment_id: "pay_1", created_at: new Date().toISOString() },
    ]
  }
  const { data, error } = await supabase!
    .from("boosts" as never)
    .select("*")
    .eq("user_id" as never, userId)
    .eq("is_active" as never, true)
    .gte("ends_at" as never, new Date().toISOString()) as any
  if (error) throw error
  return (data ?? []) as Boost[]
}

export async function fetchBoostHistory(userId: string): Promise<Boost[]> {
  if (!isSupabaseReady()) return []
  const { data, error } = await supabase!
    .from("boosts" as never)
    .select("*")
    .eq("user_id" as never, userId)
    .order("created_at" as never, { ascending: false }) as any
  if (error) throw error
  return (data ?? []) as Boost[]
}
