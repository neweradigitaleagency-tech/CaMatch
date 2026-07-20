import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { motion } from "motion/react";
import { ArrowLeft, Loader } from "lucide-react";
import PricingTable from "../../components/subscription/PricingTable";
import PaymentModal from "../../components/subscription/PaymentModal";
import { useSubscriptionStore } from "../../stores/subscriptionStore";
import { useAuthStore } from "../../stores/authStore";
import type { Plan } from "../../types/subscription";

export default function ProSubscriptionPlansPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");
  const userId = useAuthStore((s) => s.userId) || "user_1";

  const {
    availablePlans,
    currentSubscription,
    loading,
    error,
    fetchPlans,
    fetchCurrent,
    createSubscription,
    clearError,
  } = useSubscriptionStore();

  const [initialized, setInitialized] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
    }
    fetchPlans("PRO");
    fetchCurrent(userId);
  }, [initialized, userId, fetchPlans, fetchCurrent]);

  const proPlans = availablePlans.filter((p) => p.type === "PRO");
  const currentPlanId = currentSubscription?.plan_id;

  const handleSelect = (plan: Plan) => {
    if (plan.id === currentPlanId) return;
    setSelectedPlan(plan);
  };

  const handlePayment = async (provider: string) => {
    if (!selectedPlan) return;
    setPayLoading(true);
    try {
      await createSubscription({
        user_id: userId,
        plan_id: selectedPlan.id,
        billing_cycle: "monthly",
        provider: provider as any,
      });
      setSelectedPlan(null);
      nav("/pro/subscription");
    } catch {
      // error handled by store
    } finally {
      setPayLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-dynamic bg-cm-bg">
        <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
          <div className="flex items-center h-14 px-5 gap-3">
            <button type="button" onClick={goBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
              <ArrowLeft className="w-5 h-5 text-cm-text" />
            </button>
            <h1 className="text-[18px] font-bold text-cm-text">Formules</h1>
          </div>
        </div>
        <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24">
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-[12px] text-red-500 text-center mb-4">{error}</p>
            <button
              onClick={() => { clearError(); fetchPlans("PRO"); fetchCurrent(userId); }}
              className="h-9 px-4 text-[12px] font-medium text-cm-text bg-cm-elevated border border-cm-border rounded-[var(--radius-cm)] cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dynamic bg-cm-bg overflow-x-hidden">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={goBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Formules</h1>
        </div>
      </div>

      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-6 h-6 text-cm-accent animate-spin" />
          </div>
        ) : proPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-12 h-12 rounded-full bg-cm-accent-soft flex items-center justify-center mb-3">
              <ArrowLeft className="w-6 h-6 text-cm-accent" />
            </div>
            <h3 className="text-[14px] font-semibold text-cm-text mb-1">Aucune formule disponible</h3>
            <p className="text-[12px] text-cm-text-soft text-center max-w-xs">
              Les formules pro seront bientôt disponibles.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PricingTable
              plans={proPlans}
              currentPlanId={currentPlanId || undefined}
              onSelect={handleSelect}
              variant="pro"
            />
          </motion.div>
        )}
      </div>

      {selectedPlan && (
        <PaymentModal
          open={true}
          onClose={() => setSelectedPlan(null)}
          amount={
            selectedPlan.price_monthly
          }
          planName={selectedPlan.name}
          onConfirm={handlePayment}
          loading={payLoading}
        />
      )}
    </div>
  );
}
