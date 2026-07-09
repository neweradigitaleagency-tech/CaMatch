import { useState, useMemo } from "react"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Download } from "lucide-react"
import { exportCSV } from "../../../utils/admin/exportCSV"

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  width?: string
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  pageSize?: number
  searchable?: boolean
  searchKeys?: string[]
  exportable?: boolean
  exportTransform?: (item: T) => Record<string, unknown>
  loading?: boolean
  emptyMessage?: string
}

export default function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  pageSize = 20,
  searchable = false,
  searchKeys,
  exportable = false,
  exportTransform,
  loading = false,
  emptyMessage = "Aucune donnée",
}: AdminTableProps<T>) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const filtered = useMemo(() => {
    if (!search || !searchKeys) return data
    const q = search.toLowerCase()
    return data.filter((item) =>
      searchKeys.some((key) => {
        const val = (item as Record<string, unknown>)[key]
        return String(val ?? "").toLowerCase().includes(q)
      })
    )
  }, [data, search, searchKeys])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = typeof aVal === "number" ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal))
      return sortOrder === "asc" ? cmp : -cmp
    })
  }, [filtered, sortKey, sortOrder])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${85 + Math.random() * 15}%` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {(searchable || exportable) && (
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          {searchable && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Rechercher..."
                className="w-full h-9 pl-9 pr-4 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 placeholder-gray-400 focus:border-gray-300"
              />
            </div>
          )}
          {exportable && (
            <button
              onClick={() => exportCSV(exportTransform ? (data as any[]).map(exportTransform) : data as Record<string, unknown>[], "export")}
              className="flex items-center gap-1.5 h-9 px-3 text-[12px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider ${col.sortable ? "cursor-pointer select-none hover:text-gray-700" : ""}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[13px] text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-gray-50 text-[13px] transition-colors ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-500">
            {sorted.length} résultat{(sorted.length > 1) ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-[12px] text-gray-600 font-medium">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
