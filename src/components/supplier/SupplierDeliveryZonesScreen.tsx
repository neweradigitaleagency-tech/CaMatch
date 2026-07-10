import { useState } from "react"
import { MapPin, Plus, Trash2, Check, X } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getDeliveryZones, upsertDeliveryZone, deleteDeliveryZone } from "../../services/supplier/delivery-zones.service"
import { formatXOF } from "../../utils/format"
import type { DeliveryZone } from "../../types/supplier"

const ABIDJAN_COMMUNES = ["Cocody", "Plateau", "Marcory", "Yopougon", "Adjamé", "Treichville", "Koumassi", "Port-Bouët", "Attécoubé", "Abobo", "Bingerville", "Anyama"]

export default function SupplierDeliveryZonesScreen() {
  const userId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["delivery-zones", userId],
    queryFn: () => userId ? getDeliveryZones(userId) : Promise.resolve([]),
    enabled: !!userId,
  })

  const [showForm, setShowForm] = useState(false)
  const [newCity, setNewCity] = useState("")
  const [newPrice, setNewPrice] = useState(0)
  const [newDelay, setNewDelay] = useState(2)

  const upsertMutation = useMutation({
    mutationFn: () => userId ? upsertDeliveryZone(userId, { city: newCity, price: newPrice, estimatedDelayHours: newDelay }) : Promise.resolve(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] })
      setShowForm(false)
      setNewCity("")
      setNewPrice(0)
      setNewDelay(2)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (zoneId: string) => deleteDeliveryZone(zoneId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["delivery-zones"] }),
  })

  const existingCities = zones.map((z) => z.city)
  const availableCities = ABIDJAN_COMMUNES.filter((c) => !existingCities.includes(c))

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200/50 animate-pulse rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Zones de livraison</h1>
          <p className="text-[12px] text-gray-500">{zones.length} zones configurées</p>
        </div>
        {availableCities.length > 0 && (
          <button onClick={() => setShowForm(true)}
            className="h-9 px-4 bg-cm-green text-white text-[12px] font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-cm-green/30 p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-gray-900">Nouvelle zone</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Commune</label>
              <select value={newCity} onChange={(e) => setNewCity(e.target.value)}
                className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none bg-white">
                <option value="">Sélectionner</option>
                {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Prix livraison (FCFA)</label>
              <input value={newPrice || ""} onChange={(e) => setNewPrice(Number(e.target.value) || 0)} type="number" min={0}
                className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Délai estimé (heures)</label>
              <input value={newDelay || ""} onChange={(e) => setNewDelay(Number(e.target.value) || 0)} type="number" min={1}
                className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="h-9 px-4 border border-gray-300 text-gray-700 text-[12px] font-medium rounded-lg cursor-pointer">
              Annuler
            </button>
            <button onClick={() => upsertMutation.mutate()} disabled={!newCity || upsertMutation.isPending}
              className="h-9 px-4 bg-cm-green text-white text-[12px] font-bold rounded-lg disabled:opacity-50 cursor-pointer">
              Ajouter
            </button>
          </div>
        </div>
      )}

      {zones.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-gray-500">Aucune zone de livraison</p>
          <p className="text-[12px] text-gray-400 mt-1">Ajoutez les communes où vous livrez</p>
        </div>
      ) : (
        <div className="space-y-2">
          {zones.map((zone) => (
            <div key={zone.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cm-green/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-cm-green" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">{zone.city}</p>
                  <p className="text-[11px] text-gray-500">
                    {formatXOF(zone.price)} · {zone.estimatedDelayHours}h délai
                  </p>
                </div>
              </div>
              <button onClick={() => deleteMutation.mutate(zone.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
