import { Coins, DollarSign, ArrowLeftRight } from "lucide-react";
import { useRequestWizardStore } from "../../stores/requestWizardStore";
import type { BudgetMode } from "../../types";

const OPTIONS: { value: BudgetMode; label: string; desc: string; icon: typeof Coins }[] = [
  { value: "receive_proposals", label: "Je souhaite recevoir des propositions", desc: "Les professionnels proposent leur prix", icon: DollarSign },
  { value: "precise", label: "J'ai un budget précis", desc: "Vous indiquez le montant exact", icon: Coins },
  { value: "range", label: "Fourchette de budget", desc: "Vous définissez un min et un max", icon: ArrowLeftRight },
];

export default function Step5Budget() {
  const { draft, setBudgetMode, setBudgetMin, setBudgetMax } = useRequestWizardStore();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-cm-text">Quel est votre budget ?</h2>
        <p className="text-[13px] text-cm-text-muted mt-1">
          Cela aide les professionnels à vous faire une proposition adaptée
        </p>
      </div>

      <div className="space-y-2.5">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = draft.budgetMode === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setBudgetMode(opt.value)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left active:scale-[0.97] cursor-pointer ${
                selected
                  ? "border-cm-text bg-cm-text text-white"
                  : "border-cm-border bg-cm-elevated text-cm-text hover:border-cm-text/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selected ? "bg-white/20" : "bg-cm-bg"
              }`}>
                <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-cm-text"}`} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold">{opt.label}</p>
                <p className={`text-[11px] mt-0.5 ${selected ? "text-white/70" : "text-cm-text-muted"}`}>{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {draft.budgetMode === "precise" && (
        <div className="bg-cm-elevated rounded-2xl p-4 border border-cm-border">
          <label className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-2 block">
            Votre budget (F CFA)
          </label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
            <input
              type="number"
              value={draft.budgetMax || ""}
              onChange={(e) => { setBudgetMax(Number(e.target.value)); setBudgetMin(0); }}
              placeholder="50 000"
              className="w-full h-11 pl-9 pr-4 text-[13px] font-medium bg-cm-bg border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text placeholder:text-cm-text-muted"
            />
          </div>
        </div>
      )}

      {draft.budgetMode === "range" && (
        <div className="bg-cm-elevated rounded-2xl p-4 border border-cm-border space-y-3">
          <div>
            <label className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-2 block">
              Budget minimum (F CFA)
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
              <input
                type="number"
                value={draft.budgetMin || ""}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                placeholder="10 000"
                className="w-full h-11 pl-9 pr-4 text-[13px] font-medium bg-cm-bg border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text placeholder:text-cm-text-muted"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-2 block">
              Budget maximum (F CFA)
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
              <input
                type="number"
                value={draft.budgetMax || ""}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                placeholder="100 000"
                className="w-full h-11 pl-9 pr-4 text-[13px] font-medium bg-cm-bg border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text placeholder:text-cm-text-muted"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
