import { useNavigate, useLocation } from "react-router-dom";
import AiMatchAndPricingScreen from "../../components/AiMatchAndPricingScreen";
import type { ProfessionalDetails, Service } from "../../types";

export default function AiMatchPricingPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { pro, services } = (location.state as {
    pro: ProfessionalDetails;
    services: Service[];
  }) ?? { pro: null, services: [] as Service[] };

  if (!pro) {
    nav("/explorer", { replace: true });
    return null;
  }

  return (
    <AiMatchAndPricingScreen
      pro={pro}
      selectedServices={services}
      onBack={() => nav(-1)}
      onConfirmMatch={(travel, labor, total) =>
        nav("/orders/new", { state: { pro, services, travel, labor, total } })
      }
    />
  );
}
