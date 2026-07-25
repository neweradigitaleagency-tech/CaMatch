import { useLocation, useNavigate } from "react-router-dom";
import ReviewScreen from "../../components/ReviewScreen";
import { useEscrowStore } from "../../stores/escrowStore";
import { useRequestStore } from "../../stores/requestStore";
import type { Mission } from "../../types";

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const mission = (location.state as { mission: Mission })?.mission;
  const releasePayment = useEscrowStore((s) => s.releasePayment);

  if (!mission) {
    navigate("/orders", { replace: true });
    return null;
  }

  return (
    <ReviewScreen
      mission={mission}
      onBack={goBack}
      onSubmit={(missionId, rating, comment) => {
        releasePayment(missionId);
        navigate("/orders");
      }}
    />
  );
}
