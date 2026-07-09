import { useState } from "react"
import PlanCard from "./PlanCard"
import type { Plan } from "../../types/subscription"

interface PricingTableProps {
  plans: Plan[]
  currentPlanId?: string
  onSelect?: (plan: Plan) => void
  variant?: "client" | "pro"
}

export default function PricingTable({
  plans,
  currentPlanId,
  onSelect,
  variant = "client",
}: PricingTableProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const sorted = [...plans].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-cm-text">Comparez les formules</h2>
        <div className="flex items-center gap-2 bg-cm-accent-soft rounded-[var(--radius-cm)] p-0.5">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`h-8 px-3 text-[11px] font-semibold rounded-[calc(var(--radius-cm)-2px)] transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-cm-elevated text-cm-text shadow-sm"
                : "text-cm-text-muted hover:text-cm-text"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`h-8 px-3 text-[11px] font-semibold rounded-[calc(var(--radius-cm)-2px)] transition-all cursor-pointer ${
              billingCycle === "yearly"
                ? "bg-cm-elevated text-cm-text shadow-sm"
                : "text-cm-text-muted hover:text-cm-text"
            }`}
          >
            Annuel
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-8 py-8 px-6 max-w-[1400px] mx-auto max-md:flex-col max-md:items-center">
        {sorted.map((plan) => (
          <div key={plan.id} className="flex-[1_1_300px] min-w-[280px] max-w-[350px] max-md:w-full max-md:max-w-[400px] md:flex-[0_0_calc(50%-2rem)] xl:flex-[0_0_calc(25%-2rem)]">
            <PlanCard
              plan={plan}
              onSelect={onSelect}
              current={plan.id === currentPlanId}
              variant={variant}
              billingCycle={billingCycle}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
