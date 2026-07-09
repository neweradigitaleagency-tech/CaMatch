import { useEffect } from "react";
import { supabase, isSupabaseReady } from "../services/supabase";
import { useRequestStore } from "../stores/requestStore";

export function useMissionRealtime(missionId: string | undefined) {
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);

  useEffect(() => {
    if (!missionId || !isSupabaseReady()) return;

    const channel = supabase
      .channel(`mission-realtime-${missionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "service_requests",
          filter: `id=eq.${missionId}`,
        },
        (payload: any) => {
          const newStatus = payload.new?.status;
          if (newStatus) {
            updateMissionStatus(missionId, newStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [missionId, updateMissionStatus]);
}
