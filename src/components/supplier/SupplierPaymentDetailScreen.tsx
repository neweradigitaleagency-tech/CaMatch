import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, RotateCcw, ExternalLink } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getMockSupplierPayments, MOCK_ORDERS } from "../../data/supplier-mocks"
import type { SupplierPaymentStatus, SupplierPaymentProvider } from "../../types/supplier"
import { formatXOF } from "../../utils/format"

const STATUS_LABELS: Record<SupplierPaymentStatus, string> = {
  pending: "En attente",
  captured: "Reçu",
  refunded: "Remboursé",
  partially_refunded: "Partiellement remboursé",
  failed: "Échoué",
}

const STATUS_DETAILS: Record<SupplierPaymentStatus, { icon: typeof CheckCircle; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  captured: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  refunded: { icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" },
  partially_refunded: { icon: RotateCcw, color: "text-orange-600", bg: "bg-orange-50" },
  failed: { icon: XCircle, color: "text-cm-text-soft", bg: "bg-cm-surface" },
}

const PROVIDER_LABELS: Record<SupplierPaymentProvider, string> = {
  orange_money: "Orange Money",
  mtn_momo: "MTN MoMo",
  wave: "Wave",
  moov_money: "Moov Money",
}

export default function SupplierPaymentDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userId = "supplier-1"

  const { data: payments = [] } = useQuery({
    queryKey: ["supplier-payments", userId],
    queryFn: () => getMockSupplierPayments(userId),
  })

  const payment = payments.find((p) => p.id === id)
  if (!payment) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="w-10 h-10 text-cm-border-soft mx-auto mb-3" />
        <p className="text-[14px] text-cm-text-muted">Paiement introuvable</p>
        <button onClick={() => navigate("/supplier/payments")}
          className="mt-4 h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-xl cursor-pointer">
          Retour aux paiements
        </button>
      </div>
    )
  }

  const order = MOCK_ORDERS.find((o) => o.id === payment.orderId)
  const detail = STATUS_DETAILS[payment.status]
  const StatusIcon = detail.icon

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/supplier/payments")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-cm-text">Paiement {payment.id}</h1>
          <p className="text-[12px] text-cm-text-muted">Transaction {payment.providerTransactionId}</p>
        </div>
      </div>

      {/* Status banner */}
      <div className={`${detail.bg} ${detail.color} rounded-xl p-4 flex items-center gap-3`}>
        <StatusIcon className="w-8 h-8 shrink-0" />
        <div>
          <p className="text-[14px] font-bold">{STATUS_LABELS[payment.status]}</p>
          <p className="text-[12px] opacity-80">
            {payment.status === "captured" && `Paiement reçu le ${new Date(payment.updatedAt).toLocaleDateString("fr-FR")}`}
            {payment.status === "pending" && "En attente de confirmation du provider"}
            {payment.status === "refunded" && `Remboursé le ${payment.refundedAt ? new Date(payment.refundedAt).toLocaleDateString("fr-FR") : ""}`}
            {payment.status === "failed" && `Échec : ${payment.failureReason}`}
            {payment.status === "partially_refunded" && `Remboursement partiel effectué`}
          </p>
        </div>
      </div>

      {/* Amount breakdown */}
      <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-3">
        <h2 className="text-[13px] font-semibold text-cm-text">Détail du montant</h2>
        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Sous-total (articles)</span>
            <span className="text-cm-text">{formatXOF(payment.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Frais de livraison</span>
            <span className="text-cm-text">{formatXOF(payment.deliveryCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cm-text-muted">Commission Ça Match ({payment.netAmount > 0 ? Math.round(payment.commission / (payment.netAmount + payment.commission) * 100) : 0}%)</span>
            <span className="text-red-600">-{formatXOF(payment.commission)}</span>
          </div>
          <div className="border-t border-cm-border/40 pt-2 flex justify-between font-bold text-[14px]">
            <span className="text-cm-text">Net perçu</span>
            <span className="text-emerald-600">{formatXOF(payment.netAmount)}</span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-3">
        <h2 className="text-[13px] font-semibold text-cm-text">Informations de paiement</h2>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="bg-cm-surface rounded-lg p-3">
            <p className="text-cm-text-muted">Provider</p>
            <p className="text-cm-text font-medium mt-0.5">{PROVIDER_LABELS[payment.provider]}</p>
          </div>
          <div className="bg-cm-surface rounded-lg p-3">
            <p className="text-cm-text-muted">Transaction ID</p>
            <p className="text-cm-text font-medium mt-0.5 break-all">{payment.providerTransactionId}</p>
          </div>
          {payment.refundReason && (
            <div className="col-span-2 bg-cm-surface rounded-lg p-3">
              <p className="text-cm-text-muted">Motif de remboursement</p>
              <p className="text-cm-text font-medium mt-0.5">{payment.refundReason}</p>
            </div>
          )}
          <div className="bg-cm-surface rounded-lg p-3">
            <p className="text-cm-text-muted">Date de création</p>
            <p className="text-cm-text font-medium mt-0.5">{new Date(payment.createdAt).toLocaleString("fr-FR")}</p>
          </div>
          <div className="bg-cm-surface rounded-lg p-3">
            <p className="text-cm-text-muted">Dernière mise à jour</p>
            <p className="text-cm-text font-medium mt-0.5">{new Date(payment.updatedAt).toLocaleString("fr-FR")}</p>
          </div>
        </div>
      </div>

      {/* Linked order */}
      {order && (
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-cm-text">Commande associée</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-cm-text">{order.id}</p>
              <p className="text-[12px] text-cm-text-muted">{order.clientName}</p>
            </div>
            <button onClick={() => navigate(`/supplier/orders/${order.id}`)}
              className="flex items-center gap-1.5 h-8 px-3 bg-cm-text text-white text-[11px] font-medium rounded-lg cursor-pointer hover:opacity-90">
              Voir <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          {order.items && (
            <div className="space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-[11px] text-cm-text-soft p-1.5 bg-cm-surface rounded-lg">
                  <span>{item.productName} ×{item.quantity}</span>
                  <span>{formatXOF(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {payment.failureReason && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[12px] text-red-700">{payment.failureReason}</p>
          </div>
        </div>
      )}
    </div>
  )
}
