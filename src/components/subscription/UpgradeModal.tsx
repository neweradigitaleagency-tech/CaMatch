import { motion, AnimatePresence } from "motion/react"
import { X, Check, X as Cross, Loader, ArrowRight } from "lucide-react"
import type { Plan, PlanFeature } from "../../types/subscription"

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  currentPlan: Plan
  newPlan: Plan
  onConfirm: () => void
  loading?: boolean
}

function FeatureRow({ pf }: { pf: PlanFeature }) {
  const hasLimit = pf.limit_value !== null && pf.limit_value !== -1
  const unlimited = pf.limit_value === -1

  return (
    <div className="flex items-center gap-2">
      {pf.enabled ? (
        <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
      ) : (
        <Cross className="w-3.5 h-3.5 text-cm-text-muted shrink-0" />
      )}
      <span className={`text-[11px] ${pf.enabled ? "text-cm-text" : "text-cm-text-muted"}`}>
        {pf.feature?.name || pf.feature_id}
        {hasLimit && (
          <span className="text-cm-text-muted ml-1">({pf.limit_value})</span>
        )}
        {unlimited && (
          <span className="text-cm-text-muted ml-1">(illimité)</span>
        )}
      </span>
    </div>
  )
}

function isDowngrade(current: Plan, newPlan: Plan): boolean {
  const currentPrice = current.price_monthly
  const newPrice = newPlan.price_monthly
  return newPrice < currentPrice
}

export default function UpgradeModal({
  open,
  onClose,
  currentPlan,
  newPlan,
  onConfirm,
  loading = false,
}: UpgradeModalProps) {
  const downgrading = isDowngrade(currentPlan, newPlan)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-cm-elevated rounded-[var(--radius-cm-xl)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-[16px] font-bold text-cm-text">
                {downgrading ? "Changer de formule" : "Améliorer votre formule"}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-cm-accent-soft flex items-center justify-center cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4 text-cm-text" />
              </button>
            </div>

            <div className="px-5 pb-5 flex flex-col gap-4">
              {downgrading && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-cm)]">
                  <p className="text-[11px] text-amber-700">
                    Vous allez passer à une formule inférieure. Le montant restant de votre période en cours
                    sera recrédité au prorata.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="cm-card p-3 flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-cm-text-muted uppercase tracking-wider">Actuel</span>
                  <span className="text-[14px] font-bold text-cm-text">{currentPlan.name}</span>
                  <span className="text-[11px] text-cm-text-soft">
                    {currentPlan.price_monthly.toLocaleString("fr-FR")} FCFA/mois
                  </span>
                  <div className="flex flex-col gap-1 mt-1">
                    {currentPlan.features?.map((pf) => (
                      <FeatureRow key={pf.id} pf={pf} />
                    ))}
                  </div>
                </div>

                <div className="cm-card p-3 flex flex-col gap-2 border-cm-accent">
                  <span className="text-[10px] font-semibold text-cm-accent uppercase tracking-wider">Nouveau</span>
                  <span className="text-[14px] font-bold text-cm-text">{newPlan.name}</span>
                  <span className="text-[11px] text-cm-text-soft">
                    {newPlan.price_monthly.toLocaleString("fr-FR")} FCFA/mois
                  </span>
                  <div className="flex flex-col gap-1 mt-1">
                    {newPlan.features?.map((pf) => (
                      <FeatureRow key={pf.id} pf={pf} />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="w-full h-12 bg-cm-accent text-cm-text-onAccent text-[13px] font-bold rounded-[var(--radius-cm)] hover:bg-cm-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {downgrading ? "Confirmer le changement" : "Passer à cette formule"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
