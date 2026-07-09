import { supabase, isSupabaseReady } from "../../services/supabase"

export async function logAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  if (!isSupabaseReady()) return
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase as any).from("admin_logs").insert({
      admin_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    })
  } catch {
    /* silent fail */
  }
}
