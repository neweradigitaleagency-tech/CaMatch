import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowLeft, History, CreditCard, RotateCcw, Circle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useSubscriptionStore } from "../../stores/subscriptionStore"
import { useAuthStore } from "../../stores/authStore"
import type { Subscription, Payment, PaymentStatus } from "../../types/subscription"
import EmptyState from "../../components/ui/EmptyState"
import ErrorState from "../../components/ui/ErrorState"
import Skeleton from "../../components/ui/Skeleton"

const SUB_STATUS_LABELS: Record<string, string> = {
  TRIAL: "Essai gratuit",
  ACTIVE: "Actif",
  PAST_DUE: "Paiement en retard",
  CANCELLED: "Annulé",
  EXPIRED: "Expiré",
  FAILED: "Échec",
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  authorized: "Autorisé",
  captured: "Capturé",
  completed: "Terminé",
  failed: "Échoué",
  refunded: "Remboursé",
  partially_refunded: "Remboursé partiellement",
  cancelled: "Annulé",
}

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  authorized: "bg-blue-50 text-blue-600 border-blue-200",
  captured: "bg-emerald-50 text-emerald-600 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  failed: "bg-red-50 text-red-600 border-red-200",
  refunded: "bg-gray-100 text-gray-500 border-gray-200",
  partially_refunded: "bg-gray-100 text-gray-500 border-gray-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

export default function SubscriptionHistoryPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const fromHamburger = !!loc.state?.fromHamburger
  const userId = useAuthStore((s) => s.userId)
  const {
    subscriptionHistory, paymentHistory, loading, error,
    fetchAll, clearError,
  } = useSubscriptionStore()

  useEffect(() => {
    if (userId) fetchAll(userId)
  }, [userId])

  const handleBack = () => nav("/", { state: { reopenMenu: true } })

  if (error) {
    return (
      <div className="flex flex-col min-h-dynamic bg-cm-bg">
        <Header onBack={handleBack} title="Historique" />
        <ErrorState message={error} onRetry={() => userId && fetchAll(userId)} />
      </div>
    )
  }

  const hasData = subscriptionHistory.length > 0 || paymentHistory.length > 0

  return (
    <div className="flex flex-col min-h-dynamic bg-cm-bg pb-32">
      <Header onBack={handleBack} title="Historique" />

      <div className="px-4 mt-2 space-y-6">
        {loading && !hasData ? (
          <HistorySkeleton />
        ) : !hasData ? (
          <EmptyState
            icon={History}
            title="Aucun historique"
            description="Vous n'avez pas encore d'historique d'abonnement ou de paiement."
          />
        ) : (
          <>
            {subscriptionHistory.length > 0 && (
              <section>
                <SectionTitle icon={RotateCcw} title="Abonnements" />
                <div className="space-y-2">
                  {subscriptionHistory.map((sub, i) => (
                    <SubscriptionTimelineItem key={sub.id} sub={sub} index={i} />
                  ))}
                </div>
              </section>
            )}

            {paymentHistory.length > 0 && (
              <section>
                <SectionTitle icon={CreditCard} title="Paiements" />
                <div className="space-y-2">
                  {paymentHistory.map((pay, i) => (
                    <PaymentItem key={pay.id} payment={pay} index={i} />
                  ))}
                </div>
              </section>
            )}
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

function SectionTitle({ icon: Icon, title }: { icon: typeof RotateCcw; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-cm-accent" />
      <h3 className="text-[14px] font-bold text-cm-text">{title}</h3>
    </div>
  )
}

function SubscriptionTimelineItem({ sub, index }: { sub: Subscription; index: number }) {
  const isLast = index === 0
  const planName = sub.plan?.name ?? sub.tier
  const statusLabel = SUB_STATUS_LABELS[sub.status] ?? sub.status

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative flex gap-4"
    >
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-3 h-3 rounded-full mt-1.5 ${
          sub.status === "ACTIVE" || sub.status === "TRIAL"
            ? "bg-cm-accent"
            : sub.status === "CANCELLED" || sub.status === "EXPIRED"
            ? "bg-cm-text-muted"
            : "bg-cm-amber"
        }`} />
        {!isLast && <div className="w-px flex-1 bg-cm-border mt-1" />}
      </div>
      <div className={`flex-1 pb-4 ${isLast ? "" : ""}`}>
        <div className="bg-cm-elevated rounded-[14px] border border-cm-border p-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[14px] font-bold text-cm-text">{planName}</span>
            <span className="text-[11px] text-cm-text-muted">
              {format(new Date(sub.created_at), "dd MMM yyyy", { locale: fr })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-cm-text-soft">{statusLabel}</span>
            <span className="text-[10px] text-cm-text-muted">•</span>
            <span className="text-[12px] text-cm-text-soft">
              {sub.price_monthly > 0
                ? `${sub.price_monthly.toLocaleString("fr-FR")} F CFA/mois`
                : "Gratuit"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function PaymentItem({ payment, index }: { payment: Payment; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="bg-cm-elevated rounded-[14px] border border-cm-border p-3.5 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-cm-accent-soft flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-cm-accent" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-cm-text">
            {payment.amount.toLocaleString("fr-FR")} F CFA
          </p>
          <p className="text-[11px] text-cm-text-muted">
            {format(new Date(payment.created_at), "dd MMM yyyy", { locale: fr })}
            {" • "}
            {payment.provider === "orange_money" ? "Orange Money"
              : payment.provider === "mtn_momo" ? "MTN Mobile Money"
              : payment.provider.charAt(0).toUpperCase() + payment.provider.slice(1)}
          </p>
        </div>
      </div>
      <span className={`inline-flex items-center h-6 px-2.5 rounded-[9999px] text-[10px] font-semibold border shrink-0 ${
        PAYMENT_STATUS_COLORS[payment.status]
      }`}>
        {PAYMENT_STATUS_LABELS[payment.status]}
      </span>
    </motion.div>
  )
}

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="text" className="w-1/4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="circle" width="12px" height="12px" className="mt-1.5" />
          <div className="flex-1">
            <Skeleton variant="rect" className="h-16 w-full rounded-[14px]" />
          </div>
        </div>
      ))}
    </div>
  )
}
