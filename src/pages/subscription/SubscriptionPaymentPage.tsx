import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "motion/react"
import {
  ArrowLeft, Check, CreditCard, Loader2, AlertTriangle,
  ChevronDown, Percent, Smartphone, Building2, Globe,
} from "lucide-react"
import { useSubscriptionStore } from "../../stores/subscriptionStore"
import { useAuthStore } from "../../stores/authStore"
import { validateCoupon } from "../../services/subscriptionService"
import type { PaymentProvider, Payment } from "../../types/subscription"
import ErrorState from "../../components/ui/ErrorState"

const PROVIDERS: { id: PaymentProvider; name: string; icon: typeof Smartphone }[] = [
  { id: "wave", name: "Wave", icon: Smartphone },
  { id: "orange_money", name: "Orange Money", icon: Smartphone },
  { id: "mtn_money", name: "MTN Mobile Money", icon: Smartphone },
  { id: "flutterwave", name: "Flutterwave", icon: Globe },
  { id: "cinetpay", name: "CinetPay", icon: Globe },
  { id: "stripe", name: "Stripe", icon: Building2 },
]

export default function SubscriptionPaymentPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const fromHamburger = !!loc.state?.fromHamburger
  const userId = useAuthStore((s) => s.userId)
  const { currentSubscription, availablePlans, fetchCurrent, loading, error, clearError } = useSubscriptionStore()

  const [provider, setProvider] = useState<PaymentProvider | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [couponResult, setCouponResult] = useState<{ valid: boolean; message?: string } | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<Payment | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) fetchCurrent(userId)
  }, [userId])

  const planId = currentSubscription?.plan_id
  const plan = planId ? availablePlans.find((p) => p.id === planId) ?? currentSubscription?.plan : currentSubscription?.plan
  const price = currentSubscription?.price_monthly ?? 0
  const discount = couponResult?.valid ? 20 : 0
  const finalPrice = Math.max(0, price - (price * discount) / 100)

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    try {
      const result = await validateCoupon(couponCode.trim(), "CLIENT")
      setCouponResult(result)
    } catch {
      setCouponResult({ valid: false, message: "Erreur de validation" })
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handlePayment = async () => {
    if (!provider || !currentSubscription || !userId) return
    setProcessing(true)
    setPaymentError(null)
    try {
      const { createPayment } = await import("../../services/paymentService")
      const payment = await createPayment({
        subscription_id: currentSubscription.id,
        provider,
        amount: finalPrice,
        coupon_code: couponResult?.valid ? couponCode : undefined,
        user_id: userId,
      })
      setPaymentResult(payment)
    } catch (e) {
      setPaymentError((e as Error).message)
    } finally {
      setProcessing(false)
    }
  }

  const handleBack = () => fromHamburger ? nav("/", { state: { reopenMenu: true } }) : nav(-1)

  if (paymentResult) {
    return (
      <div className="flex flex-col min-h-dynamic bg-cm-bg">
        <Header onBack={() => nav("/settings/subscription")} title="Paiement" />
        <SuccessState
          payment={paymentResult}
          planName={plan?.name ?? "Abonnement"}
          onDone={() => nav("/settings/subscription")}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-dynamic bg-cm-bg">
        <Header onBack={handleBack} title="Paiement" />
        <ErrorState message={error} onRetry={() => clearError()} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dynamic bg-cm-bg pb-32">
      <Header onBack={handleBack} title="Paiement" />

      <div className="px-4 mt-2 space-y-4">
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cm-elevated rounded-[20px] border border-cm-border p-5 space-y-3"
          >
            <h3 className="text-[14px] font-bold text-cm-text mb-3">Récapitulatif</h3>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-cm-text-soft">Plan {plan.name}</span>
              <span className="text-[13px] font-semibold text-cm-text">
                {price.toLocaleString("fr-FR")} F CFA
              </span>
            </div>
            {currentSubscription?.billing_cycle && (
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-cm-text-soft">Cycle</span>
                <span className="text-[13px] font-semibold text-cm-text">
                  {currentSubscription.billing_cycle === "yearly" ? "Annuel" : "Mensuel"}
                </span>
              </div>
            )}
            {couponResult?.valid && (
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[13px]">Réduction</span>
                <span className="text-[13px] font-semibold">{discount}%</span>
              </div>
            )}
            <div className="h-px bg-cm-border" />
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-cm-text">Total</span>
              <span className="text-[14px] font-extrabold text-cm-text">
                {finalPrice.toLocaleString("fr-FR")} F CFA
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-cm-elevated rounded-[20px] border border-cm-border p-5 space-y-4"
        >
          <h3 className="text-[14px] font-bold text-cm-text">Code promo</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value); setCouponResult(null) }}
              placeholder="Entrez un code"
              className="flex-1 h-10 px-3 rounded-xl border border-cm-border bg-cm-bg text-[13px] text-cm-text placeholder:text-cm-text-muted focus:outline-none focus:ring-2 focus:ring-cm-accent/20"
            />
            <button
              onClick={handleValidateCoupon}
              disabled={validatingCoupon || !couponCode.trim()}
              className="h-10 px-4 rounded-xl bg-cm-accent text-cm-text-onAccent text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer active:scale-[0.97] disabled:opacity-50 transition-transform"
            >
              {validatingCoupon ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Percent className="w-3.5 h-3.5" />
              )}
              Appliquer
            </button>
          </div>
          {couponResult && (
            <p className={`text-[12px] font-medium flex items-center gap-1 ${
              couponResult.valid ? "text-emerald-600" : "text-cm-error"
            }`}>
              {couponResult.valid ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {couponResult.message}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-cm-elevated rounded-[20px] border border-cm-border p-5 space-y-3"
        >
          <h3 className="text-[14px] font-bold text-cm-text">Moyen de paiement</h3>
          <div className="space-y-1.5">
            {PROVIDERS.map((p) => {
              const Icon = p.icon
              const selected = provider === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[12px] border transition-all cursor-pointer active:scale-[0.98] ${
                    selected
                      ? "border-cm-accent bg-cm-accent/5"
                      : "border-cm-border hover:border-cm-text-soft"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${
                    selected ? "bg-cm-accent" : "bg-cm-border-soft"
                  }`}>
                    <Icon className={`w-4 h-4 ${selected ? "text-cm-text-onAccent" : "text-cm-text-soft"}`} />
                  </div>
                  <span className={`text-[13px] font-semibold flex-1 text-left ${
                    selected ? "text-cm-text" : "text-cm-text-soft"
                  }`}>
                    {p.name}
                  </span>
                  {selected && <Check className="w-4 h-4 text-cm-accent" />}
                </button>
              )
            })}
          </div>
        </motion.div>

        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-[14px] p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cm-error shrink-0" />
            <p className="text-[12px] text-cm-error font-medium">{paymentError}</p>
          </div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handlePayment}
          disabled={!provider || processing || !currentSubscription}
          className="w-full h-12 rounded-xl bg-cm-accent text-cm-text-onAccent text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed transition-transform"
        >
          {processing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          {processing ? "Paiement en cours..." : `Payer ${finalPrice.toLocaleString("fr-FR")} F CFA`}
        </motion.button>
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

function SuccessState({
  payment, planName, onDone,
}: {
  payment: Payment
  planName: string
  onDone: () => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-[24px] bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6"
      >
        <Check className="w-10 h-10 text-emerald-600" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-[18px] font-extrabold text-cm-text mb-2"
      >
        Paiement réussi !
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-[13px] text-cm-text-soft mb-2"
      >
        Votre abonnement {planName} est maintenant actif.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-[11px] text-cm-text-muted"
      >
        Transaction : {payment.provider_transaction_id ?? payment.id}
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onDone}
        className="mt-8 h-11 px-8 rounded-xl bg-cm-accent text-cm-text-onAccent text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform"
      >
        Retour à l'abonnement
      </motion.button>
    </div>
  )
}
