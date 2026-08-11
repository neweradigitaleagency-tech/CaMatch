import type { Mission, ProAlert, ProJob, ProJobStatus, Proposal } from "../types";
import { useRequestStore } from "../stores/requestStore";
import { useProStore } from "../stores/proStore";
import { useChatStore } from "../stores/chatStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useAuthStore } from "../stores/authStore";
import { acceptRequestAsPro } from "./requestPersistence";
import { isDemoMode, isSupabaseReady } from "./supabase";
import { MOCK_PROS } from "./mockData";

// ─── Identité sandbox (démo mono-utilisateur) ───

export const SANDBOX_CLIENT_ID = "client_marie";
export const SANDBOX_CLIENT_NAME = "Marie K.";
export const SANDBOX_CLIENT_PHONE = "+225 01 23 45 67";
export const SANDBOX_CLIENT_LOCATION = "Cocody Riviera 3, Abidjan";

/** Le pro de la démo (celui dont les jobs/alertes sont seedés). */
export function getSandboxPro() {
  return MOCK_PROS[5] ?? MOCK_PROS[0];
}

export function missionIdFromRequest(requestId: string): string {
  return `mission_${requestId}`;
}

export interface SyncMissionAcceptParams {
  requestId: string;
  proId: string;
  proName: string;
  proAvatar: string;
  proPhone: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  clientLocation?: string;
  title: string;
  description: string;
  category: string;
  address: string;
  budgetXOF: number;
  laborFeeXOF?: number;
  totalFeeXOF: number;
  missionStatus?: Mission["status"];
  jobStatus?: ProJobStatus;
  pricingModel?: "fixed" | "quote";
  beforePhoto?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

export interface SyncMissionAcceptResult {
  missionId: string;
  mission: Mission;
  job: ProJob;
}

/**
 * Synchronise l'acceptation d'une mission entre tous les stores
 * (requestStore côté client, proStore côté pro, chat, notifications).
 */
export function syncMissionAccept(params: SyncMissionAcceptParams): SyncMissionAcceptResult {
  const clientId = params.clientId || SANDBOX_CLIENT_ID;
  const clientName = params.clientName || SANDBOX_CLIENT_NAME;
  const clientPhone = params.clientPhone || SANDBOX_CLIENT_PHONE;
  const clientLocation = params.clientLocation || SANDBOX_CLIENT_LOCATION;
  const missionId = missionIdFromRequest(params.requestId);
  const missionStatus = params.missionStatus ?? "accepted";
  const jobStatus: ProJobStatus = params.jobStatus ?? (params.pricingModel === "quote" ? "quote_required" : "accepted");
  const now = new Date().toISOString();

  const requestStore = useRequestStore.getState();
  const proStore = useProStore.getState();
  const request = requestStore.requests.find((r) => r.id === params.requestId);

  // 1) Demande client → acceptée
  if (request) {
    requestStore.setRequestField(request.id, "status", "accepted");
    requestStore.setRequestField(request.id, "proId", params.proId);
    if (params.pricingModel) requestStore.setRequestField(request.id, "pricingModel", params.pricingModel);
  }

  // 2) Mission (vue client)
  const mission: Mission = {
    id: missionId,
    requestId: params.requestId,
    clientId,
    proId: params.proId,
    status: missionStatus,
    pricingModel: params.pricingModel,
    title: params.title,
    description: params.description,
    category: params.category,
    address: params.address,
    budgetXOF: params.budgetXOF,
    photos: request?.photos ?? [],
    proName: params.proName,
    proAvatar: params.proAvatar,
    proPhone: params.proPhone,
    clientName,
    clientPhone,
    createdAt: now,
    acceptedAt: missionStatus !== "pending" ? now : undefined,
  };
  requestStore.upsertMission(mission);

  // 3) Job (vue pro)
  const job: ProJob = {
    id: missionId,
    clientId,
    clientName,
    clientPhone,
    clientLocation,
    category: params.category,
    serviceName: params.title,
    description: params.description,
    status: jobStatus,
    travelFeeXOF: 0,
    laborFeeXOF: params.laborFeeXOF ?? params.totalFeeXOF,
    totalFeeXOF: params.totalFeeXOF,
    createdAt: now,
    scheduledDate: params.scheduledDate,
    scheduledTime: params.scheduledTime,
    pricingModel: params.pricingModel,
    beforePhoto: params.beforePhoto,
  };
  proStore.upsertJob(job);

  // 4) Alerte du pro → consommée
  const alert = proStore.alerts.find((a) => a.requestId === params.requestId);
  if (alert) proStore.removeAlert(alert.id);

  // 5) Conversation client ↔ pro liée à la mission
  void useChatStore.getState().createConversation({
    participant1: clientId,
    participant2: params.proId,
    jobId: missionId,
    metadata: {
      mission_phase: "accepted",
      job_snapshot: {
        category: params.category,
        location: params.address,
        price_estimate: params.totalFeeXOF,
        currency: "XOF",
        service_type: "on_demand",
      },
      created_from: "job_accept",
    },
  });

  // 6) Notification
  useNotificationStore.getState().addNotification({
    type: "mission",
    title: "Mission acceptée",
    body: `${params.proName} a accepté votre demande — ${params.title}`,
    actionUrl: `/orders/tracker/${missionId}`,
  });

  return { missionId, mission, job };
}

/** Côté client : choisir une proposition dans le matching. */
export function acceptProposalToMission(proposal: Proposal, requestId: string): SyncMissionAcceptResult {
  return syncMissionAccept({
    requestId,
    proId: proposal.professionalId,
    proName: proposal.professionalName,
    proAvatar: proposal.professionalAvatar,
    proPhone: "+225 07 00 00 00",
    title: proposal.professionalName ? `Intervention ${proposal.professionalName}` : "Intervention",
    description: proposal.message?.slice(0, 100) || "Mission créée",
    category: "maison-reparations",
    address: SANDBOX_CLIENT_LOCATION,
    budgetXOF: proposal.totalXOF,
    laborFeeXOF: proposal.laborPriceXOF,
    totalFeeXOF: proposal.totalXOF,
    missionStatus: "accepted",
    jobStatus: "accepted",
    pricingModel: "fixed",
  });
}

/**
 * Côté pro : accepter une alerte (prix fixe ou devis).
 * En mode réel, l'acceptation est d'abord persistée en base de façon atomique
 * (`acceptRequestAsPro`). Si la demande est déjà prise ou expirée, l'alerte
 * disparaît de la vue calculée et on retourne null.
 */
export async function acceptAlertAsPro(
  alert: ProAlert,
  model: "fixed" | "quote"
): Promise<SyncMissionAcceptResult | null> {
  const pro = getSandboxPro();
  const realMode = isSupabaseReady() && !isDemoMode();
  const authUserId = useAuthStore.getState().userId;

  if (realMode) {
    if (!authUserId) return null;
    const result = await acceptRequestAsPro(alert.requestId, authUserId);
    if (result === "expired") {
      useProStore.getState().removeAlert(alert.id);
      return null;
    }
  }

  const request = useRequestStore.getState().requests.find((r) => r.id === alert.requestId);
  return syncMissionAccept({
    requestId: alert.requestId,
    proId: realMode && authUserId ? authUserId : pro?.id ?? "pro_mock",
    proName: pro?.name ?? "Vous",
    proAvatar: pro?.avatarUrl ?? "",
    proPhone: pro?.phoneNumber ?? "",
    clientId: request?.clientId,
    clientName: alert.clientName,
    clientPhone: alert.clientPhone,
    clientLocation: alert.location,
    title: "Intervention",
    description: alert.description,
    category: alert.category,
    address: alert.location,
    budgetXOF: alert.estimatedPriceMaxXOF,
    laborFeeXOF: alert.estimatedPriceMinXOF,
    totalFeeXOF: alert.estimatedPriceMinXOF,
    missionStatus: model === "quote" ? "quote_requested" : "accepted",
    jobStatus: model === "quote" ? "quote_required" : "accepted",
    pricingModel: model,
  });
}

/** Synchronise un changement de statut sur les deux vues (client + pro). */
export function syncMissionStatus(missionId: string, status: string): void {
  useRequestStore.getState().updateMissionStatus(missionId, status);
  useProStore.getState().updateJobStatus(missionId, status);
}
