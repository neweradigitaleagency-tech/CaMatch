import { useAppNavigation } from "../../navigation/useAppNavigation";
import RequestWizardScreen from "../../components/wizard/RequestWizardScreen";
import { useRequestWizardStore } from "../../stores/requestWizardStore";
import { useRequestStore } from "../../stores/requestStore";
import { useMatchingStore } from "../../stores/matchingStore";
import { useProStore } from "../../stores/proStore";
import { useAuthStore } from "../../stores/authStore";
import { usePros } from "../../hooks/useDatabase";
import { seedWorkflowData, generateMockProposals } from "../../data/mockWorkflowData";
import { persistRequest, mapUrgencyToDb } from "../../services/requestPersistence";
import { isDemoMode, isSupabaseReady } from "../../services/supabase";
import type { ClientRequest, ProAlert } from "../../types";

function mapUrgency(u: string): ProAlert["urgency"] {
  switch (u) {
    case "asap": return "emergency";
    case "today": return "high";
    case "this_week": return "medium";
    case "custom": return "medium";
    default: return "low";
  }
}

export default function RequestWizardPage() {
  const { goBack, navigate } = useAppNavigation();
  const { draft, reset } = useRequestWizardStore();
  const addRequest = useRequestStore((s) => s.addRequest);
  const proAlerts = useProStore((s) => s.alerts);
  const setProAlerts = useProStore((s) => s.setAlerts);
  const { data: allPros = [] } = usePros();
  const { rankProfessionals, setSearching } = useMatchingStore();

  const handleSubmit = async () => {
    const realMode = isSupabaseReady() && !isDemoMode();
    const userId = useAuthStore.getState().userId;

    const budgetXOF = draft.budgetMode === "receive_proposals"
      ? 0
      : draft.budgetMode === "range"
        ? draft.budgetMax
        : draft.budgetMax;

    let requestId = "cr_" + Date.now();
    let persistedId: string | null = null;

    if (realMode && userId) {
      persistedId = await persistRequest({
        clientId: userId,
        category: draft.category || "",
        subCategory: draft.subCategory || undefined,
        description: draft.description,
        photos: draft.photos,
        address: draft.address,
        addressDetails: draft.addressComplement || undefined,
        lat: draft.lat,
        lng: draft.lng,
        budgetMin: draft.budgetMin,
        budgetMax: draft.budgetMax,
        urgency: mapUrgencyToDb(draft.availability || null),
        scheduledAt: draft.scheduledDate || undefined,
        materialsProvided: draft.materialsPreference === "pro_provides",
      });
      if (persistedId) requestId = persistedId;
    }

    const sandboxFallback = !realMode || !persistedId;

    const newRequest: ClientRequest = {
      id: requestId,
      clientId: userId ?? "client_marie",
      title: draft.subCategory || draft.category || "Demande de service",
      description: draft.description,
      photos: draft.photos,
      videos: draft.videos.length > 0 ? draft.videos : undefined,
      category: draft.category || "",
      subCategory: draft.subCategory || undefined,
      address: draft.address,
      addressDetails: draft.addressComplement || undefined,
      lat: draft.lat,
      lng: draft.lng,
      budgetXOF,
      urgency: draft.availability === "asap" ? "immediate" : draft.availability === "today" ? "today" : draft.availability === "this_week" ? "this_week" : "flexible",
      scheduledAt: draft.scheduledDate || undefined,
      materialsProvided: draft.materialsPreference === "pro_provides",
      materialsCost: 0,
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRequest(newRequest);

    if (sandboxFallback) {
      const newAlert: ProAlert = {
        id: "alert_" + Date.now(),
        requestId,
        clientName: "Marie K.",
        clientPhone: "+225 01 02 03 04",
        category: draft.category || "",
        description: draft.description,
        urgency: mapUrgency(draft.availability || "flexible"),
        estimatedPriceMinXOF: budgetXOF || 15000,
        estimatedPriceMaxXOF: (budgetXOF || 15000) * 2,
        location: draft.address,
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 120000).toISOString(),
      };
      setProAlerts([newAlert, ...proAlerts]);
    }

    setSearching(requestId);
    rankProfessionals(requestId, draft, allPros);
    const mockProposals = generateMockProposals(requestId);
    useMatchingStore.getState().proposals[requestId] = mockProposals;
    reset();

    navigate(`/orders/matching/${requestId}`);
  };

  return (
    <RequestWizardScreen
      onBack={goBack}
      onSubmit={handleSubmit}
    />
  );
}
