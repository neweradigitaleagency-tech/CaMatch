import { ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useSellerRegistrationStore } from "../../stores/sellerRegistrationStore"
import Step1SellerType from "./Step1SellerType"
import Step2ShopInfo from "./Step2ShopInfo"
import Step3Verification from "./Step3Verification"

const STEP_LABELS: Record<string, string> = {
  seller_type: "Type de vendeur",
  shop_info: "Informations",
  verification: "Vérification",
}

const STEP_NUMBERS: Record<string, number> = {
  seller_type: 1,
  shop_info: 2,
  verification: 3,
}

interface SellerRegistrationWizardProps {
  onBack: () => void
  onSubmit: () => void
  loading?: boolean
}

export default function SellerRegistrationWizard({ onBack, onSubmit, loading }: SellerRegistrationWizardProps) {
  const { draft, goNext, goPrev, isStepValid, reset } = useSellerRegistrationStore()
  const valid = isStepValid()
  const isLastStep = draft.step === "verification"
  const stepNum = STEP_NUMBERS[draft.step] || 1

  const handleSubmit = () => {
    onSubmit()
    reset()
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic pb-safe bg-[#EDE8DC]">
      <header className="sticky top-0 z-30 bg-[#EDE8DC]">
        <div className="flex items-center gap-3 px-5 h-12">
          <button
            onClick={draft.step !== "seller_type" ? goPrev : onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 cursor-pointer active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#1A1A1A]" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
              Étape {stepNum}/3
            </span>
          </div>
          <div className="w-9" />
        </div>

        <div className="px-5 pb-2">
          <div className="flex items-center gap-1.5">
            {["seller_type", "shop_info", "verification"].map((s, i) => {
              const currentIdx = ["seller_type", "shop_info", "verification"].indexOf(draft.step)
              const isActive = i === currentIdx
              const isDone = i < currentIdx
              return (
                <div key={s} className="flex items-center gap-1.5 flex-1">
                  <div className="flex-1 h-1 rounded-full overflow-hidden bg-gray-200">
                    <motion.div
                      className="h-full bg-[#1A1A1A] rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: isDone ? "100%" : isActive ? "50%" : "0%" }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                  <span className={`text-[8px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                    isActive || isDone ? "text-[#1A1A1A]" : "text-gray-300"
                  }`}>
                    {STEP_LABELS[s]}
                  </span>
                  {i < 2 && <span className="text-gray-200 text-[10px]">/</span>}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-4 pb-[max(104px,env(safe-area-inset-bottom,104px))]">
        <AnimatePresence mode="wait">
          <motion.div
            key={draft.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {draft.step === "seller_type" && <Step1SellerType />}
            {draft.step === "shop_info" && <Step2ShopInfo />}
            {draft.step === "verification" && <Step3Verification />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom,12px))]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            {!isLastStep ? (
              <button
                onClick={goNext}
                disabled={!valid}
                className="flex-1 h-12 rounded-xl bg-[#1A1A1A] text-white text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                Continuer
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !valid}
                className="flex-1 h-12 rounded-xl bg-[#243318] text-white text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Soumettre ma demande"
                )}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
