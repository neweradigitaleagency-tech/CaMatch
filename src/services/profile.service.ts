import { supabase, isSupabaseReady } from "./supabase";

export interface UnifiedProfile {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  isActive: boolean;
  rating: number;
  totalJobs: number;
  profileTypes: string[];
  clientData?: Record<string, unknown>;
  professionalData?: Record<string, unknown>;
  supplierData?: Record<string, unknown>;
  trustScores?: Record<string, unknown>;
}

function getMockProfile(): UnifiedProfile {
  return {
    userId: "mock-user-id",
    displayName: "Jean Kouassi",
    avatarUrl: null,
    email: "jean.kouassi@email.com",
    phone: "+225 07 12 34 56",
    city: "Abidjan",
    isActive: true,
    rating: 4.5,
    totalJobs: 12,
    profileTypes: ["client", "professional", "supplier"],
    clientData: { loyalty_points: 150, preferred_payment_method: "wave" },
    professionalData: {
      business_name: "Kouass Élec",
      bio: "Électricien professionnel avec 10 ans d'expérience",
      hourly_rate: 15000,
      categories: ["electricity"],
      verification_level: "verified",
    },
    supplierData: {
      company_name: "Kouass Distribution",
      total_products: 34,
      total_orders: 89,
      status: "ACTIF",
    },
  };
}

export async function getProfile(userId: string): Promise<UnifiedProfile | null> {
  if (!isSupabaseReady()) return getMockProfile();

  const { data: user } = await supabase.auth.getUser();
  const email = user?.user?.email ?? "";

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId);

  if (!profiles || profiles.length === 0) return getMockProfile();

  const profileTypes: string[] = [];
  let displayName = "";
  let avatarUrl: string | null = null;
  let phone: string | null = null;
  let city: string | null = null;
  let isActive = true;
  let rating = 0;
  let totalJobs = 0;
  const clientData: Record<string, unknown> = {};
  const professionalData: Record<string, unknown> = {};
  const supplierData: Record<string, unknown> = {};

  for (const p of profiles) {
    profileTypes.push(p.profile_type);
    displayName = p.display_name ?? displayName;
    avatarUrl = p.avatar_url ?? avatarUrl;
    phone = p.phone ?? phone;
    city = p.city ?? city;
    isActive = p.is_active ?? isActive;
    rating = p.rating ?? rating;
    totalJobs = p.total_jobs ?? totalJobs;

    if (p.profile_type === "client") Object.assign(clientData, p.data);
    if (p.profile_type === "professional") Object.assign(professionalData, p.data);
    if (p.profile_type === "supplier") Object.assign(supplierData, p.data);
  }

  return {
    userId,
    displayName,
    avatarUrl,
    email,
    phone,
    city,
    isActive,
    rating,
    totalJobs,
    profileTypes,
    clientData: Object.keys(clientData).length > 0 ? clientData : undefined,
    professionalData: Object.keys(professionalData).length > 0 ? professionalData : undefined,
    supplierData: Object.keys(supplierData).length > 0 ? supplierData : undefined,
    trustScores: profiles.find((p) => p.data?.trust_scores)?.data?.trust_scores,
  };
}
