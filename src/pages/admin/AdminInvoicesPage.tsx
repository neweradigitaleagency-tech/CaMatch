import { useState, useEffect, useCallback } from "react"
import { Download, FileText } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import AdminTable from "../../components/admin/ui/AdminTable"
import type { Column } from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import { formatXOF } from "../../utils/admin/formatCurrency"
import { downloadInvoice } from "../../services/invoiceService"
import type { Invoice } from "../../types/subscription"

const STATUS_OPTIONS = [
  { key: "all", label: "Toutes" },
  { key: "paid", label: "Payées" },
  { key: "pending", label: "En attente" },
  { key: "overdue", label: "En retard" },
  { key: "cancelled", label: "Annulées" },
  { key: "refunded", label: "Remboursées" },
]

const STATUS_BADGE_MAP: Record<string, string> = {
  paid: "active",
  pending: "pending",
  overdue: "rejected",
  cancelled: "inactive",
  refunded: "suspended",
}

const STATUS_LABELS: Record<string, string> = {
  paid: "Payée",
  pending: "En attente",
  overdue: "En retard",
  cancelled: "Annulée",
  refunded: "Remboursée",
}

const MOCK_INVOICES: (Invoice & { user_name?: string })[] = Array.from({ length: 15 }, (_, i) => {
  const statuses = ["paid", "paid", "paid", "pending", "overdue", "cancelled", "refunded"]
  const date = new Date(Date.now() - i * 20 * 86400000 - (i % 3) * 86400000)
  const amount = [4900, 9900, 14900, 24900, 49900, 0, 9900][i % 7]!
  const tax = Math.round(amount * 0.18)
  const userName = ["Aminata Diallo", "Koffi Kouamé", "Fatou Ndiaye", "Mamadou Touré", "Adjoua Konan", "Ousmane Sarr", "Mariam Bamba", "Lamine Faye", "Aïchatou Bello", "Idrissa Traoré"][i % 10]!
  return {
    id: `inv_${i + 1}`,
    payment_id: `pay_${i + 1}`,
    user_id: `user_${((i % 10) + 1)}`,
    user_name: userName,
    invoice_number: `CM-2026-${String(i + 1).padStart(4, "0")}`,
    pdf_url: null,
    amount,
    tax,
    total: amount + tax,
    status: statuses[i % statuses.length] as Invoice["status"],
    due_date: new Date(date.getTime() + 30 * 86400000).toISOString(),
    paid_at: statuses[i % statuses.length] === "paid" ? date.toISOString() : null,
    created_at: date.toISOString(),
  }
})

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<(Invoice & { user_name?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 400))
      setInvoices(MOCK_INVOICES)
    } catch {
      setInvoices(MOCK_INVOICES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = statusFilter === "all" ? invoices : invoices.filter((inv) => inv.status === statusFilter)

  if (error) return <ErrorState message={error} onRetry={fetchData} />

  const columns: Column<Invoice & { user_name?: string }>[] = [
    {
      key: "invoice_number", label: "Facture", sortable: true, width: "160px",
      render: (inv) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cm-surface flex items-center justify-center">
            <FileText className="w-4 h-4 text-cm-text-muted" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-cm-text">{inv.invoice_number}</p>
            <p className="text-[11px] text-cm-text-muted font-mono">{inv.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "user", label: "Client", sortable: true, width: "160px",
      render: (inv) => (
        <div className="flex flex-col">
          <span className="text-[13px] text-cm-text-soft">{inv.user_name ?? inv.user_id}</span>
          <span className="text-[11px] text-cm-text-muted font-mono">{inv.user_id}</span>
        </div>
      ),
    },
    {
      key: "amount", label: "Montant HT", sortable: true, width: "100px",
      render: (inv) => <span className="text-[12px] text-cm-text-soft">{formatXOF(inv.amount)}</span>,
    },
    {
      key: "tax", label: "Taxe", sortable: true, width: "80px",
      render: (inv) => <span className="text-[12px] text-cm-text-muted">{formatXOF(inv.tax)}</span>,
    },
    {
      key: "total", label: "Total TTC", sortable: true, width: "100px",
      render: (inv) => <span className="text-[13px] font-medium text-cm-text">{formatXOF(inv.total)}</span>,
    },
    {
      key: "status", label: "Statut", sortable: true, width: "100px",
      render: (inv) => (
        <StatusBadge status={STATUS_BADGE_MAP[inv.status] ?? "inactive"} label={STATUS_LABELS[inv.status] ?? inv.status} />
      ),
    },
    {
      key: "date", label: "Date", sortable: true, width: "120px",
      render: (inv) => (
        <div className="flex flex-col">
          <span className="text-[12px] text-cm-text-muted">{format(new Date(inv.created_at), "dd MMM yyyy", { locale: fr })}</span>
          {inv.paid_at && <span className="text-[11px] text-[var(--admin-accent)]">Payée le {format(new Date(inv.paid_at), "dd/MM/yy", { locale: fr })}</span>}
        </div>
      ),
    },
    {
      key: "actions", label: "", width: "80px",
      render: (inv) => (
        <button
          onClick={(e) => { e.stopPropagation(); downloadInvoice(inv) }}
          className="flex items-center gap-1 px-2 h-7 rounded-lg text-[11px] font-medium text-cm-text-soft bg-cm-surface hover:bg-cm-surface cursor-pointer"
        >
          <Download className="w-3 h-3" /> Télécharger
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Factures</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">{invoices.length} factures émises</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {STATUS_OPTIONS.map((f) => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${statusFilter === f.key ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"}`}>
            {f.label}
            {f.key !== "all" && <span className="ml-1.5 text-[11px] opacity-60">({invoices.filter((inv) => inv.status === f.key).length})</span>}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(inv) => inv.id}
        searchable
        searchKeys={["invoice_number", "user_id", "user_name"]}
        exportable
        loading={loading}
        emptyMessage="Aucune facture trouvée"
      />
    </div>
  )
}
