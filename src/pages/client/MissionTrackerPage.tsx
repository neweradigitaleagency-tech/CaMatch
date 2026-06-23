import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MissionTrackerScreen from "../../components/MissionTrackerScreen";
import ProControlPanel from "../../components/ProControlPanel";
import CallScreen from "../../components/CallScreen";
import InvoiceScreen from "../../components/InvoiceScreen";
import { useRequestStore } from "../../stores/requestStore";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { useNotifications } from "../../hooks/useNotifications";
import { MOCK_PRO_JOBS } from "../../services/mockData";
import type { MissionStatus, CallSession, Invoice } from "../../types";

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
  const isPro = useAuthStore((s) => s.isPro);
  const mission = useRequestStore((s) => s.missions.find((m) => m.id === id));
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);
  const conversations = useChatStore((s) => s.conversations);
  const [showCall, setShowCall] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const { sendLocalNotification } = useNotifications();
  const proJob = isPro ? MOCK_PRO_JOBS.find((j) => j.id === id) : null;

  if (!mission && !proJob) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cm-bg">
        <p className="text-sm text-cm-text-soft">Mission introuvable</p>
      </div>
    );
  }

  const callSession: CallSession = {
    id: "call_1",
    callerId: "client_marie",
    calleeId: mission?.proId || proJob?.id || "pro_mock",
    callerName: "Marie Kouadio",
    callerAvatar: "",
    calleeName: mission?.proName || proJob?.clientName || "Pro",
    calleeAvatar: mission?.proAvatar || "",
    status: "ringing",
    durationMs: 0,
    startedAt: new Date().toISOString(),
    isIncoming: false,
  };

  if (isPro && proJob) {
    return (
      <ProControlPanel
        job={proJob}
        onUpdateStatus={(jobId, status) => console.log("Pro job status update:", jobId, status)}
        onComplete={() => navigate("/orders")}
        onNotification={sendLocalNotification}
      />
    );
  }

  if (!mission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cm-bg">
        <p className="text-sm text-cm-text-soft">Mission introuvable</p>
      </div>
    );
  }

  return (
    <>
      {showCall ? (
        <CallScreen session={callSession} onEnd={() => setShowCall(false)} />
      ) : showInvoice ? (
        <InvoiceScreen mission={mission} invoice={MOCK_INVOICE} onBack={() => setShowInvoice(false)} />
      ) : (
        <MissionTrackerScreen
          mission={mission}
          onBack={() => navigate(-1)}
          onOpenChat={() => {
            const conv = conversations.find((c) => c.missionId === mission.id);
            if (conv) navigate(`/messages/${conv.id}`);
          }}
          onOpenCall={() => setShowCall(true)}
          onOpenInvoice={() => setShowInvoice(true)}
          onUpdateStatus={(status: MissionStatus) => updateMissionStatus(mission.id, status)}
          onReview={(m) => navigate("/orders/review", { state: { mission: m } })}
        />
      )}
    </>
  );
}
