import { useNavigate } from "react-router-dom";
import ExplorerScreen from "../components/ExplorerScreen";
import { usePros } from "../hooks/useDatabase";
import { useClientMissions } from "../hooks/useDatabase";

export default function HomePage() {
  const nav = useNavigate();
  const { data: pros = [] } = usePros();
  const { data: missions = [] } = useClientMissions();

  return (
    <ExplorerScreen
      recommendedPros={pros}
      activeMissions={missions.filter((m) => m.status !== "completed" && m.status !== "paid" && m.status !== "reviewed")}
      onSelectPro={(pro) => nav(`/explorer/pro/${pro.id}`)}
      onInitiateAiRequest={() => nav("/explorer/request-creation")}
      onViewActiveMission={(mission) => nav(`/orders/tracker/${mission.id}`)}
    />
  );
}
