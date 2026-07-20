import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import ProMissionListScreen from "../../components/ProMissionListScreen";
import { useRequestStore } from "../../stores/requestStore";

export default function ProMissionListPage() {
  const navigate = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");
  const missions = useRequestStore((s) => s.missions);

  return (
    <ProMissionListScreen
      missions={missions}
      onBack={goBack}
      onSelectMission={(mission) => navigate(`/orders/tracker/${mission.id}`)}
    />
  );
}
