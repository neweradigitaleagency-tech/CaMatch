import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Loader, AlertTriangle } from "lucide-react"

interface CancelSubscriptionModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  loading?: boolean
}

const REASONS = [
  { value: "Trop cher", label: "Trop cher" },
  { value: "Fonctionnalités insuffisantes", label: "Fonctionnalités insuffisantes" },
  { value: "Je n'utilise pas assez", label: "Je n'utilise pas assez" },
  { value: "Autre", label: "Autre" },
]

export default function CancelSubscriptionModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: CancelSubscriptionModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [customReason, setCustomReason] = useState("")

  const handleConfirm = () => {
    const reason = selectedReason === "Autre" ? customReason : (selectedReason || "")
    if (!reason.trim() || loading) return
    onConfirm(reason)
  }

  const isValid = selectedReason && (selectedReason !== "Autre" || customReason.trim().length > 0)

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
            className="w-full max-w-sm bg-cm-elevated rounded-[var(--radius-cm-xl)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-cm-error" />
                </div>
                <h2 className="text-[16px] font-bold text-cm-text">Annuler l'abonnement</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min"
              >
                <X className="w-4 h-4 text-cm-text" />
              </button>
            </div>

            <div className="px-5 pb-5 flex flex-col gap-4">
              <p className="text-[12px] text-cm-text-soft">
                Vous allez perdre l'accès à toutes les fonctionnalités de votre formule en cours.
                Cette action est irréversible.
              </p>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold text-cm-text-muted uppercase tracking-wider">
                  Pourquoi partez-vous ?
                </span>
                <div className="flex flex-col gap-1.5">
                  {REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      onClick={() => setSelectedReason(reason.value)}
                      className={`text-left px-3 py-2.5 rounded-[var(--radius-cm)] border text-[12px] transition-all cursor-pointer ${
                        selectedReason === reason.value
                          ? "border-cm-accent bg-cm-accent-soft text-cm-text font-semibold"
                          : "border-cm-border text-cm-text-soft hover:border-cm-text-muted"
                      }`}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedReason === "Autre" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Dites-nous pourquoi..."
                  rows={3}
                  className="w-full p-3 text-[12px] border border-cm-border rounded-[var(--radius-cm)] outline-none focus:border-cm-accent bg-transparent text-cm-text placeholder:text-cm-text-muted resize-none"
                />
              )}

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 h-11 border border-cm-border text-cm-text-soft text-[12px] font-semibold rounded-[var(--radius-cm)] hover:bg-cm-accent-soft cursor-pointer"
                >
                  Retour
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!isValid || loading}
                  className="flex-1 h-11 bg-cm-error text-white text-[12px] font-bold rounded-[var(--radius-cm)] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirmer l'annulation"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
