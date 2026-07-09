import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowLeft, Check, Crown, Sparkles, Star, Zap, Loader2 } from "lucide-react"
import { useSubscriptionStore } from "../../stores/subscriptionStore"
import { useAuthStore } from "../../stores/authStore"
import type { Plan, BillingCycle } from "../../types/subscription"
import ErrorState from "../../components/ui/ErrorState"
import Skeleton from "../../components/ui/Skeleton"

const PLAN_ICONS: Record<string, typeof Star> = {
  FREE: Star,
  PLUS: Sparkles,
  PREMIUM: Crown,
}

export default function SubscriptionPlansPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const fromHamburger = !!loc.state?.fromHamburger
  const userId = useAuthStore((s) => s.userId)
  const { availablePlans, currentSubscription, loading, error, fetchPlans, fetchCurrent, changePlan } = useSubscriptionStore()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    fetchPlans("CLIENT")
    if (userId) fetchCurrent(userId)
  }, [userId])

  const clientPlans = availablePlans.filter((p) => p.type === "CLIENT")
  const currentPlanId = currentSubscription?.plan_id ?? clientPlans[0]?.id

  const handleSelect = async (plan: Plan) => {
    if (plan.id === currentPlanId) return
    setSelectedPlanId(plan.id)
    setConfirming(true)
  }

  const handleConfirm = async () => {
    if (!selectedPlanId || !currentSubscription) return
    try {
      await changePlan({
        subscription_id: currentSubscription.id,
        new_plan_id: selectedPlanId,
        billing_cycle: billingCycle,
      })
      nav("/settings/subscription")
    } catch {
      setConfirming(false)
    }
  }

  const handleBack = () => fromHamburger ? nav("/", { state: { reopenMenu: true } }) : nav(-1)

  if (error) {
    return (
      <div className="flex flex-col min-h-dynamic bg-cm-bg">
        <Header onBack={handleBack} title="Plans" />
        <ErrorState message={error} onRetry={() => fetchPlans("CLIENT")} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dynamic bg-cm-bg pb-32">
      <Header onBack={handleBack} title="Choisir un plan" />

      <div className="px-4 mt-2">
        {confirming && selectedPlanId && (
          <ConfirmBanner
            plan={clientPlans.find((p) => p.id === selectedPlanId)!}
            billingCycle={billingCycle}
            onConfirm={handleConfirm}
            onCancel={() => { setConfirming(false); setSelectedPlanId(null) }}
            loading={loading}
          />
        )}

        <div className="flex items-center gap-2 bg-cm-elevated rounded-[14px] border border-cm-border p-1 mb-4">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`flex-1 h-9 rounded-[10px] text-[12px] font-semibold transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-cm-accent text-cm-text-onAccent"
                : "text-cm-text-soft hover:text-cm-text"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`flex-1 h-9 rounded-[10px] text-[12px] font-semibold transition-all cursor-pointer ${
              billingCycle === "yearly"
                ? "bg-cm-accent text-cm-text-onAccent"
                : "text-cm-text-soft hover:text-cm-text"
            }`}
          >
            Annuel
          </button>
        </div>

        {loading && clientPlans.length === 0 ? (
          <PlansSkeleton />
        ) : clientPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-14 h-14 rounded-full bg-cm-accent-soft flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-cm-accent" />
            </div>
            <h3 className="text-[16px] font-bold text-cm-text mb-1">Aucune formule disponible</h3>
            <p className="text-[13px] text-cm-text-soft text-center max-w-xs">
              Les formules client seront bientôt disponibles.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8 py-8 px-6 max-w-[1400px] mx-auto max-md:flex-col max-md:items-center">
            {clientPlans.map((plan, i) => (
              <div key={plan.id} className="flex-[1_1_300px] min-w-[280px] max-w-[350px] max-md:w-full max-md:max-w-[400px] md:flex-[0_0_calc(50%-2rem)] xl:flex-[0_0_calc(25%-2rem)]">
                <PlanCard
                  plan={plan}
                  billingCycle={billingCycle}
                  isCurrent={plan.id === currentPlanId}
                  isSelected={plan.id === selectedPlanId}
                  index={i}
                  onSelect={handleSelect}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-2">
      <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl bg-cm-elevated border border-cm-border cursor-pointer active:scale-[0.94] transition-transform">
        <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
      </button>
      <h1 className="text-lg font-extrabold text-cm-text">{title}</h1>
    </div>
  )
}

function PlanCard({
  plan, billingCycle, isCurrent, isSelected, index, onSelect,
}: {
  plan: Plan
  billingCycle: BillingCycle
  isCurrent: boolean
  isSelected: boolean
  index: number
  onSelect: (plan: Plan) => void
}) {
  const price = billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly
  const periodLabel = billingCycle === "yearly" ? "/an" : "/mois"
  const saving = plan.price_yearly > 0 && plan.price_monthly > 0
    ? Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)
    : 0
  const tierKey = plan.name.toUpperCase()
  const PlanIcon = PLAN_ICONS[tierKey] || Star

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={`relative bg-cm-elevated rounded-[20px] border-2 p-5 space-y-4 transition-all w-full ${
        isCurrent ? "border-cm-accent" : isSelected ? "border-cm-accent/50" : "border-cm-border"
      }`}
    >
      {plan.recommended && (
        <div className="absolute -top-3 right-4 bg-cm-accent text-cm-text-onAccent text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Recommandé
        </div>
      )}
      {plan.badge && !plan.recommended && (
        <div className="absolute -top-3 right-4 bg-cm-amber text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {plan.badge}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${
          isCurrent ? "bg-cm-accent" : "bg-cm-accent-soft"
        }`}>
          <PlanIcon className={`w-5 h-5 ${isCurrent ? "text-cm-text-onAccent" : "text-cm-accent"}`} />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-cm-text">{plan.name}</h3>
          {plan.description && (
            <p className="text-[12px] text-cm-text-soft">{plan.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-extrabold text-cm-text">
          {price === 0 ? "Gratuit" : `${price.toLocaleString("fr-FR")} F`}
        </span>
        {price > 0 && (
          <span className="text-[13px] text-cm-text-soft font-medium">{periodLabel}</span>
        )}
      </div>

      {saving > 0 && billingCycle === "yearly" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
          Économisez {saving}% avec l'abonnement annuel
        </div>
      )}

      {plan.features && plan.features.length > 0 && (
        <ul className="space-y-2">
          {plan.features.map((pf) => (
            <li key={pf.id} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-cm-accent/10 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-cm-accent" />
              </div>
              <span className="text-[13px] text-cm-text-soft">
                {pf.feature?.name ?? pf.feature_id}
                {pf.limit_value && pf.limit_value > 0 ? ` (${pf.limit_value})` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrent}
        className={`w-full h-11 rounded-xl text-[13px] font-bold transition-all cursor-pointer active:scale-[0.97] disabled:cursor-not-allowed ${
          isCurrent
            ? "bg-cm-accent-soft text-cm-text-muted border border-cm-border"
            : "bg-cm-accent text-cm-text-onAccent hover:opacity-90"
        }`}
      >
        {isCurrent ? "Plan actuel" : isSelected ? "Sélectionné" : "Choisir"}
      </button>
    </motion.div>
  )
}

function ConfirmBanner({
  plan, billingCycle, onConfirm, onCancel, loading,
}: {
  plan: Plan
  billingCycle: BillingCycle
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  const price = billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-cm-elevated rounded-[16px] border border-cm-border p-4 mb-4 space-y-3"
    >
      <p className="text-[13px] font-semibold text-cm-text">
        Passer au plan <span className="text-cm-accent">{plan.name}</span> à{" "}
        {price.toLocaleString("fr-FR")} F CFA/{billingCycle === "yearly" ? "an" : "mois"} ?
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 h-10 rounded-xl border border-cm-border text-[12px] font-semibold text-cm-text-soft cursor-pointer active:scale-[0.97] disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 h-10 rounded-xl bg-cm-accent text-cm-text-onAccent text-[12px] font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] disabled:opacity-50"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Confirmer
        </button>
      </div>
    </motion.div>
  )
}

function PlansSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-cm-elevated rounded-[20px] border border-cm-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" width="44px" height="44px" />
            <div className="space-y-1.5 flex-1">
              <Skeleton variant="text" className="w-1/4" />
              <Skeleton variant="text" className="w-1/2" />
            </div>
          </div>
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="rect" className="h-11 w-full" />
        </div>
      ))}
    </div>
  )
}
