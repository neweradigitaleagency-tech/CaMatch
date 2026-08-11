import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isDemoMode, isSupabaseReady } from "../services/supabase";
import { toProAlert } from "../services/requestPersistence";
import { useAuthStore } from "../stores/authStore";
import { useProStore } from "../stores/proStore";

const REFETCH_INTERVAL_MS = 30_000;

/**
 * ProAlert = vue calculée : dérivée des lignes service_requests en attente
 * (pending/quoted, non expirées, catégories en overlap) visibles par le pro.
 * - Requête initiale + Realtime (INSERT/UPDATE/DELETE) + refetch périodique
 *   (l'expiration est silencieuse : expires_at passe sans événement).
 * - Alimente proStore.alerts, que tous les écrans pro consomment déjà.
 */
export function useProAlerts() {
  const userId = useAuthStore((s) => s.userId);
  const queryClient = useQueryClient();
  const enabled = !!userId && isSupabaseReady() && !isDemoMode();

  const query = useQuery({
    queryKey: ["proAlerts", userId],
    enabled,
    refetchInterval: REFETCH_INTERVAL_MS,
    queryFn: async () => {
      const uid = userId!;
      const { data: profile } = await supabase
        .from("professional_profiles")
        .select("categories")
        .eq("user_id", uid)
        .maybeSingle();

      const categories = profile?.categories ?? [];
      if (categories.length === 0) return [];

      const now = new Date().toISOString();
      const { data: rows } = await supabase
        .from("service_requests")
        .select("*")
        .is("professional_id", null)
        .in("status", ["pending", "quoted"])
        .gt("expires_at", now)
        .overlaps("categories", categories)
        .order("created_at", { ascending: false });

      // Pas de FK service_requests → client_profiles : on récupère les noms
      // en batch (la policy "Pros view matched clients" autorise la lecture).
      const clientIds = Array.from(new Set((rows || []).map((r) => r.client_id)));
      const clientNameById: Record<string, { first_name: string | null; last_name: string | null }> = {};
      if (clientIds.length > 0) {
        const { data: profiles } = await supabase
          .from("client_profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", clientIds);
        for (const p of profiles || []) clientNameById[p.user_id] = p;
      }

      return (rows || [])
        .map((row) => toProAlert({ ...row, client_profiles: clientNameById[row.client_id] }))
        .filter((a) => new Date(a.expiresAt).getTime() > Date.now());
    },
  });

  // Alimente la « vue calculée » des alertes dans proStore.
  useEffect(() => {
    if (query.data !== undefined && enabled) {
      useProStore.getState().setAlerts(query.data);
    }
  }, [query.data, enabled]);

  // Realtime : tout événement visible sur service_requests rafraîchit la vue.
  useEffect(() => {
    if (!userId || !enabled) return;
    const channel = supabase
      .channel(`pro-alerts-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_requests" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["proAlerts", userId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, enabled, queryClient]);

  return { alerts: query.data ?? [], isLoading: query.isLoading };
}
