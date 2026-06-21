import { useNavigate, useLocation } from "react-router-dom";
import ProSelectionScreen from "../../components/ProSelectionScreen";
import { usePros } from "../../hooks/useDatabase";
import type { ProfessionalDetails, Service } from "../../types";
import type { AiRequestDetails } from "../../components/RequestCreationScreen";

export default function ProSelectionPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { details } = (location.state as { details: AiRequestDetails }) ?? {};
  const category = details?.category || "ac";
  const { data: allPros = [] } = usePros();

  const proList = allPros.filter((p) => p.category === category);

  return (
    <ProSelectionScreen
      category={category}
      proList={proList}
      onBack={() => nav(-1)}
      onViewProfile={(pro) => nav(`/explorer/pro/${pro.id}`)}
      onSelectPro={(pro) => {
        const ms: Service = {
          id: "service_ai_" + Date.now(),
          proId: pro.id,
          name: details?.subCategory || "Dépannage IA",
          description: details?.summary || "Intervention diagnostiquée par intelligence artificielle",
          priceEstimateXOF:
            Math.round(((details?.estimatedPriceMinXOF || 0) + (details?.estimatedPriceMaxXOF || 10000)) / 2) || pro.hourlyRateXOF * 2,
        };
        nav("/explorer/matching", { state: { pro, services: [ms] } });
      }}
    />
  );
}
