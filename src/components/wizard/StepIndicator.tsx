import { motion } from "motion/react";
import { Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "Service" },
  { num: 2, label: "Diagnostic" },
  { num: 3, label: "Adresse" },
  { num: 4, label: "Disponibilité" },
  { num: 5, label: "Budget" },
  { num: 6, label: "Préférences" },
  { num: 7, label: "Vérification" },
];

export default function StepIndicator({ currentStep }: { currentStep: number }) {
  const activeGroup = Math.floor((currentStep - 1) / 2);
  const groups = [
    { label: "Service", doneAfter: 1 },
    { label: "Infos", doneAfter: 3 },
    { label: "Planification", doneAfter: 5 },
    { label: "Finalisation", doneAfter: 7 },
  ];

  return (
    <div className="px-5 pt-3 pb-0">
      <div className="flex items-center gap-1.5 mb-2">
        {groups.map((g, i) => {
          const isActive = i === activeGroup;
          const isDone = currentStep > g.doneAfter;
          return (
            <div key={g.label} className="flex items-center gap-1.5 flex-1">
              <div className="flex-1 h-1 rounded-full transition-colors duration-300 overflow-hidden bg-cm-border-soft">
                <motion.div
                  className="h-full bg-cm-text rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: isDone ? "100%" : isActive ? "50%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className={`text-[8px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                isActive || isDone ? "text-cm-text" : "text-cm-text-muted"
              }`}>
                {isDone ? <Check className="w-2.5 h-2.5 inline -mt-0.5" /> : null}
                {g.label}
              </span>
              {i < groups.length - 1 && (
                <span className="text-cm-text-muted/30 text-[10px]">/</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between px-0.5 mb-1">
        {STEPS.map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-0.5" style={{ width: `${100 / 7}%` }}>
            <motion.div
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                s.num <= currentStep ? "bg-cm-text" : "bg-cm-border-soft"
              }`}
              animate={{ scale: s.num === currentStep ? 1.4 : 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            />
            <span className={`text-[7px] font-medium text-center leading-tight transition-colors ${
              s.num === currentStep ? "text-cm-text font-bold" : "text-cm-text-muted"
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
