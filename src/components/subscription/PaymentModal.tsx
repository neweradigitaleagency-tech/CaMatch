import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Loader, Check, Ticket, Wallet } from "lucide-react"
import type { PaymentProvider } from "../../types/subscription"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  amount: number
  planName: string
  onConfirm: (provider: PaymentProvider) => void
  loading?: boolean
}

const PROVIDERS: { value: PaymentProvider; label: string; icon: string }[] = [
  { value: "wave", label: "Wave", icon: "W" },
  { value: "orange_money", label: "Orange Money", icon: "O" },
  { value: "mtn_money", label: "MTN MoMo", icon: "M" },
]

export default function PaymentModal({
  open,
  onClose,
  amount,
  planName,
  onConfirm,
  loading = false,
}: PaymentModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [showCoupon, setShowCoupon] = useState(false)

  const handleConfirm = () => {
    if (!selectedProvider || loading) return
    onConfirm(selectedProvider)
  }

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
              <h2 className="text-[16px] font-bold text-cm-text">Paiement</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-cm-accent-soft flex items-center justify-center cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4 text-cm-text" />
              </button>
            </div>

            <div className="px-5 pb-5 flex flex-col gap-4">
              <div className="cm-card p-3 flex items-center justify-between">
                <span className="text-[12px] text-cm-text-soft">{planName}</span>
                <span className="text-[15px] font-bold text-cm-text">
                  {amount.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold text-cm-text-muted uppercase tracking-wider">
                  Mode de paiement
                </span>
                <div className="flex flex-col gap-2">
                  {PROVIDERS.map((provider) => (
                    <button
                      key={provider.value}
                      onClick={() => setSelectedProvider(provider.value)}
                      className={`flex items-center gap-3 p-3 rounded-[var(--radius-cm)] border transition-all cursor-pointer text-left ${
                        selectedProvider === provider.value
                          ? "border-cm-accent bg-cm-accent-soft"
                          : "border-cm-border hover:border-cm-text-muted"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold ${
                        selectedProvider === provider.value
                          ? "bg-cm-accent text-cm-text-onAccent"
                          : "bg-cm-accent-soft text-cm-text"
                      }`}>
                        {provider.icon}
                      </div>
                      <span className="flex-1 text-[13px] font-semibold text-cm-text">{provider.label}</span>
                      {selectedProvider === provider.value && (
                        <Check className="w-4 h-4 text-cm-accent" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {showCoupon ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Code promo"
                      className="flex-1 h-9 px-3 text-[12px] border border-cm-border rounded-[var(--radius-cm)] outline-none focus:border-cm-accent bg-transparent text-cm-text placeholder:text-cm-text-muted"
                    />
                    <button className="h-9 px-3 bg-cm-accent-soft text-cm-text text-[11px] font-semibold rounded-[var(--radius-cm)] hover:bg-cm-border cursor-pointer">
                      Valider
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCoupon(true)}
                    className="flex items-center gap-1.5 text-[11px] text-cm-text-muted hover:text-cm-text cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    J'ai un code promo
                  </button>
                )}
              </div>

              <button
                onClick={handleConfirm}
                disabled={!selectedProvider || loading}
                className="w-full h-12 bg-cm-accent text-cm-text-onAccent text-[13px] font-bold rounded-[var(--radius-cm)] hover:bg-cm-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Payer {amount.toLocaleString("fr-FR")} FCFA
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
