import { supabase, isSupabaseReady } from "../supabase"

export interface FeatureFlag {
  id: string
  key: string
  label: string
  description: string | null
  enabled: boolean
  category: string
  created_at: string
  updated_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  communication: "Communication",
  payments: "Paiements",
  ai: "IA",
  security: "Sécurité",
  engagement: "Engagement",
  premium: "Premium",
}

const MOCK_FLAGS: FeatureFlag[] = [
  { id: "ff1", key: "video_calls", label: "Appels vidéo", description: "Permettre les appels vidéo entre clients et pros", enabled: true, category: "communication", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff2", key: "ai_chat", label: "Chat IA", description: "Assistant IA dans la messagerie", enabled: false, category: "ai", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff3", key: "promotions", label: "Promotions", description: "Activer les campagnes promotionnelles", enabled: true, category: "engagement", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff4", key: "wallet", label: "Portefeuille", description: "Portefeuille numérique pour les pros", enabled: true, category: "payments", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff5", key: "card_payment", label: "Paiement carte", description: "Accepter les paiements par carte Visa/Mastercard", enabled: true, category: "payments", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff6", key: "liveness_check", label: "Vérification liveness", description: "Selfie vidéo obligatoire pour le KYC", enabled: true, category: "security", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff7", key: "referral_program", label: "Parrainage", description: "Programme de parrainage client/pro", enabled: false, category: "engagement", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff8", key: "qr_payment", label: "Paiement QR", description: "Paiement par QR code en personne", enabled: false, category: "payments", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff9", key: "ai_matching", label: "Matching IA", description: "Algorithme IA pour le matching pro-client", enabled: true, category: "ai", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff10", key: "escrow", label: "Paiement séquestre", description: "Système de paiement séquestre pour les missions", enabled: true, category: "payments", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff11", key: "voice_notes", label: "Notes vocales", description: "Messages vocaux dans le chat", enabled: false, category: "communication", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
  { id: "ff12", key: "sos_button", label: "Bouton SOS", description: "Bouton d'urgence pour les missions", enabled: false, category: "security", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z" },
]

const CATEGORY_ORDER = ["communication", "payments", "ai", "security", "engagement", "premium"]

export { CATEGORY_LABELS, CATEGORY_ORDER }

export async function getFeatureFlags(): Promise<{ flags: FeatureFlag[] }> {
  if (!isSupabaseReady()) return { flags: MOCK_FLAGS }
  try {
    const { data } = await supabase
      .from("feature_flags" as never)
      .select("*")
      .order("category") as any
    return { flags: data ?? MOCK_FLAGS }
  } catch {
    return { flags: MOCK_FLAGS }
  }
}

export async function updateFeatureFlag(id: string, updates: Partial<FeatureFlag>): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await supabase
    .from("feature_flags" as never)
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id) as any
  return !error
}

export async function createFeatureFlag(flag: { key: string; label: string; description?: string; category: string }): Promise<string | null> {
  if (!isSupabaseReady()) return null
  const { data, error } = await supabase
    .from("feature_flags" as never)
    .insert({ ...flag, enabled: false } as never)
    .select("id") as any
  if (error) return null
  return data?.[0]?.id ?? null
}

export async function deleteFeatureFlag(id: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await supabase
    .from("feature_flags" as never)
    .delete()
    .eq("id", id) as any
  return !error
}
