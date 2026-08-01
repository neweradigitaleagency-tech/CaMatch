import { useState, useEffect, useCallback } from "react"
import { getAdminLogs, LOG_ACTION_LABELS } from "../../services/admin/logs.service"
import AdminTable from "../../components/admin/ui/AdminTable"
import ErrorState from "../../components/admin/ui/ErrorState"
import type { Column } from "../../components/admin/ui/AdminTable"
import type { AdminLogEntry } from "../../services/admin/logs.service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { logs: data, total: count } = await getAdminLogs({ perPage: 100 })
      setLogs(data); setTotal(count)
    } catch {
      setError("Impossible de charger les logs.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const columns: Column<AdminLogEntry>[] = [
    {
      key: "created_at", label: "Date", sortable: true, width: "140px",
      render: (l) => (
        <span className="text-[12px] text-cm-text-muted whitespace-nowrap">
          {format(new Date(l.created_at), "d MMM HH:mm", { locale: fr })}
        </span>
      ),
    },
    {
      key: "admin_name", label: "Admin", sortable: true, width: "130px",
      render: (l) => <span className="text-[12px] font-medium text-cm-text-soft">{l.admin_name}</span>,
    },
    {
      key: "action", label: "Action", sortable: true, width: "160px",
      render: (l) => {
        const actionLabel = LOG_ACTION_LABELS[l.action] ?? l.action
        const colors: Record<string, string> = {
          login: "text-blue-600 bg-blue-50",
          logout: "text-cm-text-soft bg-cm-surface",
          suspend: "text-red-600 bg-red-50",
          ban: "text-red-600 bg-red-50",
          reactivate: "text-green-600 bg-green-50",
          verify: "text-[var(--admin-accent)] bg-[var(--admin-accent-soft)]",
          reject: "text-red-600 bg-red-50",
          refund: "text-orange-600 bg-orange-50",
          approve: "text-[var(--admin-accent)] bg-[var(--admin-accent-soft)]",
          create: "text-blue-600 bg-blue-50",
          update: "text-blue-600 bg-blue-50",
          delete: "text-red-600 bg-red-50",
        }
        const colorKey = l.action.split("_")[1] ?? l.action
        const color = colors[colorKey] ?? "text-cm-text-soft bg-cm-surface"

        return <span className={`text-[11px] px-2 py-0.5 rounded-md ${color}`}>{actionLabel}</span>
      },
    },
    {
      key: "target", label: "Cible", sortable: false, width: "180px",
      render: (l) => (
        <div className="flex flex-col">
          <span className="text-[12px] text-cm-text-soft capitalize">{l.target_type}</span>
          {l.target_name && <span className="text-[11px] text-cm-text-muted">{l.target_name}</span>}
        </div>
      ),
    },
    {
      key: "details", label: "Détails", sortable: false,
      render: (l) => <span className="text-[12px] text-cm-text-muted truncate block max-w-[300px]">{l.details}</span>,
    },
    {
      key: "ip_address", label: "IP", sortable: true, width: "110px",
      render: (l) => (
        <span className="text-[11px] font-mono text-cm-text-muted">{l.ip_address}</span>
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchLogs} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Logs d'audit</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">{total} entrée{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={logs}
        keyExtractor={(l) => l.id}
        searchable
        searchKeys={["admin_name", "details", "target_name", "action", "id"]}
        exportable
        loading={loading}
        emptyMessage="Aucun log trouvé"
      />
    </div>
  )
}
