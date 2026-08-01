import { useState, useEffect, useCallback, useRef } from "react"
import { addMonths, subMonths, format, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"
import { MoreHorizontal, Eye, ArrowLeftRight, Pause, XCircle, Users, TrendingUp, Activity, UserPlus, Check } from "lucide-react"
import AdminTable from "../../components/admin/ui/AdminTable"
import type { Column } from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import KPICard from "../../components/admin/ui/KPICard"
import AdminSkeleton from "../../components/admin/ui/AdminSkeleton"
import ErrorState from "../../components/admin/ui/ErrorState"
import Modal from "../../components/admin/ui/Modal"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import { formatXOF } from "../../utils/admin/formatCurrency"
import { isSupabaseReady } from "../../services/supabase"
import type { Subscription, SubscriptionStatus, PlanType, BillingCycle, Plan } from "../../types/subscription"

const STATUS_OPTIONS = [
  { key: "all", label: "Tous" },
  { key: "ACTIVE", label: "Actifs" },
  { key: "TRIAL", label: "Essai" },
  { key: "PAST_DUE", label: "Impayés" },
  { key: "CANCELLED", label: "Annulés" },
  { key: "EXPIRED", label: "Expirés" },
  { key: "FAILED", label: "Échoués" },
]

const PLAN_TYPE_OPTIONS = [
  { key: "all", label: "Tous" },
  { key: "CLIENT", label: "Client" },
  { key: "PRO", label: "Pro" },
]

const STATUS_BADGE_MAP: Record<string, string> = {
  TRIAL: "pending",
  ACTIVE: "active",
  PAST_DUE: "pending",
  CANCELLED: "inactive",
  EXPIRED: "inactive",
  FAILED: "rejected",
}

const STATUS_LABELS: Record<string, string> = {
  TRIAL: "Essai",
  ACTIVE: "Actif",
  PAST_DUE: "Impayé",
  CANCELLED: "Annulé",
  EXPIRED: "Expiré",
  FAILED: "Échoué",
}

const MOCK_PLANS: Plan[] = [
  { id: "plan_client_free", name: "Free", type: "CLIENT", description: "Accès de base", price_monthly: 0, price_yearly: 0, currency: "XOF", active: true, display_order: 1, badge: null, recommended: false, trial_days: 0, created_at: new Date().toISOString() },
  { id: "plan_client_plus", name: "Plus", type: "CLIENT", description: "Pour les clients réguliers", price_monthly: 4900, price_yearly: 49000, currency: "XOF", active: true, display_order: 2, badge: "POPULAIRE", recommended: true, trial_days: 7, created_at: new Date().toISOString() },
  { id: "plan_client_premium", name: "Premium", type: "CLIENT", description: "Expérience VIP", price_monthly: 14900, price_yearly: 149000, currency: "XOF", active: true, display_order: 3, badge: "PREMIUM", recommended: false, trial_days: 7, created_at: new Date().toISOString() },
  { id: "plan_pro_free", name: "Free", type: "PRO", description: "Pour démarrer", price_monthly: 0, price_yearly: 0, currency: "XOF", active: true, display_order: 1, badge: null, recommended: false, trial_days: 0, created_at: new Date().toISOString() },
  { id: "plan_pro_starter", name: "Starter", type: "PRO", description: "Pour les pros en croissance", price_monthly: 9900, price_yearly: 99000, currency: "XOF", active: true, display_order: 2, badge: "POPULAIRE", recommended: true, trial_days: 14, created_at: new Date().toISOString() },
  { id: "plan_pro_business", name: "Business", type: "PRO", description: "Pour les pros établis", price_monthly: 24900, price_yearly: 249000, currency: "XOF", active: true, display_order: 3, badge: "RECOMMANDÉ", recommended: false, trial_days: 14, created_at: new Date().toISOString() },
  { id: "plan_pro_premium", name: "Premium", type: "PRO", description: "Pour les pros au top", price_monthly: 49900, price_yearly: 499000, currency: "XOF", active: true, display_order: 4, badge: "PREMIUM", recommended: false, trial_days: 14, created_at: new Date().toISOString() },
]

const USER_NAMES: Record<string, string> = {
  user_1: "Aminata Diallo", user_2: "Koffi Kouamé", user_3: "Fatou Ndiaye", user_4: "Mamadou Touré",
  user_5: "Adjoua Konan", user_6: "Ousmane Sarr", user_7: "Mariam Bamba", user_8: "Lamine Faye",
  user_9: "Aïchatou Bello", user_10: "Idrissa Traoré", user_11: "Kadiatou Sow", user_12: "Modibo Keita",
  user_13: "Rokia Diallo", user_14: "Cheick Camara", user_15: "Salimata Diarra", user_16: "Mamadou Konaté",
  user_17: "Fanta Coulibaly", user_18: "Sékou Sangaré", user_19: "Aminata Maïga", user_20: "Abdoulaye Sidibé",
}

function generateMockSubscriptions(): Subscription[] {
  const statuses: SubscriptionStatus[] = ["ACTIVE", "ACTIVE", "ACTIVE", "TRIAL", "PAST_DUE", "CANCELLED", "EXPIRED", "FAILED", "ACTIVE", "ACTIVE", "TRIAL", "ACTIVE", "ACTIVE", "CANCELLED", "ACTIVE", "PAST_DUE", "ACTIVE", "TRIAL", "ACTIVE", "ACTIVE"]
  return Array.from({ length: 20 }, (_, i) => {
    const plan = MOCK_PLANS[i % MOCK_PLANS.length]!
    const status = statuses[i]!
    const cycle: BillingCycle = i % 3 === 0 ? "yearly" : "monthly"
    const startDate = subMonths(new Date(), (19 - i) % 12)
    return {
      id: `sub_${i + 1}`,
      user_id: `user_${i + 1}`,
      plan_id: plan.id,
      tier: plan.name.toLowerCase(),
      status,
      billing_cycle: cycle,
      current_period_start: startDate.toISOString(),
      current_period_end: addMonths(startDate, cycle === "yearly" ? 12 : 1).toISOString(),
      price_monthly: cycle === "yearly" ? plan.price_yearly : plan.price_monthly,
      trial_end: status === "TRIAL" ? addMonths(startDate, plan.trial_days > 0 ? plan.trial_days : 7).toISOString() : null,
      canceled_at: status === "CANCELLED" ? addMonths(startDate, 2).toISOString() : null,
      auto_renew: status === "ACTIVE" || status === "TRIAL",
      payment_method: null,
      provider_subscription_id: null,
      provider_customer_id: null,
      coupon_id: null,
      plan,
      created_at: startDate.toISOString(),
    }
  })
}

const MOCK_SUBSCRIPTIONS = generateMockSubscriptions()

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [planTypeFilter, setPlanTypeFilter] = useState("all")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [changePlanModal, setChangePlanModal] = useState<Subscription | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [confirmCancel, setConfirmCancel] = useState<Subscription | null>(null)
  const [confirmSuspend, setConfirmSuspend] = useState<Subscription | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (isSupabaseReady()) {
        const { supabase } = await import("../../services/supabase")
        const { data, error } = await supabase!
          .from("subscriptions")
          .select("*, plan:plans(*)")
          .order("created_at", { ascending: false })
        if (error) throw error
        setSubscriptions((data ?? []) as unknown as Subscription[])
      } else {
        await new Promise((r) => setTimeout(r, 400))
        setSubscriptions(MOCK_SUBSCRIPTIONS)
      }
    } catch {
      setSubscriptions(MOCK_SUBSCRIPTIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = subscriptions.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false
    if (planTypeFilter !== "all" && s.plan?.type !== planTypeFilter) return false
    return true
  })

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE" || s.status === "TRIAL")
  const mrr = activeSubs.reduce((sum, s) => {
    const plan = s.plan ?? MOCK_PLANS.find((p) => p.id === s.plan_id)
    if (!plan || plan.price_monthly === 0) return sum
    return sum + (s.billing_cycle === "yearly" ? plan.price_yearly / 12 : plan.price_monthly)
  }, 0)
  const cancelled30d = subscriptions.filter((s) => {
    if (!s.canceled_at) return false
    return differenceInDays(new Date(), new Date(s.canceled_at)) <= 30
  }).length
  const total30dAgo = subscriptions.length
  const churnRate = total30dAgo > 0 ? (cancelled30d / total30dAgo) * 100 : 0
  const newSubs30d = subscriptions.filter((s) => {
    return differenceInDays(new Date(), new Date(s.created_at)) <= 30
  }).length

  const handleChangePlan = () => {
    if (!changePlanModal || !selectedPlanId) return
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === changePlanModal.id
          ? { ...s, plan_id: selectedPlanId, plan: MOCK_PLANS.find((p) => p.id === selectedPlanId) }
          : s
      )
    )
    setChangePlanModal(null)
    setSelectedPlanId("")
  }

  const handleCancel = () => {
    if (!confirmCancel) return
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === confirmCancel.id
          ? { ...s, status: "CANCELLED" as SubscriptionStatus, auto_renew: false, canceled_at: new Date().toISOString() }
          : s
      )
    )
    setConfirmCancel(null)
  }

  const handleSuspend = () => {
    if (!confirmSuspend) return
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === confirmSuspend.id
          ? { ...s, status: (s.status === "ACTIVE" ? "PAST_DUE" : "ACTIVE") as SubscriptionStatus }
          : s
      )
    )
    setConfirmSuspend(null)
  }

  if (error) return <ErrorState message={error} onRetry={fetchData} />

  const columns: Column<Subscription>[] = [
    {
      key: "user", label: "Utilisateur", sortable: true, width: "180px",
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-cm-surface flex items-center justify-center text-[12px] font-semibold text-cm-text-soft shrink-0">
            {(USER_NAMES[s.user_id] ?? s.user_id).charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-cm-text">{USER_NAMES[s.user_id] ?? s.user_id}</p>
            <p className="text-[11px] text-cm-text-muted font-mono">{s.user_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "plan", label: "Formule", sortable: true, width: "140px",
      render: (s) => {
        const plan = s.plan ?? MOCK_PLANS.find((p) => p.id === s.plan_id)
        if (!plan) return <span className="text-[12px] text-cm-text-muted">—</span>
        return (
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-cm-text">{plan.name}</span>
            <span className="text-[11px] text-cm-text-muted">{plan.type === "CLIENT" ? "Client" : "Pro"}</span>
          </div>
        )
      },
    },
    {
      key: "status", label: "Statut", sortable: true, width: "100px",
      render: (s) => (
        <StatusBadge status={STATUS_BADGE_MAP[s.status] ?? "inactive"} label={STATUS_LABELS[s.status] ?? s.status} />
      ),
    },
    {
      key: "billing_cycle", label: "Cycle", sortable: true, width: "90px",
      render: (s) => (
        <span className="text-[12px] text-cm-text-soft">{s.billing_cycle === "monthly" ? "Mensuel" : "Annuel"}</span>
      ),
    },
    {
      key: "amount", label: "Montant", sortable: true, width: "110px",
      render: (s) => {
        const plan = s.plan ?? MOCK_PLANS.find((p) => p.id === s.plan_id)
        const amount = s.billing_cycle === "yearly" ? (plan?.price_yearly ?? s.price_monthly) : (plan?.price_monthly ?? s.price_monthly)
        return (
          <span className="text-[13px] font-medium text-cm-text">{amount === 0 ? "Gratuit" : formatXOF(amount)}</span>
        )
      },
    },
    {
      key: "period", label: "Période", sortable: true, width: "120px",
      render: (s) => (
        <div className="flex flex-col">
          <span className="text-[11px] text-cm-text-muted">{format(new Date(s.current_period_start), "dd/MM/yy", { locale: fr })}</span>
          <span className="text-[11px] text-cm-text-muted">→ {format(new Date(s.current_period_end), "dd/MM/yy", { locale: fr })}</span>
        </div>
      ),
    },
    {
      key: "created_at", label: "Création", sortable: true, width: "90px",
      render: (s) => (
        <span className="text-[12px] text-cm-text-muted">{format(new Date(s.created_at), "dd/MM/yy", { locale: fr })}</span>
      ),
    },
    {
      key: "actions", label: "", width: "60px",
      render: (s) => (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === s.id ? null : s.id) }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cm-text-muted hover:text-cm-text-soft hover:bg-cm-surface cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {openDropdown === s.id && (
            <div ref={dropdownRef} className="absolute right-0 top-full mt-1 z-50 w-48 bg-cm-elevated border border-cm-border rounded-xl shadow-lg py-1 overflow-hidden">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(null) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-cm-text-soft hover:bg-cm-surface cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-cm-text-muted" /> Voir détails
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); setChangePlanModal(s); setSelectedPlanId(s.plan_id ?? "") }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-cm-text-soft hover:bg-cm-surface cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-cm-text-muted" /> Changer plan
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); setConfirmSuspend(s) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-amber-600 hover:bg-amber-50 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" /> {s.status === "ACTIVE" ? "Suspendre" : "Réactiver"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); setConfirmCancel(s) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> Annuler
              </button>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Abonnements</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">Gérer les abonnements des utilisateurs</p>
        </div>
      </div>

      {loading && subscriptions.length === 0 ? (
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminSkeleton key={i} type="card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          <KPICard label="Abonnements actifs" value={String(activeSubs.length)} icon={<Users className="w-4 h-4" />} trend={{ value: Math.round((activeSubs.length / Math.max(1, subscriptions.length - activeSubs.length)) * 100), positive: true }} />
          <KPICard label="MRR" value={formatXOF(Math.round(mrr))} icon={<TrendingUp className="w-4 h-4" />} />
          <KPICard label="Taux d'attrition" value={`${churnRate.toFixed(1)}%`} icon={<Activity className="w-4 h-4" />} trend={{ value: Math.round(churnRate), positive: churnRate < 5 }} />
          <KPICard label="Nouveaux (30j)" value={String(newSubs30d)} icon={<UserPlus className="w-4 h-4" />} />
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {STATUS_OPTIONS.map((f) => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${statusFilter === f.key ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"}`}>
            {f.label}
            {f.key !== "all" && <span className="ml-1.5 text-[11px] opacity-60">({subscriptions.filter((s) => s.status === f.key).length})</span>}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {PLAN_TYPE_OPTIONS.map((f) => (
          <button key={f.key} onClick={() => setPlanTypeFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${planTypeFilter === f.key ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(s) => s.id}
        searchable
        searchKeys={["user_id", "plan_id"]}
        loading={loading}
        emptyMessage="Aucun abonnement trouvé"
      />

      <Modal isOpen={!!changePlanModal} onClose={() => setChangePlanModal(null)} title="Changer de plan" size="sm">
        <div className="space-y-4">
          <p className="text-[13px] text-cm-text-muted">
            {changePlanModal && `Nouveau plan pour ${USER_NAMES[changePlanModal.user_id] ?? changePlanModal.user_id}`}
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {MOCK_PLANS.filter((p) => p.active).map((plan) => (
              <label key={plan.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedPlanId === plan.id ? "border-cm-text bg-cm-surface" : "border-cm-border hover:border-cm-border"}`}>
                <input type="radio" name="plan" checked={selectedPlanId === plan.id} onChange={() => setSelectedPlanId(plan.id)} className="w-4 h-4 accent-cm-text" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-cm-text">{plan.name}</span>
                    {plan.badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{plan.badge}</span>}
                  </div>
                  <p className="text-[11px] text-cm-text-muted">{plan.type === "CLIENT" ? "Client" : "Pro"}</p>
                </div>
                <span className="text-[13px] font-medium text-cm-text">{plan.price_monthly === 0 ? "Gratuit" : formatXOF(plan.price_monthly)}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setChangePlanModal(null)} className="h-9 px-4 text-[12px] font-medium text-cm-text-soft bg-cm-elevated border border-cm-border rounded-lg hover:bg-cm-surface cursor-pointer">Annuler</button>
            <button onClick={handleChangePlan} disabled={!selectedPlanId} className="h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg hover:bg-cm-text/80 cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Confirmer
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmCancel}
        onCancel={() => setConfirmCancel(null)}
        onConfirm={handleCancel}
        title="Annuler l'abonnement"
        message={`Êtes-vous sûr de vouloir annuler l'abonnement de ${confirmCancel ? USER_NAMES[confirmCancel.user_id] ?? confirmCancel.user_id : ""} ?`}
        confirmLabel="Annuler l'abonnement"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!confirmSuspend}
        onCancel={() => setConfirmSuspend(null)}
        onConfirm={handleSuspend}
        title={confirmSuspend?.status === "ACTIVE" ? "Suspendre l'abonnement" : "Réactiver l'abonnement"}
        message={confirmSuspend?.status === "ACTIVE" ? "L'abonnement sera suspendu. L'utilisateur ne pourra plus utiliser les fonctionnalités." : "L'abonnement sera réactivé."}
        confirmLabel={confirmSuspend?.status === "ACTIVE" ? "Suspendre" : "Réactiver"}
        variant={confirmSuspend?.status === "ACTIVE" ? "warning" : "default"}
      />
    </div>
  )
}
