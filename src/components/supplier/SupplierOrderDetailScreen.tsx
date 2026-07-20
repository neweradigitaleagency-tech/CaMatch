import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle, XCircle, Truck, Package, AlertCircle, Phone, MessageSquare, Scale, MapPin } from "lucide-react"
import { useSupplierOrder, useUpdateOrderStatus } from "../../hooks/supplier/useSupplierOrders"
import { getStatusLabel, getStatusColor, ORDER_STATUS_TRANSITIONS } from "../../services/supplier/orders.service"
import { formatXOF } from "../../utils/format"
import type { MaterialOrderStatus } from "../../types/supplier"
import { MOCK_DELIVERIES, MOCK_DISPUTES } from "../../data/supplier-mocks"

const ACTION_BUTTONS: Record<string, { label: string; icon: typeof CheckCircle; nextStatus: MaterialOrderStatus; color: string }[]> = {
  PENDING_SUPPLIER: [
    { label: "Accepter la commande", icon: CheckCircle, nextStatus: "ACCEPTED", color: "bg-cm-green hover:opacity-90" },
    { label: "Refuser", icon: XCircle, nextStatus: "CANCELLED", color: "bg-red-500 hover:opacity-90" },
  ],
  ACCEPTED: [
    { label: "Commencer la préparation", icon: Package, nextStatus: "PREPARING", color: "bg-indigo-500 hover:opacity-90" },
  ],
  PREPARING: [
    { label: "Commande prête", icon: CheckCircle, nextStatus: "READY", color: "bg-cm-green hover:opacity-90" },
  ],
  READY: [
    { label: "En livraison", icon: Truck, nextStatus: "DELIVERING", color: "bg-blue-500 hover:opacity-90" },
  ],
  DELIVERING: [
    { label: "Marquer comme livrée", icon: CheckCircle, nextStatus: "DELIVERED", color: "bg-cm-green hover:opacity-90" },
    { label: "Livraison partielle", icon: Package, nextStatus: "PARTIALLY_DELIVERED", color: "bg-orange-500 hover:opacity-90" },
  ],
}

export default function SupplierOrderDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading } = useSupplierOrder(id)
  const updateStatus = useUpdateOrderStatus()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = async (status: MaterialOrderStatus) => {
    if (!id) return
    setActionLoading(status)
    await updateStatus.mutateAsync({ orderId: id, status })
    setActionLoading(null)
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-gray-200/50 animate-pulse rounded w-3/4" />)}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-[14px] text-gray-500">Commande introuvable</p>
        <button onClick={() => navigate("/supplier/orders")}
          className="mt-4 h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-xl cursor-pointer">
          Retour aux commandes
        </button>
      </div>
    )
  }

  const statusKey = order.status as keyof typeof ACTION_BUTTONS
  const actions = ACTION_BUTTONS[statusKey] ?? []

  const linkedDelivery = MOCK_DELIVERIES.find((d) => d.orderId === order.id)
  const linkedDispute = MOCK_DISPUTES.find((d) => d.orderId === order.id)

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/supplier/orders")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-bold text-gray-900">{order.id.toUpperCase()}</h1>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-[12px] text-gray-500">Commande du {new Date(order.createdAt).toLocaleDateString("fr-FR")} à {new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-[13px] font-semibold text-gray-900">👤 Client</h2>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500">Client</p>
            <p className="text-gray-900 font-medium">{order.clientName ?? "N/A"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500">Professionnel</p>
            <p className="text-gray-900 font-medium">{order.professionalName ?? "N/A"}</p>
          </div>
          {order.deliveryCity && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Livraison</p>
              <p className="text-gray-900 font-medium">{order.deliveryCity}{order.deliveryAddress ? `, ${order.deliveryAddress}` : ""}</p>
            </div>
          )}
          {order.deliveryCost > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Frais livraison</p>
              <p className="text-gray-900 font-medium">{formatXOF(order.deliveryCost)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-[13px] font-semibold text-gray-900">📦 Produits</h2>
        {order.items && order.items.length > 0 ? (
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-gray-900">{item.productName}</p>
                  <p className="text-[11px] text-gray-500">{formatXOF(item.unitPrice)} × {item.quantity}</p>
                </div>
                <p className="text-[12px] font-semibold text-gray-900 shrink-0 ml-3">{formatXOF(item.totalPrice)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-gray-400">Détails non disponibles</p>
        )}

        <div className="border-t border-gray-200 pt-3 space-y-1">
          <div className="flex justify-between text-[12px]">
            <span className="text-gray-500">Sous-total</span>
            <span className="text-gray-700">{formatXOF(order.subtotal)}</span>
          </div>
          {order.deliveryCost > 0 && (
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-500">Livraison</span>
              <span className="text-gray-700">{formatXOF(order.deliveryCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px]">
            <span className="text-gray-500">Commission Ça Match</span>
            <span className="text-gray-500">-{formatXOF(order.commission)}</span>
          </div>
          <div className="flex justify-between text-[14px] font-bold text-gray-900 pt-1 border-t border-gray-100">
            <span>Total</span>
            <span>{formatXOF(order.total)}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-500">Notes</p>
          <p className="text-[12px] text-gray-900 mt-1">{order.notes}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-[13px] font-semibold text-gray-900">🔗 Liens associés</h2>
        <div className="flex gap-2 flex-wrap">
          {linkedDelivery && (
            <button onClick={() => navigate(`/supplier/deliveries/${linkedDelivery.id}`)}
              className="flex items-center gap-1.5 h-9 px-4 bg-blue-50 text-blue-700 text-[12px] font-medium rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
              <Truck className="w-3.5 h-3.5" /> Voir la livraison
            </button>
          )}
          {linkedDispute && (
            <button onClick={() => navigate(`/supplier/disputes/${linkedDispute.id}`)}
              className="flex items-center gap-1.5 h-9 px-4 bg-red-50 text-red-700 text-[12px] font-medium rounded-lg hover:bg-red-100 cursor-pointer transition-colors">
              <Scale className="w-3.5 h-3.5" /> Voir le litige
            </button>
          )}
          <button onClick={() => window.location.href = `tel:${order.clientName ? "N/A" : ""}`}
            className="flex items-center gap-1.5 h-9 px-4 bg-gray-50 text-gray-700 text-[12px] font-medium rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <Phone className="w-3.5 h-3.5" /> Contacter le client
          </button>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-gray-900">Actions</p>
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button key={action.nextStatus} onClick={() => handleAction(action.nextStatus)}
                disabled={updateStatus.isPending && actionLoading === action.nextStatus}
                className={`flex items-center justify-center gap-2 w-full h-11 text-white text-[13px] font-bold rounded-xl disabled:opacity-50 cursor-pointer transition-all ${action.color}`}>
                <Icon className="w-4 h-4" />
                {updateStatus.isPending && actionLoading === action.nextStatus ? "Traitement..." : action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
