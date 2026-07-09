import { motion } from "motion/react"
import { ArrowUpRight, XCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import UsageProgress from "./UsageProgress"
import type { Subscription, UsageRecord, SubscriptionStatus } from "../../types/subscription"

interface SubscriptionCardProps {
  subscription: Subscription | null
  usage?: UsageRecord[]
  onUpgrade?: () => void
  onCancel?: () => void
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  TRIAL: "bg-blue-50 text-blue-600 border border-blue-200",
  ACTIVE: "bg-green-50 text-green-600 border border-green-200",
  PAST_DUE: "bg-orange-50 text-orange-600 border border-orange-200",
  CANCELLED: "bg-gray-100 text-gray-500",
  EXPIRED: "bg-red-50 text-red-600 border border-red-200",
  FAILED: "bg-red-50 text-red-600 border border-red-200",
}

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  TRIAL: "Période d'essai",
  ACTIVE: "Actif",
  PAST_DUE: "Paiement en retard",
  CANCELLED: "Annulé",
  EXPIRED: "Expiré",
  FAILED: "Échec",
}

export default function SubscriptionCard({
  subscription,
  usage = [],
  onUpgrade,
  onCancel,
}: SubscriptionCardProps) {
  if (!subscription) {
    return (
      <div className="cm-card p-5 flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-[13px] text-cm-text-soft">Aucun abonnement actif</p>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="h-10 px-5 bg-cm-accent text-cm-text-onAccent text-[12px] font-bold rounded-[var(--radius-cm)] hover:bg-cm-accent-hover cursor-pointer"
          >
            Choisir une formule
          </button>
        )}
      </div>
    )
  }

  const isActive = subscription.status === "ACTIVE" || subscription.status === "TRIAL"
  const canCancel = isActive && !subscription.canceled_at

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="cm-card p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold text-cm-text">
              {subscription.plan?.name || subscription.tier}
            </h3>
            <span className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold ${STATUS_STYLES[subscription.status]}`}>
              {STATUS_LABELS[subscription.status]}
            </span>
          </div>
          <p className="text-[11px] text-cm-text-soft">
            {subscription.billing_cycle === "monthly" ? "Mensuel" : "Annuel"} · {subscription.price_monthly.toLocaleString("fr-FR")} FCFA/mois
          </p>
        </div>
      </div>

      <div className="h-px bg-cm-border" />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-cm-text-soft">Prochaine facturation</span>
        <span className="font-semibold text-cm-text">
          {format(new Date(subscription.current_period_end), "d MMM yyyy", { locale: fr })}
        </span>
      </div>

      {subscription.trial_end && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-cm-text-soft">Fin de l'essai</span>
          <span className="font-semibold text-cm-text">
            {format(new Date(subscription.trial_end), "d MMM yyyy", { locale: fr })}
          </span>
        </div>
      )}

      {usage.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-semibold text-cm-text-muted uppercase tracking-wider">
            Utilisation
          </span>
          {usage.map((record) => (
            <UsageProgress
              key={record.id}
              current={record.usage}
              limit={record.limit_value}
              label={record.feature_code}
              featureCode={record.feature_code}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="flex-1 h-10 bg-cm-accent text-cm-text-onAccent text-[11px] font-bold rounded-[var(--radius-cm)] hover:bg-cm-accent-hover cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Changer de formule
          </button>
        )}
        {canCancel && onCancel && (
          <button
            onClick={onCancel}
            className="h-10 px-4 border border-cm-border text-cm-text-soft text-[11px] font-semibold rounded-[var(--radius-cm)] hover:bg-cm-accent-soft cursor-pointer flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            Annuler
          </button>
        )}
      </div>
    </motion.div>
  )
}
