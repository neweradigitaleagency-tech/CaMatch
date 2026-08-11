import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isDemoMode, isSupabaseReady } from "../services/supabase";
import { toClientRequest, toMission } from "../services/requestPersistence";
import { useAuthStore } from "../stores/authStore";
import { useRequestStore } from "../stores/requestStore";

const REFETCH_INTERVAL_MS = 30_000;

/**
 * Hydrate la vue client (requestStore) depuis service_requests en temps réel :
 * - requests = lignes en attente (status pending/quoted)
 * - missions = lignes assignées à un pro (professional_id NOT NULL)
 * - Realtime sur la table filtrée par client_id + refetch périodique (sécurité
 *   si le Realtime DB n'est pas activé côté Supabase).
 * Désactivé en mode démo : le sandbox garde ses données mock seedées.
 */
export function useRequestSync() {
  const userId = useAuthStore((s) => s.userId);
  const queryClient = useQueryClient();
  const enabled = !!userId && isSupabaseReady() && !isDemoMode();

  const requestsQuery = useQuery({
    queryKey: ["clientRequests", userId],
    enabled,
    refetchInterval: REFETCH_INTERVAL_MS,
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*")
        .eq("client_id", userId!)
        .in("status", ["pending", "quoted"])
        .order("created_at", { ascending: false });
      return (data || []).map(toClientRequest);
    },
  });

  const missionsQuery = useQuery({
    queryKey: ["clientMissions", userId],
    enabled,
    refetchInterval: REFETCH_INTERVAL_MS,
    queryFn: async () => {
      const { data: rows } = await supabase
        .from("service_requests")
        .select("*")
        .eq("client_id", userId!)
        .not("professional_id", "is", null)
        .order("created_at", { ascending: false });

      // Pas de FK service_requests → professional_profiles : batch sur les IDs
      // du pro assigné (profile public des pros actifs).
      const proIds = Array.from(
        new Set((rows || []).map((r) => r.professional_id).filter(Boolean))
      );
      const proNameById: Record<string, { first_name: string | null; last_name: string | null }> = {};
      if (proIds.length > 0) {
        const { data: profiles } = await supabase
          .from("professional_profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", proIds);
        for (const p of profiles || []) proNameById[p.user_id] = p;
      }

      return (rows || []).map((row) =>
        toMission({ ...row, professional_profiles: proNameById[row.professional_id] })
      );
    },
  });

  // Vue calculée client : la base est la source de vérité en mode réel.
  useEffect(() => {
    if (requestsQuery.data !== undefined && enabled) {
      useRequestStore.getState().setRequests(requestsQuery.data);
    }
  }, [requestsQuery.data, enabled]);

  useEffect(() => {
    if (missionsQuery.data !== undefined && enabled) {
      useRequestStore.getState().setMissions(missionsQuery.data);
    }
  }, [missionsQuery.data, enabled]);

  // Realtime : tout événement sur mes demandes rafraîchit les deux vues.
  useEffect(() => {
    if (!userId || !enabled) return;
    const channel = supabase
      .channel(`request-sync-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
          filter: `client_id=eq.${userId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["clientRequests", userId] });
          void queryClient.invalidateQueries({ queryKey: ["clientMissions", userId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, enabled, queryClient]);

  return {
    requests: requestsQuery.data ?? [],
    missions: missionsQuery.data ?? [],
    isLoading: requestsQuery.isLoading || missionsQuery.isLoading,
  };
}
