import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Search, TrendingUp, AlertTriangle } from "lucide-react"
import { useSupplierInvoices, useSupplierInvoiceStats } from "../../hooks/supplier/useSupplierInvoices"
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "../../services/supplier/invoices.service"
import { formatXOF } from "../../utils/format"
import type { InvoiceStatus } from "../../types/supplier"

type StatusFilter = InvoiceStatus | "all"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "paid", label: "Payées" },
  { value: "unpaid", label: "Impayées" },
  { value: "overdue", label: "En retard" },
  { value: "cancelled", label: "Annulées" },
]

export default function SupplierInvoicesScreen() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const { data: invoices, isLoading } = useSupplierInvoices()
  const { data: stats } = useSupplierInvoiceStats()

  const filtered = useMemo(() => {
    if (!invoices) return []
    let result = [...invoices]
    if (filter !== "all") result = result.filter((i) => i.status === filter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((i) => i.number.toLowerCase().includes(q) || i.clientName?.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [invoices, filter, search])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">Factures</h1>
        <p className="text-[13px] text-gray-500 mt-1">{stats?.total ?? 0} facture{(stats?.total ?? 0) > 1 ? "s" : ""}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <FileText className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-[18px] font-bold text-gray-900">{stats?.total ?? 0}</p>
          <p className="text-[10px] text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-[18px] font-bold text-gray-900">{formatXOF(stats?.paidAmount ?? 0)}</p>
          <p className="text-[10px] text-gray-500">Payé</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <FileText className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-[18px] font-bold text-gray-900">{stats?.unpaid ?? 0}</p>
          <p className="text-[10px] text-gray-500">Impayées</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <AlertTriangle className={`w-5 h-5 ${(stats?.overdue ?? 0) > 0 ? "text-red-500" : "text-gray-300"}`} />
          <p className="text-[18px] font-bold text-gray-900">{stats?.overdue ?? 0}</p>
          <p className="text-[10px] text-gray-500">En retard</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une facture..."
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20" />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
              filter === f.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}>{f.label}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="bg-gray-200/50 animate-pulse rounded-xl h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[13px] font-medium text-gray-500">Aucune facture trouvée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv) => (
            <div key={inv.id} onClick={() => navigate(`/supplier/invoices/${inv.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 cursor-pointer transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-gray-900">{inv.number}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${INVOICE_STATUS_COLORS[inv.status]}`}>
                      {INVOICE_STATUS_LABELS[inv.status]}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 mt-1">{inv.clientName} · {new Date(inv.createdAt).toLocaleDateString("fr-FR")}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Échéance: {new Date(inv.dueDate).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-bold text-gray-900">{formatXOF(inv.total)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
