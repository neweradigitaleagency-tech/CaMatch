import { useAppNavigation } from "../../navigation/useAppNavigation";
import ReviewScreen from "../../components/ReviewScreen";
import { useEscrowStore } from "../../stores/escrowStore";
import type { Mission } from "../../types";

export default function ReviewPage() {
  const { goBack, complete, getFlow } = useAppNavigation();
  const mission = getFlow<Mission>("mission");
  const releasePayment = useEscrowStore((s) => s.releasePayment);

  if (!mission) {
    complete({ flow: "mission" });
    return null;
  }

  return (
    <ReviewScreen
      mission={mission}
      onBack={goBack}
      onSubmit={(missionId, rating, comment) => {
        releasePayment(missionId);
        complete({ flow: "mission" });
      }}
    />
  );
}
