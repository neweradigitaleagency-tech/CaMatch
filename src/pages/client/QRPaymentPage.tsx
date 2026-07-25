import { useLocation, useNavigate } from "react-router-dom";
import QRPaymentScreen from "../../components/QRPaymentScreen";
import { useRequestStore } from "../../stores/requestStore";
import type { Mission } from "../../types";
import type { UnifiedPaymentMethod } from "../../types/payment";

export default function QRPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const mission = (location.state as { mission: Mission })?.mission;
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);

  if (!mission) {
    navigate("/orders", { replace: true });
    return null;
  }

  return (
    <QRPaymentScreen
      mission={mission}
      onBack={goBack}
      onPay={(missionId: string, method: UnifiedPaymentMethod) => {
        updateMissionStatus(missionId, "paid");
        navigate("/orders");
      }}
    />
  );
}
