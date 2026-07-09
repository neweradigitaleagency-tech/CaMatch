import { motion } from "motion/react"
import { Check, X } from "lucide-react"
import type { Plan, PlanFeature } from "../../types/subscription"

interface PlanCardProps {
  plan: Plan
  onSelect?: (plan: Plan) => void
  current?: boolean
  selected?: boolean
  variant?: "client" | "pro"
  billingCycle?: "monthly" | "yearly"
}

export default function PlanCard({
  plan,
  onSelect,
  current = false,
  selected = false,
  variant = "client",
  billingCycle = "monthly",
}: PlanCardProps) {
  const price = billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly
  const accentColor = variant === "pro" ? "bg-gray-900" : "bg-gray-900"

  const getCtaLabel = () => {
    if (current) return "Actuel"
    if (selected) return "Sélectionné"
    return "Choisir"
  }

  const getCtaStyle = () => {
    if (current || selected) {
      return "bg-cm-accent-soft text-cm-text border border-cm-border cursor-default"
    }
    return "bg-cm-accent text-cm-text-onAccent hover:bg-cm-accent-hover cursor-pointer"
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`cm-card p-5 flex flex-col gap-4 relative ${
        plan.recommended ? "border-2 border-cm-accent shadow-cm-card" : ""
      }`}
    >
      {plan.recommended && (
        <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 px-3 ${accentColor} text-white text-[10px] font-bold rounded-full flex items-center`}>
          Recommandé
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-cm-text">{plan.name}</h3>
          {plan.badge && (
            <span className="h-5 px-2 bg-cm-accent-soft text-cm-text text-[10px] font-semibold rounded-full flex items-center">
              {plan.badge}
            </span>
          )}
        </div>
        {plan.description && (
          <p className="text-[11px] text-cm-text-soft">{plan.description}</p>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-extrabold text-cm-text">
          {price.toLocaleString("fr-FR")} FCFA
        </span>
        <span className="text-[11px] text-cm-text-muted">
          /{billingCycle === "monthly" ? "mois" : "an"}
        </span>
      </div>

      {plan.features && plan.features.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold text-cm-text-muted uppercase tracking-wider">
            Fonctionnalités
          </span>
          <div className="flex flex-col gap-1.5">
            {plan.features.map((pf: PlanFeature) => (
              <div key={pf.id} className="flex items-center gap-2">
                {pf.enabled ? (
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-cm-text-muted shrink-0" />
                )}
                <span className={`text-[11px] ${pf.enabled ? "text-cm-text" : "text-cm-text-muted"}`}>
                  {pf.feature?.name || pf.feature_id}
                  {pf.limit_value !== null && pf.limit_value !== -1 && (
                    <span className="text-cm-text-muted ml-1">
                      ({pf.limit_value} {pf.limit_value > 1 ? "demandes/mois" : "demande/mois"})
                    </span>
                  )}
                  {pf.limit_value === -1 && (
                    <span className="text-cm-text-muted ml-1">(illimité)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onSelect?.(plan)}
        disabled={current || selected}
        className={`w-full h-11 rounded-[var(--radius-cm)] text-[12px] font-bold flex items-center justify-center transition-all ${getCtaStyle()}`}
      >
        {getCtaLabel()}
      </button>
    </motion.div>
  )
}
