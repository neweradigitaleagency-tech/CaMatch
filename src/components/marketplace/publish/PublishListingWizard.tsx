import { ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { usePublishListingStore, STEP_COUNT } from "../../../stores/publishListingStore"
import PublishStepVertical from "./PublishStepVertical"
import PublishStepCategory from "./PublishStepCategory"
import PublishStepDetails from "./PublishStepDetails"
import PublishStepCondition from "./PublishStepCondition"
import PublishStepPrice from "./PublishStepPrice"
import PublishStepPhotos from "./PublishStepPhotos"
import PublishStepReview from "./PublishStepReview"

const STEP_LABELS = [
  "Univers",
  "Catégorie",
  "Détails",
  "État",
  "Prix",
  "Photos",
  "Publication",
]

interface PublishListingWizardProps {
  onBack: () => void
  onSubmit: () => void
  loading?: boolean
}

export default function PublishListingWizard({ onBack, onSubmit, loading }: PublishListingWizardProps) {
  const { draft, goNext, goPrev, isStepValid, isPublishable } = usePublishListingStore()
  const valid = isStepValid()
  const isLastStep = draft.step === STEP_COUNT - 1
  const stepNum = draft.step + 1

  return (
    <div className="flex flex-col w-full min-h-dynamic pb-safe bg-cm-bg">
      <header className="sticky top-0 z-30 bg-cm-bg">
        <div className="flex items-center gap-3 px-5 h-12">
          <button
            onClick={draft.step > 0 ? goPrev : onBack}
            className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min shrink-0"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4 text-cm-text" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-[10px] font-bold text-cm-text-soft uppercase tracking-widest">
              Étape {stepNum}/{STEP_COUNT} — {STEP_LABELS[draft.step]}
            </span>
          </div>
          <div className="w-9" />
        </div>

        <div className="px-5 pb-2">
          <div className="flex gap-1">
            {STEP_LABELS.map((label, i) => {
              const isActive = i === draft.step
              const isDone = i < draft.step
              return (
                <div key={label} className="flex-1 h-1 rounded-full overflow-hidden bg-cm-border-soft">
                  <motion.div
                    className="h-full bg-cm-text rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: isDone ? "100%" : isActive ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
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
            {draft.step === 0 && <PublishStepVertical />}
            {draft.step === 1 && <PublishStepCategory />}
            {draft.step === 2 && <PublishStepDetails />}
            {draft.step === 3 && <PublishStepCondition />}
            {draft.step === 4 && <PublishStepPrice />}
            {draft.step === 5 && <PublishStepPhotos />}
            {draft.step === 6 && <PublishStepReview />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="cm-fixed-bottom z-30 bg-cm-elevated border-t border-cm-border px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom,12px))]">
        <div className="max-w-lg mx-auto">
          {!isLastStep ? (
            <button
              onClick={goNext}
              disabled={!valid}
              className="flex-1 w-full h-12 rounded-xl bg-cm-text text-white text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              Continuer
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={onSubmit}
                disabled={loading || !isPublishable()}
                className="w-full h-12 rounded-xl bg-[#243318] text-white text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Publier mon annonce"
                )}
              </button>
              <p className="text-center text-[10px] text-cm-text-muted">
                Commission Ça Match de 10 % sur la vente, encaissée à la livraison.
              </p>
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
