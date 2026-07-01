import { useNavigate, useParams } from "react-router-dom";
import ProfilProScreen from "../../components/ProfilProScreen";
import { MOCK_PROS, MOCK_SERVICES, MOCK_PORTFOLIO, MOCK_VERIFICATION, getReviewsForPro, getBadgesForXp } from "../../services/mockData";
import type { Service } from "../../types";

const DEFAULT_SERVICES: Record<string, { name: string; desc: string; price: number }[]> = {
  plumber: [
    { name: "Débouchage", desc: "Débouchage mécanique des canalisations", price: 12000 },
    { name: "Remplacement robinet", desc: "Remplacement de mitigeur ou robinetterie", price: 20000 },
    { name: "Réparation fuite", desc: "Détection et réparation de fuite d'eau", price: 18000 },
  ],
  electricity: [
    { name: "Diagnostic électrique", desc: "Vérification complète de l'installation", price: 15000 },
    { name: "Remplacement prise", desc: "Remplacement de prise ou interrupteur", price: 8000 },
    { name: "Tableau électrique", desc: "Mise aux normes du tableau électrique", price: 35000 },
  ],
  carpenter: [
    { name: "Fabrication meuble", desc: "Meuble sur mesure en bois massif", price: 50000 },
    { name: "Réparation meuble", desc: "Réparation de meuble ancien ou cassé", price: 15000 },
    { name: "Installation étagère", desc: "Pose d'étagères murales", price: 12000 },
  ],
};

function getDefaultServices(proId: string, category: string): Service[] {
  const templates = DEFAULT_SERVICES[category];
  if (!templates) return [];
  return templates.map((t, i) => ({
    id: `${proId}_svc_${i}`,
    proId,
    name: t.name,
    description: t.desc,
    priceEstimateXOF: t.price,
  }));
}

export default function ProProfilePage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();

  const pro = MOCK_PROS.find((p) => p.id === id) ?? MOCK_PROS[0]!;
  const filteredServices = MOCK_SERVICES.filter((s) => s.proId === pro.id);
  const services = filteredServices.length > 0 ? filteredServices : getDefaultServices(pro.id, pro.category);
  const portfolio = MOCK_PORTFOLIO.filter((p) => p.category === pro.category);
  const reviews = getReviewsForPro(pro.id);
  const xp = pro.completedInterventions * 50;
  const badges = getBadgesForXp(xp);

  return (
    <ProfilProScreen
      pro={pro}
      services={services}
      portfolio={portfolio}
      verification={MOCK_VERIFICATION}
      reviews={reviews}
      badges={badges}
      onBack={() => nav(-1)}
      onInitiateMatch={(selectedServices) =>
        nav("/explorer/matching", { state: { pro, services: selectedServices } })
      }
    />
  );
}
