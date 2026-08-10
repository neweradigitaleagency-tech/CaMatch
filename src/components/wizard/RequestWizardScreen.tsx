import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import StepIndicator from "./StepIndicator";
import Step1Service from "./Step1Service";
import Step2Diagnostic from "./Step2Diagnostic";
import Step3Location from "./Step3Location";
import Step4Availability from "./Step4Availability";
import Step5Budget from "./Step5Budget";
import Step6Preferences from "./Step6Preferences";
import Step7Review from "./Step7Review";
import { useRequestWizardStore } from "../../stores/requestWizardStore";

interface RequestWizardScreenProps {
  onBack: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

const STEPS = [
  { component: Step1Service, props: {} },
  { component: Step2Diagnostic, props: {} },
  { component: Step3Location, props: {} },
  { component: Step4Availability, props: {} },
  { component: Step5Budget, props: {} },
  { component: Step6Preferences, props: {} },
  { component: Step7Review, props: {} },
];

export default function RequestWizardScreen({ onBack, onSubmit, loading }: RequestWizardScreenProps) {
  const { draft, goNext, goPrev, setStep, isStepValid } = useRequestWizardStore();
  const valid = isStepValid(draft.step);
  const isLastStep = draft.step === 7;
  const CurrentStep = STEPS[draft.step - 1]?.component;

  const handleEditStep = (step: number) => {
    setStep(step);
  };

  return (
    <div className="flex flex-col w-full min-h-dynamic pb-safe bg-cm-bg">
      <header className="sticky top-0 z-30 bg-cm-bg border-b border-cm-border/30">
        <div className="flex items-center gap-3 px-5 h-12">
          <button
            onClick={draft.step > 1 ? goPrev : onBack}
            className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-cm-text" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-[10px] font-bold text-cm-text-muted uppercase tracking-widest">
              Étape {draft.step}/7
            </span>
          </div>
          <div className="w-9" />
        </div>
        <StepIndicator currentStep={draft.step} />
      </header>

      <main className="flex-1 px-5 pt-5 pb-[max(104px,env(safe-area-inset-bottom,104px))]">
        <AnimatePresence mode="wait">
          <motion.div
            key={draft.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {draft.step === 1 && <Step1Service />}
            {draft.step === 2 && <Step2Diagnostic />}
            {draft.step === 3 && <Step3Location />}
            {draft.step === 4 && <Step4Availability />}
            {draft.step === 5 && <Step5Budget />}
            {draft.step === 6 && <Step6Preferences />}
            {draft.step === 7 && <Step7Review onEditStep={handleEditStep} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-cm-bg/90 backdrop-blur-xl border-t border-cm-border/30 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-[448px] mx-auto px-5 py-3">
          {!isLastStep ? (
            <button
              onClick={goNext}
              disabled={!valid}
              className={`w-full h-12 rounded-xl text-[13px] font-bold transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 ${
                valid
                  ? "bg-cm-text text-white hover:opacity-90"
                  : "bg-cm-border-soft text-cm-text-muted cursor-not-allowed"
              }`}
            >
              Continuer
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={loading}
              className={`w-full h-12 rounded-xl text-[13px] font-bold transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 ${
                loading
                  ? "bg-cm-border-soft text-cm-text-muted cursor-not-allowed"
                  : "bg-cm-text text-white hover:opacity-90"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Publier la demande
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
