import { supabase, isSupabaseReady } from "./supabase"
import type { UsageRecord, Plan, PlanFeature } from "../types/subscription"
import { fetchCurrentSubscription, fetchUsage } from "./subscriptionService"
import { addMonths } from "date-fns"

export async function hasFeature(userId: string, featureCode: string): Promise<boolean> {
  if (!isSupabaseReady()) {
    return true
  }
  const sub = await fetchCurrentSubscription(userId)
  if (!sub || !sub.plan_id) return false
  const { data, error } = await supabase!
    .from("plan_features" as never)
    .select("enabled")
    .eq("plan_id" as never, sub.plan_id)
    .eq("feature_id" as never, (await getFeatureIdByCode(featureCode)) ?? "")
    .maybeSingle() as any
  if (error) return false
  return (data as any)?.enabled ?? false
}

async function getFeatureIdByCode(code: string): Promise<string | null> {
  const { data, error } = await supabase!
    .from("features" as never)
    .select("id")
    .eq("code" as never, code)
    .maybeSingle() as any
  if (error || !data) return null
  return (data as any).id
}

export async function checkLimit(userId: string, featureCode: string): Promise<{
  allowed: boolean
  current: number
  limit: number | null
}> {
  const usage = await fetchUsage(userId)
  const record = usage.find((u) => u.feature_code === featureCode)
  if (!record || record.limit_value === null) return { allowed: true, current: 0, limit: null }
  if (record.limit_value === -1) return { allowed: true, current: record.usage, limit: -1 }
  return {
    allowed: record.usage < record.limit_value,
    current: record.usage,
    limit: record.limit_value,
  }
}

export async function consumeFeature(userId: string, featureCode: string, amount = 1): Promise<void> {
  if (!isSupabaseReady()) return
  const today = new Date()
  const existing = await supabase!
    .from("usage_tracking" as never)
    .select("*")
    .eq("user_id" as never, userId)
    .eq("feature_code" as never, featureCode)
    .maybeSingle() as any
  if (existing.error && existing.error.code !== "PGRST116") throw existing.error
  if (existing.data) {
    const record = existing.data as UsageRecord
    if (new Date(record.reset_date) <= today) {
      await supabase!
        .from("usage_tracking" as never)
        .update({
          usage: amount,
          reset_date: addMonths(today, 1).toISOString(),
          updated_at: today.toISOString(),
        } as never)
        .eq("id" as never, record.id) as any
    } else {
      await supabase!
        .from("usage_tracking" as never)
        .update({
          usage: record.usage + amount,
          updated_at: today.toISOString(),
        } as never)
        .eq("id" as never, record.id) as any
    }
  } else {
    await supabase!.from("usage_tracking" as never).insert({
      user_id: userId,
      feature_code: featureCode,
      usage: amount,
      reset_date: addMonths(today, 1).toISOString(),
    } as never) as any
  }
}

export async function getFeatureUsage(userId: string): Promise<UsageRecord[]> {
  return fetchUsage(userId)
}
