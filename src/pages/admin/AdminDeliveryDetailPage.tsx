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
      <div className="min-h-dynamic bg-cm-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cm-border border-t-cm-text rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !delivery) {
    return (
      <div className="min-h-dynamic bg-cm-surface flex flex-col items-center justify-center gap-4">
        <p className="text-[13px] text-cm-text-muted">{error ?? "Livraison introuvable."}</p>
        <button onClick={() => navigate("/admin/deliveries")}
          className="h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg cursor-pointer">
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
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
        </button>
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-cm-text-muted" />
          <div>
            <h1 className="text-[18px] font-bold text-cm-text">Livraison #{delivery.orderId}</h1>
            <p className="text-[12px] text-cm-text-muted">{statusLabels[delivery.status] ?? delivery.status}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-cm-text flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Destination
          </h2>
          <div className="space-y-2 text-[12px]">
            <div className="bg-cm-surface rounded-lg p-3">
              <p className="text-cm-text-muted">Ville</p>
              <p className="text-cm-text font-medium">{delivery.city}</p>
            </div>
            <div className="bg-cm-surface rounded-lg p-3">
              <p className="text-cm-text-muted">Adresse</p>
              <p className="text-cm-text font-medium">{delivery.address}</p>
            </div>
          </div>
        </div>

        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-cm-text flex items-center gap-2">
            <User className="w-4 h-4" /> Chauffeur
          </h2>
          {delivery.driverName ? (
            <div className="space-y-2 text-[12px]">
              <div className="bg-cm-surface rounded-lg p-3">
                <p className="text-cm-text-muted">Nom</p>
                <p className="text-cm-text font-medium">{delivery.driverName}</p>
              </div>
              <div className="bg-cm-surface rounded-lg p-3">
                <p className="text-cm-text-muted">Téléphone</p>
                <p className="text-cm-text font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {delivery.driverPhone ?? "—"}
                </p>
              </div>
              <div className="bg-cm-surface rounded-lg p-3">
                <p className="text-cm-text-muted">Véhicule</p>
                <p className="text-cm-text font-medium">{delivery.vehicleInfo ?? "—"}</p>
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-cm-text-muted">Non assigné</p>
          )}
        </div>

        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-cm-text flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Planning
          </h2>
          <div className="space-y-2 text-[12px]">
            {delivery.estimatedPickupAt && (
              <div className="bg-cm-surface rounded-lg p-3">
                <p className="text-cm-text-muted">Enlèvement estimé</p>
                <p className="text-cm-text font-medium">
                  {new Date(delivery.estimatedPickupAt).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
            {delivery.estimatedDeliveryAt && (
              <div className="bg-cm-surface rounded-lg p-3">
                <p className="text-cm-text-muted">Livraison estimée</p>
                <p className="text-cm-text font-medium">
                  {new Date(delivery.estimatedDeliveryAt).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
            {delivery.deliveredAt && (
              <div className="bg-cm-surface rounded-lg p-3">
                <p className="text-cm-text-muted">Livrée le</p>
                <p className="text-cm-text font-medium">
                  {new Date(delivery.deliveredAt).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-cm-text flex items-center gap-2">
            <Clock className="w-4 h-4" /> Chronologie
          </h2>
          <div className="space-y-0">
            {delivery.trackingSteps.map((step, i) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {step.status === "delivered" || (i < delivery.trackingSteps.length - 1 && delivery.status === "delivered") ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-cm-border-soft shrink-0" />
                  )}
                  {i < delivery.trackingSteps.length - 1 && <div className="w-0.5 flex-1 bg-cm-border-soft my-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-[12px] font-medium text-cm-text">{step.label}</p>
                  <p className="text-[11px] text-cm-text-muted">{step.description}</p>
                  <p className="text-[10px] text-cm-text-muted mt-0.5">
                    {new Date(step.timestamp).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {delivery.failureReason && (
          <div className="bg-cm-elevated rounded-xl border border-red-200 p-4 col-span-full">
            <h2 className="text-[13px] font-semibold text-red-700 mb-1">Motif d'échec</h2>
            <p className="text-[12px] text-red-600">{delivery.failureReason}</p>
          </div>
        )}
      </div>
    </div>
  )
}
