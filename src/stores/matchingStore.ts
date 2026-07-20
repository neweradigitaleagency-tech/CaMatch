import { create } from "zustand";
import type { Proposal, ProposalStatus, RequestDraft } from "../types";
import type { ProfessionalDetails } from "../types";
import { useRequestStore } from "./requestStore";
import { useNotificationStore } from "./notificationStore";
import { haversineKm } from "./locationStore";
import { getRecommendedMaterials, findCheapestSupplier } from "../services/supplierSearchService";

interface MatchingState {
  proposals: Record<string, Proposal[]>;
  isSearching: boolean;
  searchRequestId: string | null;
  setSearching: (requestId: string | null) => void;
  rankProfessionals: (requestId: string, draft: RequestDraft, pros: ProfessionalDetails[]) => void;
  acceptProposal: (requestId: string, proposalId: string) => void;
  refuseProposal: (requestId: string, proposalId: string) => void;
  getProposalsForRequest: (requestId: string) => Proposal[];
  getProposalById: (requestId: string, proposalId: string) => Proposal | undefined;
}

let proposalCounter = 0;

function computeScore(pro: ProfessionalDetails, draft: RequestDraft, distKm: number): number {
  let score = 0;
  if (pro.category === draft.category) score += 30;
  if (distKm <= 5) score += 20;
  else if (distKm <= 15) score += 15;
  else if (distKm <= 30) score += 10;
  else score += 5;
  if (pro.availabilityStatus === "available") score += 15;
  score += (pro.trustScore ?? 0.5) * 10;
  const respTime = pro.avgResponseTimeMinutes ?? 60;
  if (respTime < 5) score += 10;
  else if (respTime < 30) score += 7;
  else if (respTime < 60) score += 4;
  else score += 1;
  const completion = pro.completionRate ?? 0.8;
  if (completion > 0.95) score += 10;
  else if (completion > 0.8) score += 7;
  else score += 5;
  if (pro.isVerified) score += 5;
  const interventions = pro.completedInterventions ?? 0;
  if (interventions > 50) score += 5;
  else if (interventions > 20) score += 3;
  else score += 1;
  return score;
}

const RADII = [5, 10, 15, 30, 60, Infinity];

export const useMatchingStore = create<MatchingState>((set, get) => ({
  proposals: {},
  isSearching: false,
  searchRequestId: null,

  setSearching: (requestId) => set({ isSearching: !!requestId, searchRequestId: requestId }),

  rankProfessionals: (requestId, draft, pros) => {
    const clientLat = draft.lat || 5.35;
    const clientLng = draft.lng || -4.0;

    const filtered = pros.filter((p) => {
      if (p.category !== draft.category) return false;
      if (draft.subCategory && p.subCategory !== draft.subCategory) return false;
      return true;
    });

    const withDistance = filtered.map((p) => ({
      pro: p,
      dist: (p.lat !== undefined && p.lng !== undefined)
        ? haversineKm({ lat: clientLat, lng: clientLng }, { lat: p.lat, lng: p.lng })
        : Infinity,
    }));

    let eligible: typeof withDistance = [];
    for (const radius of RADII) {
      eligible = withDistance.filter((p) => p.dist <= radius);
      if (eligible.length > 0) break;
    }

    const scored = eligible
      .map(({ pro, dist }) => ({ pro, dist, score: computeScore(pro, draft, dist) }))
      .sort((a, b) => b.score - a.score);

    const city = (draft.address || "Abidjan").split(",")[0]?.trim() || "Abidjan";
    const recommendedMats = getRecommendedMaterials(draft.category || "maison-reparations", draft.subCategory || "");

    const proposals: Proposal[] = scored.map(({ pro, dist, score }) => {
      proposalCounter += 1;

      const materials = recommendedMats.map((rm, i) => {
        const best = findCheapestSupplier(rm.name, city);
        const proMarkup = Math.round(rm.unitPrice * (0.15 + Math.random() * 0.1));
        return {
          id: `mat_${Date.now()}_${i}`,
          name: rm.name,
          quantity: rm.quantity + (Math.random() > 0.7 ? 1 : 0),
          unitPriceXOF: rm.unitPrice + proMarkup,
          totalXOF: (rm.unitPrice + proMarkup) * (rm.quantity + (Math.random() > 0.7 ? 1 : 0)),
          supplierId: best?.sellerId || undefined,
          supplierName: best?.sellerName || undefined,
          supplierPrice: best ? best.price + Math.round(best.deliveryFee / rm.quantity) : undefined,
          supplierAvailable: best !== null,
          supplierDelivery: "delivery" as const,
        };
      });

      const materialsCost = materials.reduce((s, m) => s + m.totalXOF, 0);
      const deliveryCost = draft.materialsPreference === "via_ca_match" ? Math.round(materialsCost * 0.08) : 0;

      return {
        id: `prop_${Date.now()}_${proposalCounter}`,
        requestId,
        professionalId: pro.id,
        professionalName: pro.name,
        professionalAvatar: pro.avatarUrl || "",
        professionalRating: pro.rating || 4.5,
        trustScore: pro.trustScore ?? 0.5,
        distanceKm: Math.round(dist * 10) / 10,
        estimatedArrivalMinutes: Math.round(dist * 2 + 10),
        laborPriceXOF: (pro.hourlyRateXOF || 5000) * 2,
        materialsCostXOF: materialsCost,
        materialsDeliveryXOF: deliveryCost,
        totalXOF: (pro.hourlyRateXOF || 5000) * 2 + materialsCost + deliveryCost,
        materials,
        estimatedDurationMins: 120,
        status: "pending",
        message: "",
        experienceYears: pro.experienceYears || 5,
        reviewCount: pro.reviewCount || 0,
        completedInterventions: pro.completedInterventions || 0,
        isVerified: pro.isVerified || false,
        verificationLevel: pro.verificationLevel || 0,
        avgResponseTimeMinutes: pro.avgResponseTimeMinutes || 30,
        completionRate: pro.completionRate || 0.9,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      };
    });

    set((state) => ({
      proposals: { ...state.proposals, [requestId]: proposals },
      isSearching: false,
      searchRequestId: null,
    }));
  },

  acceptProposal: (requestId, proposalId) => {
    const state = get();
    const proposals = state.proposals[requestId];
    if (!proposals) return;
    const updated = proposals.map((p) =>
      p.id === proposalId ? { ...p, status: "accepted" as ProposalStatus } : { ...p, status: "refused" as ProposalStatus },
    );
    set((s) => ({ proposals: { ...s.proposals, [requestId]: updated } }));

    const accepted = updated.find((p) => p.id === proposalId);
    if (accepted) {
      const request = useRequestStore.getState().requests.find((r) => r.id === requestId);
      useNotificationStore.getState().addNotification({
        type: "mission",
        title: "Proposition acceptée",
        body: `Vous avez choisi ${accepted.professionalName}`,
        actionUrl: `/orders/tracker/${requestId}`,
      });
    }
  },

  refuseProposal: (requestId, proposalId) => {
    set((s) => ({
      proposals: {
        ...s.proposals,
        [requestId]: (s.proposals[requestId] || []).map((p) =>
          p.id === proposalId ? { ...p, status: "refused" as ProposalStatus } : p,
        ),
      },
    }));
  },

  getProposalsForRequest: (requestId) => get().proposals[requestId] || [],
  getProposalById: (requestId, proposalId) =>
    (get().proposals[requestId] || []).find((p) => p.id === proposalId),
}));
