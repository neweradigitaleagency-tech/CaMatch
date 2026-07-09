import { Search, X } from "lucide-react"

interface FilterOption {
  value: string
  label: string
}

interface FilterGroup {
  key: string
  label: string
  options: FilterOption[]
}

interface FilterBarProps {
  groups: FilterGroup[]
  activeFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onClear: (key: string) => void
  onClearAll: () => void
}

export default function FilterBar({ groups, activeFilters, onFilterChange, onClear, onClearAll }: FilterBarProps) {
  const hasActiveFilters = Object.keys(activeFilters).length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      {groups.map((group) => (
        <div key={group.key} className="relative">
          <select
            value={activeFilters[group.key] || ""}
            onChange={(e) => {
              if (e.target.value) onFilterChange(group.key, e.target.value)
              else onClear(group.key)
            }}
            className="appearance-none h-9 px-3 pr-8 text-[12px] bg-white border border-gray-200 rounded-lg text-gray-700 outline-none cursor-pointer hover:border-gray-300 focus:border-gray-400 transition-colors"
          >
            <option value="">{group.label}</option>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ))}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 h-9 px-3 text-[12px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
          Réinitialiser
        </button>
      )}
    </div>
  )
}
