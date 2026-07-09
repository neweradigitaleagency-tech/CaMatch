import { Check, X, Minus } from "lucide-react"
import type { PlanFeature } from "../../types/subscription"

interface FeatureListProps {
  features: PlanFeature[]
  variant?: "check" | "bullet"
}

export default function FeatureList({ features, variant = "check" }: FeatureListProps) {
  return (
    <div className="flex flex-col gap-2">
      {features.map((pf) => {
        const hasLimit = pf.limit_value !== null && pf.limit_value !== -1
        const unlimited = pf.limit_value === -1

        return (
          <div key={pf.id} className="flex items-start gap-2.5">
            {variant === "check" ? (
              pf.enabled ? (
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-cm-text-muted shrink-0 mt-0.5" />
              )
            ) : (
              <Minus className="w-3 h-3 text-cm-text-muted shrink-0 mt-1" />
            )}
            <div className="flex flex-col">
              <span className={`text-[12px] ${pf.enabled ? "text-cm-text" : "text-cm-text-muted"}`}>
                {pf.feature?.name || pf.feature_id}
              </span>
              {(hasLimit || unlimited) && (
                <span className="text-[10px] text-cm-text-muted">
                  {unlimited ? "Illimité" : `${pf.limit_value} ${pf.limit_value && pf.limit_value > 1 ? "fois/mois" : "fois/mois"}`}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
