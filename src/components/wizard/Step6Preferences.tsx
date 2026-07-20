import { Package, ShoppingBag, Store, Minus } from "lucide-react";
import { useRequestWizardStore } from "../../stores/requestWizardStore";
import type { MaterialsPreference } from "../../types";

const OPTIONS: { value: MaterialsPreference; label: string; desc: string; icon: typeof Package }[] = [
  { value: "pro_provides", label: "Le professionnel fournit les matériaux", desc: "Le pro apporte tout le nécessaire", icon: Package },
  { value: "client_buys", label: "J'achèterai moi-même les matériaux", desc: "Vous gérez l'achat des fournitures", icon: ShoppingBag },
  { value: "via_ca_match", label: "Acheter les matériaux via Ça Match", desc: "Nous trouvons les meilleurs fournisseurs", icon: Store },
  { value: "none", label: "Aucune préférence", desc: "À voir avec le professionnel", icon: Minus },
];

export default function Step6Preferences() {
  const { draft, setMaterialsPreference } = useRequestWizardStore();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-cm-text">Préférences de l'intervention</h2>
        <p className="text-[13px] text-cm-text-muted mt-1">
          Comment souhaitez-vous gérer les matériaux nécessaires ?
        </p>
      </div>

      <div className="space-y-2.5">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = draft.materialsPreference === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setMaterialsPreference(opt.value)}
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
    </div>
  );
}
