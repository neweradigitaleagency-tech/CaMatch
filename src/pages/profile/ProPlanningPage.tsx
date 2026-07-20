import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { ArrowLeft } from "lucide-react";
import ProScheduleScreen from "../../components/ProScheduleScreen";
import { MOCK_PRO_JOBS } from "../../services/mockData";

export default function ProPlanningPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");
  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl border-b border-cm-border/40 px-4 pt-3 pb-2">
        <button onClick={goBack}
          className="cm-scale-btn w-8 h-8 flex items-center justify-center rounded-[12px] bg-cm-elevated hover:bg-cm-border/50 cursor-pointer shrink-0">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
      </div>
      <ProScheduleScreen
        jobs={MOCK_PRO_JOBS}
        onViewJob={(job) => nav(`/orders/tracker/${job.id}`)}
      />
    </div>
  );
}
