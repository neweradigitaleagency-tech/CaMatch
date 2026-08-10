import { useEffect } from "react";
import { useParams } from "react-router-dom";
import MissionTrackerScreen from "../../components/MissionTrackerScreen";
import ProControlPanel from "../../components/ProControlPanel";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useRequestStore } from "../../stores/requestStore";
import { useProStore } from "../../stores/proStore";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { useNotifications } from "../../hooks/useNotifications";
import { MOCK_PRO_JOBS, MOCK_PRO_ALERTS } from "../../services/mockData";
import type { MissionStatus } from "../../types";

export default function MissionTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const { goBack, navigate, startFlow } = useAppNavigation();
  const isPro = useAuthStore((s) => s.isPro);
  const mission = useRequestStore((s) => s.missions.find((m) => m.id === id));
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);
  const proJobs = useProStore((s) => s.jobs);
  const setProJobs = useProStore((s) => s.setJobs);
  const updateProJobStatus = useProStore((s) => s.updateJobStatus);

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

  const openFlow = (path: string) => {
    startFlow("mission", mission);
    navigate(path);
  };

  return (
    <MissionTrackerScreen
      mission={mission}
      onBack={goBack}
      onOpenChat={async () => {
        if (!mission) return;
        const userId = useAuthStore.getState().userId;
        if (!userId || !mission.proId) return;
        const conv = await useChatStore.getState().createConversation({
          participant1: userId,
          participant2: mission.proId,
          jobId: mission.id,
        });
        if (conv) navigate(`/messages/${conv.id}`);
      }}
      onOpenInvoice={() => openFlow("/orders/invoice")}
      onQRPayment={() => openFlow("/orders/qr-payment")}
      onUpdateStatus={(status: MissionStatus) => updateMissionStatus(mission.id, status)}
      onReview={(m) => openFlow("/orders/review")}
      onDispute={(id) => navigate(`/orders/dispute/${id}`)}
      onCancel={(id) => navigate(`/orders/cancel/${id}`)}
    />
  );
}
