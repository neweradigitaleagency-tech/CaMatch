import { useState, useEffect, useCallback } from "react"
import {
  getTransactions, getPayouts, getPaymentStats, processRefund, approvePayout,
  TXN_STATUS_LABELS, TXN_TYPE_LABELS, TXN_METHOD_LABELS,
} from "../../services/admin/payments.service"
import { usePermissions } from "../../hooks/usePermissions"
import AdminTable from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import { formatXOF } from "../../utils/admin/formatCurrency"
import { CreditCard, ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp, Wallet, Ban, CheckCircle, Percent } from "lucide-react"
import type { Column } from "../../components/admin/ui/AdminTable"
import type { Transaction, PayoutItem, PaymentStats } from "../../services/admin/payments.service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type TabType = "transactions" | "payouts" | "accounting"

const TABS: { key: TabType; label: string }[] = [
  { key: "transactions", label: "Transactions" },
  { key: "payouts", label: "Reversements" },
  { key: "accounting", label: "Comptabilité" },
]

const TXN_FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "captured", label: "Capturées" },
  { key: "pending", label: "En attente" },
  { key: "failed", label: "Échouées" },
  { key: "refunded", label: "Remboursées" },
]

const PAYOUT_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "pending", label: "En attente" },
  { key: "processing", label: "En cours" },
  { key: "completed", label: "Effectués" },
  { key: "failed", label: "Échoués" },
]

const STATUS_STYLES: Record<string, string> = {
  pending: "pending", authorized: "info", captured: "active",
  completed: "active", failed: "rejected", refunded: "suspended",
  partially_refunded: "suspended", processing: "info",
}

const TYPE_STYLES: Record<string, string> = {
  payment: "text-[var(--admin-accent)] bg-[var(--admin-accent-soft)]",
  payout: "text-[var(--admin-info)] bg-[var(--admin-info-soft)]",
  refund: "text-[var(--admin-danger)] bg-[var(--admin-danger-soft)]",
  fee: "text-cm-text-muted bg-cm-surface",
}

export default function AdminPaymentsPage() {
  const { hasPermission } = usePermissions()
  const [tab, setTab] = useState<TabType>("transactions")
  const [txns, setTxns] = useState<Transaction[]>([])
  const [txnsTotal, setTxnsTotal] = useState(0)
  const [payouts, setPayouts] = useState<PayoutItem[]>([])
  const [payoutsTotal, setPayoutsTotal] = useState(0)
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [txnFilter, setTxnFilter] = useState("all")
  const [payoutFilter, setPayoutFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s] = await Promise.all([
        getPaymentStats(),
      ])
      setStats(s)
    } catch {
      setError("Impossible de charger les données")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTxns = useCallback(async () => {
    try {
      const { transactions: data, total: count } = await getTransactions({ perPage: 100 })
      setTxns(data); setTxnsTotal(count)
    } catch { /* ignore — parent fetchAll handles errors */ }
  }, [])

  const fetchPayouts = useCallback(async () => {
    try {
      const { payouts: data, total: count } = await getPayouts({ perPage: 100 })
      setPayouts(data); setPayoutsTotal(count)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { if (tab === "transactions") fetchTxns() }, [tab, fetchTxns])
  useEffect(() => { if (tab === "payouts") fetchPayouts() }, [tab, fetchPayouts])

  const filteredTxns = txnFilter === "all" ? txns : txns.filter((t) => t.status === txnFilter)
  const filteredPayouts = payoutFilter === "all" ? payouts : payouts.filter((p) => p.status === payoutFilter)

  const handleRefund = async (txnId: string) => {
    setActionLoading(txnId)
    try {
      await processRefund(txnId)
      setTxns((prev) => prev.map((t) => t.id === txnId ? { ...t, status: "refunded", type: "refund" } : t))
    } finally {
      setActionLoading(null)
    }
  }

  const handleApprovePayout = async (payoutId: string) => {
    setActionLoading(payoutId)
    try {
      await approvePayout(payoutId)
      setPayouts((prev) => prev.map((p) => p.id === payoutId ? { ...p, status: "processing" } : p))
    } finally {
      setActionLoading(null)
    }
  }

  if (error) return <ErrorState message={error} onRetry={fetchAll} />

  const txnColumns: Column<Transaction>[] = [
    {
      key: "id", label: "Transaction", sortable: true, width: "250px",
      render: (t) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cm-text-muted">{t.id.slice(0, 8)}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TYPE_STYLES[t.type] ?? "text-cm-text-muted bg-cm-surface"}`}>
              {TXN_TYPE_LABELS[t.type] ?? t.type}
            </span>
          </div>
          <p className="text-[12px] text-cm-text-soft truncate mt-0.5">{t.description}</p>
        </div>
      ),
    },
    {
      key: "client_name", label: "Client / Pro", sortable: true, width: "140px",
      render: (t) => (
        <div className="flex flex-col">
          {t.client_name && <span className="text-[12px] text-cm-text-soft">{t.client_name}</span>}
          {t.pro_name && <span className="text-[11px] text-cm-text-muted">{t.pro_name}</span>}
          {!t.client_name && !t.pro_name && <span className="text-[12px] text-cm-text-muted">—</span>}
        </div>
      ),
    },
    {
      key: "amount", label: "Montant", sortable: true, width: "110px",
      render: (t) => {
        const isNegative = t.type === "refund"
        return (
          <div className="flex flex-col">
            <span className={`text-[12px] font-medium ${isNegative ? "text-red-600" : "text-cm-text"}`}>
              {isNegative ? "-" : ""}{formatXOF(t.amount)}
            </span>
            {t.fee > 0 && <span className="text-[10px] text-cm-text-muted">Frais: {formatXOF(t.fee)}</span>}
          </div>
        )
      },
    },
    {
      key: "status", label: "Statut", sortable: true, width: "100px",
      render: (t) => {
        const s = STATUS_STYLES[t.status] ?? "inactive"
        return <StatusBadge status={s} label={TXN_STATUS_LABELS[t.status] ?? t.status} />
      },
    },
    {
      key: "payment_method", label: "Méthode", sortable: true, width: "120px",
      render: (t) => <span className="text-[12px] text-cm-text-muted">{TXN_METHOD_LABELS[t.payment_method] ?? t.payment_method}</span>,
    },
    {
      key: "created_at", label: "Date", sortable: true, width: "110px",
      render: (t) => (
        <span className="text-[12px] text-cm-text-muted">{format(new Date(t.created_at), "d MMM HH:mm", { locale: fr })}</span>
      ),
    },
    {
      key: "actions", label: "", width: "80px",
      render: (t) => (
        t.status === "captured" && hasPermission("payments.refund") ? (
          <button
            onClick={(e) => { e.stopPropagation(); handleRefund(t.id) }}
            disabled={actionLoading === t.id}
            className="flex items-center gap-1 px-2 h-7 rounded-lg text-[11px] font-medium text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer disabled:opacity-50"
          >
            {actionLoading === t.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Ban className="w-3 h-3" />}
            Rembourser
          </button>
        ) : null
      ),
    },
  ]

  const payoutColumns: Column<PayoutItem>[] = [
    {
      key: "id", label: "Virement", sortable: true, width: "180px",
      render: (p) => <span className="text-[11px] font-mono text-cm-text-muted">{p.id.slice(0, 8)}</span>,
    },
    {
      key: "payee_name", label: "Bénéficiaire", sortable: true, width: "150px",
      render: (p) => <span className="text-[12px] text-cm-text-soft">{p.payee_name || "—"}</span>,
    },
    {
      key: "amount", label: "Montant", sortable: true, width: "110px",
      render: (p) => <span className="text-[12px] font-medium text-cm-text">{formatXOF(p.amount)}</span>,
    },
    {
      key: "method", label: "Méthode", sortable: true, width: "120px",
      render: (p) => <span className="text-[12px] text-cm-text-muted">{TXN_METHOD_LABELS[p.method] ?? p.method}</span>,
    },
    {
      key: "status", label: "Statut", sortable: true, width: "100px",
      render: (p) => {
        const s = STATUS_STYLES[p.status] ?? "inactive"
        return <StatusBadge status={s} label={TXN_STATUS_LABELS[p.status] ?? p.status} />
      },
    },
    {
      key: "created_at", label: "Date", sortable: true, width: "110px",
      render: (p) => (
        <span className="text-[12px] text-cm-text-muted">{format(new Date(p.created_at), "d MMM", { locale: fr })}</span>
      ),
    },
    {
      key: "actions", label: "", width: "100px",
      render: (p) => (
        p.status === "pending" && hasPermission("payouts.approve") ? (
          <button
            onClick={(e) => { e.stopPropagation(); handleApprovePayout(p.id) }}
            disabled={actionLoading === p.id}
            className="flex items-center gap-1 px-2 h-7 rounded-lg text-[11px] font-medium text-[var(--admin-accent)] bg-[var(--admin-accent-soft)] hover:opacity-80 cursor-pointer disabled:opacity-50"
          >
            {actionLoading === p.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            Approuver
          </button>
        ) : null
      ),
    },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-cm-text">Paiements</h1>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Revenus totaux" value={formatXOF(stats?.total_revenue ?? 0)} accent />
        <StatCard icon={<ArrowUpRight className="w-4 h-4" />} label="Virements pros" value={formatXOF(stats?.total_payouts ?? 0)} valueColor="text-[var(--admin-info)]" />
        <StatCard icon={<RefreshCw className="w-4 h-4" />} label="Remboursements" value={formatXOF(stats?.total_refunds ?? 0)} valueColor="text-[var(--admin-danger)]" />
        <StatCard icon={<Wallet className="w-4 h-4" />} label="En attente" value={formatXOF((stats?.pending_transactions ?? 0) + (stats?.pending_payouts ?? 0))} valueColor="text-amber-600" />
      </div>

      <div className="flex items-center gap-1 border-b border-cm-border">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap cursor-pointer transition-colors border-b-2 -mb-px ${
              tab === t.key ? "border-cm-text text-cm-text" : "border-transparent text-cm-text-muted hover:text-cm-text-soft"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "transactions" && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {TXN_FILTERS.map((f) => (
              <button key={f.key} onClick={() => setTxnFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${txnFilter === f.key ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"}`}>
                {f.label}
                {f.key !== "all" && <span className="ml-1.5 text-[11px] opacity-60">({txns.filter((t) => t.status === f.key).length})</span>}
              </button>
            ))}
          </div>
          <AdminTable
            columns={txnColumns}
            data={filteredTxns}
            keyExtractor={(t) => t.id}
            searchable
            searchKeys={["description", "client_name", "pro_name", "id"]}
            exportable
            loading={loading}
            emptyMessage="Aucune transaction trouvée"
          />
        </>
      )}

      {tab === "payouts" && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {PAYOUT_FILTERS.map((f) => (
              <button key={f.key} onClick={() => setPayoutFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${payoutFilter === f.key ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"}`}>
                {f.label}
                {f.key !== "all" && <span className="ml-1.5 text-[11px] opacity-60">({payouts.filter((p) => p.status === f.key).length})</span>}
              </button>
            ))}
          </div>
          <AdminTable
            columns={payoutColumns}
            data={filteredPayouts}
            keyExtractor={(p) => p.id}
            searchable
            searchKeys={["payee_name", "id"]}
            exportable
            loading={loading}
            emptyMessage="Aucun reversement trouvé"
          />
        </>
      )}

      {tab === "accounting" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Revenus du mois" value={formatXOF(stats?.monthly_revenue ?? 0)} accent />
            <StatCard icon={<Percent className="w-4 h-4" />} label="Frais plateforme" value={formatXOF(stats?.fee_revenue ?? 0)} />
            <StatCard icon={<ArrowDownLeft className="w-4 h-4" />} label="Virements en attente" value={formatXOF(stats?.pending_payouts ?? 0)} valueColor="text-amber-600" />
          </div>

          <div className="bg-cm-elevated border border-cm-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-cm-border/40">
              <h3 className="text-[13px] font-semibold text-cm-text">Synthèse financière</h3>
            </div>
            <div className="p-5">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-cm-text-muted font-medium">
                    <th className="text-left pb-3 pr-4">Indicateur</th>
                    <th className="text-right pb-3">Valeur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cm-border/40">
                  <Row label="Revenus totaux (transactions capturées)" value={formatXOF(stats?.total_revenue ?? 0)} accent />
                  <Row label="Frais de plateforme perçus" value={formatXOF(stats?.fee_revenue ?? 0)} />
                  <Row label="Remboursements effectués" value={formatXOF(stats?.total_refunds ?? 0)} danger />
                  <Row label="Revenus nets" value={formatXOF((stats?.total_revenue ?? 0) - (stats?.total_refunds ?? 0))} bold />
                  <tr className="border-t border-cm-border">
                    <td className="py-3 pr-4 text-cm-text-muted font-medium">Virements pros effectués</td>
                    <td className="text-right py-3 text-cm-text font-medium">{formatXOF(stats?.total_payouts ?? 0)}</td>
                  </tr>
                  <Row label="Virements en attente" value={formatXOF(stats?.pending_payouts ?? 0)} warning />
                  <Row label="Transactions en attente" value={formatXOF(stats?.pending_transactions ?? 0)} warning />
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-cm-elevated border border-cm-border rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-cm-text mb-3">Répartition par méthode</h3>
            <MethodBar method="wave" color="bg-emerald-500" />
            <MethodBar method="orange_money" label="Orange Money" color="bg-orange-500" />
            <MethodBar method="mtn" label="MTN Mobile Money" color="bg-blue-500" />
            <MethodBar method="cash" label="Espèces" color="bg-cm-surface0" />
            <MethodBar method="card" label="Carte bancaire" color="bg-violet-500" />
          </div>
        </div>
      )}
    </div>
  )
}

function MethodBar({ method, label, color }: { method: string; label?: string; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-[12px] text-cm-text-soft w-32">{label ?? METHOD_LABELS[method] ?? method}</span>
      <div className="flex-1 h-2 bg-cm-surface rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: "0%" }} />
      </div>
    </div>
  )
}

const METHOD_LABELS: Record<string, string> = {
  wave: "Wave", orange_money: "Orange Money", mtn: "MTN Mobile Money",
  cash: "Espèces", card: "Carte bancaire",
}

function Row({ label, value, accent, danger, warning, bold }: { label: string; value: string; accent?: boolean; danger?: boolean; warning?: boolean; bold?: boolean }) {
  return (
    <tr>
      <td className="py-2.5 pr-4 text-cm-text-muted">{label}</td>
      <td className={`text-right py-2.5 ${accent ? "text-[var(--admin-accent)]" : danger ? "text-[var(--admin-danger)]" : warning ? "text-amber-600" : "text-cm-text"} ${bold ? "font-bold" : "font-medium"}`}>{value}</td>
    </tr>
  )
}

function StatCard({ icon, label, value, accent, valueColor }: { icon: React.ReactNode; label: string; value: string; accent?: boolean; valueColor?: string }) {
  return (
    <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-cm-text-muted">{icon}</span>
        <span className="text-[11px] text-cm-text-muted font-medium">{label}</span>
      </div>
      <p className={`text-[18px] font-bold ${valueColor ?? (accent ? "text-[var(--admin-accent)]" : "text-cm-text")}`}>{value}</p>
    </div>
  )
}
