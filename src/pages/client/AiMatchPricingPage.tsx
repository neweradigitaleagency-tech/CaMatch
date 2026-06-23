import { useNavigate, useLocation } from "react-router-dom";
import AiMatchAndPricingScreen from "../../components/AiMatchAndPricingScreen";
import { useRequestStore } from "../../stores/requestStore";
import type { ProfessionalDetails, Service, Mission } from "../../types";

export default function AiMatchPricingPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { pro, services } = (location.state as {
    pro: ProfessionalDetails;
    services: Service[];
  }) ?? { pro: null, services: [] as Service[] };

  const setMissions = useRequestStore((s) => s.setMissions);
  const missions = useRequestStore((s) => s.missions);

  if (!pro) {
    nav("/explorer", { replace: true });
    return null;
  }

  return (
    <AiMatchAndPricingScreen
      pro={pro}
      selectedServices={services}
      onBack={() => nav(-1)}
      onConfirmMatch={(travel, labor, total) => {
        const newMission: Mission = {
          id: "mission_" + Date.now(),
          requestId: "req_" + Date.now(),
          clientId: "client_marie",
          proId: pro.id,
          status: "accepted",
          title: services[0]?.name || pro.title,
          description: services[0]?.description || "Intervention confirmée",
          category: pro.category,
          address: pro.locationNeighborhood,
          budgetXOF: total,
          photos: [],
          proName: pro.name,
          proAvatar: pro.avatarUrl || "",
          proPhone: pro.phoneNumber,
          clientName: "Marie",
          clientPhone: "+225 01 02 03 04",
          createdAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
        };
        setMissions([newMission, ...missions]);
        nav(`/orders/tracker/${newMission.id}`);
      }}
    />
  );
}
