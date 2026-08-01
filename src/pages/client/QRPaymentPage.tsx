import { useAppNavigation } from "../../navigation/useAppNavigation";
import QRPaymentScreen from "../../components/QRPaymentScreen";
import { useRequestStore } from "../../stores/requestStore";
import type { Mission } from "../../types";
import type { UnifiedPaymentMethod } from "../../types/payment";

export default function QRPaymentPage() {
  const { goBack, complete, getFlow } = useAppNavigation();
  const mission = getFlow<Mission>("mission");
  const updateMissionStatus = useRequestStore((s) => s.updateMissionStatus);

  if (!mission) {
    complete({ flow: "mission" });
    return null;
  }

  return (
    <QRPaymentScreen
      mission={mission}
      onBack={goBack}
      onPay={(missionId: string, method: UnifiedPaymentMethod) => {
        updateMissionStatus(missionId, "paid");
        complete({ flow: "mission" });
      }}
    />
  );
}
