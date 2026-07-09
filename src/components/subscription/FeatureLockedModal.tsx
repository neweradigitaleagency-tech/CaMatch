import { motion, AnimatePresence } from "motion/react"
import { X, Lock, Sparkles } from "lucide-react"

interface FeatureLockedModalProps {
  open: boolean
  onClose: () => void
  featureName: string
  requiredPlan: string
  onUpgrade?: () => void
}

export default function FeatureLockedModal({
  open,
  onClose,
  featureName,
  requiredPlan,
  onUpgrade,
}: FeatureLockedModalProps) {
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
            className="w-full max-w-xs bg-cm-elevated rounded-[var(--radius-cm-xl)] shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-8 pb-6 flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                className="w-14 h-14 rounded-full bg-cm-accent-soft flex items-center justify-center"
              >
                <Lock className="w-6 h-6 text-cm-text" />
              </motion.div>

              <h2 className="text-[16px] font-bold text-cm-text">
                Fonctionnalité verrouillée
              </h2>

              <p className="text-[12px] text-cm-text-soft leading-relaxed">
                {featureName} nécessite un abonnement <strong className="text-cm-text">{requiredPlan}</strong>.
                Passez à une formule supérieure pour y accéder.
              </p>

              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className="w-full h-11 bg-cm-accent text-cm-text-onAccent text-[12px] font-bold rounded-[var(--radius-cm)] hover:bg-cm-accent-hover cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Voir les formules
                </button>
              )}

              <button
                onClick={onClose}
                className="text-[11px] text-cm-text-muted hover:text-cm-text cursor-pointer"
              >
                Plus tard
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
