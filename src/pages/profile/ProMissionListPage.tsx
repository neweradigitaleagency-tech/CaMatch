import { useNavigate } from "react-router-dom";
import ProMissionListScreen from "../../components/ProMissionListScreen";
import { useRequestStore } from "../../stores/requestStore";

export default function ProMissionListPage() {
  const navigate = useNavigate();
  const missions = useRequestStore((s) => s.missions);

  return (
    <ProMissionListScreen
      missions={missions}
      onBack={() => navigate(-1)}
      onSelectMission={(mission) => navigate(`/orders/tracker/${mission.id}`)}
    />
  );
}
