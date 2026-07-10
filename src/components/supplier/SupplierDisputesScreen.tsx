import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search, AlertTriangle, MessageCircle, Scale, CheckCircle, XCircle, Clock, ArrowUpRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getMockSupplierDisputes } from "../../data/supplier-mocks"
import type { DisputeStatus } from "../../types/supplier"
import { formatXOF } from "../../utils/format"

const STATUS_LABELS: Record<DisputeStatus, string> = {
  opened: "Ouvert",
  under_review: "En cours d'examen",
  resolved_supplier: "Résolu (fournisseur)",
  resolved_client: "Résolu (client)",
  rejected: "Rejeté",
}

const STATUS_COLORS: Record<DisputeStatus, string> = {
  opened: "bg-red-100 text-red-800",
  under_review: "bg-amber-100 text-amber-800",
  resolved_supplier: "bg-emerald-100 text-emerald-800",
  resolved_client: "bg-blue-100 text-blue-800",
  rejected: "bg-gray-100 text-gray-800",
}

const STATUS_ICONS: Record<DisputeStatus, typeof AlertTriangle> = {
  opened: AlertTriangle,
  under_review: Clock,
  resolved_supplier: CheckCircle,
  resolved_client: CheckCircle,
  rejected: XCircle,
}

export default function SupplierDisputesScreen() {
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id ?? "supplier-1")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const { data: disputes = [] } = useQuery({
    queryKey: ["supplier-disputes", userId],
    queryFn: () => getMockSupplierDisputes(userId),
  })

  const filtered = useMemo(() => {
    let result = [...disputes]
    if (statusFilter !== "all") result = result.filter((d) => d.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((d) => d.orderId.toLowerCase().includes(q) || d.reason.toLowerCase().includes(q) || d.clientName?.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [disputes, statusFilter, search])

  const openCount = disputes.filter((d) => d.status === "opened" || d.status === "under_review").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Litiges</h1>
          <p className="text-[12px] text-gray-500">
            {disputes.length} litiges · {openCount > 0 ? <span className="text-red-600 font-medium">{openCount} en cours</span> : "aucun en cours"}
          </p>
        </div>
      </div>

      {/* Alert banner if open disputes */}
      {openCount > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-[12px] font-medium text-red-800">{openCount} litige{openCount > 1 ? "s" : ""} nécessite{openCount === 1 ? "" : "nt"} votre attention</p>
            <p className="text-[11px] text-red-600">Répondez dans les plus brefs délais pour éviter une escalation</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-white border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green"
            placeholder="Rechercher un litige..." />
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {["all", "opened", "under_review", "resolved_supplier", "resolved_client", "rejected"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-3 h-7 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
              statusFilter === s
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}>
            {s === "all" ? "Tous" : STATUS_LABELS[s as DisputeStatus]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Scale className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-gray-500">Aucun litige trouvé</p>
          <p className="text-[12px] text-gray-400 mt-1">Les litiges apparaîtront ici quand un client contestera une commande</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((dispute) => {
            const Icon = STATUS_ICONS[dispute.status]
            return (
              <div key={dispute.id}
                onClick={() => navigate(`/supplier/disputes/${dispute.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 cursor-pointer transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${dispute.status === "opened" ? "text-red-500" : dispute.status === "under_review" ? "text-amber-500" : "text-gray-400"}`} />
                      <p className="text-[14px] font-semibold text-gray-900">{dispute.reason}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[dispute.status]}`}>
                        {STATUS_LABELS[dispute.status]}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-600 mt-1 line-clamp-2">{dispute.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {dispute.messages.length} messages
                      </span>
                      <span>{dispute.orderId}</span>
                      {dispute.clientName && <span>{dispute.clientName}</span>}
                      {dispute.amount > 0 && <span className="font-medium text-gray-700">{formatXOF(dispute.amount)}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400">
                      {new Date(dispute.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 ml-auto mt-1" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
