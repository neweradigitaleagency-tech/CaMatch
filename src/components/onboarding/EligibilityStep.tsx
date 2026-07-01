import { Check, X } from "lucide-react";

interface EligibilityStepProps {
  onComplete: (eligible: boolean) => void;
}

const CHECKS = [
  "Être âgé(e) d'au moins 18 ans",
  "Résider en Côte d'Ivoire",
  "Posséder un numéro de téléphone valide",
  "Avoir une pièce d'identité valide (CNI ou passeport)",
  "Exercer ou vouloir exercer un métier de service",
];

export default function EligibilityStep({ onComplete }: EligibilityStepProps) {
  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-cm-text mb-1">Vérification d'éligibilité</h2>
      <p className="text-[13px] text-cm-text-soft mb-6">
        Assurez-vous de remplir ces conditions avant de continuer.
      </p>

      <div className="space-y-3 mb-8">
        {CHECKS.map((check) => (
          <div key={check} className="flex items-start gap-3 p-3.5 bg-cm-elevated border border-cm-border rounded-[14px]">
            <Check className="w-5 h-5 text-cm-accent shrink-0 mt-0.5" />
            <span className="text-[13px] text-cm-text font-medium">{check}</span>
          </div>
        ))}
      </div>

      <button onClick={() => onComplete(true)}
        className="w-full h-12 bg-cm-accent rounded-[16px] text-[14px] font-bold text-white cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all">
        Je remplis toutes les conditions
      </button>
    </div>
  );
}
