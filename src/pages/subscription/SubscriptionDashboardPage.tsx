import { useEffect, useState } from "react"
import { motion } from "motion/react"
import {
  ArrowLeft, CreditCard, Receipt, History, RotateCcw, XCircle,
  Crown, Sparkles, Star, Zap, TrendingUp, AlertTriangle, Loader2,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { fr } from "date-fns/locale"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import { useSubscriptionStore } from "../../stores/subscriptionStore"
import { useAuthStore } from "../../stores/authStore"
import EmptyState from "../../components/ui/EmptyState"
import ErrorState from "../../components/ui/ErrorState"
import Skeleton from "../../components/ui/Skeleton"

const STATUS_LABELS: Record<string, string> = {
  TRIAL: "Essai gratuit",
  ACTIVE: "Actif",
  PAST_DUE: "Paiement en retard",
  CANCELLED: "Annulé",
  EXPIRED: "Expiré",
  FAILED: "Échec",
}

const STATUS_COLORS: Record<string, string> = {
  TRIAL: "bg-blue-50 text-blue-600 border-blue-200",
  ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  PAST_DUE: "bg-amber-50 text-amber-600 border-amber-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
  EXPIRED: "bg-red-50 text-red-600 border-red-200",
  FAILED: "bg-red-50 text-red-600 border-red-200",
}

const PLAN_ICONS: Record<string, typeof Star> = {
  FREE: Star,
  PLUS: Sparkles,
  PREMIUM: Crown,
}

export default function SubscriptionDashboardPage() {
  const { navigate: nav, goBack, getFlag, setFlag } = useAppNavigation()
  const fromHamburger = getFlag("from-hamburger")
  const userId = useAuthStore((s) => s.userId)
  const {
    currentSubscription, usage, loading, error,
    fetchAll, cancel, reactivate, clearError,
  } = useSubscriptionStore()

  useEffect(() => {
    if (userId) fetchAll(userId)
  }, [userId])

  const daysUntilRenewal = currentSubscription?.current_period_end
    ? Math.max(0, Math.ceil(
        (new Date(currentSubscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : 0

  const handleBack = () => {
    if (fromHamburger) {
      setFlag("reopen-menu", true)
      nav("/")
    } else {
      goBack()
    }
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-dynamic bg-cm-bg">
        <Header onBack={handleBack} title="Abonnement" />
        <ErrorState message={error} onRetry={() => userId && fetchAll(userId)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dynamic bg-cm-bg pb-32">
      <Header onBack={handleBack} title="Abonnement" />

      <div className="px-4 mt-2 space-y-4">
        {loading && !currentSubscription ? (
          <DashboardSkeleton />
        ) : !currentSubscription ? (
          <EmptyState
            icon={CreditCard}
            title="Aucun abonnement"
            description="Souscrivez à un plan pour profiter de toutes les fonctionnalités."
            action={{ label: "Voir les plans", onClick: () => nav("/settings/subscription/plans") }}
          />
        ) : (
          <>
            <SubscriptionCard
              subscription={currentSubscription}
              daysUntilRenewal={daysUntilRenewal}
              onCancel={() => cancel(currentSubscription.id)}
              onReactivate={() => reactivate(currentSubscription.id)}
              nav={nav}
            />

            <UsageProgress usage={usage} />

            <QuickActions nav={nav} />
          </>
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

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

function SubscriptionCard({
  subscription,
  daysUntilRenewal,
  onCancel,
  onReactivate,
  nav,
}: {
  subscription: NonNullable<ReturnType<typeof useSubscriptionStore.getState>["currentSubscription"]>
  daysUntilRenewal: number
  onCancel: () => void
  onReactivate: () => void
  nav: ReturnType<typeof useAppNavigation>["navigate"]
}) {
  const planName = subscription.plan?.name ?? subscription.tier
  const tierKey = planName.toUpperCase()
  const PlanIcon = PLAN_ICONS[tierKey] || Star
  const priceLabel = subscription.price_monthly > 0
    ? `${subscription.price_monthly.toLocaleString("fr-FR")} F CFA/mois`
    : "Gratuit"
  const isCanceled = subscription.status === "CANCELLED"
  const isTrialing = subscription.status === "TRIAL"

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      className="bg-cm-elevated rounded-[20px] border border-cm-border p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[16px] bg-cm-accent flex items-center justify-center">
            <PlanIcon className="w-6 h-6 text-cm-text-onAccent" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-cm-text">{planName}</h2>
            <p className="text-[13px] text-cm-text-soft">{priceLabel}</p>
          </div>
        </div>
        <span className={`inline-flex items-center h-7 px-3 rounded-[9999px] text-[11px] font-semibold border ${STATUS_COLORS[subscription.status] || "bg-gray-100 text-gray-500"}`}>
          {STATUS_LABELS[subscription.status] || subscription.status}
        </span>
      </div>

      <div className="h-px bg-cm-border" />

      <div className="grid grid-cols-2 gap-3">
        {isTrialing && subscription.trial_end && (
          <InfoBlock
            label="Fin de l'essai"
            value={format(new Date(subscription.trial_end), "dd MMM", { locale: fr })}
          />
        )}
        <InfoBlock
          label="Prochaine facture"
          value={daysUntilRenewal > 0
            ? `Dans ${formatDistanceToNow(new Date(subscription.current_period_end), { locale: fr })}`
            : "Aujourd'hui"
          }
        />
        <InfoBlock
          label="Cycle"
          value={subscription.billing_cycle === "yearly" ? "Annuel" : "Mensuel"}
        />
        {!isCanceled && (
          <InfoBlock
            label="Renouvellement"
            value={subscription.auto_renew ? "Automatique" : "Manuel"}
          />
        )}
      </div>

      <div className="flex gap-2">
        {!isCanceled ? (
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-cm-border bg-cm-elevated text-[12px] font-semibold text-cm-text-soft flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] transition-transform hover:border-cm-error hover:text-cm-error"
          >
            <XCircle className="w-3.5 h-3.5" />
            Annuler
          </button>
        ) : (
          <button
            onClick={onReactivate}
            className="flex-1 h-10 rounded-xl bg-cm-accent text-cm-text-onAccent text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] transition-transform"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réactiver
          </button>
        )}
        <button
          onClick={() => nav("/settings/subscription/plans")}
          className="flex-1 h-10 rounded-xl bg-cm-accent text-cm-text-onAccent text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] transition-transform"
        >
          <Crown className="w-3.5 h-3.5" />
          Changer de plan
        </button>
      </div>
    </motion.div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-cm-text-muted uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-[13px] font-semibold text-cm-text mt-0.5">{value}</p>
    </div>
  )
}

function UsageProgress({ usage }: { usage: Array<{ feature_code: string; usage: number; limit_value: number | null }> }) {
  if (usage.length === 0) return null

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-cm-elevated rounded-[20px] border border-cm-border p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-cm-accent" />
        <h3 className="text-[14px] font-bold text-cm-text">Utilisation</h3>
      </div>
      <div className="space-y-3">
        {usage.map((item) => {
          const pct = item.limit_value && item.limit_value > 0
            ? Math.min(100, Math.round((item.usage / item.limit_value) * 100))
            : 0
          const FEATURE_LABELS: Record<string, string> = {
            concurrent_requests: "Demandes simultanées",
            portfolio: "Portfolio",
            job_applications: "Candidatures",
          }
          return (
            <div key={item.feature_code}>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-cm-text-soft font-medium">
                  {FEATURE_LABELS[item.feature_code] || item.feature_code}
                </span>
                <span className="text-cm-text font-semibold">
                  {item.usage}{item.limit_value ? ` / ${item.limit_value}` : ""}
                </span>
              </div>
              {item.limit_value && item.limit_value > 0 && (
                <div className="h-2 rounded-full bg-cm-border-soft overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      pct > 80 ? "bg-cm-error" : pct > 50 ? "bg-cm-amber" : "bg-cm-accent"
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function QuickActions({ nav }: { nav: ReturnType<typeof useAppNavigation>["navigate"] }) {
  const actions = [
    { icon: Receipt, label: "Factures", href: "/settings/subscription/invoices" },
    { icon: History, label: "Historique", href: "/settings/subscription/history" },
    { icon: CreditCard, label: "Moyens de paiement", href: "/settings/subscription/payment" },
  ]

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-cm-elevated rounded-[20px] border border-cm-border p-5 space-y-3"
    >
      <h3 className="text-[14px] font-bold text-cm-text">Actions rapides</h3>
      <div className="space-y-1">
        {actions.map((a) => (
          <button
            key={a.href}
            onClick={() => nav(a.href)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cm-border-soft transition-colors cursor-pointer active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-[10px] bg-cm-accent-soft flex items-center justify-center">
              <a.icon className="w-4 h-4 text-cm-accent" />
            </div>
            <span className="text-[13px] font-semibold text-cm-text">{a.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-cm-elevated rounded-[20px] border border-cm-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" width="48px" height="48px" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-1/4" />
          </div>
        </div>
        <Skeleton variant="rect" className="h-px w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="rect" className="h-10 flex-1" />
          <Skeleton variant="rect" className="h-10 flex-1" />
        </div>
      </div>
      <div className="bg-cm-elevated rounded-[20px] border border-cm-border p-5 space-y-3">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    </div>
  )
}
