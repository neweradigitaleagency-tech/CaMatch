import { useNavigate, useParams, useLocation } from "react-router-dom";
import ProfilProScreen from "../../components/ProfilProScreen";
import { MOCK_PROS, MOCK_SERVICES, MOCK_PORTFOLIO, MOCK_VERIFICATION } from "../../services/mockData";

export default function ProProfilePage() {
  const nav = useNavigate();
  const { proId } = useParams<{ proId: string }>();
  const location = useLocation();

  const pro = MOCK_PROS.find((p) => p.id === proId) ?? MOCK_PROS[0];
  const services = MOCK_SERVICES.filter((s) => s.proId === pro.id);
  const portfolio = MOCK_PORTFOLIO.filter((p) => p.category === pro.category);

  return (
    <ProfilProScreen
      pro={pro}
      services={services}
      portfolio={portfolio}
      verification={MOCK_VERIFICATION}
      onBack={() => nav(-1)}
      onInitiateMatch={(selectedServices) =>
        nav("/explorer/matching", { state: { pro, services: selectedServices } })
      }
    />
  );
}
