import { useQuery } from "@tanstack/react-query";
import { supabase, isDemoMode } from "../services/supabase";
import { toClientRequest, toMission } from "../services/requestPersistence";
import { useAuthStore } from "../stores/authStore";
import { useProStore } from "../stores/proStore";
import {
  MOCK_PROS, MOCK_REQUESTS, MOCK_MISSIONS, MOCK_PRO_JOBS, MOCK_PRO_ALERTS,
  MOCK_PRO_STATS, MOCK_CONVERSATIONS,
} from "../services/mockData";
import type { ProfessionalDetails, Conversation, ProJob, ProAlert, ProDashboardStats } from "../types";

function getUserId(): string {
  const state = useAuthStore.getState();
  if (state.user?.id) return state.user.id;
  const id = state.userId;
  if (id) return id;
  throw new Error("Not authenticated");
}

function mapPro(row: any): ProfessionalDetails {
  const fullName = `${row.first_name || ""} ${row.last_name || ""}`.trim();
  return {
    id: row.user_id,
    name: fullName || row.business_name || "Professionnel",
    email: row.users?.email || "",
    phoneNumber: row.users?.phone_number || "",
    role: "pro",
    avatarUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`,
    category: "maison-reparations" as const,
    categories: row.categories || ["maison-reparations"],
    subCategory: (row.sub_categories || [])[0] || "",
    subCategories: row.sub_categories || [],
    title: row.business_name || "",
    bio: row.bio || "",
    experienceYears: Math.floor((row.total_jobs || 0) / 15),
    rating: Math.round((row.rating || 0) * 10),
    reviewCount: Math.floor((row.total_jobs || 0) * 0.6),
    hourlyRateXOF: row.hourly_rate || 0,
    locationNeighborhood: "Cocody, Abidjan",
    isVerified: row.verification_level !== "none" && row.verification_level !== null,
    completedInterventions: row.total_jobs || 0,
    availabilityStatus: row.is_available ? "available" as const : "offline" as const,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function usePros() {
  return useQuery({
    queryKey: ["pros"],
    queryFn: async () => {
      if (isDemoMode()) return MOCK_PROS;
      const { data } = await supabase
        .from("professional_profiles")
        .select("*, users( email, phone_number )")
        .eq("is_active", true)
        .order("rating", { ascending: false, nullsFirst: false });
      return (data || []).map(mapPro);
    },
  });
}

export function usePro(id?: string) {
  return useQuery({
    queryKey: ["pro", id],
    enabled: !!id,
    queryFn: async () => {
      if (isDemoMode()) return MOCK_PROS.find((p) => p.id === id) ?? null;
      const { data } = await supabase
        .from("professional_profiles")
        .select("*, users( email, phone_number )")
        .eq("user_id", id!)
        .single();
      return data ? mapPro(data) : null;
    },
  });
}

export function useClientRequests() {
  const userId = getUserId();
  return useQuery({
    queryKey: ["clientRequests", userId],
    queryFn: async () => {
      if (isDemoMode()) return MOCK_REQUESTS;
      const { data } = await supabase
        .from("service_requests")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });
      return (data || []).map(toClientRequest);
    },
  });
}

export function useClientMissions() {
  const userId = getUserId();
  return useQuery({
    queryKey: ["clientMissions", userId],
    queryFn: async () => {
      if (isDemoMode()) return MOCK_MISSIONS;
      const { data } = await supabase
        .from("service_requests")
        .select("*, professional_profiles( first_name, last_name, users( phone_number ) )")
        .eq("client_id", userId)
        .not("professional_id", "is", null)
        .order("created_at", { ascending: false });
      return (data || []).map(toMission);
    },
  });
}

export function useProMissions() {
  const userId = getUserId();
  return useQuery({
    queryKey: ["proMissions", userId],
    queryFn: async () => {
      if (isDemoMode()) return MOCK_MISSIONS.filter((m) => m.proId === userId);
      const { data } = await supabase
        .from("service_requests")
        .select("*, professional_profiles( first_name, last_name, users( phone_number ) )")
        .eq("professional_id", userId)
        .order("created_at", { ascending: false });
      return (data || []).map(toMission);
    },
  });
}

export function useProDashboard() {
  const userId = getUserId();
  return useQuery({
    queryKey: ["proDashboard", userId],
    queryFn: async () => {
      if (isDemoMode()) {
        const monthLabels: string[] = [];
        const revenueHistory: number[] = [];
        const missionHistory: number[] = [];
        const ratingHistory: number[] = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(today.getMonth() - i);
          monthLabels.push(d.toLocaleDateString("fr-FR", { month: "short" }));
          revenueHistory.push(MOCK_PRO_STATS?.monthEarningsXOF ? Math.round((MOCK_PRO_STATS.monthEarningsXOF / 6) * (6 - i)) : 0);
          missionHistory.push(Math.round((MOCK_PRO_STATS.totalJobsCompleted / 6) * (6 - i)));
          ratingHistory.push(MOCK_PRO_STATS?.rating ?? 0);
        }
        return {
          pro: MOCK_PROS[0] ?? null,
          stats: MOCK_PRO_STATS,
          todayJobs: MOCK_PRO_JOBS.filter((j) => j.status === "in_progress" || j.status === "accepted"),
          alerts: MOCK_PRO_ALERTS,
          revenueHistory,
          missionHistory,
          ratingHistory,
          monthLabels,
        };
      }
      const [profileRes, requestsRes] = await Promise.all([
        supabase.from("professional_profiles").select("*").eq("user_id", userId).single(),
        supabase.from("service_requests")
          .select("*")
          .eq("professional_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      const profile = profileRes.data;
      const requests = requestsRes.data || [];

      const today = new Date().toISOString().slice(0, 10);
      const todayJobs: ProJob[] = requests
        .filter((r: any) => r.scheduled_at?.startsWith(today) || r.status === "in_progress")
        .map((r: any) => ({
          id: r.id,
          clientId: r.client_id || "",
          clientName: "Client",
          clientPhone: "",
          clientLocation: r.address || "",
          category: Array.isArray(r.categories) ? r.categories[0] : "maison-reparations",
          serviceName: r.description?.slice(0, 50) || "",
          description: r.description || "",
          status: r.status === "in_progress" ? "in_progress" as const
            : r.status === "accepted" ? "accepted" as const
            : r.status === "completed" ? "completed" as const
            : "pending" as const,
          travelFeeXOF: 0,
          laborFeeXOF: r.estimated_price_max || 0,
          totalFeeXOF: r.estimated_price_max || 0,
          createdAt: r.created_at || "",
        }));

      // Alertes = vue calculée alimentée par useProAlerts.
      const alerts: ProAlert[] = useProStore.getState().alerts;
      const stats: ProDashboardStats = {
        todayEarningsXOF: 0,
        weekEarningsXOF: 0,
        monthEarningsXOF: 0,
        totalJobsCompleted: profile?.total_jobs || 0,
        todayJobsCount: todayJobs.length,
        rating: (profile?.rating || 0) * 10,
        reviewCount: Math.floor((profile?.total_jobs || 0) * 0.6),
      };

      const monthLabels: string[] = [];
      const revenueHistory: number[] = [];
      const missionHistory: number[] = [];
      const ratingHistory: number[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        monthLabels.push(d.toLocaleDateString("fr-FR", { month: "short" }));
        revenueHistory.push(0);
        missionHistory.push(0);
        ratingHistory.push((profile?.rating || 0) * 10);
      }

      return {
        pro: profile ? mapPro({ ...profile, users: {} }) : null,
        stats,
        todayJobs,
        alerts,
        revenueHistory,
        missionHistory,
        ratingHistory,
        monthLabels,
      };
    },
  });
}

function mapConversation(row: any, currentUserId: string): Conversation {
  const otherId = row.participant_1 === currentUserId ? row.participant_2 : row.participant_1;
  const meta = typeof row.metadata === "object" && row.metadata !== null ? row.metadata : {};
  return {
    id: row.id,
    participants: [row.participant_1, row.participant_2],
    missionId: row.job_id || "",
    state: (row.state || "waiting") as Conversation["state"],
    metadata: {
      mission_phase: meta.mission_phase || undefined,
      flags: {
        dispute: !!meta.flags?.dispute,
        support_joined: !!meta.flags?.support_joined,
        pinned: !!meta.flags?.pinned,
      },
      job_snapshot: {
        category: meta.job_snapshot?.category || "",
        location: meta.job_snapshot?.location || "",
        price_estimate: meta.job_snapshot?.price_estimate || 0,
        currency: meta.job_snapshot?.currency || "XOF",
        service_type: meta.job_snapshot?.service_type || "on_demand",
      },
      created_from: meta.created_from || "manual",
    },
    lastMessage: row.last_message || "",
    lastMessageAt: row.last_message_at || row.created_at || "",
    unreadCount: row.unread_count || 0,
    otherUserName: otherId.slice(0, 8),
    otherUserAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  };
}

export function useConversations() {
  const userId = getUserId();
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (isDemoMode()) return MOCK_CONVERSATIONS;
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      return (data || []).map((r: any) => mapConversation(r, userId));
    },
  });
}
