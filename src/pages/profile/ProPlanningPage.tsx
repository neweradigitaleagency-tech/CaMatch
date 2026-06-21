import { useNavigate } from "react-router-dom";
import ProScheduleScreen from "../../components/ProScheduleScreen";
import { MOCK_PRO_JOBS } from "../../services/mockData";

export default function ProPlanningPage() {
  const nav = useNavigate();
  return (
    <ProScheduleScreen
      jobs={MOCK_PRO_JOBS}
      onViewJob={(job) => nav(`/orders/tracker/${job.id}`)}
    />
  );
}
