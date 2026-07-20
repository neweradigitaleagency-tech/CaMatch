import { useState, useMemo } from "react";
import { Search, Sparkles, Wrench, Truck, PartyPopper, BookOpen, Monitor, Handshake, ChevronRight, Info } from "lucide-react";
import { SERVICE_CATEGORIES } from "../../data/serviceCategories";
import { useRequestWizardStore } from "../../stores/requestWizardStore";

const ICON_MAP: Record<string, typeof Sparkles> = {
  "maison-reparations": Wrench,
  "transport-livraison": Truck,
  evenements: PartyPopper,
  "education-formation": BookOpen,
  "social-media-informatique": Monitor,
  "assistance-services": Handshake,
};

export default function Step1Service({ onAutoNext }: { onAutoNext?: () => void }) {
  const { draft, setCategory, setSubCategory } = useRequestWizardStore();
  const [search, setSearch] = useState("");
  const selectedCategory = draft.category;

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return SERVICE_CATEGORIES;
    const q = search.toLowerCase();
    return SERVICE_CATEGORIES.filter((cat) => {
      if (cat.name.toLowerCase().includes(q)) return true;
      return cat.subcategories.some((sub) => sub.name.toLowerCase().includes(q));
    });
  }, [search]);

  const handleSubCategorySelect = (sub: string) => {
    setSubCategory(sub);
    setTimeout(() => onAutoNext?.(), 300);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-cm-text">De quel service avez-vous besoin ?</h2>
        <p className="text-[13px] text-cm-text-muted mt-1">Choisissez une catégorie, puis précisez le service</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un service..."
          className="w-full h-11 pl-10 pr-4 text-[13px] bg-cm-elevated border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text placeholder:text-cm-text-muted font-medium"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredCategories.map((cat) => {
          const Icon = ICON_MAP[cat.id] || Sparkles;
          const selected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] cursor-pointer ${
                selected
                  ? "border-cm-text bg-cm-text text-white"
                  : "border-cm-border bg-cm-elevated text-cm-text hover:border-cm-text/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-white/20" : "bg-cm-bg"}`}>
                <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-cm-text"}`} />
              </div>
              <span className="text-[11px] font-bold text-center">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {selectedCategory && (
        <div>
          <h3 className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-2.5">
            Sous-catégorie
          </h3>
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.find((c) => c.id === selectedCategory)?.subcategories.map((sub) => (
              <button
                key={sub.name}
                onClick={() => handleSubCategorySelect(sub.name)}
                className={`px-3.5 py-2.5 rounded-[10px] text-[11px] font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  draft.subCategory === sub.name
                    ? "bg-cm-text text-white"
                    : "bg-cm-elevated text-cm-text border border-cm-border hover:bg-cm-bg"
                }`}
              >
                {draft.subCategory === sub.name && <ChevronRight className="w-3 h-3" />}
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCategory && !draft.subCategory && (
        <div className="flex items-center gap-2 text-[11px] text-cm-text-muted">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Sélectionnez une sous-catégorie pour continuer
        </div>
      )}
    </div>
  );
}
