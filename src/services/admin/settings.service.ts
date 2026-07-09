import { supabase, isSupabaseReady } from "../supabase"

export interface PlatformSettingRow {
  id: string
  key: string
  value: string
  description: string | null
  type: string
  category: string
  is_encrypted: boolean
  created_at: string
  updated_at: string
}

export async function getSettings(): Promise<PlatformSettingRow[]> {
  if (!isSupabaseReady()) return []
  const { data } = await supabase
    .from("platform_settings" as never)
    .select("*")
    .order("category" as never)
    .order("key" as never)
  return (data ?? []) as unknown as PlatformSettingRow[]
}

export async function updateSettings(
  settings: { key: string; value: string }[],
): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await supabase
    .from("platform_settings" as never)
    .upsert(
      settings.map((s) => ({ key: s.key, value: s.value })) as never,
      { onConflict: "key" as never },
    )
  return !error
}
