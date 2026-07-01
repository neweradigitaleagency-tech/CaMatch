import { X, MapPin } from "lucide-react";
import { SERVICE_CATEGORIES } from "../data/serviceCategories";
import { LOCATIONS } from "../stores/locationStore";
import type { FilterState } from "../hooks/useProFilters";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onSetFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}

export default function FilterSheet({ open, filters, onSetFilter, onClose }: FilterSheetProps) {
  if (!open) return null;

  const availableSubcategories = filters.categoryId
    ? SERVICE_CATEGORIES.find((c) => c.id === filters.categoryId)?.subcategories || []
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-cm-overlay" />
      <div
        className="relative w-full max-w-md bg-cm-elevated rounded-t-[20px] p-5 pb-10 animate-slide-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-cm-text">Filtrer les résultats</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-cm-border-soft flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4 text-cm-text" />
          </button>
        </div>

        {/* Catégories */}
        <div className="mb-5">
          <p className="text-[13px] font-semibold text-cm-text mb-2.5">Catégorie</p>
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSetFilter("categoryId", filters.categoryId === cat.id ? null : cat.id);
                  onSetFilter("subCategory", null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer cm-scale-btn transition-colors ${
                  filters.categoryId === cat.id
                    ? "bg-cm-accent text-white"
                    : "bg-cm-border-soft text-cm-text-soft hover:bg-cm-accent-soft"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sous-catégories */}
        {filters.categoryId && availableSubcategories.length > 0 && (
          <div className="mb-5">
            <p className="text-[13px] font-semibold text-cm-text mb-2.5">Sous-catégorie</p>
            <div className="flex flex-wrap gap-2">
              {availableSubcategories.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => onSetFilter("subCategory", filters.subCategory === sub.name ? null : sub.name)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer cm-scale-btn transition-colors ${
                    filters.subCategory === sub.name
                      ? "bg-cm-accent text-white"
                      : "bg-cm-border-soft text-cm-text-soft hover:bg-cm-accent-soft"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="mb-5">
          <p className="text-[13px] font-semibold text-cm-text mb-2.5">Note minimum</p>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => onSetFilter("rating", r)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer cm-scale-btn transition-colors ${
                  filters.rating === r
                    ? "bg-cm-accent text-white"
                    : "bg-cm-border-soft text-cm-text-soft hover:bg-cm-accent-soft"
                }`}
              >
                {r === 0 ? "Tous" : `${r}★`}
              </button>
            ))}
          </div>
        </div>

        {/* Localisation */}
        <div className="mb-6">
          <p className="text-[13px] font-semibold text-cm-text mb-2.5">Localisation</p>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((loc) => {
              const hood = loc.split(",")[1]?.trim() || loc;
              const isActive = filters.location === hood;
              return (
                <button
                  key={loc}
                  onClick={() => onSetFilter("location", isActive ? "" : hood)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer cm-scale-btn transition-colors ${
                    isActive
                      ? "bg-cm-accent text-white"
                      : "bg-cm-border-soft text-cm-text-soft hover:bg-cm-accent-soft"
                  }`}
                >
                  {hood}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-cm-accent rounded-[var(--radius-cm)] text-[14px] font-medium text-white cm-scale-btn hover:bg-cm-accent-hover cursor-pointer"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}
