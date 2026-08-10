import type { ProJobStatus } from "../../types";

export function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR") + " F";
}

export const STATUS_FLOW = ["accepted", "en_route", "arrived", "photos_taken", "in_progress", "completed", "client_validation"] as const;

export type FlowStatus = (typeof STATUS_FLOW)[number];

export function nextStatus(current: string): FlowStatus | null {
  const idx = STATUS_FLOW.indexOf(current as FlowStatus);
  if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1] ?? null;
}

export const FLOW_BUTTON_LABELS: Record<string, string> = {
  quote_required: "Créer un devis",
  accepted: "Je suis en route",
  en_route: "Je suis arrivé",
  arrived: "Photo avant intervention",
  photos_taken: "Commencer le travail",
  in_progress: "Travail terminé",
  completed: "En attente validation client",
  client_validation: "En attente du client",
};

export const STATUS_CONFIG: Record<string, { border: string; dot: string; badge: string }> = {
  pending:        { border: "border-l-amber-400",  dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700" },
  accepted:       { border: "border-l-emerald-500", dot: "bg-emerald-500",badge: "bg-emerald-50 text-emerald-700" },
  quote_required: { border: "border-l-violet-500",  dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700" },
  en_route:       { border: "border-l-blue-500",    dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700" },
  arrived:        { border: "border-l-sky-500",     dot: "bg-sky-500",    badge: "bg-sky-50 text-sky-700" },
  in_progress:    { border: "border-l-orange-500",  dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700" },
  completed:      { border: "border-l-cm-text-muted",    dot: "bg-cm-text-muted",   badge: "bg-cm-surface text-cm-text-soft" },
  client_validation: { border: "border-l-teal-500", dot: "bg-teal-500",  badge: "bg-teal-50 text-teal-700" },
  closed:         { border: "border-l-cm-text",    dot: "bg-cm-text",   badge: "bg-cm-surface text-cm-text" },
  cancelled:      { border: "border-l-red-500",     dot: "bg-red-500",    badge: "bg-red-50 text-red-700" },
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Nouvelle",
  accepted: "Acceptée",
  quote_required: "Devis requis",
  en_route: "En route",
  arrived: "Arrivé",
  in_progress: "En cours",
  completed: "Terminée",
  client_validation: "Validation",
  closed: "Clôturée",
  cancelled: "Annulée",
};

export const ACTIVE_JOB_STATUSES: ProJobStatus[] = [
  "accepted", "quote_required", "en_route", "arrived", "photos_taken", "in_progress", "client_validation",
];

export const IN_PROGRESS_STATUSES: ProJobStatus[] = [
  "en_route", "arrived", "photos_taken", "in_progress", "client_validation",
];

export const SCHEDULED_STATUSES: ProJobStatus[] = [
  "accepted", "pending", "quote_required",
];

export const DONE_STATUSES: ProJobStatus[] = [
  "completed", "closed", "cancelled",
];

export const TRAVEL_TIERS = [
  { id: "same_zone", label: "Même zone", hint: "Le pro est déjà dans la zone", amountXOF: 1300 },
  { id: "adjacent_zone", label: "Zone voisine", hint: "Déplacement hors zone", amountXOF: 2000 },
  { id: "consultation", label: "Consultation", hint: "Visite de diagnostic", amountXOF: 1500 },
] as const;

export type TravelTierId = (typeof TRAVEL_TIERS)[number]["id"];

export function getTravelTier(tierId: TravelTierId | null) {
  if (!tierId) return null;
  return TRAVEL_TIERS.find((t) => t.id === tierId) ?? null;
}

export const TRAVEL_PICKUP_SURCHARGE_XOF = 500;
