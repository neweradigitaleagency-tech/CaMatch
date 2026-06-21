import { useLocation, useNavigate } from "react-router-dom";
import QRPaymentScreen from "../../components/QRPaymentScreen";
import { useRequestStore } from "../../stores/requestStore";
import type { Mission, PaymentMethod } from "../../types";

export default function QRPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const mission = (location.state as { mission: Mission })?.mission;
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);

  if (!mission) {
    navigate("/orders", { replace: true });
    return null;
  }

  return (
    <QRPaymentScreen
      mission={mission}
      onBack={() => navigate(-1)}
      onPay={(missionId: string, method: PaymentMethod) => {
        updateMissionStatus(missionId, "paid");
        navigate("/orders");
      }}
    />
  );
}
