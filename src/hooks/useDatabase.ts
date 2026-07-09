import { useQuery } from "@tanstack/react-query";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../stores/authStore";
import type { ProfessionalDetails, ClientRequest, Mission, Conversation, ProJob, ProAlert, ProDashboardStats } from "../types";

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
    subCategory: row.sub_category || "",
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
      const { data } = await supabase
        .from("professional_profiles")
        .select("*, users( email, phone_number )")
        .eq("user_id", id!)
        .single();
      return data ? mapPro(data) : null;
    },
  });
}

function mapRequest(row: any): ClientRequest {
  const urgencyMap: Record<string, "immediate" | "today" | "this_week" | "flexible"> = {
    emergency: "immediate",
    high: "today",
    medium: "this_week",
    low: "flexible",
  };
  return {
    id: row.id,
    clientId: row.client_id,
    title: `Intervention ${row.category === "electrician" ? "électrique" : row.category === "plumber" ? "plomberie" : row.category === "ac_refrigeration" ? "climatisation" : "menuiserie"}`,
    description: row.description || "",
    photos: row.media_urls || [],
    category: row.category === "electrician" ? "électricien"
      : row.category === "plumber" ? "plombier"
      : row.category === "ac_refrigeration" ? "climatisation"
      : row.category === "carpenter" ? "menuisier"
      : "menuisier",
    address: row.address || "",
    budgetXOF: row.estimated_price_max || 0,
    urgency: urgencyMap[row.urgency] || "flexible",
    status: row.status === "accepted" ? "accepted" as const
      : row.status === "in_progress" ? "in_progress" as const
      : row.status === "completed" ? "completed" as const
      : "created" as const,
    proId: row.professional_id || undefined,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

export function useClientRequests() {
  const userId = getUserId();
  return useQuery({
    queryKey: ["clientRequests", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });
      return (data || []).map(mapRequest);
    },
  });
}

function mapMission(row: any): Mission {
  const statusMap: Record<string, any> = {
    created: "created",
    pending: "created",
    accepted: "accepted",
    in_progress: "in_progress",
    completed: "completed",
  };
  return {
    id: row.id,
    requestId: row.id,
    clientId: row.client_id,
    proId: row.professional_id || "",
    status: statusMap[row.status] || "created",
    title: `Intervention ${row.category}`,
    description: row.description || "",
    category: row.category === "electrician" ? "électricien"
      : row.category === "plumber" ? "plombier"
      : row.category === "ac_refrigeration" ? "climatisation"
      : row.category === "carpenter" ? "menuisier"
      : "menuisier",
    address: row.address || "",
    budgetXOF: row.estimated_price_max || 0,
    photos: row.media_urls || [],
    proName: row.professional_profiles?.first_name
      ? `${row.professional_profiles.first_name} ${row.professional_profiles.last_name || ""}`.trim()
      : "Professionnel",
    proAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    proPhone: row.professional_profiles?.users?.phone_number || "",
    clientName: "",
    clientPhone: "",
    createdAt: row.created_at || "",
    acceptedAt: row.status === "accepted" || row.status === "in_progress" ? row.created_at || undefined : undefined,
    inProgressAt: row.started_at || undefined,
  };
}

export function useClientMissions() {
  const userId = getUserId();
  return useQuery({
    queryKey: ["clientMissions", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*, professional_profiles( first_name, last_name, users( phone_number ) )")
        .eq("client_id", userId)
        .not("professional_id", "is", null)
        .order("created_at", { ascending: false });
      return (data || []).map(mapMission);
    },
  });
}

export function useProMissions() {
  const userId = getUserId();
  return useQuery({
    queryKey: ["proMissions", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*, professional_profiles( first_name, last_name, users( phone_number ) )")
        .eq("professional_id", userId)
        .order("created_at", { ascending: false });
      return (data || []).map(mapMission);
    },
  });
}

export function useProDashboard() {
  const userId = getUserId();
  return useQuery({
    queryKey: ["proDashboard", userId],
    queryFn: async () => {
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
          category: r.category,
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

      const alerts: ProAlert[] = [];
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
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      return (data || []).map((r: any) => mapConversation(r, userId));
    },
  });
}
