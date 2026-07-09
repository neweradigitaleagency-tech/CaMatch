import { useEffect, useRef } from "react"
import { supabase, isSupabaseReady } from "../services/supabase"

type RealtimeCallback = (payload: Record<string, unknown>) => void

interface RealtimeSubscription {
  table: string
  event?: "*" | "INSERT" | "UPDATE" | "DELETE"
  filter?: string
  callback: RealtimeCallback
}

export function useAdminRealtime(subscriptions: RealtimeSubscription[]) {
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([])

  useEffect(() => {
    if (!isSupabaseReady()) return

    const channels = subscriptions.map((sub) => {
      const channel = supabase
        .channel(`admin-${sub.table}`)
        .on(
          "postgres_changes" as never,
          {
            event: sub.event ?? "*",
            schema: "public",
            table: sub.table,
            filter: sub.filter,
          } as never,
          ((payload: any) => sub.callback(payload as unknown as Record<string, unknown>)) as never
        )
        .subscribe()

      return channel
    })

    channelsRef.current = channels

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch))
    }
  }, [subscriptions])
}
