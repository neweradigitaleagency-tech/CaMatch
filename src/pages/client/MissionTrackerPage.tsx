import { useParams, useNavigate } from "react-router-dom";
import MissionTrackerScreen from "../../components/MissionTrackerScreen";
import { useRequestStore } from "../../stores/requestStore";
import { useChatStore } from "../../stores/chatStore";
import type { MissionStatus } from "../../types";

export default function MissionTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mission = useRequestStore((s) => s.missions.find((m) => m.id === id));
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);
  const conversations = useChatStore((s) => s.conversations);

  if (!mission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <p className="text-sm text-secondary">Mission introuvable</p>
      </div>
    );
  }

  return (
    <MissionTrackerScreen
      mission={mission}
      onBack={() => navigate(-1)}
      onOpenChat={() => {
        const conv = conversations.find((c) => c.missionId === mission.id);
        if (conv) {
          navigate(`/messages/${conv.id}`);
        }
      }}
      onUpdateStatus={(status: MissionStatus) => updateMissionStatus(mission.id, status)}
      onReview={(m) => navigate("/orders/review", { state: { mission: m } })}
    />
  );
}
