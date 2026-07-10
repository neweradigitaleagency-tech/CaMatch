import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Truck, CheckCircle, Clock, MapPin, Phone, User, AlertCircle, Circle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getMockSupplierDeliveries, MOCK_ORDERS } from "../../data/supplier-mocks"
import type { DeliveryStatus } from "../../types/supplier"

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "En attente",
  preparing: "Préparation",
  picked_up: "Enlevée",
  in_transit: "En route",
  delivered: "Livrée",
  partial: "Partielle",
  failed: "Échouée",
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function SupplierDeliveryDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id ?? "supplier-1")

  const { data: deliveries = [] } = useQuery({
    queryKey: ["supplier-deliveries", userId],
    queryFn: () => getMockSupplierDeliveries(userId),
  })

  const delivery = deliveries.find((d) => d.id === id)
  const order = delivery ? MOCK_ORDERS.find((o) => o.id === delivery.orderId) : null

  if (!delivery) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-[14px] text-gray-500">Livraison introuvable</p>
        <button onClick={() => navigate("/supplier/deliveries")}
          className="mt-4 h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-xl cursor-pointer">
          Retour aux livraisons
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/supplier/deliveries")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-bold text-gray-900">{delivery.orderId}</h1>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              delivery.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
              delivery.status === "in_transit" ? "bg-amber-100 text-amber-700" :
              delivery.status === "failed" ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {STATUS_LABELS[delivery.status]}
            </span>
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5">Livraison · {delivery.city}</p>
        </div>
      </div>

      {/* Address card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Adresse de livraison</p>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[14px] font-semibold text-gray-900">{delivery.address}</p>
            <p className="text-[12px] text-gray-500">{delivery.city}</p>
          </div>
        </div>
      </div>

      {/* Driver info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Transporteur</p>
        {delivery.driverName ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-900">{delivery.driverName}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[12px] text-gray-500">
                    <Phone className="w-3 h-3" /> {delivery.driverPhone}
                  </span>
                </div>
              </div>
            </div>
            {delivery.vehicleInfo && (
              <div className="flex items-center gap-2 text-[12px] text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                {delivery.vehicleInfo}
              </div>
            )}
          </>
        ) : (
          <p className="text-[13px] text-gray-400">Non assigné</p>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Suivi</p>
        <div className="space-y-0">
          {delivery.trackingSteps.map((step, index) => {
            const isComplete = step.status === "delivered"
            const isLast = index === delivery.trackingSteps.length - 1
            const isActive = isLast && !["delivered", "failed"].includes(delivery.status)

            return (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isComplete ? "bg-emerald-100" :
                    isActive ? "bg-amber-100" :
                    "bg-gray-100"
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : isActive ? (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Circle className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
                </div>
                <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                  <p className={`text-[13px] font-medium ${
                    isComplete ? "text-emerald-700" :
                    isActive ? "text-amber-700" :
                    "text-gray-500"
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{step.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(step.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Times */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3">Horaires</p>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          {delivery.estimatedPickupAt && (
            <>
              <span className="text-gray-500">Enlèvement prévu</span>
              <span className="text-gray-900 font-medium text-right">{formatDate(delivery.estimatedPickupAt)}</span>
            </>
          )}
          {delivery.pickedUpAt && (
            <>
              <span className="text-gray-500">Enlèvement effectué</span>
              <span className="text-gray-900 font-medium text-right">{formatDate(delivery.pickedUpAt)}</span>
            </>
          )}
          {delivery.estimatedDeliveryAt && (
            <>
              <span className="text-gray-500">Livraison prévue</span>
              <span className="text-gray-900 font-medium text-right">{formatDate(delivery.estimatedDeliveryAt)}</span>
            </>
          )}
          {delivery.deliveredAt && (
            <>
              <span className="text-gray-500">Livrée le</span>
              <span className="text-emerald-600 font-medium text-right">{formatDate(delivery.deliveredAt)}</span>
            </>
          )}
          {delivery.failureReason && (
            <div className="col-span-2 mt-2 p-2 bg-red-50 rounded-lg text-[11px] text-red-700">
              {delivery.failureReason}
            </div>
          )}
        </div>
      </div>

      {/* Linked order info */}
      {order && (
        <button onClick={() => navigate(`/supplier/orders/${order.id}`)}
          className="w-full bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 cursor-pointer transition-colors text-left">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Commande associée</p>
          <p className="text-[14px] font-semibold text-gray-900">{order.id}</p>
          <p className="text-[12px] text-gray-500">{order.items?.length ?? 0} article{((order.items?.length ?? 0) > 1) ? "s" : ""} · {order.clientName}</p>
        </button>
      )}
    </div>
  )
}
