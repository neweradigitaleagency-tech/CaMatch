import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { MessageSquare, ChevronDown } from "lucide-react"
import { getSupportTickets, SUPPORT_STATUS_LABELS, SUPPORT_PRIORITY_LABELS, SUPPORT_CATEGORY_LABELS } from "../../services/admin/support.service"
import { usePermissions } from "../../hooks/usePermissions"
import AdminTable from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import type { Column } from "../../components/admin/ui/AdminTable"
import type { SupportTicket } from "../../services/admin/support.service"

type FilterType = "all" | "open" | "in_progress" | "resolved" | "closed"

import { format } from "date-fns"
import { fr } from "date-fns/locale"

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "open", label: "Ouverts" },
  { key: "in_progress", label: "En cours" },
  { key: "resolved", label: "Résolus" },
  { key: "closed", label: "Fermés" },
]

const STATUS_STYLES: Record<string, string> = {
  pending: "pending",
  active: "in_progress",
  completed: "active",
  cancelled: "inactive",
}

const PRIORITY_STYLES: Record<string, string> = {
  low: "text-gray-500 bg-gray-50 border-gray-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  urgent: "text-red-700 bg-red-50 border-red-200 font-semibold",
}

export default function AdminSupportPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { tickets: data, total: count } = await getSupportTickets({ perPage: 100 })
      setTickets(data); setTotal(count)
    } catch {
      setError("Impossible de charger les tickets support.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const UI_TO_DB: Record<string, string> = { open: "pending", in_progress: "active", resolved: "completed", closed: "cancelled" }
  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === (UI_TO_DB[filter] ?? filter))

  const canReply = hasPermission("support.reply")
  const canClose = hasPermission("support.close")

  const openCount = tickets.filter((t) => t.status === "pending").length

  const columns: Column<SupportTicket>[] = [
    {
      key: "subject", label: "Ticket", sortable: true, width: "280px",
      render: (t) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-gray-400">{t.id}</span>
            {t.priority === "urgent" && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
          </div>
          <p className="text-[13px] font-medium text-gray-900 truncate mt-0.5">{t.subject}</p>
        </div>
      ),
    },
    {
      key: "client_name", label: "Client", sortable: true, width: "140px",
      render: (t) => <span className="text-[12px] text-gray-700">{t.client_name || "—"}</span>,
    },
    {
      key: "priority", label: "Priorité", sortable: true, width: "100px",
      render: (t) => (
        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded-md border ${PRIORITY_STYLES[t.priority] ?? "text-gray-500"}`}>
          {SUPPORT_PRIORITY_LABELS[t.priority] ?? t.priority}
        </span>
      ),
    },
    {
      key: "status", label: "Statut", sortable: true, width: "110px",
      render: (t) => {
        const s = STATUS_STYLES[t.status] ?? "inactive"
        return <StatusBadge status={s} label={SUPPORT_STATUS_LABELS[t.status] ?? t.status} />
      },
    },
    {
      key: "category", label: "Catégorie", sortable: true, width: "110px",
      render: (t) => <span className="text-[12px] text-gray-500">{SUPPORT_CATEGORY_LABELS[t.category] ?? t.category}</span>,
    },
    {
      key: "updated_at", label: "Dernière activité", sortable: true, width: "130px",
      render: (t) => {
        const d = t.last_reply_at || t.updated_at
        return (
          <div className="flex flex-col">
            <span className="text-[12px] text-gray-500">{format(new Date(d), "d MMM HH:mm", { locale: fr })}</span>
            {t.admin_name && <span className="text-[11px] text-gray-400 mt-0.5">{t.admin_name}</span>}
          </div>
        )
      },
    },
    {
      key: "actions", label: "", width: "60px",
      render: (t) => (
        (canReply || canClose) && t.status !== "closed" ? (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === t.id ? null : t.id) }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {openMenuId === t.id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                  {canReply && (
                    <button onClick={() => navigate(`/admin/support/${t.id}`)} className="w-full px-3.5 py-2 text-[12px] text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                      <MessageSquare className="w-3.5 h-3.5" /> Répondre
                    </button>
                  )}
                  {canClose && t.status !== "completed" && (
                    <button onClick={() => navigate(`/admin/support/${t.id}`)} className="w-full px-3.5 py-2 text-[12px] text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px]">✓</span> Résoudre
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : null
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchTickets} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Support</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {total} ticket{total !== 1 ? "s" : ""}
            {openCount > 0 && <span className="ml-2 text-amber-600 font-medium">· {openCount} ouvert{openCount !== 1 ? "s" : ""}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${filter === f.key ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {f.label}
              {f.key !== "all" && (
              <span className="ml-1.5 text-[11px] opacity-60">
                ({tickets.filter((t) => t.status === (UI_TO_DB[f.key] ?? f.key)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(t) => t.id}
        onRowClick={(t) => navigate(`/admin/support/${t.id}`)}
        searchable
        searchKeys={["subject", "description", "client_name", "id"]}
        exportable
        loading={loading}
        emptyMessage="Aucun ticket trouvé"
      />
    </div>
  )
}
