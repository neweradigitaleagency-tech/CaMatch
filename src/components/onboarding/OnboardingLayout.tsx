import { type ReactNode } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useProOnboardingStore } from "../../stores/proOnboardingStore";

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  disableNext?: boolean;
  loading?: boolean;
  hideNext?: boolean;
}

const STEPS = [
  { label: "Infos", step: 0 },
  { label: "Média", step: 5 },
  { label: "Vérif.", step: 7 },
  { label: "Paiement", step: 9 },
  { label: "Final", step: 11 },
];

export default function OnboardingLayout({
  children, title, subtitle, onNext, onBack,
  nextLabel = "Suivant", backLabel = "Retour",
  disableNext = false, loading = false, hideNext = false,
}: OnboardingLayoutProps) {
  const currentStep = useProOnboardingStore((s) => s.currentStep);
  const maxCompletedStep = useProOnboardingStore((s) => s.maxCompletedStep);

  const currentGroup = STEPS.findIndex((g, i) => {
    const next = STEPS[i + 1];
    return currentStep >= g.step && (!next || currentStep < next.step);
  });
  const activeGroup = currentGroup >= 0 ? currentGroup : STEPS.length - 1;

  return (
    <div className="min-h-screen bg-cm-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl border-b border-cm-border/40">
        <div className="flex items-center gap-3 px-4 h-14">
          {onBack && (
            <button onClick={onBack}
              className="cm-scale-btn w-8 h-8 flex items-center justify-center rounded-[12px] bg-cm-elevated hover:bg-cm-border/50 cursor-pointer">
              <ArrowLeft className="w-4 h-4 text-cm-text" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-bold text-cm-text truncate">{title}</h1>
            {subtitle && <p className="text-[11px] text-cm-text-muted truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Grouped Stepper */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1">
            {STEPS.map((g, i) => {
              const isActive = i === activeGroup;
              const nextStep = STEPS[i + 1];
              const isDone = nextStep ? maxCompletedStep >= nextStep.step : maxCompletedStep >= 12;
              return (
                <div key={g.label} className="flex-1 flex items-center gap-1">
                  <div
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      isDone ? "bg-cm-accent" : isActive ? "bg-cm-accent/60" : "bg-cm-border-soft"
                    }`}
                  />
                  <span className={`text-[9px] font-medium whitespace-nowrap ${
                    isActive ? "text-cm-accent" : "text-cm-text-muted"
                  }`}>
                    {g.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-cm-text-muted shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-24">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-cm-bg/80 backdrop-blur-xl border-t border-cm-border/40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          {onBack && (
            <button onClick={onBack}
              className="h-11 px-5 rounded-[14px] text-[13px] font-medium text-cm-text border border-cm-border bg-cm-elevated cursor-pointer hover:bg-cm-accent-soft transition-colors active:scale-[0.97]">
              {backLabel}
            </button>
          )}
          {!hideNext && onNext && (
            <button onClick={onNext} disabled={disableNext || loading}
              className={`flex-1 h-11 rounded-[14px] text-[13px] font-bold text-white cursor-pointer transition-all active:scale-[0.97] flex items-center justify-center gap-2 ${
                disableNext || loading
                  ? "bg-cm-border-soft text-cm-text-muted cursor-not-allowed"
                  : "bg-cm-accent hover:opacity-90"
              }`}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {nextLabel}
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
