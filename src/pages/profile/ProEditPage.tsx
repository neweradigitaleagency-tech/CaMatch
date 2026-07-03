import { useNavigate } from "react-router-dom";
import ProfilProScreen from "../../components/ProfilProScreen";
import { MOCK_PROS, MOCK_SERVICES } from "../../services/mockData";
import { useAuthStore } from "../../stores/authStore";
import type { ProfessionalDetails } from "../../types";
import { getReviewsForPro, getBadgesForXp } from "../../services/mockData";
import { MOCK_PORTFOLIO } from "../../services/mockData";

export default function ProEditPage() {
  const nav = useNavigate();
  const { user } = useAuthStore();

  const pro: ProfessionalDetails = (MOCK_PROS.find((p) => p.id === user?.id) || MOCK_PROS[0])!;
  const services = MOCK_SERVICES.filter((s) => s.proId === pro.id);
  const portfolio = MOCK_PORTFOLIO.filter((p) => p.category === pro.category);
  const reviews = getReviewsForPro(pro.id);
  const xp = pro.completedInterventions * 50;
  const badges = getBadgesForXp(xp);

  return (
    <ProfilProScreen
      mode="owner"
      pro={pro}
      services={services}
      portfolio={portfolio}
      reviews={reviews}
      badges={badges}
      onBack={() => nav(-1)}
      onSave={(updates) => {
        console.log("Saving:", updates);
        nav(-1);
      }}
    />
  );
}
