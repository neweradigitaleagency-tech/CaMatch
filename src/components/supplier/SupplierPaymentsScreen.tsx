import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Wallet, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle, XCircle, Clock, RotateCcw, Filter, ChevronDown } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getMockSupplierPayments, MOCK_BALANCES, MOCK_PAYOUTS } from "../../data/supplier-mocks"
import type { SupplierPaymentStatus, SupplierPaymentProvider } from "../../types/supplier"
import { formatXOF } from "../../utils/format"

const STATUS_LABELS: Record<SupplierPaymentStatus, string> = {
  pending: "En attente",
  captured: "Reçu",
  refunded: "Remboursé",
  partially_refunded: "Partiellement remboursé",
  failed: "Échoué",
}

const STATUS_COLORS: Record<SupplierPaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  captured: "bg-emerald-100 text-emerald-800",
  refunded: "bg-red-100 text-red-800",
  partially_refunded: "bg-orange-100 text-orange-800",
  failed: "bg-cm-surface text-cm-text",
}

const PROVIDER_ICONS: Record<SupplierPaymentProvider, string> = {
  orange_money: "OM",
  mtn_momo: "MTN",
  wave: "WAVE",
  moov_money: "MOOV",
}

const PROVIDER_COLORS: Record<SupplierPaymentProvider, string> = {
  orange_money: "bg-orange-500",
  mtn_momo: "bg-yellow-500",
  wave: "bg-blue-500",
  moov_money: "bg-green-600",
}

export default function SupplierPaymentsScreen() {
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id ?? "supplier-1")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const { data: payments = [] } = useQuery({
    queryKey: ["supplier-payments", userId],
    queryFn: () => getMockSupplierPayments(userId),
  })

  const balance = MOCK_BALANCES[userId] ?? { available: 0, pending: 0, totalEarned: 0, totalCommission: 0 }
  const payouts = MOCK_PAYOUTS.filter((p) => p.supplierId === userId)

  const filtered = useMemo(() => {
    let result = [...payments]
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.orderId.toLowerCase().includes(q) || p.providerTransactionId.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [payments, statusFilter, search])

  const capturedTotal = payments.filter((p) => p.status === "captured").reduce((s, p) => s + p.netAmount, 0)
  const pendingTotal = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.netAmount, 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-bold text-cm-text">Paiements</h1>
        <p className="text-[12px] text-cm-text-muted">{payments.length} transactions</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <p className="text-[11px] text-cm-text-muted">Disponible</p>
          <p className="text-[18px] font-bold text-emerald-600 mt-1">{formatXOF(balance.available)}</p>
        </div>
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <p className="text-[11px] text-cm-text-muted">En attente</p>
          <p className="text-[18px] font-bold text-amber-600 mt-1">{formatXOF(balance.pending)}</p>
        </div>
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <p className="text-[11px] text-cm-text-muted">Total reçu</p>
          <p className="text-[18px] font-bold text-cm-text mt-1">{formatXOF(capturedTotal)}</p>
        </div>
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <p className="text-[11px] text-cm-text-muted">Commission versée</p>
          <p className="text-[18px] font-bold text-cm-text mt-1">{formatXOF(balance.totalCommission)}</p>
        </div>
      </div>

      {/* Recent payouts */}
      {payouts.length > 0 && (
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-cm-text flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4" /> Retraits récents
            </h2>
          </div>
          <div className="space-y-2">
            {payouts.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 bg-cm-surface rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full ${p.status === "completed" ? "bg-emerald-100" : p.status === "failed" ? "bg-red-100" : "bg-amber-100"} flex items-center justify-center`}>
                    {p.status === "completed" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> :
                     p.status === "failed" ? <XCircle className="w-3.5 h-3.5 text-red-600" /> :
                     <Clock className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-cm-text">{formatXOF(p.amount)}</p>
                    <p className="text-[10px] text-cm-text-muted">{p.provider.replace("_", " ")} · {new Date(p.requestedAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  p.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                  p.status === "failed" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {p.status === "completed" ? "Effectué" : p.status === "failed" ? "Échoué" : "En cours"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-cm-elevated border border-cm-border rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green"
            placeholder="Rechercher par commande ou transaction..." />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="h-9 w-9 flex items-center justify-center bg-cm-elevated border border-cm-border rounded-xl hover:bg-cm-surface cursor-pointer">
          <Filter className="w-4 h-4 text-cm-text-soft" />
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {["all", "captured", "pending", "refunded", "partially_refunded", "failed"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-3 h-7 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
              statusFilter === s
                ? "bg-cm-text text-white border-cm-text"
                : "bg-cm-elevated text-cm-text-soft border-cm-border hover:border-cm-border"
            }`}>
            {s === "all" ? "Tous" : STATUS_LABELS[s as SupplierPaymentStatus]}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-[11px] text-cm-text-muted px-1">
        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> {formatXOF(capturedTotal)} reçus</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> {formatXOF(pendingTotal)} en attente</span>
      </div>

      {/* Transactions list */}
      {filtered.length === 0 ? (
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-8 text-center">
          <Wallet className="w-10 h-10 text-cm-border-soft mx-auto mb-3" />
          <p className="text-[14px] font-medium text-cm-text-muted">Aucune transaction trouvée</p>
          <p className="text-[12px] text-cm-text-muted mt-1">Les paiements apparaîtront ici une fois les commandes traitées</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((payment) => (
            <div key={payment.id}
              onClick={() => navigate(`/supplier/payments/${payment.id}`)}
              className="bg-cm-elevated rounded-xl border border-cm-border p-4 hover:border-cm-border cursor-pointer transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl ${PROVIDER_COLORS[payment.provider]} bg-opacity-20 flex items-center justify-center shrink-0`}>
                    <span className="text-[10px] font-bold text-white">{PROVIDER_ICONS[payment.provider]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-cm-text">{formatXOF(payment.netAmount)}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[payment.status]}`}>
                        {STATUS_LABELS[payment.status]}
                      </span>
                    </div>
                    <p className="text-[11px] text-cm-text-muted mt-0.5">
                      {payment.orderId} · {payment.provider.replace("_", " ")}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-cm-text-muted">
                      <span>Sous-total: {formatXOF(payment.subtotal)}</span>
                      <span>Commission: -{formatXOF(payment.commission)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-cm-text-muted">
                    {new Date(payment.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  {payment.status === "refunded" && (
                    <p className="text-[10px] text-red-400 mt-1">{payment.refundReason ?? "Remboursé"}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
