import { supabase, isSupabaseReady } from "../supabase"

export interface OCRData {
  first_name?: string
  last_name?: string
  birth_date?: string
  document_number?: string
  expiration_date?: string
  nationality?: string
  gender?: string
}

export interface LivenessCheck {
  status: "passed" | "failed" | "not_attempted"
  score?: number
  method?: "video" | "selfie_sequence" | "none"
  attempted_at?: string
}

export type RejectionReason =
  | "photo_floue"
  | "document_expire"
  | "document_incomplet"
  | "document_falsifie"
  | "visage_non_reconnu"
  | "luminosite_insuffisante"
  | "informations_non_concordantes"
  | "document_non_conforme"
  | "selfie_non_conforme"
  | "video_non_conforme"

export const REJECTION_REASONS: { value: RejectionReason; label: string }[] = [
  { value: "photo_floue", label: "Photo floue" },
  { value: "document_expire", label: "Document expiré" },
  { value: "document_incomplet", label: "Document incomplet" },
  { value: "document_falsifie", label: "Document falsifié ou suspect" },
  { value: "visage_non_reconnu", label: "Visage non reconnaissable" },
  { value: "luminosite_insuffisante", label: "Luminosité insuffisante" },
  { value: "informations_non_concordantes", label: "Informations non concordantes" },
  { value: "document_non_conforme", label: "Document non conforme" },
  { value: "selfie_non_conforme", label: "Selfie non conforme" },
  { value: "video_non_conforme", label: "Vidéo de vérification non conforme" },
]

export const DOC_LABELS: Record<string, string> = {
  cni: "CNI",
  cni_recto: "CNI (Recto)",
  cni_verso: "CNI (Verso)",
  passport: "Passeport",
  permis: "Permis de conduire",
  casier_judiciaire: "Casier judiciaire",
  diplome: "Diplôme",
  selfie: "Selfie",
  selfie_normal: "Selfie standard",
  selfie_cni_main: "Selfie avec CNI en main",
  selfie_cni_visage: "Selfie CNI visage",
  video_liveness: "Vidéo 5s (Liveness)",
  certification: "Attestation",
}

export interface VerificationRequest {
  id: string
  user_id: string
  level: string
  document_type: string
  document_url: string
  document_back_url?: string
  status: "pending" | "approved" | "rejected" | "needs_resubmission"
  reviewed_by?: string
  review_notes?: string
  rejection_reason?: RejectionReason
  private_notes?: string
  ai_score?: number
  face_match_score?: number
  face_verified?: boolean
  liveness?: LivenessCheck
  ocr_data?: OCRData
  reviewed_at?: string
  created_at: string
  user_name?: string
  user_email?: string
  user_phone?: string
  category?: string
  reviewed_by_name?: string
  phone_verified?: boolean
  email_verified?: boolean
}

export async function getVerifications(params: {
  page?: number
  perPage?: number
  status?: string
  documentType?: string
  search?: string
} = {}): Promise<{ verifications: VerificationRequest[]; total: number }> {
  if (!isSupabaseReady()) {
    return { verifications: [], total: 0 }
  }
  const { page = 1, perPage = 20, status, documentType, search } = params
  let query = supabase
    .from("verification_requests" as never)
    .select("*, user:user_id(email, phone_number, email_verified, phone_verified), pro:user_id(professional_profiles!inner(first_name, last_name, business_name, category))", { count: "exact" }) as never

  let q: any = query
  if (status && status !== "all") q = q.eq("status", status)
  if (documentType) q = q.eq("document_type", documentType)
  if (search) {
    q = q.or(`user_id.ilike.%${search}%`)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, count, error } = await q.order("created_at", { ascending: false }).range(from, to) as any
  if (error) throw error
  return {
    verifications: (data ?? []).map((v: any) => {
      const pro = v.pro?.[0] ?? v.pro
      return {
        ...v,
        user_name: pro ? `${pro.first_name ?? ""} ${pro.last_name ?? ""}`.trim() || pro.business_name : "",
        user_email: v.user?.email ?? "",
        user_phone: v.user?.phone_number ?? "",
        phone_verified: v.user?.phone_verified ?? false,
        email_verified: v.user?.email_verified ?? false,
        category: pro?.category ?? "",
      }
    }) as VerificationRequest[],
    total: count ?? 0,
  }
}

export async function updateVerificationStatus(
  id: string,
  status: "approved" | "rejected" | "needs_resubmission",
  options?: {
    reviewNotes?: string
    rejectionReason?: RejectionReason
    privateNotes?: string
  }
): Promise<void> {
  if (!isSupabaseReady()) return
  const { error } = await supabase
    .from("verification_requests" as never)
    .update({
      status,
      review_notes: options?.reviewNotes ?? null,
      rejection_reason: options?.rejectionReason ?? null,
      private_notes: options?.privateNotes ?? null,
      reviewed_by: (await supabase.auth.getUser()).data.user?.id,
      reviewed_at: new Date().toISOString(),
    } as never)
    .eq("id", id) as any
  if (error) throw error

  if (status === "approved") {
    await supabase
      .from("professional_profiles" as never)
      .update({ is_verified: true, verification_level: "verified", verified_at: new Date().toISOString() } as never)
      .eq("user_id", (await supabase.from("verification_requests").select("user_id").eq("id", id).single() as any).data?.user_id) as any
  }
}
