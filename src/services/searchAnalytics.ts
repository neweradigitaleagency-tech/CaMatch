import { supabase, isSupabaseReady } from "./supabase"

// ─── Log a search query ───

export async function logSearch(query: string, vertical?: string, resultsCount?: number): Promise<void> {
  if (!isSupabaseReady() || !query.trim()) return

  try {
    const { data: { user } } = await supabase!.auth.getUser()

    await (supabase as any).from("search_analytics").insert({
      user_id: user?.id || null,
      query: query.trim(),
      vertical: vertical || null,
      results_count: resultsCount ?? 0,
    })
  } catch {
    // Silently fail — tracking is non-critical
  }
}

// ─── Get trending searches ───

export async function getTrendingSearches(daysBack = 7, limit = 10): Promise<string[]> {
  if (!isSupabaseReady()) return []

  try {
    const { data, error } = await (supabase as any).rpc("get_trending_searches", {
      p_days_back: daysBack,
      p_limit: limit,
    })

    if (error || !data) return []
    return data.map((r: { query: string }) => r.query)
  } catch {
    return []
  }
}
