import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExplorerScreen from "../components/ExplorerScreen";
import { usePros } from "../hooks/useDatabase";
import { useClientMissions } from "../hooks/useDatabase";
import { useSubscriptionStore } from "../stores/subscriptionStore";
import { useAuthStore } from "../stores/authStore";

export default function HomePage() {
  const nav = useNavigate();
  const userId = useAuthStore((s) => s.userId);
  const { data: pros = [] } = usePros();
  const { data: missions = [] } = useClientMissions();
  const currentSubscription = useSubscriptionStore((s) => s.currentSubscription);
  const fetchCurrent = useSubscriptionStore((s) => s.fetchCurrent);
  const availablePlans = useSubscriptionStore((s) => s.availablePlans);
  const fetchPlans = useSubscriptionStore((s) => s.fetchPlans);

  useEffect(() => {
    if (userId) {
      fetchCurrent(userId);
      fetchPlans("CLIENT");
    }
  }, [userId, fetchCurrent, fetchPlans]);

  const currentPlan = availablePlans.find((p) => p.id === currentSubscription?.plan_id);
  const isFree = !currentSubscription || !currentPlan || currentPlan.price_monthly === 0;

  return (
    <ExplorerScreen
      recommendedPros={pros}
      activeMissions={missions.filter((m) => !["closed", "cancelled", "disputed", "refunded"].includes(m.status))}
      onSelectPro={(pro) => nav(`/explorer/pro/${pro.id}`)}
      onViewActiveMission={(mission) => nav(`/orders/tracker/${mission.id}`)}
      showPremiumCard={isFree}
    />
  );
}
