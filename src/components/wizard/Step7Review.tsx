import { Check, MapPin, Clock, Coins, Package, FileText, ChevronRight } from "lucide-react";
import { useRequestWizardStore } from "../../stores/requestWizardStore";
import { SERVICE_CATEGORIES } from "../../data/serviceCategories";

interface Step7ReviewProps {
  onEditStep: (step: number) => void;
}

const PREF_LABELS: Record<string, string> = {
  pro_provides: "Le professionnel fournit les matériaux",
  client_buys: "J'achète moi-même les matériaux",
  via_ca_match: "Achat via Ça Match",
  none: "Aucune préférence",
};

const BUDGET_LABELS: Record<string, string> = {
  receive_proposals: "Je souhaite recevoir des propositions",
  precise: "Budget précis",
  range: "Fourchette de budget",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  asap: "Dès que possible",
  today: "Aujourd'hui",
  this_week: "Cette semaine",
  custom: "Date précise",
};

export default function Step7Review({ onEditStep }: Step7ReviewProps) {
  const { draft } = useRequestWizardStore();
  const categoryName = SERVICE_CATEGORIES.find((c) => c.id === draft.category)?.name || draft.category;

  const sections = [
    {
      step: 1,
      icon: FileText,
      title: "Service",
      lines: [
        { label: "Catégorie", value: categoryName },
        ...(draft.subCategory ? [{ label: "Sous-catégorie", value: draft.subCategory }] : []),
      ],
    },
    {
      step: 2,
      icon: FileText,
      title: "Diagnostic",
      lines: [
        { label: "Description", value: draft.description.slice(0, 80) + (draft.description.length > 80 ? "..." : "") },
        ...(draft.photos.length > 0 ? [{ label: "Photos", value: `${draft.photos.length} photo(s)` }] : []),
        ...(draft.diagnostic.length > 0 ? [{ label: "Questions", value: `${draft.diagnostic.length} réponse(s)` }] : []),
      ],
    },
    {
      step: 3,
      icon: MapPin,
      title: "Adresse",
      lines: [
        { label: "Adresse", value: draft.address || "Non renseignée" },
        ...(draft.addressComplement ? [{ label: "Complément", value: draft.addressComplement }] : []),
      ],
    },
    {
      step: 4,
      icon: Clock,
      title: "Disponibilité",
      lines: [
        { label: "Quand", value: AVAILABILITY_LABELS[draft.availability || ""] || "Non renseigné" },
        ...(draft.scheduledDate ? [{ label: "Date", value: draft.scheduledDate }] : []),
        ...(draft.timeSlot ? [{ label: "Créneau", value: draft.timeSlot }] : []),
      ],
    },
    {
      step: 5,
      icon: Coins,
      title: "Budget",
      lines: [
        { label: "Mode", value: BUDGET_LABELS[draft.budgetMode || ""] || "Non renseigné" },
        ...(draft.budgetMode === "precise" && draft.budgetMax > 0 ? [{ label: "Budget", value: `${draft.budgetMax.toLocaleString()} F` }] : []),
        ...(draft.budgetMode === "range" ? [{ label: "Fourchette", value: `${draft.budgetMin.toLocaleString()} - ${draft.budgetMax.toLocaleString()} F` }] : []),
      ],
    },
    {
      step: 6,
      icon: Package,
      title: "Préférences",
      lines: [
        { label: "Matériaux", value: PREF_LABELS[draft.materialsPreference || ""] || "Non renseigné" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold text-cm-text">Vérifiez votre demande</h2>
        <p className="text-[13px] text-cm-text-muted mt-1">
          Assurez-vous que toutes les informations sont correctes avant de publier
        </p>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.step} className="bg-cm-elevated rounded-2xl border border-cm-border overflow-hidden">
            <button
              onClick={() => onEditStep(section.step)}
              className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-cm-bg/50 transition-colors active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cm-bg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-cm-text" />
                </div>
                <span className="text-[12px] font-bold text-cm-text">{section.title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-cm-text-muted">Modifier</span>
                <ChevronRight className="w-3.5 h-3.5 text-cm-text-muted" />
              </div>
            </button>
            <div className="px-4 pb-3 space-y-1.5">
              {section.lines.map((line, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] text-cm-text-muted">{line.label}</span>
                  <span className="text-[11px] font-bold text-cm-text text-right max-w-[200px] truncate">{line.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-center gap-2 py-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cm-accent" />
        <span className="text-[11px] text-cm-text-muted">Toutes les informations sont complètes</span>
        <Check className="w-3.5 h-3.5 text-cm-accent" />
      </div>
    </div>
  );
}
