import type { ClientRequest, Mission, ProAlert, Urgency } from "../types";
import { supabase, isSupabaseReady } from "./supabase";

/**
 * Durée de vie d'une demande publiée, visible par les pros.
 * La base applique ce délai via la colonne expires_at (défaut NOW()+2 min) ;
 * le délai est aussi porté côté client pour la vue calculée (ProAlert).
 */
export const REQUEST_EXPIRY_MS = 2 * 60 * 1000;

/** Convertit des coordonnées en WKT pour la colonne location (GEOGRAPHY). */
export function toWktPoint(lng: number, lat: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

/** Mappe une disponibilité du wizard vers l'urgence DB (low/medium/high/emergency). */
export function mapUrgencyToDb(availability: string | null): ProAlert["urgency"] {
  switch (availability) {
    case "asap":
      return "emergency";
    case "today":
      return "high";
    case "this_week":
      return "medium";
    case "custom":
      return "medium";
    default:
      return "low";
  }
}

export interface PersistRequestInput {
  clientId: string;
  category: string;
  subCategory?: string | null;
  description: string;
  photos: string[];
  address: string;
  addressDetails?: string;
  lat: number;
  lng: number;
  budgetMin: number;
  budgetMax: number;
  urgency: ProAlert["urgency"];
  scheduledAt?: string;
  materialsProvided?: boolean;
}

/**
 * Insère la demande en base (service_requests) avec le vrai client_id.
 * Retourne l'id (UUID) de la ligne créée, ou null en cas d'échec.
 * La colonne expires_at prend sa valeur par défaut (NOW() + 2 min).
 */
export async function persistRequest(
  input: PersistRequestInput
): Promise<string | null> {
  if (!isSupabaseReady()) return null;
  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      client_id: input.clientId,
      categories: [input.subCategory || input.category],
      sub_categories: input.subCategory ? [input.subCategory] : null,
      description: input.description,
      media_urls: input.photos.length > 0 ? input.photos.slice(0, 5) : null,
      address: input.address,
      address_details: input.addressDetails || null,
      location: toWktPoint(input.lng, input.lat),
      estimated_price_min: input.budgetMin,
      estimated_price_max: input.budgetMax,
      urgency: input.urgency,
      scheduled_at: input.scheduledAt || null,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) {
    console.error("[requestPersistence] insert failed:", error);
    return null;
  }
  return data?.id ?? null;
}

export type AcceptResult = "accepted" | "expired";

/**
 * Acceptation atomique côté pro : une seule UPDATE protégée par
 * `professional_id IS NULL` et `expires_at > now()`. Si 0 ligne est modifiée,
 * la demande est déjà prise ou expirée.
 */
export async function acceptRequestAsPro(
  requestId: string,
  professionalId: string
): Promise<AcceptResult> {
  if (!isSupabaseReady()) return "expired";
  const { data, error } = await supabase
    .from("service_requests")
    .update({
      professional_id: professionalId,
      status: "accepted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .is("professional_id", null)
    .gt("expires_at", new Date().toISOString())
    .select("id");
  if (error) {
    console.error("[requestPersistence] accept failed:", error);
    return "expired";
  }
  return data && data.length > 0 ? "accepted" : "expired";
}

const DB_URGENCY_TO_CLIENT: Record<string, Urgency> = {
  emergency: "immediate",
  high: "today",
  medium: "this_week",
  low: "flexible",
};

function firstOf(value: unknown, fallback: string): string {
  if (Array.isArray(value) && value.length > 0) return String(value[0]);
  if (typeof value === "string" && value.length > 0) return value;
  return fallback;
}

/** Mappe une ligne service_requests (SQL) vers ClientRequest (vue client). */
export function toClientRequest(row: any): ClientRequest {
  const category = firstOf(row.categories, "maison-reparations");
  const subCategory = firstOf(row.sub_categories, category);
  return {
    id: row.id,
    clientId: row.client_id,
    title: `Intervention ${subCategory === category ? category : subCategory}`,
    description: row.description || "",
    photos: row.media_urls || [],
    category,
    subCategory,
    address: row.address || "",
    addressDetails: row.address_details || undefined,
    budgetXOF: row.estimated_price_max || 0,
    urgency: DB_URGENCY_TO_CLIENT[row.urgency] || "flexible",
    status:
      row.status === "accepted"
        ? "accepted"
        : row.status === "in_progress"
          ? "in_progress"
          : row.status === "completed"
            ? "completed"
            : "created",
    proId: row.professional_id || undefined,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

/** Mappe une ligne service_requests (+ client_profiles) vers ProAlert (vue pro). */
export function toProAlert(row: any): ProAlert {
  const category = firstOf(row.categories, "maison-reparations");
  const cp = row.client_profiles;
  const clientName = cp
    ? `${cp.first_name || ""} ${cp.last_name || ""}`.trim() || "Client"
    : "Client";
  const minXOF = row.estimated_price_min ?? 0;
  const maxXOF = row.estimated_price_max ?? minXOF * 2;
  return {
    id: `alert_${row.id}`,
    requestId: row.id,
    clientName,
    clientPhone: "",
    clientAvatarUrl: undefined,
    category,
    description: row.description || "",
    urgency: row.urgency || "medium",
    estimatedPriceMinXOF: minXOF,
    estimatedPriceMaxXOF: maxXOF,
    location: row.address || "",
    sentAt: row.created_at || "",
    expiresAt: row.expires_at || "",
  };
}

/** Mappe une ligne service_requests vers Mission (vue client, mission acceptée). */
export function toMission(row: any): Mission {
  const category = firstOf(row.categories, "maison-reparations");
  const statusMap: Record<string, Mission["status"]> = {
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
    title: `Intervention ${category}`,
    description: row.description || "",
    category,
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
    acceptedAt:
      row.status === "accepted" || row.status === "in_progress"
        ? row.created_at || undefined
        : undefined,
    inProgressAt: row.started_at || undefined,
  };
}
