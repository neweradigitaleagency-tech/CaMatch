import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SERVICE_CATEGORIES } from "../../data/serviceCategories";

interface CategoryPickerStepProps {
  selectedCategoryIds: string[];
  selectedSubCategories: string[];
  onCategoriesChange: (categoryIds: string[], subCategories: string[]) => void;
}

export default function CategoryPickerStep({ selectedCategoryIds, selectedSubCategories, onCategoriesChange }: CategoryPickerStepProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleCategory = (catId: string) => {
    const next = selectedCategoryIds.includes(catId)
      ? selectedCategoryIds.filter((id) => id !== catId)
      : [...selectedCategoryIds, catId];
    onCategoriesChange(next, selectedSubCategories);
  };

  const toggleSub = (subName: string) => {
    const next = selectedSubCategories.includes(subName)
      ? selectedSubCategories.filter((s) => s !== subName)
      : [...selectedSubCategories, subName];
    onCategoriesChange(selectedCategoryIds, next);
  };

  const filtered = SERVICE_CATEGORIES.filter((cat) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.subcategories.some((s) => s.name.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-cm-text mb-1">Vos métiers</h2>
      <p className="text-[13px] text-cm-text-soft mb-4">
        Sélectionnez les services que vous proposez.
      </p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted focus:border-cm-accent"
          placeholder="Rechercher un métier..."
        />
      </div>

      <div className="space-y-2">
        {filtered.map((cat) => (
          <div key={cat.id} className="bg-cm-elevated border border-cm-border rounded-[14px] overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
              className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-cm-accent-soft/30 transition-colors"
            >
              <span className="text-[18px]">{cat.icon}</span>
              <span className="flex-1 text-[13px] font-semibold text-cm-text text-left">{cat.name}</span>
              <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-cm-border-soft rounded-full peer peer-checked:bg-cm-accent after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </button>
            <AnimatePresence>
              {expanded === cat.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 flex flex-wrap gap-1.5 border-t border-cm-border pt-2">
                    {cat.subcategories.map((sub) => {
                      const isSelected = selectedSubCategories.includes(sub.name);
                      return (
                        <button
                          key={sub.name}
                          onClick={() => toggleSub(sub.name)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-cm-accent text-white"
                              : "bg-cm-border-soft text-cm-text-soft hover:bg-cm-accent-soft"
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {(selectedCategoryIds.length > 0 || selectedSubCategories.length > 0) && (
        <div className="mt-4 p-3 bg-cm-accent-soft rounded-[12px]">
          <p className="text-[11px] text-cm-accent font-medium">
            {selectedCategoryIds.length} catégorie{selectedCategoryIds.length !== 1 ? "s" : ""} · {selectedSubCategories.length} sous-catégorie{selectedSubCategories.length !== 1 ? "s" : ""} sélectionnée{selectedSubCategories.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
