import { useState } from "react"
import { Wallet, ArrowUpRight, CheckCircle, XCircle, Clock, Plus, AlertCircle, Building2 } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { MOCK_BALANCES, MOCK_PAYOUTS } from "../../data/supplier-mocks"
import type { SupplierPaymentProvider, PayoutStatus } from "../../types/supplier"
import { formatXOF } from "../../utils/format"

const PROVIDER_LABELS: Record<SupplierPaymentProvider, string> = {
  orange_money: "Orange Money",
  mtn_momo: "MTN MoMo",
  wave: "Wave",
  moov_money: "Moov Money",
}

const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: "En attente",
  processing: "En cours",
  completed: "Effectué",
  failed: "Échoué",
}

const PAYOUT_STATUS_COLORS: Record<PayoutStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
}

export default function SupplierBalanceScreen() {
  const userId = useAuthStore((s) => s.user?.id ?? "supplier-1")
  const queryClient = useQueryClient()
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestAmount, setRequestAmount] = useState(0)
  const [requestProvider, setRequestProvider] = useState<SupplierPaymentProvider>("orange_money")

  const balance = MOCK_BALANCES[userId] ?? { available: 0, pending: 0, totalEarned: 0, totalCommission: 0 }
  const payouts = MOCK_PAYOUTS.filter((p) => p.supplierId === userId).sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  )

  const handleRequestPayout = () => {
    if (requestAmount <= 0 || requestAmount > balance.available) return
    setShowRequestForm(false)
    setRequestAmount(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Solde et retraits</h1>
          <p className="text-[12px] text-gray-500">Gérez vos fonds disponibles</p>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-4">
          <p className="text-[11px] text-emerald-700 font-medium">Disponible</p>
          <p className="text-[22px] font-bold text-emerald-700 mt-1">{formatXOF(balance.available)}</p>
          {balance.lastPayoutAt && (
            <p className="text-[10px] text-emerald-500 mt-1">
            Dernier retrait: {new Date(balance.lastPayoutAt).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-500">En attente</p>
          <p className="text-[18px] font-bold text-amber-600 mt-1">{formatXOF(balance.pending)}</p>
          <p className="text-[10px] text-gray-400 mt-1">Paiements non encore disponibles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-500">Gagné au total</p>
          <p className="text-[18px] font-bold text-gray-900 mt-1">{formatXOF(balance.totalEarned)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-500">Commission versée</p>
          <p className="text-[18px] font-bold text-gray-900 mt-1">{formatXOF(balance.totalCommission)}</p>
        </div>
      </div>

      {/* Request payout button */}
      {balance.available > 0 && (
        <button onClick={() => setShowRequestForm(true)}
          className="w-full h-11 bg-cm-green text-white text-[13px] font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Demander un retrait
        </button>
      )}

      {/* Payout request form */}
      {showRequestForm && (
        <div className="bg-white rounded-xl border border-cm-green/30 p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-gray-900">Nouveau retrait</h2>
          <p className="text-[11px] text-gray-500">Disponible: {formatXOF(balance.available)}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Montant (FCFA)</label>
              <input value={requestAmount || ""} onChange={(e) => setRequestAmount(Number(e.target.value) || 0)}
                type="number" min={1000} max={balance.available} step={1000}
                className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Mode de paiement</label>
              <select value={requestProvider} onChange={(e) => setRequestProvider(e.target.value as SupplierPaymentProvider)}
                className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none bg-white">
                {(["orange_money", "mtn_momo", "wave"] as SupplierPaymentProvider[]).map((p) => (
                  <option key={p} value={p}>{PROVIDER_LABELS[p]}</option>
                ))}
              </select>
            </div>
          </div>
          {requestAmount > balance.available && (
            <p className="text-[11px] text-red-500">Montant supérieur au solde disponible</p>
          )}
          <div className="flex gap-2">
            <button onClick={() => { setShowRequestForm(false); setRequestAmount(0) }}
              className="h-9 px-4 border border-gray-300 text-gray-700 text-[12px] font-medium rounded-lg cursor-pointer">
              Annuler
            </button>
            <button onClick={handleRequestPayout}
              disabled={requestAmount <= 0 || requestAmount > balance.available}
              className="h-9 px-4 bg-cm-green text-white text-[12px] font-bold rounded-lg disabled:opacity-50 cursor-pointer">
              Confirmer le retrait
            </button>
          </div>
        </div>
      )}

      {/* Payout history */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4" /> Historique des retraits
          </h2>
        </div>
        {payouts.length === 0 ? (
          <div className="text-center py-6">
            <Wallet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-[13px] text-gray-500">Aucun retrait pour le moment</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    p.status === "completed" ? "bg-emerald-100" :
                    p.status === "failed" ? "bg-red-100" :
                    "bg-amber-100"
                  }`}>
                    {p.status === "completed" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                     p.status === "failed" ? <XCircle className="w-4 h-4 text-red-600" /> :
                     <Clock className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">{formatXOF(p.amount)}</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{PROVIDER_LABELS[p.provider]}</span>
                      {p.providerReference && <span>· Ref: {p.providerReference}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${PAYOUT_STATUS_COLORS[p.status]}`}>
                    {PAYOUT_STATUS_LABELS[p.status]}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(p.requestedAt).toLocaleDateString("fr-FR")}
                  </p>
                  {p.failureReason && (
                    <p className="text-[10px] text-red-400 mt-0.5 max-w-[160px] truncate">{p.failureReason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
