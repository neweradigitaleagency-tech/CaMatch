import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import MissionTrackerScreen from "../../components/MissionTrackerScreen";
import ProControlPanel from "../../components/ProControlPanel";
import InvoiceScreen from "../../components/InvoiceScreen";
import { useRequestStore } from "../../stores/requestStore";
import { useProStore } from "../../stores/proStore";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { findConversation, createConversation } from "../../services/chatService";
import { useNotifications } from "../../hooks/useNotifications";
import { MOCK_PRO_JOBS, MOCK_PRO_ALERTS } from "../../services/mockData";
import type { MissionStatus, Invoice, ProJobStatus } from "../../types";

const MOCK_INVOICE: Invoice = {
  id: "INV-2026-001",
  missionId: "m1",
  clientId: "client_marie",
  proId: "pro3",
  clientName: "Marie Kouadio",
  proName: "Mamadou K.",
  category: "ac",
  address: "Cocody Riviera 3, Abidjan",
  reason: "Diagnostic et recharge fréon du split climatisation ne soufflant que de l'air chaud.",
  laborCostXOF: 15000,
  materialsCostXOF: 12000,
  travelCostXOF: 5000,
  totalXOF: 35000,
  commissionPercent: 15,
  commissionXOF: 5250,
  proAmountXOF: 29750,
  beforePhotos: [
    "https://images.unsplash.com/photo-1585774923346-0ac6d18c29b0?w=400&h=300&fit=crop",
  ],
  afterPhotos: [
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
  ],
  clientRating: 9,
  clientComment: "Très professionnel, intervention rapide et propre. Je recommande !",
  createdAt: "2026-06-17T12:00:00Z",
  paidAt: "2026-06-17T12:30:00Z",
};

export default function MissionTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useBackNavigation("/orders");
  const isPro = useAuthStore((s) => s.isPro);
  const mission = useRequestStore((s) => s.missions.find((m) => m.id === id));
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);
  const proJobs = useProStore((s) => s.jobs);
  const setProJobs = useProStore((s) => s.setJobs);
  const updateProJobStatus = useProStore((s) => s.updateJobStatus);
  const conversations = useChatStore((s) => s.conversations);
  const [showInvoice, setShowInvoice] = useState(false);

  const { sendLocalNotification } = useNotifications();

  useEffect(() => {
    if (isPro && proJobs.length === 0) {
      setProJobs(MOCK_PRO_JOBS);
      useProStore.getState().setAlerts(MOCK_PRO_ALERTS);
    }
  }, [isPro, proJobs.length, setProJobs]);

  const proJob = isPro ? proJobs.find((j) => j.id === id) || MOCK_PRO_JOBS.find((j) => j.id === id) : null;

  if (!mission && !proJob) {
    return (
      <div className="flex items-center justify-center min-h-dynamic bg-cm-bg">
        <p className="text-sm text-cm-text-soft">Mission introuvable</p>
      </div>
    );
  }

  if (isPro && proJob) {
    return (
      <ProControlPanel
        job={proJob}
        onUpdateStatus={(jobId, status) => {
          updateProJobStatus(jobId, status);
          sendLocalNotification("Statut mis à jour", `Mission ${status === "photos_taken" ? "photos prises" : status}`);
        }}
        onComplete={() => navigate("/orders")}
        onNotification={sendLocalNotification}
      />
    );
  }

  if (!mission) {
    return (
      <div className="flex items-center justify-center min-h-dynamic bg-cm-bg">
        <p className="text-sm text-cm-text-soft">Mission introuvable</p>
      </div>
    );
  }

  return (
    <>
      {showInvoice ? (
        <InvoiceScreen mission={mission} invoice={MOCK_INVOICE} onBack={() => setShowInvoice(false)} />
      ) : (
        <MissionTrackerScreen
          mission={mission}
          onBack={goBack}
          onOpenChat={async () => {
            if (!mission) return;
            const conv = conversations.find((c) => c.missionId === mission.id);
            if (conv) {
              navigate(`/messages/${conv.id}`);
              return;
            }
            const userId = useAuthStore.getState().userId;
            if (userId && mission.proId) {
              const existing = await findConversation(userId, mission.proId, mission.id);
              if (existing) {
                navigate(`/messages/${existing}`);
              } else {
                const created = await createConversation({
                  participant1: userId,
                  participant2: mission.proId,
                  jobId: mission.id,
                });
                if (created) {
                  navigate(`/messages/${created}`);
                }
              }
            }
          }}
          onOpenInvoice={() => setShowInvoice(true)}
          onUpdateStatus={(status: MissionStatus) => updateMissionStatus(mission.id, status)}
          onReview={(m) => navigate("/orders/review", { state: { mission: m } })}
          onDispute={(id) => navigate(`/orders/dispute/${id}`)}
          onCancel={(id) => navigate(`/orders/cancel/${id}`)}
        />
      )}
    </>
  );
}
