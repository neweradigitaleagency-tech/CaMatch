import { useNavigate, useParams } from "react-router-dom";
import ProfilProScreen from "../../components/ProfilProScreen";
import { MOCK_PROS, MOCK_SERVICES, MOCK_PORTFOLIO, MOCK_VERIFICATION, getReviewsForPro, getBadgesForXp } from "../../services/mockData";
import type { Service } from "../../types";

const DEFAULT_SERVICES: Record<string, { name: string; desc: string; price: number }[]> = {
  "maison-reparations": [
    { name: "Débouchage", desc: "Débouchage mécanique des canalisations", price: 12000 },
    { name: "Diagnostic électrique", desc: "Vérification complète de l'installation", price: 15000 },
    { name: "Réparation fuite", desc: "Détection et réparation de fuite d'eau", price: 18000 },
  ],
  "transport-livraison": [
    { name: "Course express", desc: "Transport rapide en ville", price: 5000 },
    { name: "Livraison colis", desc: "Livraison de colis standard", price: 8000 },
    { name: "Déménagement", desc: "Aide au déménagement", price: 50000 },
  ],
  "evenements": [
    { name: "Animation soirée", desc: "DJ ou animation musicale", price: 50000 },
    { name: "Photographie", desc: "Couverture photo événementielle", price: 35000 },
    { name: "Décoration", desc: "Décoration de salle", price: 40000 },
  ],
  "education-formation": [
    { name: "Cours particulier", desc: "Soutien scolaire personnalisé", price: 10000 },
    { name: "Formation bureautique", desc: "Initiation à Word, Excel, PowerPoint", price: 15000 },
    { name: "Cours de langue", desc: "Apprentissage de langue étrangère", price: 12000 },
  ],
  "social-media-informatique": [
    { name: "Création site web", desc: "Site vitrine ou landing page", price: 100000 },
    { name: "Community management", desc: "Gestion de vos réseaux sociaux", price: 50000 },
    { name: "Design graphique", desc: "Création de visuels et logo", price: 30000 },
  ],
  "assistance-services": [
    { name: "Ménage standard", desc: "Nettoyage d'appartement", price: 15000 },
    { name: "Garde d'enfants", desc: "Baby-sitting à domicile", price: 8000 },
    { name: "Courses", desc: "Faire les courses pour vous", price: 5000 },
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
  const premiumBadge = pro.isVerified ? { id: "premium", name: "Premium", description: "Professionnel vérifié Premium", icon: "👑", unlocked: true } : null;
  const allBadges = premiumBadge ? [premiumBadge, ...badges] : badges;

  return (
    <ProfilProScreen
      mode="client"
      pro={pro}
      services={services}
      portfolio={portfolio}
      verification={MOCK_VERIFICATION}
      reviews={reviews}
      badges={allBadges}
      onBack={() => nav(-1)}
    />
  );
}
