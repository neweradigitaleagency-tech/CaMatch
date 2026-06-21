import { useLocation, useNavigate } from "react-router-dom";
import ReviewScreen from "../../components/ReviewScreen";
import { useRequestStore } from "../../stores/requestStore";
import type { Mission } from "../../types";

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const mission = (location.state as { mission: Mission })?.mission;
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);

  if (!mission) {
    navigate("/orders", { replace: true });
    return null;
  }

  return (
    <ReviewScreen
      mission={mission}
      onBack={() => navigate(-1)}
      onSubmit={(missionId, rating, comment) => {
        updateMissionStatus(missionId, "reviewed");
        navigate("/orders");
      }}
    />
  );
}
