import { supabase, isSupabaseReady } from "./supabase";

export interface DBNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  channel: string;
  priority: string;
  is_read: boolean;
  read_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export async function fetchNotifications(
  userId: string,
  options?: { limit?: number; unreadOnly?: boolean }
): Promise<DBNotification[]> {
  if (!isSupabaseReady()) return [];
  const limit = options?.limit ?? 50;
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (options?.unreadOnly) {
    query = query.eq("is_read", false);
  }
  const { data } = await query;
  return (data ?? []) as DBNotification[];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  if (!isSupabaseReady()) return;
  await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!isSupabaseReady()) return;
  await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_read", false);
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (!isSupabaseReady()) return 0;
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: DBNotification) => void
) {
  if (!isSupabaseReady()) return () => {};
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as DBNotification);
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
