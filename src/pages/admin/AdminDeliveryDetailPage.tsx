import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAdminDeliveryDetail } from "../../services/admin/deliveries.service"
import type { SupplierDelivery } from "../../types/supplier"
import { usePermissions } from "../../hooks/usePermissions"
import { ArrowLeft, Truck, MapPin, Phone, User, Calendar, Clock, CheckCircle, Circle } from "lucide-react"

export default function AdminDeliveryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const canView = hasPermission("deliveries.read")

  const [delivery, setDelivery] = useState<SupplierDelivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getAdminDeliveryDetail(id)
      .then((data) => {
        if (!data) { setError("Livraison introuvable."); return }
        setDelivery(data)
      })
      .catch(() => setError("Impossible de charger la livraison."))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-dynamic bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !delivery) {
    return (
      <div className="min-h-dynamic bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-[13px] text-gray-500">{error ?? "Livraison introuvable."}</p>
        <button onClick={() => navigate("/admin/deliveries")}
          className="h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-lg cursor-pointer">
          Retour
        </button>
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
    pending: "En attente",
    preparing: "Préparation",
    picked_up: "Enlevée",
    in_transit: "En route",
    delivered: "Livrée",
    partial: "Partielle",
    failed: "Échouée",
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/deliveries")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-gray-500" />
          <div>
            <h1 className="text-[18px] font-bold text-gray-900">Livraison #{delivery.orderId}</h1>
            <p className="text-[12px] text-gray-500">{statusLabels[delivery.status] ?? delivery.status}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Destination
          </h2>
          <div className="space-y-2 text-[12px]">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Ville</p>
              <p className="text-gray-900 font-medium">{delivery.city}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Adresse</p>
              <p className="text-gray-900 font-medium">{delivery.address}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4" /> Chauffeur
          </h2>
          {delivery.driverName ? (
            <div className="space-y-2 text-[12px]">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Nom</p>
                <p className="text-gray-900 font-medium">{delivery.driverName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Téléphone</p>
                <p className="text-gray-900 font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {delivery.driverPhone ?? "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Véhicule</p>
                <p className="text-gray-900 font-medium">{delivery.vehicleInfo ?? "—"}</p>
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-gray-400">Non assigné</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Planning
          </h2>
          <div className="space-y-2 text-[12px]">
            {delivery.estimatedPickupAt && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Enlèvement estimé</p>
                <p className="text-gray-900 font-medium">
                  {new Date(delivery.estimatedPickupAt).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
            {delivery.estimatedDeliveryAt && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Livraison estimée</p>
                <p className="text-gray-900 font-medium">
                  {new Date(delivery.estimatedDeliveryAt).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
            {delivery.deliveredAt && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Livrée le</p>
                <p className="text-gray-900 font-medium">
                  {new Date(delivery.deliveredAt).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Chronologie
          </h2>
          <div className="space-y-0">
            {delivery.trackingSteps.map((step, i) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {step.status === "delivered" || (i < delivery.trackingSteps.length - 1 && delivery.status === "delivered") ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                  )}
                  {i < delivery.trackingSteps.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-[12px] font-medium text-gray-900">{step.label}</p>
                  <p className="text-[11px] text-gray-500">{step.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(step.timestamp).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {delivery.failureReason && (
          <div className="bg-white rounded-xl border border-red-200 p-4 col-span-full">
            <h2 className="text-[13px] font-semibold text-red-700 mb-1">Motif d'échec</h2>
            <p className="text-[12px] text-red-600">{delivery.failureReason}</p>
          </div>
        )}
      </div>
    </div>
  )
}
